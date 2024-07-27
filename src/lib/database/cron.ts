import type { Agent, Cron, Post } from "@/types/mod";
import { TABLE_CRON } from "@/config/mod";
import { getDB } from "@/lib/db";
import { StringRecordId } from "surrealdb.js";
import { CronJob } from "cron";
const jobs: { [key: string]: CronJob } = {};
import createPost from "@/lib/database/post";

let CHRONITIALIZED: boolean = false;
export const cronitialize = async (db) => {
  if (CHRONITIALIZED) {
    return;
  }
  CHRONITIALIZED = true;
  const crons = await db.select<Cron>(TABLE_CRON);
  crons.forEach((cron) => {
    jobs[cron.id.toString()] = CronJob.from({
      cronTime: cron.schedule,
      onTick: () => {
        createPost(cron.content, {
          source: cron.source,
          target: cron.target,
        });
      },
      start: cron.on,
      timeZone: cron.timezone,
    });
  });
};
export const removeCron = async (cron: Cron) => {
  const db = await getDB();
  try {
    if (cron) {
      jobs[cron.id.toString()].stop();
      delete jobs[cron.id.toString()];
      await db.delete(cron.id);
    }
  } finally {
    db.close();
  }
};
export const cronState = async (
  on: boolean | null = true,
  ...crons: Cron[]
) => {
  if (!crons.length) {
    const db = await getDB();
    try {
      crons = await db.select<Cron>(TABLE_CRON);
    } finally {
      db.close();
    }
  }
  for (const cron of crons) {
    if (cron) {
      const id = cron.id.toString();
      if (on = true) {
        jobs[id].start();
      } else if (on = false) {
        jobs[id].stop();
      } else if (on = null) {
        jobs[id].stop();
        delete jobs[id];
        await removeCron(cron);
      }
    }
  }
};

export const createCron = async (
  { on = true, schedule, content, source, target, timezone }: {
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
      source,
      target,
      timezone,
    }) as Cron[];
    jobs[cron.id.toString()] = CronJob.from({
      cronTime: cron.schedule,
      onTick: () => {
        createPost(content, { source, target });
      },
      start: cron.on,
      timeZone: timezone,
    });
    return cron;
  } finally {
    db.close();
  }
};

export default createCron;
