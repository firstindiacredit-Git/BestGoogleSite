import React, { useState, useEffect, useRef } from "react";
import { Plus, X, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { Popconfirm, Menu, Dropdown } from "antd";
import { auth, db } from "../firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { createPortal } from "react-dom";

const AVAILABLE_TIMEZONES = [
  // North America
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "America/Toronto",
  "America/Vancouver",
  "America/Mexico_City",
  "America/Phoenix",
  "America/Denver",
  "America/Montreal",
  "America/Miami",

  // South America
  "America/Sao_Paulo",
  "America/Buenos_Aires",
  "America/Santiago",
  "America/Lima",
  "America/Bogota",
  "America/Caracas",

  // Europe
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Europe/Rome",
  "Europe/Madrid",
  "Europe/Amsterdam",
  "Europe/Vienna",
  "Europe/Stockholm",
  "Europe/Prague",
  "Europe/Warsaw",
  "Europe/Istanbul",
  "Europe/Copenhagen",
  "Europe/Oslo",
  "Europe/Dublin",
  "Europe/Brussels",
  "Europe/Zurich",

  // Asia
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Dubai",
  "Asia/Hong_Kong",
  "Asia/Seoul",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Jakarta",
  "Asia/Manila",
  "Asia/Kuala_Lumpur",
  "Asia/Taipei",
  "Asia/Jerusalem",
  "Asia/Baghdad",
  "Asia/Riyadh",
  "Asia/Tehran",
  "Asia/Karachi",
  "Asia/Ho_Chi_Minh",

  // Oceania
  "Pacific/Auckland",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Perth",
  "Australia/Brisbane",
  "Pacific/Honolulu",
  "Pacific/Fiji",
  "Pacific/Guam",

  // Africa
  "Africa/Johannesburg",
  "Africa/Cairo",
  "Africa/Lagos",
  "Africa/Nairobi",
  "Africa/Casablanca",
  "Africa/Accra",
  "Africa/Addis_Ababa",
  "Africa/Dar_es_Salaam",
  "Africa/Khartoum",
];

const formatTimeZoneName = (timeZone) => {
  const specialCases = {
    "Asia/Kolkata": "India",
    "Asia/Ho_Chi_Minh": "Vietnam",
    "America/Argentina/Buenos_Aires": "Buenos Aires",
    "America/Sao_Paulo": "São Paulo",
    "Africa/Dar_es_Salaam": "Tanzania",
  };

  if (specialCases[timeZone]) {
    return specialCases[timeZone];
  }

  return timeZone.split("/").pop().replace(/_/g, " ");
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

  // Get the time in milliseconds for both timezones
  const baseTime = new Date(
    now.toLocaleString("en-US", { timeZone: baseTimeZone })
  );
  const targetTime = new Date(
    now.toLocaleString("en-US", { timeZone: targetTimeZone })
  );

  // Calculate the raw offset in hours
  const offsetHours = (targetTime - baseTime) / (1000 * 60 * 60);

  // Format the difference
  const sign = offsetHours >= 0 ? "+" : "";
  const absHours = Math.abs(offsetHours);

  // Handle fractional hours (for timezones with 30/45 minute differences)
  if (absHours % 1 !== 0) {
    const hours = Math.floor(absHours);
    const minutes = Math.round((absHours % 1) * 60);
    if (hours === 0) {
      return `${sign}${minutes}m`;
    }
    return `${sign}${hours}h ${minutes}m`;
  }

  return `${sign}${absHours}h`;
};

const isDaytime = (time, timeZone) => {
  const date = new Date(time.toLocaleString("en-US", { timeZone }));
  const hours = date.getHours();
  return hours >= 6 && hours < 18; // Consider 6 AM to 6 PM as daytime
};

const TimeZoneClock = ({ timeZone, isAnalog, onRemove, baseTimeZone }) => {
  const [time, setTime] = useState(new Date());
  const isDayTimeNow = isDaytime(time, timeZone);

  // Single theme system based on day/night
  const effectiveTheme = isDayTimeNow
    ? {
        analog: {
          border: "border-gray-200",
          background: "bg-white",
          hourHand: "bg-indigo-500",
          minuteHand: "bg-gray-900",
          secondHand: "bg-gray-200",
          numbers: "text-gray-900",
        },
        digital: {
          container: "bg-gray-100",
          time: "bg-white border-gray-800",
          text: "text-gray-800",
        },
      }
    : {
        analog: {
          border: "border-gray-600",
          background: "bg-[#28283A]",
          hourHand: "bg-gray-400",
          minuteHand: "bg-gray-200",
          secondHand: "bg-gray-200",
          numbers: "text-gray-400",
        },
        digital: {
          container: "bg-[#28283A]",
          time: "bg-transparent border-gray-600",
          text: "text-gray-200",
        },
      };

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 16);
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
          className={`w-[5.5rem] h-[5.4rem] rounded-full border-2 relative flex items-center justify-center ${effectiveTheme.analog.border} ${effectiveTheme.analog.background}`}
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
                className={`absolute text-[8px] mt-[1rem] ml-[0.48rem] font-medium ${effectiveTheme.analog.numbers}`}
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
            className={`absolute z-50 w-1 h-1 ${effectiveTheme.analog.numbers} rounded-full`}
          ></div>
          <div
            className={`absolute -mt-5 w-0.5 h-5 ${effectiveTheme.analog.hourHand} origin-bottom rounded-full`}
            style={{ transform: `rotate(${hours}deg)` }}
          />
          <div
            className={`absolute -mt-7 w-0.5 h-7 ${effectiveTheme.analog.minuteHand} origin-bottom rounded-full`}
            style={{ transform: `rotate(${minutes}deg)` }}
          />
          <div
            className={`absolute -mt-7 w-0.5 h-7 ${effectiveTheme.analog.secondHand} origin-bottom rounded-full`}
            style={{ transform: `rotate(${seconds}deg)` }}
          />
        </div>
        <div className="text-center text-[10px] font-medium mt-1">
          <p className={`mb-0 ${effectiveTheme.analog.numbers}`}>
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
        className={`h-full backdrop-blur-sm min-w-28 rounded-xl flex flex-col items-center justify-center p-2 ${effectiveTheme.digital.container}`}
      >
        <p className="text-[10px] font-medium mb-0.5 text-indigo-500">
          {formatTimeZoneName(timeZone)}
        </p>
        <div
          className={`border px-1 rounded-xs text-nowrap ${effectiveTheme.digital.time}`}
        >
          <p
            className={`text-base font-bold tracking-wider ${effectiveTheme.digital.text}`}
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
  const [isAnalog, setIsAnalog] = useState(() => {
    // Get the stored preference from localStorage, default to true (analog) if not found
    const storedPreference = localStorage.getItem('clockViewPreference');
    return storedPreference ? JSON.parse(storedPreference) : true;
  });
  const [selectedTimezones, setSelectedTimezones] = useState(["Asia/Kolkata", "America/New_York"]);
  const [isHovering, setIsHovering] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: null,
    right: null,
  });
  const [addDropdownPosition, setAddDropdownPosition] = useState({
    top: null,
    right: null,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const settingsRef = useRef(null);
  const addButtonRef = useRef(null);
  const settingsMenuRef = useRef(null);

  useEffect(() => {
    if (showSettings && settingsRef.current) {
      const rect = settingsRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom - 120,
        right: window.innerWidth - rect.right,
      });
    }
  }, [showSettings]);

  useEffect(() => {
    if (isDropdownOpen && addButtonRef.current) {
      const rect = addButtonRef.current.getBoundingClientRect();
      setAddDropdownPosition({
        top: rect.bottom - 380,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside settings menu and settings button
      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target) &&
        settingsRef.current &&
        !settingsRef.current.contains(event.target)
      ) {
        setShowSettings(false);
      }

      // Check if click is outside add timezone dropdown and add button
      if (
        isDropdownOpen &&
        addButtonRef.current &&
        !addButtonRef.current.contains(event.target) &&
        !event.target.closest('.add-timezone-dropdown')
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      preventScroll(false);
    };
  }, [isDropdownOpen]);

  // Add new effect to handle scroll prevention
  useEffect(() => {
    preventScroll(isDropdownOpen);
    return () => preventScroll(false);
  }, [isDropdownOpen]);

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

  const filteredZones = availableZones.filter(
    (tz) =>
      formatTimeZoneName(tz)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      tz.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSettingsMenu = () => {
    const settingsContent = showSettings && (
      <div
        ref={settingsMenuRef}
        className="fixed w-48 bg-white dark:bg-[#28283A] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[9998] overflow-hidden"
        style={{
          top: `${dropdownPosition.top}px`,
          right: `${dropdownPosition.right}px`,
        }}
      >
        <div className="p-3">
          <div className="mb-2">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Display
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setIsAnalog(false);
                  localStorage.setItem('clockViewPreference', JSON.stringify(false));
                  setShowSettings(false);
                }}
                className={`p-2 rounded flex-1 ${
                  !isAnalog
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                    : "hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                }`}
              >
                Digital
              </button>
              <button
                onClick={() => {
                  setIsAnalog(true);
                  localStorage.setItem('clockViewPreference', JSON.stringify(true));
                  setShowSettings(false);
                }}
                className={`p-2 rounded flex-1 ${
                  isAnalog
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Analog
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    return createPortal(settingsContent, document.body);
  };

  const renderAddTimezoneMenu = () => {
    const addTimezoneContent = isDropdownOpen && (
      <div
        className="fixed w-64 bg-white dark:bg-[#28283A] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[9998] overflow-hidden add-timezone-dropdown"
        style={{
          top: `${addDropdownPosition.top}px`,
          right: `${addDropdownPosition.right}px`,
        }}
      >
        <div className="p-3">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Add Timezone
          </div>
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search timezone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <div
            className="max-h-[280px] overflow-y-auto pr-1 space-y-0.5 custom-scrollbar"
            style={{
              "--scrollbar-thumb": "rgb(203 213 225)",
              "--scrollbar-thumb-hover": "rgb(148 163 184)",
              "--scrollbar-track": "rgb(241 245 249)",
            }}
          >
            {filteredZones.map((timeZone) => (
              <button
                key={timeZone}
                onClick={() => addTimeZone(timeZone)}
                className="w-full p-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white flex items-center gap-2 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{formatTimeZoneName(timeZone)}</span>
              </button>
            ))}
            {filteredZones.length === 0 && (
              <div className="text-center py-3 text-sm text-gray-500 dark:text-gray-400">
                No timezones found
              </div>
            )}
          </div>
        </div>
      </div>
    );

    return createPortal(addTimezoneContent, document.body);
  };

  // Add this CSS at the top of your file or in your global styles
  const customScrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
      background: var(--scrollbar-track);
      border-radius: 4px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: var(--scrollbar-thumb);
      border-radius: 4px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: var(--scrollbar-thumb-hover);
    }

    @media (prefers-color-scheme: dark) {
      .custom-scrollbar {
        --scrollbar-thumb: rgb(55 65 81);
        --scrollbar-thumb-hover: rgb(75 85 99);
        --scrollbar-track: rgb(31 41 55);
      }
    }
  `;

  useEffect(() => {
    // Add the styles to the document
    const styleSheet = document.createElement("style");
    styleSheet.innerText = customScrollbarStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="w-full max-w-xl dark:text-white backdrop-blur-sm rounded-sm flex flex-col relative p-4"
    >
      {selectedTimezones.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-8">
          {selectedTimezones.map((tz, index) => (
            <TimeZoneClock
              key={tz}
              timeZone={tz}
              isAnalog={isAnalog}
              onRemove={() => removeTimeZone(index)}
              baseTimeZone={selectedTimezones[0]}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-[200px]">
          <button
            onClick={() => setIsDropdownOpen(true)}
            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Add Clock
            </span>
          </button>
        </div>
      )}

      {/* Bottom Options Bar */}
      {isHovering && (
        <div className="absolute bottom-2 right-2 w-fit shadow-md rounded-lg p-1 dark:bg-[#1F2937] bg-white flex items-center justify-end gap-2 z-[9997]">
          {selectedTimezones.length < 8 && (
            <button
              ref={addButtonRef}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-500 transition"
              title="Add timezone"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
          <button
            ref={settingsRef}
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-500 transition"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      )}

      {renderSettingsMenu()}
      {renderAddTimezoneMenu()}
    </div>
  );
};

export default ResponsiveWorldClock;
