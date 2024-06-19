import { Surreal } from "surrealdb.js";
import {
  DB_PATH,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAMESPACE,
  DB_DATABASE,
} from "@/settings";

export const getDB = async () => {
  const db = new Surreal();
  // Connect to the database
  await db.connect(DB_PATH);
  // Select a specific namespace / database
  await db.use({
    namespace: DB_NAMESPACE,
    database: DB_DATABASE,
  });
  // Signin as a namespace, database, or root user
  await db.signin({
    username: DB_USERNAME,
    password: DB_PASSWORD,
  });
  return db;
};

//Tag function that converts a query string into a sureal query
export const query = async (strings: string[], ...values: any[]) => {
  const db = await getDB();
  const vals: Record<string, any> = {};
  for (let i = 0; i < values.length; i++) {
    vals[`$${i}`] = values[i];
  }
  const str = [strings[0]];
  for (let i = 1; i < strings.length; i++) {
    str.push(`$${i - 1}`, strings[i]);
  }
  const string = str.join("");
  return db.query(string, vals);
};

export default await getDB();
