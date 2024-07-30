export class OpenMeteoClient {
  constructor(baseUrl = 'https://api.open-meteo.com/v1') {
    this.baseUrl = baseUrl;
  }

  async makeRequest(params) {
    const url = new URL(`${this.baseUrl}/forecast`);
""
    // Add query parameters
    Object.keys(params).forEach(key => {
      if (Array.isArray(params[key])) {
        url.searchParams.append(key, params[key].join(','));
      } else {
        url.searchParams.append(key, params[key]);
      }
    });

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  async getForecast(params) {
    return this.makeRequest({ action: 'getForecast', ...params });
  }

  async getCurrentWeather(latitude, longitude, params = {}) {
    return this.makeRequest({
      action: 'getCurrentWeather',
      latitude,
      longitude,
      current: ['temperature_2m', 'relative_humidity_2m', 'wind_speed_10m'],
      ...params
    });
  }

  async getDailyForecast(latitude, longitude, days = 7, params = {}) {
    return this.makeRequest({
      action: 'getDailyForecast',
      latitude,
      longitude,
      daily: ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum'],
      forecast_days: days,
      ...params
    });
  }

  async getHourlyForecast(latitude, longitude, hours = 24, params = {}) {
    return this.makeRequest({
      action: 'getHourlyForecast',
      latitude,
      longitude,
      hourly: ['temperature_2m', 'relative_humidity_2m', 'wind_speed_10m'],
      forecast_hours: hours,
      ...params
    });
  }
}
export default OpenMeteoClient;