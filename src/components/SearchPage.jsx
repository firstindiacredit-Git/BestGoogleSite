import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TbGridDots } from "react-icons/tb";
import { IoIosCloseCircleOutline } from "react-icons/io";
import Header from "../components/Header";
import AnimatedTooltipPreview from "./AnimatedTooltipPreview";
import Anotherpage from "../components/Anotherpage";
import PopularBookmarks from "../components/PopularBookmarks";
import Notepad from "../components/Notepad";
import PasswordGenerator from "../components/PasswordGenerater";
import galleryupload from "/galleryupload.png";
import layers from "/layers.png";
import remove from "/remove.png";
import "./style.css";


function SearchPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [showButtons, setShowButtons] = useState(false);
  const [url, setUrl] = useState(null);
  const [visibleItem, setVisibleItem] = useState(null);
  const navigate = useNavigate();
  

  useEffect(() => {
    const storedBackgroundImage = localStorage.getItem("backgroundImage");
    if (storedBackgroundImage) {
      setBackgroundImage(storedBackgroundImage);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("themeMode", newMode ? "dark" : "light");
      return newMode;
    });
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
      className="bg-zinc-100 dark:bg-[#060d1c] min-h-screen h-full"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <div className="mt-6">
        <div
          onClick={handleIconClick}
          className="cursor-pointer flex m-1 mr-3 justify-end"
        >
          <TbGridDots className="w-8 h-8 hover:border dark:text-white border-slate-400 p-1 m-2 shadow-lg rounded-full" />
        </div>
        {showButtons && (
          <div className="absolute right-10 top-20 bg-white/10 p-4 w-70 mr-2 shadow-lg rounded-2xl">
            <div className="grid grid-cols-2 gap-1">
              <label
                className="cursor-pointer text-xs p-1 rounded items-center justify-center"
                htmlFor="image-upload"
              >
                <img
                  src={galleryupload}
                  alt="Upload"
                  className="h-9 w-9 m-auto "
                />
                <span className="text-xs dark:text-white p-1 w-28 rounded grid items-center justify-center">
                  Change Image
                </span>
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
                className="text-xs p-1 w-32 rounded grid items-center justify-center "
                style={{ textAlign: "center" }}
              >
                <img src={remove} alt="Remove" className="h-9 w-9 m-auto" />
                <span className="dark:text-white">Remove Image</span>
              </button>
              <Link to="/">
                <img src={layers} alt="Upload" className="h-9 w-9 m-auto " />
                <span className="text-xs p-1 dark:text-white w-28 rounded m-auto grid items-center justify-center ">
                  Customize Widgets
                </span>
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center mt-[1vh]">
          <img
            src={isDarkMode ? "GoogleBlack.png" : "GoogleWhite.png"}
            alt="Google Logo"
            className="mb-4 h-16"
          />
          <div className="gcse-searchbox-only" />
          <AnimatedTooltipPreview />
        </div>

        <div className="border border-2 border-gray-400 rounded-3xl dark:text-white font-semibold text-center space-x-6 sm:space-x-4 md:space-x-6 lg:space-x-10 w-[70%] md:w-[70%] lg:w-[50%] xl:w-[60%] p-2 mt-32 mx-auto flex flex-wrap justify-center gap-2 md:gap-3 lg:gap-4">
          <div>
            <button
              className="hover:bg-gray-500 hover:text-white w-[45%] sm:w-[30%] md:w-[100%] lg:w-[120%] xl:w-[120%] rounded-xl"
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
              onClick={() => handleToggleVisibility("NEWS")}
            >
              NEWS
            </button>
            {/* {visibleItem === "NEWS" && (
              <>
                <div className="fixed inset-0 bg-transparent bg-opacity-70 backdrop-blur-sm z-40"></div>
                <div className="fixed top-1/2 left-1/2 z-50 w-[70%] h-[100%] p-4 shadow-lg transform -translate-x-1/2 -translate-y-1/2 bg-[#f3e9ff] dark:bg-[#4a454e] rounded-lg">
                  <NEWS />
                  <button
                    className="absolute top-3 right-3 dark:text-white"
                    onClick={() => handleClose("NEWS")}
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
          <button
            onClick={handleFileClick}
            className="hover:bg-gray-500 hover:text-white w-[45%] sm:w-[30%] md:w-[20%] lg:w-[15%] xl:w-[8%] rounded-xl"
          >
            TOOLS
          </button>
        </div>

        <Anotherpage
          backgroundImage={backgroundImage}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Centered Tools Iframe Modal */}
      {url && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="modal-content bg-white rounded-lg overflow-hidden shadow-lg w-[80%] max-w-4xl">
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
            <div className="modal-body p-4">
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
