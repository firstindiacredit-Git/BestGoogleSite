import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

const API_KEY =
  import.meta.env.VITE_OPENWEATHER_API_KEY ||
  "78a1522c5ec67352674263eaaa54bffa";

// Define weather cards with monochromatic color schemes
const WEATHER_CARDS = {
  // Sunny (yellow)
  SUNNY: {
    background: "#FFB900",
    darkShade: "#ffae00", // Dark yellow-brown
    darkerShade: "#c18400", // Darker yellow-brown
    color: "#FFFFFF",
    icon: "☀️",
  },
  // Cloudy (light blue)
  CLOUDY: {
    background: "#3aa3ff",
    darkShade: "#0070d3", // Dark blue-gray
    darkerShade: "#0058a5", // Darker blue-gray
    color: "#FFFFFF",
    icon: "☁️",
  },
  // Rainy (darker blue)
  RAINY: {
    background: "#7F95D1",
    darkShade: "#1C2542", // Dark navy blue
    darkerShade: "#11192C", // Darker navy blue
    color: "#FFFFFF",
    icon: "🌧️",
  },
  // Snowy (light purple)
  SNOWY: {
    background: "#C0B3E2",
    darkShade: "#2A2437", // Dark purple
    darkerShade: "#1A1621", // Darker purple
    color: "#FFFFFF",
    icon: "❄️",
  },
  // Thunderstorm (dark purple)
  THUNDER: {
    background: "#8776B4",
    darkShade: "#1E1A2B", // Dark deep purple
    darkerShade: "#12101A", // Darker deep purple
    color: "#FFFFFF",
    icon: "⚡",
  },
  // Foggy/Misty (gray-blue)
  FOGGY: {
    background: "#B8C6DB",
    darkShade: "#232A33", // Dark gray-blue
    darkerShade: "#161A20", // Darker gray-blue
    color: "#FFFFFF",
    icon: "🌫️",
  },
};

const getWeatherCardStyle = (weatherType) => {
  switch (weatherType.toLowerCase()) {
    case "clear":
      return WEATHER_CARDS.SUNNY;
    case "clouds":
      return WEATHER_CARDS.CLOUDY;
    case "rain":
      return WEATHER_CARDS.RAINY;
    case "snow":
      return WEATHER_CARDS.SNOWY;
    case "thunderstorm":
      return WEATHER_CARDS.THUNDER;
    case "mist":
    case "fog":
      return WEATHER_CARDS.FOGGY;
    default:
      return WEATHER_CARDS.SUNNY;
  }
};

