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
    clear: "text-yellow-400 drop-shadow-md hover:drop-shadow-400/50",
    rain: "text-blue-400 shadow-blue-400/50",
    drizzle: "text-teal-300 drop-shadow-teal-300/50",
    snow: "text-gray-200 shadow-gray-200/50",
    thunderstorm: "text-purple-500 shadow-purple-500/50",
    default: "text-gray-400",
  };

  const getIcon = () => {
    switch (condition?.toLowerCase()) {
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
}) => (
  <div className="flex flex-col items-center dark:text-white p-1">
    <p className="font-bold text-sm">{day}</p>
    <WeatherIcon condition={condition} />
    <p className="text-xs mt-1">{getTemperature(temperature)}</p>
    {details && (
      <div className="mt-2 text-[10px] text-center">
        <p className="border rounded">Humidity: {details.humidity}%</p>
        <p className="border rounded mt-1">
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    <div className="w-full mx-auto p-4 bg-white dark:bg-gray-900">
      <div className="flex justify-between items-center mb-4">
        <div className="text-center m-auto">
          <h2 className="text-lg font-bold">Weather</h2>
          <p className="text-sm">{city.toUpperCase()}</p>
        </div>
        <div className="relative">
          <button
            ref={buttonRef}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setIsVisible(!isVisible)}
          >
            <CiEdit className="w-4 h-4" />
          </button>

          {isVisible && (
            <div
              ref={dropdownRef}
              className="absolute border right-0 w-48 -mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 z-10"
            >
              <button
                onClick={handleUnitToggle}
                className="block w-full border rounded  text-left px-2 py-1 text-[12px] hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {unit === "imperial" ? "Celsius .C" : "Fahrenheit .F"}
              </button>
              <button
                onClick={handleDetailsToggle}
                className="block border rounded w-full mt-1 text-left px-2 py-1 text-[12px] hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>
              <form onSubmit={handleCitySubmit} className="mt-1">
                <input
                  type="text"
                  placeholder="Enter city"
                  value={inputValue}
                  onChange={handleCityChange}
                  className="w-full p-1 border h-7 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                  type="submit"
                  className="mt-1 w-full bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Search
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {error ? (
        <p className="text-center text-red-600 dark:text-red-400">{error}</p>
      ) : currentWeather && forecast.length > 0 ? (
        <div>
          <div className="flex justify-between space-x-2">
            <WeatherCard
              day="Today"
              temperature={currentWeather.main.temp}
              condition={currentWeather.weather[0].main}
              details={showDetails ? currentWeather.main : null}
              getTemperature={getTemperature}
            />
            {forecast.map((item, index) => (
              <WeatherCard
                key={index}
                day={getDayDifference(item.dt_txt)}
                temperature={item.main.temp}
                condition={item.weather[0].main}
                details={
                  showDetails
                    ? { humidity: item.main.humidity, wind: item.wind.speed }
                    : null
                }
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
