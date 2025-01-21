import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Underline,
  Download,
  Mic,
  MicOff,
  Palette,
  History,
} from "lucide-react";
import { HiOutlineNumberedList } from "react-icons/hi2";
import { RxHamburgerMenu } from "react-icons/rx";

const NotePage = ({ inNotebookSheet = false }) => {
  const [notes, setNotes] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [isListening, setIsListening] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isAutoColor, setIsAutoColor] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [textColor, setTextColor] = useState("#000000");

  const textareaRef = useRef(null);
  const lineNumberRef = useRef(null);
  const colorPickerRef = useRef(null);

  const predefinedColors = [
    "#000000",
    "#424242",
    "#666666",
    "#808080",
    "#999999",
    "#B3B3B3",
    "#CCCCCC",
    "#E6E6E6",
    "#F2F2F2",
    "#FFFFFF",
    // Row 2
    "#FF0000",
    "#FF4500",
    "#FF8C00",
    "#32CD32",
    "#00FF00",
    "#00CED1",
    "#0000FF",
    "#8A2BE2",
    "#FF00FF",
    // Row 3
    "#FFB6C1",
    "#FFA07A",
    "#FFE4B5",
    "#FFFACD",
    "#98FB98",
    "#AFEEEE",
    "#87CEEB",
    "#E6E6FA",
    "#DDA0DD",
    "#FFC0CB",
    // Row 4
    "#DC143C",
    "#DAA520",
    "#FFA500",
    "#FFD700",
    "#20B2AA",
    "#4169E1",
    "#9370DB",
    "#FF69B4",
  ];

  useEffect(() => {
    const savedNotes = localStorage.getItem("notes");
    const savedColor = localStorage.getItem("backgroundColor");
    if (savedNotes) setNotes(savedNotes);
    if (savedColor) setBackgroundColor(savedColor);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target)
      ) {
        setShowColorPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("notes", notes);
    localStorage.setItem("backgroundColor", backgroundColor);
  }, [notes, backgroundColor]);

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    const handleThemeChange = (e) => {
      setIsDarkMode(e.matches);
      if (isAutoColor) {
        setBackgroundColor(e.matches ? "#1f2937" : "#ffffff");
        setTextColor(e.matches ? "#ffffff" : "#000000");
      }
    };

    setIsDarkMode(darkModeMediaQuery.matches);
    handleThemeChange(darkModeMediaQuery);

    darkModeMediaQuery.addEventListener("change", handleThemeChange);
    return () =>
      darkModeMediaQuery.removeEventListener("change", handleThemeChange);
  }, [isAutoColor]);

  const collapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  const isColorDark = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  };

  const handleScroll = (e) => {
    const lineNumbersDiv = e.target.previousSibling;
    if (lineNumbersDiv) {
      lineNumbersDiv.scrollTop = e.target.scrollTop;
    }
  };

  const getTextColor = () => {
    if (isAutoColor) {
      return isDarkMode ? "#ffffff" : "#000000";
    }
    return isColorDark(backgroundColor) ? "#ffffff" : "#000000";
  };

  const getLineColor = () => {
    if (!isAutoColor) {
      // Convert textColor to rgba with opacity
      const opacity = 0.2;
      if (textColor.startsWith("#")) {
        const r = parseInt(textColor.slice(1, 3), 16);
        const g = parseInt(textColor.slice(3, 5), 16);
        const b = parseInt(textColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      return isColorDark(backgroundColor)
        ? "rgba(255, 255, 255, 0.2)"
        : "rgba(0, 0, 0, 0.2)";
    }

    // For auto mode
    return isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)";
  };

  const getLineNumberColor = () => {
    if (!isAutoColor) {
      // Convert textColor to rgba with opacity
      if (textColor.startsWith("#")) {
        const opacity = 0.5;
        const r = parseInt(textColor.slice(1, 3), 16);
        const g = parseInt(textColor.slice(3, 5), 16);
        const b = parseInt(textColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      return textColor;
    }

    // For auto mode
    return isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)";
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    setHistory((prevHistory) => [...prevHistory, e.target.value]);
  };

  const toggleBold = () => setIsBold(!isBold);
  const toggleUnderline = () => setIsUnderline(!isUnderline);
  const toggleLineNumbers = () => setLineNumbers(!lineNumbers);

  const handleFontSizeChange = (newSize) => {
    if (newSize >= 8 && newSize <= 32) {
      setFontSize(newSize);
    }
  };

  const toggleSpeechToText = () => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      if (!isListening) {
        recognition.start();
        setIsListening(true);

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join("");

          setNotes((prev) => prev + " " + transcript);
        };

        recognition.onerror = (event) => {
          console.error(event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };
      } else {
        recognition.stop();
        setIsListening(false);
      }
    } else {
      alert("Speech recognition is not supported in your browser.");
    }
  };

  const downloadNotes = () => {
    const element = document.createElement("a");
    const file = new Blob([notes], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "notes.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getLineCount = () => {
    return notes.split("\n").length;
  };

  const handleColorChange = (color) => {
    setBackgroundColor(color);
    setIsAutoColor(false);

    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    setTextColor(brightness > 128 ? "#000000" : "#ffffff");
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${
        inNotebookSheet ? "w-full h-full" : "h-full max-w-xl mx-auto"
      }`}
    >
      <div className="rounded-sm h-full">
        <div
          className={`overflow-hidden h-full rounded-b-sm ${
            isAutoColor
              ? "bg-white/[var(--widget-opacity)] dark:bg-[#28283A]/[var(--widget-opacity)]"
              : ""
          }`}
          style={{
            backgroundColor: isAutoColor ? undefined : "",
          }}
        >
          <div
            className={`p-2 h-full bg flex flex-col justify-between ${
              isAutoColor
                ? "bg-white/[var(--widget-opacity)] dark:bg-[#28283A]/[var(--widget-opacity)] text-gray-900 dark:text-white"
                : ""
            }`}
            style={{
              backgroundColor: isAutoColor ? undefined : backgroundColor,
              color: isAutoColor ? undefined : textColor,
            }}
          >
            <div className="flex justify-between items-center mb-1">
              <div className="w-full  flex justify-between">
                <div
                  className=" flex p-2 w-full dark:text-white text-xl font-medium items-center cursor-pointer"
                  onClick={collapse}
                >
                  Notes
                </div>
                {isHovered && (
                  <div className="flex items-center gap-2">
                    <div className="relative w-9 " ref={colorPickerRef}>
                      <button
                        className={`p-2 rounded-sm transition duration-200 ${
                          isAutoColor
                            ? "bg-gray-100 dark:bg-[#513a7a] hover:bg-gray-200 dark:hover:bg-gray-700"
                            : "bg-opacity-20 bg-gray-500 hover:bg-opacity-30"
                        }`}
                        onClick={() => setShowColorPicker((prev) => !prev)}
                        title="Change Background Color"
                        style={{ color: isAutoColor ? "inherit" : textColor }}
                      >
                        <Palette className="w-5 h-5" />
                      </button>
                      {showColorPicker && (
                        <div className="absolute w-48 right-0 z-50 -mt-2 bg-white dark:bg-[#513a7a] border border-gray-200 dark:border-gray-700 rounded shadow-lg p-3">
                          {/* Auto Theme Button */}
                          <div className="mb-2">
                            <button
                              onClick={() => {
                                setIsAutoColor(true);
                                setShowColorPicker(false);
                              }}
                              className="w-full py-1 px-2 text-sm bg-gray-100 dark:bg-[#513a7a] hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors text-gray-900 dark:text-white"
                            >
                              Auto Theme Color
                            </button>
                          </div>

                          {/* Predefined Colors */}
                          <div className="grid grid-cols-7 gap-1">
                            {predefinedColors.map((color) => (
                              <button
                                key={color}
                                className="w-5 h-5 border dark:border-gray-600 border-gray-200 cursor-pointer transition duration-300 ease-in-out transform hover:scale-125 focus:outline-none"
                                style={{ backgroundColor: color }}
                                onClick={() => {
                                  setIsAutoColor(false);
                                  handleColorChange(color);
                                  setShowColorPicker(false);
                                }}
                              />
                            ))}
                          </div>

                          {/* Custom Color Picker */}
                          <div className="mt-2 flex items-center justify-center">
                            <input
                              type="color"
                              className="w-full h-6 p-0 border dark:border-gray-600 border-gray-300 rounded-xs cursor-pointer focus:outline-none"
                              value={backgroundColor}
                              onChange={(e) => {
                                setIsAutoColor(false);
                                handleColorChange(e.target.value);
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="w-9 ">
                      <button
                        className={`p-2 rounded-sm transition duration-200 ${
                          isAutoColor
                            ? "bg-gray-100 dark:bg-[#513a7a] hover:bg-gray-200 dark:hover:bg-gray-700"
                            : "bg-opacity-20 bg-gray-500 hover:bg-opacity-30"
                        }`}
                        onClick={toggleLineNumbers}
                        title="Toggle Line Numbers"
                        style={{ color: isAutoColor ? "inherit" : textColor }}
                      >
                        {lineNumbers ? (
                          <RxHamburgerMenu className="w-5 h-5" />
                        ) : (
                          <HiOutlineNumberedList className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!isCollapsed && (
              <div className="flex ">
                {lineNumbers && (
                  <div
                    ref={lineNumberRef}
                    className={`text-right pr-2 overflow-hidden h-[345px] ${
                      isAutoColor ? "text-gray-500 dark:text-gray-400" : ""
                    }`}
                    style={{
                      fontSize: `${fontSize}px`,
                      lineHeight: "3",
                      color: !isAutoColor ? textColor : undefined,
                      opacity: !isAutoColor ? 0.5 : undefined,
                    }}
                  >
                    {Array.from(
                      { length: getLineCount() },
                      (_, i) => i + 1
                    ).map((line) => (
                      <div key={line} style={{ height: `${fontSize * 2.3}px` }}>
                        {line}
                      </div>
                    ))}
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  value={notes}
                  onChange={handleNotesChange}
                  onScroll={handleScroll}
                  className={`hindi-paper ${
                    isAutoColor
                      ? "text-gray-900 dark:text-white auto-lines"
                      : ""
                  }`}
                  style={{
                    height: "350px",
                    marginBottom: "20px",
                    resize: "none",
                    color: isAutoColor ? undefined : textColor,
                    backgroundColor: "transparent",
                    border: isAutoColor
                      ? "1px solid rgb(209 213 219)"
                      : `1px solid ${textColor}`,
                    padding: "10px 10px 10px 10px",
                    borderRadius: "5px",
                    fontSize: `${fontSize}px`,
                    lineHeight: "32px",
                    fontFamily: "Arial, sans-serif",
                    position: "relative",
                    backgroundAttachment: "local",
                    width: "100%",
                    transformOrigin: "left top",
                    fontWeight: isBold ? "bold" : "normal",
                    textDecoration: isUnderline ? "underline" : "none",
                    backgroundImage: !isAutoColor
                      ? `linear-gradient(to bottom,transparent 30px,${getLineColor()} 31px,transparent 49px)`
                      : undefined,
                  }}
                  placeholder="Start typing your notes here..."
                />
                <style>
                  {`
                    .hindi-paper {
                      background-size: 100% 32px;
                      background-position-y: -1px;
                      line-height: 20px;
                      padding: 0 8px;
                      overflow-y: scroll;
                      scrollbar-width: none;
                    }

                    .hindi-paper.auto-lines {
                      background-image: linear-gradient(
                        to bottom,
                        transparent 30px,
                        rgba(0, 0, 0, 0.15) 31px,
                        transparent 49px
                      );
                    }

                    .dark .hindi-paper.auto-lines {
                      background-image: linear-gradient(
                        to bottom,
                        transparent 30px,
                        rgba(255, 255, 255, 0.15) 31px,
                        transparent 49px
                      );
                    }

                    .hindi-paper::-webkit-scrollbar {
                      display: none;
                    }
                  `}
                </style>
              </div>
            )}

            {!isCollapsed && (
              <div className="flex  flex-wrap justify-between items-center gap-4 mt-6">
                <div className="flex items-center space-x-3">
                  <button
                    className={`p-3 rounded-sm transition duration-200 ${
                      isAutoColor
                        ? isBold
                          ? "bg-indigo-500 text-white"
                          : "bg-gray-100 dark:bg-[#513a7a] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                        : isBold
                        ? "bg-indigo-500 text-white"
                        : "bg-opacity-20 bg-gray-500 hover:bg-opacity-30"
                    }`}
                    onClick={toggleBold}
                    title="Toggle Bold"
                    style={
                      !isAutoColor && !isBold ? { color: textColor } : undefined
                    }
                  >
                    <Bold className="w-5 h-5" />
                  </button>
                  <button
                    className={`p-3 rounded-sm transition duration-200 ${
                      isAutoColor
                        ? isUnderline
                          ? "bg-indigo-500 text-white"
                          : "bg-gray-100 dark:bg-[#513a7a] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                        : isUnderline
                        ? "bg-indigo-500 text-white"
                        : "bg-opacity-20 bg-gray-500 hover:bg-opacity-30"
                    }`}
                    onClick={toggleUnderline}
                    title="Toggle Underline"
                    style={
                      !isAutoColor && !isUnderline
                        ? { color: textColor }
                        : undefined
                    }
                  >
                    <Underline className="w-5 h-5" />
                  </button>
                  <button
                    className={`p-3 rounded-sm transition duration-200 ${
                      isAutoColor
                        ? isListening
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 dark:bg-[#513a7a] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                        : isListening
                        ? "bg-red-500 text-white"
                        : "bg-opacity-20 bg-gray-500 hover:bg-opacity-30"
                    }`}
                    onClick={toggleSpeechToText}
                    title="Toggle Speech-to-Text"
                    style={
                      !isAutoColor && !isListening
                        ? { color: textColor }
                        : undefined
                    }
                  >
                    {isListening ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    className={`p-3 rounded-sm transition duration-200 ${
                      isAutoColor
                        ? "bg-gray-100 dark:bg-[#513a7a] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                        : "bg-opacity-20 bg-gray-500 hover:bg-opacity-30"
                    }`}
                    onClick={() => setShowHistory(!showHistory)}
                    title="Show History"
                    style={!isAutoColor ? { color: textColor } : undefined}
                  >
                    <History className="w-5 h-5" />
                  </button>
                </div>
                <button
                  className={`p-3 rounded-sm transition duration-200 ${
                    isAutoColor
                      ? "bg-gray-100 dark:bg-[#513a7a] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                      : "bg-opacity-20 bg-gray-500 hover:bg-opacity-30"
                  }`}
                  onClick={downloadNotes}
                  title="Download Notes"
                  style={!isAutoColor ? { color: textColor } : undefined}
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            )}

            {showHistory && (
              <div
                className={`mt-4 p-4 rounded-sm shadow-md ${
                  isAutoColor
                    ? "bg-gray-50 dark:bg-[#513a7a] text-gray-900 dark:text-gray-100"
                    : "bg-gray-100"
                }`}
              >
                <h3 className="text-lg font-bold mb-2">History</h3>
                <ul className="list-disc pl-6">
                  {history.map((entry, index) => (
                    <li key={index} className="text-sm mb-1">
                      {entry}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotePage;
