import { Surreal } from "surrealdb.js";
import {
  DB_PATH,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAMESPACE,
  DB_DATABASE,
} from "@/settings";

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
export default db;
