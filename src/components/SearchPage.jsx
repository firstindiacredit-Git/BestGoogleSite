import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Shortcut from "./ShortCuts";
import { WidgetTransparencyContext } from "../App";
import Anotherpage from "../components/Anotherpage";
import PopularBookmarks from "../components/PopularBookmarks";
import NotebookAndSheet from "../components/NotebookAndSheet";
import PasswordGenerator from "../components/PasswordGenerater";
import News from "../components/News";
import Tool from "../../Tools/Tool.jsx";
import BalanceSheet from "../components/balancesheet/BalanceSheet.jsx";
import Sports from "../components/Sports";
import Top100 from "../components/Top100";
import "./style.css";
import "../components/RemoteApp/index.css";
import { Dropdown, Skeleton, Input } from "antd";
import { Palette } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { DesignContext } from "../context/DesignContext.jsx";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";
import BalancesheetDashboard from "../components/balancesheet/BalancesheetDashboard.jsx";
import BalancesheetLogin from "../components/balancesheet/BalancesheetLogin.jsx";
import LinktreeMain from "../components/Linktree/LinktreeMain.jsx";
import RemoteAppWrapper from "../components/RemoteApp/RemoteAppWrapper.jsx";
import NewFooter from "./NewFooter.jsx";
import DataMiningTool from "./DataMiningTool.jsx";
import GlobalAi from "./GlobalAi.jsx";

