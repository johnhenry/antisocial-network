"use server";

import type { Agent, Post, PostExt, ProtoFile } from "@/types/mod";

import { StringRecordId } from "surrealdb.js";
import { getDB } from "@/lib/db";

import createPost from "@/lib/create/post";

import { convertPostToExt } from "@/lib/util/convert-types";

export const createPostExternal = async (
  content: string | undefined | false,
  {
    embedding,
    files,
    sourceId,
    targetId,
    streaming,
    depth = -1,
  }: {
    embedding?: number[];
    files?: ProtoFile[];
    sourceId?: string;
    targetId?: string;
    streaming?: boolean;
    depth?: number;
  } = {},
): Promise<PostExt | void> => {
  const db = await getDB();
  try {
    const source: Agent | undefined = sourceId
      ? await db.select<Agent>(new StringRecordId(sourceId))
      : undefined;
    const target: Post | undefined = targetId
      ? await db.select<Post>(new StringRecordId(targetId))
      : undefined;
    const result = await createPost(content, {
      embedding,
      files,
      source,
      target,
      streaming,
      depth,
    });
    if (result) {
      return convertPostToExt(result);
    }
  } finally {
    db.close();
  }
};