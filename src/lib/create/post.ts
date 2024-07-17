import type { Agent, FileProto, Post } from "@/types/mod";

import { TABLE_POST } from "@/config/mod";
import { embed, tokenize } from "@/lib/ai";
import { getDB } from "@/lib/db";
import { isSlashCommand, trimSlashCommand } from "@/lib/util/command-format";
import processCommand from "@/lib/util/command";
import parsePostContent from "@/lib/util/parse-post-content";
import { createFiles } from "@/lib/create/file";
import hash from "@/lib/util/hash";

export const createPost = async (
  content: string | undefined | false,
  {
    embedding,
    source,
    files = [],
    target,
    streaming = false,
    tool,
    depth = -1,
  }: {
    embedding?: number[];
    source?: Agent;
    files?: FileProto[];
    target?: Post;
    streaming?: boolean;
    tool?: string;
    depth?: number;
  } = {},
): Promise<Post | void> => {
  const db = await getDB();
  try {
    let post: Post;
    const mentions: Agent[] = [];
    const tools: string[] = [];
    if (content) {
      // create a message
      if (isSlashCommand(content)) {
        processCommand(trimSlashCommand(content));
        return;
      } else {
        // create a post
        const parsed = parsePostContent(content, mentions, tools);
        const createdFiles = await createFiles({ files, source });
        const contents = createdFiles.map(({ content }) => content);
        contents.unshift(parsed);
        const content_ = contents.join("\n");
        [post] = await db.create(TABLE_POST, {
          timestamp: Date.now(),
          content: parsed,
          embedding: embedding ? embedding : await embed(content_),
          count: tokenize(content_).length,
          hash: hash(content_),
          files: createdFiles,
          mentions,
          source,
          target,
        }) as Post[];
      }
    } else if (content === undefined) {
      // create a post
      if (!files.length) {
        throw new Error("No content or files provided.");
      }
      const createdFiles = await createFiles({ files, source });
      const contents = createdFiles.map(({ content }) => content);
      const content = contents.join("\n");
      [post] = await db.create(TABLE_POST, {
        timestamp: Date.now(),
        content,
        embedding: embedding ? embedding : await embed(content),
        count: tokenize(content).length,
        hash: hash(content),
        files: createdFiles,
        mentions,
        source,
        target,
      }) as Post[];
    } else if (content === null) {
      // temporary content will be created later.
      [post] = await db.create(TABLE_POST, {
        timestamp: Date.now(),
        embedding: await embed(""),
        source,
        target,
      }) as Post[];
    } else if (content === false) {
      throw new Error("TODO: Implement");
      // const history = await getPostWithHistory(target, -1);
      // let content;
      // if (tool) {
      //   content = await toolResponse(tool, history);
      // } else if (source) {
      //   content = await agentResponse(source, history);
      // }

      // [post] = await db.create(TABLE_POST, {
      //   timestamp: Date.now(),
      //   content,
      //   embedding: await embed(content),
      //   count: tokenize(content).length,
      //   hash: hash(content),
      //   source,
      //   tool,
      // }) as Post[];
    } else {
      throw new Error("Invalid content provided.");
    }
    const next = async (depth = 0) => {
      if (depth === 0) {
        return;
      }
      depth -= 1;
      for (const tool of tools) {
        createPost("", { tool, target: post, depth, streaming });
      }
      for (const source of mentions) {
        createPost("", { source, target: post, depth, streaming });
      }
    };
    next(depth);
    return post;
  } finally {
    await db.close();
  }
};
export default createPost;
