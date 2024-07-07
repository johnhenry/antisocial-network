"use server";
import type {
  Agent,
  AgentParameters,
  File,
  LangchainGenerator,
  Meme,
  Setting,
  Settings,
} from "@/types/types";
import "server-only";
import { getDB, relate } from "@/lib/db";
import {
  REL_BOOKMARKS,
  REL_CONTAINS,
  REL_ELICITS,
  REL_INCLUDES,
  REL_INSERTED,
  REL_PRECEDES,
  TABLE_AGENT,
  TABLE_FILE,
  TABLE_MEME,
  TABLE_SETTINGS,
  TABLE_SETTINGS_ID_CURRENT,
} from "@/settings";
import { describe, embed, PROMPTS_SUMMARIZE, summarize } from "@/lib/ai";
import hashData from "@/util/hash";
import base64to from "@/util/base64-to";
import parsePDF from "@/lib/parsers/pdf";
import exifr from "exifr";
import { RecordId, StringRecordId } from "surrealdb.js";
import semanticChunker from "@/lib/chunkers/semantic";
// import generateSystemPrompt from "@/lib/gen-system-prompt";
import nameGenerator from "@/util/random-name-generator";
import { respond } from "@/lib/ai";
import removeValuesFromObject from "@/util/removeValuesFromObject";
import { DEFAULT_PARAMETERS_AGENT } from "@/settings";
import forkAsyncIterator from "@/util/fork-async-iterator";
import {
  getEntity,
  getMemeWithHistory,
  getMostAppropriateAgent,
  getRelevantKnowlede,
} from "@/lib/database/read";
import type { BaseMessageChunk } from "@langchain/core/messages";
import { replaceAndAccumulate } from "@/util/replace-mentions";
import { recordMatch } from "@/util/match";
import getWriteManager from "@/lib/write-space";
import { getSettingsObject } from "@/lib/database/read";
import replaceMentions from "@/util/replace-mentions";

////
// File
////
type ProtoFile = {
  name?: string;
  author?: string;
  type?: string;
  content?: string;
  publisher?: string | null;
  publishDate?: string | null;
};

export const createFile = async (
  {
    name = "",
    author = "",
    type = "",
    content = "",
    publisher = null,
    publishDate = null,
  }: ProtoFile = {},
  { agent, meme }: { agent?: string; meme?: string } = {},
): Promise<[
  string,
  string | LangchainGenerator,
][]> => {
  const db = await getDB();
  try {
    const [supertype, subtype] = type.split("/");
    let file;
    const buff = base64to(content as unknown as string);

    if (supertype === "application" || supertype === "text") {
      const settings = await getSettingsObject();

      let chunker;
      switch (settings.chunker) {
        case "sentence":
        case "agentic":
        case "semantic":
        default:
          chunker = semanticChunker;
          break;
      }

      switch (subtype) {
        case "pdf":
          try {
            const data = buff.buffer as Buffer;
            const { metadata, text } = await parsePDF(data);
            const summary = await summarize(text);
            const embedding = await embed(text);
            const hash = hashData(text);
            [file] = await db.create(TABLE_FILE, {
              timestamp: Date.now(),
              type,
              name,
              author,
              hash,
              content: summary,
              embedding,
              data: content,
              metadata,
              publisher,
              publishDate,
            });

            let previousMemeId = null;
            // embed chunks
            for await (const { chunk, embedding } of chunker(text)) {
              const [[meme_id]] = await createMeme({
                content: chunk,
                embedding,
              }, { file: file.id.toString() });
              const id = meme_id;
              await relate(file.id.toString(), REL_CONTAINS, id);
              if (previousMemeId) {
                await relate(previousMemeId, REL_PRECEDES, id, {
                  within: file.id,
                });
              }
              previousMemeId = id;
            }
            // Chunk PDF
            break;
          } catch (error: any) {
            console.error("<ERROR>", error.message);
          }
        default:
          // Probably text
          const data = buff;
          const text = new TextDecoder().decode(data);
          try {
            [file] = await db.create(TABLE_FILE, {
              timestamp: Date.now(),
              type,
              name,
              author,
              hash: hashData(text),
              content: await summarize(text),
              embedding: await embed(text),
              data: content,
              publisher,
              publishDate,
            });
            break;
          } catch (error: any) {
            console.error("<ERROR>2", error.message);
          }
      }
    } else if (supertype === "image") {
      const data = buff.buffer as Buffer;
      const hash = hashData(buff as Buffer);
      const summary = await describe(content.replace(/^[^,]+,/, ""));
      const embedding = await embed(data.toString());
      const metadata = await exifr.parse(data);
      [file] = await db.create(TABLE_FILE, {
        timestamp: Date.now(),
        type,
        name,
        author,
        hash,
        content: summary,
        embedding,
        data: content,
        metadata,
        publisher,
        publishDate,
      });
      // TODO: Should I chunk/embed images?
    } else {
      const data = buff.buffer as Buffer;
      const hash = hashData(data);
      const summary = await describe(data.toString());
      const embedding = await embed(data.toString());
      const metadata = {};
      [file] = await db.create(TABLE_FILE, {
        timestamp: Date.now(),
        type,
        name,
        author,
        hash,
        content: summary,
        embedding,
        data: content,
        metadata,
        publisher,
        publishDate,
      });
    }
    if (!file) {
      return [];
    }
    const id = file.id.toString();
    if (agent) {
      await relate(agent, REL_INSERTED, file.id.toString());
      await relate(agent, REL_BOOKMARKS, file.id.toString());
    }
    if (meme) {
      await relate(meme, REL_INCLUDES, file.id.toString());
    }
    if (!file.name) {
      // Update name to id
      // await db.update(file.id, {
      //   name: id.split(":")[1],
      // });
      await db.query(
        `UPDATE type::table($table)  SET name = '${
          id.split(":")[1]
        }' WHERE id = $id`,
        {
          table: TABLE_FILE,
          id: file.id,
        },
      );
    }
    return [[id, file.content as string]]; // TODO: Error: Cannot read properties of undefined (reading 'id')
  } finally {
    await db.close();
  }
};

