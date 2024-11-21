import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosCloseCircleOutline } from "react-icons/io";
import Header from "../components/Header";
import AnimatedTooltipPreview from "./AnimatedTooltipPreview";
import Anotherpage from "../components/Anotherpage";
import PopularBookmarks from "../components/PopularBookmarks";
import NotebookAndSheet from "../components/NotebookAndSheet";
import PasswordGenerator from "../components/PasswordGenerater";
import News from "../components/News";
import { FaHome } from "react-icons/fa";
import { MdAddHomeWork } from "react-icons/md";

import "./style.css";


function SearchPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [showButtons, setShowButtons] = useState(false);
  const [url, setUrl] = useState(null);
  const [visibleItem, setVisibleItem] = useState(null);
  const navigate = useNavigate();
  
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


window.addEventListener("scroll", () => {
  const completionContainer = document.querySelector(
    ".gsc-completion-container"
  );
  if (completionContainer) completionContainer.style.display = "none";
});

 const toggleTheme = () => {
   setIsDarkMode((prev) => {
     const newMode = !prev;
     localStorage.setItem("themeMode", newMode ? "dark" : "light");
     return newMode;
   });
 };

  

  

  const handleIconClick = () => {
    setShowButtons(!showButtons);
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
      className="bg-zinc-50 dark:bg-gray-900 h-screen"
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
        <div className="flex flex-col items-center mt-10 h-screen">
          <img
            src={isDarkMode ? "GoogleBlack.png" : "GoogleWhite.png"}
            alt="Google Logo"
            className="mb-4 filter bluescale  contrast-700 h-20"
          />
          <div
            className="gcse-searchbox-only"
            data-resultsUrl="https://www.google.com/search?client=ms-google-coop&qcx=80904074a37154829"
            data-defaultToImageSearch="true"
          />
          <AnimatedTooltipPreview />
          <div className="-mt-10">
            <Link to="/">
              <button className=" h-10 w-10 rounded-2xl  ">
                <FaHome className="text-green-700 h-10 w-7 text-center justify-center m-auto " />
              </button>
            </Link>
            <Link to="/NewSearchPage">
              <button className=" h-10 w-10 rounded-2xl  ">
                <MdAddHomeWork className="text-green-700 h-10 w-7 text-center justify-center m-auto " />
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-gray-800 border-gray-400 p-2 -mt-[49vh] -mb-20 text-white  dark:text-white font-semibold text-center space-x-6 sm:space-x-4 md:space-x-6 lg:space-x-10 mx-auto flex flex-wrap justify-center gap-2 md:gap-3 lg:gap-10">
          <Link to="/">
            <button className="bg-white h-7 w-7 rounded-2xl">
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
                    className="absolute top-3 right-3 text-black dark:text-white"
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
              onClick={() => handleToggleVisibility("NotebookAndSheet")}
            >
              NOTES
            </button>
            {visibleItem === "NotebookAndSheet" && (
              <>
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"></div>
                <div className="fixed top-1/2 left-1/2 z-50 w-[90%] h-[100%] p-4  transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#4a454e] rounded-lg overflow-y-auto">
                  <div>
                    <button
                      className="absolute top-3 right-3 text-black dark:text-white"
                      onClick={() => handleClose("NotebookAndSheet")}
                    >
                      <IoIosCloseCircleOutline size={30} />
                    </button>{" "}
                  </div>
                  <NotebookAndSheet />
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
                    className="absolute top-3 right-3 text-black dark:text-white"
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
                <div className="fixed top-1/2 left-1/2 z-50 w-[70%] h-[100%] p-4 shadow-lg transform -translate-x-1/2 -translate-y-1/2  bg-white dark:bg-[#4a454e] rounded-lg">
                  <News />
                  <button
                    className="absolute top-3 right-3 text-black dark:text-white"
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

        <Anotherpage
          backgroundImage={backgroundImage}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Centered Tools Iframe Modal */}
      {url && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="modal-content bg-white rounded-lg overflow-hidden shadow-lg w-[95%] max-w-6xl">
            <div className="modal-header flex justify-between items-center p-4 border-b border-gray-200">
              <h5 className="text-lg font-medium text-gray-900">DAILY TOOLS</h5>
              <button
                type="button"
                className="text-gray-400 text-2xl hover:text-gray-500"
                onClick={closeViewer}
              >
                &times;
              </button>
            </div>
            <div className="modal-body  p-4">
              <iframe
                src={url}
                style={{ width: "100%", height: "500px" }}
                title="URL Viewer"
                className="rounded-lg"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchPage;