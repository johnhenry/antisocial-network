import type { Tool, RegisteredTool } from "@/types/tools";
import subtraction from "./subtraction";
import assessagents from "./assess-agents";
import timetool from "./timetool";
export { assessagents, subtraction, timetool };

// @ts-ignore am I doing this wrong?
const registry: Record<string, RegisteredTool> = {};
const register = (
  tool: Tool,
  name: string = tool.descriptor.function.name,
) => {
  const { description } = tool.descriptor.function;
  registry[name] = { ...tool, description, name };
};
register(subtraction);
register(assessagents);
register(timetool);
export default registry;
