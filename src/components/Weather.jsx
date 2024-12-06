import React, { useState, useEffect } from "react";
import axios from "axios";

const Weather = () => {
  const [city, setCity] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  const API_KEY = "78a1522c5ec67352674263eaaa54bffa"; // Your OpenWeather API Key

  // Fetch weather data based on the city
  const fetchWeather = async (cityName) => {
    const BASE_URL = `https://api.openweathermap.org/data/2.5/weather`;

    try {
      const response = await axios.get(BASE_URL, {
        params: {
          q: cityName,
          appid: API_KEY,
          units: "metric",
        },
      });
      setWeatherData(response.data);
      setError(null); // Clear previous errors
    } catch (err) {
      setError("Could not fetch weather data.");
      setWeatherData(null);
    }
  };

  // Fetch user's city based on geolocation
  const fetchCityFromCoordinates = async (latitude, longitude) => {
    const GEO_URL = `https://api.openweathermap.org/geo/1.0/reverse`;

    try {
      const response = await axios.get(GEO_URL, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: API_KEY,
        },
      });
      if (response.data.length > 0) {
        const cityName = response.data[0].name;
        setCity(cityName);
        fetchWeather(cityName); // Automatically fetch weather for detected city
      }
    } catch (err) {
      setError("Could not determine your location.");
    }
  };

  // Get user's coordinates using the Geolocation API
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchCityFromCoordinates(latitude, longitude);
        },
        () => {
          setError("Enabale your Location Permission of browser.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  useEffect(() => {
    getUserLocation(); // Automatically detect city on component mount
  }, []);

  return (
    <div className="max-w-md mx-auto p-4 bg-blue-100 dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-xl font-bold text-center mb-4">Weather App</h1>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {weatherData ? (
        <div className="text-center">
          <h2 className="text-2xl font-semibold">{weatherData.name}</h2>
          <p className="text-lg">Temp: {weatherData.main.temp}°C</p>
          <p>Weather: {weatherData.weather[0].description}</p>
          <p>Humidity: {weatherData.main.humidity}%</p>
          <p>Wind Speed: {weatherData.wind.speed} m/s</p>
        </div>
      ) : (
        !error && <p className="text-center">Fetching weather data...</p>
      )}
    </div>
  );
};

export default Weather;
