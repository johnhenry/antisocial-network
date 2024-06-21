import { Surreal } from "surrealdb.js";
import {
  DB_PATH,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAMESPACE,
  DB_DATABASE,
} from "@/settings";
import { RecordId } from "surrealdb.js";

import {
  TABLE_AGENT,
  TABLE_MEME,
  TABLE_POST,
  SIZE_EMBEDDING_VECTOR,
} from "@/settings";

const INDEXED = [TABLE_AGENT, TABLE_MEME, TABLE_POST];

import { replaceNumber as rn } from "@/util/replace-char";

export const defineVectorSearchIndex = async (db: Surreal, table: string) => {
  // TODO: Investigate and fix
  // DEFINE queries seem to fail sanitization
  // Temporary Solution: use raw DEFINE queries
  const queries = [
    `DEFINE TABLE IF NOT EXISTS ${table} SCHEMALESS`,
    `DEFINE FIELD IF NOT EXISTS embedding ON TABLE ${table} TYPE array<number>`,
    `DEFINE INDEX IF NOT EXISTS search ON ${table} FIELDS embedding MTREE DIMENSION ${SIZE_EMBEDDING_VECTOR} DIST COSINE`,
    `INFO FOR TABLE ${table}`,
  ];
  try {
    const results = await db.query(queries.join(";"));
    // console.log("INFO", results[3]);
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      console.log(`table ${table} alreay defined`);
    } else {
      throw error;
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
  for (const table of INDEXED) {
    await defineVectorSearchIndex(db, table);
  }
  return db;
};

//Tag function that converts a query string into a sureal query

type QueryTagTemplateFunction<T = unknown> = (
  strings: string[],
  ...values: any[]
) => Promise<T>;

const QUERY_VAR_PREFIX = "";

export const query = (recycledDB?: Surreal): QueryTagTemplateFunction => {
  return async (strings: string[], ...values: any[]) => {
    const db = recycledDB ? recycledDB : await getDB();

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
  };
};

export const getAll = async (table: string) => {
  const db = await getDB();
  return await db.select(table);
};

export const relate = async (
  inn: RecordId,
  relationship: string,
  out: RecordId
) => {
  const db = await getDB();
  return await db.relate(inn, relationship, out);
};

export const unrelate = async (
  inn: RecordId,
  relationship: string,
  out: RecordId
): Promise<boolean> => {
  const db = await getDB();
  const [relationsip] = await query(
    db
  )`SELECT * FROM type::table(${relationship}) WHERE in = ${inn} AND out = ${out}`;
  if (!relationship) {
    return false;
  }
  await db.delete(relationsip.id);
  return true;
};
