import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { Ollama as OllamaLangchain } from "@langchain/community/llms/ollama";

import { Ollama } from "ollama";
import { OllamaFunctions } from "@langchain/community/experimental/chat_models/ollama_functions";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  MODEL_BASIC,
  MODEL_FUNCTIONS,
  MODEL_EMBEDDING,
  MODEL_IMAGE,
  OLLAMA_LOCATION,
} from "@/settings";
import { JsonOutputFunctionsParser } from "@langchain/core/output_parsers/openai_functions";

type FunctionDescriptor = {
  name: string;
  description: string;
  parameters: Record<string, any>;
};

type FunctionsForOllama = {
  functions: FunctionDescriptor[];
  function_call?: {
    name: string;
  };
};

export const respond = async (
  messages: [string, string][],
  invocation: Record<string, any> = {},
  functions?: FunctionsForOllama,
  parameters?: Record<string, any>
) => {
  const model = functions
    ? new OllamaFunctions({
        ...parameters,
        baseUrl: OLLAMA_LOCATION,
        model: MODEL_FUNCTIONS,
      }).bind(functions)
    : new ChatOllama({
        model: MODEL_BASIC,
        ...parameters,
        baseUrl: OLLAMA_LOCATION,
      });
  const prompt = ChatPromptTemplate.fromMessages(messages);
  let chain = prompt.pipe(model);
  if (functions) {
    chain = chain.pipe(new JsonOutputFunctionsParser());
  }
  return chain.invoke(invocation);
};

export const embed = async (prompt: string) => {
  const ollama = new Ollama({
    host: OLLAMA_LOCATION,
  });
  try {
    const { embedding } = await ollama.embeddings({
      model: MODEL_EMBEDDING,
      prompt,
    });
    return embedding;
  } catch (EmbeddingError) {
    throw EmbeddingError;
  }
};

export const describe = async (base64data: string) => {
  const model = new OllamaLangchain({
    model: MODEL_IMAGE,
    baseUrl: OLLAMA_LOCATION,
  }).bind({
    images: [base64data],
  });
  const res = await model.invoke("What's in this image?");
  return res;
};

const SUMMARIZE_PROMPTS = [
  "Please summarize this content:",
  "Please create a concise 1 paragraph summary of the following:",
];

export const PROMPTS_SUMMARIZE = {
  TITLE: `You are an advanced language model tasked with creating concise and impactful titles. Read the provided content carefully and generate a title that effectively captures the essence of the content. The title should be between 2 to 5 words long. Make sure it is engaging and accurately reflects the main theme or key message of the content. Please provide only the title and nothing else. Do not use quotes. Do not format the title in any way.`,
  SUMMARY: `You are an advanced language model tasked with summarizing content. Read the provided content carefully and generate a concise and coherent summary that captures the key points and main ideas. The summary should be clear and informative, providing a comprehensive overview of the original content. Do not use quotes. Do not format the title in any way.`,
  LLM_NAMES: `You are an advanced language model tasked with giving a name to another language model based on it's prompt. Read the given system prompt carefully and generate five options for names of the LLM that uses the given prompts. Each name should be engaging and accurately reflects the main theme or key message of the prompt. The names should be is hyphenated and between 2 and 3 words long. Please provide only the comma-separated list of names and nothing else. Do not use spaces in names. Do not use quotes. Do not format the list in any way.`,
  LLM_PROMPT: `You are an advanced language model tasked with creating system prompts for other language models. Please read the provided content carefully and generate a prompt that instruct an LLM to behave in accordance with the content, mood, tone, and style of the given. Focus on their knowledge and behavior rather than specific tasks. Summarize the provided content into a clear and concise prompt that an LLM can follow effectively. Do not use quotes. Do not name the model in the prompt. Do not format the title in any way. The respone must begin with "You are an advanced language model "`,
  LLM_PROMPT_RANDOM: `You are an advanced language model tasked with creating system prompts for other language models. Pease pick a personality type at random and create a prompt for an LLM to follow. Give it an interesting backstory. Do not name the model in the prompt. Please provide only the text of the prompt. Do not format the prompt in any way.`,
};

export const summarize = async (
  content: string,
  prompt: string = PROMPTS_SUMMARIZE.SUMMARY
): Promise<string> => {
  const { content: output } = await respond(
    [["user", `${prompt}\n\n{content}`]],
    {
      content,
    }
  );
  return output as string;
};
