import type { Entity, Log, LogExt } from "@/types/mod";
import { print as printToConsole } from "@/lib/util/logging";
import { TABLE_LOG } from "@/config/mod";
import { getDB } from "@/lib/db";
import { getLatest } from "@/lib/database/helpers";
import { mapLogToLogExt } from "@/lib/util/convert-types";

export const sendNotification = (log: Log) => {
  const HOST = "http://localhost:3000";
  fetch(`${HOST}/api/notifications`, {
    body: JSON.stringify(mapLogToLogExt(log)),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const createLog = async (
  target: Exclude<Entity, void | Error>,
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
      timestamp: Date.now(),
      target: target.id,
      type,
      content: content ? content : `${type}: ${target}`,
      metadata,
    }) as Log[];
    sendNotification(log);
    const l = { ...log, id: log.id.toString() };
    const separator = "--".repeat(30);
    printToConsole(separator);
    printToConsole(`[${new Date(log.timestamp)}]`, `[${log.id.toString()}]`);
    if (log["metadata"]) {
      printToConsole("[metadata]  ", log.metadata);
    }
    printToConsole(l.content);
    printToConsole(separator);
    return log;
  } finally {
    db.close();
  }
};

export const getLogs = getLatest<Log>(TABLE_LOG);

export default createLog;
