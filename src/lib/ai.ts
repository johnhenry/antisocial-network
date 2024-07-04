import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { Ollama as OllamaLangchain } from "@langchain/community/llms/ollama";
import type { BaseMessageChunk } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { Ollama } from "ollama";
import { OllamaFunctions } from "@langchain/community/experimental/chat_models/ollama_functions";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { MODEL_FUNCTIONS, OLLAMA_LOCATION } from "@/settings";
import { JsonOutputFunctionsParser } from "@langchain/core/output_parsers/openai_functions";
import { getSettingsObject } from "@/lib/database/read";

import { API_KEY_GROQ } from "@/settings";

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

export const respond = async (
  {
    messages = [],
    invocation = {},
    parameters = {},
    streaming = false,
  }: {
    messages?: [string, string][];
    invocation?: Record<string, any>;
    parameters?: Record<string, any>;
    streaming?: boolean;
  } = {},
): Promise<
  BaseMessageChunk | AsyncGenerator<BaseMessageChunk, void, unknown>
> => {
  const settings = await getSettingsObject();
  const [source, model] = (parameters?.model || settings.model).split("::");
  const arg = {
    ...parameters,
    model,
  };
  try {
    let invoker;
    switch (source) {
      case "groq": {
        arg.apiKey = settings.apikeygroq;
        delete arg.logprobs;
        delete arg.logit_bias;
        delete arg.top_logprobs;
        invoker = new ChatGroq(arg);
        break;
      }
      case "ollama":
      default: {
        arg.baseUrl = OLLAMA_LOCATION;
        invoker = new ChatOllama(arg);
      }
    }
    const prompt = ChatPromptTemplate.fromMessages(messages);
    const chain = prompt.pipe(invoker);
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
  const [source, model] = MODEL_FUNCTIONS.split("::");

  const invoker = new OllamaFunctions({
    ...parameters,
    baseUrl: OLLAMA_LOCATION,
    model,
  }).bind(functions);
  const prompt = ChatPromptTemplate.fromMessages(messages);
  return prompt.pipe(invoker).pipe(new JsonOutputFunctionsParser()).invoke(
    invocation,
  );
};

export const embed = async (prompt: string) => {
  const settings = await getSettingsObject();
  const [source, model] = settings.modelembedding!.split("::");
  try {
    switch (source) {
      case "ollama":
      default: {
        const ollama = new Ollama({
          host: OLLAMA_LOCATION,
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
  const [source, model] = settings.modelvision!.split("::");
  try {
    switch (source) {
      case "ollama":
      default: {
        const invoker = new OllamaLangchain({
          model,
          baseUrl: OLLAMA_LOCATION,
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

export const PROMPTS_SUMMARIZE = {
  TITLE:
    `You are an advanced language model tasked with creating concise and impactful titles. Read the provided content carefully and generate a title that effectively captures the essence of the content. The title should be between 2 to 5 words long. Make sure it is engaging and accurately reflects the main theme or key message of the content. Please provide only the title and nothing else. Do not use quotes. Do not format the title in any way.`,
  SUMMARY:
    `You are an advanced language model tasked with summarizing content. Read the provided content carefully and generate a concise and coherent summary that captures the key points and main ideas. The summary should be clear and informative, providing a comprehensive overview of the original content. Do not use quotes. Do not format the title in any way.`,
  LLM_NAMES:
    `You are an advanced language model tasked with giving a name to another language model based on it's prompt. Read the given system prompt carefully and generate five options for names of the LLM that uses the given prompts. Each name should be engaging and accurately reflects the main theme or key message of the prompt. The names should be is hyphenated and between 2 and 3 words long. Please provide only the comma-separated list of names and nothing else. Do not use spaces in names. Do not use quotes. Do not format the list in any way.`,
  LLM_PROMPT:
    `You are an advanced language model tasked with creating system prompts for other language models. Please read the provided content carefully and generate a prompt that instruct an LLM to behave in accordance with the content, mood, tone, and style of the given. Focus on their knowledge and behavior rather than specific tasks. Summarize the provided content into a clear and concise prompt that an LLM can follow effectively. Do not use quotes. Do not name the model in the prompt. Do not format the prompt in any way. The respone must begin with "You are an advanced language model "`,
  LLM_DESCRIPTION:
    `You are an advanced language model tasked with creating descriptions prompts for other language models based on the given name of the model. Your goal is to craft a creative description that captures the literal essence of the name along with any implied connotations. Do not use quotes. Do not name the model in the description. Do not format the model in any way. `,
  LLM_PROMPT_RANDOM:
    `You are an advanced language model tasked with creating system prompts for other language models. Pease pick a personality type at random and create a prompt for an LLM to follow. Give it an interesting backstory. Do not name the model in the prompt. Please provide only the text of the prompt. Do not format the prompt in any way.`,
};

export const summarize = async (
  content: string,
  prompt: string = PROMPTS_SUMMARIZE.SUMMARY,
): Promise<string> => {
  const { content: output } = await respond(
    {
      messages: [["user", `${prompt}\n\n{content}`]],
      invocation: {
        content,
      },
    },
  ) as BaseMessageChunk;
  return output as string;
};
