import type {
  Agent,
  AgentParameters,
  AgentPlus,
  AgentTemp,
  File,
  FileProto,
  LangchainGenerator,
  Post,
} from "@/types/mod";
import type { BaseMessageChunk } from "@langchain/core/messages";

import { respond } from "@/lib/ai";

import { mapPostsToMessages } from "@/lib/templates/dynamic";

export const toolResponse = async (
  tools: string[],
  { target, source, streaming = false, conversation = [] }: {
    target?: Post;
    source?: Agent;
    streaming?: boolean;
    conversation?: Post[];
  } = {},
): Promise<LangchainGenerator | BaseMessageChunk> => {
  // const messages = mapPostsToMessages(conversation);

  const messages = mapPostsToMessages(conversation);

  const content = await respond({
    messages,
    invocation: {
      id: source?.id.toString(),
      content: source?.content,
    },
    parameters: source?.parameters,
    streaming,
    target,
    source,
    tools,
  });
  if (streaming) {
    // TODO: split iterator here an add callback above
    return content as unknown as LangchainGenerator;
  }
  return { content } as unknown as BaseMessageChunk;
};
