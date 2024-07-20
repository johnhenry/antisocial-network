import type { Log } from "@/types/mod";
import { print as printToConsole } from "@/lib/util/logging";
import { TABLE_LOG } from "@/config/mod";
import { getDB } from "@/lib/db";

export const createLog = async (
  target: string,
  { type = "created", content, metadata, print = true, drop = false }: {
    type?: string;
    content?: string;
    print?: boolean;
    drop?: boolean;
    metadata?: JSON;
  } = {},
): Promise<Log | void> => {
  if (drop) {
    return;
  }
  const db = await getDB();
  try {
    const [log] = await db.create(TABLE_LOG, {
      target,
      type,
      content: content ? content : `${type}: ${target}`,
      metadata,
    }) as Log[];
    if (print) {
      printToConsole(log);
    }
    return log;
  } finally {
    db.close();
  }
};

export default createLog;
