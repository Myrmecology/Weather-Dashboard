import { Router } from 'express';
import HistoryService from '../../service/historyService';
import WeatherService from '../../service/weatherService';

const router = Router();

// POST request to retrieve weather data based on city name
router.post('/', async (req, res) => {
  const { cityName } = req.body;
  console.log("POST route", req.body, cityName);

  try {
    // Fetch weather data for the city
    const weatherData = await WeatherService.getWeatherForCity(cityName);
    return res.json(weatherData); // Send weather data back in response
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching weather data:', error.message);
      return res.status(500).send({ error: 'Failed to fetch weather data' });
    } else {
      console.error('Unexpected error:', error);
      return res.status(500).send({ error: 'Unexpected error occurred' });
    }
  }

  try {
    // Save the city to search history
    await HistoryService.addCity(cityName);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
      return res.status(500).send({ error: 'Failed to add city to history' });
    } else {
      console.error('Unexpected error:', error);
      return res.status(500).send({ error: 'Unexpected error occurred' });
    }
  }
});

// GET request to fetch search history
router.get('/history', async (_req, res) => {
  try {
    const cities = await HistoryService.getCities();
    return res.json(cities); // Send the history of cities as response
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching cities from history:', error.message);
      return res.status(500).send({ error: 'Failed to fetch cities from history' });
    } else {
      console.error('Unexpected error:', error);
      return res.status(500).send({ error: 'Unexpected error occurred' });
    }
  }
});

// DELETE request to remove a city from search history by ID
router.delete('/history/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await HistoryService.removeCity(id);
    return res.status(204).send(); // No content to return on successful delete
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error removing city from history:', error.message);
      return res.status(500).send({ error: 'Failed to remove city from history' });
    } else {
      console.error('Unexpected error:', error);
      return res.status(500).send({ error: 'Unexpected error occurred' });
    }
  }
});

export default router;