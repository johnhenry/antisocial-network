import type {
  Agent,
  AgentParameters,
  AgentPlus,
  AgentTemp,
  File,
  FileProto,
  LangchainGenerator,
  Post,
} from "@/types/mod";
import type { BaseMessageChunk } from "@langchain/core/messages";

import {
  DEFAULT_PARAMETERS_AGENT,
  REL_BOOKMARKS,
  TABLE_AGENT,
} from "@/config/mod";
import { getDB } from "@/lib/db";
import { embed, PROMPTS_SUMMARIZE, summarize, tokenize } from "@/lib/ai";
import hash from "@/lib/util/hash";
import { genRandSurrealQLString } from "@/lib/util/gen-random-string";
import { StringRecordId } from "surrealdb.js";
import { RecordId } from "surrealdb.js";
import removeValuesFromObject from "@/lib/util/removeValuesFromObject";
import { createFiles } from "@/lib/database/file";

import { getEntity, getLatest } from "@/lib/database/helpers";
import { respond } from "@/lib/ai";

import {
  generateSystemMessage,
  mapPostsToMessages,
} from "@/lib/templates/dynamic";

import { respondFunc } from "@/lib/ai";

export const toolResponse = async (
  tool: string,
  { streaming = false, conversation = [] }: {
    streaming?: boolean;
    conversation?: Post[];
  } = {},
): Promise<string> => {
  throw new Error("TODO: Implement");
  const messages = mapPostsToMessages(conversation);

  return `response->${Date.now()}`;
};
