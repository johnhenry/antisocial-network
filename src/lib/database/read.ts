"use server";
import type { Agent } from "@/types/types";
import { StringRecordId, RecordId } from "surrealdb.js";
import { getDB } from "@/lib/db";
import {
  TABLE_AGENT,
  REL_INSERTED,
  TABLE_MEME,
  REL_PRECEDES,
  REL_BOOKMARKS,
  TABLE_FILE,
  REL_CONTAINS,
  REL_REMEMBERS,
} from "@/settings";

import { embed } from "@/lib/ai";

export const getEntity = async (identifier: string | RecordId) => {
  const db = await getDB();
  try {
    const id: RecordId =
      typeof identifier === "string"
        ? (new StringRecordId(identifier) as unknown as RecordId)
        : identifier;
    return await db.select(id);
  } finally {
    await db.close();
  }
};
export const getFile = getEntity;

export type Relationship = {
  table: string;
  relationship: string;
  results: any[];
};

export const getEntityWithReplationships = async (
  identifier: string | RecordId,
  {
    source = "meme",
    inn = [],
    out = [],
  }: {
    source?: string;
    inn?: Record<any, any>[];
    out?: Record<any, any>[];
  } = {}
) => {
  const db = await getDB();
  try {
    const output: { default: any; inn: Relationship[]; out: Relationship[] } = {
      default: null,
      inn: [],
      out: [],
    };
    const id: RecordId =
      typeof identifier === "string"
        ? (new StringRecordId(identifier) as unknown as RecordId)
        : identifier;
    output.default = await db.select(id);

    for (const { table, relationship } of inn) {
      const [results]: [any[]] = await db.query(
        `SELECT * OMIT embedding, data FROM ${table} where <-${relationship}<-(${source} where id = $meme)`,
        {
          meme: id,
        }
      );
      output.inn.push({ table, relationship, results });
    }
    for (const { table, relationship } of out) {
      const [results]: [any[]] = await db.query(
        `SELECT * OMIT embedding, data FROM ${table} where ->${relationship}->(${source} where id = $meme)`,
        {
          meme: id,
        }
      );
      output.out.push({ table, relationship, results });
    }
    return output;
  } finally {
    await db.close();
  }
};

type Messages = [string, string][];

export const getMemeWithHistory = async (
  meme: any
): Promise<[string, string][]> => {
  const db = await getDB();
  try {
    let currentMeme = meme;
    const messages: Messages = [];
    while (currentMeme) {
      const [[agent]]: [Agent[]] = await db.query(
        `SELECT * FROM ${TABLE_AGENT} where ->${REL_INSERTED}->(meme where id = $meme)`,
        {
          meme: meme.id,
        }
      );
      messages.unshift([agent ? "assistant" : "user", meme.content]);
      [[currentMeme]] = await db.query(
        `SELECT * FROM ${TABLE_MEME} where ->${REL_PRECEDES}->(meme where id = $meme)`,
        {
          meme: meme.id,
        }
      );
    }
    return messages;
  } finally {
    await db.close();
  }
};

export const getMostAppropriateAgent = async (meme: any) => {
  const db = await getDB();
  try {
    const embedded = await embed(meme.content);
    const query = `SELECT id, vector::similarity::cosine(embedding, $embedded) AS dist OMIT embedding FROM type::table($table) WHERE embedding <|1|> $embedded ORDER BY dist DESC LIMIT 1`;

    const [[agent]]: [any[]] = await db.query(query, {
      table: TABLE_AGENT,
      embedded,
    });
    console.log({ agent });
    return agent;
  } finally {
    await db.close();
  }
};

export const getRelevantKnowlede = async (messages: any[], agent: any) => {
  const flatMessages = messages
    .map(([user, message]) => `${user}:${message}`)
    .join("\n\n");
  const embedded = await embed(flatMessages);
  const db = await getDB();
  try {
    const [bookmarked, remembered]: [Agent[]] = await db.query(
      `SELECT content, vector::similarity::cosine(embedding, $embedded) AS dist OMIT embedding FROM ${TABLE_MEME} WHERE <-${REL_CONTAINS}<-${TABLE_FILE}<-${REL_BOOKMARKS}<-(${TABLE_AGENT} WHERE id = $id) ORDER BY dist DESC LIMIT 3;
      SELECT content, vector::similarity::cosine(embedding, $embedded) AS dist OMIT embedding FROM ${TABLE_MEME} WHERE <-${REL_REMEMBERS}<-(${TABLE_AGENT} WHERE id = $id);`,
      {
        id: agent.id,
        embedded,
      }
    );
    return [...remembered, ...bookmarked]
      .map(({ content }) => content)
      .join("\n\n");
  } finally {
    await db.close();
  }
};

export const getAllAgents = async (): Promise<Agent[]> => {
  const db = await getDB();
  try {
    return (
      await db.query(`SELECT * OMIT embedding FROM ${TABLE_AGENT}`)
    )[0] as Agent[];
  } finally {
    await db.close();
  }
};

export const replaceAgentNameWithId = async (
  name: string
): Promise<string | null> => {
  const db = await getDB();
  try {
    const [[agent]]: [Agent | undefined] = await db.query(
      `SELECT id FROM ${TABLE_AGENT} WHERE name = $name`,
      {
        name,
      }
    );
    return agent ? agent.id.toString() : name;
  } finally {
    await db.close();
  }
};

export const replaceAgentIdWithName = async (
  id: string
): Promise<string | null> => {
  const db = await getDB();
  try {
    const [[agent]]: [Agent | undefined] = await db.query(
      `SELECT name FROM ${TABLE_AGENT} WHERE id = $id`,
      {
        id,
      }
    );
    return agent ? agent.name : id;
  } finally {
    await db.close();
  }
};
