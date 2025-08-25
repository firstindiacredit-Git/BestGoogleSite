import { useState, useEffect, useRef } from "react";
import { Plus, X, Settings, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Popconfirm } from "antd";
import { auth, db } from "../firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { createPortal } from "react-dom";
import AVAILABLE_TIMEZONES from "../components/availableTimezones.json";

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
          secondHand: "bg-orange-500",
          numbers: "text-black font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] scale-110",
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
          secondHand: "bg-orange-500",
          numbers: "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] scale-1",
        },
        digital: {
          container: "bg-[#28283A]",
          time: "bg-transparent border-gray-600",
          text: "text-white",
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
      <div className="relative w-fit px-1 sm:px-2 h-fit flex flex-col items-center group flex-shrink-0">
        <Popconfirm
          title="Remove timezone"
          description="Are you sure you want to remove this timezone?"
          onConfirm={onRemove}
          okText="Yes"
          cancelText="No"
          placement="topRight"
        >
          <button className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 z-50 text-red-500 rounded-full p-0.5 sm:p-1 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-red-600 transition-opacity">
            <X size={12} className="sm:w-4 sm:h-4" />
          </button>
        </Popconfirm>
        <div
          className={`w-[4.5rem] h-[4.5rem] sm:w-[5rem] sm:h-[5rem] md:w-[5.5rem] md:h-[5.5rem] lg:w-[6rem] lg:h-[6rem] xl:w-[6.5rem] xl:h-[6.4rem] rounded-full border-2 relative flex items-center justify-center p-1 sm:p-1.5 md:p-2 ${effectiveTheme.analog.border} ${effectiveTheme.analog.background}`}
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
                className={`absolute text-[11px] mt-[1.2rem] ml-[0.48rem] ${effectiveTheme.analog.numbers}`}
                style={{
                  transform: `translate(-50%, -50%) translate(${x * 1.13}px, ${y * 1.13}px)`,
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
          <p className={"mb-0 text-black dark:text-white"}>
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
    <div className="relative w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-22 lg:h-22 xl:w-24 xl:h-24 group flex-shrink-0">
      <Popconfirm
        title="Remove timezone"
        description="Are you sure you want to remove this timezone?"
        onConfirm={onRemove}
        okText="Yes"
        cancelText="No"
        placement="topRight"
      >
        <button className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 z-50 text-red-500 rounded-full p-0.5 sm:p-1 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-red-600 transition-opacity">
          <X size={12} className="sm:w-4 sm:h-4" />
        </button>
      </Popconfirm>
      <div
        className={`h-full backdrop-blur-sm min-w-16 sm:min-w-18 md:min-w-20 lg:min-w-22 xl:min-w-24 rounded-xl flex flex-col items-center justify-center p-1 sm:p-1.5 md:p-2 ${effectiveTheme.digital.container}`}
      >
        <p className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] font-medium mb-0">
          <span className={effectiveTheme.digital.text}>{formatTimeZoneName(timeZone)}</span>
        </p>
        <div
          className={`border px-0.5 sm:px-1 rounded-xs text-nowrap ${effectiveTheme.digital.time}`}
        >
          <p
            className={`text-xs sm:text-sm md:text-base font-bold tracking-wider ${effectiveTheme.digital.text}`}
          >
            {formatTimeForZone(time, timeZone)}
          </p>
        </div>
        {timeDiff && (
          <p className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] text-gray-500 whitespace-pre-line text-center">
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
  // Load initial analog preference from localStorage, default to true
  const [isAnalog, setIsAnalog] = useState(() => {
    const saved = localStorage.getItem('clockDesign');
    return saved ? JSON.parse(saved) : true;
  });
  const [selectedTimezones, setSelectedTimezones] = useState([
    "Asia/Kolkata", // India
    "America/Los_Angeles", // Los Angeles
    "Australia/Melbourne", // Melbourne
    "Asia/Singapore", // Singapore
  ]);
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
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
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
    if (selectedTimezones.length >= 4) {
      setPopupMessage("You can only add 4 clocks. Please delete one clock first to add a new one.");
      setPopupType("warning");
      setShowPopup(true);
      setIsDropdownOpen(false);
      return;
    }

    const newTimezones = [...selectedTimezones, timeZone];
    setSelectedTimezones(newTimezones);
    setIsDropdownOpen(false);

    setPopupMessage(`Added ${formatTimeZoneName(timeZone)} clock successfully!`);
    setPopupType("success");
    setShowPopup(true);

    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      try {
        await updateDoc(userDocRef, {
          savedTimezones: newTimezones,
        });
      } catch (error) {
        console.error("Error saving timezones:", error);
        setPopupMessage("Failed to save clock. Please try again.");
        setPopupType("error");
        setShowPopup(true);
      }
    }
  };

  const removeTimeZone = async (index) => {
    const timezoneToRemove = selectedTimezones[index];
    const newTimezones = selectedTimezones.filter((_, i) => i !== index);
    setSelectedTimezones(newTimezones);

    setPopupMessage(`Removed ${formatTimeZoneName(timezoneToRemove)} clock successfully!`);
    setPopupType("success");
    setShowPopup(true);

    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      try {
        await updateDoc(userDocRef, {
          savedTimezones: newTimezones,
        });
      } catch (error) {
        console.error("Error removing timezone:", error);
        setPopupMessage("Failed to remove clock. Please try again.");
        setPopupType("error");
        setShowPopup(true);
      }
    }
  };

  const allTimezones = Object.values(AVAILABLE_TIMEZONES).flat();
  const availableZones = allTimezones.filter(
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
        className="fixed w-36 sm:w-40 md:w-48 bg-white dark:bg-[#28283A] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[9998] overflow-hidden"
        style={{
          top: `${dropdownPosition.top}px`,
          right: `${dropdownPosition.right}px`,
        }}
      >
        <div className="p-2 sm:p-3">
          <div className="mb-2">
            <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Display
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setIsAnalog(false);
                  setShowSettings(false);
                }}
                className={`p-1.5 sm:p-2 rounded flex-1 text-xs sm:text-sm ${
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
                  setShowSettings(false);
                }}
                className={`p-1.5 sm:p-2 rounded flex-1 text-xs sm:text-sm ${
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
        className="fixed w-48 sm:w-56 md:w-64 bg-white dark:bg-[#28283A] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[9998] overflow-hidden add-timezone-dropdown"
        style={{
          top: `${addDropdownPosition.top}px`,
          right: `${addDropdownPosition.right}px`,
        }}
      >
        <div className="p-2 sm:p-3">
          <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Add Timezone
          </div>
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search timezone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <div
            className="max-h-[220px] sm:max-h-[240px] md:max-h-[280px] overflow-y-auto pr-1 space-y-0.5 custom-scrollbar"
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
                className="w-full p-1.5 sm:p-2 text-left text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white flex items-center gap-1.5 sm:gap-2 rounded-md transition-colors"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{formatTimeZoneName(timeZone)}</span>
              </button>
            ))}
            {filteredZones.length === 0 && (
              <div className="text-center py-2 sm:py-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
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

  // Save analog preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('clockDesign', JSON.stringify(isAnalog));
  }, [isAnalog]);

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="w-full max-w-xl dark:text-white backdrop-blur-sm rounded-sm flex flex-col relative p-2 sm:p-3 md:p-4"
      style={{ height: '350px', minHeight: '350px', maxHeight: '350px' }}
    >
      {selectedTimezones.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 overflow-x-auto overflow-y-hidden pb-2">
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
            className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Plus className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Add Clock
            </span>
          </button>
        </div>
      )}

      {/* Bottom Options Bar */}
      <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 w-fit shadow-md rounded-lg p-1 dark:bg-[#1F2937] bg-white flex items-center justify-end gap-1 sm:gap-2 z-[9997]">
        {selectedTimezones.length < 4 && (
          <button
            ref={addButtonRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-1.5 sm:p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-500 transition"
            title="Add timezone"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
        {selectedTimezones.length >= 4 && (
          <button
            onClick={() => {
              setPopupMessage("You have reached the maximum limit of 4 clocks. Delete one to add more.");
              setPopupType("info");
              setShowPopup(true);
            }}
            className="p-1.5 sm:p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-500 transition"
            title="Maximum clocks reached"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 opacity-50" />
          </button>
        )}
        <button
          ref={settingsRef}
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 sm:p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-500 transition"
          title="Settings"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {renderSettingsMenu()}
      {renderAddTimezoneMenu()}
      
      {/* Custom Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-xs sm:max-w-sm mx-4 shadow-xl transform transition-all">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              {popupType === "success" && (
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              )}
              {popupType === "warning" && (
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              )}
              {popupType === "error" && (
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              )}
              {popupType === "info" && (
                <Info className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              )}
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {popupType === "success" && "Success"}
                {popupType === "warning" && "Warning"}
                {popupType === "error" && "Error"}
                {popupType === "info" && "Information"}
              </h3>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
              {popupMessage}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowPopup(false)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm sm:text-base"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveWorldClock;