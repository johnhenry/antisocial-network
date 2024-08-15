import { tool } from "@langchain/core/tools";
import handler from "@/lib/tools/lib/weather/handler";
import schema from "@/lib/tools/lib/weather/open-meteo-schema";

export default tool(handler, {
  name: "weather",
  description: "Get weather data for a location",
  schema,
});
