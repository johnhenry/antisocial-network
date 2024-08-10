import type { Descriptor } from "@/types/tools";

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const schema = z.object({
  offset: z
    .number()
    .describe("Timezone offset").default(0),
});

const descriptor: Descriptor = {
  type: "function",
  function: {
    description: "Return the current time for a given timezone offset",
    name: "timetool",
    parameters: zodToJsonSchema(schema) as any,
  },
};

export default descriptor;
