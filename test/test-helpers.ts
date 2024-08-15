import { getDB } from "@/lib/db";
import { RecordId } from "surrealdb.js";

export const deleteById = async (recordId: RecordId): Promise<boolean> => {
  const db = await getDB();
  try {
    await db.delete(recordId);
    return true;
  } catch (err) {
    return false;
  } finally {
    db.close();
  }
};
