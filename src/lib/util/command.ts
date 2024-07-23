import parser from "yargs-parser";
import createLog from "@/lib/database/log";
import { Agent, Entity, FileProto, Post } from "@/types/mod";
import { createAgent } from "@/lib/database/agent";
import { createFile } from "@/lib/database/file";
import {
  aggregatePostReplies,
  createPost,
  generatePost,
  getPost,
} from "@/lib/database/post";
import {
  DEFAULT_PARAMETERS_AGENT,
  REL_BOOKMARKS,
  REL_ELICITS,
  REL_INSERTED,
  TABLE_AGENT,
} from "@/config/mod";
import { boolean } from "zod";
import { StringRecordId } from "surrealdb.js";
import { relate } from "@/lib/db";
import { getAgent } from "@/lib/database/agent";

/**
 * Parses a command string and returns the parsed result.
 *
 * @param command - The command string to parse.
 * @returns void.
 */

const agent = (
  [command, ...tokens]: (string | number)[],
  args: { [x: string]: any },
  { files, target, source, streaming }: CommandOptions,
) => {
  switch (command) {
    case "create":
      {
        return createAgent({
          name: args.name,
          description: args.description,
          qualities: args.quality.map((quality: string) => {
            return quality.split(":");
          }),
          files,
          parameters: { DEFAULT_PARAMETERS_AGENT, ...args.parameters },
        });
      }
      break;
    case "":
      {}
      break;
  }
};

const file = async (
  [command, ...tokens]: (string | number)[],
  args: { [x: string]: any },
  { files, target, source, streaming }: CommandOptions,
) => {
  switch (command) {
    case "create": {
      const newFile = await createFile({
        file: {
          type: args.type,
          name: args.name,
          content: Buffer.from(args.content).toString("base64"), //.replace(/^[^,]+,/, "")
          author: args.author,
          publisher: args.publisher,
          date: args.date,
        },
        owner: args.owner ? await getAgent(args.owner) : source,
      });
      await Promise.all(
        args.bookmarker.map(async (bookmarker: string) => {
          const agent = await getAgent(new StringRecordId(bookmarker));
          await relate(agent.id, REL_BOOKMARKS, newFile.id);
        }),
      );
      return newFile;
    }
    case "":
      {
      }
      break;
  }
};

const post = async (
  [command, ...tokens]: (string | number)[],
  args: { [x: string]: any },
  { files, target, source, streaming }: CommandOptions,
): Promise<Post | void> => {
  switch (command) {
    case "create":
      return await createPost(args.content, {
        source,
        files,
        target,
        depth: -1,
      });
    case "generate": {
      source = args.source
        ? (await getAgent(new StringRecordId(args.source)))
        : source;
      target = args.target
        ? (await getPost(new StringRecordId(args.target)))
        : target;
      const post = await generatePost({
        source: args.source
          ? await getAgent(new StringRecordId(args.source))
          : source,
        target: args.target
          ? await getPost(new StringRecordId(args.target))
          : target,
        tool: args.tool,
        streaming,
      });
      if (source) {
        await relate(source.id, REL_INSERTED, post.id);
      }
      if (target) {
        await relate(target.id, REL_ELICITS, post.id);
      }
      return post;
    }
    case "aggregate": {
      // aggregate best responses
      source = args.source
        ? await getAgent(new StringRecordId(args.source))
        : source;
      if (!source) {
        throw new Error("Source required");
      }
      target = args.target
        ? await getPost(new StringRecordId(args.target))
        : target;
      if (!target) {
        throw new Error("Target required");
      }
      const post = await aggregatePostReplies({
        source,
        target,
        streaming,
      });
      if (source) {
        await relate(source.id, REL_INSERTED, post.id);
      }
      if (target) {
        await relate(target.id, REL_ELICITS, post.id);
      }
      return post;
    }
  }
};

type CommandOptions = {
  files?: FileProto[];
  target?: Post;
  source?: Agent;
  streaming?: boolean;
};
/**
 * Options for the parser.
 */
const parserOptions: parser.Options = {
  coerce: { parameters: (x: string) => JSON.parse(x) },
  string: [
    "description",
    "content",
    "type",
    "author",
    "publisher",
    "date",
    "name",
    "owner",
    "source",
    "target",
  ],
  boolean: ["delete"],
  array: ["quality", "bookmarker"],
  default: {
    "delete": false,
    parameters: {},
    quality: [],
    bookmarker: [],
    content: "",
    type: "text/plain",
  },
  alias: {
    "description": ["d"],
    "name": ["n"],
    "author": ["a"],
    "publisher": ["p"],
    "parameters": ["P"],
    "quality": ["q"],
    "content": ["c"],
    "owner": ["o"],
    "bookmarker": ["b"],
    "source": ["s"],
    "target": ["t"],
  },
};
export const processCommand = async (
  command = "",
  options: CommandOptions,
): Promise<Entity | void> => {
  // createLog("command", { content: command });
  const { _: [root, ...tokens], ...args }: parser.Arguments = parser(
    command,
    parserOptions,
  );
  // TODO: Implenet command processing
  switch (root) {
    case "agent":
      return agent(tokens, args, options);
    case "file":
      return file(tokens, args, options);
    case "post":
      return post(tokens, args, options);
    default:
      throw new Error("Not implemented");
  }
};

export default processCommand;
