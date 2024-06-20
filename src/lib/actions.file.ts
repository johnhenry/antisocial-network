"use server";

import { getDB } from "@/lib/db";
import { TABLE_FILE } from "@/settings";
import { parse } from "@/lib/quick-parse";
import { StringRecordId } from "surrealdb.js";

export const createFile = async ({
  path = "",
  type = "",
  content = "",
} = {}) => {
  const db = await getDB();
  const [file] = await db.create(TABLE_FILE, {
    timestamp: new Date().toISOString(),
    path,
    type,
    content,
  });
  return parse(file);
};

export const getFile = async (identifier: string) => {
  const db = await getDB();

  const id = new StringRecordId(identifier);
  const agent = db.select(id);
  return agent;
};

export const getFileByPath = async (path: string) => {
  const db = await getDB();
  const [file] = await db.query(
    "SELECT * FROM type::table($table) WHERE path = $path",
    {
      table: TABLE_FILE,
      path,
    }
  );
  return parse(file);
};
