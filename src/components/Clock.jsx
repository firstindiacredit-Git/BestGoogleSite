import React, { useState, useEffect, useRef } from "react";
import { Plus, X, Settings } from "lucide-react";
import { Popconfirm, Menu, Dropdown } from "antd";
import { auth, db } from "../firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { createPortal } from "react-dom";

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
    return new Date(time).toLocaleTimeString("en-US", {
      timeZone: timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "--:--:-- --";
  }
};

const getClockHandDegrees = (time, timeZone) => {
  const date = new Date(time.toLocaleString("en-US", { timeZone }));
  const hours = date.getHours() % 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();

  const hourDegrees = hours * 30 + minutes / 2;
  const minuteDegrees = minutes * 6 + seconds / 10;
  const secondDegrees = (seconds + milliseconds / 1000) * 6;

  return {
    hours: hourDegrees,
    minutes: minuteDegrees,
    seconds: secondDegrees,
  };
};

const getTimeDifference = (baseTimeZone, targetTimeZone) => {
  const now = new Date();

  // Calculate today's difference
  const baseTimeToday = new Date(
    now.toLocaleString("en-US", { timeZone: baseTimeZone })
  );
  const targetTimeToday = new Date(
    now.toLocaleString("en-US", { timeZone: targetTimeZone })
  );
  const diffHoursToday = (targetTimeToday - baseTimeToday) / (1000 * 60 * 60);

  const signToday = diffHoursToday > 0 ? "+" : "";

  return `Today: (${signToday}${diffHoursToday}h)`;
};

const CLOCK_THEMES = {
  classic: {
    name: "Classic",
    analog: {
      border: "border-gray-200 dark:border-gray-700",
      background: "bg-white dark:bg-gray-950",
      hourHand: "bg-indigo-500",
      minuteHand: "bg-gray-900 dark:bg-white",
      secondHand: "bg-gray-200 dark:bg-gray-200",
      numbers: "text-gray-900 dark:text-white",
    },
    digital: {
      container: "dark:bg-gray-950 bg-gray-100",
      time: "dark:bg-black bg-white border-gray-800 dark:border-white",
      text: "text-gray-800 dark:text-white",
    },
  },
  neon: {
    name: "Neon",
    analog: {
      border: "border-purple-500 dark:border-purple-400",
      background: "bg-black",
      hourHand: "bg-pink-500",
      minuteHand: "bg-purple-500",
      secondHand: "bg-gray-200 dark:bg-gray-200",

      numbers: "text-purple-400",
    },
    digital: {
      container: "bg-black",
      time: "bg-black border-purple-500",
      text: "text-purple-400",
    },
  },
  minimal: {
    name: "Minimal",
    analog: {
      border: "border-gray-300 dark:border-gray-600",
      background: "bg-gray-50 dark:bg-[#28283A]",
      hourHand: "bg-gray-600 dark:bg-gray-400",
      minuteHand: "bg-gray-800 dark:bg-gray-200",
      secondHand: "bg-gray-200 dark:bg-gray-200",

      numbers: "text-gray-600 dark:text-gray-400",
    },
    digital: {
      container: "bg-gray-50 dark:bg-[#28283A]",
      time: "bg-transparent border-gray-300 dark:border-gray-600",
      text: "text-gray-800 dark:text-gray-200",
    },
  },
  ocean: {
    name: "Ocean",
    analog: {
      border: "border-blue-400 dark:border-blue-500",
      background: "bg-blue-50 dark:bg-blue-900",
      hourHand: "bg-indigo-600",
      minuteHand: "bg-teal-500",
      secondHand: "bg-gray-200 dark:bg-gray-200",

      numbers: "text-indigo-800 dark:text-blue-200",
    },
    digital: {
      container: "bg-blue-50 dark:bg-blue-900",
      time: "bg-white/80 dark:bg-[#513a7a] border-blue-400 dark:border-blue-300",
      text: "text-blue-900 dark:text-blue-100",
    },
  },
};

