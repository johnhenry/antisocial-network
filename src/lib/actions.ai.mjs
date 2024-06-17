"use server";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { OLLAMA_MODEL, OLLAMA_LOCATION } from "@/settings";

const model = new ChatOllama({
  baseUrl: OLLAMA_LOCATION,
  model: OLLAMA_MODEL,
});

const SYSTEM_PROMPT =
  "You are a helpful agent that's good at creating cescription for other AI agents. When asked to create a prompt, you create a prompt from a second-person perspective. You do not annotate the text. You do not add meta data. You respond ONLY by returning the requested prompt, similar to this description itself. DO NOT include a name for the AI agent within the prompt.All prompts should beging with: 'You are...'";

const USER_PROMPT_GENERAL = `Please create a detailed and concise description for an AI agent.`;
const USER_PROMPT_BASE = `Using this description as a base:

{description}

please create a detailed and concise description for an AI agent.
`;
const USER_PROMPT_QUALITIES = `Please create a detailed and concise description for an AI agent that incorporates the following qualities:

{qualities}
`;
const USER_PROMPT_BASE_QUALITIES = `Using this description as a base:

{description}

please create a detailed and concise description for an AI agent that incorporates the following qualities:

{qualities}
`;

export const respond = async (messages, invocation = {}) => {
  const prompt = ChatPromptTemplate.fromMessages(messages);
  const chain = prompt.pipe(model);
  const { content } = await chain.invoke(invocation);
  return ["assistant", content];
};

export const generateSystemPrompt = async (
  qualities = "",
  description = ""
) => {
  const messages = [["system", SYSTEM_PROMPT]];
  switch (true) {
    case !!(qualities && description):
      messages.push(["user", USER_PROMPT_BASE_QUALITIES]);
      break;
    case !!qualities:
      messages.push(["user", USER_PROMPT_QUALITIES]);
      break;
    case !!description:
      messages.push(["user", USER_PROMPT_BASE]);
      break;
    default:
      messages.push(["user", USER_PROMPT_GENERAL]);
      break;
  }
  return respond(messages, { qualities, description });
};

export const generateResponse = async (qualities = "", description = "") => {
  const messages = [["system", SYSTEM_PROMPT]];
  switch (true) {
    case !!(qualities && description):
      messages.push(["user", USER_PROMPT_BASE_QUALITIES]);
      break;
    case !!qualities:
      messages.push(["user", USER_PROMPT_QUALITIES]);
      break;
    case !!description:
      messages.push(["user", USER_PROMPT_BASE]);
      break;
    default:
      messages.push(["user", USER_PROMPT_GENERAL]);
      break;
  }
  return generateResponse(messages, { qualities, description });
};
