import { Surreal } from "surrealdb.js";
import {
  DB_PATH,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAMESPACE,
  DB_DATABASE,
} from "@/settings";
import { RecordId, StringRecordId } from "surrealdb.js";

import { replaceNumber as rn } from "@/util/replace-char";

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
  inn: RecordId | StringRecordId,
  relationship: string,
  out: RecordId | StringRecordId,
  data?: Record<string, any>
) => {
  const db = await getDB();
  return await db.relate(inn, relationship, out, data);
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
