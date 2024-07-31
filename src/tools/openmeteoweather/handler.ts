// @ts-nocheck

import type { Handler } from "@/types/tools";
import { z } from 'zod';
import type { OpenMeteoParams } from '@/tools/openmeteoweather/open-meteo-schema';
import { OpenMeteoSchema } from '@/tools/openmeteoweather/open-meteo-schema';
import { OpenMeteoClient } from '@/tools/openmeteoweather/open-meteo-client';

const fetchWeather: Handler = async (params: OpenMeteoParams) => {
  try {
    // Validate the input parameters
    const validParams = OpenMeteoSchema.parse(params);

    // Create an instance of OpenMeteoClient
    const client = new OpenMeteoClient();

    // Determine which method to call based on the action
    let message = 'forecast';
    let results;
    switch (validParams.action) {
      case 'getCurrentWeather':
        message = 'current weather';
        results = await client.getCurrentWeather(validParams.latitude, validParams.longitude, validParams);
      case 'getDailyForecast':
        message = 'daily forecast';
        results =  await client.getDailyForecast(validParams.latitude, validParams.longitude, validParams.forecast_days, validParams);
      case 'getHourlyForecast':
        message = 'hourly forecast';
        results =  await client.getHourlyForecast(validParams.latitude, validParams.longitude, validParams.forecast_days * 24, validParams);
      case 'getForecast':
      default:
        message = 'forecast';
        results = await client.getForecast(validParams);
    }
    return `The ${message} is\n${JSON.stringify(results, null, 2)}`;
  } catch (error) {
    console.error(error)
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
    } else {
      console.error('Error fetching weather:', error);
    }
    throw error;
  }
}



export default fetchWeather;
