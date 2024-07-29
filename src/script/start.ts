import { getDB, initialize } from "@/lib/db";
import { cronitialize } from "@/lib/database/cron";
const db = await getDB();
try {
  await initialize(db);
  await cronitialize(db);
} finally {
  await db.close();
}
