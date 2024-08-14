import type { Log } from "@/types/mod";
import { TABLE_ERROR } from "@/config/mod";
import { getDB } from "@/lib/db";
export { getLogs } from "@/lib/database/helpers";

export const createLogError = async (
  error: Error,
  metadata?: Record<string, any>,
) => {
  const db = await getDB();
  try {
    return await db.create(TABLE_ERROR, {
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack,
      metadata,
    }) as Log[];
  } finally {
    db.close();
  }
};
