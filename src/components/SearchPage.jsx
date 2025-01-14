import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Dropdown } from "antd";
import { Settings } from "lucide-react";

function SearchPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [transparency, setTransparency] = useState(() =>
    parseInt(localStorage.getItem("bgTransparency"))
  );
  const [activeComponent, setActiveComponent] = useState("Anotherpage");
  const navigate = useNavigate();
  const [showButton, setShowButton] = useState(false);
  const [visibleHandle, setVisibleHandle] = useState(false);

  useEffect(() => {
    const storedThemeMode = localStorage.getItem("themeMode");
    if (storedThemeMode) {
      setIsDarkMode(storedThemeMode === "dark");
    }
  }, []);
  const changeVisible = ()=>{
    setVisibleHandle(!visibleHandle)
  }

  console.log(localStorage.getItem("backgroundImage"))
  useEffect(() => {
    const storedBackgroundImage = localStorage.getItem("backgroundImage");
    if (storedBackgroundImage) {
      setBackgroundImage(storedBackgroundImage);
    }
  }, []);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (window.scrollY > 300) {
  //       setShowButton(true);
  //     } else {
  //       setShowButton(false);
  //     }
  //   };

  //   window.addEventListener("scroll", handleScroll);

  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);
  const handleTransparencyChange = (newValue) => {
    setTransparency(newValue);
    localStorage.setItem("bgTransparency", newValue.toString());
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
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          opacity: (100 - transparency) / 100,
          zIndex: 0,
        }}
      ></div>
      <div
        className={`fixed inset-0 ${
          isDarkMode ? "bg-[#1a1a2e]" : "bg-white"
        } transition-opacity duration-300`}
        style={{ opacity: transparency / 100, zIndex: 0 }}
      ></div>
      <div className="relative z-10">
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          handleImageChange={handleImageChange}
        />

        <div className="w-full">
          <div className="mb-8 mt-10 flex  relative  w-fit  mx-auto justify-center">
            <img
              src={`${isDarkMode ? "/BrowseyFullDark2.svg" : "/BrowseyFullDark.svg"}`}
              className="w-96 drop-shadow-sm "
              alt="Browsey"
            />{" "}
            <span className="absolute -bottom-3  text-indigo-300 dark:text-indigo-400 right-0">
              <a href="https://google.com" target="_blank">
                Enhanced by Google
              </a>
            </span>
          </div>
          <div className="flex  flex-col items-center  ">
            <div
              className="gcse-searchbox-only"
              data-resultsurl="https://www.google.com/search?client=ms-google-coop&qcx=80904074a37154829"
              data-defaulttoimagesearch="true"
            />
            <Shortcut />
            <div>
              <div className="flex justify-center max-w-[90vw] mb-3  w-full mx-auto">
                <div className="flex space-x-1 p-1 justify-between bg-gray-200/10 backdrop-blur-lg border border-gray-200/20 dark:border-gray-800/20 dark:bg-[#513a7a]/10 rounded-sm w-full">
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-xs transition-all ${
                      activeComponent === "Anotherpage"
                        ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                        : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                    }`}
                    onClick={() => handleToggleComponent("Anotherpage")}
                  >
                    <span className="drop-shadow-md">HOME </span>
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-xs transition-all ${
                      activeComponent === "PopularBookmarks"
                        ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                        : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                    }`}
                    onClick={() => handleToggleComponent("PopularBookmarks")}
                  >
                    <span className="drop-shadow-md">BOOKMARKS </span>
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-xs transition-all ${
                      activeComponent === "NotebookAndSheet"
                        ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                        : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                    }`}
                    onClick={() => handleToggleComponent("NotebookAndSheet")}
                  >
                    <span className="drop-shadow-md">NOTES </span>
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-xs transition-all ${
                      activeComponent === "PasswordGenerator"
                        ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                        : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                    }`}
                    onClick={() => handleToggleComponent("PasswordGenerator")}
                  >
                    <span className="drop-shadow-md">PASSWORD </span>
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-xs transition-all ${
                      activeComponent === "News"
                        ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                        : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                    }`}
                    onClick={() => handleToggleComponent("News")}
                  >
                    <span className="drop-shadow-md">NEWS </span>
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-xs transition-all ${
                      activeComponent === "Sports"
                        ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                        : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                    }`}
                    onClick={() => handleToggleComponent("Sports")}
                  >
                    <span className="drop-shadow-md">SPORTS </span>
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-xs transition-all ${
                      activeComponent === "Top100"
                        ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                        : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                    }`}
                    onClick={() => handleToggleComponent("Top100")}
                  >
                    <span className="drop-shadow-md">TOP100 </span>
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-xs transition-all ${
                      activeComponent === "Tool"
                        ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                        : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                    }`}
                    onClick={() => handleToggleComponent("Tool")}
                  >
                    <span className="drop-shadow-md">TOOLS </span>
                  </button>
                  <Dropdown
                    overlay={
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-sm shadow-lg min-w-[200px]">
                        <div className="flex flex-col gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Background Opacity
                          </span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={transparency}
                            onChange={(e) => handleTransparencyChange(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-sm appearance-none cursor-pointer dark:bg-gray-700"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-300 text-right">
                            {transparency}%
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                           Card UI
                          </span>
                          <button className="text-center bg-black/5 dark:bg-white/5 dark:text-white hover:bg-gray-50 w-full rounded-sm" onClick={changeVisible}>{visibleHandle?"Classic":"Modern"}
                        </button>
                        </div>
                        
                      </div>
                    }
                    trigger={['click']}
                  >
                    <button
                      className="px-4 py-2 text-sm font-medium rounded-xs transition-all dark:text-white hover:bg-gray-100 bg-[#513A7A10] dark:hover:bg-[#513A7A]"
                    >
                      <Settings className="w-5"/>
                    </button>
                  </Dropdown>
                </div>
              </div>
            </div>
          </div>

          
          <div className=" w-full">
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
              <Anotherpage visibleHandle={visibleHandle} isDarkMode={isDarkMode} />
            ) : activeComponent === "Top100" ? (
              <Top100 />
            ) : activeComponent === "Tool" ? (
              <Tool />
            ) : (
              <Anotherpage visibleHandle={visibleHandle} isDarkMode={isDarkMode} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
