import React from "react";

// Sample static weather data
const staticWeatherData = {
  city: "Dunmore",
  country: "Ireland",
  temperature: 23,
  feels_like: 20,
  humidity: 30,
  description: "clear sky",
  icon: "01d",
  windSpeed: 15,
};

// Weather icon URLs based on weather condition code
const weatherIcons = {
  "01d": "https://openweathermap.org/img/wn/01d@2x.png", // Clear sky day icon
  "01n": "https://openweathermap.org/img/wn/01n@2x.png", // Clear sky night icon
  "02d": "https://openweathermap.org/img/wn/02d@2x.png", // Few clouds day icon
  "02n": "https://openweathermap.org/img/wn/02n@2x.png", // Few clouds night icon
  "03d": "https://openweathermap.org/img/wn/03d@2x.png", // Scattered clouds day icon
  // Add more icons as needed
};

const WeatherPage = () => {
  const {
    city,
    country,
    temperature,
    feels_like,
    humidity,
    description,
    icon,
    windSpeed,
  } = staticWeatherData;

  return (
    <div className="flex flex-col items-center -mt-8 p-2 border bg-white/10 backdrop-blur-lg rounded-lg shadow-lg">
      {/* Main Weather Information */}
      <div className="flex items-center justify-center p-2   rounded-lg mb-2">
        <div className="w-24 h-24">
          <img
            src={weatherIcons[icon]}
            alt={description}
            className="w-full h-full"
          />
        </div>
        <div className="text-center ml-4">
          <div className="text-3xl  dark:text-white">
            {temperature}°C
          </div>
          <div className="dark:text-gray-300">
            {city}, {country}
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="flex justify-between items-center w-full border-t-2   p-3 dark:text-white">
        {/* Humidity */}
        <div className="flex flex-col items-center">
          <div className="text-md">Humidity</div>
          <div className="text-md ">{humidity}%</div>
        </div>

        {/* Feels Like */}
        <div className="flex flex-col items-center">
          <div className="text-md">Feels Like</div>
          <div className="text-md ">{feels_like}°C</div>
        </div>

        {/* Wind Speed */}
        <div className="flex flex-col items-center">
          <div className="text-md">Wind</div>
          <div className="text-md ">{windSpeed} km/h</div>
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
