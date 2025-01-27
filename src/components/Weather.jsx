import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import axios from "axios";
import { Palette } from "lucide-react";
import { ColorPicker } from "antd";

const API_KEY = "78a1522c5ec67352674263eaaa54bffa";

// Predefined theme colors
const themePresets = [
  {
    name: "Modern Light",
    colors: {
      primary: "#4F46E5",
      secondary: "#3B82F6",
      background: "rgba(255, 255, 255, 0.9)",
      text: "#1F2937",
      titleText: "#111827",
      titleBg: "rgba(255, 255, 255, 0.95)",
      cardBg: "rgba(255, 255, 255, 0.95)",
      cardHover: "rgba(79, 70, 229, 0.1)"
    }
  },
  {
    name: "Dark Mode",
    colors: {
      primary: "#8B5CF6",
      secondary: "#6D28D9",
      background: "rgba(17, 24, 39, 0.95)",
      text: "#F3F4F6",
      titleText: "#F9FAFB",
      titleBg: "rgba(31, 41, 55, 0.95)",
      cardBg: "rgba(31, 41, 55, 0.95)",
      cardHover: "rgba(139, 92, 246, 0.2)"
    }
  },
  {
    name: "Ocean Blue",
    colors: {
      primary: "#0EA5E9",
      secondary: "#0284C7",
      background: "rgba(240, 249, 255, 0.95)",
      text: "#0F172A",
      titleText: "#0C4A6E",
      titleBg: "rgba(224, 242, 254, 0.95)",
      cardBg: "rgba(255, 255, 255, 0.95)",
      cardHover: "rgba(14, 165, 233, 0.1)"
    }
  },
  {
    name: "Sunset Orange",
    colors: {
      primary: "#F97316",
      secondary: "#EA580C",
      background: "rgba(255, 247, 237, 0.95)",
      text: "#431407",
      titleText: "#7C2D12",
      titleBg: "rgba(255, 237, 213, 0.95)",
      cardBg: "rgba(255, 255, 255, 0.95)",
      cardHover: "rgba(249, 115, 22, 0.1)"
    }
  }
];

