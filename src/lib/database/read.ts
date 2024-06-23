"use server";
import { StringRecordId, RecordId } from "surrealdb.js";
import { getDB } from "@/lib/db";
import {
  TABLE_AGENT,
  TABLE_INSERTED,
  TABLE_MEME,
  TABLE_PROCEEDS,
} from "@/settings";

import { assessAgents } from "@/tools";

import { respond } from "@/lib/ai";

export const getEntity = async (identifier: string | RecordId) => {
  const db = await getDB();
  const id: RecordId =
    typeof identifier === "string"
      ? (new StringRecordId(identifier) as unknown as RecordId)
      : identifier;
  return db.select(id);
};
export const getFile = getEntity;

export const getEntityWithReplationships = async (
  identifier: string | RecordId,
  {
    inn = [],
    out = [],
  }: { inn?: Record<any, any>[]; out?: Record<any, any>[] } = {}
) => {
  const output = { default: null, inn: [], out: [] };
  const db = await getDB();
  const id: RecordId =
    typeof identifier === "string"
      ? (new StringRecordId(identifier) as unknown as RecordId)
      : identifier;
  output.default = await db.select(id);

  for (const { table, relationship } of inn) {
    const [results] = await db.query(
      `SELECT * OMIT embeddings, data FROM ${table} where <-${relationship}<-(meme where id = $meme)`,
      {
        meme: id,
      }
    );
    output.inn.push({ table, relationship, results });
  }
  for (const { table, relationship } of out) {
    const [results] = await db.query(
      `SELECT * OMIT embeddings, data FROM ${table} where ->${relationship}->(meme where id = $meme)`,
      {
        meme: id,
      }
    );
    output.out.push({ table, relationship, results });
  }
  return output;
};

const SYSTEM_PROMPT = `You have a list of summaries of ai agents in the form:
---
id: <id>
prompt:
  <prompt>
---
`;

const USER_PROMPT = `Please use this information to assign a score from 0 to 1 to each agent id (of the form "${TABLE_AGENT}:???") based
on how suited they are to respond to a list of prompts.
how well they can continue the conversation.

Here are some key points to consider:
  - If an agent is mentioned (i.e. "@<agent_name>") that's an automatic score of 1.
  - If disuaded from using an agent,
(e.g. "do not ask @<agent_name>") that's an automatic score of 0.
  - Agents with knowdedge of or interest in a topic should be scored higher.
`;

const createAgentPrompt = ({
  id,
  systemPrompt,
}: Record<string, string>) => `id:${id}
prompt:
  ${systemPrompt}
`;

export const generateMemeWithHistory = async (
  meme: any
): Promise<[string, string][]> => {
  const db = await getDB();
  let currentMeme = meme;
  const messages: [string, string][] = [];
  while (currentMeme) {
    const [[agent]] = await db.query(
      `SELECT * FROM ${TABLE_AGENT} where ->${TABLE_INSERTED}->(meme where id = $meme)`,
      {
        meme: meme.id,
      }
    );
    messages.unshift([agent ? "assistant" : "user", meme.content]);
    console.log("AGENT", agent);
    [[currentMeme]] = await db.query(
      `SELECT * FROM ${TABLE_MEME} where ->${TABLE_PROCEEDS}->(meme where id = $meme)`,
      {
        meme: meme.id,
      }
    );
    console.log("AGENT", currentMeme);
  }
  return messages;
};

export const getAppropriateAgents = async (meme: any): Promise<any[]> => {
  const db = await getDB();
  let currentMeme = meme;
  //
  const messages = await generateMemeWithHistory(meme);
  const [agents]: [any[]] = await db.query(
    `SELECT id, systemPrompt FROM ${TABLE_AGENT}`
  );
  for (const agent of agents) {
    messages.unshift([
      "system",
      createAgentPrompt({
        id: agent.id.toString(),
        systemPrompt: agent.systemPrompt,
      }),
    ]);
  }
  const functions = {
    functions: [assessAgents.descriptor],
    function_call: {
      name: "assessAgents",
    },
  };
  const { scores } = (await respond(
    [["system", SYSTEM_PROMPT], ...messages, ["user", USER_PROMPT]],
    {},
    functions
  )) as any;
  return { scores, messages };
};

export const getMostAppropriateAgent = async (meme: any) => {
  const { scores, messages } = await getAppropriateAgents(meme);
  const sorteScores = scores.toSorted((a, b) => b.score - a.score);
  const agent = sorteScores[0].agent;
  return { agent, messages };
};

export const getRelevantKnowlede = async (meme: any, agent: any) => {
  // TODO: Retrieve relevant knowledge from ideas
  // TODO: Retrieve relevant knowledge from user's posts/memories
  // TODO: Retrieve relevant knodledge from user's docs
  return "";
};
