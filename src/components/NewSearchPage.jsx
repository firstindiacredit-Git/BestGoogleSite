import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaArrowUp } from "react-icons/fa";
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
import { Modal, Input, Dropdown } from "antd";
import { CiEdit } from "react-icons/ci";
import { Settings } from "lucide-react";
import { WidgetTransparencyContext } from "../App";

function NewSearchPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [transparency, setTransparency] = useState(() =>
    parseInt(localStorage.getItem("bgTransparency") || "85")
  );
  const [textColor, setTextColor] = useState(() =>
    parseInt(localStorage.getItem("textColorValue") || "100")
  );
  const { widgetTransparent, setWidgetTransparent } = useContext(
    WidgetTransparencyContext
  );
  const [activeComponent, setActiveComponent] = useState("Anotherpage");
  const navigate = useNavigate();
  const [showButton, setShowButton] = useState(false);
  const [pageData, setPageData] = useState(null);
  const location = useLocation();
  const [visibleHandle, setVisibleHandle] = useState(false);

  // Keep state for slider position
  const [sliderTransparency, setSliderTransparency] = useState(() =>
    parseInt(localStorage.getItem("bgTransparency") || "85")
  );
  const [sliderWidgetTransparency, setSliderWidgetTransparency] = useState(() =>
    parseInt(localStorage.getItem("widgetTransparency") || "100")
  );

  // Use refs to store the actual values we'll apply
  const tempTransparencyRef = useRef(sliderTransparency);
  const tempWidgetTransparencyRef = useRef(sliderWidgetTransparency);

  // Handler for temporary changes - only update state, no visual changes
  const handleTempTransparencyChange = useCallback((newValue) => {
    setSliderTransparency(newValue); // Update slider position
    tempTransparencyRef.current = newValue; // Store value for later application
  }, []);

  const handleTempWidgetTransparencyChange = useCallback((newValue) => {
    setSliderWidgetTransparency(newValue); // Update slider position
    tempWidgetTransparencyRef.current = newValue; // Store value for later application
  }, []);

  // Apply changes when user clicks Apply
  const handleApplyChanges = useCallback(() => {
    setTransparency(tempTransparencyRef.current);
    setWidgetTransparent(tempWidgetTransparencyRef.current);
    localStorage.setItem(
      "bgTransparency",
      tempTransparencyRef.current.toString()
    );
    localStorage.setItem(
      "widgetTransparency",
      tempWidgetTransparencyRef.current.toString()
    );
    document.documentElement.style.setProperty(
      "--widget-opacity",
      tempWidgetTransparencyRef.current / 100
    );
  }, [setWidgetTransparent]);

  // Reset changes when user clicks Reset
  const handleResetChanges = useCallback(() => {
    const savedTransparency = parseInt(
      localStorage.getItem("bgTransparency") || "85"
    );
    const savedWidgetTransparency = parseInt(
      localStorage.getItem("widgetTransparency") || "100"
    );

    setSliderTransparency(savedTransparency);
    setSliderWidgetTransparency(savedWidgetTransparency);
    tempTransparencyRef.current = savedTransparency;
    tempWidgetTransparencyRef.current = savedWidgetTransparency;
  }, []);

  const changeVisible = () => {
    setVisibleHandle(!visibleHandle);
  };

  // Theme mode effect
  useEffect(() => {
    const storedThemeMode = localStorage.getItem("themeMode");
    if (storedThemeMode) {
      setIsDarkMode(storedThemeMode === "dark");
    }
  }, []);

  // Background image effect
  useEffect(() => {
    const storedBackgroundImage = localStorage.getItem("backgroundImage");
    if (storedBackgroundImage) {
      setBackgroundImage(storedBackgroundImage);
    }
  }, []);

  // Scroll button effect
  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dark mode class effect
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const pageId = urlParams.get("pageId");

    if (pageId) {
      const savedPages = localStorage.getItem("customPages");
      const pages = savedPages ? JSON.parse(savedPages) : [];

      const currentPage = pages.find((page) => page.id === parseInt(pageId));
      if (currentPage) {
        setPageData(currentPage);
      }
    }
  }, [location]);

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

  // Google CSE script effect
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

  const handlePageNameEdit = () => {
    if (!pageData) return;

    Modal.confirm({
      title: "Edit Page Name",
      content: (
        <Input
          defaultValue={pageData.name}
          id="pageNameInput"
          placeholder="Enter new page name"
        />
      ),
      onOk() {
        const newName = document.getElementById("pageNameInput").value;
        if (newName.trim()) {
          const savedPages = localStorage.getItem("customPages");
          const pages = savedPages ? JSON.parse(savedPages) : [];

          const updatedPages = pages.map((page) =>
            page.id === pageData.id ? { ...page, name: newName.trim() } : page
          );

          localStorage.setItem("customPages", JSON.stringify(updatedPages));
          setPageData({ ...pageData, name: newName.trim() });
        }
      },
    });
  };

  const handleHeaderPageNameChange = (pageId, newName) => {
    if (pageData && pageData.id === pageId) {
      setPageData({ ...pageData, name: newName });
    }
  };

  const handleTextColorChange = (value) => {
    setTextColor(value);
    localStorage.setItem("textColorValue", value.toString());
  };

  const handleResetTextColor = () => {
    const newValue = isDarkMode ? 100 : 0; // 100 for white in dark mode, 0 for black in light mode
    handleTextColorChange(newValue);
  };

  // Function to convert slider value to actual color
  const getTextColor = (value) => {
    const colorValue = Math.round((value / 100) * 255);
    return `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
  };

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
          isDarkMode
            ? "bg-[#1a1a2e]"
            : "bg-gradient-to-r from-indigo-200 via-blue-100 to-indigo-200"
        } transition-opacity duration-300`}
        style={{ opacity: transparency / 100, zIndex: 0 }}
      ></div>
      <div className="relative z-10">
        <div style={{ color: getTextColor(textColor) }}>
          <Header
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            handleImageChange={handleImageChange}
            textColor={getTextColor(textColor)}
            onPageNameChange={handleHeaderPageNameChange}
          />

          <div className="w-full">
            <div className="flex mt-14 flex-col items-center">
              <div
                className="gcse-searchbox-only"
                data-resultsurl="https://www.google.com/search?client=ms-google-coop&qcx=80904074a37154829"
                data-defaulttoimagesearch="true"
              />
              <Shortcut />
              <div>
                <div className="flex justify-center max-w-[90vw] mb-3 w-full mx-auto">
                  <div className="flex space-x-1 p-1 justify-between bg-gray-200/10 backdrop-blur-lg border border-gray-200/20 dark:border-gray-800/20 dark:bg-[#513a7a]/10 rounded-lg w-full">
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeComponent === "Anotherpage"
                          ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                          : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                      }`}
                      onClick={() => handleToggleComponent("Anotherpage")}
                    >
                      <span className="drop-shadow-md">HOME </span>
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeComponent === "PopularBookmarks"
                          ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                          : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                      }`}
                      onClick={() => handleToggleComponent("PopularBookmarks")}
                    >
                      <span className="drop-shadow-md">BOOKMARKS </span>
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeComponent === "NotebookAndSheet"
                          ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                          : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                      }`}
                      onClick={() => handleToggleComponent("NotebookAndSheet")}
                    >
                      <span className="drop-shadow-md">NOTES </span>
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeComponent === "PasswordGenerator"
                          ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                          : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                      }`}
                      onClick={() => handleToggleComponent("PasswordGenerator")}
                    >
                      <span className="drop-shadow-md">PASSWORD </span>
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeComponent === "News"
                          ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                          : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                      }`}
                      onClick={() => handleToggleComponent("News")}
                    >
                      <span className="drop-shadow-md">NEWS </span>
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeComponent === "Sports"
                          ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                          : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                      }`}
                      onClick={() => handleToggleComponent("Sports")}
                    >
                      <span className="drop-shadow-md">SPORTS </span>
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeComponent === "Top100"
                          ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                          : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                      }`}
                      onClick={() => handleToggleComponent("Top100")}
                    >
                      <span className="drop-shadow-md">TOP100 </span>
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
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
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg min-w-[200px]">
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Background Opacity
                              </span>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={sliderTransparency}
                                onChange={(e) =>
                                  handleTempTransparencyChange(
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                              />
                              <span className="text-sm text-gray-600 dark:text-gray-300 text-right">
                                {sliderTransparency}%
                              </span>
                            </div>
                            <div className="flex flex-col gap-2">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Widget Opacity
                              </span>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={sliderWidgetTransparency}
                                onChange={(e) =>
                                  handleTempWidgetTransparencyChange(
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                              />
                              <span className="text-sm text-gray-600 dark:text-gray-300 text-right">
                                {sliderWidgetTransparency}%
                              </span>
                            </div>

                            {/* Apply and Reset buttons */}
                            <div className="flex gap-2 pt-2 border-t dark:border-gray-700">
                              <button
                                onClick={handleApplyChanges}
                                className="flex-1 px-3 py-1.5 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
                              >
                                Apply
                              </button>
                              <button
                                onClick={handleResetChanges}
                                className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              >
                                Reset
                              </button>
                            </div>

                            <div className="flex flex-col gap-2">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Text Color
                              </span>
                              <div className="flex gap-2 items-center">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={textColor}
                                  onChange={(e) =>
                                    handleTextColorChange(
                                      parseInt(e.target.value)
                                    )
                                  }
                                  className="w-full h-2 bg-gradient-to-r from-black via-gray-500 to-white rounded-lg appearance-none cursor-pointer"
                                />
                                <button
                                  onClick={handleResetTextColor}
                                  className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-colors duration-200"
                                >
                                  Reset
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Card UI
                              </span>
                              <button
                                className="text-center bg-black/5 dark:bg-white/5 dark:text-white hover:bg-gray-50 w-full rounded-sm"
                                onClick={changeVisible}
                              >
                                {visibleHandle ? "Classic" : "Modern"}
                              </button>
                            </div>
                          </div>
                        </div>
                      }
                      trigger={["click"]}
                    >
                      <button className="px-4 py-2 text-sm font-medium rounded-md transition-all dark:text-white hover:bg-gray-100 bg-[#513A7A10] dark:hover:bg-[#513A7A]">
                        <Settings className="w-5" />
                      </button>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
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
            <Anotherpage visibleHandle={visibleHandle} />
          ) : activeComponent === "Top100" ? (
            <Top100 />
          ) : activeComponent === "Tool" ? (
            <Tool />
          ) : (
            <Anotherpage
              visibleHandle={visibleHandle}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default NewSearchPage;
