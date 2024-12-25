import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
} from "lucide-react";

const API_KEY = "78a1522c5ec67352674263eaaa54bffa";
const CITY = "Delhi";

const WeatherIcon = ({ condition }) => {
  const iconStyles = {
    clear: "text-yellow-400 drop-shadow-md hover:drop-shadow-400/50",
    rain: "text-blue-400  shadow-blue-400/50",
    drizzle: "text-teal-300 drop- shadow-teal-300/50",
    snow: "text-gray-200  shadow-gray-200/50",
    thunderstorm: "text-purple-500  shadow-purple-500/50",
    default: "text-gray-400 ", // Added shadow to default
  };

  const getIcon = () => {
    switch (condition.toLowerCase()) {
      case "clear":
        return <Sun className={`w-10 h-10 ${iconStyles.clear}`} />;
      case "rain":
        return <CloudRain className={`w-10 h-10 ${iconStyles.rain}`} />;
      case "drizzle":
        return <CloudDrizzle className={`w-10 h-10 ${iconStyles.drizzle}`} />;
      case "snow":
        return <CloudSnow className={`w-10 h-10 ${iconStyles.snow}`} />;
      case "thunderstorm":
        return (
          <CloudLightning className={`w-10 h-10 ${iconStyles.thunderstorm}`} />
        );
      default:
        return <Cloud className={`w-10 h-10 ${iconStyles.default}`} />;
    }
  };

  return (
    <div className="transform  transition-transform hover:scale-105 duration-300">
      {getIcon()}
    </div>
  );
};

const WeatherCard = ({ day, temperature, condition }) => (
  <div className="flex flex-col items-center dark:text-white p-1">
    <p className="font-bold text-sm">{day}</p>
    <WeatherIcon condition={condition} />
    <p className="text-xs mt-1">{temperature}°F</p>
  </div>
);

const Weather = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(null);

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: "long" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  const getDaysFromForecast = () => {
    const today = new Date();
    return ["Now", ...forecast.slice(1).map((item) => getDayName(item.dt_txt))];
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const currentResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather`,
          { params: { q: CITY, appid: API_KEY, units: "imperial" } }
        );
        const forecastResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast`,
          { params: { q: CITY, appid: API_KEY, units: "imperial" } }
        );

        setCurrentWeather(currentResponse.data);
        const dailyForecast = forecastResponse.data.list.filter(
          (_, index) => index % 8 === 0
        );
        setForecast(dailyForecast);
        setError(null);
      } catch {
        setError("Could not fetch weather data.");
      }
    };
    fetchWeather();
  }, []);

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  if (!currentWeather || forecast.length === 0) {
    return <p className="text-white">Fetching weather data...</p>;
  }

  const days = getDaysFromForecast();

  return (
    <div className="dark:bg-transparent border dark:text-white rounded-xl p-1 max-w-sm mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold">Weather</h2>
        <p className="text-sm">{CITY.toUpperCase()}</p>
      </div>
      <div className="flex justify-between space-x-1">
        {forecast.slice(0, 4).map((item, index) => (
          <WeatherCard
            key={index}
            day={days[index]}
            temperature={Math.round(item.main.temp)}
            condition={item.weather[0].main}
          />
        ))}
      </div>
    </div>
  );
};

export default Weather;
