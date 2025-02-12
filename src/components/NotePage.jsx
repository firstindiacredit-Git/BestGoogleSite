import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Underline,
  Download,
  Mic,
  MicOff,
  Palette,
  History,
  Save,
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import { HiOutlineNumberedList } from "react-icons/hi2";
import { RxHamburgerMenu } from "react-icons/rx";
import { createPortal } from "react-dom";

const preventScroll = (prevent) => {
  document.body.style.overflow = prevent ? "hidden" : "";
};

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
  const [dropdownPosition, setDropdownPosition] = useState({
    top: null,
    right: null,
  });
  const [historyPopupPosition, setHistoryPopupPosition] = useState({
    top: null,
    right: null,
  });

  const textareaRef = useRef(null);
  const lineNumberRef = useRef(null);
  const colorPickerRef = useRef(null);
  const historyButtonRef = useRef(null);

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
    const savedHistory = localStorage.getItem("notesHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("notes", notes);
    localStorage.setItem("backgroundColor", backgroundColor);
  }, [notes, backgroundColor]);

  useEffect(() => {
    localStorage.setItem("notesHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        !event.target.closest(".menu-Container") &&
        !event.target.closest(".history-popup") &&
        event.target.closest(".history-backdrop")
      ) {
        setShowColorPicker(false);
        setShowHistory(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  useEffect(() => {
    if (showColorPicker && colorPickerRef.current) {
      const rect = colorPickerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
      preventScroll(true);
    } else {
      preventScroll(false);
    }
    return () => preventScroll(false);
  }, [showColorPicker]);

  const collapse = () => {
    if (!inNotebookSheet) {
      setIsCollapsed(!isCollapsed);
    }
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
  };

  const saveToHistory = () => {
    const newEntry = {
      id: Date.now(),
      content: notes,
      timestamp: new Date().toLocaleString(),
    };
    setHistory((prevHistory) => [newEntry, ...prevHistory]);
  };

  const deleteHistoryEntry = (id) => {
    setHistory((prevHistory) => prevHistory.filter((entry) => entry.id !== id));
  };

  const editHistoryEntry = (id) => {
    const entry = history.find((entry) => entry.id === id);
    if (entry) {
      setNotes(entry.content);
      setShowHistory(false);
    }
  };

  const toggleHistoryPanel = () => {
    setShowHistory(!showHistory);
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

  const renderColorPicker = () => {
    const dropdownContent = showColorPicker && (
      <div
        className="fixed w-48 bg-white dark:bg-[#28283A] border border-gray-200 dark:border-gray-700 rounded-sm shadow-lg p-3 z-[9999] menu-Container"
        style={{
          top: `${dropdownPosition.top}px`,
          right: `${dropdownPosition.right}px`,
        }}
      >
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
    );

    return (
      <div className="menu-Container relative w-9" ref={colorPickerRef}>
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
        {dropdownContent && createPortal(dropdownContent, document.body)}
      </div>
    );
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full h-full backdrop-blur-sm`}
    >
      {inNotebookSheet && <h1 className="text-2xl font-bold">Notebook</h1>}
      <div className="rounded-sm h-full">
        <div
          className={`overflow-hidden h-full rounded-b-sm `}
          style={{
            backgroundColor: isAutoColor ? undefined : "",
          }}
        >
          <div
            className={`p-2 h-full bg flex flex-col justify-between ${
              isAutoColor ? " text-gray-900 dark:text-white" : ""
            }`}
            style={{
              backgroundColor: isAutoColor ? undefined : backgroundColor,
              color: isAutoColor ? undefined : textColor,
            }}
          >
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
                    border: `1px solid ${textColor}`,
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
              <div className="flex flex-wrap justify-between items-center gap-4 mt-6">
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
                    ref={historyButtonRef}
                    className={`p-3 rounded-sm transition duration-200 ${
                      isAutoColor
                        ? "bg-gray-100 dark:bg-[#513a7a] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                        : "bg-opacity-20 bg-gray-500 hover:bg-opacity-30"
                    }`}
                    onClick={toggleHistoryPanel}
                    title="Show History"
                    style={!isAutoColor ? { color: textColor } : undefined}
                  >
                    <History className="w-5 h-5" />
                  </button>
                  <button
                    className={`p-3 rounded-sm transition duration-200 ${
                      isAutoColor
                        ? "bg-gray-100 dark:bg-[#513a7a] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                        : "bg-opacity-20 bg-gray-500 hover:bg-opacity-30"
                    }`}
                    onClick={saveToHistory}
                    title="Save to History"
                    style={!isAutoColor ? { color: textColor } : undefined}
                  >
                    <Save className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <div className="w-full  flex justify-between">
                    <div className="flex items-center gap-2">
                      {renderColorPicker()}
                      <div className="w-9 ">
                        <button
                          className={`p-2 rounded-sm transition duration-200 ${
                            isAutoColor
                              ? "bg-gray-100 dark:bg-[#513a7a]/[var(--widget-opacity)] hover:bg-gray-200 dark:hover:bg-gray-700"
                              : "bg-opacity-20 bg-gray-500 hover:bg-opacity-30"
                          }`}
                          onClick={toggleLineNumbers}
                          title="Toggle Line Numbers"
                          style={{
                            color: isAutoColor ? "inherit" : textColor,
                          }}
                        >
                          {lineNumbers ? (
                            <RxHamburgerMenu className="w-5 h-5" />
                          ) : (
                            <HiOutlineNumberedList className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showHistory &&
              createPortal(
                <div
                  className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999]"
                  onClick={() => setShowHistory(false)}
                >
                  <div
                    className="history-popup bg-white dark:bg-[#28283A] border border-gray-200 dark:border-gray-700 rounded-sm shadow-lg p-4 w-[90%] max-w-[500px] max-h-[80vh] overflow-y-auto transform transition-all duration-200 ease-out"
                    style={{
                      animation:
                        "0.2s ease-out 0s 1 normal none running modalFadeIn",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        History
                      </h3>
                      <button
                        onClick={() => setShowHistory(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {history.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No history entries yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {history.map((entry) => (
                          <div
                            key={entry.id}
                            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {entry.timestamp}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => editHistoryEntry(entry.id)}
                                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="Load this entry"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteHistoryEntry(entry.id)}
                                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                                  title="Delete this entry"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                              {entry.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>,
                document.body
              )}
          </div>
        </div>
      </div>
      <style>
        {`
          @keyframes modalFadeIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default NotePage;