const TimeZoneClock = ({
  timeZone,
  isAnalog,
  onRemove,
  baseTimeZone,
  theme = CLOCK_THEMES.classic,
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 16); // Update approximately 60 times per second for smooth animation
    return () => clearInterval(timer);
  }, []);

  const { hours, minutes, seconds } = getClockHandDegrees(time, timeZone);
  const timeDiff = getTimeDifference(baseTimeZone, timeZone);

  if (isAnalog) {
    return (
      <div className="relative w-fit px-2 h-fit flex flex-col items-center group">
        <Popconfirm
          title="Remove timezone"
          description="Are you sure you want to remove this timezone?"
          onConfirm={onRemove}
          okText="Yes"
          cancelText="No"
          placement="topRight"
        >
          <button className="absolute -top-2 -right-2 z-50 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-red-600 transition-opacity">
            <X size={16} />
          </button>
        </Popconfirm>
        <div
          className={`w-[5.5rem] h-[5.4rem] rounded-full border-2 relative flex items-center justify-center ${theme.analog.border} ${theme.analog.background}`}
        >
          {/* Numbers */}
          {[...Array(12)].map((_, index) => {
            const angle = (index + 1) * 30;
            const radian = (angle * Math.PI) / 180;
            const x = Math.sin(radian) * 29;
            const y = -Math.cos(radian) * 28;

            return (
              <div
                key={index}
                className={`absolute text-[8px] mt-[1rem] ml-[0.48rem] font-medium ${theme.analog.numbers}`}
                style={{
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                }}
              >
                {index + 1}
              </div>
            );
          })}

          {/* Clock hands */}
          <div
            className={`absolute z-50 w-1 h-1 ${theme.analog.numbers} rounded-full`}
          ></div>
          <div
            className={`absolute -mt-5 w-0.5 h-5 ${theme.analog.hourHand} origin-bottom rounded-full`}
            style={{ transform: `rotate(${hours}deg)` }}
          />
          <div
            className={`absolute -mt-7 w-0.5 h-7 ${theme.analog.minuteHand} origin-bottom rounded-full`}
            style={{ transform: `rotate(${minutes}deg)` }}
          />
          <div
            className={`absolute -mt-7 w-0.5 h-7 ${theme.analog.secondHand} origin-bottom rounded-full`}
            style={{ transform: `rotate(${seconds}deg)` }}
          />
        </div>
        <div className="text-center text-[10px] font-medium mt-1">
          <p className={`mb-0 ${theme.analog.numbers}`}>
            {formatTimeZoneName(timeZone)}
          </p>
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
        <button className="absolute -top-2 -right-2 z-50 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-red-600 transition-opacity">
          <X size={16} />
        </button>
      </Popconfirm>
      <div
        className={`h-full backdrop-blur-sm min-w-28 rounded-xl  flex flex-col items-center justify-center p-2 ${theme.digital.container}`}
      >
        <p className="text-[10px] font-medium mb-0.5 text-indigo-500">
          {formatTimeZoneName(timeZone)}
        </p>
        <div
          className={`border px-1 rounded-xs text-nowrap ${theme.digital.time}`}
        >
          <p
            className={`text-base font-bold tracking-wider ${theme.digital.text}`}
          >
            {formatTimeForZone(time, timeZone)}
          </p>
        </div>
        {timeDiff && (
          <p className="text-[10px] text-gray-500 whitespace-pre-line text-center">
            {timeDiff}
          </p>
        )}
      </div>
    </div>
  );
};

// Simple prevent scroll function like in CategoryHome
const preventScroll = (prevent) => {
  document.body.style.overflow = prevent ? "hidden" : "";
};

const ResponsiveWorldClock = () => {
  const [isAnalog, setIsAnalog] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedTimezones, setSelectedTimezones] = useState(["Asia/Kolkata"]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(CLOCK_THEMES.classic);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: null,
    right: null,
  });
  const settingsRef = useRef(null);
  const collapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    if (showSettingsDropdown && settingsRef.current) {
      const rect = settingsRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
      preventScroll(true);
    } else {
      preventScroll(false);
    }
    return () => preventScroll(false);
  }, [showSettingsDropdown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".menu-Container")) {
        setShowSettingsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    if (selectedTimezones.length < 8) {
      const newTimezones = [...selectedTimezones, timeZone];
      setSelectedTimezones(newTimezones);
      setIsDropdownOpen(false);

      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          await updateDoc(userDocRef, {
            savedTimezones: newTimezones,
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
          savedTimezones: newTimezones,
        });
      } catch (error) {
        console.error("Error removing timezone:", error);
      }
    }
  };

  const availableZones = AVAILABLE_TIMEZONES.filter(
    (tz) => !selectedTimezones.includes(tz)
  );

  const renderSettingsDropdown = () => {
    const dropdownContent = showSettingsDropdown && (
      <div
        className="fixed w-48 bg-white dark:text-white dark:bg-[#28283A] rounded-sm shadow-lg border border-gray-200 dark:border-gray-700 z-[9999] menu-Container"
        style={{
          top: `${dropdownPosition.top}px`,
          right: `${dropdownPosition.right}px`,
        }}
      >
        <div className="py-1">
          <button
            onClick={() => {
              setIsAnalog(!isAnalog);
              setShowSettingsDropdown(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {isAnalog ? "Switch to Digital" : "Switch to Analog"}
          </button>

          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

          {Object.entries(CLOCK_THEMES).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => {
                setCurrentTheme(theme);
                setShowSettingsDropdown(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {theme.name} Theme
            </button>
          ))}
        </div>
      </div>
    );

    return (
      <div className="menu-Container relative">
        <button
          ref={settingsRef}
          onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-white/20 transition flex items-center gap-2 rounded-sm"
        >
          <Settings className="w-5 h-5" />
        </button>
        {dropdownContent && createPortal(dropdownContent, document.body)}
      </div>
    );
  };

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`w-full  dark:text-white p-4 backdrop-blur-sm rounded-b-sm flex justify-center items-center`}
    >
      <div className=" w-full">
        <div className="flex items-center">
          <div className="flex w-full justify-between items-center">
            <div
              className="text-xl font-medium w-full cursor-pointer p-1"
              onClick={collapse}
            >
              Clock
            </div>
            {isHovering && (
              <>
                <div>
                  {selectedTimezones.length < 8 && (
                    <div className="relative">
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                        title="Add timezone"
                      >
                        <Plus className="w-5 h-5" />
                      </button>

                      {isDropdownOpen && availableZones.length > 0 && (
                        <>
                          <div className="absolute right-0 mt-2 w-48 dark:text-white dark:bg-[#513a7a] backdrop-blur-sm bg-gray-200 rounded-sm shadow-lg py-1 z-50 max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 dark:[&::-webkit-scrollbar-track]:bg-gray-800">
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
                {renderSettingsDropdown()}
              </>
            )}
          </div>
        </div>
        {!isCollapsed && (
          <div className="flex justify-center">
            <div className="flex flex-wrap justify-between w-full h-fit px-2 py-5">
              {selectedTimezones.map((timeZone, index) => (
                <div key={timeZone} className="mt-4">
                  <TimeZoneClock
                    timeZone={timeZone}
                    isAnalog={isAnalog}
                    onRemove={() => removeTimeZone(index)}
                    baseTimeZone={selectedTimezones[0]}
                    theme={currentTheme}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsiveWorldClock;
