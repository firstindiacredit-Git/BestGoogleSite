import React, { useState } from "react";

// Sample static weather data (replace with your own)
const staticWeatherData = {
  city: "London",
  country: "GB",
  temperature: 35,
  feels_like: 17,
  humidity: 65,
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
    description,
    icon,
  } = weatherData;

  return (
    <div>
     
      <div className="bg-white/10 p-5 mb-6 w-[98%] flex rounded-lg m-auto shadow-lg text-center">
        <img
          src={weatherIcons[icon]} // Static icon from the weatherIcons object
          alt={description}
          className=" mb-4 shadow-2xl rounded-[50%]"
        />
        <h2 className="text-2xl ml-2 font-semibold flex mt-16">{temperature}°C</h2>
        <p className="text-lg flex capitalize">{description}</p>
        <p className="text-sm  flex mt-9">Feels like: {feels_like}°C</p>
        <p className="text-sm flex">Humidity: {humidity}%</p>
       
      </div>
    </div>
  );
};

export default WeatherPage;
