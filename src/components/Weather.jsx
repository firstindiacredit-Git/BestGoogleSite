import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
} from "lucide-react";
import { CiEdit } from "react-icons/ci";

const API_KEY = "78a1522c5ec67352674263eaaa54bffa";

const WeatherIcon = ({ condition }) => {
  const iconStyles = {
    clear: "text-yellow-400",
    rain: "text-blue-400",
    drizzle: "text-blue-300",
    snow: "text-white",
    thunderstorm: "text-purple-400",
    default: "text-gray-400",
  };

  const getIcon = () => {
    switch (condition?.toLowerCase()) {
      case "clear":
        return <Sun className={`w-16 h-16 ${iconStyles.clear}`} />;
      case "rain":
        return <CloudRain className={`w-16 h-16 ${iconStyles.rain}`} />;
      case "drizzle":
        return <CloudDrizzle className={`w-16 h-16 ${iconStyles.drizzle}`} />;
      case "snow":
        return <CloudSnow className={`w-16 h-16 ${iconStyles.snow}`} />;
      case "thunderstorm":
        return <CloudLightning className={`w-16 h-16 ${iconStyles.thunderstorm}`} />;
      default:
        return <Cloud className={`w-16 h-16 ${iconStyles.default}`} />;
    }
  };

  return (
    <div className="transform transition-transform hover:scale-105 duration-300">
      {getIcon()}
    </div>
  );
};

const WeatherCard = ({
  day,
  temperature,
  condition,
  details,
  getTemperature,
  isMain = false,
}) => (
  <div
    className={`flex flex-col items-center text-gray-100 p-2 ${
      isMain ? "bg-blue-500/10 rounded-lg" : ""
    }`}
  >
    <p className={`font-medium ${isMain ? "text-lg" : "text-sm"}`}>{day}</p>
    <WeatherIcon condition={condition} />
    <p
      className={`mt-1 ${isMain ? "text-2xl font-bold" : "text-sm"}`}
    >
      {getTemperature(temperature)}
    </p>
    {details && isMain && (
      <div className="mt-3 text-sm grid grid-cols-2 gap-3">
        <p className="bg-blue-500/20 px-3 py-1 rounded">
          Humidity: {details.humidity}%
        </p>
        <p className="bg-blue-500/20 px-3 py-1 rounded">
          Wind: {Math.round(details.wind)} m/s
        </p>
      </div>
    )}
  </div>
);

const Weather = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(null);
  const [city, setCity] = useState("Delhi");
  const [inputValue, setInputValue] = useState("");
  const [unit, setUnit] = useState(
    () => localStorage.getItem("weatherUnit") || "metric"
  );
  const [showDetails, setShowDetails] = useState(
    () => JSON.parse(localStorage.getItem("showDetails")) ?? true
  );
  const [isVisible, setIsVisible] = useState(false);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: "long" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  const getDayDifference = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    const diff = (date - today) / (1000 * 3600 * 24);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return getDayName(dateString);
  };

  const fetchWeather = async (cityName) => {
    try {
      const currentResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        { params: { q: cityName, appid: API_KEY, units: unit } }
      );
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast`,
        { params: { q: cityName, appid: API_KEY, units: unit } }
      );

      setCurrentWeather(currentResponse.data);
      const dailyForecast = forecastResponse.data.list
        .filter((_, index) => index % 8 === 0)
        .slice(1, 4);
      setForecast(dailyForecast);
      setError(null);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError(`Weather data for "${cityName}" not found.`);
      } else {
        setError("Could not fetch weather data. Please try again later.");
      }
      setCurrentWeather(null);
      setForecast([]);
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, [city, unit]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isVisible &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [isVisible]);

  const handleUnitToggle = () => {
    const newUnit = unit === "imperial" ? "metric" : "imperial";
    setUnit(newUnit);
    localStorage.setItem("weatherUnit", newUnit);
  };

  const getTemperature = (temp) => {
    return unit === "metric"
      ? `${Math.round(temp)}°C`
      : `${Math.round(temp)}°F`;
  };

  const handleCityChange = (e) => {
    setInputValue(e.target.value);
    if (!e.target.value) setError(null);
  };

  const handleCitySubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setCity(inputValue.trim());
      setInputValue("");
      setIsVisible(false);
    } else {
      setError("Please enter a valid city name.");
    }
  };

  const handleDetailsToggle = () => {
    const newShowDetails = !showDetails;
    setShowDetails(newShowDetails);
    localStorage.setItem("showDetails", JSON.stringify(newShowDetails));
  };

  return (
    <div className="w-full max-w-sm rounded-lg mx-auto text-gray-100 p-4 bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <div className="text-center flex-1">
          <h2 className="text-xl font-bold text-blue-400">Weather</h2>
          <p className="text-sm text-gray-400">{city.toUpperCase()}</p>
        </div>
        <div className="relative">
          <button
            ref={buttonRef}
            className="p-2 rounded-full hover:bg-gray-800"
            onClick={() => setIsVisible(!isVisible)}
          >
            <CiEdit className="w-5 h-5" />
          </button>

          {isVisible && (
            <div
              ref={dropdownRef}
              className="absolute right-0 w-48 mt-2 bg-gray-800 border border-gray-700 shadow-lg rounded-lg p-3 z-10"
            >
              <button
                onClick={handleUnitToggle}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded"
              >
                {unit === "imperial" ? "Switch to Celsius" : "Switch to Fahrenheit"}
              </button>
              <button
                onClick={handleDetailsToggle}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded mt-1"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>
              <form onSubmit={handleCitySubmit} className="mt-2">
                <input
                  type="text"
                  placeholder="Enter city"
                  value={inputValue}
                  onChange={handleCityChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="mt-2 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  Search
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {error ? (
        <p className="text-center text-red-400">{error}</p>
      ) : currentWeather && forecast.length > 0 ? (
        <div className="space-y-6">
          <WeatherCard
            day="Today"
            temperature={currentWeather.main.temp}
            condition={currentWeather.weather[0].main}
            details={showDetails ? {
              humidity: currentWeather.main.humidity,
              wind: currentWeather.wind.speed,
            } : null}
            getTemperature={getTemperature}
            isMain={true}
          />

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-800">
            {forecast.map((item, index) => (
              <WeatherCard
                key={index}
                day={getDayDifference(item.dt_txt)}
                temperature={item.main.temp}
                condition={item.weather[0].main}
                details={null}
                getTemperature={getTemperature}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center">Loading weather data...</p>
      )}
    </div>
  );
};

export default Weather;
