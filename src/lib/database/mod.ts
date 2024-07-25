"use server";

import type {
  Agent,
  AgentExt,
  AgentPlus,
  AgentPlusExt,
  Entity,
  EntityExt,
  ErrorExt,
  FileExt,
  FilePlusExt,
  FileProto,
  LogExt,
  Post,
  PostExt,
  PostPlusExt,
  RelationExt,
} from "@/types/mod";
import { replaceContentWithLinks } from "@/lib/database/helpers";

import { StringRecordId } from "surrealdb.js";
import { getDB, relate, unrelate } from "@/lib/db";

import createPost, {
  getPost,
  getPostPlus,
  getPosts,
} from "@/lib/database/post";
import { getFile, getFilePlus, getFiles } from "@/lib/database/file";
import {
  getAgent,
  getAgentPlus,
  getAgents,
  updateAgent,
} from "@/lib/database/agent";
import { updateFile } from "@/lib/database/file";
import { getLogs } from "@/lib/database/log";

import {
  mapAgentPlusToAgentPlusExt,
  mapAgentToAgentExt,
  mapErrorToErrorExt,
  mapFilePlusToFilePlusExt,
  mapFileToFileExt,
  mapLogToLogExt,
  mapPostPlusToPostPlusExt,
  mapPostToPostExt,
  mapRelationToRelationExt,
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
): Promise<EntityExt | void> => {
  const db = await getDB();
  try {
    const source: Agent | undefined = sourceId
      ? await db.select<Agent>(new StringRecordId(sourceId))
      : undefined;
    const target: Post | undefined = targetId
      ? await db.select<Post>(new StringRecordId(targetId))
      : undefined;
    const result: Entity | void = await createPost(content, {
      embedding,
      files,
      source,
      target,
      streaming,
      depth,
    });
    if (result) {
      let mapper: (entity: Entity) => EntityExt;
      const type = result.id.tb;
      switch (type) {
        case "post": {
          mapper = mapPostToPostExt as (entity: Entity) => EntityExt;
          break;
        }
        case "file": {
          mapper = mapFileToFileExt as (entity: Entity) => EntityExt;
          break;
        }
        case "agent": {
          mapper = mapAgentToAgentExt as (entity: Entity) => EntityExt;
          break;
        }
        case "log": {
          mapper = mapLogToLogExt as (entity: Entity) => EntityExt;
          break;
        }
        default:
          throw new Error(`Unknown type: ${type}`);
      }
      return await replaceContentWithLinks(
        mapper(result),
        true,
      );
    }
  } catch (e) {
    if (e instanceof Error) {
      return mapErrorToErrorExt(e);
    }
    throw e;
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
  const file = await getFile(new StringRecordId(id));
  return mapFileToFileExt(file);
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
  search: string = "",
): Promise<PostExt[]> => {
  const posts = await getPosts(offset, limit, search);
  return posts.map(mapPostToPostExt);
};

export const getFilesExternal = async (
  offset: number,
  limit: number,
  search: string = "",
): Promise<FileExt[]> => {
  const files = await getFiles(offset, limit, search);
  return files.map(mapFileToFileExt);
};

export const getAgentsExternal = async (
  offset: number,
  limit: number,
  search: string = "",
): Promise<AgentExt[]> => {
  const agents = await getAgents(offset, limit, search);
  return agents.map(mapAgentToAgentExt);
};

export const getEntitiesExternal = async (
  offset: number,
  limit: number,
  search: string = "",
  {
    posts,
    files,
    agents,
  }: {
    posts: boolean;
    files: boolean;
    agents: boolean;
  },
): Promise<EntityExt[]> => {
  const root: EntityExt[] = [];
  const p = posts ? await getPostsExternal(offset, limit, search) : [];
  const f = files ? await getFilesExternal(offset, limit, search) : [];
  const a = agents ? await getAgentsExternal(offset, limit, search) : [];
  return root.concat(p).concat(f).concat(a);
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
): Promise<FileExt | ErrorExt> => {
  try {
    const indeitifier = new StringRecordId(id);
    const file = await getFile(indeitifier);
    const newFile = await updateFile(indeitifier, {
      ...file,
      name,
      author,
      publisher,
      date,
    });
    return mapFileToFileExt(newFile);
  } catch (e) {
    if (e instanceof Error) {
      return mapErrorToErrorExt(e);
    }
    throw e;
  }
};

export const updateAgentExternal = async (
  id: string,
  options: any,
): Promise<AgentExt | ErrorExt> => {
  try {
    const identifier = new StringRecordId(id);
    const updatedAgent = await updateAgent(identifier, options) as Agent;
    return mapAgentToAgentExt(updatedAgent);
  } catch (e) {
    if (e instanceof Error) {
      return mapErrorToErrorExt(e);
    }
    throw e;
  }
};

// Delete Singular Objects with

export const relateExt = async (
  inn: string,
  rel: string,
  out: string,
  data?: Record<any, any>,
): Promise<RelationExt> => {
  const result = await relate(
    new StringRecordId(inn),
    rel,
    new StringRecordId(out),
    data,
  );
  return mapRelationToRelationExt(result);
};

export const unrelateExt = (inn: string, rel: string, out: string) => {
  return unrelate(new StringRecordId(inn), rel, new StringRecordId(out));
};

export const getAllAgentNames = async (): Promise<string[]> => {
  const agents = await getAgents(0, -1);
  return agents.map((agent) => agent.name);
};
