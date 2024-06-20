"use server";
import type { Agent } from "@/types/post_client";
import { getDB } from "@/lib/db";
import { TABLE_POST } from "@/settings";
import { parse } from "@/lib/quick-parse";
import { StringRecordId } from "surrealdb.js";
import { createFile } from "@/lib/actions.file";
import { embed } from "@/lib/ai";
import { getAgent } from "@/lib/actions.agent";
import { Post } from "@/types/post_client";
import { respond } from "@/lib/ai";
import hash from "@/util/hash";
// TODO: parse and embed mentions, links and other entities within the post content at creation time. This way @mentions can always point to the correct agent.

// POSTS
/**
 * Creates a new post in the database.
 * @param content - The content of the post.
 * @param options - Optional parameters for creating the post.
 * @param options.user_id - The ID of the user creating the post.
 * @param options.parent_id - The ID of the parent_id post, if any.
 * @returns A Promise that resolves to the newly created post.
 */
export const createPost = async (
  content: string,
  {
    user_id = null,
    parent_id = null,
    attachments = [],
  }: {
    user_id?: string | null;
    parent_id?: string | null;
    attachments?: any[];
  } = {}
) => {
  const db = await getDB();
  const files = [];
  for (const file of attachments) {
    files.push(await createFile(file));
  }
  const embedding = await embed(content);
  const [post] = await db.create(TABLE_POST, {
    timestamp: new Date().toISOString(),
    user_id,
    parent_id: parent_id ? new StringRecordId(parent_id) : null,
    hash: hash(content),
    content,
    embedding,
    attachments: files.map((file) => ({
      id: file.id,
      path: file.path,
      type: file.type,
    })),
  });
  if (user_id) {
    post.agent = await getAgent(user_id);
  }
  return parse(post);
};

const getRelevantKnowlede = async (messages, user_id) => {
  // TODO: Retrieve relevant knowledge from ideas
  // TODO: Retrieve relevant knowledge from user's posts/memories
  // TODO: Retrieve relevant knodledge from user's docs
  return "";
};

export const createPostAI = async ({
  user_id = null,
  parent_id = null,
}: {
  user_id?: string | null;
  parent_id?: string | null;
} = {}) => {
  // get messages from post and all parents
  const messages = [];
  if (parent_id) {
    let identifier = parent_id;
    do {
      const post = await getPost(identifier);
      messages.unshift([post.user_id ? "assistant" : "user", post.content]);
      identifier = post.parent_id;
    } while (identifier);
  }
  const relevantKnowledge = await getRelevantKnowlede(messages, user_id);
  // add system prompt to messages
  if (relevantKnowledge) {
    messages.unshift([
      "system",
      `You will use the following relevant knowledge to respond to the user:
${relevantKnowledge}`,
    ]);
  }
  // get system prompt from agent
  const { systemPrompt, name } = (await getAgent(user_id)) as unknown as Agent;
  messages.unshift(["system", systemPrompt]);
  messages.unshift([
    "system",
    `messages mentioning "@${name} are directed at you specifically."`,
  ]);
  // add relevant knowledge to messages
  const { content } = await respond(messages, { relevantKnowledge });

  return createPost(content, { user_id, parent_id });
};

/**
 * Gets post from database along with it's children
 *
 */
export const getPost = async (identifier: string, depth = 0) => {
  const db = await getDB();
  const id = new StringRecordId(identifier);
  const post = await db.select(id);
  post.children = [];
  if (depth > 0) {
    // get ids of all posts whose parent_id is the given id
    // const children = await db.select(TABLE_POST, {
    //   parent_id: id,
    // });
    const [children] = await db.query(
      "SELECT * FROM type::table($table) WHERE parent_id = $parent_id",
      {
        table: TABLE_POST,
        parent_id: id,
      }
    );

    for (const child of children as Post[]) {
      post.children.push(await getPost(child.id.toString(), depth - 1));
    }
  }
  if (post.user_id) {
    console.log("U", post.user_id);
    post.agent = await getAgent(post.user_id as string);
  }
  return parse(post);
};

export const getTopLevelPosts = async (hydrateUser = true) => {
  const db = await getDB();
  const [posts] = await db.query(
    "SELECT * FROM type::table($table) WHERE parent_id = $parent_id",
    {
      table: TABLE_POST,
      parent_id: null,
    }
  );
  if (hydrateUser) {
    const hydratedPosts = posts.map(async (post) => {
      post.agent = await getAgent(post.user_id);
      return post;
    });
    return parse(await Promise.all(hydratedPosts));
  }

  return parse(posts);
};

/**
 * Concatinate the content of a post and it's parent_ids into an array
 *
 */
export const getContext = async (identifier: string, height = Infinity) => {
  const context = [];
  do {
    const post = await getPost(identifier);
    context.unshift([post.user_id, post.content]);
    identifier = post.parent_id;
  } while (identifier && height-- > 0);
  return context;
};
