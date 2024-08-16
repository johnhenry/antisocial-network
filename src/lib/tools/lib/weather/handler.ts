// @ts-nocheck
import type { OpenMeteoParams } from "@/lib/tools/lib/weather/open-meteo-schema";
import { z } from "zod";
import { OpenMeteoSchema } from "@/lib/tools/lib/weather/open-meteo-schema";
import { OpenMeteoClient } from "@/lib/tools/lib/weather/open-meteo-client";

const fetchWeather = async (params: OpenMeteoParams) => {
  console.log("WEATHER", params);
  try {
    // Validate the input parameters
    const validParams = OpenMeteoSchema.parse(params);

    // Create an instance of OpenMeteoClient
    const client = new OpenMeteoClient();

    // Determine which method to call based on the action
    let message = "forecast";
    let results;
    switch (validParams.action) {
      case "getCurrentWeather":
        message = "current weather";
        results = await client.getCurrentWeather(
          validParams.latitude,
          validParams.longitude,
          validParams,
        );
      case "getDailyForecast":
        message = "daily forecast";
        results = await client.getDailyForecast(
          validParams.latitude,
          validParams.longitude,
          validParams.forecast_days,
          validParams,
        );
      case "getHourlyForecast":
        message = "hourly forecast";
        results = await client.getHourlyForecast(
          validParams.latitude,
          validParams.longitude,
          validParams.forecast_days * 24,
          validParams,
        );
      case "getForecast":
      default:
        message = "forecast";
        results = await client.getForecast(validParams);
    }
    return `The ${message} is\n${JSON.stringify(results, null, 2)}`;
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
    } else {
      console.error("Error fetching weather:", error);
    }
    throw error;
  }
};

export default fetchWeather;
