import React, { useState, useEffect } from 'react';
import { Back } from './back';

const Clock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState({
    city: '',
    country_name: '',
    timezone: '',
    utc_offset: '',
    postal: '',
  });
  const [errorMessage, setErrorMessage] = useState('');

  const fetchLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data) {
        const { city, country_name, timezone, utc_offset, postal } = data;
        setLocation({ city, country_name, timezone, utc_offset, postal });
      } else {
        setErrorMessage('Location data not found');
      }
    } catch (error) {
      setErrorMessage('Unable to retrieve location');
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const seconds = currentTime.getSeconds();
  const minutes = currentTime.getMinutes();
  const hours = currentTime.getHours() % 12;

  const secondsDegrees = (seconds / 60) * 360;
  const minutesDegrees = ((minutes + seconds / 60) / 60) * 360;
  const hoursDegrees = ((hours + minutes / 60) / 12) * 360;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="relative p-6">
            <div className="absolute top-6 left-6">
              <Back />
            </div>
            <h1 className="text-4xl font-bold text-center text-black">
              Clock
            </h1>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
              {/* Analog Clock */}
              <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-blue-50 to-gray-100 border-4 border-white shadow-xl">
                {/* Clock Numbers */}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full h-full text-lg font-bold text-gray-700"
                    style={{
                      transform: `rotate(${i * 30}deg)`,
                    }}
                  >
                    <span
                      className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        transform: `rotate(-${i * 30}deg)`,
                        top: '10%',
                      }}
                    >
                      {i === 0 ? '12' : i}
                    </span>
                  </div>
                ))}

                {/* Clock Hands */}
                <div
                  className="absolute w-1 h-24 bg-red-500 rounded-full origin-bottom transition-transform duration-100"
                  style={{
                    left: 'calc(50% - 0.5px)',
                    bottom: '50%',
                    transform: `rotate(${secondsDegrees}deg)`,
                    transformOrigin: 'bottom',
                  }}
                />
                <div
                  className="absolute w-2 h-20 bg-gray-600 rounded-full origin-bottom"
                  style={{
                    left: 'calc(50% - 1px)',
                    bottom: '50%',
                    transform: `rotate(${minutesDegrees}deg)`,
                    transformOrigin: 'bottom',
                  }}
                />
                <div
                  className="absolute w-2 h-16 bg-blue-600 rounded-full origin-bottom"
                  style={{
                    left: 'calc(50% - 1px)',
                    bottom: '50%',
                    transform: `rotate(${hoursDegrees}deg)`,
                    transformOrigin: 'bottom',
                  }}
                />
                <div className="absolute w-4 h-4 bg-blue-600 rounded-full"
                  style={{ left: 'calc(50% - 0.5rem)', top: 'calc(50% - 0.5rem)' }}
                />
              </div>

              {/* Digital Time and Info */}
              <div className="text-center lg:text-left">
                <div className="text-6xl font-bold mb-4 font-mono tracking-wider text-gray-800">
                  {formatTime(currentTime)}
                </div>
                <div className="text-2xl text-gray-600 mb-8">
                  {formatDate(currentTime)}
                </div>

                {/* Location Info */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-3 shadow-md">
                  {location.city && location.country_name ? (
                    <div className="text-xl font-medium text-gray-800">
                      📍 {location.city}, {location.country_name}
                    </div>
                  ) : (
                    <div className="text-red-500">{errorMessage || 'Fetching location...'}</div>
                  )}
                  
                  {location.timezone && (
                    <div className="text-gray-600">
                      🌐 {location.timezone}
                    </div>
                  )}
                  {location.utc_offset && (
                    <div className="text-gray-600">
                      ⌚ UTC {location.utc_offset}
                    </div>
                  )}
                  {location.postal && (
                    <div className="text-gray-600">
                      📮 Postal: {location.postal}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clock;
