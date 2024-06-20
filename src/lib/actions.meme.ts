"use server";
import { getDB, query } from "@/lib/db";
import type { Doc } from "@/types/post_client";
import { TABLE_MEME } from "@/settings";
import { parse } from "@/lib/quick-parse";
import { StringRecordId } from "surrealdb.js";
import { embed } from "@/lib/ai";
// POSTS
import hash from "@/util/hash";

export const createMeme = async (
  content: string,
  embedding?: number[]
): Promise<Doc> => {
  const db = await getDB();
  const [meme] = await db.create(TABLE_MEME, {
    timestamp: new Date().toISOString(),
    embedding: embedding ?? (await embed(content)),
    hash: hash(content),
    content,
  });
  return parse(meme);
};

export const searchMemes = async (
  search: string,
  page: number,
  size: number
) => {
  const embedded = await embed(search);
  const memes = await query()`
    SELECT * FROM type::table(${TABLE_MEME})
    WHERE embedding LIKE ${embedded}
    LIMIT ${size} OFFSET ${(page - 1) * size}
  `;
  const numpages = await query()`
    SELECT COUNT(*) FROM type::table(${TABLE_MEME})
    WHERE embedding LIKE ${embedded}
  `;
  return { memes, numpages };
};

export const getMeme = async (identifier: string) => {
  const db = await getDB();
  return parse(await db.select(new StringRecordId(identifier)));
};
