import React, { useState, useRef, useEffect } from 'react';
import { FaPalette, FaDownload, FaBold, FaUnderline, FaMinus, FaPlus, FaTrash, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import CustomColorPicker from './CustomColorPicker';

const NotePage = () => {
  const [notes, setNotes] = useState('');
  const [noteColor, setNoteColor] = useState('#fff3cd');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [isListening, setIsListening] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(true);

  const noteRef = useRef(null);

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    const savedColor = localStorage.getItem('noteColor');
    if (savedNotes) setNotes(savedNotes);
    if (savedColor) setNoteColor(savedColor);
  }, []);

  useEffect(() => {
    localStorage.setItem('notes', notes);
    localStorage.setItem('noteColor', noteColor);
  }, [notes, noteColor]);

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
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
    return notes.split('\n').length;
  };

  return (
    <div className=" mx-auto px-4 py-8">
      <div className=" mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-6 transition-colors duration-200" style={{ backgroundColor: noteColor }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">NotePage</h2>
              <div className="flex items-center space-x-2">
                <button
                  className="p-2 rounded-lg hover:bg-white/20 transition duration-200"
                  onClick={toggleLineNumbers}
                  title="Toggle Line Numbers"
                >
                  {lineNumbers ? "Hide Lines" : "Show Lines"}
                </button>
                <button
                  className="p-2 rounded-lg hover:bg-white/20 transition duration-200"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  title="Change background color"
                >
                  <FaPalette className="w-5 h-5" />
                </button>
                {showColorPicker && (
                  <div className="absolute mt-2 right-0">
                    <CustomColorPicker
                      color={noteColor}
                      onChange={setNoteColor}
                      onClose={() => setShowColorPicker(false)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4" ref={noteRef}>
              {lineNumbers && (
                <div className="text-gray-500 text-right pr-2 select-none" style={{ fontSize: `${fontSize}px` }}>
                  {Array.from({ length: getLineCount() }, (_, i) => i + 1).map((num) => (
                    <div key={num}>{num}</div>
                  ))}
                </div>
              )}
              <textarea
                value={notes}
                onChange={handleNotesChange}
                className="w-full h-96 p-4 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                style={{
                  resize: "vertical",
                  backgroundColor: "transparent",
                  fontSize: `${fontSize}px`,
                  fontWeight: isBold ? "bold" : "normal",
                  textDecoration: isUnderline ? "underline" : "none",
                }}
                placeholder="Start typing your notes here..."
              />
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4 mt-6">
              <div className="flex items-center space-x-3">
                <button
                  className={`p-3 rounded-lg transition duration-200 ${
                    isBold 
                      ? "bg-blue-500 text-white" 
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                  onClick={toggleBold}
                  title="Toggle Bold"
                >
                  <FaBold className="w-5 h-5" />
                </button>
                <button
                  className={`p-3 rounded-lg transition duration-200 ${
                    isUnderline 
                      ? "bg-blue-500 text-white" 
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                  onClick={toggleUnderline}
                  title="Toggle Underline"
                >
                  <FaUnderline className="w-5 h-5" />
                </button>
                <button
                  className={`p-3 rounded-lg transition duration-200 ${
                    isListening 
                      ? "bg-red-500 text-white" 
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                  onClick={toggleSpeechToText}
                  title="Toggle Speech-to-Text"
                >
                  {isListening ? <FaMicrophoneSlash className="w-5 h-5" /> : <FaMicrophone className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition duration-200 disabled:opacity-50"
                  onClick={() => handleFontSizeChange(fontSize - 1)}
                  disabled={fontSize <= 8}
                >
                  <FaMinus className="w-5 h-5" />
                </button>
                <span className="text-lg font-medium">
                  {fontSize}
                </span>
                <button
                  className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition duration-200 disabled:opacity-50"
                  onClick={() => handleFontSizeChange(fontSize + 1)}
                  disabled={fontSize >= 32}
                >
                  <FaPlus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  className="p-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition duration-200"
                  onClick={() => setNotes("")}
                  title="Clear notes"
                >
                  <FaTrash className="w-5 h-5" />
                </button>
                <button
                  className="p-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition duration-200"
                  onClick={downloadNotes}
                  title="Download notes"
                >
                  <FaDownload className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotePage;
