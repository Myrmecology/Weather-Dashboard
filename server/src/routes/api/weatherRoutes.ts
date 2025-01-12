import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  const { cityName } = req.body;
  console.log("POST route", req.body, cityName)

  // TODO: GET weather data from city name

  try {
    // Use the WeatherService to get the weather data
    const weatherData = await WeatherService.getWeatherForCity(cityName);
    res.json(weatherData); // Send weather data back in response
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).send({ error: 'Failed to fetch weather data' });
  }

  // TODO: save city to search history
  try {
    await HistoryService.addCity(cityName);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ error: 'Failed to add city to history' });
  }
});

// TODO: GET search history
router.get('/history', async (_req, res) => {
  try {
    const cities = await HistoryService.getCities();
    res.json(cities);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ error: 'Failed to fetch cities from history' });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await HistoryService.removeCity(id);
    res.status(204).send(); // No content to return on successful delete
  } catch (error) {
    console.error('Error removing city from history:', error);
    res.status(500).send({ error: 'Failed to remove city from history' });
  }
});

export default router;