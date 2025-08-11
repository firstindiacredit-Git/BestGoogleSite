import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { Modal, Tabs, Radio, Space, Button, Alert } from "antd";
import { PictureOutlined, BgColorsOutlined, DeleteOutlined, SyncOutlined } from "@ant-design/icons";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { FaEllipsisV } from "react-icons/fa";

const API_KEY =
  import.meta.env.VITE_OPENWEATHER_API_KEY ||
  "78a1522c5ec67352674263eaaa54bffa";

// Background images array
const BACKGROUND_IMAGES = [
  // {
  //   id: 1,
  //   url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  // },
  // {
  //   id: 2,
  //   url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80",
  // },
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

// Add gradient options
const GRADIENT_OPTIONS = [
  {
    id: 'gradient-1',
    name: 'Sunset',
    style: 'linear-gradient(45deg, #ff6b6b, #ffd93d)'
  },
  {
    id: 'gradient-2',
    name: 'Ocean',
    style: 'linear-gradient(45deg, #2193b0, #6dd5ed)'
  },
  {
    id: 'gradient-3',
    name: 'Forest',
    style: 'linear-gradient(45deg, #11998e, #38ef7d)'
  },
  {
    id: 'gradient-4',
    name: 'Purple',
    style: 'linear-gradient(45deg, #8e2de2, #4a00e0)'
  },
  {
    id: 'gradient-5',
    name: 'Midnight',
    style: 'linear-gradient(45deg, #232526, #414345)'
  },
  {
    id: 'gradient-6',
    name: 'Cherry',
    style: 'linear-gradient(45deg, #eb3349, #f45c43)'
  }
];

// Define weather cards with monochromatic color schemes
const WEATHER_CARDS = {
  // Sunny (yellow)
  SUNNY: {
    background: "#FFB900",
    darkShade: "#ffae00", // Dark yellow-brown
    darkerShade: "#c18400", // Darker yellow-brown
    color: "#FFFFFF",
    icon: "https://assets.msn.com/weathermapdata/1/static/weather/Icons/taskbar_v10/Condition_Card/Haze.svg",
  },

   // Clear (light blue)
   CLEAR: {
    background: "#87CEEB",
    darkShade: "#5F9EA0", // Dark sky blue
    darkerShade: "#4682B4", // Darker sky blue
    color: "#FFFFFF",
    icon: <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="36" cy="36" r="25" fill="url(#paint0_linear_clear)"/>
            <circle cx="36" cy="36" r="25" fill="url(#paint1_linear_clear)"/>
            <defs>
              <linearGradient id="paint0_linear_clear" x1="11" y1="11" x2="61" y2="61" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFD700"/>
                <stop offset="0.5" stopColor="#FFA500"/>
                <stop offset="1" stopColor="#FF8C00"/>
              </linearGradient>
              <linearGradient id="paint1_linear_clear" x1="61" y1="11" x2="11" y2="61" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFD700"/>
                <stop offset="0.5" stopColor="#FFA500"/>
                <stop offset="1" stopColor="#FF8C00"/>
              </linearGradient>
            </defs>
          </svg>,
  },
  // Cloudy (light blue)
  CLOUDY: {
    background: "#e7e0cc",
    darkShade: "#0070d3", // Dark blue-gray
    darkerShade: "#0058a5", // Darker blue-gray
    color: "#FFFFFF",
    icon: <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="36" cy="36" r="30" fill="url(#paint0_linear_59_26715)"/>
            <circle cx="36" cy="36" r="30" fill="url(#paint1_linear_59_26715)"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M69 15C70.6569 15 72 16.3431 72 18C72 19.6569 70.6569 21 69 21H36C34.3431 21 33 19.6569 33 18C33 16.3431 34.3431 15 36 15H69ZM3 39C1.34315 39 0 40.3431 0 42C0 43.6569 1.34315 45 3 45H36C37.6569 45 39 43.6569 39 42C39 40.3431 37.6569 39 36 39H3ZM45 42C45 40.3431 46.3431 39 48 39H57C58.6569 39 60 40.3431 60 42C60 43.6569 58.6569 45 57 45H48C46.3431 45 45 43.6569 45 42ZM24 15C25.6569 15 27 16.3431 27 18C27 19.6569 25.6569 21 24 21H15C13.3431 21 12 19.6569 12 18C12 16.3431 13.3431 15 15 15H24ZM0 54C0 52.3431 1.34315 51 3 51H57C58.6569 51 60 52.3431 60 54C60 55.6569 58.6569 57 57 57H3C1.34315 57 0 55.6569 0 54ZM15 27C13.3431 27 12 28.3431 12 30C12 31.6569 13.3431 33 15 33H69C70.6569 33 72 31.6569 72 30C72 28.3431 70.6569 27 69 27H15Z" fill="url(#paint2_linear_59_26715)"/>
            <defs>
            <linearGradient id="paint0_linear_59_26715" x1="14.4375" y1="14.4375" x2="65.9965" y2="60.9334" gradientUnits="userSpaceOnUse">
            <stop offset="0.162966" stopColor="#FFE975"/>
            <stop offset="0.53915" stopColor="#FFB729"/>
            <stop offset="0.742056" stopColor="#FF9900"/>
            </linearGradient>
            <linearGradient id="paint1_linear_59_26715" x1="51.0026" y1="62.0423" x2="20.9976" y2="10.072" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E25A01"/>
            <stop offset="1" stopColor="#FFD400"/>
            </linearGradient>
            <linearGradient id="paint2_linear_59_26715" x1="43.0435" y1="57" x2="50.6004" y2="17.4094" gradientUnits="userSpaceOnUse">
            <stop stopColor="#DAC48C"/>
            <stop offset="1" stopColor="#F8F3E2"/>
            </linearGradient>
            </defs>
            </svg>,
  },
  // Rainy (darker blue)
  RAINY: {
    background: "#7F95D1",
    darkShade: "#1C2542", // Dark navy blue
    darkerShade: "#11192C", // Darker navy blue
    color: "#FFFFFF",
    icon: 
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M13.5 54H34.5H36H55.5C64.6127 54 72 46.6127 72 37.5C72 28.3873 64.6127 21 55.5 21C55.1382 21 54.7791 21.0116 54.4231 21.0346C50.6566 13.879 43.1481 9 34.5 9C23.6003 9 14.5107 16.7504 12.4418 27.0409C5.48057 27.5806 0 33.4003 0 40.5C0 47.9558 6.04416 54 13.5 54Z" fill="#E7F1FF"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M13.5 54H34.5H36H55.5C64.6127 54 72 46.6127 72 37.5C72 28.3873 64.6127 21 55.5 21C55.1382 21 54.7791 21.0116 54.4231 21.0346C50.6566 13.879 43.1481 9 34.5 9C23.6003 9 14.5107 16.7504 12.4418 27.0409C5.48057 27.5806 0 33.4003 0 40.5C0 47.9558 6.04416 54 13.5 54Z" fill="url(#paint0_linear_537_36557)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M13.5 54H34.5H36H55.5C64.6127 54 72 46.6127 72 37.5C72 28.3873 64.6127 21 55.5 21C55.1382 21 54.7791 21.0116 54.4231 21.0346C50.6566 13.879 43.1481 9 34.5 9C23.6003 9 14.5107 16.7504 12.4418 27.0409C5.48057 27.5806 0 33.4003 0 40.5C0 47.9558 6.04416 54 13.5 54Z" fill="url(#paint1_linear_537_36557)"/>
    <path d="M0 40.5C0 33.0442 6.04416 27 13.5 27H18C27.9411 27 36 35.0589 36 45V54H13.5C6.04416 54 0 47.9558 0 40.5Z" fill="url(#paint2_radial_537_36557)"/>
    <path d="M12 31.5C12 19.0736 22.0736 9 34.5 9C46.9264 9 57 19.0736 57 31.5C57 43.9264 46.9264 54 34.5 54C22.0736 54 12 43.9264 12 31.5Z" fill="url(#paint3_radial_537_36557)"/>
    <circle cx="55.5" cy="37.5" r="16.5" fill="url(#paint4_radial_537_36557)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M45 61.5002V41.1006C45 39.2254 47.2709 38.2904 48.5912 39.6219L62.8413 53.9931C64.7903 55.8994 66 58.5585 66 61.5002C66 67.2992 61.299 72.0002 55.5 72.0002C49.701 72.0002 45 67.2992 45 61.5002Z" fill="#C4C4C4"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M45 61.5002V41.1006C45 39.2254 47.2709 38.2904 48.5912 39.6219L62.8413 53.9931C64.7903 55.8994 66 58.5585 66 61.5002C66 67.2992 61.299 72.0002 55.5 72.0002C49.701 72.0002 45 67.2992 45 61.5002Z" fill="url(#paint5_linear_537_36557)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M18 59.4411V43.3308C18 41.4556 20.2709 40.5206 21.5912 41.8522L32.5983 52.9529C34.6711 54.6017 36 57.1458 36 60.0002C36 64.9708 31.9706 69.0002 27 69.0002C22.0294 69.0002 18 64.9708 18 60.0002C18 59.81 18.0059 59.6212 18.0175 59.4339L18 59.4411Z" fill="#C4C4C4"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M18 59.4411V43.3308C18 41.4556 20.2709 40.5206 21.5912 41.8522L32.5983 52.9529C34.6711 54.6017 36 57.1458 36 60.0002C36 64.9708 31.9706 69.0002 27 69.0002C22.0294 69.0002 18 64.9708 18 60.0002C18 59.81 18.0059 59.6212 18.0175 59.4339L18 59.4411Z" fill="url(#paint6_linear_537_36557)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M27 37.4998V24.4358C27 22.5606 29.2709 21.6256 30.5912 22.9571L39.282 31.7218C40.9423 33.0975 42 35.1751 42 37.4998C42 41.642 38.6421 44.9998 34.5 44.9998C30.4968 44.9998 27.2262 41.8635 27.0112 37.9139L27 37.9186V37.4998Z" fill="#C4C4C4"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M27 37.4998V24.4358C27 22.5606 29.2709 21.6256 30.5912 22.9571L39.282 31.7218C40.9423 33.0975 42 35.1751 42 37.4998C42 41.642 38.6421 44.9998 34.5 44.9998C30.4968 44.9998 27.2262 41.8635 27.0112 37.9139L27 37.9186V37.4998Z" fill="url(#paint7_linear_537_36557)"/>
    <defs>
    <linearGradient id="paint0_linear_537_36557" x1="22.5" y1="19.5" x2="36" y2="54" gradientUnits="userSpaceOnUse">
    <stop stopColor="#C6D8F5"/>
    <stop offset="1" stopColor="#89AFD1" stopOpacity="0"/>
    </linearGradient>
    <linearGradient id="paint1_linear_537_36557" x1="32.0998" y1="55.5925" x2="31.1538" y2="9" gradientUnits="userSpaceOnUse">
    <stop stopColor="#547DDA"/>
    <stop offset="0.257422" stopColor="#93C2FF" stopOpacity="0"/>
    </linearGradient>
    <radialGradient id="paint2_radial_537_36557" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(19.5 54) rotate(-127.875) scale(28.5044 32.9871)">
    <stop offset="0.683784" stopColor="#8FABDD" stopOpacity="0"/>
    <stop offset="1" stopColor="#5582D3"/>
    </radialGradient>
    <radialGradient id="paint3_radial_537_36557" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(34.5 49.5) rotate(-90) scale(40.5)">
    <stop offset="0.598765" stopColor="#C7DFFF" stopOpacity="0"/>
    <stop offset="1" stopColor="#6B97E6"/>
    </radialGradient>
    <radialGradient id="paint4_radial_537_36557" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(46.7 49.6) rotate(-56.3099) scale(31.7288)">
    <stop offset="0.47771" stopColor="#8FABDD" stopOpacity="0"/>
    <stop offset="1" stopColor="#5582D3"/>
    </radialGradient>
    <linearGradient id="paint5_linear_537_36557" x1="60.7509" y1="69.8232" x2="41.7826" y2="48.9185" gradientUnits="userSpaceOnUse">
    <stop stopColor="#0066FF"/>
    <stop offset="1" stopColor="#65ACFF"/>
    </linearGradient>
    <linearGradient id="paint6_linear_537_36557" x1="31.5008" y1="67.1682" x2="15.5695" y2="49.2848" gradientUnits="userSpaceOnUse">
    <stop stopColor="#0066FF"/>
    <stop offset="1" stopColor="#65ACFF"/>
    </linearGradient>
    <linearGradient id="paint7_linear_537_36557" x1="38.2506" y1="43.5046" x2="25.2817" y2="28.6405" gradientUnits="userSpaceOnUse">
    <stop stopColor="#0066FF"/>
    <stop offset="1" stopColor="#65ACFF"/>
    </linearGradient>
    </defs>
    </svg>,
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
      return WEATHER_CARDS.CLEAR;
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
  const [user, setUser] = useState(null);
  const [showWarning, setShowWarning] = useState(true);

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

  // Function to select background
  const selectBackground = (background) => {
    setCurrentBackground(background);
    localStorage.setItem('weatherBg', JSON.stringify(background));
    setShowBackgroundSelector(false);
  };

  // Function to set random background
  const setRandomBackground = () => {
    const randomBg = getRandomBackground();
    setCurrentBackground(randomBg);
    localStorage.setItem('weatherBg', JSON.stringify(randomBg));
  };

  // Function to remove background
  const removeBackground = () => {
    // Set Forest gradient as default after removing
    const forestGradient = {
      id: 'gradient-3',
      name: 'Forest',
      style: 'linear-gradient(45deg, #11998e, #38ef7d)'
    };
    setCurrentBackground(forestGradient);
    localStorage.removeItem('weatherBg');
    setShowBackgroundSelector(false);
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
    const savedBg = localStorage.getItem('weatherBg');
    if (savedBg) {
      try {
        const parsed = JSON.parse(savedBg);
        setCurrentBackground(parsed);
      } catch (e) {
        localStorage.removeItem('weatherBg');
        setCurrentBackground(null);
      }
    } else {
      // Set Forest gradient as default
      const forestGradient = {
        id: 'gradient-3',
        name: 'Forest',
        style: 'linear-gradient(45deg, #11998e, #38ef7d)'
      };
      setCurrentBackground(forestGradient);
    }
  }, []);

  useEffect(() => {
    getUserLocation();
  }, [unit]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

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
  const BackgroundSelector = () => {
    const items = [
      {
        key: 'images',
        label: (
          <span className="flex items-center gap-2">
            <PictureOutlined />
            Images
          </span>
        ),
        children: (
          <div className="grid grid-cols-2 gap-3 mt-4">
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
        ),
      },
      {
        key: 'gradients',
        label: (
          <span className="flex items-center gap-2">
            <BgColorsOutlined />
            Gradients
          </span>
        ),
        children: (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {GRADIENT_OPTIONS.map((gradient) => (
              <div
                key={gradient.id}
                onClick={() => selectBackground(gradient)}
                className="cursor-pointer rounded-lg overflow-hidden border-2 hover:border-blue-500 transition-colors h-24"
                style={{ background: gradient.style }}
              >
                <div className="h-full flex items-center justify-center">
                  <span className="text-white font-medium drop-shadow-lg">{gradient.name}</span>
                </div>
              </div>
            ))}
          </div>
        ),
      },
    ];

    return (
      <Modal
        title="Select Background"
        open={showBackgroundSelector}
        onCancel={() => setShowBackgroundSelector(false)}
        footer={null}
        width={600}
        className="dark:bg-[#28283A]"
      >
        <Tabs
          items={items}
          className="dark:[&_.ant-tabs-tab]:text-gray-400 dark:[&_.ant-tabs-tab-active]:text-white"
        />
        
        <div className="mt-6 flex justify-between items-center">
          <Space>
            <Button
              type="primary"
              icon={<SyncOutlined />}
              onClick={setRandomBackground}
            >
              Random
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={removeBackground}
            >
              Remove
            </Button>
          </Space>
          <Button onClick={() => setShowBackgroundSelector(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <div className="p-3">
        <div className="backdrop-blur-md bg-white/30 rounded-2xl shadow-xl max-w-md mx-auto w-full">
          <div className="animate-pulse h-64 flex items-center justify-center">Loading...</div>
        </div>
      </div>
    );
  }

  // Add null check for currentWeather
  if (!currentWeather || !currentWeather.weather || !currentWeather.weather[0]) {
    return (
      <div className="p-3">
        <div className="backdrop-blur-md bg-white/30 rounded-2xl shadow-xl max-w-md mx-auto w-full">
          <div className="h-64 flex items-center justify-center text-gray-600">
            {error || "Unable to load weather data"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-3 h-[100px] relative"
      style={{
        ...(currentBackground?.url
          ? {
              backgroundImage: `url(${currentBackground.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: 'transparent'
            }
          : currentBackground?.style
          ? {
              background: currentBackground.style
            }
          : {
              backgroundColor: 'rgba(0, 0, 0, 0.1)'
            }),
        minHeight: '170px'
      }}
    >
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      
      
      {/* Background selector button */}
      <div className="absolute top-1 right-1 z-20">
        <Button
          type="text"
          icon={<FaEllipsisV />}
          onClick={() => setShowBackgroundSelector(true)}
          className="text-white hover:bg-white/30"
          title="Change Background"
        />
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
            <span className="text-base text-white/90 font-medium mt-1 drop-shadow">in {currentWeather.sys?.country === 'IN' ? 'India' : currentWeather.sys?.country}, {currentWeather.name.toLowerCase().includes('delhi') ? 'Delhi' : currentWeather.name}</span>
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