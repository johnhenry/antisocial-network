import type { Descriptor } from "@/types/tools";

import { zodToJsonSchema } from "zod-to-json-schema";
import { OpenMeteoSchema } from '@/tools/openmeteoweather/open-meteo-schema';
const descriptor: Descriptor = {
  type: "function",
  function: {
    description: "find the weather or weather forecast",
    name: "openmeteoweather",
    parameters: zodToJsonSchema(OpenMeteoSchema) as any,
  },
};

export default descriptor;
