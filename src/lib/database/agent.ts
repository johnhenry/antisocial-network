import type {
  Agent,
  AgentParameters,
  AgentPlus,
  AgentTemp,
  File,
  FileProto,
  LangchainGenerator,
  Post,
} from "@/types/mod";
import type { BaseMessageChunk } from "@langchain/core/messages";
import createLog from "@/lib/database/log";
import {
  DEFAULT_PARAMETERS_AGENT,
  REL_BOOKMARKS,
  REL_ELICITS,
  REL_REMEMBERS,
  TABLE_AGENT,
  TABLE_POST,
} from "@/config/mod";
import { getDB } from "@/lib/db";
import { embed, PROMPTS_SUMMARIZE, summarize, tokenize } from "@/lib/ai";
import hash from "@/lib/util/hash";
import { genRandSurrealQLString } from "@/lib/util/gen-random-string";
import { StringRecordId } from "surrealdb.js";
import { RecordId } from "surrealdb.js";
import removeValuesFromObject from "@/lib/util/removeValuesFromObject";
import { createFiles } from "@/lib/database/file";

import { getEntity, getLatest } from "@/lib/database/helpers";
import { respond } from "@/lib/ai";

export const nameExists = async (name: string): Promise<boolean> => {
  const db = await getDB();
  try {
    const [agent]: [any] = await db.query(
      "SELECT * FROM type::table($table) WHERE name = $name",
      {
        table: TABLE_AGENT,
        name,
      },
    );
    return !!agent[0];
  } finally {
    await db.close();
  }
};

export const createTempAgent = async (
  { name }: { name: string },
): Promise<AgentTemp> => {
  const db = await getDB();
  try {
    const id = new RecordId(TABLE_AGENT, genRandSurrealQLString());
    const embedding = await embed(name + id.toString());
    const [agent] = await db.create(TABLE_AGENT, {
      timestamp: Date.now(),
      id,
      name,
      hash: hash(),
      embedding,
    }) as AgentTemp[];
    createLog(agent.id.toString(), { type: "create-temp" });
    return agent;
  } finally {
    db.close();
  }
};

// export const getAgent = async (id: string): Promise<Agent> => {
//   const db = await getDB();
//   try {
//     const agent = await db.select(new StringRecordId(id)) as Agent;
//     return agent;
//   } finally {
//     db.close();
//   }
// };

export const getAgent = getEntity<Agent>;
export const getAgents = getLatest<Agent>(TABLE_AGENT);

const combineQualities = (
  description: string = "",
  qualities: [string, string][],
): string => {
  return description +
    "\n\n" +
    qualities.map(([k, v]) => `- ${k}\n  - ${v}`).join("\n").trim();
};

const genCharacter = async ({
  name,
  parameters = DEFAULT_PARAMETERS_AGENT,
  description = "",
  qualities = [],
  image,
}: {
  name?: string;
  parameters?: AgentParameters;
  description?: string;
  qualities?: [string, string][];
  image?: string;
} = {}) => {
  const combinedQualities = combineQualities(description, qualities);
  let content;
  if (combinedQualities.trim()) {
    // description or qualitis is provided
    // description + qualities -> content
    content = await summarize(combinedQualities, PROMPTS_SUMMARIZE.LLM_PROMPT);
  } else if (name) {
    // only name provided
    // name -> description -> content
    content = await summarize(
      description = await summarize(
        name,
        PROMPTS_SUMMARIZE.LLM_DESCRIPTION,
      ),
      PROMPTS_SUMMARIZE.LLM_PROMPT,
    );
  } else {
    // nothing is provided
    // * -> content -> name
    content = await summarize("", PROMPTS_SUMMARIZE.LLM_PROMPT_RANDOM);
    name = (await summarize(content, PROMPTS_SUMMARIZE.LLM_NAMES))
      .split(",")[Math.floor(Math.random() * 5)].split(" ")
      .join("");
  }

  const indexed = [description, content, combinedQualities]
    .filter(Boolean)
    .join("\n ------------------ \n");

  const embedding = await embed(content as string);
  return {
    name,
    content,
    hash: hash(content),
    combinedQualities,
    parameters,
    description,
    qualities,
    image,
    embedding,
    indexed,
  };
};

