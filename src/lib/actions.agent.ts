"use server";
import type { Agent } from "@/types/post_client";
import db from "@/lib/db";
import { TABLE_AGENT } from "@/settings";
import { parse } from "@/lib/quick-parse";
import { StringRecordId } from "surrealdb.js";
import { generateSystemPrompt } from "@/lib/actions.ai.mjs";

const nameExists = async (name: string): Promise<boolean> => {
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
  let name = "";
  do {
    name = Math.random().toString(36).substring(2);
  } while (await nameExists(name));
  return name;
};

export const createAgent = async ({
  model = "",
  description = "",
  qualities = [],
  image = "",
}: {
  model?: string;
  description?: string;
  qualities?: [string, string][];
  image?: string;
} = {}) => {
  const name = await generateRandomName();
  const combinedQualities = qualities
    .map(([name, description]) => `- ${name}\n  - ${description}`)
    .join("\n");
  const [_, systemPrompt] = await generateSystemPrompt(
    combinedQualities,
    description
  );

  const [agent] = await db.create(TABLE_AGENT, {
    timestamp: new Date().toISOString(),
    name,
    systemPrompt,
    combinedQualities,
    model,
    description,
    qualities,
    image,
  });
  return parse(agent);
};
export const updateAgent = async (
  identifier: string,
  {
    name = "",
    model = "",
    description = "",
    qualities = [],
    image = "",
  }: {
    name?: string;
    model?: string;
    description?: string;
    qualities?: [string, string][];
    image?: string;
  } = {}
) => {
  const id = new StringRecordId(identifier);
  // get agent
  const agent = await db.select(id);
  // name is different
  if (agent.name !== name) {
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
    [_, agent.systemPrompt] = await generateSystemPrompt(
      combinedQualities,
      description
    );
    agent.qualities = qualities;
    agent.description = description;
    agent.combinedQualities = combinedQualities;
  }
  if (model !== agent.model) {
    agent.model = model;
  }
  const updatedAgent = await db.update(id, agent);
  return parse(updatedAgent);
};

export const getAgent = async (identifier: string) => {
  if (!identifier) return null;
  const id = new StringRecordId(identifier);
  const agent = db.select(id);
  return agent;
};

export const getAllAgents = () => db.select(TABLE_AGENT);
