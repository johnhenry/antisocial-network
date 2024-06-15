"use server";

import db from "@/lib/db";
import { TABLE_POST } from "@/settings";
import { parse } from "@/lib/quick-parse";
import { StringRecordId } from "surrealdb.js";
import { createFile } from "@/lib/actions.file";
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
    user_id,
    parent_id,
    attachments = [],
  }: {
    user_id: string | undefined;
    parent_id: string | undefined;
    attachments: any[];
  } = {}
) => {
  const files = [];
  for (const file of attachments) {
    files.push(await createFile(file));
  }
  const [post] = await db.create(TABLE_POST, {
    timestamp: new Date().toISOString(),
    user_id,
    parent_id: parent_id ? new StringRecordId(parent_id) : null,
    content,
    attachments: files.map((file) => ({
      id: file.id,
      path: file.path,
      type: file.type,
    })),
  });
  return parse(post);
};

/**
 * Gets post from database along with it's children
 *
 */
export const getPost = async (identifier: string, depth = 0) => {
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

    //
    for (const child of children) {
      post.children.push(await getPost(child.id.toString(), depth - 1));
    }
  }
  return parse(post);
};

export const getTopLevelPosts = async () => {
  const [posts] = await db.query(
    "SELECT * FROM type::table($table) WHERE parent_id = $parent_id",
    {
      table: TABLE_POST,
      parent_id: null,
    }
  );
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
