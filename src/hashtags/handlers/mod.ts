import type { Handler } from "@/hashtags/types";
import advancedPrompting from "@/hashtags/plugins/ap/handler";
import tools from "@/hashtags/plugins/tl/handler";
const handlers: Record<string, Handler> = { advancedPrompting, tools };
export default handlers;
