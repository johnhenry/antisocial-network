"use server";
import type { Doc } from "@/types/post_client";
import db from "@/lib/db";
import { TABLE_DOC } from "@/settings";
import { parse } from "@/lib/quick-parse";
import { StringRecordId } from "surrealdb.js";

export const createDoc = async ({
  title = null,
  author = null,
  publisher = null,
  publishDate = null,
  metadata = null,
}: {
  title?: string | null;
  author?: string | null;
  publisher?: string | null;
  publishDate?: string | null;
  metadata?: any;
} = {}): Promise<Doc> => {
  const [doc] = await db.create(TABLE_DOC, {
    timestamp: new Date().toISOString(),
    title,
    author,
    publisher,
    publishDate,
    metadata,
  });
  return parse(doc);
};

export const updateDoc = async (
  identifier: string,
  {
    title = null,
    author = null,
    publisher = null,
    publishDate = null,
    metadata = null,
  }: {
    title?: string | null;
    author?: string | null;
    publisher?: string | null;
    publishDate?: string | null;
    metadata?: any;
  } = {}
): Promise<Doc> => {
  const id = new StringRecordId(identifier);
  // get agent
  const doc = await db.select(id);
  doc.title = title;
  doc.author = author;
  doc.publisher = publisher;
  doc.publishDate = publishDate;
  doc.metadata = metadata;
  const updatedDoc = await db.update(id, doc);
  return parse(updatedDoc);
};

export const setRelationshipContains = async (
  doc_id: string,
  meme_id: string
) => {
  return parse(
    await db.relate(
      new StringRecordId(doc_id),
      "contains",
      new StringRecordId(meme_id)
    )
  );
};
