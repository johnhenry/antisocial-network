import type {
  Agent,
  AgentExt,
  File,
  FileExt,
  Post,
  PostExt,
} from "@/types/mod";

const convertPostToExt = (post: Post): PostExt => {
  const { id, embedding, files, mentions, target, source, ...rest } = post;
  return {
    ...rest,
    id: id.toString(),
    files: files?.map(convertFileToExt),
    mentions: mentions?.map(convertAgentToExt),
    target: target && convertPostToExt(target),
    source: source && convertAgentToExt(source),
  };
};

const convertFileToExt = (file: File): FileExt => {
  const { id, embedding, owner, ...rest } = file;
  return {
    ...rest,
    id: id.toString(),
    owner: owner && convertAgentToExt(owner),
  };
};

const convertAgentToExt = (agent: Agent): AgentExt => {
  const { id, embedding, ...rest } = agent;
  return {
    ...rest,
    id: id.toString(),
  };
};

export { convertAgentToExt, convertFileToExt, convertPostToExt };
