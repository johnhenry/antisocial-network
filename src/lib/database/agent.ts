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

import {
  DEFAULT_PARAMETERS_AGENT,
  REL_BOOKMARKS,
  TABLE_AGENT,
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
      id,
      name,
      embedding,
    }) as AgentTemp[];
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

export const createAgent = async ({
  name = "",
  parameters = DEFAULT_PARAMETERS_AGENT,
  description = "",
  qualities = [],
  image = null,
  files = [],
}: {
  name?: string;
  parameters?: AgentParameters;
  description?: string;
  qualities?: [string, string][];
  image?: string | null;
  files?: FileProto[];
} = {}): Promise<Agent> => {
  const db = await getDB();
  try {
    const combinedQualities = (
      description.trim() +
      "\n\n" +
      qualities.map(([k, v]) => `- ${k}\n  - ${v}`).join("\n")
    ).trim();
    const giveName = name.trim();
    const content = combinedQualities
      ? await summarize(combinedQualities, PROMPTS_SUMMARIZE.LLM_PROMPT)
      : giveName
      ? await summarize(
        description = await summarize(
          giveName,
          PROMPTS_SUMMARIZE.LLM_DESCRIPTION,
        ),
        PROMPTS_SUMMARIZE.LLM_PROMPT,
      )
      : await summarize("", PROMPTS_SUMMARIZE.LLM_PROMPT_RANDOM);

    const generatedName = giveName
      ? giveName
      : (await summarize(content, PROMPTS_SUMMARIZE.LLM_NAMES))
        .split(",")[Math.floor(Math.random() * 5)].split(" ")
        .join(""); // Split and Join to remove any spaces

    const indexed = [description, content, combinedQualities]
      .filter(Boolean)
      .join("\n ------------------ \n");

    const embedding = await embed(content as string);
    const [agent] = await db.create(TABLE_AGENT, {
      timestamp: Date.now(),
      name: generatedName,
      content,
      hash: hash(content),
      combinedQualities,
      parameters: removeValuesFromObject(parameters, undefined, ""),
      description: description.trim(),
      qualities,
      image,
      embedding,
      indexed,
    }) as Agent[];
    if (files) {
      await createFiles({ files, owner: agent });
    }
    return agent;
  } finally {
    await db.close();
  }
};

export const updateAgent = async (
  id: RecordId,
  {
    name = null,
    description = null,
    qualities = [],
    image,
    parameters = DEFAULT_PARAMETERS_AGENT,
  }: {
    name?: string | null;
    description?: string | null;
    qualities?: [string, string][];
    image?: string;
    parameters?: AgentParameters;
  } = {},
): Promise<Agent> => {
  const db = await getDB();
  try {
    // get agent
    const agent = await db.select<Agent>(id) as Agent;
    // name is different
    if (name && agent.name !== name) {
      if (await nameExists(name)) {
        throw new Error(`Agent with name: ${name} exists`);
      }
      agent.name = name;
    }
    if (agent.image !== image) {
      agent.image = image;
    }

    const combinedQualities = (
      description +
      "\n\n" +
      qualities.map(([k, v]) => `- ${k}\n  - ${v}`).join("\n")
    ).trim();

    // regenerate content if qualities or description have changed
    if (agent.combinedQualities !== combinedQualities) {
      // update system prompt, description and combinedQualities
      const content = combinedQualities
        ? await summarize(combinedQualities, PROMPTS_SUMMARIZE.LLM_PROMPT)
        : await summarize("", PROMPTS_SUMMARIZE.LLM_PROMPT_RANDOM);
      agent.content = content;
      agent.hash = hash(content);
      agent.embedding = await embed(content as string);
      agent.qualities = qualities;
      agent.description = (description || "").trim();
      agent.combinedQualities = combinedQualities;
    }
    agent.parameters = removeValuesFromObject(parameters, undefined, "");
    agent.indexed = [agent.description, agent.content, agent.combinedQualities]
      .filter(Boolean)
      .join("\n ------------------ \n");
    const updatedAgent = await db.update<Agent>(id, agent);
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
  // remembrances
  // queries.push(
  //   `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding from post where <-${REL_BOOKMARKS}<-(agent where id = $id)`,
  // );
  queries.push(`select * from post where id=NULL`);
  // bookmarks
  // queries.push(
  //   `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding from file where <-${REL_BOOKMARKS}<-(agent where id = $id)`,
  // );
  queries.push(`select * from file where id=NULL`);

  const db = await getDB();
  try {
    const [[agent], remembrances, bookmarks]: [[Agent], Post[], File[]] =
      await db
        .query(
          queries.join(";"),
          {
            id,
          },
        );
    const obj = {
      agent,
      remembrances,
      bookmarks,
    };

    return obj;
  } finally {
    await db.close();
  }
};
////////

import {
  generateSystemMessage,
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
  const relevantKnowledge = await mergeRelevant(relevant);
  const messages = mapPostsToMessages(conversation);
  const systemMessage = [
    "system",
    await generateSystemMessage(Boolean(relevantKnowledge)),
  ];
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
