import { z } from 'zod';

const OpenMeteoSchema = z.object({
  action: z.enum(['getForecast', 'getCurrentWeather', 'getDailyForecast', 'getHourlyForecast']),
  latitude: z.number(),
  longitude: z.number(),
  // elevation: z.number().optional(),
  // hourly: z.array(z.string()).optional(),
  // daily: z.array(z.string()).optional(),
  // current: z.array(z.string()).optional(),
  temperature_unit: z.enum(['celsius', 'fahrenheit']).default('fahrenheit'),
  wind_speed_unit: z.enum(['kmh', 'ms', 'mph', 'kn']).default('kmh'),
  precipitation_unit: z.enum(['mm', 'inch']).default('mm'),
  // timeformat: z.enum(['iso8601', 'unixtime']).default('iso8601'),
  // timezone: z.string().default('GMT'),
  // past_days: z.number().int().min(0).max(92).default(0),
  // forecast_days: z.number().int().min(0).max(16).default(7),
  // models: z.array(z.string()).default(['auto']),
  // cell_selection: z.enum(['land', 'sea', 'nearest']).default('land'),
});

type OpenMeteoParams = z.infer<typeof OpenMeteoSchema>;

export { OpenMeteoSchema };
export type { OpenMeteoParams };
