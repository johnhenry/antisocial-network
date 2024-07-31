//TODO: I think I can delete this?
"use server";
import type { Agent, Post, Setting } from "@/types/mod";
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
  TABLE_POST,
} from "@/config/mod";
import { embed } from "@/lib/ai";
import renderText from "@/lib/util/render-text";
import { recordMatch } from "@/lib/util/match";
import replaceMentions from "@/lib/util/replace-mentions";
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
  render: boolean = false,
  renderLinks: boolean = true,
): Promise<{ content?: string }> => {
  const content = render
    ? await renderText(item?.content || "")
    : (item?.content || "");

  item.content = await replaceMentions(
    content,
    async (mention: string) => {
      if (recordMatch.test(mention)) {
        const id = mention.slice(1);
        const [type] = id.split(":");
        const name = await replaceAgentIdWithName(id);
        return renderLinks
          ? `<a href="/${type}/${id}">${mention[0]}${name}</a>`
          : `${mention[0]}${name}`;
      }
      return mention;
    },
  );
  return item;
};

export const getFullPost = async (id: string): Promise<any> => {
  const queries = [];
  const ADDITIONAL_FIELDS =
    `string::concat("", id) as id, IF source IS NOT NULL AND source IS NOT NONE THEN {id:string::concat("", source.id), name:source.name, hash:source.hash, image:source.image} ELSE NULL END AS source`;
  // select target
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding, data FROM post where id = $id`,
  );
  // select incoming relationships
  // precedes
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding, data FROM post where ->${REL_PRECEDES}->(post where id = $id)`,
  );
  // // contains
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding, data FROM file where ->${REL_CONTAINS}->(post where id = $id)`,
  );
  // // inserted
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding, data FROM agent where ->${REL_INSERTED}->(post where id = $id)`,
  );
  // // responds
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding, data FROM post where ->${REL_ELICITS}->(post where id = $id)`,
  );
  // // select outgoing relationships
  // // precedes
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding, data FROM post where <-${REL_PRECEDES}<-(post where id = $id)`,
  );
  // // elicits
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding, data FROM post where <-${REL_ELICITS}<-(post where id = $id)`,
  );
  // // remembers
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding, data FROM agent where <-${REL_REMEMBERS}<-(post where id = $id)`,
  );

  const db = await getDB();
  try {
    const [
      [post],
      [before],
      [file],
      [agent],
      [responds],
      [after],
      elicits,
      remembers,
    ]: [[Post], [Post], [File], [Agent], [Post], [Post], Post[], Agent[]] =
      await db.query(
        queries.join(";"),
        {
          id: new StringRecordId(id),
        },
      );
    if (!post) {
      return {};
    }
    const obj = {
      post: await replaceContentWithLinks(post, true),
      before: before ? await replaceContentWithLinks(before) : undefined,
      file,
      agent,
      responds: responds ? await replaceContentWithLinks(responds) : undefined,
      after,
      elicits: await Promise.all(
        elicits.filter((x) => x).map((post) => replaceContentWithLinks(post)),
      ),
      remembers,
    };

    return obj;
  } finally {
    await db.close();
  }
};

export const getFullFile = async (id: string): Promise<any> => {
  const queries = [];
  const ADDITIONAL_FIELDS =
    `string::concat("", id) as id, IF source IS NOT NULL AND source IS NOT NONE THEN {id:string::concat("", source.id), name:source.name, hash:source.hash, image:source.image} ELSE NULL END AS source`;
  // select target
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding, data FROM file where id = $id`,
  );
  // select incoming relationships
  // precedes
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding, data from agent where ->${REL_BOOKMARKS}->(file where id = $id)`,
  );

  const db = await getDB();
  try {
    const [
      [file],
      bookmarked,
    ]: [[File], Agent[]] = await db.query(
      queries.join(";"),
      {
        id: new StringRecordId(id),
      },
    );
    if (!file) {
      return {};
    }
    const obj = {
      file,
      bookmarked,
    };

    return obj;
  } finally {
    await db.close();
  }
};

type Messages = [string, string][];

export const getPostWithHistory = async (
  post: any,
): Promise<[string, string][]> => {
  const db = await getDB();
  if (!post) {
    return [];
  }
  try {
    let currentPost = post;
    const messages: Messages = [];
    while (currentPost) {
      const [[agent]]: [Agent[]] = await db.query(
        `SELECT * FROM ${TABLE_AGENT} where ->${REL_INSERTED}->(post where id = $post)`,
        {
          post: currentPost.id,
        },
      );
      // messages.unshift([agent ? "assistant" : "user", currentPost.content]);
      messages.unshift([
        "user",
        (agent ? `[${agent.id.toString()}] :` : "") + currentPost.content,
      ]);

      [[currentPost]] = await db.query(
        `SELECT * FROM ${TABLE_POST} where ->${REL_ELICITS}->(post where id = $post)`,
        {
          post: currentPost.id,
        },
      );
    }
    return messages;
  } finally {
    await db.close();
  }
};

export const getMostAppropriateAgent = async (
  post: any,
  size: number = 1,
): Promise<any[]> => {
  const db = await getDB();
  try {
    if (post) {
      const embedded = await embed(post.content);
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
    const [bookmarked, remembered]: Post[][] = await db.query(
      `SELECT content, vector::similarity::cosine(embedding, $embedded) AS dist OMIT embedding FROM ${TABLE_POST} WHERE <-${REL_CONTAINS}<-${TABLE_FILE}<-${REL_BOOKMARKS}<-(${TABLE_AGENT} WHERE id = $id) ORDER BY dist DESC LIMIT 3;
      SELECT content, vector::similarity::cosine(embedding, $embedded) AS dist OMIT embedding FROM ${TABLE_POST} WHERE <-${REL_REMEMBERS}<-(${TABLE_AGENT} WHERE id = $id);`,
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
