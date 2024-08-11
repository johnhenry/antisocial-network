import type { Handler } from "@/hashtags/types";
import mixtureOfAgents from "@/hashtags/plugins/moa/handler";
const handlers: Record<string, Handler> = { mixtureOfAgents };
export default handlers;
