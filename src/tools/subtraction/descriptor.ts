import type { Descriptor } from "@/types/tools";

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const schema = z.object({
  minuend: z
    .number()
    .describe("The number from which another is to be subtracted.").default(0),
  subtrahend: z.number().describe("The number to be subtracted from another.")
    .default(0),
});

const descriptor: Descriptor = {
  type: "function",
  function: {
    description: "subtract two numbers",
    name: "subtraction",
    parameters: zodToJsonSchema(schema) as any,
  },
};

export default descriptor;
