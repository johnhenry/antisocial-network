import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const subtraction = tool(
  ({ minuend, subtrahend }: { minuend: number; subtrahend: number }) => {
    return `${minuend - subtrahend}`;
  },
  {
    name: "subtraction",
    description: "subtract two numbers",
    schema: z.object({
      minuend: z
        .number()
        .describe("The number from which another is to be subtracted."),
      subtrahend: z.number().describe(
        "The number to be subtracted from another.",
      ),
    }).required(),
  },
);

/**
 * Returns the current time for a given timezone offset.
 * @param offset The timezone offset in hours (e.g., -5 for EST, 1 for CET).
 * @returns The current time as a string in the format "YYYY-MM-DD HH:mm:ss".
 * @example
 * const currentTimeInEST = getCurrentTimeForTimezone(-5);
 */

export const time = tool(({ offset }: { offset: number }) => {
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
  return `The time for UTC${
    offset >= 0 ? "+" : ""
  }${offset} is ${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}, {
  name: "time",
  description: "Return the current time for a given timezone offset",
  schema: z.object({
    offset: z
      .number()
      .describe("Timezone offset").default(0),
  }),
});

export { default as weather } from "@/lib/tools/lib/weather/mod";
export { default as javascript } from "@/lib/tools/lib/javascript/mod";
