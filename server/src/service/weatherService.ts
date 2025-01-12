import dotenv from 'dotenv';
//import { dot } from 'node:test/reporters';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// TODO: Define a class for the Weather object
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
    humidity: number,
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

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseUrl = process.env.API_BASE_URL as string;
  private apiKey = process.env.API_KEY as string;
  private cityName!: string;

  // TODO: Create fetchLocationData method
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
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    return {
      lat: locationData.lat,
      lon: locationData.lon,
    };
  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    return `${this.baseUrl}/geo/1.0/direct?q=${this.cityName}&limit=1&appid=${this.apiKey}`;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string { 
    return `${this.baseUrl}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() { 
    const locationData = await this.fetchLocationData(this.buildGeocodeQuery());
    if (Array.isArray(locationData) && locationData.length > 0) {
      return this.destructureLocationData(locationData[0]); // Pass the first location object
  } else {
      console.error('No location data found');
      return null; // Return null if no data
  }
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) { 
    const response = await fetch(this.buildWeatherQuery(coordinates));
    const data = await response.json();
    return data;
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) { 
    const city = this.cityName;
    const date = new Date(response.list[0].dt * 1000).toLocaleDateString();
    const icon = response.list[0].weather[0].icon;
    const iconDescription = response.list[0].weather[0].description;
    const tempF = ((response.list[0].main.temp - 273.15) * 9) / 5 + 32;
    const windSpeed = response.list[0].wind.speed;
    const humidity = response.list[0].main.humidity;

    return new Weather(city, date, icon, iconDescription, tempF, windSpeed, humidity);
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) { 
    const forecastArray = [];

    forecastArray.push(currentWeather);

    for (let i = 1; i < weatherData.length; i++) {
      const city = this.cityName;
      const date = new Date(weatherData[i].dt * 1000).toLocaleDateString();
      const icon = weatherData[i].weather[0].icon;
      const iconDescription = weatherData[i].weather[0].description;
      const tempF = ((weatherData[i].main.temp - 273.15) * 9) / 5 + 32; // Convert temperature to Fahrenheit
      const windSpeed = weatherData[i].wind.speed;
      const humidity = weatherData[i].main.humidity;

      forecastArray.push(new Weather(city, date, icon, iconDescription, tempF, windSpeed, humidity));
    }
    return forecastArray;
  }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) { 
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    
    if (!coordinates) {
      throw new Error('Coordinates could not be retrieved');
  }
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecastArray = this.buildForecastArray(currentWeather, weatherData.list);
    console.log({ currentWeather, forecastArray });
    return { currentWeather, forecastArray };
  }
}

export default new WeatherService();