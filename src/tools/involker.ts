// // import { encode as gpt3Encoder } from "gpt-3-encoder";
// import { ChatOllama } from "@langchain/community/chat_models/ollama";
// import { Ollama as OllamaLangchain } from "@langchain/community/llms/ollama";
// import type { BaseMessageChunk } from "@langchain/core/messages";
// import type { ChatPromptValueInterface } from "@langchain/core/prompt_values";
// import { ChatGroq } from "@langchain/groq";
// import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
// import { ChatAnthropic } from "@langchain/anthropic";
// import { Ollama } from "ollama";
// import { OllamaFunctions } from "@langchain/community/experimental/chat_models/ollama_functions";
// import { ChatPromptTemplate } from "@langchain/core/prompts";
// import { MODEL_FUNCTIONS, OLLAMA_ORIGIN } from "@/config/mod";
// import { JsonOutputFunctionsParser } from "@langchain/core/output_parsers/openai_functions";
// import { getSettingsObject } from "@/lib/database/settings";
// import { RunnableLike } from "@langchain/core/runnables";
// import { getEncoding } from "js-tiktoken";
// import { genRandSurrealQLString } from "@/lib/util/gen-random-string";
// import hashtags from "@/tools/handlers";
// import { Agent, Post } from "@/types/mod";
// import { Tool } from "@/types/tools";
// import { PROMPTS_SUMMARIZE } from "@/lib/templates/static";
// import { SIZE_EMBEDDING_VECTOR } from "@/config/mod";

// type FunctionDescriptor = {
//   name: string;
//   description: string;
//   parameters: Record<string, any>;
// };

// type FunctionsForOllama = {
//   functions?: FunctionDescriptor[];
//   function_call?: {
//     name: string;
//   };
// };

// type Invoker =
//   | ChatGroq
//   | OpenAI
//   | ChatAnthropic
//   | ChatOllama;

// import { langchainToOllama } from "@/lib/util/message-format";

// export const respondT = async (
//   {
//     messages = [],
//     invocation = {},
//     parameters = {},
//     streaming = false,
//     tools = [],
//     target,
//     source,
//   }: {
//     messages?: [string, string][];
//     invocation?: Record<string, any>;
//     parameters?: Record<string, any>;
//     streaming?: boolean;
//     tools?: string[];
//     target?: Post;
//     source?: Agent;
//   } = {},
// ): Promise<
//   BaseMessageChunk | AsyncGenerator<BaseMessageChunk, void, unknown>
// > => {
//   const settings = await getSettingsObject();
//   const [repo, model] = (parameters?.model || settings.modeltools).split("::");
//   const arg: Record<any, any> = {
//     ...parameters,
//     model,
//   };

//   const id = target?.source?.id.toString();

//   const ollamaMessages = (messages || []).map(langchainToOllama);

//   const responses = [];
//   const ollama = new Ollama({
//     host: OLLAMA_ORIGIN,
//   });
//   for (const toolname of tools) {
//     const currentTool: Tool | undefined = hashtags[toolname];

//     if (currentTool) {
//       const { name, handler, description, ...descriptor } = currentTool;
//       const response = await ollama.chat({
//         model,
//         messages: ollamaMessages,
//         tools: [currentTool],
//       });
//       if (response.message.tool_calls) {
//         for (const tool of response.message.tool_calls) {
//           try {
//             const functionResponse = await handler(
//               tool.function.arguments,
//             );
//             // Add function response to the conversation
//             responses.push(`[${name}] ${functionResponse}`);
//           } catch (e) {
//             responses.push(
//               `[${name}] There was an error: ${(e as Error).message}`,
//             );
//           }
//         }
//       }
//     } else {
//       responses.push(`Tool: ${toolname} not found`);
//     }
//   }

//   const content = `${id ? `@${id}\n` : ""}${responses.join("\n\n")}`;
//   return content as unknown as BaseMessageChunk;
// };
