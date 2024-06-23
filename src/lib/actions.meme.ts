"use server";
import { getDB, query } from "@/lib/db";
import type { Doc } from "@/types/types";
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
  console.log("search", search, "page", page, "size", size);
  const embedded = await embed(search);
  const db = await getDB();
  const [memes, [{ count }]] = await db.query(
    `SELECT id, content, vector::similarity::cosine(embedding, $embedded) AS dist, count() FROM type::table($table) WHERE embedding <|2|> $embedded ORDER BY dist DESC LIMIT $size START $start;SELECT count() FROM type::table($table) WHERE embedding <|2|> $embedded GROUP ALL`,
    {
      table: TABLE_MEME,
      embedded: embedded,
      size: size,
      start: page * size,
    }
  );
  return { memes: memes.map(parse), count };
};

export const getMeme = async (identifier: string) => {
  const db = await getDB();
  return parse(await db.select(new StringRecordId(identifier)));
};
