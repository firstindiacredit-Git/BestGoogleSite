import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import AddList from "./Calculator";
import Notepad from "./Notepad";
import ShowLinks from "./ShowLinks";
import AnimatedTooltipPreview from "./AnimatedTooltipPreview";
import Calendar from "./Calendar";
import ImageUploader from "./ImageUploader";
import PopularBookmarks from "./PopularBookmarks";

import { PiDotsThreeOutlineVerticalBold } from "react-icons/pi";

import "./style.css";

function SearchPage() {
  const [panel, setPanel] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const storedBackgroundImage = localStorage.getItem("backgroundImage");
    if (storedBackgroundImage) {
      setBackgroundImage(storedBackgroundImage);
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
        setBackgroundImage(imageData);
        localStorage.setItem("backgroundImage", imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackground = () => {
    setBackgroundImage("");
    localStorage.removeItem("backgroundImage");
  };

  const handleIconClick = () => {
    setShowButtons(!showButtons);
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
      } min-h-screen`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <div className="mt-4">
        <div className="flex flex-col items-center">
          <img
            src={isDarkMode ? "GoogleBlack.png" : "GoogleWhite.png"}
            alt="Google Logo"
            className="mb-4 h-8"
          />
          <div className="gcse-searchbox-only" />
        </div>

        <div>
          <AnimatedTooltipPreview />
          <div
            onClick={handleIconClick}
            className="cursor-pointer m-auto w-10 flex justify-center"
          >
            <PiDotsThreeOutlineVerticalBold />
          </div>

          {showButtons && (
            <div className="flex flex-col items-center rounded-lg border p-3 mt-2 gap-2 w-full max-w-xs mx-auto">
              <button
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full"
                onClick={() =>
                  document.getElementById("backgroundInput").click()
                }
              >
                Change Background
              </button>
              <input
                type="file"
                id="backgroundInput"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                onClick={removeBackground}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-600 w-full"
              >
                Remove Background
              </button>
            </div>
          )}

          <h1 className="text-2xl py-3 font-bold text-center">COMPONENTS</h1>
          <ShowLinks />

          {/* Main content responsive layout */}
          <div className="flex flex-col md:flex-row justify-between w-full gap-4">
            <div className="w-full md:w-1/2 lg:w-1/2 p-2">
              <AddList />
              <Notepad />
            </div>
            <div className="w-full flex p-2">
              <PopularBookmarks />
            </div>
            <div className="w-full md:w-1/2 lg:w-1/2 p-2">
              <ImageUploader />
              <Calendar />
            </div>
          </div>
        </div>

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
