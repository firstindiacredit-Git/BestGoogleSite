import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

const API_KEY = "78a1522c5ec67352674263eaaa54bffa";

// Predefined neon colors
// const neonPresets = [
//   {
//     label: "Neon Blue",
//     colors: {
//       background: "#0c1445",
//       accent: "#00fff2",
//       bottomBg: "#1a237e",
//       buttonBg: "#283593",
//     },
//   },
//   {
//     label: "Neon Pink",
//     colors: {
//       background: "#2d0a31",
//       accent: "#ff00ff",
//       bottomBg: "#4a1850",
//       buttonBg: "#6a1b9a",
//     },
//   },
//   {
//     label: "Neon Green",
//     colors: {
//       background: "#0a2d0a",
//       accent: "#39ff14",
//       bottomBg: "#1b5e20",
//       buttonBg: "#2e7d32",
//     },
//   },
//   {
//     label: "Cyberpunk",
//     colors: {
//       background: "#2b213a",
//       accent: "#f0fb3d",
//       bottomBg: "#453750",
//       buttonBg: "#5c4069",
//     },
//   },
// ];

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px) translateX(0px); }
  50% { transform: translateY(-20px) translateX(10px); }
  100% { transform: translateY(0px) translateX(0px); }
`;

const rain = keyframes`
  0% { transform: translateY(-10px); opacity: 0; }
  70% { opacity: 0.7; }
  100% { transform: translateY(30px); opacity: 0; }
`;

const snow = keyframes`
  0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
  50% { opacity: 0.7; }
  100% { transform: translateY(30px) rotate(360deg); opacity: 0; }
`;

const thunder = keyframes`
  0% { opacity: 0; }
  10% { opacity: 1; }
  20% { opacity: 0; }
  30% { opacity: 1; }
  40% { opacity: 0; }
  100% { opacity: 0; }
