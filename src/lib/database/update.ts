"use server";
import type { AgentParameters, Setting, Settings } from "@/types/types";
import { getDB } from "@/lib/db";
import { StringRecordId } from "surrealdb.js";
import { embed, summarize, PROMPTS_SUMMARIZE } from "@/lib/ai";
import { nameExists } from "@/lib/database/create";

import removeValuesFromObject from "@/util/removeValuesFromObject";
import {
  DEFAULT_PARAMETERS_AGENT,
  TABLE_SETTINGS,
  TABLE_SETTINGS_ID_CURRENT,
} from "@/settings";

export const updateAgent = async (
  identifier: string,
  {
    name = null,
    description = null,
    qualities = [],
    image = null,
    parameters = DEFAULT_PARAMETERS_AGENT,
  }: {
    name?: string | null;
    description?: string | null;
    qualities?: [string, string][];
    image?: string | null;
    parameters?: AgentParameters;
  } = {}
): Promise<string> => {
  const db = await getDB();
  try {
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

    const combinedQualities = (
      description +
      "\n\n" +
      qualities.map(([k, v]) => `- ${k}\n  - ${v}`).join("\n")
    ).trim();

    // regenerate content if qualities or description have changed
    if (agent.combinedQualities !== combinedQualities) {
      // update system prompt, description and combinedQualities
      const content = combinedQualities
        ? await summarize(combinedQualities, PROMPTS_SUMMARIZE.LLM_PROMPT)
        : await summarize("", PROMPTS_SUMMARIZE.LLM_PROMPT_RANDOM);
      agent.content = content;
      agent.embedding = await embed(content as string);
      agent.qualities = qualities;
      agent.description = description?.trim();
      agent.combinedQualities = combinedQualities;
    }
    agent.parameters = removeValuesFromObject(parameters, undefined, "");
    agent.indexed = [agent.description, agent.content, agent.combinedQualities]
      .filter(Boolean)
      .join("\n ------------------ \n");

    await db.update(id, agent);
    return identifier;
  } finally {
    db.close();
  }
};

export const updateFile = async (
  identifier: string,
  {
    name = null,
    author = null,
    publisher = null,
    publishDate = null,
  }: {
    name?: string | null;
    author?: string | null;
    publisher?: string | null;
    publishDate?: string | null;
  } = {}
): Promise<string> => {
  const db = await getDB();
  try {
    const id = new StringRecordId(identifier);
    // get agent
    const doc = await db.select(id);
    doc.name = name;
    doc.author = author;
    doc.publisher = publisher;
    doc.publishDate = publishDate;
    await db.update(id, doc);
    return identifier;
  } finally {
    await db.close();
  }
};
export const updateSettings = async (
  settings: Setting[]
): Promise<Setting[]> => {
  const db = await getDB();
  try {
    // Fetch current settings
    await db.update(new StringRecordId("settings:current"), {
      data: settings,
      updated_at: new Date().toISOString(),
    });
    return settings;
  } catch (error) {
    console.error("Error updating settings:", error);
    return [];
  } finally {
    // Close the connection
    db.close();
  }
};
