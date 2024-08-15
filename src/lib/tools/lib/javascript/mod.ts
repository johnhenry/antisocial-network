import { z } from "zod";
import { tool } from "@langchain/core/tools";
import handler from "./handler";
const schema = z.object({
  code: z
    .string()
    .describe("A block of javascript").default(""),
});
export default tool(handler, {
  name: "javascript",
  description: "Run a block of javascript code",
  schema,
});
