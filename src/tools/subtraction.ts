import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const schema = z.object({
  minuend: z
    .number()
    .describe("The number from which another is to be subtracted."),
  subtrahend: z.string().describe("The number to be subtracted from another."),
});

const descriptor = {
  name: "subtraction",
  description: "subtract two numbers",
  parameters: {
    type: "object",
    properties: zodToJsonSchema(schema),
  },
};

const handler = async ({
  minuend,
  subtrahend,
}: {
  minuend: number;
  subtrahend: number;
}): Promise<number> => {
  return minuend - subtrahend;
};

const tool = {
  descriptor,
  handler,
};

export default tool;
