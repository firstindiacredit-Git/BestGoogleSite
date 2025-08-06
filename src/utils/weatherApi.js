import axios from "axios";

const API_KEY =
  import.meta.env.VITE_OPENWEATHER_API_KEY ||
  "78a1522c5ec67352674263eaaa54bffa";

// CORS proxy options
const CORS_PROXIES = [
  "https://cors-anywhere.herokuapp.com/",
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?",
  "", // Direct call as fallback
];

const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

// Function to try different proxies
const makeWeatherRequest = async (endpoint, params, proxyIndex = 0) => {
  if (proxyIndex >= CORS_PROXIES.length) {
    throw new Error("All CORS proxies failed");
  }

  const proxy = CORS_PROXIES[proxyIndex];
  const url = proxy
    ? `${proxy}${WEATHER_BASE_URL}${endpoint}`
    : `${WEATHER_BASE_URL}${endpoint}`;

  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.warn(`Proxy ${proxyIndex} failed, trying next...`, error);
    return makeWeatherRequest(endpoint, params, proxyIndex + 1);
  }
};

export const weatherApi = {
  getCurrentWeather: async (lat, lon, units = "metric") => {
    return makeWeatherRequest("/weather", {
      lat,
      lon,
      appid: API_KEY,
      units,
    });
  },

  getForecast: async (lat, lon, units = "metric") => {
    return makeWeatherRequest("/forecast", {
      lat,
      lon,
      appid: API_KEY,
      units,
    });
  },

  getWeatherByCity: async (cityName, units = "metric") => {
    return makeWeatherRequest("/weather", {
      q: cityName,
      appid: API_KEY,
      units,
    });
  },

  getForecastByCity: async (cityName, units = "metric") => {
    return makeWeatherRequest("/forecast", {
      q: cityName,
      appid: API_KEY,
      units,
    });
  },
};
