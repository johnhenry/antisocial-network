import type {
  Agent,
  File,
  FileProto,
  LangchainGenerator,
  Post,
  PostPlus,
} from "@/types/mod";
import type { BaseMessageChunk } from "@langchain/core/messages";

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
import { embed, tokenize } from "@/lib/ai";

import { getDB, relate } from "@/lib/db";
import { isSlashCommand, trimSlashCommand } from "@/lib/util/command-format";
import processCommand from "@/lib/util/command";
import parsePostContent from "@/lib/util/parse-post-content";
import { createFiles } from "@/lib/database/file";
import createLog from "@/lib/database/log";
import { getEntity, getLatest } from "@/lib/database/helpers";
import { RecordId, StringRecordId } from "surrealdb.js";
import { agentResponse, updateAgent } from "@/lib/database/agent";
import { toolResponse } from "@/lib/database/tool";

import { replaceContentWithLinks } from "@/lib/database/helpers";

import hash from "@/lib/util/hash";

export const getConversation = async (
  post?: Post,
  depth: number = -1,
): Promise<Post[]> => {
  const db = await getDB();
  if (!post) {
    return [];
  }

  try {
    const posts = [];
    let currentPost = post;
    let count = 0;
    while (true) {
      if (depth > -1 && count >= depth) {
        break;
      }
      count++;
      posts.push(currentPost);
      if (!currentPost.target) {
        break;
      }
      const [[target]] = await db.query<[[Post]]>(
        `SELECT * FROM ${TABLE_POST} WHERE id = $target`,
        { target: currentPost.target.id },
      );
      currentPost = target;
    }
    return posts;
  } finally {
    await db.close();
  }
};

import { vectorSum } from "@/lib/util/vector-sum";

export const getRelevant = async ({
  conversation,
  agent,
  limit = 8,
  threshold = 0,
  embeddingMethod = "concat",
}: {
  conversation: Post[];
  agent: Agent;
  limit?: number;
  threshold?: number;
  embeddingMethod?: string;
}): Promise<Post[]> => {
  const queries = [];
  queries.push(
    `SELECT content, vector::similarity::cosine(embedding, $embedded) AS dist OMIT embedding FROM ${TABLE_POST} WHERE <-${REL_CONTAINS}<-${TABLE_FILE}<-${REL_BOOKMARKS}<-(${TABLE_AGENT} WHERE id = $id) AND dist > $threshold ORDER BY dist DESC LIMIT $limit`,
  );
  queries.push(
    `SELECT content, vector::similarity::cosine(embedding, $embedded) AS dist OMIT embedding FROM ${TABLE_POST} WHERE <-${REL_REMEMBERS}<-(${TABLE_AGENT} WHERE id = $id) AND dist > $threshold ORDER BY dist DESC LIMIT $limit`,
  );

  const db = await getDB();
  try {
    let embedded;
    switch (embeddingMethod) {
      case "concat":
        embedded = await embed(
          conversation
            .map(({ content }) => content)
            .join("\n\n"),
        );
        break;
      case "sum":
        embedded = vectorSum(conversation.map(({ embedding }) => embedding));
        break;
      case "sum-geometric-reduction":
        // Each embeding is multiplied by a decreasing factor before summing
        const factor = 0.9;
        const embeddings = conversation.map(({ embedding }, i) =>
          embedding.map((x) => x * Math.pow(factor, i))
        );
        break;
      case "sum-weighted":
        embedded = vectorSum(
          conversation.map(({ embedding }, i, conversation) =>
            embedding.map((x) =>
              x * (conversation.length - i + 1) / (conversation.length)
            )
          ),
        );
        break;
    }
    // TODO: what's a better way to get an embedding for a conversation?
    // Would we instead extract the embeddingd and add them?
    const [bookmarked, remembered] = await db.query<[Post[], Post[]]>(
      queries.join(";"),
      {
        id: agent.id,
        embedded,
        limit,
        threshold,
      },
    );
    return [...bookmarked, ...remembered];
  } finally {
    await db.close();
  }
};

///////
type RecursiveDescendantResult = [Post, RecursiveDescendantResult[]];
const recursiveQuery = `
    SELECT * FROM ${TABLE_POST}
    WHERE <-${REL_ELICITS}<-(${TABLE_POST} WHERE id = $id)
  `;
const recursiveDescendants = async (
  post: Post,
  depth: number = 1,
): Promise<RecursiveDescendantResult> => {
  if (depth === 0) {
    return [post, []];
  }

  const db = await getDB();
  try {
    const [descendants] = await db.query<Post[][]>(recursiveQuery, {
      id: post.id,
    });
    const results: RecursiveDescendantResult[] = await Promise.all(
      descendants.map(async (descendant: Post) =>
        recursiveDescendants(descendant, depth === -1 ? -1 : depth - 1)
      ),
    );
    return [post, results];
  } catch (error) {
    console.error("Error fetching descendants:", error);
    return [post, []];
  } finally {
    await db.close();
  }
};