`;

const getWeatherBackground = (weatherType) => {
  switch (weatherType) {
    case "clear":
      return "https://i.imgur.com/8Kw4krW.gif"; // Sunny clear sky
    case "cloudy":
      return "https://i.imgur.com/Iwnj05d.gif"; // Cloudy sky
    case "rainy":
      return "https://i.imgur.com/g4risdG.gif"; // Rain
    case "snowy":
      return "https://i.imgur.com/EwQgpZY.gif"; // Snow
    case "thunder":
      return "https://i.imgur.com/WzI0mE7.gif"; // Thunder
    case "mist":
      return "https://i.imgur.com/vH9YqyE.gif"; // Misty
    default:
      return "https://i.imgur.com/8Kw4krW.gif"; // Default clear sky
  }
};
const getWeatherIcon = (weatherType) => {
  const type = weatherType?.toLowerCase() || "";
  if (type.includes("clear")) {
    return (
      <svg
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        className="w-20 scale-[110%]"
      >
        <defs>
          <linearGradient id="sun" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="16" fill="url(#sun)" />
        <g
          fill="none"
          stroke="#fbbf24"
          strokeLinecap="round"
          strokeMiterlimit="10"
          strokeWidth="2"
        >
          <path d="M32 5v7M32 52v7M59 32h-7M12 32H5M51.5 12.5l-5 5M17.5 46.5l-5 5M51.5 51.5l-5-5M17.5 17.5l-5-5">
            <animateTransform
              attributeName="transform"
              dur="45s"
              repeatCount="indefinite"
              type="rotate"
              values="0 32 32; 360 32 32"
            />
          </path>
        </g>
      </svg>
    );
  }
  if (type.includes("cloud")) {
    return (
      <svg
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        className="w-20 scale-[110%]"
      >
        <defs>
          <linearGradient id="cloud" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3f7fe" />
            <stop offset="100%" stopColor="#deeafb" />
          </linearGradient>
        </defs>
        <path
          d="M46.5 31.5h-.32a10.49 10.49 0 00-19.11-8 7 7 0 00-10.57 6 7.21 7.21 0 00.1 1.14A7.5 7.5 0 0018 45.5a4.19 4.19 0 00.5 0v0h28a7 7 0 000-14z"
          fill="url(#cloud)"
          stroke="#e6effc"
          strokeMiterlimit="10"
          strokeWidth=".5"
        />
      </svg>
    );
  }
  if (type.includes("rain")) {
    return (
      <svg
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        className="w-20 scale-[110%]"
      >
        <defs>
          <linearGradient id="rain-cloud" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3f7fe" />
            <stop offset="100%" stopColor="#deeafb" />
          </linearGradient>
          <linearGradient id="rain-drop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4286ee" />
            <stop offset="100%" stopColor="#0950bc" />
          </linearGradient>
        </defs>
        <path
          d="M46.5 31.5h-.32a10.49 10.49 0 00-19.11-8 7 7 0 00-10.57 6 7.21 7.21 0 00.1 1.14A7.5 7.5 0 0018 45.5a4.19 4.19 0 00.5 0v0h28a7 7 0 000-14z"
          fill="url(#rain-cloud)"
          stroke="#e6effc"
          strokeMiterlimit="10"
          strokeWidth=".5"
        />
        <g
          fill="none"
          stroke="url(#rain-drop)"
          strokeLinecap="round"
          strokeMiterlimit="10"
          strokeWidth="2"
        >
          <path d="M24.39 43.03l-.78 4.94">
            <animateTransform
              attributeName="transform"
              dur="0.7s"
              repeatCount="indefinite"
              type="translate"
              values="1 -5; -2 10"
            />
          </path>
          <path d="M31.39 43.03l-.78 4.94">
            <animateTransform
              attributeName="transform"
              begin="-0.4s"
              dur="0.7s"
              repeatCount="indefinite"
              type="translate"
              values="1 -5; -2 10"
            />
          </path>
          <path d="M38.39 43.03l-.78 4.94">
            <animateTransform
              attributeName="transform"
              begin="-0.2s"
              dur="0.7s"
              repeatCount="indefinite"
              type="translate"
              values="1 -5; -2 10"
            />
          </path>
        </g>
      </svg>
    );
  }
  // Default icon (can add more weather conditions)
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className="w-20 scale-[110%]"
    >
      <defs>
        <linearGradient id="default-cloud" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f3f7fe" />
          <stop offset="100%" stopColor="#deeafb" />
        </linearGradient>
      </defs>
      <path
        d="M46.5 31.5h-.32a10.49 10.49 0 00-19.11-8 7 7 0 00-10.57 6 7.21 7.21 0 00.1 1.14A7.5 7.5 0 0018 45.5a4.19 4.19 0 00.5 0v0h28a7 7 0 000-14z"
        fill="url(#default-cloud)"
        stroke="#e6effc"
        strokeMiterlimit="10"
        strokeWidth=".5"
      />
    </svg>
  );
};

const Weather = ({ collapsed }) => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("metric");
  const [city, setCity] = useState("");
  const [isVisible, setisVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const settingsRef = useRef(null);
  const searchInputRef = useRef(null);
  const [browserInfo, setBrowserInfo] = useState(null);
  const [ipLocation, setIpLocation] = useState(null);
  const { isDarkMode } = useTheme();

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
      const dailyForecast = forecastResponse.data.list
        .filter((_, index) => index % 8 === 0)
        .slice(1, 3); // Get next 4 days
      setForecast(dailyForecast);
      setCity(currentResponse.data.name);
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

  const isCollapse = () => {
    setisVisible(!isVisible);
  };

  useEffect(() => {
    getUserLocation();
  }, [unit]);

  const getDayName = (date) => {
    return new Date(date).toLocaleDateString("en-US", { weekday: "short" });
  };

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
  const getWeatherAnimation = (weatherCode) => {
    const code = weatherCode?.toLowerCase() || "";
    if (code.includes("clear")) return "clear";
    if (
      code.includes("cloud") ||
      code.includes("haze") ||
      code.includes("mist")
    )
      return "cloudy";
    if (code.includes("rain")) return "rainy";
    if (code.includes("snow")) return "snowy";
    if (code.includes("thunder")) return "thunder";
    return "default";
  };

  return (
    <div className="p-2 backdrop-blur-sm">
      {isVisible && (
        <StyledWrapper
          isDarkMode={isDarkMode}
          weatherType={
            currentWeather
              ? getWeatherAnimation(currentWeather.weather[0].main)
              : "default"
          }
          weatherBackground={
            currentWeather
              ? getWeatherBackground(
                  getWeatherAnimation(currentWeather.weather[0].main)
                )
              : getWeatherBackground("default")
          }
        >
          <div className="weather-container h-[19rem]">
            <div className="content-wrapper flex-col">
              {/* Main Weather Card */}
              <div className="duration-300 font-mono dark:text-white text-gray-700 group cursor-default relative overflow-hidden w-full h-[48.5%]  rounded-sm p-6 ">
                <div className="flex justify-between -mt-4 items-center">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">Today</h3>
                    {currentWeather && (
                      <div className="flex items-center gap-6">
                        <h4 className="font-sans ml-2 text-6xl">
                          {Math.round(currentWeather.main.temp)}°
                        </h4>
                        <div className="text-lg">
                          <p>{currentWeather.weather[0].description}</p>
                          <p>{currentWeather.main.humidity}% humidity</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex justify-center items-center">
                    {currentWeather && (
                      <div className="w-30 h-30">
                        <img
                          src={`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@4x.png`}
                          alt={currentWeather.weather[0].description}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex justify-end items-start">
                    <div className="text-lg text-right">
                      <p className="text-2xl">
                        {new Date().toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </p>
                      <p>
                        {new Date().toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="forecast-container   h-[48.5%] w-full flex justify-between">
                {forecast.map((day, index) => (
                  <div
                    key={index}
                    className=" font-mono group cursor-default dark:text-white relative overflow-hidden text-black bg-white/[(var(--widget-opacity))] h-full w-[48.5%] dark:bg-[#8163D3]/[(var(--widget-opacity))] rounded-sm  p-2  hover:bg-indigo-100/[var(--widget-opacity)] hover:dark:bg-[#0C66E4]/[(var(--widget-opacity))]"
                  >
                    <h3 className="text-sm text-center">
                      {getDayName(day.dt_txt)}
                    </h3>
                    <div className="gap-4 relative">
                      <img
                        src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                        alt={day.weather[0].description}
                        className="w-16 h-16 mx-auto"
                      />
                      <h4 className="font-sans duration-300 absolute left-1/2 -translate-x-1/2 text-3xl text-center group-hover:translate-x-9 group-hover:-translate-y-12 group-hover:scale-125">
                        {Math.round(day.main.temp)}°
                      </h4>
                    </div>
                    <div className="absolute duration-300 -left-32 mt-1 group-hover:left-8">
                      <p className="text-xs">{day.weather[0].description}</p>
                      <p className="text-xs">{day.main.humidity}% humidity</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </StyledWrapper>
      )}
    </div>
  );
};

const StyledWrapper = styled.div`
  .weather-container {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 0 2px;
  }

  .content-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-wrap: wrap;
    height: 100%;
  }

  .forecast-container {
    display: flex;
    flex-wrap: wrap;
  }

  .mode-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;

    button {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 30%;
      font-size: 20px;
      transition: transform 0.3s ease;
      backdrop-filter: blur(8px);
      background: rgba(255, 255, 255, 0.1);

      &:hover {
        transform: scale(1.1) rotate(360deg);
      }
    }
  }

  /* Weather Icons */
  .weather-icon {
    width: 50px;
    height: 50px;
    margin: 0 auto;
    display: block;
  }

  /* Animations */
  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .content-wrapper {
      justify-content: center;
    }

    .forecast-container {
      justify-content: center;
    }
  }
`;

export default Weather;
