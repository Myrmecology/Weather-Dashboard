import fs from 'fs-extra';


// Define a City class with name and id properties
class City {
  name: string;
  id: string;

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}

// Complete the HistoryService class
class HistoryService {
  // Absolute path to the db.json file
  private path: string = 'db/db.json';  

  // Reads the city data from the JSON file
  private async read(): Promise<City[]> {
    try {
      console.log('Reading from file:', this.path);  // Debug log to check path
      const data = await fs.readJson(this.path);
      return data as City[];  // Ensure the data is an array of City objects
    } catch (error) {
      console.log('Error reading file:', error);
      return [];  // Return an empty array if reading fails
    }
  }

  // Writes the updated cities array to the JSON file
  private async write(cities: City[]): Promise<void> {
    try {
      console.log('Writing to file:', this.path);  // Debug log to check path
      await fs.writeJson(this.path, cities, { spaces: 2 });  // Pretty-print the JSON with spaces
      console.log('Data written to file successfully');
    } catch (error) {
      console.log('Error writing file:', error);
    }
  }

  // Fetches the cities from the searchHistory.json file
  async getCities(): Promise<City[]> {
    return this.read();
  }

  // Adds a new city to the searchHistory.json file
  async addCity(city: string): Promise<void> {
    try {
      const cities = await this.getCities();
      
      // Create a new City instance with a unique ID (current timestamp)
      const newCity = new City(city, `${Date.now()}`);

      // Add the new city to the cities array
      cities.push(newCity);
      
      // Write the updated cities array back to the file
      await this.write(cities);
    } catch (error) {
      console.log('Error adding city:', error);
    }
  }

  // BONUS: Removes a city from the searchHistory.json file by its ID
  async removeCity(id: string): Promise<void> {
    try {
      const cities = await this.getCities();
      
      // Filter out the city with the matching ID
      const updatedCities = cities.filter(city => city.id !== id);

      // Write the updated cities array back to the file
      await this.write(updatedCities);
    } catch (error) {
      console.log('Error removing city:', error);
    }
  }
}

export default new HistoryService();