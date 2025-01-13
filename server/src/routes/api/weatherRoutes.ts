import { Router } from 'express';
import HistoryService from '../../service/historyService';
import WeatherService from '../../service/weatherService';

const router = Router();

// POST request to retrieve weather data based on city name
router.post('/', async (req, res) => {
  const { cityName } = req.body;

  // Validate that the city name is provided
  if (!cityName) {
    return res.status(400).json({ error: "City name is required" });
  }

  try {
    // Fetch weather data for the city
    const weatherData = await WeatherService.getWeatherForCity(cityName);

    // Save the city to search history
    await HistoryService.addCity(cityName);

    // Send weather data back in response
    return res.json(weatherData);

  } catch (error) {
    console.error('Error fetching weather data or saving city to history:', error);
    // If the error is related to the weather service, respond with an error fetching weather data
    if (error.message === 'Coordinates could not be retrieved') {
      return res.status(400).json({ error: 'Invalid city name or failed to fetch weather data' });
    }

    // For other types of errors, respond with a general server error
    return res.status(500).json({ error: 'Failed to process the request' });
  }
});

// GET request to fetch search history
router.get('/history', async (_req, res) => {
  try {
    const cities = await HistoryService.getCities();
    return res.json(cities); // Send the history of cities as response
  } catch (error) {
    console.error('Error fetching cities from history:', error);
    return res.status(500).json({ error: 'Failed to fetch cities from history' });
  }
});

// DELETE request to remove a city from search history by ID
router.delete('/history/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await HistoryService.removeCity(id);
    return res.status(204).send(); // No content to return on successful delete
  } catch (error) {
    console.error('Error removing city from history:', error);
    return res.status(500).json({ error: 'Failed to remove city from history' });
  }
});

export default router;