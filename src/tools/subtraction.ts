import type { Descriptor, Handler, Tool } from "@/types/tools";

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const schema = z.object({
  minuend: z
    .number()
    .describe("The number from which another is to be subtracted."),
  subtrahend: z.string().describe("The number to be subtracted from another."),
});

const descriptor: Descriptor = {
  name: "subtraction",
  description: "subtract two numbers",
  parameters: {
    type: "object",
    properties: zodToJsonSchema(schema),
  },
};

const handler: Handler = async ({
  minuend,
  subtrahend,
}: {
  minuend: number;
  subtrahend: number;
}): Promise<string> => {
  return String(minuend - subtrahend);
};

const tool: Tool = {
  descriptor,
  handler,
};

export default tool;
