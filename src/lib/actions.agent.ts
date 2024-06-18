"use server";
import type { Agent } from "@/types/post_client";
import db from "@/lib/db";
import { TABLE_AGENT } from "@/settings";
import { parse } from "@/lib/quick-parse";
import { StringRecordId } from "surrealdb.js";
import { generateSystemPrompt } from "@/lib/actions.ai.mjs";

import nameGenerator from "@/util/random-name-generator";

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
  for (const name of nameGenerator()) {
    if (await nameExists(name)) {
      continue;
    }
    return name;
  }
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
  const name = await generateRandomName();
  const combinedQualities = qualities
    .map(([name, description]) => `- ${name}\n  - ${description}`)
    .join("\n");
  const [_, systemPrompt] = await generateSystemPrompt(
    combinedQualities,
    description
  );

  const indexed = [name, systemPrompt, description, combinedQualities]
    .filter(Boolean)
    .join("\n ------------------ \n");

  const [agent] = await db.create(TABLE_AGENT, {
    timestamp: new Date().toISOString(),
    name,
    systemPrompt,
    combinedQualities,
    model,
    description,
    qualities,
    image,
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
    [_, agent.systemPrompt] = await generateSystemPrompt(
      combinedQualities,
      description || ""
    );
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

export const getAgent = async (identifier: string) => {
  if (!identifier) return null;
  const id = new StringRecordId(identifier);
  const agent = db.select(id);
  return agent;
};

export const getAllAgents = () => db.select(TABLE_AGENT);
