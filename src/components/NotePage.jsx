import { useState, useRef, useEffect } from "react";
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
  AlertCircle,
  Edit3,
} from "lucide-react";
import { HiOutlineNumberedList } from "react-icons/hi2";
import { RxHamburgerMenu } from "react-icons/rx";
import { createPortal } from "react-dom";
import { useTheme } from "../context/ThemeContext";
import PropTypes from "prop-types";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  doc,
  deleteDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import _ from "lodash";

const preventScroll = (prevent) => {
  document.body.style.overflow = prevent ? "hidden" : "";
};

const NotePage = ({ inNotebookSheet = false }) => {
  const getStorageKey = (baseKey) =>
    inNotebookSheet
      ? `notepage_notebook_${baseKey}`
      : `notepage_${baseKey}`;

  const [currentUser, setCurrentUser] = useState(null);
  const [tabs, setTabs] = useState([
    { id: 1, title: "Tab 1", content: "" },
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [showTabDropdown, setShowTabDropdown] = useState(false);
  const [editingTabId, setEditingTabId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontSize] = useState(14);
  const [isListening, setIsListening] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(() => {
    const savedColor = localStorage.getItem(getStorageKey("backgroundColor"));
    return savedColor || (inNotebookSheet ? "#f5ffe5" : "#ffffff");
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isCollapsed] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isAutoColor, setIsAutoColor] = useState(() => {
    const savedIsAutoColor = localStorage.getItem(getStorageKey("isAutoColor"));
    if (savedIsAutoColor !== null) {
      return JSON.parse(savedIsAutoColor);
    }
    return !inNotebookSheet;
  });
  const [textColor, setTextColor] = useState(() => {
    const savedTextColor = localStorage.getItem(getStorageKey("textColor"));
    return savedTextColor || (inNotebookSheet ? "#000" : "#000000");
  });
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
  const recognitionRef = useRef(null);

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Effect to fetch notes from Firestore or localStorage
  useEffect(() => {
    if (currentUser) {
      const notesCollectionRef = collection(db, "users", currentUser.uid, "notes");
      const q = query(notesCollectionRef);

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (querySnapshot.empty) {
          setTabs([{ id: 'local-1', title: "Tab 1", content: "" }]);
          setActiveTabId('local-1');
        } else {
          const fetchedTabs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setTabs(fetchedTabs);
          setActiveTabId(prevId => fetchedTabs.some(t => t.id === prevId) ? prevId : fetchedTabs[0]?.id);
        }
      });

      return () => unsubscribe();
    } else {
      const savedTabs = localStorage.getItem(getStorageKey("tabs"));
      if (savedTabs) {
        const parsedTabs = JSON.parse(savedTabs);
        setTabs(parsedTabs);
        setActiveTabId(parsedTabs[0]?.id || 1);
      } else {
        setTabs([{ id: 1, title: "Tab 1", content: "" }]);
        setActiveTabId(1);
      }
    }
  }, [currentUser, inNotebookSheet]);

  useEffect(() => {
    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    if (!activeTab && tabs.length > 0) {
      setActiveTabId(tabs[0].id);
    }
  }, [activeTabId, tabs]);

  const debouncedUpdate = useRef(
    _.debounce(async (user, tabId, content, title, setActiveTabId_func) => {
      if (!user || !tabId) return;

      if (tabId.toString().startsWith("local-")) {
        const notesCollectionRef = collection(db, "users", user.uid, "notes");
        const newDocRef = await addDoc(notesCollectionRef, {
          title: title || "Untitled",
          content,
          createdAt: Timestamp.now(),
        });
        setActiveTabId_func(newDocRef.id);
      } else {
        const noteDocRef = doc(db, "users", user.uid, "notes", tabId);
        await setDoc(noteDocRef, { content }, { merge: true });
      }
    }, 1000)
  ).current;

  const handleNotesChange = (e) => {
    const newContent = e.target.value;
    setTabs(currentTabs => {
      const updatedTabs = currentTabs.map(tab =>
        tab.id === activeTabId ? { ...tab, content: newContent } : tab
      );

      if (currentUser) {
        const activeTab = updatedTabs.find(tab => tab.id === activeTabId);
        debouncedUpdate(currentUser, activeTabId, newContent, activeTab?.title, setActiveTabId);
      } else {
        localStorage.setItem(getStorageKey("tabs"), JSON.stringify(updatedTabs));
      }

      return updatedTabs;
    });
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem(getStorageKey("history"));
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, [inNotebookSheet]);

  useEffect(() => {
    localStorage.setItem(getStorageKey("backgroundColor"), backgroundColor);
    localStorage.setItem(getStorageKey("textColor"), textColor);
    localStorage.setItem(getStorageKey("isAutoColor"), JSON.stringify(isAutoColor));
  }, [backgroundColor, textColor, isAutoColor, inNotebookSheet]);

  useEffect(() => {
    localStorage.setItem(getStorageKey("history"), JSON.stringify(history));
  }, [history, inNotebookSheet]);

  // Handle click outside for tab dropdown
  useEffect(() => {
    if (!showTabDropdown) return;
    
    function handleClickOutside(event) {
      if (
        tabDropdownRef.current &&
        !tabDropdownRef.current.contains(event.target)
      ) {
        if (editingTabId && editingTitle.trim()) {
          const newTitle = editingTitle.trim();
          if (currentUser && !editingTabId.toString().startsWith('local-')) {
            const noteDocRef = doc(db, "users", currentUser.uid, "notes", editingTabId);
            setDoc(noteDocRef, { title: newTitle }, { merge: true });
          } else {
             setTabs(prevTabs =>
              prevTabs.map(tab =>
                tab.id === editingTabId ? { ...tab, title: newTitle } : tab
              )
            );
          }
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
  }, [showTabDropdown, editingTabId, editingTitle, currentUser]);

  // Handle click outside for color picker
  useEffect(() => {
    if (!showColorPicker) return;
    
    function handleClickOutside(event) {
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
    if (editingTabId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTabId]);

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

    return isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)";
  };

  const saveToHistory = () => {
    const newEntry = {
      id: Date.now(),
      content: tabs.find(t => t.id === activeTabId)?.content || '',
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
      setTabs(prevTabs =>
        prevTabs.map(tab =>
          tab.id === activeTabId ? { ...tab, content: entry.content } : tab
        )
      );
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
      if (!recognitionRef.current) {
        recognitionRef.current = new window.webkitSpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join("");
          setTabs((prevTabs) =>
            prevTabs.map((tab) =>
              tab.id === activeTabId ? { ...tab, content: tab.content + " " + transcript } : tab
            )
          );
        };
        recognitionRef.current.onerror = (event) => {
          console.error(event.error);
          setIsListening(false);
        };
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
      if (!isListening) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    } else {
      alert("Speech recognition is not supported in your browser.");
    }
  };

  const getLineCount = () => {
    const content = tabs.find(t => t.id === activeTabId)?.content || '';
    return content.split("\n").length;
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
      <div className="menu-Container relative w-9 mr-2" ref={colorPickerRef}>
        <button
          className={`p-3 rounded-sm transition duration-200 ${
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

  const createNewTab = async () => {
    if (!isLoggedIn && tabs.length >= MAX_TABS_FOR_GUEST) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      return;
    }

    const newTabTitle = `Tab ${tabs.length + 1}`;

    if (currentUser) {
      const notesCollectionRef = collection(db, "users", currentUser.uid, "notes");
      const newDocRef = await addDoc(notesCollectionRef, {
        title: newTabTitle,
        content: "",
        createdAt: Timestamp.now(),
      });
      setActiveTabId(newDocRef.id);
    } else {
      const newTabId = Math.max(0, ...tabs.map(tab => typeof tab.id === 'number' ? tab.id : 0)) + 1;
      const newTab = { id: newTabId, title: newTabTitle, content: "" };
      const updatedTabs = [...tabs, newTab];
      setTabs(updatedTabs);
      setActiveTabId(newTabId);
      localStorage.setItem(getStorageKey("tabs"), JSON.stringify(updatedTabs));
    }
    setShowTabDropdown(false);
  };

  const switchTab = (tabId) => {
    setActiveTabId(tabId);
    setShowTabDropdown(false);
  };

  const deleteTab = async (tabId, e) => {
    e.stopPropagation();
    if (tabs.length === 1) return;

    if (currentUser && !tabId.toString().startsWith('local-')) {
      const noteDocRef = doc(db, "users", currentUser.uid, "notes", tabId);
      await deleteDoc(noteDocRef);
    } else {
      const updatedTabs = tabs.filter(tab => tab.id !== tabId);
      setTabs(updatedTabs);
      if (activeTabId === tabId) {
        setActiveTabId(updatedTabs[0]?.id);
      }
      localStorage.setItem(getStorageKey("tabs"), JSON.stringify(updatedTabs));
    }
  };

  const startEditingTab = (tabId, title, e) => {
    e.stopPropagation();
    setEditingTabId(tabId);
    setEditingTitle(title);
  };

  const saveTabTitle = async (tabId, e) => {
    e.stopPropagation();
    const newTitle = editingTitle.trim();
    if (newTitle) {
      if (currentUser && !tabId.toString().startsWith('local-')) {
        const noteDocRef = doc(db, "users", currentUser.uid, "notes", tabId);
        await setDoc(noteDocRef, { title: newTitle }, { merge: true });
      } else {
         setTabs(prevTabs =>
          prevTabs.map(tab =>
            tab.id === tabId ? { ...tab, title: newTitle } : tab
          )
        );
        localStorage.setItem(getStorageKey("tabs"), JSON.stringify(tabs.map(tab =>
          tab.id === tabId ? { ...tab, title: newTitle } : tab
        )));
      }
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
      className={`w-full backdrop-blur-sm`}
      style={{ height: '350px', minHeight: '350px' }}
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
                {/* Horizontal Tab Bar */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide">
                    {tabs.slice(0, 3).map(tab => (
                      <div
                        key={tab.id}
                        className={`flex items-center px-4 py-1.5 rounded-t-md border-b-2 cursor-pointer select-none transition-colors duration-150 mr-1
                          ${activeTabId === tab.id
                            ? 'bg-white dark:bg-[#28283A] border-indigo-500 text-indigo-700 dark:text-indigo-200 font-semibold shadow'
                            : 'bg-gray-100 dark:bg-[#513a7a] border-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}
                        `}
                        onClick={() => switchTab(tab.id)}
                        onDoubleClick={() => startEditingTab(tab.id, tab.title, { stopPropagation: () => {} })}
                        style={{ minWidth: 76, maxWidth: 180 }}
                      >
                        {editingTabId === tab.id ? (
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editingTitle}
                            onChange={e => setEditingTitle(e.target.value)}
                            onBlur={e => saveTabTitle(tab.id, e)}
                            onKeyDown={e => handleTitleKeyDown(tab.id, e)}
                            className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-sm px-1"
                            onClick={e => e.stopPropagation()}
                            style={{ minWidth: 60, maxWidth: 120 }}
                          />
                        ) : (
                          <span className="truncate max-w-[100px] text-sm" title={tab.title}>{tab.title}</span>
                        )}
                        <div className="flex items-center ml-2">
                          <button
                            onClick={e => startEditingTab(tab.id, tab.title, e)}
                            className="text-gray-400 hover:text-blue-500 focus:outline-none mr-1"
                            title="Edit tab name"
                            tabIndex={-1}
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        {tabs.length > 1 && (
                          <button
                            onClick={e => deleteTab(tab.id, e)}
                              className="text-gray-400 hover:text-red-500 focus:outline-none"
                            title="Close tab"
                            tabIndex={-1}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        </div>
                      </div>
                    ))}
                    {/* Add Tab Button - Only show when less than 3 tabs */}
                    {tabs.length < 3 && (
                      <button
                        onClick={createNewTab}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-[#513a7a] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-indigo-600 transition flex-shrink-0"
                        title="New Tab"
                        style={{ minWidth: 32 }}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {/* Notes Redirect Button - Show when 3 or more tabs exist */}
                  {tabs.length >= 3 && (
                    <button
                      onClick={() => {
                        // Set localStorage to automatically select NOTES component
                        localStorage.setItem("activeComponent", "NotebookAndSheet");
                        window.location.href = '/search';
                      }}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white transition-colors flex-shrink-0"
                      title="Go to Notes"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {showWarning && (
                  <div className="fixed top-4 right-4 flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-sm shadow-lg z-50 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    <span>Guest users can only create up to {MAX_TABS_FOR_GUEST} tabs. Please log in to create more.</span>
                  </div>
                )}

                <div className="flex flex-col flex-1">
                  <textarea
                    ref={textareaRef}
                    value={tabs.find(t => t.id === activeTabId)?.content || ''}
                    onChange={handleNotesChange}
                    onScroll={handleScroll}
                    className={`hindi-paper ${
                      isAutoColor
                        ? "text-gray-900 dark:text-white auto-lines"
                        : ""
                    }`}
                    style={{
                       height: "250px",
                      marginBottom: "6px",
                      resize: "none",
                      color: isAutoColor ? undefined : textColor,
                      backgroundColor: "transparent",
                      border: `1px solid ${textColor}`,
                      padding: "10px 10px 10px 10px",
                      borderRadius: "2px",
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
              <div className="flex flex-wrap justify-between items-center gap-4">
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
                          ? "bg-red-500 text-white shadow-lg"
                          : "bg-gray-100 dark:bg-[#513a7a] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                        : isListening
                        ? "bg-red-500 text-white shadow-lg"
                        : "bg-opacity-20 bg-gray-500 hover:bg-opacity-30"
                    }`}
                    onClick={toggleSpeechToText}
                    title={isListening ? "Stop Recording" : "Start Recording"}
                    style={
                      !isAutoColor && !isListening
                        ? { color: textColor }
                        : undefined
                    }
                  >
                    {isListening ? (
                      <div className="flex items-center gap-1">
                        <MicOff className="w-5 h-5" />
                        <span className="text-xs font-medium">OFF</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Mic className="w-5 h-5" />
                        <span className="text-xs font-medium">ON</span>
                      </div>
                    )}
                  </button>
                  {/* <button
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
                  </button> */}
                  {/* <button
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
                  </button> */}
                </div>
                <div className="flex justify-between items-center mb-1">
                  <div className="w-full  flex justify-between">
                    <div className="flex items-center gap-2">
                      {renderColorPicker()}
                      <div className="w-9 mr-2 ">
                        <button
                          className={`p-3 rounded-sm transition duration-200 ${
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

NotePage.propTypes = {
  inNotebookSheet: PropTypes.bool,
};

export default NotePage;
