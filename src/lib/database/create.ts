"use server";
import "server-only";
import type { Agent, File, Meme } from "@/types/post_client";
import { getDB, relate } from "@/lib/db";
import {
  TABLE_MEME,
  TABLE_FILE,
  TABLE_INSERTED,
  TABLE_BOOKMARKS,
  TABLE_CONTAINS,
  TABLE_PROCEEDS,
  TABLE_ELICITS,
  TABLE_AGENT,
} from "@/settings";
import { embed, summarize, describe } from "@/lib/ai";
import hashData from "@/util/hash";
import base64to from "@/util/base64-to";
import parsePDF from "@/lib/parsers/pdf";
import exifr from "exifr";
import { RecordId, StringRecordId } from "surrealdb.js";
import semanticChunker from "@/lib/chunkers/semantic";
import generateSystemPrompt from "@/lib/gen-system-prompt";
import nameGenerator from "@/util/random-name-generator";
import { respond } from "@/lib/ai";

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

const createFile = async (
  {
    name = "",
    author = "",
    type = "",
    content = "",
    publisher = null,
    publishDate = null,
  }: ProtoFile = {},
  { agent }: { agent?: RecordId } = {}
): Promise<string> => {
  const [supertype, subtype] = type.split("/");
  const db = await getDB();
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
            await relate(file.id, TABLE_CONTAINS, id);
            if (previousMemeId) {
              await relate(previousMemeId, TABLE_PROCEEDS, id, {
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
  if (agent) {
    await relate(agent, TABLE_INSERTED, file!.id);
    await relate(agent, TABLE_BOOKMARKS, file!.id);
  }
  return file!.id.toString(); // TODO: Error: Cannot read properties of undefined (reading 'id')
};

export const createFiles = async (
  { files = [] }: { files?: ProtoFile[] } = {},
  { agent }: { agent?: RecordId } = {}
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
        { agent }
      )
    );
  }
  return ids;
};

////
// Meme
////

import {
  getMostAppropriateAgent,
  getRelevantKnowlede,
  getEntity,
} from "@/lib/database/read";

export const generateResponseContent = async ({
  agent,
  messages = [],
}: {
  agent?: any;
  messages?: [string, string][];
} = {}) => {
  // get messages from post and all parents
  const relevantKnowledge = await getRelevantKnowlede(messages, agent);
  // add system prompt to messages
  if (relevantKnowledge) {
    messages.unshift([
      "system",
      `You will use the following relevant knowledge to respond to the user:
${relevantKnowledge}`,
    ]);
  }
  // get system prompt from agent
  const { systemPrompt, name } = agent;
  messages.unshift(["system", systemPrompt]);
  messages.unshift([
    "system",
    `messages mentioning "@${name} are directed at you specifically."`,
  ]);
  // add relevant knowledge to messages
  const { content } = await respond(messages, { relevantKnowledge });
  return content;
};

export const createMeme = async (
  {
    content = "",
    embedding,
    files = [],
  }: {
    content?: string;
    embedding?: number[];
    files?: ProtoFile[];
  } = {},
  {
    agent,
    response,
    target,
  }: { agent?: RecordId | string; response?: boolean; target?: string } = {}
): Promise<string> => {
  const db = await getDB();
  const emb = embedding ? embedding : await embed(content);
  const [meme] = await db.create(TABLE_MEME, {
    timestamp: new Date().toISOString(),
    hash: hashData(content),
    content,
    embedding: emb,
  });
  if (target) {
    await relate(new StringRecordId(target), TABLE_ELICITS, meme.id);
  }
  await createFiles({ files }, { agent });
  if (agent) {
    await relate(agent, TABLE_INSERTED, meme.id);
  }
  const newTarget = meme.id.toString();
  if (response) {
    const { agent, messages }: any = await getMostAppropriateAgent(meme);
    const content: string = (await generateResponseContent({
      messages,
      agent: await getEntity(agent),
    })) as any;
    await createMeme(
      { content },
      {
        agent: new StringRecordId(agent) as unknown as RecordId,
        target: newTarget,
      }
    );
  }
  return newTarget;
};

////
// Agent
////
export const nameExists = async (name: string): Promise<boolean> => {
  const db = await getDB();
  const [agent]: [any] = await db.query(
    "SELECT * FROM type::table($table) WHERE name = $name",
    {
      table: TABLE_AGENT,
      name,
    }
  );
  return !!agent[0];
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
  model = null,
  description = null,
  qualities = [],
  image = null,
  files = [],
}: {
  model?: string | null;
  description?: string | null;
  qualities?: [string, string][];
  image?: string | null;
  files?: ProtoFile[];
} = {}) => {
  const db = await getDB();
  const name = await generateRandomName();
  const combinedQualities = qualities
    .map(([name, description]) => `- ${name}\n  - ${description}`)
    .join("\n");
  const { content: systemPrompt } = await generateSystemPrompt(
    combinedQualities,
    description
  );

  const indexed = [name, systemPrompt, description, combinedQualities]
    .filter(Boolean)
    .join("\n ------------------ \n");

  const embedding = await embed(systemPrompt as string);

  const [agent] = await db.create(TABLE_AGENT, {
    timestamp: new Date().toISOString(),
    name,
    systemPrompt,
    combinedQualities,
    model,
    description,
    qualities,
    image,
    embedding,
    indexed,
  });
  await createFiles({ files }, { agent });
  return agent.id.toString();
};
