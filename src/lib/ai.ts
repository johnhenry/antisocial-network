import type { Agent, Post } from "@/types/mod";
import type { BaseMessageChunk } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";
import { Ollama as OllamaLangchain } from "@langchain/community/llms/ollama";
import { ChatGroq } from "@langchain/groq";
import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { Ollama } from "ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { OLLAMA_ORIGIN } from "@/config/mod";
import { getSettingsObject } from "@/lib/database/settings";
import { RunnableLike } from "@langchain/core/runnables";
import { getEncoding } from "js-tiktoken";
import { genRandSurrealQLString } from "@/lib/util/gen-random-string";
import { PROMPTS_SUMMARIZE } from "@/lib/templates/static";
import { SIZE_EMBEDDING_VECTOR } from "@/config/mod";
import { createLogError } from "@/lib/database/log";
import consola, { LogTable } from "@/lib/util/logging";
import * as tools from "@/lib/tools/mod";

type Invoker =
  | ChatGroq
  | OpenAI
  | ChatAnthropic
  | ChatOllama
  | OllamaLangchain;

export const respond = async (
  {
    messages = [],
    invocation = {},
    parameters = {},
    streaming = false,
    source,
    target,
    toolNames = [],
  }: {
    messages?: [string, string][];
    invocation?: Record<string, any>;
    parameters?: Record<string, any>;
    streaming?: boolean;
    target?: Post;
    source?: Agent;
    toolNames?: string[];
  } = {},
): Promise<
  BaseMessageChunk | AsyncGenerator<BaseMessageChunk, void, unknown>
> => {
  const settings = await getSettingsObject();
  const [repo, model] =
    (toolNames?.length
      ? (parameters?.modeltools || settings.modeltools || parameters?.model ||
        settings.model)
      : (parameters?.model || settings.model)).split(
        "::",
      );
  // const [repo, model] = (parameters?.model || settings.model).split(
  //   "::",
  // );

  const arg: Record<any, any> = {
    ...parameters,
    model,
    keepAlive: settings.ollamaKeepAlive || "20m",
  };
  consola.info("settings");
  LogTable.log(settings);
  consola.info(settings);
  consola.info("parameters");
  LogTable.log(parameters);
  consola.info(parameters);

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
        delete arg.numBatch;
        invoker = new ChatOllama(arg);
      }
    }
    consola.start(`Starting inference using ${repo}::${model}`);
    const prompt = ChatPromptTemplate.fromMessages(messages);
    consola.info(await prompt.format(invocation));
    const chain = prompt.pipe(
      invoker as RunnableLike,
    );
    if (toolNames.length) {
      const boundTools: any[] = [];
      try {
        consola.start("Binding tools");
        for (const toolName of toolNames) {
          // @ts-ignore TODO: trouble understaning the error :
          const tool: any = tools[toolName] as any;
          if (tool) {
            boundTools.push(tool);
            consola.start(`Tool: ${toolName} bound`);
          }
        }
        (invoker as ChatOllama).bindTools(boundTools);
        consola.start("Tools bound");
      } catch (error) {
        consola.error(`Error binding tools: ${(error as Error).message}`);
      }
    }
    if (streaming) {
      return chain.stream(invocation).then(async function* (textStream) {
        consola.start("Output: Start");
        for await (const text of textStream) {
          consola.info("Output", text);
          yield text;
        }
        consola.info("Output: End");
      });
    }
    const output = await chain.invoke(invocation);
    consola.success("Inference complete:", output.content);
    return output;
  } catch (error) {
    consola.error("Invocation Error", error);
    createLogError(error as Error, {
      repo,
      model,
      source: source?.id,
      target: target?.id,
    });
    throw error;
  }
};

export const embed = async (prompt: string = genRandSurrealQLString()) => {
  const settings = await getSettingsObject();
  const [repo, model] = (settings.modelembedding as string).split("::");

  const arg: Record<any, any> = {
    model,
    repo,
  };

  try {
    switch (repo) {
      case "openai": {
        arg.apiKey = settings.apikeyopenai;
        // set the vector dimensions to match the length the database needs
        arg.dimensions = settings.embedding_vector_size ||
          SIZE_EMBEDDING_VECTOR;
        const llm = new OpenAIEmbeddings(arg);
        const embedding = await llm.embedQuery(prompt);
        return embedding;
      }
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
  const [repo, model] = (settings.modelvision as string).split("::");
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
