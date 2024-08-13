import type { Handler } from "@/hashtags/types";
import advancedPrompting from "@/hashtags/plugins/ap/handler";
const handlers: Record<string, Handler> = { advancedPrompting };
export default handlers;
