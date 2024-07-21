"use server";

import type {
  Agent,
  FileProto,
  LogExt,
  Post,
  PostExt,
  PostPlusExt,
} from "@/types/mod";

import { RecordId, StringRecordId } from "surrealdb.js";
import { getDB } from "@/lib/db";

import createPost, {
  getPost,
  getPostPlus,
  getPosts,
} from "@/lib/database/post";
import { getLogs } from "@/lib/database/log";

import {
  mapLogToLogExt,
  mapPostPlusToPostPlusExt,
  mapPostToPostExt,
} from "@/lib/util/convert-types";

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
): Promise<LogExt[]> => {
  const logs = await getLogs(offset, limit);
  return logs.map(mapLogToLogExt);
};

export const getPostsExternal = async (
  offset: number,
  limit: number,
): Promise<PostExt[]> => {
  const posts = await getPosts(offset, limit);
  return posts.map(mapPostToPostExt);
};

export const getPostExternal = async (
  id: string,
): Promise<PostExt> => {
  const post = await getPost(new StringRecordId(id));

  return mapPostToPostExt(post);
};

export const getPostPlusExternal = async (
  id: string,
): Promise<PostPlusExt> => {
  const postPlus = await getPostPlus(new StringRecordId(id));
  return mapPostPlusToPostPlusExt(postPlus);
};
