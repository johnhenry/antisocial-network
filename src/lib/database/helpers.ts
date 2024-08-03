import type { Agent, Entity, Post } from "@/types/mod";

import { getDB } from "@/lib/db";
import { StringRecordId } from "surrealdb.js";
import { TABLE_AGENT } from "@/config/mod";

import renderText from "@/lib/util/render-text";
import { recordMatch } from "@/lib/util/match";
import replaceMentions from "@/lib/util/replace-mentions";
import { embed } from "../ai";

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

export const replaceContentWithLinks = <
  T extends { content?: string; mentions?: Post[] },
>(
  item: T,
  render: boolean = false,
  useLink: boolean = true,
): T => {
  item.content = render ? renderText(item?.content || "") : item?.content || "";

  if (item.content && item.mentions && item.mentions.length > 0) {
    for (const mention of item.mentions as Agent[]) {
      const { id: rId, name } = mention;
      const id = rId.toString();
      item.content = item.content.replaceAll(
        new RegExp(`@${id}`, "g"),
        useLink ? `<a href="/agent/${id}">@${name}</a>` : `@${name}`,
      );
    }
  }
  return item;
};

export const getEntity = async <
  T extends { [x: string]: unknown; content?: string },
>(
  id: StringRecordId,
): Promise<T> => {
  const db = await getDB();
  try {
    const [table] = id.toString().split(":");
    const query = `SELECT *
          FROM type::table($table)
          WHERE hidden IS NOT true
          ORDER BY timestamp DESC
          FETCH source, target, target.mentions, target.bibliography, target.source,mentions, mentions.source, mentions.bibliography,mbibliography, bibliography.mentions, bibliography.source`;
    const [[entity]] = await db.query<[[T]]>(query, {
      id,
      table,
    });

    const result = await replaceContentWithLinks<T>(entity);

    return result;
  } finally {
    await db.close();
  }
};

// const ADDITIONAL_FIELDS =
//   `string::concat("", id) as id, IF source IS NOT NULL AND source IS NOT NONE THEN {id:string::concat("", source.id), name:source.name, hash:source.hash, image:source.image} ELSE NULL END AS source`;
// const OMIT_FIELDS = `embedding, data`;
// const embedded = search ? await embed(search) : undefined;
// const query = search
//   ? `SELECT *, vector::similarity::cosine(embedding, $embedded) AS dist, ${ADDITIONAL_FIELDS} OMIT ${OMIT_FIELDS} FROM type::table($table) WHERE embedding <|${size}|> $embedded ORDER BY dist DESC`
//   : `SELECT *, ${ADDITIONAL_FIELDS} OMIT ${OMIT_FIELDS} FROM type::table($table) ORDER BY timestamp DESC Limit ${size}`;

export const getLatest =
  <T extends { [x: string]: unknown; content?: string }>(table: string) =>
  async (
    start: number,
    limit: number,
    search: string = "",
  ): Promise<T[]> => {
    const db = await getDB();
    try {
      let result: T[];
      if (limit < 0) {
        const query = `SELECT *
          FROM type::table($table)
          WHERE hidden IS NOT true
          ORDER BY timestamp DESC
          FETCH source, target, target.mentions, target.bibliography, target.source,mentions, mentions.source, mentions.bibliography,mbibliography, bibliography.mentions, bibliography.source`;
        // return all
        [
          result,
        ] = await db.query(query, {
          table,
        });
      } else if (search) {
        const embedded = await embed(search);
        // const query = `SELECT *
        //     FROM type::table($table)
        //     ORDER BY timestamp DESC
        //     WHERE embedding <|${limit}|> $embedded
        //     ORDER BY vector::similarity::cosine(embedding, $embedded) DESC
        //     LIMIT $limit
        //     START $start
        // `;

        const query =
          `SELECT *, vector::similarity::cosine(embedding, $embedded) AS dist FROM type::table($table) WHERE embedding <|${limit}|> $embedded
          AND hidden IS NOT true
          ORDER BY dist DESC
          FETCH source, target, target.mentions, target.bibliography, target.source,mentions, mentions.source, mentions.bibliography,mbibliography, bibliography.mentions, bibliography.source`;
        // const query =
        //   `SELECT *, vector::similarity::cosine(embedding, $embedded) AS dist, ${""} OMIT ${""} FROM type::table($table) WHERE embedding <|${limit}|> $embedded ORDER BY dist DESC`;

        [
          result,
        ] = await db.query(query, {
          table,
          embedded,
          limit,
          start,
        }) as T[][];
      } else {
        const query = `
            SELECT *
            FROM type::table($table)
            WHERE hidden IS NOT true
            ORDER BY timestamp DESC
            LIMIT $limit
            START $start
            FETCH source, target, target.mentions, target.bibliography, target.source,mentions, mentions.source, mentions.bibliography,mbibliography, bibliography.mentions, bibliography.source`;
        [result] = await db.query(query, {
          table,
          limit,
          start,
        }) as T[][];
      }
      return Promise.all(
        result.map(async (item) => {
          const entity = item as T & { bibliography: Post[] };
          if (entity.bibliography) {
            entity.bibliography = entity.bibliography.map((mention) =>
              replaceContentWithLinks(mention, false, false)
            );
          }
          return await replaceContentWithLinks<T>(entity, true);
        }),
      );
    } finally {
      db.close();
    }
  };