const Weather = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("metric");
  const [city, setCity] = useState("");
  const [isVisible, setisVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColors, setCustomColors] = useState(() => {
    const saved = localStorage.getItem("weatherCustomColors");
    return saved ? JSON.parse(saved) : themePresets[0].colors;
  });
  const settingsRef = useRef(null);
  const searchInputRef = useRef(null);
  const [browserInfo, setBrowserInfo] = useState(null);
  const [ipLocation, setIpLocation] = useState(null);

  useEffect(() => {
    localStorage.setItem("weatherCustomColors", JSON.stringify(customColors));
  }, [customColors]);

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
    <div className="relative">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <StyledWrapper customColors={customColors}>
          <div
            className="text-xl font-medium p-3 cursor-pointer flex justify-between items-center rounded-t-lg"
            style={{
              backgroundColor: customColors.titleBg,
              color: customColors.titleText,
              backdropFilter: 'blur(8px)'
            }}
            onClick={isCollapse}
          >
            <span>Weather</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              className="p-2 rounded-full hover:bg-white/20 transition-all"
              style={{
                backgroundColor: `${customColors.primary}30`
              }}
            >
              <Palette size={20} color={customColors.titleText} />
            </button>
          </div>
          
          {showColorPicker && (
            <div className="absolute top-14 right-4 z-50 bg-white p-4 rounded-lg shadow-lg">
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Theme Presets</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {themePresets.map((theme, index) => (
                      <button
                        key={index}
                        onClick={() => setCustomColors(theme.colors)}
                        className="p-2 rounded text-xs text-left hover:bg-gray-50 transition-all"
                        style={{
                          backgroundColor: theme.colors.cardBg,
                          color: theme.colors.text,
                          border: `1px solid ${theme.colors.primary}30`
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: theme.colors.primary }}
                          />
                          {theme.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Custom Colors</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Title Text</label>
                      <ColorPicker 
                        value={customColors.titleText} 
                        onChange={(color) => setCustomColors(prev => ({ ...prev, titleText: color.toHexString() }))}
                        presets={{
                          recommended: themePresets.map(t => ({ label: t.name, value: t.colors.titleText }))
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Title Background</label>
                      <ColorPicker 
                        value={customColors.titleBg} 
                        onChange={(color) => setCustomColors(prev => ({ ...prev, titleBg: color.toHexString() }))}
                        presets={{
                          recommended: themePresets.map(t => ({ label: t.name, value: t.colors.titleBg }))
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Primary Color</label>
                      <ColorPicker 
                        value={customColors.primary} 
                        onChange={(color) => setCustomColors(prev => ({ ...prev, primary: color.toHexString() }))}
                        presets={{
                          recommended: themePresets.map(t => ({ label: t.name, value: t.colors.primary }))
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Secondary Color</label>
                      <ColorPicker 
                        value={customColors.secondary} 
                        onChange={(color) => setCustomColors(prev => ({ ...prev, secondary: color.toHexString() }))}
                        presets={{
                          recommended: themePresets.map(t => ({ label: t.name, value: t.colors.secondary }))
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Background</label>
                      <ColorPicker 
                        value={customColors.background} 
                        onChange={(color) => setCustomColors(prev => ({ ...prev, background: color.toHexString() }))}
                        presets={{
                          recommended: themePresets.map(t => ({ label: t.name, value: t.colors.background }))
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Card Background</label>
                      <ColorPicker 
                        value={customColors.cardBg} 
                        onChange={(color) => setCustomColors(prev => ({ ...prev, cardBg: color.toHexString() }))}
                        presets={{
                          recommended: themePresets.map(t => ({ label: t.name, value: t.colors.cardBg }))
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Card Hover</label>
                      <ColorPicker 
                        value={customColors.cardHover} 
                        onChange={(color) => setCustomColors(prev => ({ ...prev, cardHover: color.toHexString() }))}
                        presets={{
                          recommended: themePresets.map(t => ({ label: t.name, value: t.colors.cardHover }))
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Text Color</label>
                      <ColorPicker 
                        value={customColors.text} 
                        onChange={(color) => setCustomColors(prev => ({ ...prev, text: color.toHexString() }))}
                        presets={{
                          recommended: themePresets.map(t => ({ label: t.name, value: t.colors.text }))
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {isVisible && (
            <div
              className="weather-container h-[19rem]"
              style={{
                backgroundColor: customColors.background,
                color: customColors.text,
                borderRadius: '0 0 0.5rem 0.5rem',
                boxShadow: `0 4px 6px -1px ${customColors.primary}10`,
              }}
            >
              <div className="content-wrapper flex-col">
                {/* Main Weather Card */}
                <div 
                  className="duration-300 font-mono relative overflow-hidden w-full h-[48.5%] rounded-sm p-6"
                  style={{
                    backgroundColor: customColors.cardBg,
                    color: customColors.text,
                    borderLeft: `4px solid ${customColors.primary}`,
                  }}
                >
                  <div className="flex justify-between -mt-4 items-center">
                    <div className="flex-1">
                      <h3 
                        className="text-2xl font-bold"
                        style={{ color: customColors.primary }}
                      >
                        Today
                      </h3>
                      {currentWeather && (
                        <div className="flex items-center gap-6">
                          <h4 
                            className="font-sans ml-2 text-6xl"
                            style={{ color: customColors.secondary }}
                          >
                            {Math.round(currentWeather.main.temp)}°
                          </h4>
                          <div className="text-lg">
                            <p style={{ color: customColors.text }}>
                              {currentWeather.weather[0].description}
                            </p>
                            <p style={{ color: `${customColors.text}99` }}>
                              {currentWeather.main.humidity}% humidity
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex justify-center items-center">
                      {currentWeather && (
                        <div 
                          className="w-30 h-30 p-2 rounded-full"
                          style={{
                            backgroundColor: `${customColors.primary}10`,
                          }}
                        >
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
                        <p 
                          className="text-2xl"
                          style={{ color: customColors.primary }}
                        >
                          {new Date().toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </p>
                        <p style={{ color: `${customColors.text}99` }}>
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
                <div className="forecast-container h-[48.5%] w-full flex justify-between">
                  {forecast.map((day, index) => (
                    <div
                      key={index}
                      className="font-mono group cursor-default relative overflow-hidden h-full w-[48.5%] rounded-sm p-2 transition-all duration-300"
                      style={{
                        backgroundColor: customColors.cardBg,
                        color: customColors.text,
                        borderLeft: `4px solid ${customColors.secondary}`,
                        '--hover-bg': customColors.cardHover,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <h3 
                        className="text-sm text-center font-bold"
                        style={{ color: customColors.secondary }}
                      >
                        {getDayName(day.dt_txt)}
                      </h3>
                      <div className="gap-4 relative">
                        <div 
                          className="p-2 rounded-full mx-auto w-fit"
                          style={{
                            backgroundColor: `${customColors.secondary}10`,
                          }}
                        >
                          <img
                            src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                            alt={day.weather[0].description}
                            className="w-16 h-16"
                          />
                        </div>
                        <h4 
                          className="font-sans duration-300 absolute left-1/2 -translate-x-1/2 text-3xl text-center group-hover:translate-x-9 group-hover:-translate-y-12 group-hover:scale-125"
                          style={{ color: customColors.secondary }}
                        >
                          {Math.round(day.main.temp)}°
                        </h4>
                      </div>
                      <div 
                        className="absolute duration-300 -left-32 mt-1 group-hover:left-8"
                        style={{ color: customColors.text }}
                      >
                        <p className="text-xs">{day.weather[0].description}</p>
                        <p className="text-xs" style={{ color: `${customColors.text}99` }}>
                          {day.main.humidity}% humidity
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </StyledWrapper>
      )}
    </div>
  );
};

const StyledWrapper = styled.div`
  ${props => css`
    .weather-container {
      display: flex;
      flex-direction: column;
      gap: 1px;
      padding: 0 2px;
      color: ${props.customColors.text};
      background-color: ${props.customColors.background};
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

    .group {
      transition: all 0.3s ease;
      &:hover {
        background-color: ${props.customColors.cardHover} !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px ${props.customColors.primary}20;
      }
    }

    .weather-icon {
      width: 50px;
      height: 50px;
      margin: 0 auto;
      display: block;
      filter: drop-shadow(0 0 4px ${props.customColors.primary}40);
    }

    .animate-float {
      animation: float 3s ease-in-out infinite;
    }

    @media (max-width: 768px) {
      .content-wrapper {
        justify-content: center;
      }

      .forecast-container {
        justify-content: center;
      }
    }
  `}
`;

export default Weather;
