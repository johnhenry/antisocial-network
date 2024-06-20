"use server";
import type { Agent } from "@/types/post_client";
import { getDB } from "@/lib/db";
import { TABLE_AGENT } from "@/settings";
import { parse } from "@/lib/quick-parse";
import { StringRecordId } from "surrealdb.js";
import generateSystemPrompt from "@/lib/gen-system-prompt";
import { embed } from "@/lib/ai";
import nameGenerator from "@/util/random-name-generator";

const nameExists = async (name: string): Promise<boolean> => {
  const db = await getDB();
  const [agent]: [any] = await db.query(
    "SELECT * FROM type::table($table) WHERE name = $name",
    {
      table: TABLE_AGENT,
      name,
    }
  );
  return !!agent[0];
};

const generateRandomName = async () => {
  for (const name of nameGenerator()) {
    if (await nameExists(name)) {
      continue;
    }
    return name;
  }
};
type GeneratedPrompt = {
  content: string;
};

export const createAgent = async ({
  model = null,
  description = null,
  qualities = [],
  image = null,
}: {
  model?: string | null;
  description?: string | null;
  qualities?: [string, string][];
  image?: string | null;
} = {}) => {
  const db = await getDB();
  const name = await generateRandomName();
  const combinedQualities = qualities
    .map(([name, description]) => `- ${name}\n  - ${description}`)
    .join("\n");
  const { content: systemPrompt } = (await generateSystemPrompt(
    combinedQualities,
    description
  )) as GeneratedPrompt;

  const indexed = [name, systemPrompt, description, combinedQualities]
    .filter(Boolean)
    .join("\n ------------------ \n");

  const embedding = embed(systemPrompt);

  const [agent] = await db.create(TABLE_AGENT, {
    timestamp: new Date().toISOString(),
    name,
    systemPrompt,
    combinedQualities,
    model,
    description,
    qualities,
    image,
    embedding,
    indexed,
  });
  return parse(agent);
};

export const updateAgent = async (
  identifier: string,
  {
    name = null,
    model = null,
    description = null,
    qualities = [],
    image = null,
  }: {
    name?: string | null;
    model?: string | null;
    description?: string | null;
    qualities?: [string, string][];
    image?: string | null;
  } = {}
) => {
  const db = await getDB();
  const id = new StringRecordId(identifier);
  // get agent
  const agent = await db.select(id);
  // name is different
  if (name && agent.name !== name) {
    if (await nameExists(name)) {
      return parse(agent);
    }
    agent.name = name;
  }
  if (agent.image !== image) {
    agent.image = image;
  }
  const combinedQualities = qualities
    .map(([name, description]) => `- ${name}\n  - ${description}`)
    .join("\n");
  // retenerate systemPrompt if qualities or description have changed
  if (
    agent.combinedQualities !== combinedQualities ||
    agent.description !== description
  ) {
    // update system prompt, description and combinedQualities
    let _;
    const { content: systemPrompt } = (await generateSystemPrompt(
      combinedQualities,
      description || ""
    )) as GeneratedPrompt;
    agent.systemPrompt = systemPrompt;
    agent.embedding = embed(systemPrompt);
    agent.qualities = qualities;
    agent.description = description;
    agent.combinedQualities = combinedQualities;
  }
  if (model !== agent.model) {
    agent.model = model;
  }
  agent.indexed = [
    agent.name,
    agent.systemPrompt,
    agent.description,
    agent.combinedQualities,
  ]
    .filter(Boolean)
    .join("\n ------------------ \n");

  const updatedAgent = await db.update(id, agent);
  return parse(updatedAgent);
};

export const getAgent = async (identifier: string | null) => {
  const db = await getDB();
  if (!identifier) {
    return null;
  }
  const id = new StringRecordId(identifier);
  const agent = db.select(id);
  return agent;
};

export const getAllAgents = async () => {
  const db = await getDB();
  return await db.select(TABLE_AGENT);
};
