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
];

const formatTimeZoneName = (timeZone) => {
  return timeZone.replace("_", " ").split("/")[1];
};

const formatTimeForZone = (time, timeZone) => {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(time);
};

const getClockHandDegrees = (time) => {
  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

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

  const { hours, minutes, seconds } = getClockHandDegrees(time);

  if (isAnalog) {
    return (
      <div className="relative w-16 h-16 mx-auto">
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 z-10 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
        >
          <X size={16} />
        </button>
        <div className="w-full h-full rounded-full border-4 text-white border-gray-200 relative flex items-center justify-center">
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
        <p className="text-center mt-1 text-[10px] font-medium">
          {formatTimeZoneName(timeZone)}
        </p>
      </div>
    );
  }

  return (
    <div className="relative dark:text-white  w-full mx-auto">
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
      >
        <X size={16} />
      </button>
      <div className="bg-black/80 backdrop-blur-sm dark:text-white p-2 rounded-2xl">
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
    "America/New_York",
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
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[14px] font-semibold flex items-center gap-1">
            <Clock className="w-5 h-5" />
            World Clock
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAnalog(!isAnalog)}
              className="px-4 py-1 bg-white/10 rounded-full hover:bg-white/20 transition"
            >
              Switch to {isAnalog ? "Digital" : "Analog"}
            </button>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={selectedTimezones.length >= 4}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  selectedTimezones.length >= 4
                    ? "Maximum timezones reached"
                    : "Add timezone"
                }
              >
                <Plus className="w-5 h-5" />
              </button>

              {isDropdownOpen && availableZones.length > 0 && (
                <>
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg py-1 z-50">
                    {availableZones.map((timeZone) => (
                      <button
                        key={timeZone}
                        onClick={() => addTimeZone(timeZone)}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition"
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
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-3xl p-6 shadow-2xl">
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
