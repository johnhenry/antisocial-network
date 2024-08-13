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
import { renderChatPromptTemplate } from "@/lib/util/render-templates";
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
  }: {
    messages?: [string, string][];
    invocation?: Record<string, any>;
    parameters?: Record<string, any>;
    streaming?: boolean;
    target?: Post;
    source?: Agent;
  } = {},
): Promise<
  BaseMessageChunk | AsyncGenerator<BaseMessageChunk, void, unknown>
> => {
  const settings = await getSettingsObject();
  const [repo, model] = (parameters?.model || settings.model).split("::");
  const arg: Record<any, any> = {
    ...parameters,
    model,
    keepAlive: settings.ollamaKeepAlive || "20m",
  };
  consola.info("settings");
  LogTable.log(settings);
  console.log({ settings });
  consola.info("parameters");
  LogTable.log(parameters);
  console.log({ parameters });

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
    const prompt = ChatPromptTemplate.fromMessages(messages);
    const chain = prompt.pipe(
      invoker as RunnableLike,
    );
    consola.start(
      "Starting inference ",
      await renderChatPromptTemplate(messages, invocation),
    );
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
