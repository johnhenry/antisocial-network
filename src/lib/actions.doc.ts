"use server";
import type { Doc } from "@/types/post_client";
import { getDB } from "@/lib/db";
import { TABLE_DOC } from "@/settings";
import { parse } from "@/lib/quick-parse";
import type { RecordId } from "surrealdb.js";
import { StringRecordId } from "surrealdb.js";
import semanticChunker from "@/lib/chunkers/semantic";
import { createMeme } from "@/lib/actions.meme";
import { relate } from "@/lib/db";
import { TABLE_CONTAINS, TABLE_PROCEEDS } from "@/settings";

import hash from "@/util/hash";

export const createDoc = async ({
  title = null,
  author = null,
  publisher = null,
  publishDate = null,
  metadata = {},
  type = null,
  text = "",
}: {
  title?: string | null;
  author?: string | null;
  publisher?: string | null;
  publishDate?: string | null;
  type?: string | null;
  metadata?: Record<string, any>;
  text?: string;
} = {}): Promise<Doc> => {
  const db = await getDB();
  const [doc] = await db.create(TABLE_DOC, {
    timestamp: new Date().toISOString(),
    title,
    author,
    publisher,
    publishDate,
    metadata,
    type,
    hash: hash(text),
  });
  let previousMemeId = null;
  // embed chunks
  for await (const { chunk, embedding } of semanticChunker(text)) {
    const meme = await createMeme(chunk, embedding);
    const id = new StringRecordId(meme.id) as unknown as RecordId;
    await relate(doc.id, TABLE_CONTAINS, id);
    if (previousMemeId) {
      await relate(previousMemeId, TABLE_PROCEEDS, id);
    }
    previousMemeId = id;
  }

  return parse(doc);
};

export const updateDoc = async (
  identifier: string,
  {
    title = null,
    author = null,
    publisher = null,
    publishDate = null,
  }: {
    title?: string | null;
    author?: string | null;
    publisher?: string | null;
    publishDate?: string | null;
  } = {}
): Promise<Doc> => {
  const db = await getDB();
  const id = new StringRecordId(identifier);
  // get agent
  const doc = await db.select(id);
  doc.title = title;
  doc.author = author;
  doc.publisher = publisher;
  doc.publishDate = publishDate;
  const updatedDoc = await db.update(id, doc);
  return parse(updatedDoc);
};

export const getDoc = async (identifier: string): Promise<Doc> => {
  const db = await getDB();
  return parse(await db.select(new StringRecordId(identifier)));
};
