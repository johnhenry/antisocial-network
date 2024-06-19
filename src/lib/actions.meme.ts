"use server";
import db from "@/lib/db";
import type { Doc } from "@/types/post_client";
import { TABLE_MEME } from "@/settings";
import { parse } from "@/lib/quick-parse";
import { RecordId, StringRecordId } from "surrealdb.js";
import { embed } from "@/lib/ai";
// POSTS
import hash from "@/util/hash";

export const createMeme = async (
  content: string,
  embedding?: number[]
): Promise<Doc> => {
  const [meme] = await db.create(TABLE_MEME, {
    timestamp: new Date().toISOString(),
    embedding: embedding ?? (await embed(content)),
    hash: hash(content),
    content,
  });
  return parse(meme);
};

export const setRelationshipProceeds = async (
  first_meme_id: string,
  second_meme_id: string
) => {
  return parse(
    await db.relate(
      new StringRecordId(first_meme_id),
      "proceeds",
      new StringRecordId(second_meme_id)
    )
  );
};
