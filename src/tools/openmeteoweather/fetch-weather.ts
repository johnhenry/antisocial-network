import { OpenMeteoSchema, OpenMeteoParams } from './open-meteo-schema';
import { OpenMeteoClient } from './open-meteo-client';

async function fetchWeather(params: OpenMeteoParams): Promise<any> {
  try {
    // Validate the input parameters
    const validParams = OpenMeteoSchema.parse(params);

    // Create an instance of OpenMeteoClient
    const client = new OpenMeteoClient();

    // Determine which method to call based on the action
    switch (validParams.action) {
      case 'getCurrentWeather':
        return await client.getCurrentWeather(validParams.latitude, validParams.longitude, validParams);
      case 'getDailyForecast':
        return await client.getDailyForecast(validParams.latitude, validParams.longitude, validParams.forecast_days, validParams);
      case 'getHourlyForecast':
        return await client.getHourlyForecast(validParams.latitude, validParams.longitude, validParams.forecast_days * 24, validParams);
      case 'getForecast':
      default:
        return await client.getForecast(validParams);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
    } else {
      console.error('Error fetching weather:', error);
    }
    throw error;
  }
}