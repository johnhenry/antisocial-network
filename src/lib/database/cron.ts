import type { Agent, Cron, Post } from "@/types/mod";
import type { Surreal } from "surrealdb.js";
import { TABLE_CRON } from "@/config/mod";
import { getDB } from "@/lib/db";
import { RecordId } from "surrealdb.js";
import { CronJob } from "cron";

const jobs: { [key: string]: CronJob } = {};
import createPost from "@/lib/database/post";


const invoke = async (cron: Cron) => {
  await createPost(cron.content, {
    source: cron.source,
    target: cron.target,
  });
  return cron;
};

export const invokeCron = async (id: RecordId) => {
  return await invoke(await getCron(id));
};

// const startCron = async (cron: Cron) => {
//   CronJob.from({
//     cronTime: cron.schedule,
//     onTick: () => {
//       invoke(cron);
//     },
//     start: true,
//     timeZone: cron.timezone,
//   });
// };
// let CHRONITIALIZED: boolean = false;

// export const cronitialize = async (db: Surreal) => {
//   if (CHRONITIALIZED) {
//     return;
//   }
//   CHRONITIALIZED = true;
//   const crons = await db.select<Cron>(TABLE_CRON);
//   crons.forEach((cron) => {
//     if (cron.on) {
//       startCron(cron);
//     }
//   });
// };
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
  let crons: (RecordId<string>)[] = [];
  const db = await getDB();
  try {
    if (!cronIds.length) {
      crons = (await db.select<Cron>(TABLE_CRON)).map(({ id }) => id);
    } else {
      crons = cronIds;
    }
    const query = `UPDATE type::table($table) SET on = $on WHERE id = $id`;

    for (const ID of crons) {
      await db.query(query, {
        on: !!on,
        id: ID,
        table: TABLE_CRON,
      });
      // const id = ID.toString();
      if (on) {
        // jobs[id].start();
      } else {
        // jobs[id].stop();
        if (on === null) {
          await removeCron(ID as RecordId<string>);
        }
      }
    }
  } finally {
    db.close();
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
