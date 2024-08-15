import type { FileProto, Post } from "@/types/mod";
import type { Forward } from "@/lib/util/forwards";

import { Handler } from "@/hashtags/types";

export const tools: Handler = async (
  {
    query,
    tools,
    simultaneous,
  },
): Promise<
  {
    post?: Post | undefined;
    dehydrated?: string | undefined;
    simultaneous: Forward[] | undefined;
    files?: FileProto[] | undefined;
    tools?: string[] | undefined;
  }
> => {
  const names = new URLSearchParams(query).getAll("name");
  for (const tool of names) {
    tools.push(tool);
  }
  return { tools, simultaneous };
};
export default tools;
