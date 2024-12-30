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

const NotePage = ({ data = "" }) => {
  const [notes, setNotes] = useState(typeof data === 'string' ? data : '');
  const [isBold, setIsBold] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [isListening, setIsListening] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

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
    const savedBackground = localStorage.getItem("noteBackground");
    const savedLineColor = localStorage.getItem("lineColor");

    if (typeof data === 'string' && data.length > 0) {
      setNotes(data);
    } else if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        setNotes(typeof parsedNotes === 'string' ? parsedNotes : '');
      } catch (e) {
        setNotes(savedNotes); // If parsing fails, use as-is
      }
    }

    if (savedBackground) setBackgroundColor(savedBackground);
    if (savedLineColor) setLineColor(savedLineColor);
  }, [data]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorPickerRef.current && 
        !colorPickerRef.current.contains(event.target) &&
        event.target.type !== 'color'  
      ) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
    localStorage.setItem("backgroundColor", backgroundColor);
  }, [notes, backgroundColor]);

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
    return isColorDark(backgroundColor) ? "#ffffff" : "#000000";
  };

  const getLineColor = () => {
    return isColorDark(backgroundColor)
      ? "rgba(255, 255, 255, 0.2)"
      : "rgba(0, 0, 0, 0.1)";
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
    return (typeof notes === 'string' ? notes : '').split("\n").length;
  };

  const textColor = getTextColor();
  const lineColor = getLineColor();

  return (
    <div>
      <div>
        <div className="overflow-hidden" style={{ backgroundColor }}>
          <div className="p-2" style={{ backgroundColor }}>
            <div className="flex justify-between items-center mb-1">
              <div className=" w-full flex justify-between">
                <button
                  className="p-2 rounded-lg bg-opacity-20 bg-gray-500 hover:bg-opacity-30 transition duration-200"
                  onClick={toggleLineNumbers}
                  title="Toggle Line Numbers"
                  style={{ color: textColor }}
                >
                  {lineNumbers ? (
                    <RxHamburgerMenu />
                  ) : (
                    <HiOutlineNumberedList />
                  )}
                </button>
                <div className="relative" ref={colorPickerRef}>
                  <button
                    className="p-2 rounded-lg bg-opacity-20 bg-gray-500 hover:bg-opacity-30 transition duration-200"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    title="Change Background Color"
                    style={{ color: textColor }}
                  >
                    <Palette className="w-5 h-5" />
                  </button>
                  {showColorPicker && (
                    <div className="absolute w-48 right-0 z-50 bg-white border rounded shadow-lg p-3">
                      <div className="grid grid-cols-7 gap-1">
                        {predefinedColors.map((color) => (
                          <button
                            key={color}
                            className="w-5 h-5 border border-gray-200 cursor-pointer transition duration-300 ease-in-out transform hover:scale-125 focus:outline-none"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              setBackgroundColor(color);
                              setShowColorPicker(false);
                            }}
                          />
                        ))}
                      </div>

                      {/* Custom Color Picker */}
                      <div className="mt-1 flex items-center justify-center">
                        <input
                          id="customColorPicker"
                          type="color"
                          value={backgroundColor}
                          className="w-full h-6 p-0 border border-gray-300 rounded-md cursor-pointer focus:outline-none"
                          onChange={(e) => {
                            setBackgroundColor(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex">
              {lineNumbers && (
                <div
                  ref={lineNumberRef}
                  className="text-right pr-2 overflow-hidden h-[345px]"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: "3",
                    color: textColor,
                  }}
                >
                  {Array.from({ length: getLineCount() }, (_, i) => i + 1).map(
                    (line) => (
                      <div key={line} style={{ height: `${fontSize * 2.3}px` }}>
                        {line}
                      </div>
                    )
                  )}
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={notes}
                onChange={handleNotesChange}
                onScroll={handleScroll}
                className="hindi-paper"
                style={{
                  height: "350px",
                  marginBottom: "20px",
                  resize: "none",
                  color: textColor,
                  backgroundColor: "transparent",
                  border: "1px solid #6c757d",
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
                  backgroundImage: `linear-gradient(to bottom,transparent 30px,${lineColor} 31px,transparent 49px)`,
                  placeholderColor:textColor
                }}
                placeholder="Start typing your notes here..."
              />
              <style>
                {`
                    .hindi-paper {
                      background-image: linear-gradient(to bottom, transparent 30px, rgba(0, 0, 0, 0.1) 31px, transparent 49px);
                      background-size: 100% 32px;
                      background-position-y: -1px;
                      line-height: 20px;
                      padding: 0 8px;
                      overflow-y: scroll;
                      scrollbar-width: none; /* Firefox */
                    }

                    .hindi-paper::-webkit-scrollbar {
                      display: none; /* Chrome, Safari, and Edge */
                    }
                  `}
              </style>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4 mt-6">
              <div className="flex items-center space-x-3">
                <button
                  className={`p-3 rounded-lg transition duration-200 ${
                    isBold
                      ? "bg-blue-500 text-white"
                      : "bg-opacity-20 bg-gray-500 hover:bg-opacity-30"
                  }`}
                  onClick={toggleBold}
                  title="Toggle Bold"
                  style={{ color: isBold ? "white" : textColor }}
                >
                  <Bold className="w-5 h-5" />
                </button>
                <button
                  className={`p-3 rounded-lg transition duration-200 ${
                    isUnderline
                      ? "bg-blue-500 text-white"
                      : "bg-opacity-20 bg-gray-500 hover:bg-opacity-30"
                  }`}
                  onClick={toggleUnderline}
                  title="Toggle Underline"
                  style={{ color: isUnderline ? "white" : textColor }}
                >
                  <Underline className="w-5 h-5" />
                </button>
                <button
                  className={`p-3 rounded-lg transition duration-200 ${
                    isListening
                      ? "bg-red-500 text-white"
                      : "bg-opacity-20 bg-gray-500 hover:bg-opacity-30"
                  }`}
                  onClick={toggleSpeechToText}
                  title="Toggle Speech-to-Text"
                  style={{ color: isListening ? "white" : textColor }}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
                <button
                  className="p-3 rounded-lg bg-opacity-20 bg-gray-500 hover:bg-opacity-30 transition duration-200"
                  onClick={() => setShowHistory(!showHistory)}
                  title="Show History"
                  style={{ color: textColor }}
                >
                  <History className="w-5 h-5" />
                </button>
              </div>
              <button
                className="p-3 rounded-lg bg-opacity-20 bg-gray-500 hover:bg-opacity-30 transition duration-200"
                onClick={downloadNotes}
                title="Download Notes"
                style={{ color: textColor }}
              >
                <Download className="w-5 h-5" />
              </button>
            </div>

            {showHistory && (
              <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-md">
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
