import type { Descriptor, RegisteredDescriptor } from "@/types/tools";
import subtraction from "./subtraction/descriptor";
import timetool from "./timetool/descriptor";
import javascript from "./javascript/descriptor";
import openmeteoweather from "./openmeteoweather/descriptor";

const descriptors = { subtraction, timetool, javascript, openmeteoweather };

// @ts-ignore am I doing this wrong?
const registry: Record<string, RegisteredDescriptor> = {};
const register = (
  descriptor: Descriptor,
  name: string = descriptor.function.name,
) => {
  const { description } = descriptor.function;
  registry[name] = { description, name, ...descriptor };
};

for (const [name, descriptor] of Object.entries(descriptors)) {
  register(descriptor);
}

register(subtraction);
register(timetool);
register(javascript);
register(openmeteoweather);
export default registry;
