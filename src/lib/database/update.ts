"use server";
import type { Agent } from "@/types/post_client";
import { getDB } from "@/lib/db";
import { TABLE_AGENT } from "@/settings";
import { parse } from "@/lib/quick-parse";
import { StringRecordId } from "surrealdb.js";
import generateSystemPrompt from "@/lib/gen-system-prompt";
import { embed } from "@/lib/ai";
import nameGenerator from "@/util/random-name-generator";
import { nameExists } from "@/lib/database/create";

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
      return identifier;
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
    const { content: systemPrompt } = await generateSystemPrompt(
      combinedQualities,
      description || ""
    );
    agent.systemPrompt = systemPrompt;
    agent.embedding = embed(systemPrompt as string);
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
  return updatedAgent.id.toString();
};
