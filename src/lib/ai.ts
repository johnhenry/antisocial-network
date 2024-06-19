import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { Ollama } from "ollama";
import { OllamaFunctions } from "@langchain/community/experimental/chat_models/ollama_functions";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  MODEL_BASIC,
  MODEL_FUNCTIONS,
  MODEL_EMBEDDING,
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
  functions?: FunctionsForOllama
) => {
  const model = functions
    ? new OllamaFunctions({
        temperature: 0.1,
        baseUrl: OLLAMA_LOCATION,
        model: MODEL_FUNCTIONS,
      }).bind(functions)
    : new ChatOllama({
        baseUrl: OLLAMA_LOCATION,
        model: MODEL_BASIC,
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
