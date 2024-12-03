import React, { useState, useEffect } from "react";
import { IoIosMic, IoIosMicOff } from "react-icons/io";
import { MdDeleteSweep, MdOutlineHistory } from "react-icons/md";
import { db } from "../firebase"; // Firebase setup
import { collection, getDocs, addDoc, deleteDoc } from "firebase/firestore"; // Firestore functions
import { IoIosColorPalette } from "react-icons/io";

const Notebook = ({ user }) => {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(16); // Font size state
  const [isListening, setIsListening] = useState(false);
  const [notes, setNotes] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false); // History modal state
  const [bgColor, setBgColor] = useState("#ffffff"); // Background color state
  const [textColor, setTextColor] = useState("#000000"); // Text color state
  const [isBold, setIsBold] = useState(false); // Bold text state
  const [isItalic, setIsItalic] = useState(false);
   const [showMenu, setShowMenu] = useState(false);
   const [showColorPicker, setShowColorPicker] = useState({
     background: false,
     text: false,
   });

  useEffect(() => {
    if (user) {
      fetchNotes(user.uid);
    }
  }, [user]);

  const colorPalette = [
    // Row 1
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
    "#FFD700",
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
    "#FF4500",
    "#FFA500",
    "#FFD700",
    "#32CD32",
    "#20B2AA",
    "#4169E1",
    "#8A2BE2",
    "#9370DB",
    "#FF69B4",
    // Row 5
    "#800000",
    "#D2691E",
    "#DAA520",
    "#808000",
    "#006400",
    "#008080",
    "#000080",
    "#4B0082",
    "#800080",
    "#C71585",
  ];

  const renderColorPalette = (onSelect) => (
    <div style={{ display: "flex", flexWrap: "wrap", marginTop: "10px" }}>
      {colorPalette.map((color) => (
        <button
          key={color}
          onClick={() => onSelect(color)}
          style={{
            backgroundColor: color,
            width: "20px",
            height: "20px",
            margin: "2px",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        />
      ))}
    </div>
  );

  const fetchNotes = async (userId) => {
    try {
      const notesCollection = collection(db, "users", userId, "notes");
      const notesSnapshot = await getDocs(notesCollection);
      const notesList = notesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(notesList);
      setHistory(notesList.map((note) => note.text));
    } catch (err) {
      console.error("Error fetching notes:", err.message);
    }
  };

  const saveText = async () => {
    try {
      const newNote = { text, fontSize, bgColor, textColor, isBold, isItalic };
      const docRef = await addDoc(
        collection(db, "users", user.uid, "notes"),
        newNote
      );
      setNotes((prev) => [...prev, { id: docRef.id, ...newNote }]);
      setHistory((prev) => [...prev, text]);
      setText(""); // Clear input field after saving
    } catch (err) {
      console.error("Error saving note:", err.message);
    }
  };

  const deleteNote = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "notes", id));
      setNotes((prev) => prev.filter((note) => note.id !== id));
      setHistory((prev) =>
        prev.filter((text) => text !== notes.find((n) => n.id === id)?.text)
      );
    } catch (err) {
      console.error("Error deleting note:", err.message);
    }
  };

  const startSpeechRecognition = () => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const recognition = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setText(transcript);
      };
      recognition.start();
      setIsListening(true);
    }
  };

  const stopSpeechRecognition = () => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const recognition = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
      recognition.stop();
      setIsListening(false);
    }
  };

  const showHistory = () => {
    setShowHistoryModal(true);
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
  };

  const toggleBold = () => {
    setIsBold(!isBold);
  };

  const toggleItalic = () => {
    setIsItalic(!isItalic);
  };
   

  return (
    <div
      style={{
        backgroundColor: bgColor,
        minHeight: "100vh",
        padding: "20px",
        color: textColor,
      }}
    >
      <h1 className="text-2xl text-center">Notebook</h1>

      {/* Icons and Options */}
      <div style={{ marginBottom: "20px" }}>
        <button
          className="border p-1 rounded-lg px-4"
          onClick={startSpeechRecognition}
          disabled={isListening}
          style={{ marginRight: "10px" }}
        >
          <IoIosMic size={24} />
        </button>
        <button
          className="border p-1 rounded-lg px-4"
          onClick={stopSpeechRecognition}
          disabled={!isListening}
          style={{ marginRight: "10px" }}
        >
          <IoIosMicOff size={24} style={{ opacity: 0.5 }} />
        </button>
        <button
          className="border p-1 rounded-lg px-4"
          onClick={() => setText("")}
          style={{ marginRight: "10px" }}
        >
          <MdDeleteSweep size={24} />
        </button>
        <button
          className="border p-1 rounded-lg px-4"
          onClick={showHistory}
          style={{ marginRight: "10px" }}
        >
          <MdOutlineHistory size={24} />
        </button>
        {/* Style Buttons */}

        <button onClick={toggleBold} className="border p-1 rounded-lg px-4">
          {isBold ? "Unbold" : "Bold"}
        </button>
        <button
          onClick={toggleItalic}
          className="border p-1 rounded-lg px-4"
          style={{ marginLeft: "10px" }}
        >
          {isItalic ? "Unitalic" : "Italic"}
        </button>
      </div>

      {/* Text Area */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          backgroundColor: bgColor,
          color: textColor,
          width: "100%",
          height: "200px",
          fontSize: `${fontSize}px`,
          fontFamily: "Courier, monospace",
          lineHeight: "1.5",
          border: "1px solid #ccc",
          borderRadius: "5px",
          fontWeight: isBold ? "bold" : "normal",
          fontStyle: isItalic ? "italic" : "normal",
        }}
      />

      {/* Font Size Slider */}
      <div style={{ marginTop: "20px" }}>
        {/* Color Customization Button */}
        <button
          onClick={() => setShowMenu((prev) => !prev)}
          className="border p-2 rounded-lg flex items-center"
          style={{ marginBottom: "20px" }}
        >
          <IoIosColorPalette size={24} />
          <span style={{ marginLeft: "1px" }}></span>
        </button>

        {/* Menu for Background and Text Color */}
        {showMenu && (
          <div className="menu flex flex-row items-start gap-4 bg-gray-200 p-4 rounded-lg">
            {/* Background Color Button and Palette */}
            <div className="flex flex-col items-start">
              <button
                onClick={() =>
                  setShowColorPicker((prev) => ({
                    ...prev,
                    background: !prev.background,
                  }))
                }
                className="border p-2 rounded-lg"
              >
                Background Color
              </button>
              {showColorPicker.background && (
                <div className="mt-2">
                  <h4 className="text-sm font-semibold">
                    Choose Background Color:
                  </h4>
                  {renderColorPalette(setBgColor)}
                </div>
              )}
            </div>

            {/* Text Color Button and Palette */}
            <div className="flex flex-col items-start">
              <button
                onClick={() =>
                  setShowColorPicker((prev) => ({
                    ...prev,
                    text: !prev.text,
                  }))
                }
                className="border p-2 rounded-lg"
              >
                Text Color
              </button>
              {showColorPicker.text && (
                <div className="mt-2">
                  <h4 className="text-sm font-semibold">Choose Text Color:</h4>
                  {renderColorPalette(setTextColor)}
                </div>
              )}
            </div>
          </div>
        )}

        <h3>Font Size:</h3>
        <input
          type="range"
          min="10"
          max="30"
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
        />
      </div>

      {/* Save Note Button */}
      <button
        onClick={saveText}
        className="mt-4 p-2 bg-blue-500 text-white rounded-lg"
      >
        Save Note
      </button>

      {/* Notes List */}
      <div>
        {notes.map((note) => (
          <div key={note.id} className="p-4 my-2 bg-gray-200 rounded-lg">
            <p
              style={{
                fontSize: note.fontSize,
                fontWeight: note.isBold ? "bold" : "normal",
                fontStyle: note.isItalic ? "italic" : "normal",
                color: note.textColor,
                backgroundColor: note.bgColor,
              }}
            >
              {note.text}
            </p>
            <button onClick={() => deleteNote(note.id)}>Delete</button>
          </div>
        ))}
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "#fff",
            padding: "20px",
            overflowY: "scroll",
          }}
        >
          <h2>History</h2>
          <button
            className="border p-1 rounded-lg"
            onClick={closeHistoryModal}
            style={{ position: "absolute", top: "10px", right: "10px" }}
          >
            Close
          </button>
          <div>
            <ul>
              {history.map((entry, index) => (
                <li key={index}>{entry}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notebook;
