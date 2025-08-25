import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { Modal, Tabs, Radio, Space, Button, Alert } from "antd";
import { PictureOutlined, BgColorsOutlined, DeleteOutlined, SyncOutlined } from "@ant-design/icons";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { FaEllipsisV } from "react-icons/fa";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

// Fallback API key (you should replace this with your own)
const FALLBACK_API_KEY = "78a1522c5ec67352674263eaaa54bffa";

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
  const [activeTab, setActiveTab] = useState('hourly');
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [isScrolling, setIsScrolling] = useState(false);

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
      // First, get location name from coordinates using a different geocoding service
      let locationName = "Current Location";
      let countryCode = "Unknown";
      
      try {
        // Use a different geocoding service that supports reverse geocoding
        const geocodeResponse = await axios.get(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
          { 
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 5000
          }
        );
        
        if (geocodeResponse.data) {
          const location = geocodeResponse.data;
          locationName = location.city || location.locality || location.principalSubdivision || "Current Location";
          countryCode = location.countryCode || "Unknown";
        }
      } catch (geocodeError) {
        console.error("Geocoding failed:", geocodeError);
        // Try alternative geocoding service
        try {
          const altGeocodeResponse = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
            { 
              headers: {
                'Content-Type': 'application/json',
              },
              timeout: 5000
            }
          );
          
          if (altGeocodeResponse.data && altGeocodeResponse.data.address) {
            const address = altGeocodeResponse.data.address;
            locationName = address.city || address.town || address.village || address.county || "Current Location";
            countryCode = address.country_code?.toUpperCase() || "Unknown";
          }
        } catch (altGeocodeError) {
          console.error("Alternative geocoding also failed:", altGeocodeError);
        }
      }
      
      // Fetch current weather and forecast data
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,weather_code&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`,
        { 
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000
        }
      );
      
      // Convert Open-Meteo response to our expected format
      const current = response.data.current;
      const hourly = response.data.hourly;
      const daily = response.data.daily;
      
      const convertedData = {
        weather: [{ 
          main: getWeatherMain(current.weather_code), 
          description: getWeatherDescription(current.weather_code) 
        }],
        main: {
          temp: current.temperature_2m,
          feels_like: current.apparent_temperature,
          humidity: current.relative_humidity_2m
        },
        wind: {
          speed: current.wind_speed_10m,
          deg: current.wind_direction_10m
        },
        name: locationName,
        sys: { country: countryCode }
      };
      
      // Process hourly forecast data
      const processedHourly = [];
      const now = new Date();
      const currentHour = now.getHours();
      
      for (let i = 0; i < 24; i++) {
        const hourIndex = (currentHour + i) % 24;
        if (hourly.time && hourly.time[i] && hourly.temperature_2m && hourly.temperature_2m[i] !== undefined) {
          const time = new Date(hourly.time[i]);
          const hour = time.getHours();
          const timeString = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
          
          processedHourly.push({
            time: timeString,
            temp: Math.round(hourly.temperature_2m[i]),
            icon: getWeatherIcon(hourly.weather_code[i]),
            rain: hourly.precipitation_probability[i] || 0,
            weatherCode: hourly.weather_code[i]
          });
        }
      }
      
      // Process daily forecast data
      const processedDaily = [];
      for (let i = 0; i < 7; i++) {
        if (daily.time && daily.time[i] && daily.temperature_2m_max && daily.temperature_2m_max[i] !== undefined) {
          const time = new Date(daily.time[i]);
          const dayName = time.toLocaleDateString('en-US', { weekday: 'short' });
          
          processedDaily.push({
            day: dayName,
            maxTemp: Math.round(daily.temperature_2m_max[i]),
            minTemp: Math.round(daily.temperature_2m_min[i]),
            icon: getWeatherIcon(daily.weather_code[i]),
            rain: daily.precipitation_probability_max[i] || 0,
            weatherCode: daily.weather_code[i]
          });
        }
      }
      
      setCurrentWeather(convertedData);
      setHourlyForecast(processedHourly);
      setDailyForecast(processedDaily);
      setError(null);
      
    } catch (error) {
      console.error("Weather API failed:", error);
      
      // Fallback to mock data
      const mockData = {
        weather: [{ main: "Clear", description: "clear sky" }],
        main: {
          temp: 25,
          feels_like: 26,
          humidity: 65
        },
        wind: {
          speed: 3.5,
          deg: 180
        },
        name: "Your Location",
        sys: { country: "Demo" }
      };
      
      setCurrentWeather(mockData);
      setError("Using demo data - API unavailable");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions to convert weather codes
  const getWeatherMain = (code) => {
    if (code === 0) return "Clear";
    if (code >= 1 && code <= 3) return "Clouds";
    if (code >= 45 && code <= 48) return "Fog";
    if (code >= 51 && code <= 67) return "Rain";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 80 && code <= 82) return "Rain";
    if (code >= 85 && code <= 86) return "Snow";
    if (code >= 95 && code <= 99) return "Thunderstorm";
    return "Clear";
  };

  const getWeatherDescription = (code) => {
    if (code === 0) return "clear sky";
    if (code >= 1 && code <= 3) return "cloudy";
    if (code >= 45 && code <= 48) return "foggy";
    if (code >= 51 && code <= 67) return "rainy";
    if (code >= 71 && code <= 77) return "snowy";
    if (code >= 80 && code <= 82) return "rainy";
    if (code >= 85 && code <= 86) return "snowy";
    if (code >= 95 && code <= 99) return "thunderstorm";
    return "clear sky";
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return "☀️"; // Clear sky
    if (code >= 1 && code <= 3) return "⛅"; // Partly cloudy
    if (code >= 45 && code <= 48) return "🌫️"; // Foggy
    if (code >= 51 && code <= 67) return "🌧️"; // Rain
    if (code >= 71 && code <= 77) return "❄️"; // Snow
    if (code >= 80 && code <= 82) return "🌧️"; // Rain showers
    if (code >= 85 && code <= 86) return "❄️"; // Snow showers
    if (code >= 95 && code <= 99) return "⛈️"; // Thunderstorm
    return "☀️"; // Default to clear
  };

  const getWeatherStatus = (weatherMain) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return 'Clear skies ahead';
      case 'clouds':
        return 'Clouds clearing soon';
      case 'rain':
        return 'Rain stopping soon';
      case 'snow':
        return 'Snow clearing soon';
      case 'thunderstorm':
        return 'Storm passing through';
      case 'mist':
      case 'fog':
        return 'Fog lifting soon';
      default:
        return 'Weather improving';
    }
  };

  const fetchWeatherByCity = async (cityName) => {
    try {
      setIsLoading(true);
      
      // First, get coordinates for the city using a geocoding service
      const geocodeResponse = await axios.get(
        `https://api.open-meteo.com/v1/geocoding?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`,
        { 
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000
        }
      );
      
      if (geocodeResponse.data.results && geocodeResponse.data.results.length > 0) {
        const location = geocodeResponse.data.results[0];
        const { latitude, longitude } = location;
        
        // Now get weather data using coordinates
        const weatherResponse = await axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,weather_code&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`,
          { 
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000
          }
        );
        
        // Convert Open-Meteo response to our expected format
        const current = weatherResponse.data.current;
        const hourly = weatherResponse.data.hourly;
        const daily = weatherResponse.data.daily;
        
        const convertedData = {
          weather: [{ 
            main: getWeatherMain(current.weather_code), 
            description: getWeatherDescription(current.weather_code) 
          }],
          main: {
            temp: current.temperature_2m,
            feels_like: current.apparent_temperature,
            humidity: current.relative_humidity_2m
          },
          wind: {
            speed: current.wind_speed_10m,
            deg: current.wind_direction_10m
          },
          name: location.name,
          sys: { country: location.country }
        };
        
        // Process hourly forecast data
        const processedHourly = [];
        for (let i = 0; i < 24; i++) {
          if (hourly.time && hourly.time[i] && hourly.temperature_2m && hourly.temperature_2m[i] !== undefined) {
            const time = new Date(hourly.time[i]);
            const hour = time.getHours();
            const timeString = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
            
            processedHourly.push({
              time: timeString,
              temp: Math.round(hourly.temperature_2m[i]),
              icon: getWeatherIcon(hourly.weather_code[i]),
              rain: hourly.precipitation_probability[i] || 0,
              weatherCode: hourly.weather_code[i]
            });
          }
        }
        
        // Process daily forecast data
        const processedDaily = [];
        for (let i = 0; i < 7; i++) {
          if (daily.time && daily.time[i] && daily.temperature_2m_max && daily.temperature_2m_max[i] !== undefined) {
            const time = new Date(daily.time[i]);
            const dayName = time.toLocaleDateString('en-US', { weekday: 'short' });
            
            processedDaily.push({
              day: dayName,
              maxTemp: Math.round(daily.temperature_2m_max[i]),
              minTemp: Math.round(daily.temperature_2m_min[i]),
              icon: getWeatherIcon(daily.weather_code[i]),
              rain: daily.precipitation_probability_max[i] || 0,
              weatherCode: daily.weather_code[i]
            });
          }
        }
        
        setCurrentWeather(convertedData);
        setHourlyForecast(processedHourly);
        setDailyForecast(processedDaily);
        setError(null);
      } else {
        throw new Error("City not found");
      }
      
    } catch (error) {
      console.error("Weather API failed:", error);
      
      if (error.message === "City not found") {
        setError(`Weather data for "${cityName}" not found.`);
      } else {
        setError("Could not fetch weather data. Please try again later.");
      }
      
      // Fallback to mock data
      const mockData = {
        weather: [{ main: "Clear", description: "clear sky" }],
        main: {
          temp: 25,
          feels_like: 26,
          humidity: 65
        },
        wind: {
          speed: 3.5,
          deg: 180
        },
        name: cityName,
        sys: { country: "Demo" }
      };
      
      setCurrentWeather(mockData);
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
          <span className="flex items-center gap-2 ">
            <BgColorsOutlined />
            Gradients
          </span>
        ),
        children: (
          <div className="grid grid-cols-2 gap-3 mt-4 ">
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
      className="p-2 sm:p-3 relative"
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
        height: '350px',
        minHeight: '350px'
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
      <div className="relative z-10 h-full flex flex-col">
        {/* Top Section - Current Weather Card */}
        <div className="bg-white/10 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 sm:gap-0">
            {/* Left Side - Weather Icon and Temperature */}
            <div className="flex flex-col items-center">
              <div className="text-3xl sm:text-4xl mb-2">
                {getWeatherCardStyle(currentWeather.weather[0].main).icon}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {Math.round(currentWeather.main.temp)}°C
              </div>
              <div className="text-xs text-white/70 text-center">
                in {currentWeather.sys.country}, {currentWeather.name}
              </div>
            </div>
            
            {/* Right Side - Weather Details */}
            <div className="flex flex-col gap-1 sm:gap-2 text-white text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span>☁️</span>
                <span>{currentWeather.weather[0].main} ({currentWeather.weather[0].description})</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🌡️</span>
                <span>Feels like: {Math.round(currentWeather.main.feels_like)}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💧</span>
                <span>Humidity: {currentWeather.main.humidity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💨</span>
                <span>Wind: {currentWeather.wind.speed} m/s ({currentWeather.wind.deg}°)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 sm:gap-6 mb-3 sm:mb-4">
          {[
            { key: 'hourly', label: 'Hourly' },
            { key: 'daily', label: 'Daily' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-xs sm:text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-white border-b-2 border-white pb-1' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Content Section */}
        <div className="flex-1">
          {activeTab === 'hourly' && (
                          <div className="relative flex items-center group">
                {/* Previous Button */}
                <button 
                  onClick={() => {
                    const container = document.getElementById('hourly-scroll');
                    if (container) {
                      container.scrollLeft -= 280;
                    }
                  }}
                  className="absolute left-0 z-10 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                                {/* Scrollable Container */}
                <div 
                  id="hourly-scroll"
                  className="flex gap-1 overflow-x-auto scrollbar-hide px-2 mx-auto justify-start"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {hourlyForecast.slice(0, 6).map((hour, index) => {
                    // Get current hour
                    const now = new Date();
                    const currentHour = now.getHours();
                    
                    // Calculate the next hours
                    const nextHour = currentHour + index + 1;
                    const displayHour = nextHour > 23 ? nextHour - 24 : nextHour;
                    const timeString = displayHour === 0 ? '12 AM' : displayHour < 12 ? `${displayHour} AM` : displayHour === 12 ? '12 PM' : `${displayHour - 12} PM`;
                    
                    return (
                      <div key={index} className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-2 sm:py-3 min-w-[45px] sm:min-w-[50px] h-28 sm:h-32 flex-shrink-0">
                        <span className="text-xs text-white font-medium mb-1">{timeString}</span>
                        <span className="text-xl sm:text-2xl mb-2">{hour.icon}</span>
                        <span className="text-sm sm:text-lg font-bold text-white mb-1">{hour.temp}°</span>
                        <span className="text-xs text-white/80 font-medium">
                          {hour.rain}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button 
                  onClick={() => {
                    const container = document.getElementById('hourly-scroll');
                    if (container) {
                      container.scrollLeft += 280;
                    }
                  }}
                  className="absolute right-0 z-10 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
          )}

          {activeTab === 'daily' && (
            <div className="relative flex items-center group">
              {/* Previous Button */}
              <button 
                onClick={() => {
                  const container = document.getElementById('daily-scroll');
                  if (container) {
                    container.scrollLeft -= 280;
                  }
                }}
                className="absolute left-0 z-10 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Scrollable Container */}
              <div 
                id="daily-scroll"
                className="flex gap-1 overflow-x-auto scrollbar-hide px-2 mx-auto justify-start"
                style={{ scrollBehavior: 'smooth' }}
              >
                {dailyForecast.slice(0, 6).map((day, index) => (
                  <div key={index} className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-2 sm:py-3 min-w-[45px] sm:min-w-[50px] h-28 sm:h-32 flex-shrink-0">
                    <span className="text-xs text-white font-medium mb-1">
                      {index === 0 ? 'Today' : day.day}
                    </span>
                    <span className="text-xl sm:text-2xl mb-2">{day.icon}</span>
                    <span className="text-sm sm:text-lg font-bold text-white mb-1">{day.maxTemp}°</span>
                    <span className="text-xs text-white/80 font-medium">
                      {day.minTemp}°
                    </span>
                  </div>
                ))}
              </div>

              {/* Next Button */}
              <button 
                onClick={() => {
                  const container = document.getElementById('daily-scroll');
                  if (container) {
                    container.scrollLeft += 280;
                  }
                }}
                className="absolute right-0 z-10 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}


        </div>


      </div>

      {/* Background selector modal */}
      {showBackgroundSelector && <BackgroundSelector />}
    </div>
  );
};

export default Weather;