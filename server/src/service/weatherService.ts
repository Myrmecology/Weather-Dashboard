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
  // Define the baseURL, API key, and city name properties
  private baseUrl = process.env.API_BASE_URL || 'https://api.openweathermap.org'; // Default value for baseUrl if missing in env
  private apiKey = process.env.API_KEY || ''; // Default empty if API_KEY not found in env
  private cityName!: string;

  // Fetch location data from geocode API
  private async fetchLocationData(query: string) {
    try {
      const response = await fetch(query);
      const data = await response.json();
      console.log('Location Data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching location data:', error);
      return null;
    }
  }

  // Destructure the location data into coordinates
  private destructureLocationData(locationData: any): Coordinates | null {
    if (locationData && locationData.lat && locationData.lon) {
      return {
        lat: locationData.lat,
        lon: locationData.lon
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
    if (Array.isArray(locationData) && locationData.length > 0) {
      return this.destructureLocationData(locationData[0]); // Pass the first location object
    } else {
      console.error('No location data found');
      return null; // Return null if no data
    }
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

  // Parse current weather data from response
  private parseCurrentWeather(response: any) {
    const city = this.cityName;
    const date = new Date(response.list[0].dt * 1000).toLocaleDateString();
    const icon = response.list[0].weather[0].icon;
    const iconDescription = response.list[0].weather[0].description;
    const tempF = this.kelvinToFahrenheit(response.list[0].main.temp);
    const windSpeed = response.list[0].wind.speed;
    const humidity = response.list[0].main.humidity;

    return new Weather(city, date, icon, iconDescription, tempF, windSpeed, humidity);
  }

  // Build forecast array from the weather data
  private buildForecastArray(weatherData: any): Weather[] {
    const forecastArray: Weather[] = []; // Explicitly type as Weather[]

    // OpenWeather API returns 3-hour intervals, so we pick the relevant data points (e.g., 12:00 PM of each day)
    const forecastTimes = [0, 8, 16, 24, 32]; // These indices correspond to a 5-day forecast at intervals

    forecastTimes.forEach((index) => {
      const weatherForDay = this.parseWeatherDataForDay(weatherData, index);
      forecastArray.push(weatherForDay);
    });

    return forecastArray;
  }

  // Convert temperature from Kelvin to Fahrenheit
  private kelvinToFahrenheit(kelvin: number): number {
    return ((kelvin - 273.15) * 9) / 5 + 32; // Kelvin to Fahrenheit formula
  }

  // Get weather for the specified city
  async getWeatherForCity(city: string) {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();

    if (!coordinates) {
      throw new Error('Coordinates could not be retrieved');
    }

    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecastArray = this.buildForecastArray(weatherData);

    console.log({ currentWeather, forecastArray });
    return { currentWeather, forecastArray };
  }
}

export default new WeatherService();