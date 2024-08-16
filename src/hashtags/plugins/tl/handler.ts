import { Handler } from "@/hashtags/types";

export const tools: Handler = (
  CONTEXT,
): void => {
  const names = new URLSearchParams(CONTEXT.query).getAll("name");
  for (const tool of names) {
    CONTEXT.tools.push(tool);
  }
};
export default tools;
