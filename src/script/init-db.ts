"use server";
import {
  TABLE_AGENT,
  TABLE_MEME,
  TABLE_FILE,
  SIZE_EMBEDDING_VECTOR,
} from "@/settings";
import { getDB } from "@/lib/db";
import { createSettings } from "@/lib/database/create";
const initDB = async () => {
  const db = await getDB();

  try {
    // define indexes on tables
    for (const table of [TABLE_AGENT, TABLE_MEME, TABLE_FILE]) {
      const queries = [
        `DEFINE TABLE IF NOT EXISTS ${table} SCHEMALESS`,
        `DEFINE FIELD IF NOT EXISTS embedding ON TABLE ${table} TYPE array<number>`,
        `DEFINE INDEX IF NOT EXISTS search ON ${table} FIELDS embedding MTREE DIMENSION ${SIZE_EMBEDDING_VECTOR} DIST COSINE`,
      ];
      try {
        await db.query(queries.join(";"));
      } catch (error: any) {
        if (error.message.includes("already exists")) {
          console.log(`Index already exists on ${table}`);
        } else {
          throw error;
        }
      }
    }
  } finally {
    db.close();
  }
  // await createSettings();
};

export default initDB;
