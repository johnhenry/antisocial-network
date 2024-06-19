"use server";
import db from "@/lib/db";
import { TABLE_MEME } from "@/settings";
import { parse } from "@/lib/quick-parse";
import { RecordId, StringRecordId } from "surrealdb.js";
import { embed } from "@/lib/ai";
import { time } from "console";
// POSTS

export const createMeme = async (content: string) => {
  const meme = db.create(TABLE_MEME, {
    timestamp: new Date().toISOString(),
    content,
  });
  return parse(meme);
};
