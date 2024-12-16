import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowUp } from "react-icons/fa";
import Header from "../components/Header";
import AnimatedTooltipPreview from "./AnimatedTooltipPreview";
import Anotherpage from "../components/Anotherpage";
import PopularBookmarks from "../components/PopularBookmarks";
import NotebookAndSheet from "../components/NotebookAndSheet";
import PasswordGenerator from "../components/PasswordGenerater";
import News from "../components/News";
import Tool from "../components/Tool";
import Top100 from "../components/Top100";
import { FaHome } from "react-icons/fa";
import { MdAddHomeWork } from "react-icons/md";
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

  const handleToggleComponent = (componentName) => {
    setActiveComponent((prevComponent) =>
      prevComponent === componentName ? null : componentName
    );
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
    <div
      className="bg-white dark:bg-gray-900 h-screen"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        handleImageChange={handleImageChange}
      />

      <div className="mt-6">
        <div className="flex flex-col items-center  min-h-[23vw]">
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
          <AnimatedTooltipPreview />
          <div className="-mt-10">
            <Link to="/">
              <button className="h-10 w-10 rounded-2xl">
                <FaHome className="text-green-700 h-10 w-7 text-center justify-center m-auto" />
              </button>
            </Link>
            <Link to="/NewSearchPage">
              <button className="h-10 w-10 rounded-2xl">
                <MdAddHomeWork className="text-green-700 h-10 w-7 text-center justify-center m-auto" />
              </button>
            </Link>
          </div>
        </div>
        <div className="bg-gray-800 border-gray-400 p-2 flex justify-center w-full text-white dark:text-white font-semibold text-center ">
          <div className="grid grid-cols-4 lg:grid-cols-8  w-full gap-4">
            <div>
              <button
                className={`bg-white p-1 rounded-3xl ${
                  activeComponent === "Anotherpage" ? "bg-gray-500" : ""
                }`}
                onClick={() => handleToggleComponent("Anotherpage")}
              >
                <FaHome className="text-green-700 h-5 w-5 text-center justify-center m-auto" />
              </button>
            </div>

            {showButton && (
              <button
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-all"
              >
                <FaArrowUp size={20} />
              </button>
            )}

            <button
              className={`w-full hover:text-white  hover:bg-gray-600 rounded-sm transition-all ${
                activeComponent === "PopularBookmarks" ? "bg-gray-500" : ""
              }`}
              onClick={() => handleToggleComponent("PopularBookmarks")}
            >
              BOOKMARKS
            </button>
            <button
              className={`w-full hover:text-white hover:bg-gray-600 rounded-sm transition-all ${
                activeComponent === "NotebookAndSheet" ? "bg-gray-500" : ""
              }`}
              onClick={() => handleToggleComponent("NotebookAndSheet")}
            >
              NOTES
            </button>
            <button
              className={`w-full hover:text-white hover:bg-gray-600 rounded-sm transition-all ${
                activeComponent === "PasswordGenerator" ? "bg-gray-500" : ""
              }`}
              onClick={() => handleToggleComponent("PasswordGenerator")}
            >
              PASSWORD
            </button>
            <button
              className={`w-full hover:text-white hover:bg-gray-600 rounded-sm transition-all ${
                activeComponent === "News" ? "bg-gray-500" : ""
              }`}
              onClick={() => handleToggleComponent("News")}
            >
              NEWS
            </button>
            <button
              className={`w-full hover:text-white hover:bg-gray-600 rounded-sm transition-all ${
                activeComponent === "Sports" ? "bg-gray-500" : ""
              }`}
              onClick={() => handleToggleComponent("Sports")}
            >
              SPORTS
            </button>
            <button
              className={`w-full hover:text-white hover:bg-gray-600 rounded-sm transition-all ${
                activeComponent === "Top100" ? "bg-gray-500" : ""
              }`}
              onClick={() => {
                handleToggleComponent("Top100");
                console.log("click Top");
              }}
            >
              TOP100
            </button>
            <button
              className={`w-full hover:text-white hover:bg-gray-600 rounded-sm transition-all ${
                activeComponent === "Tool" ? "bg-gray-500" : ""
              }`}
              onClick={() => handleToggleComponent("Tool")}
            >
              TOOLS
            </button>
          </div>
        </div>
        <div className=" w-full   dark:bg-gray-900 bg-[#f8f9fa]">
          {activeComponent === "NotebookAndSheet" ? (
            <NotebookAndSheet />
          ) : activeComponent === "PopularBookmarks" ? (
            <PopularBookmarks />
          ) : activeComponent === "PasswordGenerator" ? (
            <PasswordGenerator />
          ) : activeComponent === "News" ? (
            <News />
          ) : activeComponent === "Anotherpage" ? (
            <Anotherpage />
          ) : activeComponent === "Top100" ? (
            <Top100 />
          ) : activeComponent === "Tool" ? (
            <Tool />
          ) : (
            <Anotherpage
              backgroundImage={backgroundImage}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
