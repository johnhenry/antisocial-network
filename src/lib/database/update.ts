"use server";
import { getDB } from "@/lib/db";
import { StringRecordId } from "surrealdb.js";
import generateSystemPrompt from "@/lib/gen-system-prompt";
import { embed } from "@/lib/ai";
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
    const combinedQualities = qualities
      .map(([name, description]) => `- ${name}\n  - ${description}`)
      .join("\n");
    // retenerate content if qualities or description have changed
    if (
      agent.combinedQualities !== combinedQualities ||
      agent.description !== description
    ) {
      // update system prompt, description and combinedQualities
      let _;
      const { content } = await generateSystemPrompt(
        combinedQualities,
        description || ""
      );
      agent.content = content;
      agent.embedding = await embed(content as string);
      agent.qualities = qualities;
      agent.description = description;
      agent.combinedQualities = combinedQualities;
    }
    if (model !== agent.model) {
      agent.model = model;
    }
    agent.indexed = [
      agent.name,
      agent.content,
      agent.description,
      agent.combinedQualities,
    ]
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
