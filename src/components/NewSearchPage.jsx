import React, { useState, useEffect } from "react";
import {Link } from "react-router-dom";
import Draggable from "react-draggable";
import Weather from "./Weather";
import Calculator from "./Calculator";
import Notepad from "./Notepad";
import Calendar from "./Calendar";
import WidgetBookmark from "./WidgetBookmark";
import AnimatedTooltipPreview from "./AnimatedTooltipPreview";
import Header from "../components/Header";
import { FaHome } from "react-icons/fa";

const Dashboard = () => {
  const [widgets, setWidgets] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [url, setUrl] = useState(null);
  const [visibleItem, setVisibleItem] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("themeMode") === "dark"
  );

  const widgetOptions = [
    { id: "calculator", name: "Calculator", content: <CalculateWidget /> },
    { id: "notepad", name: "Notepad", content: <NotepadWidget /> },
    { id: "calendar", name: "Calendar", content: <CalendarWidget /> },
    { id: "weather", name: "Weather", content: <WeatherWidget /> },
    { id: "bookmarks", name: "Bookmarks", content: <BookmarksWidget /> },
  ];

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("themeMode", newMode ? "dark" : "light");
      return newMode;
    });
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.id = "google-cse";
    script.src = "https://cse.google.com/cse.js?cx=80904074a37154829";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    const hideCompletionContainer = () => {
      const completionContainer = document.querySelector(
        ".gsc-completion-container"
      );
      if (completionContainer) completionContainer.style.display = "none";
    };

    window.addEventListener("scroll", hideCompletionContainer);

    return () => {
      document.body.removeChild(script);
      window.removeEventListener("scroll", hideCompletionContainer);
    };
  }, []);

  const addWidget = (widget) => {
    if (!widgets.some((w) => w.id === widget.id)) {
      setWidgets((prevWidgets) => [...prevWidgets, widget]);
    }
  };

  const removeWidget = (id) => {
    setWidgets((prevWidgets) => prevWidgets.filter((w) => w.id !== id));
  };

  const handleDragStop = (e, data, widget) => {
    const updatedWidgets = widgets.map((w) =>
      w.id === widget.id ? { ...w, position: { x: data.x, y: data.y } } : w
    );
    setWidgets(updatedWidgets);
  };
  
  const handleFileClick = () => {
    setUrl("https://pizeonflytools.vercel.app/");
  };

  const closeViewer = () => {
    setUrl(null);
  };

  const handleToggleVisibility = (itemId) => {
    setVisibleItem((prevVisibleItem) =>
      prevVisibleItem === itemId ? null : itemId
    );
  };

  const handleClose = (id) => {
    setVisibleItem(null);
  };

  return (
    <div
      className={` -mt-1 relative ${
        isDarkMode ? "bg-gray-900 text-white" : ""
      }`}
    >
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <div className="dark:bg-[#060d1c] ">
        <div className="flex flex-col dark:bg-[#060d1c] -mt-12 items-center">
          <img
            src={isDarkMode ? "GoogleBlack.png" : "GoogleWhite.png"}
            alt="Google Logo"
            className="mb-4 mt-20 filter bluescale contrast-700 h-20"
          />
          <div
            className="gcse-searchbox-only"
            data-resultsUrl="https://www.google.com/search?client=ms-google-coop&qcx=80904074a37154829"
            data-defaultToImageSearch="true"
          />
          <AnimatedTooltipPreview />
          <div>
            <Link to="/">
              <button className=" h-7 w-7 -mt-20 rounded-2xl  ">
                <FaHome className="text-green-700 h-10 w-7 text-center justify-center m-auto " />
              </button>
            </Link>
          </div>
          <div className="bg-gray-800 border-gray-400 p-2 mt-5 -mb-40 text-white w-full  dark:text-white font-semibold text-center space-x-6 sm:space-x-4 md:space-x-6 lg:space-x-10 mx-auto flex flex-wrap justify-center gap-2 md:gap-3 lg:gap-10">
            <Link to="/">
              <button className="bg-white h-7 w-7 rounded-2xl  ">
                <FaHome className="text-green-700 text-center justify-center m-auto " />
              </button>
            </Link>

            <div>
              <button
                className="hover:bg-gray-500 hover:text-white w-[45%] sm:w-[30%] md:w-[100%] lg:w-[120%] xl:w-[170%] rounded-xl -ml-8"
                onClick={() => handleToggleVisibility("PopularBookmarks")}
              >
                BOOKMARKS
              </button>
              {visibleItem === "PopularBookmarks" && (
                <>
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"></div>
                  <div className="fixed top-1/2 left-1/2 z-50 w-[90%] h-[90%] max-h-[90vh] p-4 shadow-lg transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#4a454e] rounded-lg overflow-y-auto">
                    <PopularBookmarks />
                    <button
                      className="absolute top-3 right-3 dark:text-white"
                      onClick={() => handleClose("PopularBookmarks")}
                    >
                      <IoIosCloseCircleOutline size={30} />
                    </button>
                  </div>
                </>
              )}
            </div>

            <div>
              <button
                className="hover:bg-gray-500 hover:text-white w-[45%] sm:w-[30%] md:w-[100%] lg:w-[100%] xl:w-[120%] rounded-xl"
                onClick={() => handleToggleVisibility("Notepad")}
              >
                NOTES
              </button>
              {visibleItem === "Notepad" && (
                <>
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"></div>
                  <div className="fixed top-1/2 left-1/2 z-50 w-[70%] h-[100%] p-4  transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#4a454e] rounded-lg">
                    <Notepad />
                    <button
                      className="absolute top-3 right-3 dark:text-white"
                      onClick={() => handleClose("Notepad")}
                    >
                      <IoIosCloseCircleOutline size={30} />
                    </button>
                  </div>
                </>
              )}
            </div>
            <div>
              <button
                className="hover:bg-gray-500 hover:text-white w-[45%] sm:w-[30%] md:w-[100%] lg:w-[120%] xl:w-[130%] rounded-xl"
                onClick={() => handleToggleVisibility("PasswordGenerator")}
              >
                PASSWORD
              </button>
              {visibleItem === "PasswordGenerator" && (
                <>
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"></div>
                  <div className="fixed top-1/2 left-1/2 z-50 w-[90%] h-[90%] max-h-[90vh] p-4  transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#4a454e] rounded-lg overflow-y-auto">
                    <PasswordGenerator />
                    <button
                      className="absolute top-3 right-3 dark:text-white"
                      onClick={() => handleClose("PasswordGenerator")}
                    >
                      <IoIosCloseCircleOutline size={30} />
                    </button>
                  </div>
                </>
              )}
            </div>
            <div>
              <button
                className="hover:bg-gray-500 hover:text-white w-[45%] sm:w-[30%] md:w-[100%] lg:w-[100%] xl:w-[120%] rounded-xl"
                onClick={() => handleToggleVisibility("News")}
              >
                NEWS
              </button>
              {visibleItem === "News" && (
                <>
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"></div>
                  <div className="fixed top-1/2 left-1/2 z-50 w-[70%] h-[100%] p-4 shadow-lg transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#4a454e] rounded-lg">
                    <News />
                    <button
                      className="absolute top-3 right-3 dark:text-white"
                      onClick={() => handleClose("News")}
                    >
                      <IoIosCloseCircleOutline size={30} />
                    </button>
                  </div>
                </>
              )}
            </div>
            <div>
              <button
                className="hover:bg-gray-500 hover:text-white w-[45%] sm:w-[30%] md:w-[100%] lg:w-[100%] xl:w-[120%] rounded-xl"
                onClick={() => handleToggleVisibility("SPORTS")}
              >
                SPORTS
              </button>
              {/* {visibleItem === "SPORTS" && (
              <>
                <div className="fixed inset-0 bg-transparent bg-opacity-70 backdrop-blur-sm z-40"></div>
                <div className="fixed top-1/2 left-1/2 z-50 w-[70%] h-[100%] p-4 shadow-lg transform -translate-x-1/2 -translate-y-1/2 bg-[#f3e9ff] dark:bg-[#4a454e] rounded-lg">
                  <SPORTS />
                  <button
                    className="absolute top-3 right-3 dark:text-white"
                    onClick={() => handleClose("SPORTS")}
                  >
                    <IoIosCloseCircleOutline size={30} />
                  </button>
                </div>
              </>
            )} */}
            </div>
            <div>
              <button
                className="hover:bg-gray-500 hover:text-white w-[45%] sm:w-[30%] md:w-[100%] lg:w-[100%] xl:w-[120%] rounded-xl"
                onClick={() => handleToggleVisibility("TOP100")}
              >
                TOP100
              </button>
              {/* {visibleItem === "TOP100" && (
              <>
                <div className="fixed inset-0 bg-transparent bg-opacity-70 backdrop-blur-sm z-40"></div>
                <div className="fixed top-1/2 left-1/2 z-50 w-[70%] h-[100%] p-4 shadow-lg transform -translate-x-1/2 -translate-y-1/2 bg-[#f3e9ff] dark:bg-[#4a454e] rounded-lg">
                  <TOP100 />
                  <button
                    className="absolute top-3 right-3 dark:text-white"
                    onClick={() => handleClose("TOP100")}
                  >
                    <IoIosCloseCircleOutline size={30} />
                  </button>
                </div>
              </>
            )} */}
            </div>
            {/* Other buttons iframe */}
            <div>
              <button
                onClick={handleFileClick}
                className="hover:bg-gray-500 hover:text-white w-[45%] sm:w-[30%] md:w-[20%] lg:w-[15%] xl:w-[120%] rounded-2xl"
              >
                TOOLS
              </button>
            </div>
          </div>
        </div>
        <div className="mt-44 dark:bg-[#060d1c] ">
          <div className="mb-4 dark:bg-[#060d1c] ">
            <button
              className="bg-blue-500 ml-4 text-white mb-3 px-4 py-2 rounded"
              aria-haspopup="true"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              Add Widget
            </button>
            {showDropdown && (
              <div className="absolute mt-2 bg-white dark:bg-gray-800 border shadow ml-4  dark:shadow-white rounded w-48 z-10">
                {widgetOptions.map((option) => (
                  <button
                    key={option.id}
                    className="block w-full text-left ml-10 dark:text-white px-4 py-2 hover:-ml-[0px] hover:dark:text-black hover:bg-gray-100"
                    onClick={() => {
                      addWidget(option);
                      setShowDropdown(false);
                    }}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div
          className="grid grid-cols-3 -mt-4 gap-4 border-2 border-dashed dark:bg-[#060d1c] border-gray-300 rounded-lg p-4 min-h-[400px]"
          style={{ position: "relative" }}
        >
          {widgets.length === 0 ? (
            <p className="text-gray-500 text-center col-span-3">
              No widgets added yet.
            </p>
          ) : (
            widgets.map((widget) => (
              <Draggable
                key={widget.id}
                bounds="parent"
                position={widget.position || { x: 0, y: 0 }}
                onStop={(e, data) => handleDragStop(e, data, widget)}
              >
                <div className="bg-white dark:bg-[#060d1c] dark:text-white shadow dark:shadow-white rounded p-4 cursor-move relative">
                  <button
                    className="absolute top-4 right-2 text-red-500"
                    aria-label="Remove Widget"
                    onClick={() => removeWidget(widget.id)}
                  >
                    ✖
                  </button>
                  {widget.content}
                </div>
              </Draggable>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const CalculateWidget = () => (
  <div>
    <h3 className="font-bold -mb-7">Calculator</h3>
    <Calculator />
  </div>
);

const NotepadWidget = () => (
  <div>
    <h3 className="font-bold">Notepad</h3>
    <Notepad />
  </div>
);

const CalendarWidget = () => (
  <div>
    <h3 className="font-bold mb-2">Calendar</h3>
    <Calendar />
  </div>
);

const WeatherWidget = () => (
  <div>
    <h3 className="font-bold mb-12">Weather</h3>
    <Weather />
  </div>
);

const BookmarksWidget = () => (
  <div>
    <h3 className="font-bold">Bookmarks</h3>
    <WidgetBookmark />
  </div>
);

export default Dashboard;
