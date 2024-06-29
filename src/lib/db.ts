"use server";
import { Surreal } from "surrealdb.js";
import {
  DB_PATH,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAMESPACE,
  DB_DATABASE,
  TABLE_SETTINGS_ID_CURRENT,
  TABLE_SETTINGS,
  TABLE_AGENT,
  TABLE_MEME,
  TABLE_FILE,
  ALL_TABLES,
  SETTINGS_DEFAULT,
  SIZE_EMBEDDING_VECTOR,
} from "@/settings";
import { RecordId, StringRecordId } from "surrealdb.js";

import { replaceNumber as rn } from "@/util/replace-char";

const initialize = async (db: Surreal): Promise<void> => {
  // Define settings table
  try {
    await db.create(TABLE_SETTINGS, {
      id: TABLE_SETTINGS_ID_CURRENT,
      data: SETTINGS_DEFAULT,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    throw error;
  }
  // Define indexed tables
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
};

export const getDB = async ({
  dbPath = DB_PATH,
  dbUsername = DB_USERNAME,
  dbPassword = DB_PASSWORD,
  dbNamespace = DB_NAMESPACE,
  dbDatabase = DB_DATABASE,
}: {
  dbPath?: string;
  dbUsername?: string;
  dbPassword?: string;
  dbNamespace?: string;
  dbDatabase?: string;
} = {}): Promise<Surreal> => {
  const db = new Surreal();
  // Connect to the database
  await db.connect(dbPath);
  // Select a specific namespace / database
  await db.use({
    namespace: dbNamespace,
    database: dbDatabase,
  });
  // Signin as a namespace, database, or root user
  await db.signin({
    username: dbUsername,
    password: dbPassword,
  });

  if (!(await db.select(new StringRecordId("settings:current")))) {
    await initialize(db);
  }
  return db;
};

//Tag function that converts a query string into a sureal query

type QueryTagTemplateFunction<T = unknown> = (
  strings: string[],
  ...values: any[]
) => Promise<T>;

export const getAll = async (table: string) => {
  const db = await getDB();
  try {
    return await db.select(table);
  } finally {
    await db.close();
  }
};
const ensureRecordId = (id: RecordId | StringRecordId | String) => {
  if (typeof id === "string") {
    return new StringRecordId(id);
  }
  return id;
};

export const relate = async (
  inn: RecordId | StringRecordId,
  relationship: string,
  out: RecordId | StringRecordId,
  data?: Record<string, any>
) => {
  const db = await getDB();
  try {
    const result = await db.relate(
      ensureRecordId(inn),
      relationship,
      ensureRecordId(out),
      data
    );
    return result;
  } finally {
    await db.close();
  }
};

export const unrelate = async (
  inn: RecordId | StringRecordId | string,
  relationship: string,
  out: RecordId | StringRecordId | string
): Promise<boolean> => {
  const db = await getDB();
  try {
    const [[rel]] = await db.query(
      `SELECT * FROM type::table($relationship) WHERE in = ${inn} AND out = ${out}`,
      {
        relationship,
      }
    );
    if (!rel) {
      return false;
    }
    await db.delete(rel.id);
    return true;
  } finally {
    await db.close();
  }
};

//////
// EXPERIMENTAL
//////
const QUERY_VAR_PREFIX = "";
export const query = (recycledDB?: Surreal): QueryTagTemplateFunction => {
  return async (strings: string[], ...values: any[]) => {
    const db = recycledDB ? recycledDB : await getDB();
    try {
      const vals: Record<string, any> = {};
      for (let i = 0; i < values.length; i++) {
        vals[`${QUERY_VAR_PREFIX}${rn(i)}`] = values[i];
      }
      const str = [strings[0]];
      for (let i = 1; i < strings.length; i++) {
        str.push(`$${QUERY_VAR_PREFIX}${rn(i - 1)}`, strings[i]);
      }
      const string = str.join("");
      return db.query(string, vals);
    } finally {
      if (!recycledDB) {
        await db.close();
      }
    }
  };
};
// Usage: db.query(...q`SELECT * FROM ${TABLE_AGENT} WHERE id = ${id}`);
export const q = (strings: string[], ...values: any[]) => {
  const vals: Record<string, any> = {};
  for (let i = 0; i < values.length; i++) {
    vals[`${QUERY_VAR_PREFIX}${rn(i)}`] = values[i];
  }
  const str = [strings[0]];
  for (let i = 1; i < strings.length; i++) {
    str.push(`$${QUERY_VAR_PREFIX}${rn(i - 1)}`, strings[i]);
  }
  const string = str.join("");
  return [string, vals];
};

export const clearDB = async () => {
  const db = await getDB();
  try {
    for (const table of ALL_TABLES) {
      await db.delete(table);
    }
  } finally {
    await db.close();
  }
};
