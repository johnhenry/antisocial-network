import type { Descriptor, Handler, Tool } from "@/types/tools";

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const schema = z.object({
  code: z
    .string()
    .describe("A block of javascript").default(''),
});

const descriptor: Descriptor = {
  type: "function",
  function: {
    description: "Run a block of javascript code",
    name: "javascript",
    parameters: zodToJsonSchema(schema) as any,
  },
};


export default descriptor;
