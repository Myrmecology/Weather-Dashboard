import { Router } from 'express';
import HistoryService from '../../service/historyService';  // Ensure HistoryService is imported
import WeatherService from '../../service/weatherService';  // Ensure WeatherService is imported

const router = Router();

// POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  const { cityName } = req.body;
  console.log("POST route", req.body, cityName);

  // Fetch weather data for the city
  try {
    const weatherData = await WeatherService.getWeatherForCity(cityName);
    // Send weather data back as a JSON response
    return res.json(weatherData);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching weather data:', error.message);
      return res.status(500).send({ error: 'Failed to fetch weather data' });
    } else {
      console.error('Unexpected error:', error);
      return res.status(500).send({ error: 'Unexpected error occurred' });
    }
  }

  // Save city to search history
  try {
    await HistoryService.addCity(cityName);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error adding city to history:', error.message);
      return res.status(500).send({ error: 'Failed to add city to history' });
    } else {
      console.error('Unexpected error:', error);
      return res.status(500).send({ error: 'Unexpected error occurred while adding city to history' });
    }
  }
});

// GET request to fetch search history
router.get('/history', async (_req, res) => {
  try {
    const cities = await HistoryService.getCities();
    // Send the history of cities as a response
    return res.json(cities);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching cities from history:', error.message);
      return res.status(500).send({ error: 'Failed to fetch cities from history' });
    } else {
      console.error('Unexpected error:', error);
      return res.status(500).send({ error: 'Unexpected error occurred while fetching cities from history' });
    }
  }
});

// DELETE request to remove a city from search history by ID
router.delete('/history/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await HistoryService.removeCity(id);
    // Respond with status 204 (No content) on successful delete
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error removing city from history:', error.message);
      return res.status(500).send({ error: 'Failed to remove city from history' });
    } else {
      console.error('Unexpected error:', error);
      return res.status(500).send({ error: 'Unexpected error occurred while removing city from history' });
    }
  }
});

export default router;