export const createAgent = async ({
  name = "",
  parameters = DEFAULT_PARAMETERS_AGENT,
  description = "",
  qualities = [],
  image,
  files = [],
}: {
  name?: string;
  parameters?: AgentParameters;
  description?: string;
  qualities?: [string, string][];
  image?: string;
  files?: FileProto[];
} = {}): Promise<Agent> => {
  description = description?.trim() || "";
  name = name?.trim() || "";
  parameters = removeValuesFromObject(parameters, undefined, "");
  const db = await getDB();
  try {
    const [agent] = await db.create(TABLE_AGENT, {
      timestamp: Date.now(),
      ...await genCharacter({
        name,
        parameters,
        description,
        qualities,
        image,
      }),
    }) as Agent[];
    createLog(agent.id.toString());
    if (files) {
      await createFiles({ files, owner: agent });
    }
    return agent;
  } finally {
    await db.close();
  }
};

export const updateAgent = async (
  id: StringRecordId | RecordId,
  {
    name,
    description,
    qualities = [],
    parameters = DEFAULT_PARAMETERS_AGENT,
  }: {
    name?: string;
    description?: string;
    qualities?: [string, string][];
    parameters?: AgentParameters;
  } = {},
): Promise<Agent> => {
  description = description?.trim() || "";
  name = name?.trim() || "";
  parameters = removeValuesFromObject(parameters, undefined, "");
  const db = await getDB();
  try {
    // get agent
    const agent = await db.select<Agent>(id);
    // name is different
    if (name && agent.name !== name) {
      if (await nameExists(name)) {
        throw new Error(`Agent with name: ${name} exists`);
      }
    }
    const combinedQualities = combineQualities(description, qualities);
    // regenerate content if qualities or description have changed
    let newCharacter;
    if (agent.combinedQualities !== combinedQualities) {
      newCharacter = {
        ...agent,
        ...await genCharacter({
          name,
          parameters,
          description,
          qualities,
        }),
      };
    } else {
      newCharacter = {
        ...agent,
        name,
        parameters,
        description,
        qualities,
      };
    }
    const updatedAgent = await db.update(id as StringRecordId, {
      ...newCharacter,
      timestamp: agent.timestamp,
      lastupdated: Date.now(),
    }) as Agent;
    createLog(agent.id.toString(), { type: "update" });
    return updatedAgent;
  } finally {
    db.close();
  }
};

