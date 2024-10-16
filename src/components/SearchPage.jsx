import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import AddList from "./Calculator";
import Notepad from "./Notepad";
import ShowLinks from "./ShowLinks";
import AnimatedTooltipPreview from "./AnimatedTooltipPreview";
import Calendar from "./Calendar";
import ImageUploader from "./ImageUploader";
import PopularBookmarks from "./PopularBookmarks";
import Weather from "./Weather";
import { TbGridDots } from "react-icons/tb";
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
        isDarkMode ? "bg-gray-900 text-white" : "bg-zinc-100 text-black"
      } min-h-screen`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <div className="mt-4">
        {/* Icon to show options */}
        <div
          onClick={handleIconClick}
          className="cursor-pointer flex m-2 mr-3 justify-end"
        >
          <TbGridDots className="w-8 h-8 hover:border border-slate-400 p-1 m-2 shadow-lg rounded-[50%]" />
        </div>

        {/* Conditionally show buttons */}
        {showButtons && (
          <div className="absolute right-10 top-20 bg-white/10 p-4 w-80 mr-2 shadow-lg rounded-md">
            <div className="flex flex-row  space-x-2">
              <label
                className="cursor-pointer bg-blue-500 text-white p-1 w-28 rounded text-center"
                htmlFor="image-upload"
              >
                Change Image
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              <button
                onClick={removeBackground}
                className="bg-red-500 text-white p-1 w-32 rounded text-center"
              >
                Remove Image
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col mt-[14vh] items-center">
          <img
            src={isDarkMode ? "GoogleBlack.png" : "GoogleWhite.png"}
            alt="Google Logo"
            className="mb-4 h-20"
          />
          <div className="gcse-searchbox-only" />
          <AnimatedTooltipPreview />
        </div>

        <div className="mt-[11vh]">
          <h1 className="text-2xl py-3 font-bold text-center">COMPONENTS</h1>
          <ShowLinks />

          {/* Main content responsive layout */}
          <div className="flex flex-col md:flex-row justify-between w-full gap-4">
            <div className="w-full md:w-1/2 lg:w-1/2 p-2">
              <AddList />
              <Notepad />
            </div>
            <div className="w-full md-w-1/flex p-2">
              <PopularBookmarks />
            </div>
            <div className="w-full md:w-1/2 lg:w-1/2 p-2">
              <ImageUploader />
              <Weather />
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
