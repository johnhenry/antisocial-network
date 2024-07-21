import type { Agent } from "@/types/mod";

import { getDB } from "@/lib/db";
import { StringRecordId } from "surrealdb.js";
import { TABLE_AGENT } from "@/config/mod";

import renderText from "@/lib/util/render-text";
import { recordMatch } from "@/lib/util/match";
import replaceMentions from "@/lib/util/replace-mentions";

export const replaceAgentIdWithName = async (
  id: string,
): Promise<string | null> => {
  const db = await getDB();

  try {
    try {
      const [[agent]]: Agent[][] = await db.query(
        `SELECT name FROM ${TABLE_AGENT} WHERE id = $id`,
        {
          id: new StringRecordId(id),
        },
      );
      return agent ? agent.name : id;
    } catch (e) {
      console.error(e);
      return id;
    }
  } finally {
    await db.close();
  }
};

export const replaceContentWithLinks = async <T extends { content?: string }>(
  item: T,
  render: boolean = false,
): Promise<T> => {
  const content = render
    ? await renderText(item?.content || "")
    : item?.content || "";

  item.content = await replaceMentions(content, async (mention: string) => {
    if (recordMatch.test(mention)) {
      const id = mention.slice(1);
      const [type] = id.split(":");
      const name = await replaceAgentIdWithName(id);
      return `<a href="/${type}/${id}">${mention[0]}${name}</a>`;
    }
    return mention;
  });
  return item;
};

export const getEntity = async <
  T extends { [x: string]: unknown; content?: string },
>(
  id: StringRecordId,
): Promise<T> => {
  const db = await getDB();
  try {
    return replaceContentWithLinks<T>(await db.select<T>(id) as T);
  } finally {
    await db.close();
  }
};

export const getLatest =
  <T extends { [x: string]: unknown; content?: string }>(table: string) =>
  async (
    offset: number,
    limit: number,
  ): Promise<T[]> => {
    const db = await getDB();
    try {
      const query = `
            SELECT *
            FROM ${table}
            ORDER BY timestamp DESC
            LIMIT ${limit}
            START ${offset}
        `;

      const [result] = await db.query(query) as T[][];
      return Promise.all(
        result.map((item) => replaceContentWithLinks<T>(item)),
      );
    } finally {
      db.close();
    }
  };
