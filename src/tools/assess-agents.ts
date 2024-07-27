import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { TABLE_AGENT } from "@/config/mod";
import type { Descriptor, Handler, Tool } from "@/types/tools";

const schema = z.object({
  scores: z
    .array(
      z.object({
        agent: z.string().describe(`ID of the agent e.g. ${TABLE_AGENT}:???`),
        score: z.number().describe("Float score of the agent from 0 to 1"),
      }),
    )
    .describe("The list of agents and their scores."),
});

const descriptor: Descriptor = {
  type: "function",
  function: {
    description: "assign scores to agents",
    name: "assessagents",
    parameters: zodToJsonSchema(schema) as any,
  },
};

const handler: Handler = async ({
  scores,
}: {
  scores: { agent: string; score: number }[];
}): Promise<string> => {
  return "0";
};

const tool: Tool = {
  descriptor,
  handler,
};

export default tool;
