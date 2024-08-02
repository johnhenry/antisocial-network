import type { Agent, Cron, Post } from "@/types/mod";
import { TABLE_CRON } from "@/config/mod";
import { getDB } from "@/lib/db";
import { RecordId } from "surrealdb.js";

import createPost from "@/lib/database/post";
import { CRONMOWER_ORIGIN } from "@/config/mod";

export const invokeCron = async (id: RecordId) => {
  const cron = await getCron(id);
  if (!cron) {
    throw new Error("Cron not found");
  }
  if (cron.on) {
    await createPost(cron.content, {
      source: cron.source,
      target: cron.target,
    });
  }
  return cron;
};

export const removeCron = async (id: RecordId) => {
  const db = await getDB();
  try {
    // jobs[id.toString()].stop();
    // delete jobs[id.toString()];
    await db.delete(id);
  } finally {
    db.close();
  }
};
export const getCron = async (id: RecordId) => {
  const db = await getDB();
  try {
    return await db.select<Cron>(id);
  } finally {
    db.close();
  }
};
export const cronState = async (
  on: boolean | null = true,
  ...cronIds: (RecordId<string>)[]
) => {
  let crons: Cron[] = [];
  const db = await getDB();
  try {
    if (!cronIds.length) {
      crons = await db.select<Cron>(TABLE_CRON);
    } else {
      crons = await Promise.all(cronIds.map((id) => db.select<Cron>(id)));
    }
    const query = `UPDATE type::table($table) SET on = $on WHERE id = $id`;

    for (const cron of crons) {
      const { id } = cron;
      const stringId = id.toString();
      await db.query(query, {
        on: !!on,
        id,
        table: TABLE_CRON,
      });
      if (on) {
        if (CRONMOWER_ORIGIN) {
          const body = cron.schedule;
          fetch(`${CRONMOWER_ORIGIN}/${stringId}`, { method: "Put", body });
        }
      } else {
        if (CRONMOWER_ORIGIN) {
          fetch(`${CRONMOWER_ORIGIN}/${stringId}`, { method: "Delete" });
        }
        if (on === null) {
          await removeCron(id as RecordId<string>);
        }
      }
    }
  } finally {
    db.close();
  }
};

export const createCron = async (
  { on = true, schedule, content, source, target, timezone = "+00:00" }: {
    on?: boolean;
    schedule?: string;
    content?: string;
    source?: Agent;
    target?: Post;
    timezone?: string;
  } = {},
): Promise<Cron> => {
  const db = await getDB();
  try {
    const [cron] = await db.create(TABLE_CRON, {
      timestamp: Date.now(),
      on,
      schedule,
      content,
      source: source ? source.id : undefined,
      target: target ? target.id : undefined,
      timezone,
    }) as Cron[];
    // if (on) {
    //   startCron(cron);
    // }
    return cron;
  } finally {
    db.close();
  }
};

export const getAllCron = async (): Promise<Cron[]> => {
  const db = await getDB();
  try {
    return await db.select<Cron>(TABLE_CRON);
  } finally {
    db.close();
  }
};

export default createCron;
