import db from "@/lib/db";
import { TABLE_AGENT } from "@/settings";
import { parse } from "@/lib/quick-parse";
import { StringRecordId } from "surrealdb.js";

export const createAgent = async (description: string, model = null) => {
  const [agent] = await db.create(TABLE_AGENT, {
    description,
    model,
    actions: null,
  });
  return parse(agent);
};

export const getAgent = async (identifier: string) => {
  const id = new StringRecordId(identifier);
  const agent = db.select(id);
  return agent;
};
