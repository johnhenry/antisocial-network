import parser from "yargs-parser";
import type { Keeper } from "@/lib/database/post";
import type {
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
} from "@/config/mod";
import { RecordId, StringRecordId } from "surrealdb.js";
import { relate } from "@/lib/db";
import { getAgent } from "@/lib/database/agent";
import { createCron, cronState, invokeCron } from "@/lib/database/cron";
/**
 * Parses a command string and returns the parsed result.
 *
 * @param command - The command string to parse.
 * @returns void.
 */

export const agent = async (
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
        qualities: args.quality && args.quality.length
          ? args.quality.map((quality: string) => {
            return quality.split(":");
          })
          : undefined,
        files,
        parameters: { DEFAULT_PARAMETERS_AGENT, ...args.parameters },
      });
    }
    default:
      break;
  }
};

export const file = async (
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
      // TODO: why does this not happen automatically
      await Promise.all(
        args.bookmarker.map(async (bookmarker: string) => {
          const agent = await getAgent(new StringRecordId(bookmarker));
          await relate(agent.id, REL_BOOKMARKS, newFile.id);
        }),
      );
      return newFile;
    }
  }
};

export const post = async (
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

export const cron = async (
  [command, ...tokens]: (string | number)[],
  args: { [x: string]: any },
  { files, target, source, streaming }: CommandOptions,
): Promise<Entity | void> => {
  switch (command) {
    case "create": {
      source = args.source
        ? await getAgent(new StringRecordId(args.source))
        : source;
      if (!source) {
        throw new Error("Source required");
      }
      target = args.target
        ? await getPost(new StringRecordId(args.target))
        : target;
      return await createCron({
        content: args.content,
        schedule: tokens[0] as string,
        on: !args.off,
        target,
        source,
      });
    }
    case "fire": {
      return await invokeCron(
        new StringRecordId(tokens[0] as string) as unknown as RecordId,
      );
    }
    case "set": {
      return cronState(
        !args.delete ? null : !args.off,
        new StringRecordId(tokens[0] as string) as unknown as RecordId,
      );
    }
  }
};
const generateEphemeralId = (tb = "log"): RecordIdEphemeral => ({
  tb,
  id: "",
  toString() {
    return `${tb}:`;
  },
  toJSON() {
    return JSON.stringify({ tb, "id": "" });
  },
});

export const debug = async (
  [command, ...tokens]: (string | number)[],
  args: { [x: string]: any },
  { files, target, source, streaming, keep }: CommandOptions,
): Promise<Log | void> => {
  switch (command) {
    case "go":
    default:
      return {
        id: generateEphemeralId("log"),
        timestamp: Date.now(),
        type: "redirect",
        target: generateEphemeralId("post"),
        metadata: {
          url: tokens[0],
          force: args.force,
        },
        content: args.content,
      };
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
    "yes",
    "no",
  ],
  boolean: ["delete", "chunk", "force", "off"],
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
    off: false,
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
  const { _: [root, ...tokens], ...args }: parser.Arguments = parser(
    command,
    parserOptions,
  );
  switch (root) {
    case "agent":
      return agent(tokens, args, options);
    case "file":
      return file(tokens, args, options);
    case "post":
      return post(tokens, args, options);
    case "cron":
      return cron(tokens, args, options);
    case "debug":
      return await debug(tokens, args, options);
    default:
      throw new Error(`Not implemented: ${root}`);
  }
};

export default processCommand;
