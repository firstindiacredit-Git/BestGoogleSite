import React, { useState } from "react";

// Sample static weather data (replace with your own)
const staticWeatherData = {
  city: "London",
  country: "GB",
  temperature: 45,
  feels_like: 17,
  humidity: 65,
  pressure: 1015,
  description: "clear sky",
  icon: "02d", // Use an icon code from OpenWeatherMap or other sources
};

const weatherIcons = {
  "01d": "https://openweathermap.org/img/wn/01d@2x.png", // Clear sky day icon
  "01n": "https://openweathermap.org/img/wn/01n@2x.png", // Clear sky night icon
  "02d": "https://openweathermap.org/img/wn/02d@2x.png", // Few clouds day icon
  "02n": "https://openweathermap.org/img/wn/02n@2x.png", // Few clouds night icon
  "03d": "https://openweathermap.org/img/wn/03d@2x.png", // Scattered clouds icon
  // Add more icons as needed
};

const WeatherPage = () => {
  const [weatherData, setWeatherData] = useState(staticWeatherData);

  const {
    city,
    country,
    temperature,
    feels_like,
    humidity,
    pressure,
    description,
    icon,
  } = weatherData;

  return (
    <div className="weather-page   h-96 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">
        Weather in {city}, {country}
      </h1>
      <div className="bg-white/10 p-5 flex rounded-lg m-auto shadow-lg text-center">
        <img
          src={weatherIcons[icon]} // Static icon from the weatherIcons object
          alt={description}
          className=" mb-4"
        />
        <h2 className="text-2xl font-semibold flex mt-16">{temperature}°C</h2>
        <p className="text-lg flex capitalize">{description}</p>
        <p className="text-sm  flex mt-9">Feels like: {feels_like}°C</p>
        <p className="text-sm flex">Humidity: {humidity}%</p>
        <p className="text-sm flex mt-9">Pressure: {pressure} hPa</p>
      </div>
    </div>
  );
};

export default WeatherPage;