export const createPost = async (
  content: string | undefined | false | null,
  {
    embedding,
    source,
    files = [],
    target,
    streaming = false,
    tool,
    depth = -1,
    container,
  }: {
    embedding?: number[];
    source?: Agent;
    files?: FileProto[];
    target?: Post;
    streaming?: boolean;
    tool?: string;
    depth?: number;
    container?: File;
  } = {},
): Promise<Post | void> => {
  const db = await getDB();
  try {
    let post: Post;
    const scanned: (string | [string, Agent])[] = [];
    const mentions: Agent[] = [];
    const tools: string[] = [];

    if (content) {
      // create a message
      if (isSlashCommand(content)) {
        processCommand(trimSlashCommand(content));
        return;
      } else {
        // create a post
        const parsed = await parsePostContent(content, scanned);
        const createdFiles = await createFiles({ files, owner: source });
        const contents = createdFiles.map(({ content }) => content);
        contents.unshift(parsed);
        const content_ = contents.join("\n");
        for (const scan of scanned) {
          if (typeof scan === "string") {
            tools.push(scan);
          } else {
            const [_, agent] = scan;
            mentions.push(agent);
          }
        }

        [post] = await db.create(TABLE_POST, {
          timestamp: Date.now(),
          content: parsed,
          embedding: embedding ? embedding : await embed(content_),
          count: tokenize(content_).length,
          hash: hash(content_),
          files: createdFiles,
          mentions,
          tools,
          source,
          target,
          container,
        }) as Post[];
      }
    } else if (content === null) {
      // temporary content will be created later.
      [post] = await db.create(TABLE_POST, {
        timestamp: Date.now(),
        embedding: await embed(""),
        source,
        target,
        container,
      }) as Post[];
    } else if (content === false) {
      // content will be generated by a tool or an agent.

      const conversation = await getConversation(target, -1);
      let relevant: Post[] = [];
      let content;
      if (tool) {
        content = await toolResponse(tool, {
          streaming,
          conversation,
        });
      } else if (source) {
        let relevant = await getRelevant(
          { conversation, agent: source },
        );
        if (!source.content) {
          source = await updateAgent(source.id);
        }
        const out = await agentResponse(source, {
          streaming,
          conversation,
          relevant,
        });
        if (streaming) {
          const chunks = [];
          for await (const chunk of out as LangchainGenerator) {
            chunks.push(chunk);
          }
          content = chunks.join("\n");
        } else {
          const chunk = out as BaseMessageChunk;
          content = chunk.content as string;
        }
      }

      [post] = await db.create(TABLE_POST, {
        timestamp: Date.now(),
        content,
        embedding: await embed(content),
        count: tokenize(content!).length,
        hash: hash(content!),
        source,
        target,
        tool,
        bibliography: conversation.concat(relevant),
      }) as Post[];
    } else if (!content) {
      // Content undefined, but files possibly provided.
      if (!files.length) {
        throw new Error("No content or files provided.");
      }
      const createdFiles = await createFiles({ files, owner: source });
      const contents = createdFiles.map(({ content }) => content);
      const content = contents.join("\n");
      [post] = await db.create(TABLE_POST, {
        timestamp: Date.now(),
        content: "",
        embedding: embedding ? embedding : await embed(content),
        count: tokenize(content).length,
        hash: hash(content),
        files: createdFiles,
        source,
        target,
        container,
      }) as Post[];
    } else {
      throw new Error("Invalid content provided.");
    }
    const next = async (depth = 0) => {
      if (depth === 0) {
        return;
      }
      depth -= 1;
      for (const source of mentions) {
        createPost(false, { source, target: post, depth, streaming });
      }
      for (const tool of tools) {
        createPost(false, { tool, target: post, depth, streaming });
      }
    };
    next(depth);
    createLog(post.id.toString());

    if (source) {
      await relate(source.id, REL_INSERTED, post.id);
    }
    if (target) {
      await relate(target.id, REL_ELICITS, post.id);
    }

    return post;
  } finally {
    await db.close();
  }
};

export const updatePendingPost = async (
  id: RecordId,
  {
    content,
    embedding,
    files = [],
    source,
  }: {
    content?: string;
    embedding?: number[];
    files?: FileProto[];
    source?: Agent;
  } = {},
): Promise<Post> => {
  if (!(content || "").trim()) {
    throw new Error("Content is required to update a post.");
  }
  const db = await getDB();
  try {
    const mentions: string[] = [];
    const content_ = await parsePostContent(content as string, mentions);
    const post = await db.update(id, {
      timestamp: Date.now(),
      hash: hash(content_),
      raw: content,
      content: content_,
      embedding: embedding ? embedding : await embed(content_),
      source,
    }) as Post;
    await createFiles({ files, owner: source });
    return post;
  } finally {
    await db.close();
  }
};

export const getPost = getEntity<Post>;
export const getPosts = getLatest<Post>(TABLE_POST);

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

export const getPostPlus = async (id: StringRecordId): Promise<PostPlus> => {
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
  const [
    [post],
    [before],
    [after],
    elicits,
    remembers,
  ]: [[Post], [Post], [Post], Post[], Agent[]] = await db
    .query(queries.join(";"), {
      id,
    });
  const obj: PostPlus = {
    post: await replaceContentWithLinks(post, true),
    before: before ? await replaceContentWithLinks(before) : undefined,
    after: after ? await replaceContentWithLinks(after) : undefined,
    elicits: elicits
      ? await Promise.all(
        elicits.filter((x) => x).map((post) => replaceContentWithLinks(post)),
      )
      : undefined,
    remembers,
  };
  try {
    return obj;
  } finally {
    await db.close();
  }
};

export default createPost;
