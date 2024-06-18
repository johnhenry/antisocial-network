import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const schema = z.object({
  scores: z
    .array(
      z.object({
        agent: z.string().describe("The name of the agent."),
        score: z.number().describe("The score of the agent."),
      })
    )
    .describe("The list of agents and their scores."),
});

const descriptor = {
  name: "assessAgents",
  description: "assign scores to agents",
  parameters: {
    type: "object",
    properties: zodToJsonSchema(schema),
  },
};

const handler = async ({
  scores,
}: {
  scores: { agent: string; score: number }[];
}): Promise<number> => {
  console.log(scores);
  return 0;
};

const tool = {
  descriptor,
  handler,
};

export default tool;
