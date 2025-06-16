import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

const API_KEY =
  import.meta.env.VITE_OPENWEATHER_API_KEY ||
  "78a1522c5ec67352674263eaaa54bffa";

// Background images array
const BACKGROUND_IMAGES = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1593045893612-da9b9db1d88c?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1676029461383-215556e79bc8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fEJlYXV0aWZ1bCUyMHN1bnNldCUyMG92ZXIlMjBtb3VudGFpbnN8ZW58MHx8MHx8fDA%3D",
  },
  {
    id: 7,
    url: "https://plus.unsplash.com/premium_photo-1679784157152-87caa598bacb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YmxhY2t8ZW58MHx8MHx8fDA%3D",
  },
  {
    id: 8,
    url: "https://plus.unsplash.com/premium_photo-1686730540270-93f2c33351b6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmxhY2slMjBjYXJ8ZW58MHx8MHx8fDA%3D",
  },
];

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
    background: "#e7e0cc",
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

const DEFAULT_BG = '/sunny.png';

const Weather = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("metric");
  const [isLoading, setIsLoading] = useState(true);
  const [browserInfo, setBrowserInfo] = useState(null);
  const [ipLocation, setIpLocation] = useState(null);
  const [selectedCity, setSelectedCity] = useState("New Delhi");
  const [hourlyIndex, setHourlyIndex] = useState(0);
  const [currentBackground, setCurrentBackground] = useState(null);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);

  // Dummy hourly forecast data for UI demo (replace with real API data if available)
  const dummyHourly = [
    { time: "4 PM", temp: 41, icon: "🌤️", rain: 0 },
    { time: "5 PM", temp: 40, icon: "🌤️", rain: 0 },
    { time: "6 PM", temp: 39, icon: "🌤️", rain: 1 },
    { time: "7 PM", temp: 38, icon: "🌤️", rain: 1 },
    { time: "8 PM", temp: 37, icon: "🌤️", rain: 3 },
    { time: "9 PM", temp: 36, icon: "🌤️", rain: 5 },
    { time: "10 PM", temp: 35, icon: "🌤️", rain: 7 },
  ];

  // Function to get random background
  const getRandomBackground = () => {
    const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length);
    return BACKGROUND_IMAGES[randomIndex];
  };

  // Function to select background manually
  const selectBackground = (background) => {
    setCurrentBackground(background);
    localStorage.setItem('weatherBg', background.url);
    setShowBackgroundSelector(false);
  };

  // Function to set random background
  const setRandomBackground = () => {
    const randomBg = getRandomBackground();
    setCurrentBackground(randomBg);
    localStorage.setItem('weatherBg', randomBg.url);
  };

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
    // Set random background on component mount
    const savedBg = localStorage.getItem('weatherBg');
    if (savedBg) {
      setCurrentBackground({ url: savedBg });
    } else {
      setCurrentBackground({ url: DEFAULT_BG });
    }
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

  // Hourly Forecast Card
  const HourlyForecastCard = ({ time, temp, icon, rain }) => (
    <div className="flex flex-col items-center bg-white/10 rounded-lg px-2 py-2 min-w-[60px] mx-1">
      <span className="text-xs font-medium mb-1">{time}</span>
      <span className="text-lg">{icon}</span>
      <span className="text-base font-semibold">{temp}°</span>
      <span className="text-xs opacity-70">💧 {rain}%</span>
    </div>
  );

  // Background Selector Component
  const BackgroundSelector = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select Background</h3>
          <button
            onClick={() => setShowBackgroundSelector(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {BACKGROUND_IMAGES.map((bg) => (
            <div
              key={bg.id}
              onClick={() => selectBackground(bg)}
              className="cursor-pointer rounded-lg overflow-hidden border-2 hover:border-blue-500 transition-colors"
            >
              <img
                src={bg.url}
                alt={bg.name}
                className="w-full h-24 object-cover"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={setRandomBackground}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            Random Background
          </button>
          <button
            onClick={() => setShowBackgroundSelector(false)}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-3">
        <div className="backdrop-blur-md bg-white/30 rounded-2xl shadow-xl max-w-md mx-auto w-full">
          <div className="animate-pulse h-64 flex items-center justify-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-3 h-[100px] relative"
      style={{
        backgroundImage: currentBackground ? `url(${currentBackground.url})` : `url(${DEFAULT_BG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '200px'
      }}
    >
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Background selector button */}
      <div className="absolute top-1 right-1 z-20">
        <button
          onClick={() => setShowBackgroundSelector(true)}
          className="text-white px-2 py-1 rounded hover:bg-white/30 transition-colors text-xl"
        >
          ⋮
        </button>
      </div>

      {/* Weather content */}
      <div className="flex items-center justify-center h-full relative z-10">
        <div
          className=" w-full flex items-center"
          // style={{ boxShadow: "0 4px 32px 0 rgba(0,0,0,0.15)" }}
        >
          {/* Left: Icon, Temp, City */}
          <div className="flex flex-col items-center justify-center px-6 py-4 min-w-[120px]">
            <span className="text-6xl mb-2" style={{color:'#FFB900'}}>{getWeatherCardStyle(currentWeather.weather[0].main).icon}</span>
            <span className="text-4xl font-bold text-white drop-shadow">{Math.round(currentWeather.main.temp)}°C</span>
            <span className="text-base text-white/90 font-medium mt-1 drop-shadow">{currentWeather.name}, {currentWeather.sys?.country}</span>
          </div>
          {/* Right: Main Details */}
          <div className="flex-1 flex flex-col gap-2 px-4 py-2">
            <div className="text-lg text-white font-semibold capitalize flex items-center gap-2">
              <span>{currentWeather.weather[0].main}</span>
              <span className="text-xs text-white/70 font-normal">({currentWeather.weather[0].description})</span>
            </div>
            <div className="flex items-center gap-2 text-white text-sm"><span className="text-lg">🌡️</span>Feels like: <span className="font-semibold">{Math.round(currentWeather.main.feels_like)}°C</span></div>
            <div className="flex items-center gap-2 text-white text-sm"><span className="text-lg">💧</span>Humidity: <span className="font-semibold">{currentWeather.main.humidity}%</span></div>
            <div className="flex items-center gap-2 text-white text-sm"><span className="text-lg">💨</span>Wind: <span className="font-semibold">{currentWeather.wind.speed} m/s</span> <span className="text-xs">({currentWeather.wind.deg}°)</span></div>
          </div>
        </div>
      </div>

      {/* Background selector modal */}
      {showBackgroundSelector && <BackgroundSelector />}
    </div>
  );
};

export default Weather;