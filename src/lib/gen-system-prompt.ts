"use server";

import { respond } from "@/lib/ai";

const SYSTEM_PROMPT =
  "You are a helpful agent that's good at creating cescription for other AI agents. When asked to create a prompt, you create a prompt from a second-person perspective. You do not annotate the text. You do not add meta data. You respond ONLY by returning the requested prompt, similar to this description itself. DO NOT include a name for the AI agent within the prompt.All prompts should beging with: 'You are...'";

const USER_PROMPT_GENERAL =
  `Please create a detailed and concise description for an AI agent.`;
const USER_PROMPT_BASE = `Using this description as a base:

{description}

please create a detailed and concise description for an AI agent.
`;
const USER_PROMPT_QUALITIES =
  `Please create a detailed and concise description for an AI agent that incorporates the following qualities:

{qualities}
`;
const USER_PROMPT_BASE_QUALITIES = `Using this description as a base:

{description}

please create a detailed and concise description for an AI agent that incorporates the following qualities:

{qualities}
`;

const generateSystemPrompt = async (
  qualities: string | null = null,
  description: string | null = null,
) => {
  const messages: [string, string][] = [["system", SYSTEM_PROMPT]];
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
  return respond({ messages, invocation: { qualities, description } });
};

export default generateSystemPrompt;
