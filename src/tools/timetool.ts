import type { Descriptor, Handler, Tool } from "@/types/tools";

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const schema = z.object({
  offset: z
    .number()
    .describe("Timezone offset"),
});

const descriptor: Descriptor = {
  type: "function",
  function: {
    description: "Return the current time for a given timezone offset",
    name: "timetool",
    parameters: zodToJsonSchema(schema) as any,
  },
};

/**
 * Returns the current time for a given timezone offset.
 * @param offset The timezone offset in hours (e.g., -5 for EST, 1 for CET).
 * @returns The current time as a string in the format "YYYY-MM-DD HH:mm:ss".
 * @example
 * const currentTimeInEST = getCurrentTimeForTimezone(-5);
 * console.log(currentTimeInEST); // Output: current time in EST
 */
const handler: Handler = ({ offset }: { offset: number }) => {
  const now = new Date();
  // Get the UTC time in milliseconds
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  // Get the local time for the specified offset
  const localTime = new Date(utcTime + (offset * 3600000));

  // Format the date and time as "YYYY-MM-DD HH:mm:ss"
  const year = localTime.getFullYear();
  const month = String(localTime.getMonth() + 1).padStart(2, "0");
  const day = String(localTime.getDate()).padStart(2, "0");
  const hours = String(localTime.getHours()).padStart(2, "0");
  const minutes = String(localTime.getMinutes()).padStart(2, "0");
  const seconds = String(localTime.getSeconds()).padStart(2, "0");

  return `The time for ${offset} is ${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const tool: Tool = {
  descriptor,
  handler,
};

export default tool;
