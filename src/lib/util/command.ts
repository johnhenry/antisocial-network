import parser from "yargs-parser";
import createLog from "@/lib/database/log";
import {
  Agent,
  AgentTemp,
  Entity,
  FileProto,
  Log,
  Post,
  RecordIdEphemeral,
} from "@/types/mod";
import { createAgent, createTempAgent } from "@/lib/database/agent";
import { createFile } from "@/lib/database/file";
import {
  aggregatePostReplies,
  clonePost,
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

const agent = async (
  [command, ...tokens]: (string | number)[],
  args: { [x: string]: any },
  { files, target, source, streaming }: CommandOptions,
): Promise<Agent | AgentTemp | void> => {
  switch (command) {
    case "create": {
      if (args.temporary) {
        return createTempAgent({ name: args.name, context: args.content });
      }

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
    default:
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
        chunk: args.chunk,
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
import type { Keeper } from "@/lib/database/post";

const post = async (
  [command, ...tokens]: (string | number)[],
  args: { [x: string]: any },
  { files, target, source, streaming, keep }: CommandOptions,
): Promise<Entity | void> => {
  switch (command) {
    case "clone":
      source = args.source
        ? (await getAgent(new StringRecordId(args.source)))
        : source;
      target = args.target
        ? (await getPost(new StringRecordId(args.target)))
        : target;
      return await clonePost(target as Post, keep, { source });
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
        tools: args.tool,
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
    case "merge": {
      // merge responses
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

const generateEphemeralId = (tb = "log"): RecordIdEphemeral => ({
  tb,
  id: "",
  toString() {
    return `${tb}:`;
  },
});

const debug = async (
  [command, ...tokens]: (string | number)[],
  args: { [x: string]: any },
  { files, target, source, streaming, keep }: CommandOptions,
): Promise<Log | void> => {
  switch (command) {
    case "redirect":
      return {
        id: generateEphemeralId("log"),
        timestamp: Date.now(),
        type: "redirect",
        target: "",
        metadata: {
          url: tokens[0],
          force: args.force,
        },
        content: args.content,
      };
    default:
      break;
  }
};

type CommandOptions = {
  files?: FileProto[];
  target?: Post;
  source?: Agent;
  streaming?: boolean;
  keep?: Keeper[];
  dropLog?: boolean;
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
    "chunk",
  ],
  boolean: ["delete", "chunk", "force"],
  array: ["quality", "bookmarker", "keep", "temporary", "tool"],
  default: {
    "delete": false,
    parameters: {},
    quality: [],
    bookmarker: [],
    content: "",
    type: "text/plain",
    keep: [],
    chunk: true,
    force: false,
    temporary: true,
    tool: [],
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
    "temporary": ["T"],
    "keep": ["k"],
    "chunk": ["C"],
    "force": ["F"],
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
    case "debug":
      return await debug(tokens, args, options);
    default:
      throw new Error(`Not implemented: ${root}`);
  }
};

export default processCommand;
