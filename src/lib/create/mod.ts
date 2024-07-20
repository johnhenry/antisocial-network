"use server";

import type { Agent, FileProto, Post, PostExt } from "@/types/mod";

import { StringRecordId } from "surrealdb.js";
import { getDB } from "@/lib/db";

import createPost from "@/lib/create/post";
import { getLogs } from "@/lib/create/log";

import { mapLogToLogExt, mapPostToPostExt } from "@/lib/util/convert-types";

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
    files?: FileProto[];
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
      return mapPostToPostExt(result);
    }
  } finally {
    db.close();
  }
};

export const getLogsExternal = async (
  offset: number,
  limit: number,
): Promise<PostExt[]> => {
  const db = await getDB();
  try {
    const logs = await getLogs(offset, limit);
    return logs.map(mapLogToLogExt);
  } finally {
    db.close();
  }
};
