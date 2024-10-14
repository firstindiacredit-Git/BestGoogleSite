import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import AddList from "./Calculator";
import Notepad from "./Notepad";
import ShowLinks from "./ShowLinks";
import AnimatedTooltipPreview from "./AnimatedTooltipPreview";
import Calendar from "./Calendar";
import { PiDotsThreeOutlineVerticalBold } from "react-icons/pi";

import "./style.css";

function SearchPage() {
  const [panel, setPanel] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(""); // State for custom background image
  const [showButtons, setShowButtons] = useState(false); // State for background options visibility

  // Load background image from localStorage when the component mounts
  useEffect(() => {
    const storedBackgroundImage = localStorage.getItem("backgroundImage");
    if (storedBackgroundImage) {
      setBackgroundImage(storedBackgroundImage); // Set background from localStorage
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setBackgroundImage(imageData); // Set the background image state
        localStorage.setItem("backgroundImage", imageData); // Store image in localStorage
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackground = () => {
    setBackgroundImage(""); // Reset background image
    localStorage.removeItem("backgroundImage"); // Remove background image from localStorage
  };

  const handleIconClick = () => {
    setShowButtons(!showButtons); // Toggles visibility of buttons
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.id = "google-cse";
    script.src = "https://cse.google.com/cse.js?cx=80904074a37154829"; // Replace with your CSE ID
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      className={`${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <div className="mt-4 h-122vh">
        <div className="flex flex-col items-center">
          {/* Google Logo */}
          <img
            src={isDarkMode ? "GoogleBlack.png" : "GoogleWhite.png"}
            alt="Google Logo"
            className="m-auto mb-4 h-8"
          />
          {/* Google Search Box powered by CSE */}
          <div className="gcse-searchbox-only" />
        </div>

        {/* Search Filters */}
        {/* <div className="flex justify-center space-x-6 mt-2 mb-2">
          {["All", "Images", "Videos", "News", "Maps"].map((filter) => (
            <button
              key={filter}
              className="text-blue-500 dark:text-blue-400 hover:underline"
            >
              {filter}
            </button>
          ))}
        </div> */}

        <div>
          <AnimatedTooltipPreview />

          {/* Icon to click to show background options */}
          <div
            onClick={handleIconClick}
            className="cursor-pointer m-auto w-10 mr-10 flex justify-center"
          >
            <PiDotsThreeOutlineVerticalBold />
          </div>

          {/* Buttons shown/hidden based on state */}
          {showButtons && (
            <div className="flex flex-col  m-auto mr-12 items-center rounded-lg border p-3 mt-2 gap-2 w-[200px] mx-auto">
              {/* Button for changing background */}
              <button
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full"
                onClick={() =>
                  document.getElementById("backgroundInput").click()
                }
              >
                Change Background
              </button>

              {/* Hidden input for background change */}
              <input
                type="file"
                id="backgroundInput"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {/* Button to remove the background */}
              <button
                onClick={removeBackground}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-600 w-full"
              >
                Remove Background
              </button>
            </div>
          )}

          <h1 className="text-2xl py-3 font-bold bg-transparent text-center ">
            COMPONENTS
          </h1>
          <ShowLinks />
          <div className="flex justify-between w-[100%]">
            <div className="w-full">
              <AddList />
              <Notepad />
            </div>
            <div className="w-[100%]">
              <Calendar />
            </div>
          </div>
        </div>

        {/* Dark/Light Mode Panel */}
        {panel && (
          <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg p-4 rounded-md">
            <h3 className="text-lg">Toggle Theme</h3>
            <button
              onClick={toggleTheme}
              className={`mt-2 p-2 rounded ${
                isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
              }`}
            >
              Switch to {isDarkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
