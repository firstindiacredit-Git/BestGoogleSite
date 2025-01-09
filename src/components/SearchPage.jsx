import React, { useEffect, useState } from "react";
import {useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Shortcut from "./ShortCuts";
import Anotherpage from "../components/Anotherpage";
import PopularBookmarks from "../components/PopularBookmarks";
import NotebookAndSheet from "../components/NotebookAndSheet";
import PasswordGenerator from "../components/PasswordGenerater";
import News from "../components/News";
import Tool from "../components/Tool";
import Sports from "../components/Sports";
import Top100 from "../components/Top100";
import "./style.css";

function SearchPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");

  const [activeComponent, setActiveComponent] = useState(null);
  const navigate = useNavigate();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const storedThemeMode = localStorage.getItem("themeMode");
    if (storedThemeMode) {
      setIsDarkMode(storedThemeMode === "dark");
    }
  }, []);

  useEffect(() => {
    const storedBackgroundImage = localStorage.getItem("backgroundImage");
    if (storedBackgroundImage) {
      setBackgroundImage(storedBackgroundImage);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

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

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("themeMode", newMode ? "dark" : "light");
      return newMode;
    });
  };

  const handleToggleComponent = (component) => {
    setActiveComponent(component); // Always set the component, don't toggle
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.id = "google-cse";
    script.src = "https://cse.google.com/cse.js?cx=80904074a37154829";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [navigate]);

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen" style={{
      backgroundImage: backgroundImage
        ? `url(${backgroundImage})`
        : "none",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    }}>
      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        handleImageChange={handleImageChange}
      />

      <div>
        <div
          
          className="flex pt-24 flex-col items-center  min-h-[23vw]"
        >
          <img
            src={isDarkMode ? "GoogleBlack.png" : "GoogleWhite.png"}
            alt="Google Logo"
            className="mb-4 filter bluescale contrast-700 h-20"
          />
          <div
            className="gcse-searchbox-only"
            data-resultsurl="https://www.google.com/search?client=ms-google-coop&qcx=80904074a37154829"
            data-defaulttoimagesearch="true"
          />
          <Shortcut />
          <div
            style={{
              backgroundImage: backgroundImage
                ? `url(${backgroundImage})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
            }}
          >
            <div>
              <div className="flex justify-center max-w-[90vw]  w-full mx-auto">
                <div className="flex space-x-1 p-1 justify-between bg-white/50 border border-gray-200 dark:border-gray-800 dark:bg-gray-800/50 rounded-lg w-full">
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      activeComponent === "Anotherpage"
                        ? "bg-blue-500 text-white dark:bg-gray-700"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => handleToggleComponent("Anotherpage")}
                  >
                    HOME
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      activeComponent === "PopularBookmarks"
                        ? "bg-blue-500 text-white dark:bg-gray-700"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => handleToggleComponent("PopularBookmarks")}
                  >
                    BOOKMARKS
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      activeComponent === "NotebookAndSheet"
                        ? "bg-blue-500 text-white dark:bg-gray-700"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => handleToggleComponent("NotebookAndSheet")}
                  >
                    NOTES
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      activeComponent === "PasswordGenerator"
                        ? "bg-blue-500 text-white dark:bg-gray-700"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => handleToggleComponent("PasswordGenerator")}
                  >
                    PASSWORD
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      activeComponent === "News"
                        ? "bg-blue-500 text-white dark:bg-gray-700"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => handleToggleComponent("News")}
                  >
                    NEWS
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      activeComponent === "Sports"
                        ? "bg-blue-500 text-white dark:bg-gray-700"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => handleToggleComponent("Sports")}
                  >
                    SPORTS
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      activeComponent === "Top100"
                        ? "bg-blue-500 text-white dark:bg-gray-700"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => handleToggleComponent("Top100")}
                  >
                    TOP100
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      activeComponent === "Tool"
                        ? "bg-blue-500 text-white dark:bg-gray-700"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => handleToggleComponent("Tool")}
                  >
                    TOOLS
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className=" max-w-screen-2xl  mx-auto">
          {activeComponent === "NotebookAndSheet" ? (
            <NotebookAndSheet />
          ) : activeComponent === "PopularBookmarks" ? (
            <PopularBookmarks />
          ) : activeComponent === "PasswordGenerator" ? (
            <PasswordGenerator />
          ) : activeComponent === "News" ? (
            <News />
          ) : activeComponent === "Sports" ? (
            <Sports />
          ) : activeComponent === "Anotherpage" ? (
            <Anotherpage />
          ) : activeComponent === "Top100" ? (
            <Top100 />
          ) : activeComponent === "Tool" ? (
            <Tool />
          ) : (
            <Anotherpage isDarkMode={isDarkMode} />
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
