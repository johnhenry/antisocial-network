import { OllamaFunctions } from "@langchain/community/experimental/chat_models/ollama_functions";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
// import { PromptTemplate } from "@langchain/core/prompts";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputFunctionsParser } from "@langchain/core/output_parsers/openai_functions";
import { MODEL_BASIC as model } from "@/settings";
import { getAgent } from "@/lib/actions.agent";

type FUNCTION_DEFINITION = {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: any;
  };
};
type FUNCTIONS = {
  functions: FUNCTION_DEFINITION[];
  functionCall: string;
};

const defaultOptions = {
  temperature: 0.1,
  model,
};

const getModel = (
  options = defaultOptions,
  functions: FUNCTIONS | null = null
) => {
  if (functions) {
    return new OllamaFunctions(options).bind(functions);
  }
  return new ChatOllama(options);
};

export const generateMessage = async (
  context: [string, string][],
  user_id: string
) => {
  const agent = await getAgent(user_id);
  const messages = context.map(([id, content]) => {
    return [id ? "assistant" : "user", content];
  });
  const model = getModel(agent.model, agent.functions);
  const prompt = ChatPromptTemplate.fromMessages(messages);
  const chain = await prompt.pipe(model).pipe(new JsonOutputFunctionsParser());
  return chain.invoke("");
};
