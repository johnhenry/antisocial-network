// These exact instructions:
// Please create a javascript module exporting for every type <T>Ext, a function that maps <T> to <Text>
// Each given <T>.id can be turned into a string by calling <T>.id.toString().
// For fields that are in <T>, but not in <TExt>, please omit them.
// For fields that reference other types (like 'files' in Post referencing File[], which needs to become FileExt[] in PostExt)
// please recursively convert these as well.
// Use the "..." operator where it make sense to simplify the code.
//   - omit by destructuring the input object
//
// Use arrow function.
//
// Inject these exact instruction in a comment.

import { genRandSurrealQLString } from "@/lib/util/gen-random-string";

import type {
  Agent,
  AgentExt,
  AgentPlus,
  AgentPlusExt,
  Cron,
  CronExt,
  Entity,
  EntityExt,
  ErrorExt,
  File,
  FileExt,
  FilePlus,
  FilePlusExt,
  Log,
  LogExt,
  Post,
  PostExt,
  PostPlus,
  PostPlusExt,
  Relation,
  RelationExt,
} from "@/types/mod";

import type { RecordId } from "surrealdb.js";

export const mapErrorToErrorExt = (error: Error): ErrorExt => {
  const { name, message: content, cause } = error;
  const id = `${genRandSurrealQLString("error", ":")}`;
  const isError = true;
  return {
    timestamp: Date.now(),
    isError,
    id,
    name,
    content,
    cause,
  };
};

export const mapLogToLogExt = (agent: Log): LogExt => {
  const { id, ...rest } = agent;
  return {
    ...rest,
    id: id.toString(),
  };
};

export const mapAgentToAgentExt = (agent: Agent): AgentExt => {
  const { id, embedding, ...rest } = agent;
  return {
    ...rest,
    id: id.toString(),
  };
};

export const mapAgentPlusToAgentPlusExt = (
  agentPlus: AgentPlus,
): AgentPlusExt => {
  const {
    agent,
    remembered,
    bookmarked,
  } = agentPlus;

  return {
    agent: mapAgentToAgentExt(agent),
    remembered: remembered ? remembered.map(mapPostToPostExt) : undefined,
    bookmarked: bookmarked ? bookmarked.map(mapFileToFileExt) : undefined,
  };
};

export const mapFileToFileExt = (file: File): FileExt => {
  const { id, embedding, owner, ...rest } = file;
  return {
    ...rest,
    id: id.toString(),
    owner: owner ? mapAgentToAgentExt(owner) : undefined,
  };
};

export const mapFilePlusToFilePlusExt = (filePlus: FilePlus): FilePlusExt => {
  const {
    file,
    bookmarkers,
    excerpt,
  } = filePlus;
  return {
    file: mapFileToFileExt(file),
    bookmarkers: bookmarkers?.map(mapAgentToAgentExt),
    excerpt: excerpt ? mapPostToPostExt(excerpt) : undefined,
  };
};

export const mapPostToPostExt = (post: Post): PostExt => {
  const {
    id,
    embedding,
    files,
    mentions,
    target,
    source,
    bibliography,
    ...rest
  } = post;
  return {
    ...rest,
    id: id.toString(),
    files: files?.map(mapFileToFileExt),
    mentions: mentions?.map(mapAgentToAgentExt),
    target: target ? mapPostToPostExt(target) : undefined,
    source: source ? mapAgentToAgentExt(source) : undefined,
    bibliography: bibliography?.map(mapPostToPostExt),
  };
};

export const mapPostPlusToPostPlusExt = (postPlus: PostPlus): PostPlusExt => {
  const {
    post,
    before,
    after,
    elicits,
    remembers,
    container,
  } = postPlus;
  return {
    post: mapPostToPostExt(post),
    before: before ? mapPostToPostExt(before) : undefined,
    after: after ? mapPostToPostExt(after) : undefined,
    elicits: elicits?.map(mapPostToPostExt),
    remembers: remembers?.map(mapAgentToAgentExt),
    container: container ? mapFileToFileExt(container) : undefined,
  };
};

export const mapRelationToRelationExt = (
  relation: Relation,
): RelationExt => {
  const { id, in: inn, out, ...rest } = relation;
  return {
    id: id.toString(),
    in: inn.toString(),
    out: out.toString(),
    ...rest,
  };
};

export const mapCronToCronExt = (cron: Cron): CronExt => {
  const { id, source, target, ...rest } = cron;
  return {
    id: id.toString(),
    source: source ? mapAgentToAgentExt(source) : undefined,
    target: target ? mapPostToPostExt(target) : undefined,
    ...rest,
  };
};

export const mapEntityToEntityExt = (entity: Entity): EntityExt => {
  // Find entity's type
  // Note: some entities lack an id field, so we need to check for it
  const identifier = (entity as { id?: RecordId }).id?.toString();
  if (!identifier) {
    // This is an error
    return mapErrorToErrorExt(entity as Error);
  }
  const [type] = identifier.split(":");
  switch (type) {
    case "agent":
      return mapAgentToAgentExt(entity as Agent);
    case "file":
      return mapFileToFileExt(entity as File);
    case "post":
      return mapPostToPostExt(entity as Post);
    case "log":
      return mapLogToLogExt(entity as Log);
    case "cron":
      return mapCronToCronExt(entity as Cron);
      // case "relation":
    //   return mapRelationToRelationExt(entity as Relation);// TODO: shoud we add RelationExt to EntityExt?
    default:
      throw new Error(`Unknown type: ${type}`);
  }
};