export const createFiles = async (
  { files = [] }: { files?: ProtoFile[] } = {},
  { agent, meme }: { agent?: string; meme?: string } = {},
): Promise<[
  string,
  string | LangchainGenerator,
][]> => {
  const output = [];
  for (const { name, type, content } of files) {
    const files = await createFile(
      {
        name,
        type,
        content,
      },
      { agent, meme },
    );
    output.push(...files);
  }
  return output;
};

////
// Meme
////

export const generateResponseContent = async ({
  agent,
  messages = [],
  streaming = false,
}: {
  agent?: string;
  messages?: [string, string][];
  streaming?: boolean;
} = {}): Promise<LangchainGenerator | BaseMessageChunk> => {
  if (!agent) {
    throw new Error("Agent must be defined to generate content");
  }
  const foundAgent: Agent = await getEntity<Agent>(agent);
  // get messages from post and all parents
  const relevantKnowledge = await getRelevantKnowlede(messages, agent);
  // add system prompt to messages
  // get system prompt from agent
  const { content, id, parameters } = foundAgent!;
  messages.unshift([
    "system",
    `{content}

Your name is {id} are you are participating in a in multi-user conversation thread. Please create a response to the current conversation using the following guidelines:

1. Message Format:
   - Messages need not have attribution and can be anonymous in the following format:
      "<message content>"
   - If an existing message is attributed to a specific speaker, it will begin with the speaker's username in brackets followed by a colon, the space and the message content:
      "[<username>]: <message content>"
   - When creating a message, use the anonomyous format. DO NOT include the brackets and username around your own user name. Simply use the format:
      "<message content>"

2. Identifying Speakers:
   - If it exists, Pay attention to the name in square brackets at the beginning of each message to identify who is speaking.
   - Keep track of different speakers throughout the conversation.

3. Handling Mentions:
   - Mentions in the format "@<username>" can appear anywhere within a message.
   - A message may contain multiple mentions.
   - Recognize that a mention doesn't necessarily mean the entire message is addressed only to that user.
   - Be prepared to respond to mentions of your own name ("@{id}") anywhere in a message.
   - If another user is mentioned, you are not obligated to acknowledge the user unless it is relevant to your response.
   - If another user is mentioned who has not yet participated in the conversation, should ignore that user.
   - When creating a message, never mention yourself.

4. Determining Addressees:
   - If a message contains mentions, it may be addressed to multiple users or to the mentioned users and the general audience.
   - Messages without mentions can be considered addressed to all participants or continuing the current conversation flow.

5. Your Responses:
   - If responding to specific users, include "@Username" mentions within your message where appropriate.
   - You can include multiple mentions if addressing multiple users.

6. Maintaining Context:
   - Keep track of the conversation history and context.
   - Refer back to previous messages when necessary for coherence.

7. Handling Multiple Threads:
   - The conversation may branch into multiple threads or topics.
   - Be prepared to engage with different discussion points as they arise.
   - Use mentions to clarify which thread or user you're responding to if needed.

8. Using Hashtags:
   - If the conversation uses hashtags, you may include relevant hashtags in your responses when suitable.
   - Hashtags can appear anywhere within your message.

9. Adapting Tone and Style:
   - Observe the tone and style of the conversation and try to match it appropriately.
${
  relevantKnowledge
    ? `\n10. Uses the following information to color your response::\n\n{relevantKnowledge}`
    : ""
}`,
  ]);

  // old: "You may inclue the following knowledge as part of your response: "
  // add relevant knowledge to messages
  const results = await respond(
    {
      messages,
      invocation: {
        relevantKnowledge,
        id,
        content,
      },
      parameters,
      streaming,
    },
  );
  if (streaming) {
    // TODO: split iterator here an add callback above
    return results as LangchainGenerator;
  }
  return results as BaseMessageChunk;
};

