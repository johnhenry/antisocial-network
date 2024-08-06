import { Handler } from "@/hashtools/types";
import mixtureOfAgents from "@/hashtools/plugins/moa/handler";
const handlers: Record<string, Handler> = { mixtureOfAgents };
export default handlers;
