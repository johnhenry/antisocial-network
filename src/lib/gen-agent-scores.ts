"use server";
import type { Agent } from "@/types/post_client";
import { respond } from "@/lib/ai";
import { assessAgents, subtraction } from "@/tools/index";
import { getPost } from "@/lib/actions.post";
import parse from "@/lib/quick-parse";
import { TABLE_AGENT } from "@/settings";

import { HumanMessage } from "@langchain/core/messages";

const SYSTEM_PROMPT = `You have a list of summaries of ai agents in the form:
---
id: <id>
name: <name>
description:
  <description>
---
`;

const USER_PROMPT = `Please use this information to assign a score from 0 to 1 to each agent id (of the form "${TABLE_AGENT}:???") based
on how suited they are to respond to a list of prompts.
how well they can continue the conversation.

Here are some key points to consider:
  - If an agent is mentioned (i.e. "@<agent_name>") that's an automatic score of 1.
  - If disuaded from using an agent,
(e.g. "do not ask @<agent_name>") that's an automatic score of 0.
  - Agents with knowdedge of or interest in a topic should be scored higher.
`;

const createAgentPrompt = ({ id, name, indexed }) => `id:${id}
name:${name}
description:
  ${indexed}
`;

const generateAgentScores = async (agents: Agent[], parent_id: string) => {
  const messages: [string, string][] = [];

  let identifier = parent_id;
  do {
    const post = await getPost(identifier);
    messages.unshift([post.user_id ? "assistant" : "user", post.content]);
    identifier = post.parent_id;
  } while (identifier);

  for (const agent of agents) {
    messages.unshift(["system", createAgentPrompt(agent)]);
  }
  messages.unshift(["system", SYSTEM_PROMPT]);

  const functions = {
    functions: [assessAgents.descriptor],
    function_call: {
      name: "assessAgents",
    },
  };
  messages.push(["user", USER_PROMPT]);
  const response = await respond(messages, {}, functions);
  // const response = await respond(
  //   messages,
  //   new HumanMessage({ content: USER_PROMPT }),
  //   functions
  // );
  return parse(response);
};

const subtractionDistraction = async (agents: Agent[], parent_id: string) => {
  const messages: [string, string][] = [];
  const functions = {
    functions: [subtraction.descriptor],
    function_call: {
      name: "subtraction",
    },
  };
  const response = await respond(
    messages,
    new HumanMessage({
      content: "5 minus 2",
    }),
    functions
  );
  return parse(response);
};

export { subtractionDistraction };

export default generateAgentScores;
