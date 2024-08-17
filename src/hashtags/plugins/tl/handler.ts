import { Handler } from "@/hashtags/types";

export const tools: Handler = async function* (
  CONTEXT,
) {
  const names = new URLSearchParams(CONTEXT.query).getAll("name");
  for (const tool of names) {
    CONTEXT.tools.push(tool);
  }
};
export default tools;
