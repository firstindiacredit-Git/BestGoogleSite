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
import Tool from "../components/Tool";
import Sports from "../components/Sports";
import Top100 from "../components/Top100";
import "./style.css";
import { Dropdown, Skeleton } from "antd";
import { Settings } from "lucide-react";
import { ThemeContext } from "../App";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function SearchPage() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
  const [visibleHandle, setVisibleHandle] = useState(
    () => localStorage.getItem("uiMode") === "modern"
  );

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

  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(
      authInstance,
      async (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const storedBackgroundImage = localStorage.getItem("backgroundImage");
    if (storedBackgroundImage) {
      setBackgroundImage(storedBackgroundImage);
    }
  }, []);

  const changeVisible = useCallback(() => {
    const newMode = !visibleHandle;
    setVisibleHandle(newMode);
    localStorage.setItem("uiMode", newMode ? "modern" : "classic");
  }, [visibleHandle]);

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
  }, [transparency, widgetTransparent]);

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
      };
      reader.readAsDataURL(file);
    }
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

  const handleResetTextColor = () => {
    const newValue = isDarkMode ? 100 : 0; // 100 for white in dark mode, 0 for black in light mode
    handleTextColorChange(newValue);
  };

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
  const settingsMenu = useMemo(
    () => ({
      items: [
        {
          key: "bgOpacity",
          label: (
            <>
              <div
                className="flex flex-col gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-sm text-gray-600">
                  Background Opacity
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderTransparency}
                  onChange={(e) =>
                    handleTempTransparencyChange(parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer "
                />
                <span className="text-sm text-gray-600 text-right">
                  {sliderTransparency}%
                </span>
              </div>
              <div
                className="flex gap-2 pt-2 border-t"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyChanges();
                  }}
                  className="flex-1 px-3 py-1.5 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
                >
                  Apply
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetChanges();
                  }}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  Reset
                </button>
              </div>
            </>
          ),
        },
        {
          key: "widgetOpacity",
          label: (
            <>
              <div
                className="flex flex-col gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-sm text-gray-600">Widget Opacity</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderWidgetTransparency}
                  onChange={(e) =>
                    handleTempWidgetTransparencyChange(parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer "
                />
                <span className="text-sm text-gray-600 text-right">
                  {sliderWidgetTransparency}%
                </span>
              </div>
            </>
          ),
        },
        {
          key: "actions",
          label: (
            <div
              className="flex gap-2 pt-2 border-t "
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApplyChanges();
                }}
                className="flex-1 px-3 py-1.5 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetChanges();
                }}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                Reset
              </button>
            </div>
          ),
        },
        {
          key: "textColor",
          label: (
            <div
              className="flex flex-col gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-sm text-gray-600">Text Color</span>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={textColor}
                  onChange={(e) =>
                    handleTextColorChange(parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gradient-to-r from-black via-gray-500 to-white rounded-lg appearance-none cursor-pointer"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetTextColor();
                  }}
                  className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300  rounded transition-colors duration-200"
                >
                  Reset
                </button>
              </div>
            </div>
          ),
        },
        {
          key: "cardUI",
          label: (
            <div
              className="flex flex-col gap-2 border-t"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-sm text-gray-600">Card UI</span>
              <button
                className="text-center bg-black/5 dark:bg-white/5  hover:bg-gray-50 w-full rounded-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  changeVisible();
                }}
              >
                {!visibleHandle ? "Modern" : "Classic"}
              </button>
            </div>
          ),
        },
      ],
    }),
    [
      sliderTransparency,
      sliderWidgetTransparency,
      textColor,
      handleTempTransparencyChange,
      handleTempWidgetTransparencyChange,
      handleTextColorChange,
      handleApplyChanges,
      handleResetChanges,
      changeVisible,
    ]
  );

  if (loading) {
    return (
      <div
        className={`fixed inset-0 ${
          isDarkMode
            ? "bg-gradient-to-r from-[#1a1a2e] via-[#2a243f] to-[#1a1a2e]"
            : "bg-gradient-to-r from-indigo-200 via-blue-100 to-indigo-200"
        } transition-colors duration-300`}
        style={overlayStyles}
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
                  <div className="flex space-x-1 p-1 justify-between bg-gray-200/10 backdrop-blur-lg border border-gray-400/10 dark:border-gray-800/20 dark:bg-[#513a7a]/10 rounded-lg w-full">
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
                    <Dropdown menu={settingsMenu} trigger={["click"]}>
                      <button className="px-4 py-2 text-sm font-medium rounded-md  transition-all dark:text-white hover:bg-gray-100 dark:hover:bg-[#28283A] flex items-center">
                        <Settings className="w-5 h-5" />
                      </button>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {!user ? (
            <div className="w-full">
              <div className="flex justify-center items-center h-[15vh]">
                <div className="text-5xl text-indigo-500 font-bold">
                  UNLOCK MORE FEATURES
                  <button
                    onClick={() => navigate("/signin")}
                    class="group mx-auto mt-5 relative flex flex-row items-center bg-[#212121] dark:bg-white justify-center gap-2 rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f]"
                  >
                    <div class="absolute inset-0 block h-full w-full animate-gradient bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:var(--bg-size)_100%] [border-radius:inherit] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] p-[1px] ![mask-composite:subtract]"></div>
                    <svg
                      class="size-4 text-white dark:text-[#212121]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 15 15"
                      height="15"
                      width="15"
                    >
                      <path
                        clip-rule="evenodd"
                        fill-rule="evenodd"
                        fill="currentColor"
                        d="M5 4.63601C5 3.76031 5.24219 3.1054 5.64323 2.67357C6.03934 2.24705 6.64582 1.9783 7.5014 1.9783C8.35745 1.9783 8.96306 2.24652 9.35823 2.67208C9.75838 3.10299 10 3.75708 10 4.63325V5.99999H5V4.63601ZM4 5.99999V4.63601C4 3.58148 4.29339 2.65754 4.91049 1.99307C5.53252 1.32329 6.42675 0.978302 7.5014 0.978302C8.57583 0.978302 9.46952 1.32233 10.091 1.99162C10.7076 2.65557 11 3.57896 11 4.63325V5.99999H12C12.5523 5.99999 13 6.44771 13 6.99999V13C13 13.5523 12.5523 14 12 14H3C2.44772 14 2 13.5523 2 13V6.99999C2 6.44771 2.44772 5.99999 3 5.99999H4ZM3 6.99999H12V13H3V6.99999Z"
                      ></path>
                    </svg>
                    <div
                      class="shrink-0 bg-border w-[1px] h-4"
                      role="none"
                      data-orientation="vertical"
                    ></div>
                    <span class="inline animate-gradient whitespace-pre bg-gradient-to-r dark:from-[#ffaa40] dark:via-[#9c40ff] dark:to-[#ffaa40] from-white via-gray-50 to-white bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent [--bg-size:300%] text-center">
                      Login
                    </span>
                    <svg
                      stroke-linecap="round"
                      class="text-[#9c40ff]"
                      stroke-width="1.5"
                      aria-hidden="true"
                      viewBox="0 0 10 10"
                      height="11"
                      width="11"
                      stroke="currentColor"
                      fill="none"
                    >
                      <path
                        stroke-linecap="round"
                        d="M0 5h7"
                        class="opacity-0 transition group-hover:opacity-100"
                      ></path>
                      <path
                        stroke-linecap="round"
                        d="M1 1l4 4-4 4"
                        class="transition group-hover:translate-x-[3px]"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
