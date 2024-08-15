import type { Agent, File, Log, Post } from "@/types/mod";
import { RecordId } from "surrealdb.js";
import { getDB } from "@/lib/db";
import { StringRecordId } from "surrealdb.js";
import { TABLE_AGENT, TABLE_FILE, TABLE_LOG, TABLE_POST } from "@/config/mod";
import renderText from "@/lib/util/render-text";
import { embed } from "@/lib/ai";

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
  T extends { content?: string; mentions?: Agent[] },
>(
  item: T,
  render: boolean = false,
  useLink: boolean = true,
): T => {
  item.content = render ? renderText(item?.content || "") : item?.content || "";
  if (item.content && item.mentions && item.mentions.length > 0) {
    for (const mention of item.mentions) {
      const { id: rId } = mention;
      const id = rId.toString();
      if (!mention.name) {
        continue;
      }
      item.content = item.content.replaceAll(
        new RegExp(`${id}`, "g"),
        useLink
          ? `<a href="/agent/${id}" title="${mention.content}">@${mention.name}</a>`
          : `@${mention.name}`,
      );
    }
  }
  return item;
};

const getEntity = async <
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
          FETCH source, target, files, target.mentions, target.bibliography, target.source,mentions, mentions.source, mentions.bibliography, bibliography, bibliography.mentions, bibliography.source`;
    const [[entity]] = await db.query<[[T]]>(query, {
      id,
      table,
    });
    if (!entity) {
      throw new Error(`Entity not found: ${id}`);
    }

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

const getLatest =
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
          FETCH source, target, files, target.mentions, target.bibliography, target.source,mentions, mentions.source, mentions.bibliography, bibliography, bibliography.mentions, bibliography.source`;
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
          FETCH source, target, files, target.mentions, target.bibliography, target.source,mentions, mentions.source, mentions.bibliography, bibliography, bibliography.mentions, bibliography.source`;
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
            FETCH source, target, files, target.mentions, target.bibliography, target.source,mentions, mentions.source, mentions.bibliography, bibliography, bibliography.mentions, bibliography.source`;
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

export const deleteEntityById = async (
  recordId: RecordId,
): Promise<boolean> => {
  const db = await getDB();
  try {
    // TODO: I believe all relationships are deleted, but I should investigate further
    const table = recordId.tb;
    const deletionTransaction = [];
    switch (table) {
      case "agent":
        // CRON
        // remove agent id from Cron
        deletionTransaction.push(
          `UPDATE cron SET agent = NONE WHERE agent = $recordId`,
        );
        // POSTS
        // remove source id from Posts
        deletionTransaction.push(
          `UPDATE post SET source = NONE WHERE source = $recordId`,
        );
        // remove mentions id from Posts
        deletionTransaction.push(
          `UPDATE post SET mentions = array::remove(mentions, array::find_index(mentions, $recordId)) WHERE mentions CONTAINS $recordId`,
        );
        // FILES
        // remove owner id from Files
        deletionTransaction.push(
          `UPDATE file SET owner = NONE WHERE owner = $recordId`,
        );
        // delete target agent
        deletionTransaction.push(`DELETE $recordId`);
        break;
      case "post":
        // TARGET POSTS
        // find all posts that that have this id as a target and update them to remove the target
        deletionTransaction.push(
          `UPDATE post SET target = NONE WHERE target = $recordId`,
        );
        // CRON
        // remove post id from Cron
        deletionTransaction.push(
          `UPDATE cron SET post = NONE WHERE post = $recordId`,
        );
        // BIBLIOGRAPHY
        // find all post that have this id in the bibliography and update them to remove the bibliography
        deletionTransaction.push(
          `UPDATE post SET bibliography = array::remove(bibliography, array::find_index(bibliography, $recordId)) WHERE bibliography CONTAINS $recordId`,
        );
        // POST
        deletionTransaction.push(`DELETE $recordId`);
        break;
      case "file":
        // delete target file
        deletionTransaction.push(`DELETE $recordId`);
        break;
      default:
        deletionTransaction.push(`DELETE $recordId`);
    }
    await db.query(deletionTransaction.join(";"), {
      recordId,
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  } finally {
    db.close();
  }
};
export const getLogs = getLatest<Log>(TABLE_LOG);
export const getFile = getEntity<File>;
export const getFiles = getLatest<File>(TABLE_FILE);
export const getAgent = getEntity<Agent>;
export const getAgents = getLatest<Agent>(TABLE_AGENT);
export const getPost = getEntity<Post>;
export const getPosts = getLatest<Post>(TABLE_POST);