const Weather = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("metric");
  // const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [browserInfo, setBrowserInfo] = useState(null);
  const [ipLocation, setIpLocation] = useState(null);

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      const currentResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        { params: { lat, lon, appid: API_KEY, units: unit } }
      );
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast`,
        { params: { lat, lon, appid: API_KEY, units: unit } }
      );

      setCurrentWeather(currentResponse.data);
      // const dailyForecast = forecastResponse.data.list
      //   .filter((_, index) => index % 8 === 0)
      //   .slice(1, 3); // Get next 4 days
      // setForecast(dailyForecast);
      // setCity(currentResponse.data.name);
      setError(null);
    } catch (error) {
      setError("Could not fetch weather data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeatherByCity = async (cityName) => {
    try {
      setIsLoading(true);
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
        .slice(1, 3); // Get next 4 days
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
    } finally {
      setIsLoading(false);
    }
  };

  // Add IP-based location fetch
  const getLocationByIP = async () => {
    try {
      const response = await axios.get("https://ipapi.co/json/");
      setIpLocation({
        city: response.data.city,
        country: response.data.country_name,
        latitude: response.data.latitude,
        longitude: response.data.longitude,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching IP location:", error);
      return null;
    }
  };

  const getUserLocation = async () => {
    setIsLoading(true);
    setBrowserInfo(getBrowserInfo());

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        async (error) => {
          console.error("Geolocation error:", error);
          // Fallback to IP-based location
          const ipData = await getLocationByIP();
          if (ipData) {
            fetchWeatherByCoords(ipData.latitude, ipData.longitude);
          } else {
            fetchWeatherByCity("New York"); // Final fallback
          }
        }
      );
    } else {
      // Fallback to IP-based location if geolocation is not supported
      const ipData = await getLocationByIP();
      if (ipData) {
        fetchWeatherByCoords(ipData.latitude, ipData.longitude);
      } else {
        fetchWeatherByCity("New York"); // Final fallback
      }
    }
  };

  useEffect(() => {
    getUserLocation();
  }, [unit]);

  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    const browserData = {
      name: "Unknown",
      version: "Unknown",
      os: navigator.platform || "Unknown",
    };

    // Browser detection
    if (userAgent.includes("Firefox/")) {
      browserData.name = "Firefox";
      browserData.version = userAgent.split("Firefox/")[1];
    } else if (userAgent.includes("Edge/")) {
      browserData.name = "Edge";
      browserData.version = userAgent.split("Edge/")[1];
    } else if (userAgent.includes("Chrome/")) {
      browserData.name = "Chrome";
      browserData.version = userAgent.split("Chrome/")[1].split(" ")[0];
    } else if (userAgent.includes("Safari/")) {
      browserData.name = "Safari";
      browserData.version = userAgent.split("Version/")[1].split(" ")[0];
    }

    // OS detection
    if (userAgent.includes("Windows")) {
      browserData.os = "Windows";
    } else if (userAgent.includes("Mac")) {
      browserData.os = "MacOS";
    } else if (userAgent.includes("Linux")) {
      browserData.os = "Linux";
    }

    return browserData;
  };

  // Current Weather Card Component
  const CurrentWeatherCard = ({
    temperature,
    condition,
    description,
    location,
    humidity,
    time,
    date,
  }) => {
    const cardStyle = getWeatherCardStyle(condition);

    return (
      <div className="current-weather-card overflow-hidden rounded-lg shadow-md">
        {/* Card Header - Color Block with Temperature and Icon */}
        <div
          className="p-3 flex justify-between items-start"
          style={{ background: cardStyle.background, color: cardStyle.color }}
        >
          <div>
            <div className="text-5xl font-bold">{temperature}°</div>
            <div className="text-lg mt-1 opacity-90">{condition}</div>
          </div>
          <div className="text-4xl">{cardStyle.icon}</div>
        </div>

        {/* Card Body - Location and Details */}
        <div
          style={{ background: cardStyle.darkShade, color: "#FFFFFF" }}
          className="p-2"
        >
          <div className="text-base font-medium">{location}</div>
          <div className="text-xs opacity-80">{description}</div>
          <div className="text-xs opacity-70">Humidity: {humidity}%</div>
        </div>

        {/* Card Footer - Time & Date */}
        <div
          style={{ background: cardStyle.darkerShade, color: "#FFFFFF" }}
          className="p-2 flex justify-between items-center"
        >
          <span className="text-xs font-medium">{time}</span>
          <span className="text-xs">{date}</span>
        </div>
      </div>
    );
  };

  // Forecast Weather Card Component

  if (isLoading) {
    return (
      <div className="p-3 backdrop-blur-sm">
        <div className="weather-container ">
          <div className="content-wrapper flex-col">
            {currentWeather && (
              <div className="flex flex-col gap-2">
                <CurrentWeatherCard
                  temperature={"00"}
                  condition={"Unknown"}
                  description={"currentWeather.weather[0].description"}
                  location={"Unknown"}
                  humidity={"00"}
                  time={new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                  date={new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-3 backdrop-blur-sm">
      <div className="weather-container ">
        <div className="content-wrapper flex-col">
          {currentWeather && (
            <div className="flex flex-col gap-2">
              {/* Main Weather Card */}
              <CurrentWeatherCard
                temperature={Math.round(currentWeather.main.temp)}
                condition={currentWeather.weather[0].main}
                description={currentWeather.weather[0].description}
                location={currentWeather.name}
                humidity={currentWeather.main.humidity}
                time={new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
                date={new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Weather;
