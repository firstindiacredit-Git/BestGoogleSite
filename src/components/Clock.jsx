import React, { useState, useEffect } from "react";
import { Clock, Plus, X } from "lucide-react";

const AVAILABLE_TIMEZONES = [
  "America/New_York",
  "Europe/London",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Europe/Paris",
  "Asia/Dubai",
  "Pacific/Auckland",
  "America/Los_Angeles",
  "Asia/Seoul",  
  "Europe/Berlin", 
  "Africa/Johannesburg", 
  "Asia/Shanghai",  
  "America/Chicago",  
  "Europe/Moscow", 
  "Africa/Nairobi",  
  "America/Toronto", 
  "Asia/Kolkata",
  "America/Mexico_City",  
  "Asia/Singapore",  
];


const formatTimeZoneName = (timeZone) => {
  if (timeZone === "Asia/Kolkata") {
    return "India";
  }
  return timeZone.replace("_", " ").split("/")[1];
};

const formatTimeForZone = (time, timeZone) => {
  try {
    return new Date(time).toLocaleTimeString('en-US', {
      timeZone: timeZone,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '--:--:-- --';
  }
};

const getClockHandDegrees = (time, timeZone) => {
  const date = new Date(time.toLocaleString('en-US', { timeZone }));
  const hours = date.getHours() % 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const hourDegrees = hours * 30 + minutes / 2;
  const minuteDegrees = minutes * 6 + seconds / 10;
  const secondDegrees = seconds * 6;

  return {
    hours: hourDegrees,
    minutes: minuteDegrees,
    seconds: secondDegrees,
  };
};

const TimeZoneClock = ({ timeZone, isAnalog, onRemove }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { hours, minutes, seconds } = getClockHandDegrees(time, timeZone);

  if (isAnalog) {
    return (
      <div className="relative w-16 h-16">
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 z-10 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
        >
          <X size={16} />
        </button>
        <div className="w-16 h-16 mx-auto rounded-full border-4 text-white border-gray-200 relative flex items-center justify-center">
          {/* Numbers */}
          {[...Array(12)].map((_, index) => {
            const angle = (index + 1) * 30;
            const radian = (angle * Math.PI) / 180;
            const x = Math.sin(radian) * 24;
            const y = -Math.cos(radian) * 24;

            return (
              <span
                key={index}
                className="absolute text-[7px] mt-2.5 ml-1.5 font-medium"
                style={{
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                }}
              >
                {index + 1}
              </span>
            );
          })}

          {/* Clock hands */}
          <div className="absolute  w-1 h-1 bg-white dark:bg-white rounded-full"></div>
          <div
            className="absolute -mt-5 w-0.5 h-5 bg-blue-600 origin-bottom rounded-full"
            style={{ transform: `rotate(${hours}deg)` }}
          />
          <div
            className="absolute -mt-7 w-0.5 h-7 bg-black dark:bg-white origin-bottom rounded-full"
            style={{ transform: `rotate(${minutes}deg)` }}
          />
          <div
            className="absolute -mt-7 w-0.5 h-7 bg-red-500 origin-bottom rounded-full"
            style={{ transform: `rotate(${seconds}deg)` }}
          />
        </div>
        <p className="text-center mt-1 text-white text-[10px] font-medium">
          {formatTimeZoneName(timeZone)}
        </p>
      </div>
    );
  }

  return (
    <div className="relative dark:text-white w-20 h-16">
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 z-50 bg-red-500 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-opacity"
      >
        <X size={16} />
      </button>
      <div className="dark:bg-black/80 bg-gray-200 backdrop-blur-sm dark:text-white p-2 rounded-2xl h-full flex flex-col justify-center">
        <p className="text-[10px] opacity-80">{formatTimeZoneName(timeZone)}</p>
        <p className="text-[13px] font-light">
          {formatTimeForZone(time, timeZone)}
        </p>
      </div>
    </div>
  );
};

const ResponsiveWorldClock = () => {
  const [isAnalog, setIsAnalog] = useState(false);
  const [selectedTimezones, setSelectedTimezones] = useState([
    "Asia/Kolkata"
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const addTimeZone = (timeZone) => {
    if (selectedTimezones.length < 4) {
      setSelectedTimezones([...selectedTimezones, timeZone]);
      setIsDropdownOpen(false);
    }
  };

  const removeTimeZone = (index) => {
    setSelectedTimezones(selectedTimezones.filter((_, i) => i !== index));
  };

  const availableZones = AVAILABLE_TIMEZONES.filter(
    (tz) => !selectedTimezones.includes(tz)
  );

  return (
    <div className="dark:bg-gradient-to-br from-gray-900 to-gray-800 dark:text-white p-4 flex justify-center items-center">
      <div className="mx-auto w-full max-w-sm">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAnalog(!isAnalog)}
              className="px-4 py-1 dark:bg-white/10  bg-gray-200 hover:bg-gray-300 rounded-full dark:hover:bg-white/20 transition"
            >
              {isAnalog ? "Digital" : "Analog"}
            </button>

            {selectedTimezones.length < 4 && (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="p-2 dark:bg-white/10 rounded-full dark:hover:bg-white/20 bg-gray-200 hover:bg-gray-300 transition"
                  title="Add timezone"
                >
                  <Plus className="w-5 h-5" />
                </button>

                {isDropdownOpen && availableZones.length > 0 && (
                  <>
                    <div className="absolute right-0 mt-2 w-48 dark:bg-gray-800/95 backdrop-blur-sm bg-gray-200 rounded-lg shadow-lg py-1 z-50 max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 dark:[&::-webkit-scrollbar-track]:bg-gray-800">
                      {availableZones.map((timeZone) => (
                        <button
                          key={timeZone}
                          onClick={() => addTimeZone(timeZone)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-white dark:text-white dark:hover:bg-white/10 transition"
                        >
                          {formatTimeZoneName(timeZone)}
                        </button>
                      ))}
                    </div>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-black/40  backdrop-blur-md rounded-3xl p-6 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 justify-center mx-auto">
            {selectedTimezones.map((timeZone, index) => (
              <TimeZoneClock
                key={timeZone}
                timeZone={timeZone}
                isAnalog={isAnalog}
                onRemove={() => removeTimeZone(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveWorldClock;
