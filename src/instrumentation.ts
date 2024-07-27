import { getDB, initialize } from "@/lib/db";
import { StringRecordId } from "surrealdb.js";
import { cronitialize } from "@/lib/database/cron";
export const register = () => {
  // cronitialize();
  // console.log("DB INTIALIZATION...");
  // const db = await getDB();
  // try {
  //   if (!(await db.select(new StringRecordId("settings:current")))) {
  //     await initialize(db);
  //     console.log("DB INITIALIZED");
  //   } else {
  //     console.log("DB ALREADY INITIALIZED");
  //   }
  // } finally {
  //   await db.close();
  // }
};