const MEME_PENDING = Symbol("MEME PENDING");

export const createResponseMeme = async ({
  response = false,
  meme,
  streaming = false,
}: {
  response?: boolean | string | number;
  meme?: Meme;
  streaming?: boolean;
} = {}): Promise<
  [string, LangchainGenerator | string][]
> => {
  const messages = await getMemeWithHistory(meme);
  const agents = [];
  if (response === true) {
    agents.push(
      ...(await getMostAppropriateAgent(meme)).map(({ id }) => id.toString()),
    );
  } else if (typeof response === "number") {
    agents.push(
      ...(await getMostAppropriateAgent(meme, response)).map(({ id }) =>
        id.toString()
      ),
    );
  } else if (response) {
    if (response.includes(",")) {
      agents.push(...response.split(","));
    } else {
      agents.push(response);
    }
  }
  const results: [string, LangchainGenerator | string][] = [];

  for (const agent of agents) {
    const output = await generateResponseContent({
      messages,
      agent,
      streaming,
    });
    const [[id]] = await createMeme(
      {
        content: streaming
          ? MEME_PENDING
          : (output as BaseMessageChunk).content as string,
      },
      {
        agent,
        target: meme ? meme.id.toString() : undefined,
      },
    );
    results.push([id, output as LangchainGenerator | string]);
  }
  return results;
};

const getAgentIdByNameOrCreate = async (name: string) => {
  const db = await getDB();
  try {
    const [[agent]]: [[Agent]] = await db.query(
      "SELECT * FROM type::table($table) WHERE name = $name",
      {
        table: TABLE_AGENT,
        name,
      },
    );
    if (agent) {
      return agent.id.toString();
    }
    return (await createAgent({ name }))[0][0];
  } finally {
    await db.close();
  }
};

const replaceAgents = async (name: string) => {
  if (recordMatch.test(name)) {
    return name;
  }
  if (name[0] === "@") {
    if (name[1] === "?") {
      return name;
    }
    return `${name[0]}${await getAgentIdByNameOrCreate(name.slice(1))}`;
  }
  return name;
};

export const updatePendingMeme = async (
  id: string,
  {
    content = "",
    rendered = "",
    embedding,
    files = [],
  }: {
    content?: string;
    rendered?: string;
    embedding?: number[];
    files?: ProtoFile[];
  } = {},
  {
    agent,
  }: {
    agent?: string;
  } = {},
) => {
  const db = await getDB();
  try {
    const accumulated: string[][] = [];
    const renderedContent = rendered ? rendered : await replaceMentions(
      content,
      replaceAndAccumulate(replaceAgents, accumulated),
    );
    await db.update(new StringRecordId(id), {
      timestamp: Date.now(),
      hash: hashData(content),
      raw: content,
      content: renderedContent,
      embedding: embedding ? embedding : await embed(renderedContent),
    });
    await createFiles({ files }, { agent });
  } finally {
    await db.close();
  }
  return id;
};

const scanForCommand = async (
  {
    content = "",
    files = [],
  }: {
    content?: string;
    rendered?: string;
    embedding?: number[];
    files?: ProtoFile[];
  } = {},
  {
    agent,
  }: {
    agent?: string;
  } = {},
): Promise<
  [
    string,
    string | LangchainGenerator,
  ][] | void
> => {
  if (content.startsWith(":agent:")) {
    const description = content.substr(":agent:".length);
    return await createAgent({ description, files });
  }
  if (content.startsWith(":file:")) {
    const text = content.substr(":file:".length);
    const base64text = Buffer.from(text).toString("base64");
    //.replace(/^[^,]+,/, "")
    const file = {
      type: "text/plain",
      name: "",
      content: base64text,
    };
    return await createFiles({ files: [...files, file] }, { agent });
  }
};

