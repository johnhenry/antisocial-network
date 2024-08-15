import { PromptTemplate } from "@langchain/core/prompts";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export const renderPromptTemplate = (
  template: string,
  invocation: Record<string, any>,
) =>
  new PromptTemplate({
    inputVariables: Object.keys(invocation),
    template,
  }).format(invocation);

export const renderChatPromptTemplate = (
  messages: [string, string][],
  invocation: Record<string, any>,
) =>
  ChatPromptTemplate.fromMessages(
    messages,
  ).format(invocation);
