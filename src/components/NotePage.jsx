import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Underline,
  Mic,
  MicOff,
  Palette,
  History,
  Save,
  Edit2,
  Trash2,
  X,
  Plus,
  ChevronDown,
  Pencil,
  AlertCircle,
} from "lucide-react";
import { HiOutlineNumberedList } from "react-icons/hi2";
import { RxHamburgerMenu } from "react-icons/rx";
import { createPortal } from "react-dom";
import { useTheme } from "../context/ThemeContext";

const preventScroll = (prevent) => {
  document.body.style.overflow = prevent ? "hidden" : "";
};

const NotePage = ({ inNotebookSheet = false }) => {
  const [tabs, setTabs] = useState([
    { id: 1, title: "Tab 1", content: "" }
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [showTabDropdown, setShowTabDropdown] = useState(false);
  const [editingTabId, setEditingTabId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [isListening, setIsListening] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isCollapsed] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isAutoColor, setIsAutoColor] = useState(true);
  const [textColor, setTextColor] = useState("#000000");
  const [dropdownPosition, setDropdownPosition] = useState({
    top: null,
    right: null,
  });
  const { isDarkMode } = useTheme();
  const [showWarning, setShowWarning] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const MAX_TABS_FOR_GUEST = 5;

  const textareaRef = useRef(null);
  const lineNumberRef = useRef(null);
  const colorPickerRef = useRef(null);
  const historyButtonRef = useRef(null);
  const tabDropdownRef = useRef(null);
  const editInputRef = useRef(null);

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
    const savedTabs = localStorage.getItem("noteTabs");
    if (savedTabs) {
      const parsedTabs = JSON.parse(savedTabs);
      setTabs(parsedTabs);
      setActiveTabId(parsedTabs[0]?.id || 1);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("noteTabs", JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (activeTab) {
      setNotes(activeTab.content);
    }
  }, [activeTabId, tabs]);

  useEffect(() => {
    const savedHistory = localStorage.getItem("notesHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    const savedBackgroundColor = localStorage.getItem("backgroundColor");
    const savedTextColor = localStorage.getItem("textColor");
    const savedIsAutoColor = localStorage.getItem("isAutoColor");
    
    if (savedBackgroundColor && !inNotebookSheet) {
      setBackgroundColor(savedBackgroundColor);
    }
    
    if (savedTextColor && !inNotebookSheet) {
      setTextColor(savedTextColor);
    }
    
    if (savedIsAutoColor !== null && !inNotebookSheet) {
      setIsAutoColor(JSON.parse(savedIsAutoColor));
    }
  }, [inNotebookSheet]);

  useEffect(() => {
    localStorage.setItem("notes", notes);
    localStorage.setItem("backgroundColor", backgroundColor);
    localStorage.setItem("textColor", textColor);
    localStorage.setItem("isAutoColor", JSON.stringify(isAutoColor));
    console.log("Background color updated:", backgroundColor, "isAutoColor:", isAutoColor);
  }, [notes, backgroundColor, textColor, isAutoColor]);

  useEffect(() => {
    localStorage.setItem("notesHistory", JSON.stringify(history));
  }, [history]);

  // Handle click outside for tab dropdown
  useEffect(() => {
    if (!showTabDropdown) return;
    
    function handleClickOutside(event) {
      if (
        tabDropdownRef.current &&
        !tabDropdownRef.current.contains(event.target)
      ) {
        // If editing a tab title, save it first
        if (editingTabId && editingTitle.trim()) {
          setTabs(prevTabs =>
            prevTabs.map(tab =>
              tab.id === editingTabId ? { ...tab, title: editingTitle.trim() } : tab
            )
          );
        }
        setEditingTabId(null);
        setEditingTitle("");
        setShowTabDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTabDropdown, editingTabId, editingTitle]);

  // Handle click outside for color picker
  useEffect(() => {
    if (!showColorPicker) return;
    
    function handleClickOutside(event) {
      // Check if click is outside both the button and the dropdown content
      const isOutsideButton = colorPickerRef.current && !colorPickerRef.current.contains(event.target);
      const isOutsideDropdown = !event.target.closest(".menu-Container");
      
      if (isOutsideButton && isOutsideDropdown) {
        setShowColorPicker(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColorPicker]);

  // Handle click outside for history popup
  useEffect(() => {
    if (!showHistory) return;
    
    function handleClickOutside(event) {
      if (
        !event.target.closest(".history-popup") &&
        event.target.closest(".history-backdrop")
      ) {
        setShowHistory(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showHistory]);

  useEffect(() => {
    if (showColorPicker && colorPickerRef.current) {
      const rect = colorPickerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + -215,
        right: window.innerWidth - rect.right,
      });
      preventScroll(true);
    } else {
      preventScroll(false);
    }
    return () => preventScroll(false);
  }, [showColorPicker]);

  useEffect(() => {
    if (inNotebookSheet) {
      setIsAutoColor(false);
      setBackgroundColor("#fff"); // Default dark background for NotebookAndSheet
      setTextColor("#000"); // White text for contrast
    }
  }, [inNotebookSheet]);

  useEffect(() => {
    if (editingTabId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTabId]);

  useEffect(() => {
    // Check if user is logged in (this should be connected to your auth system)
    const checkLoginStatus = () => {
      // Replace this with your actual auth check
      const userToken = localStorage.getItem('userToken');
      setIsLoggedIn(!!userToken);
    };
    checkLoginStatus();
  }, []);

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

  const handleNotesChange = (e) => {
    const newContent = e.target.value;
    setNotes(newContent);
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, content: newContent }
          : tab
      )
    );
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

  const getLineCount = () => {
    return notes.split("\n").length;
  };

  const handleColorChange = (color) => {
    console.log("Color changed to:", color);
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

  const createNewTab = () => {
    if (!isLoggedIn && tabs.length >= MAX_TABS_FOR_GUEST) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      return;
    }

    const newTabId = Math.max(...tabs.map(tab => tab.id), 0) + 1;
    const newTab = {
      id: newTabId,
      title: `Tab ${newTabId}`,
      content: ""
    };
    setTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTabId(newTabId);
    setShowTabDropdown(false);
  };

  const switchTab = (tabId) => {
    setActiveTabId(tabId);
    setShowTabDropdown(false);
  };

  const deleteTab = (tabId, e) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    
    setTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId));
    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter(tab => tab.id !== tabId);
      setActiveTabId(remainingTabs[0].id);
    }
  };

  const startEditingTab = (tabId, title, e) => {
    e.stopPropagation();
    setEditingTabId(tabId);
    setEditingTitle(title);
  };

  const saveTabTitle = (tabId, e) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      setTabs(prevTabs =>
        prevTabs.map(tab =>
          tab.id === tabId ? { ...tab, title: editingTitle.trim() } : tab
        )
      );
    }
    setEditingTabId(null);
    setEditingTitle("");
  };

  const handleTitleKeyDown = (tabId, e) => {
    if (e.key === 'Enter') {
      saveTabTitle(tabId, e);
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
      setEditingTitle("");
      setShowTabDropdown(false);
    }
  };

  return (
    <div
      className={`w-full h-full backdrop-blur-sm`}
    >
      <div className="rounded-sm h-full">
        <div
          className={`overflow-hidden h-full rounded-b-sm`}
          style={{
            backgroundColor: isAutoColor ? undefined : backgroundColor,
          }}
        >
          <div
            className={`p-2 h-full flex flex-col justify-between ${
              isAutoColor ? "text-gray-900 dark:text-white" : ""
            }`}
            style={{
              color: isAutoColor ? undefined : textColor,
            }}
          >
            {inNotebookSheet && (
              <h1 className="text-2xl font-bold px-3 py-2">Notebook</h1>
            )}
            {!isCollapsed && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="relative" ref={tabDropdownRef}>
                      <button
                        onClick={() => setShowTabDropdown(!showTabDropdown)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-[#513a7a] hover:bg-gray-200 dark:hover:bg-gray-700 rounded-sm text-sm min-w-[120px]"
                      >
                        {tabs.find(tab => tab.id === activeTabId)?.title}
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {showTabDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-[#28283A] border border-gray-200 dark:border-gray-700 rounded-sm shadow-lg z-50">
                          {tabs.map(tab => (
                            <div
                              key={tab.id}
                              className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                              onClick={() => switchTab(tab.id)}
                            >
                              {editingTabId === tab.id ? (
                                <input
                                  ref={editInputRef}
                                  type="text"
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  onBlur={(e) => saveTabTitle(tab.id, e)}
                                  onKeyDown={(e) => handleTitleKeyDown(tab.id, e)}
                                  className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="text-sm">{tab.title}</span>
                                  <button
                                    onClick={(e) => startEditingTab(tab.id, tab.title, e)}
                                    className="text-gray-500 hover:text-blue-500"
                                    title="Rename tab"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                              {tabs.length > 1 && (
                                <button
                                  onClick={(e) => deleteTab(tab.id, e)}
                                  className="text-gray-500 hover:text-red-500 ml-2"
                                  title="Delete tab"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={createNewTab}
                      className="flex items-center gap-1 px-2 py-1.5 bg-gray-100 dark:bg-[#513a7a] hover:bg-gray-200 dark:hover:bg-gray-700 rounded-sm text-sm"
                      title="New Tab"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* {!isLoggedIn && (
                  <div className="flex items-center gap-2 px-3 py-1.5 mb-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>You are not logged in. Data will be saved locally only.</span>
                  </div>
                )} */}

                {showWarning && (
                  <div className="fixed top-4 right-4 flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-sm shadow-lg z-50 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    <span>Guest users can only create up to {MAX_TABS_FOR_GUEST} tabs. Please log in to create more.</span>
                  </div>
                )}

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
              </>
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
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default NotePage;
