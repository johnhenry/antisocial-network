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
export { getPost, getPosts } from "@/lib/database/helpers";
import { RecordId, StringRecordId } from "surrealdb.js";
import {
  agentResponse,
  aggregateResponse,
  updateAgent,
} from "@/lib/database/agent";
import { replaceContentWithLinks } from "@/lib/database/helpers";
import hash from "@/lib/util/hash";
import hashtags from "@/hashtags/mod";
import { tail } from "@/lib/util/forwards";
import { getBase64File } from "@/lib/database/file";
import { stringify } from "@/lib/message-format/index.mjs";
import vectorSum from "@/lib/util/vector-sum";
import { alertEntity } from "@/lib/database/mod";

export const TreeifyPosts = async (posts: Post[], { attachment = "summary" }: {
  attachment?: "summary" | "raw ";
} = {}): Promise<any[]> => {
  let tree: any[] = [];
  for (const post of posts) {
    // assign rendered object
    const renderedObject: Record<string, any> = {
      _: post.content,
      name: post.source?.name,
      id: post.source?.id.toString(),
      type: "text/plain ",
    };
    if (post.files && post.files.length) {
      renderedObject.attachments = [];
      for (const file of post.files) {
        renderedObject.attachments.push({
          _: attachment === "summary"
            ? `description of content: ${file.content}`
            : await (getBase64File(file.id)),
          name: file.name,
          type: file.type,
          id: file.id.toString(),
        });
      }
    }

    tree.unshift(renderedObject);
    tree = [tree];
  }
  return tree;
};

export const getConversation = async (
  post?: Post,
  { depth = -1 }: {
    depth?: number;
  } = {},
): Promise<any[]> => {
  const db = await getDB();
  if (!post) {
    return [];
  }

  try {
    const posts = [];
    let tree: any[] = [];
    let targetId = post.id;
    while (true) {
      const [[post]] = await db.query<[[Post]]>(
        `SELECT * FROM type::table($table) WHERE id = $targetId FETCH mentions, source, files, source`,
        { targetId, table: TABLE_POST },
      );
      if (!post) {
        break;
      }
      posts.push(post);
      if (depth > -1 && tree.length >= depth) {
        break;
      }
      targetId = post.target as unknown as RecordId;
    }
    return posts;
  } finally {
    await db.close();
  }
};

export const getRelevant = async ({
  posts,
  agent,
  limit = 8,
  threshold = 0,
  embeddingMethod = "concat",
}: {
  posts: Post[];
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
          posts.map(({ content }) => content).join("\n\n"),
        );
        break;
      // TODO: these alternate methods of embedding are not tested
      case "sum":
        embedded = vectorSum(posts.map(({ embedding }) => embedding));
        break;
      case "sum-geometric-reduction":
        // Each embeding is multiplied by a decreasing factor before summing
        const factor = 0.9;
        const embeddings = posts.map(({ embedding }, i) =>
          embedding.map((x) => x * Math.pow(factor, i))
        );
        embedded = vectorSum(embeddings);
        break;
      case "sum-weighted":
        embedded = vectorSum(
          posts.map(({ embedding }, i, posts) =>
            embedding.map(
              (x) => (x * (posts.length - i + 1)) / posts.length,
            )
          ),
        );
        break;
    }

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

