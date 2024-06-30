"use server";
import type {
  Agent,
  AgentParameters,
  File,
  Meme,
  Setting,
  Settings,
} from "@/types/types";
import renderText from "@/util/render-text";
import "server-only";
import { getDB, relate } from "@/lib/db";
import {
  TABLE_MEME,
  TABLE_FILE,
  TABLE_AGENT,
  TABLE_SETTINGS,
  TABLE_SETTINGS_ID_CURRENT,
  REL_INSERTED,
  REL_BOOKMARKS,
  REL_CONTAINS,
  REL_PRECEDES,
  REL_ELICITS,
  REL_INCLUDES,
} from "@/settings";
import { embed, summarize, describe, PROMPTS_SUMMARIZE } from "@/lib/ai";
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
  getMostAppropriateAgent,
  getRelevantKnowlede,
  getEntity,
  getMemeWithHistory,
  replaceAgentNameWithId,
} from "@/lib/database/read";
import { BaseMessageChunk } from "@langchain/core/messages";
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
  { agent, meme }: { agent?: RecordId; meme?: RecordId } = {}
): Promise<string> => {
  const db = await getDB();
  try {
    const [supertype, subtype] = type.split("/");
    let file;
    const buff = base64to(content as unknown as string);

    if (supertype === "application" || supertype === "text") {
      switch (subtype) {
        case "pdf":
          try {
            const data = buff.buffer as Buffer;
            const { metadata, text } = await parsePDF(data);
            const summary = await summarize(text);
            const embedding = await embed(text);
            const hash = hashData(text);
            [file] = await db.create(TABLE_FILE, {
              timestamp: new Date().toISOString(),
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
            for await (const { chunk, embedding } of semanticChunker(text)) {
              const meme_id = await createMeme({ content: chunk, embedding });
              const id = new StringRecordId(meme_id) as unknown as RecordId;
              await relate(file.id, REL_CONTAINS, id);
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
          const text = data.toString();
          try {
            [file] = await db.create(TABLE_FILE, {
              timestamp: new Date().toISOString(),
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
        timestamp: new Date().toISOString(),
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
        timestamp: new Date().toISOString(),
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
      return "";
    }
    if (agent) {
      await relate(agent, REL_INSERTED, file!.id);
      await relate(agent, REL_BOOKMARKS, file!.id);
    }
    if (meme) {
      await relate(meme, REL_INCLUDES, file!.id);
    }
    return file!.id.toString(); // TODO: Error: Cannot read properties of undefined (reading 'id')
  } finally {
    await db.close();
  }
};

export const createFiles = async (
  { files = [] }: { files?: ProtoFile[] } = {},
  { agent, meme }: { agent?: RecordId; meme?: RecordId } = {}
): Promise<string[]> => {
  const ids = [];
  for (const { name, type, content } of files) {
    ids.push(
      await createFile(
        {
          name,
          type,
          content,
        },
        { agent, meme }
      )
    );
  }
  return ids;
};

////
// Meme
////

export const generateResponseContent = async ({
  agent,
  messages = [],
  streaming = false,
}: {
  agent?: Agent;
  messages?: [string, string][];
  streaming?: boolean;
} = {}) => {
  // get messages from post and all parents
  const relevantKnowledge = await getRelevantKnowlede(messages, agent);
  // add system prompt to messages
  // get system prompt from agent
  const { content, id, parameters } = agent!;
  messages.unshift([
    "system",
    `${content}

Messages mentioning "@${id}" are directed at you specifically.${
      relevantKnowledge
        ? `\n\nUse the following knowledge to color and infrom your response:\n {relevantKnowledge}`
        : ""
    }
  `,
  ]);

  // old: "You may inclue the following knowledge as part of your response: "
  // add relevant knowledge to messages
  const results = await respond(
    messages,
    {
      relevantKnowledge,
    },
    undefined,
    parameters,
    streaming
  );
  if (streaming) {
    // TODO: split iterator here an add callback above
    return results;
  }
  return (results as BaseMessageChunk).content;
};

const mentions = async (name) => `@${await replaceAgentNameWithId(name)}`;

const MEME_PENDING = Symbol("MEME PENDING");

export const createResponseMeme = async ({
  response = false,
  meme,
  streaming = false,
}: {
  response?: boolean | string;
  meme?: Meme;
  streaming?: Boolean;
} = {}): Promise<
  [string, string | AsyncGenerator<BaseMessageChunk, void, unknown>]
> => {
  let agent, messages;
  if (response === true) {
    agent = (await getMostAppropriateAgent(meme)).id.toString();
    messages = await getMemeWithHistory(meme);
  } else {
    agent = response;
    messages = await getMemeWithHistory(meme);
  }
  const content: string = (await generateResponseContent({
    messages,
    agent: await getEntity(agent),
    streaming,
  })) as any;
  const [[id]]: Meme = await createMeme(
    { content: streaming ? MEME_PENDING : content },
    {
      agent: new StringRecordId(agent) as unknown as RecordId,
      target: meme ? meme.id.toString() : undefined,
    }
  );
  return [[id, content]];
};

export const updatePendingMeme = async (
  id: string,
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
  }: {
    agent?: RecordId | string;
  } = {}
) => {
  const db = await getDB();
  try {
    const renderedContent = rendered
      ? rendered
      : await renderText(content, { mentions });
    await db.update(new StringRecordId(id), {
      timestamp: new Date().toISOString(),
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
    response = false,
    target,
    streaming = false,
  }: {
    agent?: RecordId | string;
    response?: boolean | string;
    target?: string;
    streaming?: boolean;
  } = {}
): Promise<stringstring | AsyncGenerator<BaseMessageChunk, void, unknown>> => {
  const db = await getDB();
  try {
    if (content === MEME_PENDING) {
      const [meme] = await db.create(TABLE_MEME, {
        embedding: await embed(`${Math.random()}`.slice(2)),
      });
      return [[meme.id.toString()]];
    }

    let meme;
    if (content) {
      const renderedContent = rendered
        ? rendered
        : await renderText(content, { mentions });
      [meme] = await db.create(TABLE_MEME, {
        timestamp: new Date().toISOString(),
        hash: hashData(content),
        raw: content,
        content: renderedContent,
        embedding: embedding ? embedding : await embed(renderedContent),
      });
    }
    if (target && meme) {
      await relate(new StringRecordId(target), REL_ELICITS, meme.id);
    }
    await createFiles({ files }, { agent });
    if (agent && meme) {
      await relate(agent, REL_INSERTED, meme.id);
    }
    const results = [];
    if (meme) {
      results.push([meme.id.toString(), meme.content]);
    }
    if (response) {
      const res = await createResponseMeme({
        response,
        meme,
        streaming,
      });
      if (streaming) {
        const [id, content] = res[0];
        const [fork1, fork2] = forkAsyncIterator(content);
        res[0][1] = fork1;
        (async () => {
          const data = [];
          for await (const { content } of fork2) {
            data.push(content);
          }
          updatePendingMeme(id, { content: data.join("") });
        })();
      }
      results.push(res[0]);
    }
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
      }
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
} = {}) => {
  const db = await getDB();
  try {
    const combinedQualities = (
      description.trim() +
      "\n\n" +
      qualities.map(([k, v]) => `- ${k}\n  - ${v}`).join("\n")
    ).trim();
    const content = combinedQualities
      ? await summarize(combinedQualities, PROMPTS_SUMMARIZE.LLM_PROMPT)
      : await summarize("", PROMPTS_SUMMARIZE.LLM_PROMPT_RANDOM);

    const generatedName = name.trim()
      ? name.trim()
      : (await summarize(content, PROMPTS_SUMMARIZE.LLM_NAMES))
          .split(",")
          [Math.floor(Math.random() * 5)].split(" ")
          .join(""); // Split and Join to remove any spaces

    const indexed = [description, content, combinedQualities]
      .filter(Boolean)
      .join("\n ------------------ \n");
    const embedding = await embed(content as string);
    const [agent] = await db.create(TABLE_AGENT, {
      timestamp: new Date().toISOString(),
      name: generatedName,
      content,
      combinedQualities,
      parameters: removeValuesFromObject(parameters, undefined, ""),
      description: description.trim(),
      qualities,
      image,
      embedding,
      indexed,
    });
    await createFiles({ files }, { agent: agent.id });
    return agent.id.toString();
  } finally {
    await db.close();
  }
};
