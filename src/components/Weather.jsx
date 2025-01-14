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
import { Droplets, Wind, Settings } from "lucide-react";

const API_KEY = "78a1522c5ec67352674263eaaa54bffa";

const themes = {
  default: {
    background: "bg-white dark:bg-[#28283A]",
    text: "text-gray-700 dark:text-white",
    card: "bg-gray-50 dark:bg-[#513a7a]",
    accent: "text-indigo-500",
    hover: "hover:bg-gray-100 dark:hover:bg-gray-800",
    border: "border-gray-200 dark:border-gray-700",
  },
  blue: {
    background: "bg-blue-50 dark:bg-blue-900",
    text: "text-indigo-700 dark:text-blue-50",
    card: "bg-blue-100/50 dark:bg-[#513a7a]/50",
    accent: "text-indigo-600 dark:text-blue-400",
    hover: "hover:bg-blue-100 dark:hover:bg-indigo-800",
    border: "border-blue-200 dark:border-blue-700",
  },
  green: {
    background: "bg-green-50 dark:bg-green-900",
    text: "text-green-700 dark:text-green-50",
    card: "bg-green-100/50 dark:bg-green-800/50",
    accent: "text-green-600 dark:text-green-400",
    hover: "hover:bg-green-100 dark:hover:bg-green-800",
    border: "border-green-200 dark:border-green-700",
  },
  purple: {
    background: "bg-purple-50 dark:bg-purple-900",
    text: "text-purple-700 dark:text-purple-50",
    card: "bg-purple-100/50 dark:bg-purple-800/50",
    accent: "text-purple-600 dark:text-purple-400",
    hover: "hover:bg-purple-100 dark:hover:bg-purple-800",
    border: "border-purple-200 dark:border-purple-700",
  },
  orange: {
    background: "bg-orange-50 dark:bg-orange-900",
    text: "text-orange-700 dark:text-orange-50",
    card: "bg-orange-100/50 dark:bg-orange-800/50",
    accent: "text-orange-600 dark:text-orange-400",
    hover: "hover:bg-orange-100 dark:hover:bg-orange-800",
    border: "border-orange-200 dark:border-orange-700",
  },
};



const WeatherCard = ({
  temperature,
  details,
  getTemperature,
  isMain = false,
  theme = "default",
}) => (
  <div className="space-y-3 my-2 ">
    <div className=" flex justify-center">
      <div className="w-full  mb-6">
      <p className={`text-7xl text-center font-bold tracking-tight ${themes[theme].text}`}>
        {getTemperature(temperature)}
      </p>
      </div>
    </div>

    {details && isMain && (
      <div className="grid grid-cols-2 gap-4">
        <div
          className={`flex items-center gap-3 p-3 rounded-sm ${themes[theme].card} ${themes[theme].text}`}
        >
          <Droplets className={`w-5 h-5 ${themes[theme].accent}`} />
          <span className="text-base">{details.humidity}%</span>
        </div>
        <div
          className={`flex items-center gap-3 p-3 rounded-sm ${themes[theme].card} ${themes[theme].text}`}
        >
          <Wind className={`w-5 h-5 ${themes[theme].accent}`} />
          <span className="text-base">{Math.round(details.wind)} m/s</span>
        </div>
      </div>
    )}
  </div>
);

const ThemeSelector = ({ currentTheme, onThemeChange }) => (
  <div className="p-2 grid grid-cols-5 gap-2">
    {Object.keys(themes).map((themeName) => (
      <button
        key={themeName}
        onClick={() => onThemeChange(themeName)}
        className={`w-6 h-6 rounded-full border-2 transition-transform ${
          currentTheme === themeName
            ? "scale-125 border-blue-500"
            : "border-gray-300"
        } ${themes[themeName].background}`}
        title={`${
          themeName.charAt(0).toUpperCase() + themeName.slice(1)
        } theme`}
      />
    ))}
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
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("weatherTheme") || "default"
  );

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

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

  // const handleCityChange = (e) => {
  //   setInputValue(e.target.value);
  //   if (!e.target.value) setError(null);
  // };

  // const handleCitySubmit = (e) => {
  //   e.preventDefault();
  //   if (inputValue.trim()) {
  //     setCity(inputValue.trim());
  //     setInputValue("");
  //     setIsVisible(false);
  //   } else {
  //     setError("Please enter a valid city name.");
  //   }
  // };

  const handleDetailsToggle = () => {
    const newShowDetails = !showDetails;
    setShowDetails(newShowDetails);
    localStorage.setItem("showDetails", JSON.stringify(newShowDetails));
  };

  const handleLocationToggle = () => {
    setIsVisible(false);
  };

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    localStorage.setItem("weatherTheme", theme);
  };

  return (
    <div
      className={`w-full max-w-xl rounded-b-sm  transition-colors ${themes[currentTheme].background} ${themes[currentTheme].text}`}
    >
      <div className="px-4 py-2">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{city}</h2>
          <span>Weather</span>
          <div className="relative">
            <button
              ref={buttonRef}
              className={`p-2 rounded-sm transition-colors ${themes[currentTheme].hover}`}
              onClick={() => setIsVisible(!isVisible)}
            >
              <Settings className="w-5 h-5" />
            </button>
            {isVisible && (
              <div
                ref={dropdownRef}
                className={`absolute right-0 mt-2 w-48 rounded-sm shadow-lg ${themes[currentTheme].background} border ${themes[currentTheme].border} z-50`}
              >
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium mb-1">Theme</p>
                  <ThemeSelector
                    currentTheme={currentTheme}
                    onThemeChange={handleThemeChange}
                  />
                </div>
                <button
                  onClick={handleUnitToggle}
                  className={`w-full text-left px-4 py-2 text-sm ${themes[currentTheme].hover}`}
                >
                  {unit === "imperial"
                    ? "Switch to Celsius"
                    : "Switch to Fahrenheit"}
                </button>
                <button
                  onClick={handleDetailsToggle}
                  className={`w-full text-left px-4 py-2 text-sm ${themes[currentTheme].hover}`}
                >
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
                <button
                  onClick={handleLocationToggle}
                  className={`w-full text-left px-4 py-2 text-sm ${themes[currentTheme].hover}`}
                >
                  Change Location
                </button>
              </div>
            )}
          </div>
        </div>

        {error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : currentWeather && forecast.length > 0 ? (
          <WeatherCard
            temperature={currentWeather.main.temp}
            condition={currentWeather.weather[0].main}
            details={
              showDetails
                ? {
                    humidity: currentWeather.main.humidity,
                    wind: currentWeather.wind.speed,
                  }
                : null
            }
            getTemperature={getTemperature}
            isMain={true}
            theme={currentTheme}
          />
        ) : (
          <div className="flex justify-center items-center h-32">
            <div
              className={`animate-spin rounded-full h-8 w-8 border-b-2 ${themes[currentTheme].text}`}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;
