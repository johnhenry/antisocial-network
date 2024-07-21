"use server";

import type {
  Agent,
  AgentExt,
  AgentPlus,
  AgentPlusExt,
  FileExt,
  FilePlusExt,
  FileProto,
  LogExt,
  Post,
  PostExt,
  PostPlusExt,
} from "@/types/mod";
import { replaceContentWithLinks } from "@/lib/database/helpers";

import { RecordId, StringRecordId } from "surrealdb.js";
import { getDB } from "@/lib/db";

import createPost, {
  getPost,
  getPostPlus,
  getPosts,
} from "@/lib/database/post";
import { getFile, getFilePlus, getFiles } from "@/lib/database/file";
import { getAgent, getAgentPlus, getAgents } from "@/lib/database/agent";
import { updateFile } from "@/lib/database/file";
import { getLogs } from "@/lib/database/log";

import {
  mapAgentPlusToAgentPlusExt,
  mapAgentToAgentExt,
  mapFilePlusToFilePlusExt,
  mapFileToFileExt,
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
      return await replaceContentWithLinks(
        mapPostToPostExt(result),
        true,
      );
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

// Get Singular Objects

export const getPostExternal = async (
  id: string,
): Promise<PostExt> => {
  const post = await getPost(new StringRecordId(id));
  return mapPostToPostExt(post);
};

export const getFileExternal = async (
  id: string,
): Promise<FileExt> => {
  const db = await getDB();
  try {
    const file = await getFile(new StringRecordId(id));
    return mapFileToFileExt(file);
  } finally {
    db.close();
  }
};

// Get Singular Objects with Relationships

export const getPostPlusExternal = async (
  id: string,
): Promise<PostPlusExt> => {
  const postPlus = await getPostPlus(new StringRecordId(id));
  return mapPostPlusToPostPlusExt(postPlus);
};

export const getFilePlusExternal = async (
  id: string,
): Promise<FilePlusExt> => {
  const filePlus = await getFilePlus(new StringRecordId(id));
  return mapFilePlusToFilePlusExt(filePlus);
};

export const getAgentPlusExternal = async (
  id: string,
): Promise<AgentPlusExt> => {
  const agentPlus = await getAgentPlus(new StringRecordId(id));
  return mapAgentPlusToAgentPlusExt(agentPlus);
};

// Get multipl Objects

export const getPostsExternal = async (
  offset: number,
  limit: number,
): Promise<PostExt[]> => {
  const posts = await getPosts(offset, limit);
  return posts.map(mapPostToPostExt);
};

export const getFilesExternal = async (
  offset: number,
  limit: number,
): Promise<FileExt[]> => {
  const db = await getDB();
  try {
    const files = await getFiles(offset, limit);
    return files.map(mapFileToFileExt);
  } finally {
    db.close();
  }
};

export const getAgentsExternal = async (
  offset: number,
  limit: number,
): Promise<AgentExt[]> => {
  const agents = await getAgents(offset, limit);
  return agents.map(mapAgentToAgentExt);
};

// Update Objects

export const updateFileExternal = async (
  id: string,
  {
    name,
    author,
    publisher,
    date,
  }: {
    name?: string;
    author?: string;
    publisher?: string;
    date?: string;
  },
): Promise<FileExt> => {
  const file = await updateFile(new StringRecordId(id), {
    name,
    author,
    publisher,
    date,
  });
  return mapFileToFileExt(file);
};

export const updateAgentExternal = async (
  id: string,
  {
    name,
    email,
    avatar,
  }: {
    name?: string;
    email?: string;
    avatar?: string;
  },
): Promise<AgentExt> => {
  const db = await getDB();
  try {
    const agent = await db.update(new StringRecordId(id), {
      name,
      email,
      avatar,
    }) as Agent;
    return mapAgentToAgentExt(agent);
  } finally {
    db.close();
  }
};

// Delete Singular Objects with