const createContent = async (
  { target, source, streaming = false, bibliography = [], toolNames = [] }: {
    target?: Post;
    source?: Agent;
    streaming?: boolean;
    bibliography?: Post[];
    toolNames?: string[];
  } = {},
) => {
  if (!source) {
    throw new Error("Agent required");
  }
  const posts = await getConversation(target);
  const tree = await TreeifyPosts(posts);
  const conversation = stringify(tree, {
    indentation: 4 as unknown as string,
    showBoundry: false,
  }).trim();
  const fetchedRelevant = await getRelevant({
    posts,
    agent: source,
  });
  bibliography.push(...posts, ...fetchedRelevant);
  const relevant = fetchedRelevant.map(({ content }) => (content || "").trim())
    .join(
      "\n\n",
    ).trim();

  let content;
  let out;
  if (source) {
    if (conversation.length) {
    }
    if (!source.content) {
      source = await updateAgent(source.id, source);
    }
    let systemMessage;
    if (!conversation) {
      systemMessage = `{content}
Please say something interestingand relevant to your personality.
      `;
    }

    out = await agentResponse(source, {
      streaming,
      conversation,
      relevant,
      systemMessage,
      toolNames,
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
  return content;
};

export const generatePost = async ({
  tools,
  target,
  streaming = false,
  source,
  bibliography = [],
  depth,
  forward,
  toolNames = [],
}: {
  tools?: string[];
  target?: Post;
  streaming?: boolean;
  source?: Agent;
  bibliography?: Post[];
  depth?: number;
  forward?: Forward;
  toolNames?: string[];
}): Promise<Post> => {
  // content will be generated by a tool or an agent.
  const db = await getDB();
  try {
    const content = await createContent({
      target,
      bibliography,
      source,
      toolNames,
    });

    const post = (await createPost(content, {
      source,
      target,
      streaming,
      tools,
      bibliography,
      depth,
      forward,
    })) as Post;
    return post;
  } catch (e) {
    throw e;
  } finally {
    db.close();
  }
};

export const aggregatePostReplies = async ({
  source,
  target,
  streaming = false,
}: {
  source: Agent;
  target: Post;
  streaming?: boolean;
}): Promise<Post> => {
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
    const [post] = (await db.create(TABLE_POST, {
      timestamp: Date.now(),
      content,
      embedding: await embed(content),
      count: tokenize(content).length,
      hash: hash(content),
      source: source ? source.id : undefined,
      target: target ? target.id : undefined,
    })) as Post[];
    return replaceContentWithLinks(post);
  } finally {
    db.close();
  }
};

export const stringIdToAgent = async (id: string): Promise<Agent> => {
  const db = await getDB();
  try {
    const [[agent]] = await db.query<[[Agent]]>(
      `SELECT * FROM ${TABLE_AGENT} WHERE id = $id`,
      { id: new StringRecordId(id) },
    );
    return agent;
  } finally {
    await db.close();
  }
};

const firstNowRestLater = async (
  iterator: AsyncIterator<any>,
): Promise<[any | null, any[]]> => {
  const unprocessed: any[] = [];
  let value: any, done: boolean | undefined;
  do {
    ({ value, done } = await iterator.next());
  } while (!(done || value));
  const firstValue: any | null = value || null;
  setTimeout(async () => {
    do {
      ({ value, done } = await iterator.next());
      if (value) {
        unprocessed.push(value);
      }
    } while (!done);
    unprocessed.push(null);
  });
  return [firstValue, unprocessed];
};

const processContent = (
  content: string,
  {
    embedding,
    source,
    files = [],

    target,
    streaming = false,
    depth = 2 ** 2,
    dropLog = false,
    bibliography,
    forward = [],
  }: {
    embedding?: number[];
    source?: Agent;
    files?: FileProto[];

    target?: Post;
    streaming?: boolean;
    depth?: number;
    dropLog?: boolean;
    bibliography?: Post[];
    forward?: Forward;
  } = {},
): Promise<Post> => {
  return new Promise(async (rs, rj) => {
    if (depth === 0) {
      throw new Error("Depth limit reached.");
    }
    depth -= 1;
    let resolved = false;
    const resolve = (post: Post) => {
      if (!resolved) {
        rs(post);
        resolved = true;
      }
    };
    const reject = (e: unknown) => {
      if (!resolved) {
        rj(e);
        resolved = true;
      }
    };
    const db = await getDB();
    try {
      let tools: string[] = [];
      let post;
      let {
        original,
        dehydrated,
        sequential,
        simultaneous,
      }: {
        original?: string;
        dehydrated?: string;
        sequential?: Forward[];
        simultaneous?: Forward[];
      } = await parsePostContent(content, forward);
      const CONTEXT: any = {};
      CONTEXT.tools = tools;
      CONTEXT.original = original;
      CONTEXT.dehydrated = dehydrated;
      CONTEXT.sequential = sequential;
      CONTEXT.simultaneous = simultaneous;
      CONTEXT.embedding = embedding;
      CONTEXT.source = source;
      CONTEXT.files = files;
      CONTEXT.target = target;
      CONTEXT.streaming = streaming;
      CONTEXT.depth = depth;
      CONTEXT.dropLog = dropLog;
      CONTEXT.bibliography = bibliography;
      CONTEXT.forward = forward;
      CONTEXT.dehydrated = dehydrated;
      CONTEXT.original = original;
      for (let [tagname] of sequential) {
        tagname = tagname.slice(1);
        const [t, query] = (tagname as string).split("?");
        const hashtag = hashtags[t as string];
        if (!hashtag) {
          continue;
        }
        const { handler, name } = hashtag;
        CONTEXT.name = name;
        CONTEXT.query = query;
        [post] = await firstNowRestLater(await handler(CONTEXT));
        if (post) {
          resolve(post);
        }
      }
      if (!post) {
        post = (await createPost(CONTEXT.dehydrated, {
          embedding: CONTEXT.embedding,
          source: CONTEXT.source,
          files: CONTEXT.files,
          tools: CONTEXT.tools,
          target: CONTEXT.target,
          streaming: CONTEXT.streaming,
          depth: CONTEXT.depth,
          dropLog: CONTEXT.dropLog,
          bibliography: CONTEXT.bibliography,
          // forward: CONTEXT.simultaneous,
          noProcess: true,
        })) as Post;
        resolve(post);
      }
      if (post && CONTEXT.simultaneous && CONTEXT.simultaneous.length) {
        for (const sim of CONTEXT.simultaneous || []) {
          const source = await stringIdToAgent(sim[0] as string);
          const forward = tail(sim);
          createPost(CONTEXT.tools, {
            source,
            target: post,
            depth: CONTEXT.depth,
            streaming: CONTEXT.streaming,
            bibliography: CONTEXT.bibliography,
            forward,
          });
        }
      }
    } catch (e) {
      reject(e);
    } finally {
      await db.close();
    }
  });
};

import type { Forward } from "@/lib/util/forwards";

export const createPost = async (
  content: string | undefined | null | string[],
  {
    embedding,
    source,
    files = [],
    tools: inputTools, //remove
    target,
    streaming = false,
    depth = 2 ** 2,
    dropLog = false,
    bibliography,
    forward = [],
    logCreation = true,
    noProcess = false,
  }: {
    embedding?: number[];
    source?: Agent;
    files?: FileProto[];
    tools?: string[]; //remove
    target?: Post;
    streaming?: boolean;
    depth?: number;
    dropLog?: boolean;
    bibliography?: Post[];
    forward?: Forward;
    logCreation?: boolean;
    noProcess?: boolean;
  } = {},
): Promise<Entity | void> => {
  const db = await getDB();
  try {
    let post: Post;

    if (content && typeof content === "string" && !noProcess) {
      // create a message
      if (isSlashCommand(content)) {
        return processCommand(trimSlashCommand(content), {
          files,
          target,
          source,
          dropLog,
        });
      } else {
        // create a post from content
        post = await processContent(content, {
          embedding,
          source,
          files,
          target,
          streaming,
          depth,
          dropLog,
          bibliography,
          forward,
        });
      }
    } else if (content === null) {
      // temporary content will be created later.
      [post] = (await db.create(TABLE_POST, {
        timestamp: Date.now(),
        embedding: await embed(""),
        source: source ? source.id : undefined,
        target: target ? target.id : undefined,
        bibliography: bibliography
          ? bibliography.map(({ id }) => id)
          : undefined,
      })) as Post[];
    } else if (Array.isArray(content)) {
      // content will be generated by a tool or an agent.
      post = await generatePost({
        tools: inputTools,
        target,
        streaming,
        source,
        bibliography,
        depth,
        forward,
        toolNames: content,
      });
    } else if ((!content || noProcess)) {
      if (!content && !files.length) {
        throw new Error("No content or files provided.");
      }
      const createdFiles = await createFiles({ files, owner: source });
      const filesIds = createdFiles.map(({ id }) => id);
      const fileContent = createdFiles.map(({ content }) => content);
      const mentions: Agent[] = [];
      for (const sim of forward) {
        mentions.push(await stringIdToAgent(sim[0] as string));
      }
      const finalContent = content || "";
      const phantomContents = (
        content ? [content].concat(fileContent) : fileContent
      ).join("\n");
      [post] = (await db.create(TABLE_POST, {
        timestamp: Date.now(),
        content: finalContent || "",
        embedding: embedding ? embedding : await embed(phantomContents),
        count: tokenize(finalContent).length,
        hash: hash(phantomContents),
        files: filesIds,
        mentions: mentions.map(({ id }) => id),
        source: source ? source.id : undefined,
        target: target ? target.id : undefined,
        bibliography: bibliography
          ? bibliography.map(({ id }) => id)
          : undefined,
      })) as Post[];
    } else {
      throw new Error("Invalid content provided.");
    }

    if (source) {
      await relate(source.id, REL_INSERTED, post.id);
    }
    if (target) {
      await relate(target.id, REL_ELICITS, post.id);
    }
    const [[hydratedPost]] = await db.query<[[Post]]>(
      `SELECT * OMIT embedding FROM type::table($table) WHERE id = $id FETCH source, target`,
      {
        id: post.id,
        table: TABLE_POST,
      },
    );
    alertEntity(hydratedPost, { drop: !logCreation });
    return replaceContentWithLinks(hydratedPost);
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
    forward = [],
  }: {
    content?: string;
    embedding?: number[];
    files?: FileProto[];
    source?: Agent;
    forward?: Forward[];
  } = {},
): Promise<Post> => {
  if (!(content || "").trim()) {
    throw new Error("Content is required to update a post.");
  }
  const db = await getDB();
  try {
    // TODO: what to do with the rest of the data
    // sequential? original?,

    const {
      dehydrated,
    }: {
      original?: string;
      dehydrated?: string;
      sequential?: Forward[];
      simultaneous?: Forward[];
    } = await parsePostContent(content!, forward);
    const mentions: Agent[] = [];
    for (const sim of forward) {
      mentions.push(await stringIdToAgent(sim[0] as string));
    }
    const content_ = dehydrated;
    const post = (await db.update(id, {
      timestamp: Date.now(),
      hash: hash(content_),
      content: content_,
      embedding: embedding ? embedding : await embed(content_),
      source,
      mentions: mentions.map(({ id }) => id),
    })) as Post;
    await createFiles({ files, owner: source });
    return replaceContentWithLinks(post);
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

const ADDITIONAL_FIELDS =
  `string::concat("", id) as id, IF source IS NOT NULL AND source IS NOT NONE THEN {id:string::concat("", source.id), name:source.name, hash:source.hash, image:source.image} ELSE NULL END AS source
    `;

export const getPostPlus = async (id: StringRecordId): Promise<PostPlus> => {
  const queries = [];

  // select post
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding, data FROM post where id = $id FETCH source, target, target.files, target.mentions, target.bibliography, target.source, mentions, mentions.bibliography, bibliography, bibliography.mentions, files`,
  );
  // select incoming relationships
  // precedes
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding, data FROM post where ->${REL_PRECEDES}->(post where id = $id)`,
  );
  // // select outgoing relationships
  // // precedes
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding, data FROM post where <-${REL_PRECEDES}<-(post where id = $id) FETCH mentions, files`,
  );
  // // elicits
  queries.push(
    `SELECT *, ${ADDITIONAL_FIELDS} OMIT embedding, data FROM post where <-${REL_ELICITS}<-(post where id = $id) FETCH mentions, files, target.files`,
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
    const [[post], [before], [after], elicits, remembers, [container]]: [
      [Post],
      [Post],
      [Post],
      Post[],
      Agent[],
      [File],
    ] = await db.query(queries.join(";"), {
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
          elicits
            .filter((x) => x)
            .map((post) => replaceContentWithLinks(post, true)),
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

// export type Keeper = "mentions" | "hashtag" | "source" | "target" | "container";

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
    const [clone] = (await db.create(TABLE_POST, {
      timestamp: Date.now(),
      ...props,
    })) as Post[];
    return replaceContentWithLinks(clone);
  } finally {
    await db.close();
  }
};

export default createPost;
