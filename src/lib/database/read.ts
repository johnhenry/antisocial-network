"use server";
import type { Agent, Meme, Setting } from "@/types/types";
import { RecordId, StringRecordId } from "surrealdb.js";
import { getDB } from "@/lib/db";
import {
  REL_BOOKMARKS,
  REL_CONTAINS,
  REL_ELICITS,
  REL_INSERTED,
  REL_PRECEDES,
  REL_REMEMBERS,
  TABLE_AGENT,
  TABLE_FILE,
  TABLE_MEME,
} from "@/settings";

import { embed } from "@/lib/ai";
import { recordMatch } from "@/util/match";
import replaceMentions from "@/util/replace-mentions";
export const getEntity = async <T>(id: string): Promise<T> => {
  const db = await getDB();
  try {
    return (await db.select(new StringRecordId(id))) as T;
  } finally {
    await db.close();
  }
};
export const getFile = getEntity;

export type Relationship = {
  table: string;
  relationship: string;
  results: any[];
};

const replaceContentWithLinks = async (
  item: { content?: string },
): Promise<{ content?: string }> => {
  recordMatch;
  item.content = await replaceMentions(
    item.content || "",
    async (mention: string) => {
      if (recordMatch.test(mention)) {
        const id = mention.slice(1);
        const [type] = id.split(":");
        const name = await replaceAgentIdWithName(id);
        return `<a href="/${type}/${id}">${mention[0]}${name}</a>`;
      }
      return mention;
    },
  );
  return item;
};

export const getFullMeme = async (id: string): Promise<any> => {
  const queries = [];
  // select target
  queries.push(
    `SELECT *, string::concat("", id) as id OMIT embedding, data FROM meme where id = $id`,
  );
  // select incoming relationships
  // precedes
  queries.push(
    `SELECT *, string::concat("", id) as id OMIT embedding, data FROM meme where ->${REL_PRECEDES}->(meme where id = $id)`,
  );
  // // contains
  queries.push(
    `SELECT *, string::concat("", id) as id OMIT embedding, data FROM file where ->${REL_CONTAINS}->(meme where id = $id)`,
  );
  // // inserted
  queries.push(
    `SELECT *, string::concat("", id) as id OMIT embedding, data FROM agent where ->${REL_INSERTED}->(meme where id = $id)`,
  );
  // // responds
  queries.push(
    `SELECT *, string::concat("", id) as id OMIT embedding, data FROM meme where ->${REL_ELICITS}->(meme where id = $id)`,
  );
  // // select outgoing relationships
  // // precedes
  queries.push(
    `SELECT *, string::concat("", id) as id OMIT embedding, data FROM meme where <-${REL_PRECEDES}<-(meme where id = $id)`,
  );
  // // elicits
  queries.push(
    `SELECT *, string::concat("", id) as id OMIT embedding, data FROM meme where <-${REL_ELICITS}<-(meme where id = $id)`,
  );
  // // remembers
  queries.push(
    `SELECT *, string::concat("", id) as id OMIT embedding, data FROM agent where <-${REL_REMEMBERS}<-(meme where id = $id)`,
  );

  const db = await getDB();
  try {
    const [
      [meme],
      [before],
      [file],
      [agent],
      [responds],
      [after],
      elicits,
      remembers,
    ]: [[Meme], [Meme], [File], [Agent], [Meme], [Meme], Meme[], Agent[]] =
      await db.query(
        queries.join(";"),
        {
          id: new StringRecordId(id),
        },
      );
    const obj = {
      meme: await replaceContentWithLinks(meme),
      before,
      file,
      agent,
      responds,
      after,
      elicits,
      remembers,
    };

    return obj;
  } finally {
    await db.close();
  }
};

export const getEntityWithReplationships = async (
  identifier: string,
  {
    source = "meme",
    inn = [],
    out = [],
  }: {
    source?: string;
    inn?: Record<any, any>[];
    out?: Record<any, any>[];
  } = {},
) => {
  const db = await getDB();
  try {
    const output: { default: any; inn: Relationship[]; out: Relationship[] } = {
      default: null,
      inn: [],
      out: [],
    };
    const id = new StringRecordId(identifier);
    const [[d]]: [any[]] = await db.query(
      `SELECT *, string::concat("", id) as id OMIT embedding, data FROM ${source}`,
      {
        meme: id,
      },
    );
    output.default = d;
    for (const { table, relationship } of inn) {
      const [results]: [any[]] = await db.query(
        `SELECT * OMIT embedding, data FROM ${table} where <-${relationship}<-(${source} where id = $meme)`,
        {
          meme: id,
        },
      );
      if (results.length) {
        output.inn.push({ table, relationship, results });
      }
    }
    for (const { table, relationship } of out) {
      const [results]: [any[]] = await db.query(
        `SELECT * OMIT embedding, data FROM ${table} where ->${relationship}->(${source} where id = $meme)`,
        {
          meme: id,
        },
      );
      if (results.length) {
        output.out.push({ table, relationship, results });
      }
    }
    return output;
  } finally {
    await db.close();
  }
};

