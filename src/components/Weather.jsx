import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
} from "lucide-react";
import { format } from "date-fns";

const API_KEY = "78a1522c5ec67352674263eaaa54bffa";
const CITY = "Delhi";

const WeatherIcon = ({ condition, className = "w-12 h-12" }) => {
  const getIcon = () => {
    switch (condition.toLowerCase()) {
      case "clear":
        return <Sun className={className} />;
      case "rain":
        return <CloudRain className={className} />;
      case "drizzle":
        return <CloudDrizzle className={className} />;
      case "snow":
        return <CloudSnow className={className} />;
      case "thunderstorm":
        return <CloudLightning className={className} />;
      default:
        return <Cloud className={className} />;
    }
  };

  return getIcon();
};

const WeatherDetail = ({ label, value, icon }) => (
  <div className="flex items-center border shadow gap-2 bg-white/10 rounded-lg p-1">
    <div className="text-gray-400">{icon}</div>
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);

const WeatherCard = ({ weatherData, time, date }) => {
  const sunrise = new Date(weatherData.sys.sunrise * 1000);
  const sunset = new Date(weatherData.sys.sunset * 1000);

  return (
    <div className="bg-gray-100 border text-gray-600 rounded-xl p-4 shadow-lg w-full">
      <div className="text-center">
        <div className="flex justify-between">
          <p className="text-4xl mt-2 font-bold">{weatherData.main.temp}°C</p>
          <div className="flex justify-center">
            <WeatherIcon
              condition={weatherData.weather[0].main}
              className="w-20 h-20 -mt-2"
            />
          </div>
        </div>
        <p className="text-lg capitalize">
          {weatherData.weather[0].description}
        </p>
        <p className="text-sm opacity-75 mb-4">
          Feels like {weatherData.main.feels_like}°C
        </p>
      </div>

      <div className="text-center ">
        <p className="uppercase font-bold">{time}</p>
        <p className=" opacity-75">{date}</p>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <WeatherDetail
          label="Humidity"
          value={`${weatherData.main.humidity}%`}
          icon={<Droplets className="w-4 h-4" />}
          
        />
        <WeatherDetail
          icon={<Wind className="w-4 h-4" />}
          label="Wind"
          value={`${weatherData.wind.speed} m/s`}
        />
        <WeatherDetail
          label="Pressure"
          value={`${weatherData.main.pressure} hPa`}
          icon={<Gauge className="w-4 h-4" />}
        />
        <WeatherDetail
          label="Visibility"
          value={`${weatherData.visibility / 1000} km`}
          icon={<Eye className="w-4 h-4" />}
        />
      </div>
      <div className="mt-2 flex justify-between text-sm">
        <div className="flex items-center gap-2">
          <Sunrise className="w-4 h-4" />
          <span>Sunrise: {format(sunrise, "HH:mm")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Sunset className="w-4 h-4" />
          <span>Sunset: {format(sunset, "HH:mm")}</span>
        </div>
      </div>
    </div>
  );
};

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const updateTimeDate = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
                 })
      );
      setDate(
        now.toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    };
    updateTimeDate();
    const intervalId = setInterval(updateTimeDate, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const { data } = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather`,
          { params: { q: CITY, appid: API_KEY, units: "metric" } }
        );
        setWeatherData(data);
        setError(null);
      } catch {
        setError("Could not fetch weather data.");
      }
    };
    fetchWeather();
  }, []);

  return (
    <div className="items-center justify-center mt-1">
      {error && <p className="text-red-400">{error}</p>}
      {weatherData ? (
        <WeatherCard weatherData={weatherData} time={time} date={date} />
      ) : (
        !error && <p className="text-white">Fetching weather data...</p>
      )}
    </div>
  );
};

export default Weather;
