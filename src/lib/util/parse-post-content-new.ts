import type { Forward } from "@/lib/util/forwards";

import { Agent, AgentTemp } from "@/types/mod";
import { recordMatch } from "@/lib/util/match";
import { getDB } from "@/lib/db";
import { replaceAndAccumulate } from "@/lib/util/replace-mentions";
import replaceMentions from "@/lib/util/replace-mentions";
import { TABLE_AGENT } from "@/config/mod";
import { createTempAgent, nameExists } from "@/lib/database/agent";
import { StringRecordId } from "surrealdb.js";
import { docSort, head, MENTION_MATCH, merge, tail } from "@/lib/util/forwards";
import replaceAll from "@/lib/util/replace-all";
import { PROMPTS_SUMMARIZE } from "@/lib/templates/static";
import { summarize } from "@/lib/ai";
const getAgentIdFromName = async (name: string): Promise<`agent:${string}`> => {
  if (name.startsWith("agent:")) {
    return confirmAgentId(name);
  }
  const db = await getDB();
  try {
    const [[agent]]: [[{ id: `agent:${string}` }]] = await db.query(
      `SELECT string::concat("", id) as id FROM type::table($table) WHERE name = $name`,
      {
        table: TABLE_AGENT,
        name,
      },
    );
    if (agent) {
      return agent.id;
    }
    const temp = await createTempAgent({ name });
    return temp.id.toString() as `agent:${string}`;
  } finally {
    await db.close();
  }
  // return `agent:${name}`;
};
const confirmAgentId = async (id: string): Promise<`agent:${string}`> => {
  if (!id.startsWith("agent:")) {
    return getAgentIdFromName(id);
  }
  const rid = new StringRecordId(id);
  const db = await getDB();
  try {
    const [[agent]]: [[{ id: `agent:${string}` }]] = await db.query(
      `SELECT string::concat("", id) as id FROM type::table($table) WHERE id = $id`,
      {
        table: TABLE_AGENT,
        id: rid,
      },
    );
    if (agent) {
      return agent.id;
    }
    const [_, id_suffix] = id.split(":");
    const name = await summarize(
      id_suffix,
      PROMPTS_SUMMARIZE.LLM_NAME_FROM_RANDOM,
    );
    const newAgent = await createTempAgent({ name, id_suffix });
    return newAgent.id.toString() as `agent:${string}`;
  } finally {
    await db.close();
  }
  // return `agent:${name}`;
};

const fix = (forwards: Forward[], doc: string) => {
  const splitForwords = [];
  for (const forward of forwards) {
    const H = head(forward);
    const T = tail(forward);
    for (const h of H) {
      const item = [h];
      if (T) {
        item.push(T);
      }

      splitForwords.push(item);
    }
  }
  const orderedForwords = splitForwords.sort(([a], [b]) => {
    if (typeof a !== "string" || typeof b !== "string") {
      throw new Error("Expected string");
    }
    if (a.startsWith("#") && !b.startsWith("#")) {
      return -1;
    }
    if (b.startsWith("#") && !a.startsWith("#")) {
      return 1;
    }
    return docSort(doc)(a, b);
  });

  const mergedForwards = orderedForwords.reduce((p, current) => {
    const previous = p.pop();
    if (!previous) {
      p.push(current);
    } else {
      if (previous[0] === current[0]) {
        p.push(merge(previous as Forward, current, doc));
      } else {
        p.push(previous);
        p.push(current);
      }
    }
    return p;
  }, []);

  const sequential = [];
  const simultaneous = [];

  for (const [head, tail] of mergedForwards) {
    const item = [head];
    if (tail) {
      item.push(tail);
    }
    if ((head as string).startsWith("#")) {
      sequential.push(item);
    } else {
      simultaneous.push(item);
    }
  }
  return [sequential, simultaneous];
};

export const processPost = async (original: string, startingForward:Forward=[]) => {
  const match = new RegExp(MENTION_MATCH.source, MENTION_MATCH.flags);
  const forwards: Forward[] = [];
  if(startingForward){
    forwards.push(startingForward);
  }
  const dehydrated = await replaceAll(
    original,
    match,
    async (exec?: RegExpExecArray) => {
      const { padStart = "", padEnd = "" } = exec!.groups as {
        padStart: string;
        padEnd: string;
      };
      const forward: Exclude<Forward, string[]> = [];
      let current: Exclude<Forward, string[]> = forward;
      let prev: Exclude<Forward, string[]>;
      const groups = exec![0].split("|");
      let groupcount: number = groups.length;
      for (const group of groups) {
        for (let match of group.split(",")) {
          match = match.trim();
          if (match.startsWith("#")) {
            current.push(match);
          } else {
            if (match.startsWith("@")) {
              match = match.slice(1);
            }
            const id = await getAgentIdFromName(match);
            current.push(id);
          }
        }
        if (((groupcount -= 1) > 0)) {
          prev = current;
          current = [];
          prev.push(current);
        }
      }
      forwards.push(forward);
      return `${padStart}${head(forward).join(",")}${padEnd}`;
    },
  );

  const [sequential, simultaneous] = fix(forwards, dehydrated);
  return {original, dehydrated, sequential, simultaneous};
};

export const blankPost = async (
  original: string,
  { mentions = false, hashtags = false }: {
    mentions?: boolean | string[];
    hashtags?: boolean | string[];
  } = {},
):Promise<string> => {
  const match = new RegExp(MENTION_MATCH.source, MENTION_MATCH.flags);
  const blanked = await replaceAll(
    original,
    match,
    async (exec?: RegExpExecArray) => {
      const { padStart = "", padEnd = "" } = exec!.groups as {
        padStart: string;
        padEnd: string;
      };
      const match = exec![0].trim();
      if (match.startsWith("#") && hashtags) {
        if (hashtags === true) {
          return "";
        }
        if (hashtags.includes(match)) {
          return "";
        }
      } else if (mentions) {
        if (mentions === true) {
          return "";
        }
        if (mentions.includes(match)) {
          return "";
        }
      }
      return `${padStart}${exec![0]}${padEnd}`;
    },
  );
  return blanked;
};

export default processPost;
