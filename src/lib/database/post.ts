import type {
  Agent,
  Entity,
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
import { createLog } from "@/lib/database/log";
import { getEntity, getLatest } from "@/lib/database/helpers";
import { RecordId, StringRecordId } from "surrealdb.js";
import {
  agentResponse,
  aggregateResponse,
  updateAgent,
} from "@/lib/database/agent";
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
      let T = currentPost.target;
      // Target is actually a post id and not a post
      if ((currentPost.target as unknown as RecordId).tb) {
        [[T]] = await db.query<[[Post]]>(
          `SELECT * FROM ${TABLE_POST} WHERE id = $target`,
          { target: currentPost.target },
        );
      }
      currentPost = T;
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
        embedded = vectorSum(embeddings);
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

export const generatePost = async (
  { tools, target, streaming = false, source, bibliography, depth }: {
    tools?: string[];
    target?: Post;
    streaming?: boolean;
    source?: Agent;
    bibliography?: Post[];
    depth?: number;
  },
): Promise<Post> => {
  // content will be generated by a tool or an agent.

  const db = await getDB();
  try {
    bibliography = bibliography || [];
    const conversation = await getConversation(target, -1);
    let relevant: Post[] = [];
    let content;
    let mentions;
    let out;
    if (tools && tools.length) {
      out = await toolResponse(tools, {
        target,
        streaming,
        conversation,
        source,
      });
      // if (target?.source) {
      //   mentions = [target.source];
      // }
    } else if (source) {
      if (conversation.length) {
        relevant = await getRelevant(
          { conversation, agent: source },
        );
      }
      if (!source.content) {
        source = await updateAgent(source.id, source);
      }
      out = await agentResponse(source, {
        streaming,
        conversation,
        relevant,
      });
    }
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

    return createPost(content, {
      source,
      target,
      streaming,
      tools,
      bibliography: bibliography.concat(conversation).concat(relevant),
      depth,
    }) as Promise<Post>;
  } finally {
    db.close();
  }
};

export const aggregatePostReplies = async (
  { source, target, streaming = false }: {
    source: Agent;
    target: Post;
    streaming?: boolean;
  },
): Promise<Post> => {
  const db = await getDB();
  try {
    if (!source.content) {
      source = await updateAgent(source.id, source);
    }
    const out = await aggregateResponse(source, target, { streaming });
    let content;
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
    const [post] = await db.create(TABLE_POST, {
      timestamp: Date.now(),
      content,
      embedding: await embed(content),
      count: tokenize(content).length,
      hash: hash(content),
      source: source ? source.id : undefined,
      target: target ? target.id : undefined,
    }) as Post[];
    return replaceContentWithLinks(post);
  } finally {
    db.close();
  }
};

export const createPost = async (
  content: string | undefined | false | null,
  {
    embedding,
    source,
    files = [],
    tools: inputTools,
    target,
    streaming = false,
    depth = 2 ** 2,
    dropLog = false,
    bibliography,
  }: {
    embedding?: number[];
    source?: Agent;
    files?: FileProto[];
    tools?: string[];
    target?: Post;
    streaming?: boolean;
    depth?: number;
    dropLog?: boolean;
    bibliography?: Post[];
  } = {},
): Promise<Entity | void> => {
  const db = await getDB();
  try {
    let post: Post;
    const scanned: (string | [string, Agent])[] = [];
    const mentions: Agent[] = [];
    const tools: string[] = [];
    if (content) {
      // create a message
      if (isSlashCommand(content)) {
        return processCommand(trimSlashCommand(content), {
          files,
          target,
          source,
          dropLog,
        });
      } else {
        // create a post
        const parsed = await parsePostContent(content, scanned);
        const createdFiles = await createFiles({ files, owner: source });
        const contents = createdFiles.map(({ content }) => content);
        contents.unshift(parsed);
        const content_ = contents.join("\n");
        for (const scan of scanned) {
          if (typeof scan === "string") {
            tools.push(scan.slice(1));
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
          mentions: mentions && mentions.length
            ? mentions.map((post) => post.id)
            : undefined,
          tools: inputTools,
          source: source ? source.id : undefined,
          target: target ? target.id : undefined,
          bibliography: bibliography && bibliography.length
            ? bibliography.map((post) => post.id)
            : undefined,
        }) as Post[];
      }
    } else if (content === null) {
      // temporary content will be created later.
      [post] = await db.create(TABLE_POST, {
        timestamp: Date.now(),
        embedding: await embed(""),
        source: source ? source.id : undefined,
        target: target ? target.id : undefined,
        bibliography,
      }) as Post[];
    } else if (content === false) {
      // content will be generated by a tool or an agent.

      post = await generatePost({
        tools: inputTools,
        target,
        streaming,
        source,
        bibliography,
        depth,
      });
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
        source: source ? source.id : undefined,
        target: target ? target.id : undefined,
        bibliography,
      }) as Post[];
    } else {
      throw new Error("Invalid content provided.");
    }

    createLog(post, { drop: dropLog });
    if (source) {
      await relate(source.id, REL_INSERTED, post.id);
    }
    if (target) {
      await relate(target.id, REL_ELICITS, post.id);
    }
    const next = async (depth = 0) => {
      if (depth === 0) {
        return;
      }
      depth -= 1;
      if (tools && tools.length) {
        await createPost(false, {
          tools,
          target: post,
          depth,
          streaming,
          bibliography,
        });
      } else {
        for (const source of mentions) {
          await createPost(false, {
            source,
            target: post,
            depth,
            streaming,
            bibliography,
          });
        }
      }
    };
    next(depth);
    return replaceContentWithLinks(post);
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
    return replaceContentWithLinks(post);
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
    `string::concat("", id) as id, IF source IS NOT NULL AND source IS NOT NONE THEN {id:string::concat("", source.id), name:source.name, hash:source.hash, image:source.image} ELSE NULL END AS source
    `;
  // select target
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding, data FROM post where id = $id FETCH source, target.mentions, target.bibliography, target.source, mentions, mentions.bibliography, bibliography, bibliography.mentions`,
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

  // // container
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding, data FROM file where ->${REL_CONTAINS}->(post where id = $id)`,
  );

  const db = await getDB();
  try {
    const [
      [post],
      [before],
      [after],
      elicits,
      remembers,
      [container],
    ]: [[Post], [Post], [Post], Post[], Agent[], [File]] = await db
      .query(queries.join(";"), {
        id,
      });
    if (post.target) {
      post.target = replaceContentWithLinks(post.target);
    }

    const obj: PostPlus = {
      post: replaceContentWithLinks(post, true),
      before: before ? replaceContentWithLinks(before, true) : undefined,
      after: after ? replaceContentWithLinks(after, true) : undefined,
      elicits: elicits
        ? await Promise.all(
          elicits.filter((x) => x).map((post) =>
            replaceContentWithLinks(post, true)
          ),
        )
        : undefined,
      remembers,
      container,
    };

    return obj;
  } finally {
    await db.close();
  }
};
const CLONE_FORBIDDEN_KEYS = ["id", "timestamp"];

// export type Keeper = "mentions" | "tools" | "source" | "target" | "container";

export type Keeper = string;

export const clonePost = async (
  post: Post,
  keep?: Keeper[],
  update: Partial<Post> = {},
): Promise<Post> => {
  // const props: Omit<Post, "id" | "timestamp"> = {
  //   content: post.content,
  //   embedding: post.embedding,
  //   count: post.count,
  //   hash: post.hash,
  // };
  const props: Record<string, any> = {
    content: post.content,
    embedding: post.embedding,
    count: post.count,
    hash: post.hash,
  };
  for (const k of keep || []) {
    if (CLONE_FORBIDDEN_KEYS.includes(k)) {
      throw new Error(`Cannot keep$ ${k} in clone.`);
    }
    if (!(k in post)) {
      throw new Error(`Property ${k} not found in post.`);
    }
    props[k as keyof Post] = post[k as keyof Post];
  }
  if (update.source) {
    props.source = update.source;
  }
  const db = await getDB();
  try {
    const [clone] = await db.create(TABLE_POST, {
      timestamp: Date.now(),
      ...props,
    }) as Post[];
    return replaceContentWithLinks(clone);
  } finally {
    await db.close();
  }
};

export default createPost;