const SearchPage = ({ isToolPage = false }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { simple, changeSimple } = useContext(DesignContext);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [transparency, setTransparency] = useState(() =>
    parseInt(localStorage.getItem("bgTransparency") || "85")
  );
  const [textColor, setTextColor] = useState(() =>
    parseInt(localStorage.getItem("textColorValue") || "0")
  );
  const { widgetTransparent, setWidgetTransparent } = useContext(WidgetTransparencyContext);
  const [activeComponent, setActiveComponent] = useState("Anotherpage");
  const [selectedSheetId, setSelectedSheetId] = useState(null);
  const navigate = useNavigate();
  const [visibleHandle, setVisibleHandle] = useState(() => {
    const savedMode = localStorage.getItem("uiMode");
    return savedMode === null ? true : savedMode === "modern"; // Default to true (modern) if not set
  });

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
  const textColorRef = useRef(textColor);

  const [isGoogleSearchLoaded, setIsGoogleSearchLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userSheets, setUserSheets] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(authInstance, async () => {
      // setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const storedBackgroundImage = localStorage.getItem("backgroundImage");
    if (storedBackgroundImage) {
      setBackgroundImage(storedBackgroundImage);
    }
  }, []);

  useEffect(() => {
    // Retrieve active component from localStorage on mount
    const storedActiveComponent = localStorage.getItem("activeComponent");
    if (storedActiveComponent) {
      setActiveComponent(storedActiveComponent);
    }
  }, []);

  useEffect(() => {
    const fetchSheets = async () => {
      if (user) {
        try {
          const response = await axios.get("/sheets");
          setUserSheets(response.data.filter(sheet => sheet.user === user._id));
        } catch (error) {
          // Optionally handle error
        }
      }
    };
    fetchSheets();
  }, [user]);

  const handleTempTransparencyChange = useCallback((newValue) => {
    setSliderTransparency(newValue); // Update slider position
    tempTransparencyRef.current = newValue; // Store value for later application
  }, []);

  const handleTempWidgetTransparencyChange = useCallback((newValue) => {
    setSliderWidgetTransparency(newValue); // Update slider position
    tempWidgetTransparencyRef.current = newValue; // Store value for later application
  }, []);

  const handleTextColorChange = useCallback((value) => {
    setTextColor(value);
    textColorRef.current = value;
    localStorage.setItem("textColorValue", value.toString());
  }, []);

  // Handler to apply all changes
  const handleApplyChanges = useCallback(() => {
    // Apply background transparency
    setTransparency(tempTransparencyRef.current);
    localStorage.setItem(
      "bgTransparency",
      tempTransparencyRef.current.toString()
    );
    document.documentElement.style.setProperty(
      "--bg-opacity",
      `${tempTransparencyRef.current / 100}`
    );

    // Apply widget transparency
    setWidgetTransparent(tempWidgetTransparencyRef.current);
    localStorage.setItem(
      "widgetTransparency",
      tempWidgetTransparencyRef.current.toString()
    );
    document.documentElement.style.setProperty(
      "--widget-opacity",
      `${tempWidgetTransparencyRef.current / 100}`
    );
  }, [setTransparency, setWidgetTransparent]);

  // Handler to reset changes
  const handleResetChanges = useCallback(() => {
    // Reset both slider position and stored values
    setSliderTransparency(transparency);
    setSliderWidgetTransparency(widgetTransparent);
    tempTransparencyRef.current = transparency;
    tempWidgetTransparencyRef.current = widgetTransparent;
    // Reset text color based on theme
    handleResetTextColor();
  }, [transparency, widgetTransparent]);

  const handleResetTextColor = useCallback(() => {
    const newValue = isDarkMode ? 100 : 0; // 100 for white in dark mode, 0 for black in light mode
    setTextColor(newValue);
    localStorage.setItem("textColorValue", newValue.toString());
  }, [isDarkMode]);

  // Initialize CSS variables on mount with current values
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--bg-opacity",
      `${transparency / 100}`
    );
    document.documentElement.style.setProperty(
      "--widget-opacity",
      `${widgetTransparent / 100}`
    );
  }, [transparency, widgetTransparent]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setBackgroundImage(imageData);
        localStorage.setItem("backgroundImage", imageData);
        // Reset background opacity to 0 when new image is uploaded
        setTransparency(0);
        setSliderTransparency(0);
        localStorage.setItem("bgTransparency", "0");
        document.documentElement.style.setProperty("--bg-opacity", "0");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleComponent = (component) => {
    setActiveComponent(component); // Always set the component, don't toggle
    localStorage.setItem("activeComponent", component); // Store active component in localStorage
  };

  useEffect(() => {
    // Remove any existing script first
    const existingScript = document.getElementById("google-cse");
    if (existingScript) {
      existingScript.remove();
    }

    // Create and add the script
    const script = document.createElement("script");
    script.id = "google-cse";
    script.src = "https://cse.google.com/cse.js?cx=80904074a37154829";
    script.async = true;
    script.defer = true;

    // Handle loading success/failure
    script.onload = () => {
      console.log("Google CSE script loaded successfully");
      // Give it a little time to initialize
      setTimeout(() => {
        const searchBox = document.querySelector(".gsc-control-searchbox-only");
        setIsGoogleSearchLoaded(!!searchBox);
      }, 1000);
    };

    script.onerror = () => {
      console.error("Failed to load Google CSE script");
      setIsGoogleSearchLoaded(false);
    };

    document.body.appendChild(script);

    // Add a timeout for detection
    const timeout = setTimeout(() => {
      if (!document.querySelector(".gsc-control-searchbox-only")) {
        console.warn("Google CSE not detected after timeout");
        setIsGoogleSearchLoaded(false);
      }
    }, 5000);

    return () => {
      clearTimeout(timeout);
      // Only remove if we're the ones who added it
      const currentScript = document.getElementById("google-cse");
      if (currentScript && currentScript === script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Function to convert slider value to actual color
  const getTextColor = (value) => {
    const colorValue = Math.round((value / 100) * 255);
    return `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
  };

  // Memoize style objects to prevent unnecessary re-renders
  const backgroundStyles = useMemo(
    () => ({
      minHeight: "100vh",
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
    }),
    [backgroundImage]
  );

  const overlayStyles = useMemo(
    () => ({
      opacity: transparency / 100,
      zIndex: 0,
    }),
    [transparency]
  );

  // Memoize the settings menu configuration
  const settingsMenu = useMemo(() => ({
    items: [
      {
        key: "bgOpacity",
        label: (
          <div className="dark:bg-[#28283a] -m-1">
            <div
              className="flex flex-col gap-2 p-3 dark:bg-[#28283a]"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Background Opacity
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderTransparency}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value);
                  setSliderTransparency(newValue);
                  setTransparency(newValue);
                  localStorage.setItem("bgTransparency", newValue.toString());
                  document.documentElement.style.setProperty(
                    "--bg-opacity",
                    `${newValue / 100}`
                  );
                }}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300 text-right">
                {sliderTransparency}%
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "widgetOpacity",
        label: (
          <div className="dark:bg-[#28283a] -m-1">
            <div
              className="flex flex-col gap-2 p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Widget Opacity
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderWidgetTransparency}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value);
                  setSliderWidgetTransparency(newValue);
                  setWidgetTransparent(newValue);
                  localStorage.setItem("widgetTransparency", newValue.toString());
                  document.documentElement.style.setProperty(
                    "--widget-opacity",
                    `${newValue / 100}`
                  );
                }}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300 text-right">
                {sliderWidgetTransparency}%
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "textColor",
        label: (
          <div
            className="flex flex-col gap-2 p-3 dark:bg-[#28283a] -m-1"
            onClick={(e) => e.stopPropagation()}
          >
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
                  handleTextColorChange(parseInt(e.target.value))
                }
                className="w-full h-2 bg-gradient-to-r from-black via-gray-500 to-white rounded-lg appearance-none cursor-pointer dark:from-gray-900"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetTextColor();
                }}
                className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded transition-colors duration-200"
              >
                Reset
              </button>
            </div>
          </div>
        ),
      },
    ],
  }));

  // Add a useEffect to handle theme changes specifically for this component
  useEffect(() => {
    // Force re-render of settings menu when theme changes
    const handleThemeChange = () => {
      // Update any theme-dependent state or calculations
      if (textColor === 0 || textColor === 100) {
        // If text color is at default values, update it based on new theme
        handleResetTextColor();
      }
    };

    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, [textColor, handleResetTextColor]);

  // Add handleSearch function
  const handleSearch = useCallback((value) => {
    if (value.trim()) {
      const searchUrl = `https://www.google.com/search?client=ms-google-coop&qcx=80904074a37154829&q=${encodeURIComponent(
        value
      )}`;
      window.location.href = searchUrl;
    }
  }, []);

  // Add handleKeyPress function for Enter key
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && searchQuery.trim()) {
        handleSearch(searchQuery);
      }
    },
    [searchQuery, handleSearch]
  );

  if (loading) {
    return (
      <div
        className={`fixed inset-0 ${
          isDarkMode
            ? "bg-gradient-to-r from-[#1a1a2e] via-[#2a243f] to-[#1a1a2e]"
            : "bg-gradient-to-r from-indigo-200 via-blue-100 to-indigo-200"
        } transition-colors duration-300`}
      >
        <div className="container mx-auto mt-48 px-4 py-8">
          <div className="flex justify-center mb-8">
            <Skeleton.Input active size="large" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton.Button
                  active
                  key={i}
                  size="default"
                  className="w-24"
                />
              ))}
            </div>
            <div className="mt-20 grid  mx-auto w-fit grid-cols-4  gap-24">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton.Node
                  size="large"
                  className="w-48 scale-x-125"
                  key={i}
                  active
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${isToolPage ? "h-[40vh]" : "min-h-screen"}`}>
      <div style={backgroundStyles}>
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            opacity: (100 - transparency) / 100,
            zIndex: 0,
          }}
        />
        <div
          className={`fixed inset-0 ${
            isDarkMode
              ? "bg-gradient-to-r from-[#1a1a2e] via-[#2a243f] to-[#1a1a2e]"
              : "bg-gradient-to-r from-indigo-200 via-blue-100 to-indigo-200"
          } transition-colors duration-300`}
          style={overlayStyles}
        />
        <div className="relative z-10">
          <div style={{ color: getTextColor(textColor) }}>
            <Header
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
              handleImageChange={handleImageChange}
              designChange={changeSimple}
              designContext={simple}
            />

            <div className="w-full">
              <div className="flex mt-14 flex-col items-center">
                <div className="flex justify-center w-full gap-1">
                  {!isGoogleSearchLoaded ? (
                    <div className="w-[55%] mb-[5px]">
                      <div className="relative w-full">
                        <input
                          type="text"
                          placeholder="Search Google or type a URL"
                          className={`w-full h-14 px-4 rounded-md shadow-sm outline-none ${
                            isDarkMode
                              ? "bg-white text-black"
                              : "bg-white text-black"
                          }`}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={handleKeyPress}
                        />
                        <button
                          onClick={() => handleSearch(searchQuery)}
                          className="absolute right-0 top-0 h-full px-4 text-gray-500 hover:text-gray-700"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="gcse-searchbox-only"
                      style={{
                        width: "55%",
                        margin: "0 auto",
                      }}
                      data-resultsurl="https://www.google.com/search?client=ms-google-coop&qcx=80904074a37154829"
                    />
                  )}
                  {simple && (
                    <div>
                      <div className="flex justify-center max-w-[90vw] mb-3 w-full mx-auto">
                        <Dropdown
                          menu={settingsMenu}
                          trigger={["click"]}
                          overlayClassName="[&_.ant-dropdown-menu]:p-0 [&_.ant-dropdown-menu-item]:p-0 [&_ul]:dark:bg-[#28283a]"
                        >
                          <button className="py-[1.2rem] px-5 text-sm font-medium rounded-md  transition-all bg-gray-50/50 dark:bg-[#28283a]/50 dark:text-white hover:bg-gray-100 dark:hover:bg-[#2F2F3F] flex items-center">
                            <Palette className="w-5 h-5" />
                          </button> 
                        </Dropdown>
                      </div>
                    </div>
                  )}
                </div>
                <Shortcut />
                {!simple && (
                  <div>
                    <div className="flex justify-center max-w-[90vw] bg-white dark:bg-[#28283a] rounded-lg mb-3 w-full mx-auto">
                      <div className="flex space-x-1 p-1 justify-between bg-gray-white dark:bg-[#28283a] backdrop-blur-lg  dark:bg-[#513a7a]/10 rounded-lg w-full">
                        <button
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            activeComponent === "Anotherpage"
                              ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                              : "dark:text-white hover:bg-gray-100 dark:hover:bg-[#28283A]"
                          }`}
                          onClick={() => handleToggleComponent("Anotherpage")}
                        >
                          <span className="drop-shadow-md">HOME</span>
                        </button>
                        <button
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            activeComponent === "PopularBookmarks"
                              ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                              : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                          }`}
                          onClick={() =>
                            handleToggleComponent("PopularBookmarks")
                          }
                        >
                          <span className="drop-shadow-md">BOOKMARKS </span>
                        </button>
                        <button
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            activeComponent === "NotebookAndSheet"
                              ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                              : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                          }`}
                          onClick={() =>
                            handleToggleComponent("NotebookAndSheet")
                          }
                        >
                          <span className="drop-shadow-md">NOTES </span>
                        </button>
                        <button
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            activeComponent === "PasswordGenerator"
                              ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                              : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                          }`}
                          onClick={() =>
                            handleToggleComponent("PasswordGenerator")
                          }
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
                          className={`px-4 py-2 text-sm  font-medium rounded-md transition-all ${
                            activeComponent === "Top100"
                              ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                              : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                          }`}
                          onClick={() => handleToggleComponent("Top100")}
                        >
                          <span className="drop-shadow-md">TOP 100 </span>
                        </button>
                        <button
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            activeComponent === "Tool"
                              ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                              : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                          }`}
                          onClick={() => handleToggleComponent("Tool")}
                        >
                          <span className="drop-shadow-md">TOOL</span>
                        </button>
                        <button
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            activeComponent === "DataMining Tool"
                              ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                              : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                          }`}
                          onClick={() => {
                            window.open("http://45.61.57.93:5000/login", "_blank");
                          }}
                          // onClick={() => {
                          //   handleToggleComponent("DataMiningTool");
                          // }}
                        >
                          <span className="drop-shadow-md">DATA MINING TOOL</span>
                        </button>
                        <button
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            activeComponent === "BalanceSheet"
                              ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                              : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                          }`}
                          onClick={() => {
                            setSelectedSheetId(null);
                            setActiveComponent("BalanceSheet");
                          }}
                        >
                          <span className="drop-shadow-md">BALANCE SHEET</span>
                        </button>
                        <button
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            activeComponent === "LinkNest"
                              ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                              : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                          }`}
                          onClick={() => {
                            setSelectedSheetId(null);
                            setActiveComponent("LinkNest");
                          }}
                        >
                          <span className="drop-shadow-md">LINKNEST</span>
                        </button>
                        <button
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            activeComponent === "Remote"
                              ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                              : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                          }`}
                          onClick={() => {
                            setSelectedSheetId(null);
                            setActiveComponent("Remote");
                          }}
                        >
                          <span className="drop-shadow-md">REMOTE</span>
                        </button>
                        <button
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            activeComponent === "GlobalAi"
                              ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                              : "dark:text-white  hover:bg-gray-100 dark:hover:bg-[#28283A]"
                          }`}
                          onClick={() => {
                            setActiveComponent("GlobalAi");
                          }}
                        >
                          <span className="drop-shadow-md">GLOBAL AI</span>
                        </button>
                        <Dropdown
                          menu={settingsMenu}
                          trigger={["click"]}
                          overlayClassName="[&_.ant-dropdown-menu]:p-0 [&_.ant-dropdown-menu-item]:p-0 [&_ul]:dark:bg-[#28283a]"
                        >
                          <button className="px-4 py-2 text-sm font-medium rounded-md  transition-all dark:text-white hover:bg-gray-100 dark:hover:bg-[#28283A] flex items-center">
                            <Palette className="w-5 h-5" />
                          </button>
                        </Dropdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {simple ? (
            <>
              <div className="w-full mt-20 ">
                <PopularBookmarks />
              </div>
            </>
          ) : (
            <div className="w-full">
              {activeComponent === "BalanceSheet" ? (
                !user ? <BalancesheetLogin onLoginSuccess={() => setActiveComponent("BalanceDashboard")} /> : <BalanceSheet sheetId={selectedSheetId} />
              ) : activeComponent === "BalanceDashboard" ? (
                !user ? <BalancesheetLogin onLoginSuccess={() => setActiveComponent("BalanceDashboard")} /> : <BalancesheetDashboard onSheetClick={(id) => { setSelectedSheetId(id); setActiveComponent("BalanceSheet"); }} />
              ) : activeComponent === "NotebookAndSheet" ? (
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
              ) : activeComponent === "DataMiningTool" ? (
                <DataMiningTool />
              ) : activeComponent === "LinkNest" ? (
                <LinktreeMain />
              ) : activeComponent === "Remote" ? (
                <RemoteAppWrapper />
              ) : activeComponent === "GlobalAi" ? (
                <GlobalAi />
              ) : (
                <Anotherpage
                  visibleHandle={visibleHandle}
                  isDarkMode={isDarkMode}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <NewFooter />
    </div>
  );
};

export default SearchPage;