export const createMeme = async (
  {
    content = "",
    rendered = "",
    embedding,
    files = [],
  }: {
    content?: string | typeof MEME_PENDING;
    rendered?: string;
    embedding?: number[];
    files?: ProtoFile[];
  } = {},
  {
    agent,
    file,
    response = false,
    target,
    streaming = false,
  }: {
    agent?: string;
    file?: string;
    response?: boolean | string | number;
    target?: string;
    streaming?: boolean;
  } = {},
): Promise<
  [
    string,
    string | LangchainGenerator,
  ][]
> => {
  const db = await getDB();
  let constructedResponse = response;
  try {
    let meme: Meme | undefined = undefined;
    if (content === MEME_PENDING) {
      [meme] = await db.create(TABLE_MEME, {
        embedding: await embed(`${Math.random()}`.slice(2)),
        source: (file || agent)
          ? (await db.select(new StringRecordId(String(file || agent)))).id
          : null,
      }) as [Meme];
    } else if (content) {
      const command = await scanForCommand({
        content,
        rendered,
        embedding,
        files,
      }, { agent });
      if (command) {
        return command;
      }
      const accumulated: string[][] = [];
      const renderedContent = rendered ? rendered : await replaceMentions(
        content,
        replaceAndAccumulate(replaceAgents, accumulated),
      );
      const samsies = [];
      const agents = [];
      for (const [inn, out] of accumulated) {
        if (inn === out) {
          //nothing changed
          const [first, second, ...third] = out;
          if (first === "@") {
            if (second === "?") {
              const number = Number(third.join("")) || 1;
              if (number) {
                // set response with this number
                samsies.push(number);
              }
            }
          }
        } else {
          // newly created agent
          // add request response from out
          agents.push(out.slice(1));
        }
      }
      if (typeof response === "string") {
        agents.push(response);
      }
      constructedResponse = agents.length
        ? agents.join(",")
        : samsies.length
        ? Math.max(...samsies)
        : response;
      [meme] = await db.create(
        TABLE_MEME,
        {
          timestamp: Date.now(),
          hash: hashData(content),
          raw: content,
          content: renderedContent,
          embedding: embedding ? embedding : await embed(renderedContent),
          source: (file || agent)
            ? (await db.select(new StringRecordId(String(file || agent)))).id
            : null,
        },
      ) as [Meme];
    }
    const memeId = meme ? meme.id.toString() : undefined;
    if (agent && memeId) {
      await relate(agent, REL_INSERTED, memeId);
    }
    if (target && memeId) {
      await relate(target, REL_ELICITS, memeId);
    }
    await createFiles({ files }, { agent, meme: memeId });
    const results: [
      string,
      string | LangchainGenerator,
    ][] = [];
    if (meme && memeId) {
      results.push([
        memeId,
        meme.content as
          | string
          | LangchainGenerator,
      ]);
    }
    if (constructedResponse) {
      const res = await createResponseMeme({
        response: constructedResponse,
        meme,
        streaming,
      });
      for (const res_0 of res) {
        if (streaming) {
          const [id, content] = res_0;
          const [fork1, fork2] = forkAsyncIterator(
            content,
          ) as unknown as LangchainGenerator[];
          res_0[1] = fork1;
          (async () => {
            const data = [];
            for await (const { content } of fork2) {
              data.push(content);
            }
            updatePendingMeme(id, { content: data.join("") });
          })();
        }
        if (target && !meme) {
          await relate(target, REL_ELICITS, res_0[0]);
        }
        results.push(res_0);
      }
    }
    const writeManager = getWriteManager();
    writeManager.sendToWriters(JSON.stringify(results));
    return results;
  } finally {
    await db.close();
  }
};

////
// Agent
////
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

const generateRandomName = async () => {
  for (const name of nameGenerator()) {
    if (await nameExists(name)) {
      continue;
    }
    return name;
  }
};

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
  files?: ProtoFile[];
} = {}): Promise<[
  string,
  string | LangchainGenerator,
][]> => {
  const db = await getDB();
  try {
    const combinedQualities = (
      description.trim() +
      "\n\n" +
      qualities.map(([k, v]) => `- ${k}\n  - ${v}`).join("\n")
    ).trim();
    const giveName = name.trim();
    // TODO: Bug: content generated from passing name only to agent should be saved
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

    const hash = hashData(content);

    const embedding = await embed(content as string);
    const [agent] = await db.create(TABLE_AGENT, {
      timestamp: Date.now(),
      name: generatedName,
      content,
      hash,
      combinedQualities,
      parameters: removeValuesFromObject(parameters, undefined, ""),
      description: description.trim(),
      qualities,
      image,
      embedding,
      indexed,
    });
    await createFiles({ files }, { agent: agent.id.toString() });

    return [[agent.id.toString(), agent.content as string]];
  } finally {
    await db.close();
  }
};
