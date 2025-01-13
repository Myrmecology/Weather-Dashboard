import dotenv from 'dotenv';
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;

  constructor(
    city: string,
    date: string,
    icon: string,
    iconDescription: string,
    tempF: number,
    windSpeed: number,
    humidity: number
  ) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

// WeatherService Class
class WeatherService {
  private baseUrl = process.env.API_BASE_URL || 'https://api.openweathermap.org'; // Default value for baseUrl if missing in env
  private apiKey = process.env.API_KEY || ''; // Default empty if API_KEY not found in env
  private cityName!: string;

  // Fetch location data from geocode API
  private async fetchLocationData(query: string) {
    try {
      const response = await fetch(query);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching location data:', error);
      return null;
    }
  }

  // Destructure the location data into coordinates
  private destructureLocationData(locationData: any): Coordinates | null {
    if (locationData && locationData[0] && locationData[0].lat && locationData[0].lon) {
      return {
        lat: locationData[0].lat,
        lon: locationData[0].lon
      };
    }
    return null;
  }

  // Build geocode query string
  private buildGeocodeQuery(): string {
    return `${this.baseUrl}/geo/1.0/direct?q=${this.cityName}&limit=1&appid=${this.apiKey}`;
  }

  // Build weather query string based on coordinates
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseUrl}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`;
  }

  // Fetch location and destructure coordinates
  private async fetchAndDestructureLocationData() {
    const locationData = await this.fetchLocationData(this.buildGeocodeQuery());
    return this.destructureLocationData(locationData);
  }

  // Fetch weather data for the provided coordinates
  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const response = await fetch(this.buildWeatherQuery(coordinates));
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  // Parse weather data from response
  private parseWeatherDataForDay(weatherData: any, index: number) {
    const forecast = weatherData.list[index];
    const city = this.cityName;
    const date = new Date(forecast.dt * 1000).toLocaleDateString(); // Convert timestamp to date
    const icon = forecast.weather[0].icon;
    const iconDescription = forecast.weather[0].description;
    const tempF = this.kelvinToFahrenheit(forecast.main.temp);
    const windSpeed = forecast.wind.speed;
    const humidity = forecast.main.humidity;

    return new Weather(city, date, icon, iconDescription, tempF, windSpeed, humidity);
  }

  // Convert temperature from Kelvin to Fahrenheit
  private kelvinToFahrenheit(kelvin: number): number {
    return ((kelvin - 273.15) * 9) / 5 + 32; // Kelvin to Fahrenheit formula
  }

  // Build forecast array from weather data (5-day forecast)
  private buildForecastArray(weatherData: any) {
    const forecastArray = [];

    // OpenWeather API returns 3-hour intervals, so we pick the relevant data points (e.g., 12:00 PM of each day)
    const forecastTimes = [0, 8, 16, 24, 32]; // These indices correspond to a 5-day forecast at intervals

    forecastTimes.forEach((index) => {
      const weatherForDay = this.parseWeatherDataForDay(weatherData, index);
      forecastArray.push(weatherForDay);
    });

    return forecastArray;
  }

  // Get weather for the specified city
  async getWeatherForCity(city: string) {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();

    if (!coordinates) {
      throw new Error('Coordinates could not be retrieved');
    }

    const weatherData = await this.fetchWeatherData(coordinates);
    const forecastArray = this.buildForecastArray(weatherData);

    return { forecastArray };
  }
}

export default new WeatherService();