type Messages = [string, string][];

export const getMemeWithHistory = async (
  meme: any,
): Promise<[string, string][]> => {
  const db = await getDB();
  if (!meme) {
    return [];
  }
  try {
    let currentMeme = meme;
    const messages: Messages = [];
    while (currentMeme) {
      const [[agent]]: [Agent[]] = await db.query(
        `SELECT * FROM ${TABLE_AGENT} where ->${REL_INSERTED}->(meme where id = $meme)`,
        {
          meme: meme.id,
        },
      );
      messages.unshift([agent ? "assistant" : "user", meme.content]);
      [[currentMeme]] = await db.query(
        `SELECT * FROM ${TABLE_MEME} where ->${REL_PRECEDES}->(meme where id = $meme)`,
        {
          meme: meme.id,
        },
      );
    }
    return messages;
  } finally {
    await db.close();
  }
};

export const getMostAppropriateAgent = async (
  meme: any,
  size: number = 1,
): Promise<any[]> => {
  const db = await getDB();
  try {
    if (meme) {
      const embedded = await embed(meme.content);
      const query =
        `SELECT id, vector::similarity::cosine(embedding, $embedded) AS dist OMIT embedding FROM type::table($table) WHERE embedding <|1|> $embedded ORDER BY dist DESC LIMIT 1`;
      const [agents]: [any[]] = await db.query(query, {
        table: TABLE_AGENT,
        embedded,
      });
      return agents;
    } else {
      const query =
        `SELECT id FROM type::table($table) ORDER BY RAND() LIMIT 1`;
      const [agents]: [any[]] = await db.query(query, {
        table: TABLE_AGENT,
      });
      return agents;
    }
  } finally {
    await db.close();
  }
};

export const getRelevantKnowlede = async (
  messages: [string, string][],
  agent: string,
) => {
  const flatMessages = messages
    .map(([user, message]) => `${user}:${message}`)
    .join("\n\n");
  const embedded = await embed(flatMessages);
  const db = await getDB();
  try {
    const [bookmarked, remembered]: Meme[][] = await db.query(
      `SELECT content, vector::similarity::cosine(embedding, $embedded) AS dist OMIT embedding FROM ${TABLE_MEME} WHERE <-${REL_CONTAINS}<-${TABLE_FILE}<-${REL_BOOKMARKS}<-(${TABLE_AGENT} WHERE id = $id) ORDER BY dist DESC LIMIT 3;
      SELECT content, vector::similarity::cosine(embedding, $embedded) AS dist OMIT embedding FROM ${TABLE_MEME} WHERE <-${REL_REMEMBERS}<-(${TABLE_AGENT} WHERE id = $id);`,
      {
        id: new StringRecordId(agent), // TODO: I think this can this just be a string
        embedded,
      },
    );
    return [...remembered, ...bookmarked]
      .map(({ content }) => content)
      .join("\n\n");
  } catch {
    return [];
  } finally {
    await db.close();
  }
};

export const getAllAgents = async (): Promise<Agent[]> => {
  const db = await getDB();
  try {
    return (
      await db.query(`SELECT * OMIT embedding FROM ${TABLE_AGENT}`)
    )[0] as Agent[];
  } finally {
    await db.close();
  }
};

export const replaceAgentNameWithId = async (
  name: string,
): Promise<string | null> => {
  const db = await getDB();
  try {
    const [[agent]]: Agent[][] = await db.query(
      `SELECT id FROM ${TABLE_AGENT} WHERE name = $name`,
      {
        name,
      },
    );
    return agent ? agent.id.toString() : name;
  } finally {
    await db.close();
  }
};

export const replaceAgentIdWithName = async (
  id: string,
): Promise<string | null> => {
  const db = await getDB();
  try {
    const [[agent]]: Agent[][] = await db.query(
      `SELECT name FROM ${TABLE_AGENT} WHERE id = $id`,
      {
        id: new StringRecordId(id),
      },
    );
    return agent ? agent.name : id;
  } finally {
    await db.close();
  }
};
export const getSettings = async (): Promise<Setting[]> => {
  const db = await getDB();
  try {
    // Fetch current settings
    const currentSettings = (await db.select(
      new StringRecordId("settings:current"),
    )) as unknown as { data: Setting[] };
    return currentSettings.data;
  } catch (error) {
    console.error("Error reading settings:", error);
    return [];
  } finally {
    // Close the connection
    db.close();
  }
};

export const getSettingsObject = async (): Promise<
  Record<string, string | undefined>
> => {
  const protoSettings: Setting[] = await getSettings();
  // transform into object with name:defaultValue
  const settings = protoSettings.reduce((acc, setting) => {
    acc[setting.name] = setting.defaultValue;
    return acc;
  }, {} as Record<string, string | undefined>);
  return settings || {};
};
