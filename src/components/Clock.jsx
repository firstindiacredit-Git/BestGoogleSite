import React, { useState, useEffect } from "react";
import {  Plus, X } from "lucide-react";
import {  Popconfirm } from "antd";
import { auth, db } from "../firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";

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

const getTimeDifference = (baseTimeZone, targetTimeZone) => {
  const now = new Date();

  // Calculate today's difference
  const baseTimeToday = new Date(now.toLocaleString('en-US', { timeZone: baseTimeZone }));
  const targetTimeToday = new Date(now.toLocaleString('en-US', { timeZone: targetTimeZone }));
  const diffHoursToday = (targetTimeToday - baseTimeToday) / (1000 * 60 * 60);
  
  const signToday = diffHoursToday > 0 ? '+' : '';
  
  return `Today: (${signToday}${diffHoursToday}h)`;
};

const TimeZoneClock = ({ timeZone, isAnalog, onRemove, baseTimeZone }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { hours, minutes, seconds } = getClockHandDegrees(time, timeZone);

  const timeDiff = getTimeDifference(baseTimeZone, timeZone);

  if (isAnalog) {
    return (
      <div className="relative w-fit  h-fit flex flex-col items-center group">
        <Popconfirm
          title="Remove timezone"
          description="Are you sure you want to remove this timezone?"
          onConfirm={onRemove}
          okText="Yes"
          cancelText="No"
          placement="topRight"
        >
          <button
            className="absolute -top-2 -right-2 z-50 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-red-600 transition-opacity"
          >
            <X size={16} />
          </button>
        </Popconfirm>
        <div className="w-24 h-24 rounded-full border-4 text-white border-gray-200 relative flex items-center justify-center bg-gray-800">
          {/* Numbers */}
          {[...Array(12)].map((_, index) => {
            const angle = (index + 1) * 30;
            const radian = (angle * Math.PI) / 180;
            const x = Math.sin(radian) * 35;
            const y = -Math.cos(radian) * 35;

            return (
              <span
                key={index}
                className="absolute text-[10px] mt-2.5 ml-1.5 font-medium"
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
            className="absolute -mt-5 w-0.5 h-5 bg-blue-500 origin-bottom rounded-full"
            style={{ transform: `rotate(${hours}deg)` }}
          />
          <div
            className="absolute -mt-7 w-0.5 h-7 bg-gray-900 dark:bg-white origin-bottom rounded-full"
            style={{ transform: `rotate(${minutes}deg)` }}
          />
        </div>
        <div className="text-center dark:text-white text-black text-[10px] font-medium mt-1">
          <p className="mb-0">{formatTimeZoneName(timeZone)}</p>
          {timeDiff && (
            <p className="text-gray-500 whitespace-pre-line">{timeDiff}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-24 h-24 group">
      <Popconfirm
        title="Remove timezone"
        description="Are you sure you want to remove this timezone?"
        onConfirm={onRemove}
        okText="Yes"
        cancelText="No"
        placement="topRight"
      >
        <button
          className="absolute -top-2 -right-2 z-50 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-red-600 transition-opacity"
        >
          <X size={16} />
        </button>
      </Popconfirm>
      <div className="h-full dark:bg-gray-950 bg-gray-100 backdrop-blur-sm rounded-xl shadow-lg flex flex-col items-center justify-center p-2">
        <p className="text-[10px] font-medium mb-0.5 dark:text-blue-500 text-gray-600">
          {formatTimeZoneName(timeZone)}
        </p>
        <p className="text-base font-bold tracking-wider dark:text-white text-gray-800">
          {formatTimeForZone(time, timeZone)}
        </p>
        {timeDiff && (
          <p className="text-[10px] text-gray-500 whitespace-pre-line text-center">
            {timeDiff}
          </p>
        )}
      </div>
    </div>
  );
};

const ResponsiveWorldClock = () => {
  const [isAnalog, setIsAnalog] = useState(true);
  const [selectedTimezones, setSelectedTimezones] = useState(["Asia/Kolkata"]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        onSnapshot(userDocRef, (doc) => {
          if (doc.exists() && doc.data().savedTimezones) {
            setSelectedTimezones(doc.data().savedTimezones);
          }
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const addTimeZone = async (timeZone) => {
    if (selectedTimezones.length < 4) {
      const newTimezones = [...selectedTimezones, timeZone];
      setSelectedTimezones(newTimezones);
      setIsDropdownOpen(false);

      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          await updateDoc(userDocRef, {
            savedTimezones: newTimezones
          });
        } catch (error) {
          console.error("Error saving timezones:", error);
        }
      }
    }
  };

  const removeTimeZone = async (index) => {
    const newTimezones = selectedTimezones.filter((_, i) => i !== index);
    setSelectedTimezones(newTimezones);

    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      try {
        await updateDoc(userDocRef, {
          savedTimezones: newTimezones
        });
      } catch (error) {
        console.error("Error removing timezone:", error);
      }
    }
  };

  const availableZones = AVAILABLE_TIMEZONES.filter(
    (tz) => !selectedTimezones.includes(tz)
  );

  return (
    <div className="dark:bg-gray-900 dark:text-white p-4 flex justify-center items-center">
      <div className="mx-auto w-full max-w-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
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

        <div className="flex flex-wrap  justify-evenly basis-2 gap-[5vw] h-fit px-2 py-5 ">
          {selectedTimezones.map((timeZone, index) => (
            <TimeZoneClock
              key={timeZone}
              timeZone={timeZone}
              isAnalog={isAnalog}
              onRemove={() => removeTimeZone(index)}
              baseTimeZone={selectedTimezones[0]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveWorldClock;












// jasa ImageUploader me popconfirm laga h vasa hi same clock ke remove pe laga do