import type { DescriptorFull } from "@/hashtools/types";

// import { encode as gpt3Encoder } from "gpt-3-encoder";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { Ollama as OllamaLangchain } from "@langchain/community/llms/ollama";
import type { BaseMessageChunk } from "@langchain/core/messages";
import type { ChatPromptValueInterface } from "@langchain/core/prompt_values";
import { ChatGroq } from "@langchain/groq";
import { OpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { Ollama } from "ollama";
import { OllamaFunctions } from "@langchain/community/experimental/chat_models/ollama_functions";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { MODEL_FUNCTIONS, OLLAMA_ORIGIN } from "@/config/mod";
import { JsonOutputFunctionsParser } from "@langchain/core/output_parsers/openai_functions";
import { getSettingsObject } from "@/lib/database/settings";
import { RunnableLike } from "@langchain/core/runnables";
import { getEncoding } from "js-tiktoken";
import { genRandSurrealQLString } from "@/lib/util/gen-random-string";
// import TOOLS from "@/tools/handlers";
import TOOLS from "@/hashtools/mod";
import { Agent, Post } from "@/types/mod";
import { PROMPTS_SUMMARIZE } from "@/lib/templates/static";

type FunctionDescriptor = {
  name: string;
  description: string;
  parameters: Record<string, any>;
};

type FunctionsForOllama = {
  functions?: FunctionDescriptor[];
  function_call?: {
    name: string;
  };
};

type Invoker =
  | ChatGroq
  | OpenAI
  | ChatAnthropic
  | ChatOllama;

import { langchainToOllama } from "@/lib/util/message-format";

export const respondT = async (
  {
    messages = [],
    invocation = {},
    parameters = {},
    streaming = false,
    tools = [],
    target,
    source,
  }: {
    messages?: [string, string][];
    invocation?: Record<string, any>;
    parameters?: Record<string, any>;
    streaming?: boolean;
    tools?: string[];
    target?: Post;
    source?: Agent;
  } = {},
): Promise<
  BaseMessageChunk | AsyncGenerator<BaseMessageChunk, void, unknown>
> => {
  const settings = await getSettingsObject();
  const [repo, model] = (parameters?.model || settings.modeltools).split("::");
  const arg: Record<any, any> = {
    ...parameters,
    model,
  };

  const id = target?.source?.id.toString();

  const ollamaMessages = (messages || []).map(langchainToOllama);

  const responses = [];
  const ollama = new Ollama({
    host: OLLAMA_ORIGIN,
  });
  for (const toolname of tools) {
    const currentTool: DescriptorFull | undefined = TOOLS[toolname];

    if (currentTool) {
      const { name, handler, description } = currentTool;
      const response = await ollama.chat({
        model,
        messages: ollamaMessages,
        // tools: [currentTool], // TODO: remove
      });
      if (response.message.tool_calls) {
        for (const tool of response.message.tool_calls) {
          try {
            const functionResponse = await handler(
              tool.function.arguments,
            ); // TODO: overhaul-tools:  Update this call
            // Add function response to the conversation
            // I actuallly might move this functioality alltogether.
            responses.push(`[${name}] ${functionResponse}`);
          } catch (e) {
            responses.push(
              `[${name}] There was an error: ${(e as Error).message}`,
            );
          }
        }
      }
    } else {
      responses.push(`Tool: ${toolname} not found`);
    }
  }

  const content = `${id ? `@${id}\n` : ""}${responses.join("\n\n")}`;
  return content as unknown as BaseMessageChunk;
};

export const respond = async (
  {
    messages = [],
    invocation = {},
    parameters = {},
    streaming = false,
    tools = [],
    target,
    source,
  }: {
    messages?: [string, string][];
    invocation?: Record<string, any>;
    parameters?: Record<string, any>;
    streaming?: boolean;
    tools?: string[];
    target?: Post;
    source?: Agent;
  } = {},
): Promise<
  BaseMessageChunk | AsyncGenerator<BaseMessageChunk, void, unknown>
> => {
  if (tools && tools.length > 0) {
    return respondT({
      messages,
      invocation,
      parameters,
      tools,
      streaming,
      target,
      source,
    });
  }

  const settings = await getSettingsObject();
  const [repo, model] = (parameters?.model || settings.model).split("::");
  const arg: Record<any, any> = {
    ...parameters,
    model,
  };

  console.log({ repo, model });

  try {
    let invoker: Invoker;
    switch (repo) {
      case "groq": {
        arg.apiKey = settings.apikeygroq;
        delete arg.logprobs;
        delete arg.logit_bias;
        delete arg.top_logprobs;
        invoker = new ChatGroq(arg);
        break;
      }
      case "openai": {
        arg.apiKey = settings.apikeyopenai;
        invoker = new OpenAI(arg);
        break;
      }
      case "anthropic": {
        arg.apiKey = settings.apikeyanthropic;
        invoker = new ChatAnthropic(arg);
        break;
      }
      case "ollama":
      default: {
        arg.baseUrl = OLLAMA_ORIGIN;
        invoker = new ChatOllama(arg);
      }
    }
    const prompt = ChatPromptTemplate.fromMessages(messages);
    const chain = prompt.pipe(
      invoker as RunnableLike,
    );
    if (streaming) {
      return chain.stream(invocation).then(async function* (textStream) {
        for await (const text of textStream) {
          yield text;
        }
      });
    }
    return chain.invoke(invocation);
  } catch (error) {
    throw error;
  }
};

export const respondFunc = async (
  {
    messages = [],
    invocation = {},
    parameters = {},
    functions = {},
  }: {
    messages?: [string, string][];
    invocation?: Record<string, any>;
    parameters?: Record<string, any>;
    functions?: FunctionsForOllama;
  } = {},
): Promise<
  BaseMessageChunk | AsyncGenerator<BaseMessageChunk, void, unknown>
> => {
  const [repo, model] = MODEL_FUNCTIONS.split("::");

  const invoker = new OllamaFunctions({
    ...parameters,
    baseUrl: OLLAMA_ORIGIN,
    model,
  }).bind(functions);
  const prompt = ChatPromptTemplate.fromMessages(messages);
  return prompt.pipe(invoker).pipe(new JsonOutputFunctionsParser()).invoke(
    invocation,
  );
};

export const embed = async (prompt: string = genRandSurrealQLString()) => {
  const settings = await getSettingsObject();
  const [repo, model] = settings.modelembedding!.split("::");
  try {
    switch (repo) {
      case "ollama":
      default: {
        const ollama = new Ollama({
          host: OLLAMA_ORIGIN,
        });
        const { embedding } = await ollama.embeddings({
          model,
          prompt,
        });
        return embedding;
      }
    }
  } catch (EmbeddingError) {
    throw EmbeddingError;
  }
};

export const describe = async (base64data: string) => {
  const settings = await getSettingsObject();
  const [repo, model] = settings.modelvision!.split("::");
  try {
    switch (repo) {
      case "ollama":
      default: {
        const invoker = new OllamaLangchain({
          model,
          baseUrl: OLLAMA_ORIGIN,
        }).bind({
          images: [base64data],
        });
        const res = await invoker.invoke("What's in this image?");
        return res;
      }
    }
  } catch (EmbeddingError) {
    throw EmbeddingError;
  }
};

export const summarize = async (
  content: string,
  prompt: string = PROMPTS_SUMMARIZE.SUMMARY,
  charLimit: number = 2 ** 14,
): Promise<string> => {
  const { content: output } = await respond(
    {
      messages: [["user", prompt ? `${prompt}\n\n{content}` : `{content}`]],
      invocation: {
        content: content.substring(0, charLimit),
      },
    },
  ) as BaseMessageChunk;
  return output as string;
};

const enc = getEncoding("gpt2");
export const tokenize = (string: string) => enc.encode(string);