export const getAgentPlus = async (id: StringRecordId): Promise<AgentPlus> => {
  const queries = [];
  const ADDITIONAL_FIELDS = `string::concat("", id) as id`;
  // select target
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding FROM agent where id = $id`,
  );
  // select incoming relationships
  // remembered
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding from post where <-${REL_REMEMBERS}<-(agent where id = $id)`,
  );
  // bookmarked
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding from file where <-${REL_BOOKMARKS}<-(agent where id = $id)`,
  );

  const db = await getDB();
  try {
    const [[protoAgent], remembered, bookmarked]: [[Agent], Post[], File[]] =
      await db
        .query(
          queries.join(";"),
          {
            id,
          },
        );
    let agent = protoAgent;
    if (agent && !agent.content) {
      agent = await updateAgent(id, agent);
    }
    const obj = {
      agent,
      remembered,
      bookmarked,
    };

    return obj;
  } finally {
    await db.close();
  }
};
////////

import {
  generateSystemMessage,
  generateSystemMessageAggregate,
  mapPostsToMessages,
} from "@/lib/templates/dynamic";

// map a list of post to messages

const mergeRelevant = async (posts: Post[]) => {
  return [...posts]
    .map(({ content }) => content)
    .join("\n\n").trim();
};

export const agentResponse = async (
  agent: Agent & { content: string },
  { streaming = false, conversation = [], relevant = [] }: {
    streaming?: boolean;
    conversation?: Post[];
    relevant?: Post[];
  } = {},
): Promise<LangchainGenerator | BaseMessageChunk> => {
  let relevantKnowledge;
  let messages: string[][];
  let systemMessage;
  if (conversation.length) {
    relevantKnowledge = await mergeRelevant(relevant);
    messages = mapPostsToMessages(conversation);
    systemMessage = [
      "system",
      await generateSystemMessage(Boolean(relevantKnowledge)),
    ];
  } else {
    messages = [];
    systemMessage = ["system", `{content}`];
  }

  const results = await respond({
    messages: [systemMessage].concat(messages) as [string, string][],
    invocation: {
      relevantKnowledge,
      id: agent.id.toString(),
      content: agent.content,
    },
    parameters: agent.parameters,
    streaming,
  });
  if (streaming) {
    // TODO: split iterator here an add callback above
    return results as LangchainGenerator;
  }
  return results as BaseMessageChunk;
  // return `response->${Date.now()}`;
};

type RecursiveDescendantResult = [Post, RecursiveDescendantResult[]];

const recursiveQuery = `
    SELECT * FROM ${TABLE_POST}
    WHERE <-${REL_ELICITS}<-(${TABLE_POST} WHERE id = $id)
  `;
const recursiveDescendants = async (
  post: Post,
  depth: number = 1,
): Promise<RecursiveDescendantResult> => {
  if (depth === 0) {
    return [post, []];
  }

  const db = await getDB();
  try {
    const [descendants] = await db.query<Post[][]>(recursiveQuery, {
      id: post.id,
    });
    const results: RecursiveDescendantResult[] = await Promise.all(
      descendants.map(async (descendant: Post) =>
        recursiveDescendants(descendant, depth === -1 ? -1 : depth - 1)
      ),
    );
    return [post, results];
  } catch (error) {
    console.error("Error fetching descendants:", error);
    return [post, []];
  } finally {
    await db.close();
  }
};

/**
 * Formats a single line of text with the given prefix.
 * @param {string} line - The line of text to format.
 * @param {string} prefix - The prefix to add before the line.
 * @param {number} prefixLength - The length of the prefix for subsequent lines.
 * @returns {string} The formatted line.
 */
const formatLine = (line: string, prefix: string, prefixLength: number) => {
  const words = line.split(" ");
  let result = prefix + words[0];
  let currentLineLength = prefix.length + words[0].length;

  for (let i = 1; i < words.length; i++) {
    if (currentLineLength + words[i].length + 1 > 80) {
      result += "\n" + " ".repeat(prefixLength) + words[i];
      currentLineLength = prefixLength + words[i].length;
    } else {
      result += " " + words[i];
      currentLineLength += words[i].length + 1;
    }
  }

  return result;
};

/**
 * Prints the recursive descendant result.
 * @param {RecursiveDescendantResult} R - The recursive descendant result.
 * @param {number} depth - The current depth in the tree.
 * @returns {string} The formatted string representation of the result.
 */
const printRecursiveDescendantResult = (
  R: RecursiveDescendantResult,
  depth = 0,
): string => {
  const [post, children] = R;
  let result = "";

  // Calculate the prefix
  let prefix = depth > 0 ? "├─" + "──".repeat(depth - 1) : "";
  const prefixLength = prefix.length;

  // Add the source ID if it exists
  if (post.source?.id) {
    prefix += `[${post.source.id.toString()}] `;
  }

  // Format the content
  const lines = post.content!.split("\n");
  result += formatLine(lines[0], prefix, prefixLength) + "\n";

  for (let i = 1; i < lines.length; i++) {
    result += formatLine(lines[i], " ".repeat(prefixLength), prefixLength) +
      "\n";
  }

  // Print children
  for (let child of children) {
    result += printRecursiveDescendantResult(child, depth + 1);
  }

  return result;
};
export const aggregateResponse = async (
  agent: Agent,
  target: Post,
  { streaming = false }: {
    streaming?: boolean;
    conversation?: Post[];
    relevant?: Post[];
  } = {},
): Promise<LangchainGenerator | BaseMessageChunk> => {
  const descendants = await recursiveDescendants(target);
  const thread = printRecursiveDescendantResult(descendants);

  const systemMessage = [
    "system",
    await generateSystemMessageAggregate(),
  ];

  const results = await respond({
    messages: [systemMessage, [
      "user",
      `Please summarize the following thread:\n\n${thread}`,
    ]] as [string, string][],
    invocation: {
      content: agent.content,
    },
    parameters: agent.parameters,
    streaming,
  });
  if (streaming) {
    // TODO: split iterator here an add callback above
    return results as LangchainGenerator;
  }
  return results as BaseMessageChunk;
};
