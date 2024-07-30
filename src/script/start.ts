import { getDB, initialize } from "@/lib/db";
const db = await getDB();
try {
  await initialize(db);
} finally {
  await db.close();
}
