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
  type: "function",
  function: {
    description: "subtract two numbers",
    name: "subtraction",
    parameters: zodToJsonSchema(schema) as any,
  },
};

const handler: Handler = ({
  minuend,
  subtrahend,
}: {
  minuend: number;
  subtrahend: number;
}): string => {
  return String(minuend - subtrahend);
};

const tool: Tool = {
  descriptor,
  handler,
};

export default tool;
