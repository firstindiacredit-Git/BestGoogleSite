import { BsThreeDotsVertical } from "react-icons/bs";
import React, { useState, useEffect, useRef } from "react";
import {
  doc,
  collection,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { MdDeleteOutline } from "react-icons/md";
import { CiEdit } from "react-icons/ci";

const NotepadWithLines = () => {
  const [note, setNote] = useState("");
  const [history, setHistory] = useState([]);
  const [notes, setNotes] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [format, setFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  });
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(
    localStorage.getItem("notepadBackgroundColor") || "#FDF8C8"
  );
  const [showColorPicker, setShowColorPicker] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchNotes(currentUser.uid);
      } else {
        setNotes([]);
        setHistory([]);
      }
    });
    return () => unsubscribe();
  }, []);

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
    
  ];


  useEffect(() => {
    localStorage.setItem("notepadBackgroundColor", backgroundColor);
  }, [backgroundColor]);

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
      setError("Error fetching notes: " + err.message);
    }
  };

  const handleBackgroundColorChange = (e) => {
    const color = e.target.value;
    setBackgroundColor(color);
    saveBackgroundColor(color);
  };

  const saveBackgroundColor = async (color) => {
    if (!user) return;
    try {
      const userDoc = doc(db, "users", user.uid);
      await setDoc(userDoc, { backgroundColor: color }, { merge: true });
    } catch (err) {
      setError("Error saving background color: " + err.message);
    }
  };

  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };

  const saveNote = async () => {
    if (!note.trim()) return; // Prevent saving blank text

    if (!user) {
      alert("Please log in to save notes.");
      return;
    }

    try {
      if (editingIndex !== null) {
        const noteToUpdate = notes[editingIndex];
        const noteRef = doc(db, "users", user.uid, "notes", noteToUpdate.id);
        await updateDoc(noteRef, { text: note });
        const updatedNotes = notes.map((n, index) =>
          index === editingIndex ? { ...n, text: note } : n
        );
        setNotes(updatedNotes);
        setHistory(updatedNotes.map((n) => n.text));
        setEditingIndex(null);
      } else {
        const newNote = { text: note };
        const docRef = await addDoc(
          collection(db, "users", user.uid, "notes"),
          newNote
        );
        setNotes((prev) => [...prev, { id: docRef.id, ...newNote }]);
        setHistory((prev) => [...prev, note]);
      }
      setNote("");
    } catch (err) {
      setError("Error saving note: " + err.message);
    }
  };

  const deleteNote = async (id) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "notes", id));
      setNotes((prev) => prev.filter((note) => note.id !== id));
      setHistory((prev) =>
        prev.filter((text) => text !== notes.find((n) => n.id === id)?.text)
      );
    } catch (err) {
      setError("Error deleting note: " + err.message);
    }
  };
  
  const handleColorSelection = (color) => {
    setBackgroundColor(color);
  };



  const editHistoryNote = (index) => {
    setNote(history[index]);
    const editingNote = notes.find((note) => note.text === history[index]);
    setEditingIndex(notes.indexOf(editingNote));
    setShowHistoryModal(false);
  };

  const deleteHistoryNote = async (index) => {
    const noteToDelete = notes.find((note) => note.text === history[index]);
    if (noteToDelete) {
      await deleteNote(noteToDelete.id);
    }
  };
  const menuRef = useRef(null); 

   useEffect(() => {
     const handleClickOutside = (event) => {
       if (menuRef.current && !menuRef.current.contains(event.target)) {
         setShowColorPicker(false);
       }
     };

     document.addEventListener("mousedown", handleClickOutside);
     return () => {
       document.removeEventListener("mousedown", handleClickOutside);
     };
   }, []);

  return (
    <div
      className="w-[101%] mt-1 border p-4 rounded-lg shadow-md"
      style={{ backgroundColor }}
    >
      <h3 className="text-lg font-semibold mb-2 flex justify-between items-center">
        Notes
        <div className="relative">
          <button
            onClick={() => setShowColorPicker((prev) => !prev)}
            className="p-2 bg-transparent rounded-full hover:bg-gray-300 focus:outline-none"
          >
            <BsThreeDotsVertical className="text-xl cursor-pointer" />
          </button>
          {showColorPicker && (
            <div
              ref={menuRef}
              className="absolute space-x-1 w-64 left-0 -mt-2 bg-white border rounded shadow-lg p-4"
            >
              {colorPalette.map((color) => (
                <button
                  key={color}
                  className={`w-5 h-5 border-1  transition-all duration-200 ${
                    backgroundColor === color
                      ? "border-black" // Black border for the selected color
                      : "border-gray-700" // Default light gray border
                  } hover:border-gray-500 focus:outline `}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelection(color)}
                  aria-label={`Select ${color} as background color`}
                  title={`Select ${color}`}
                />
              ))}
              <label className="block mb-2 text-sm font-medium">
                Choose Background Color:
              </label>
              <input
                type="color"
                value={backgroundColor || "#ffffff"}
                onChange={handleBackgroundColorChange}
                className="w-full cursor-pointer border border-gray-300 rounded"
              />
            </div>
          )}
        </div>
      </h3>
      <textarea
        value={note}
        onChange={handleNoteChange}
        placeholder="Start writing..."
        className="w-full h-32 p-1 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500"
        style={{
          backgroundColor: backgroundColor || "#fff", 
          backgroundImage: `linear-gradient(to bottom, transparent 95%, #d3d3d3 95%, #d3d3d3 100%)`,
          backgroundSize: "100% 24px", 
          lineHeight: "24px", 
        }}
      />

      <div className="flex justify-between mt-3">
        <button
          onClick={saveNote}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Save
        </button>
        <button
          onClick={() => setShowHistoryModal(true)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          History
        </button>
      </div>

      {showHistoryModal && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-2/3 max-h-3/4 overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-4">History</h2>
            <ul className="space-y-4">
              {history.map((note, index) => (
                <li
                  key={index}
                  className="text-black border-b pb-2 flex justify-between items-center"
                >
                  <span>{note}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => editHistoryNote(index)}
                      className="px-3 py-1 text-black hover:text-blue-600"
                    >
                      <CiEdit />
                    </button>
                    <button
                      onClick={() => deleteHistoryNote(index)}
                      className="px-3 py-1 text-black hover:text-red-600"
                    >
                      <MdDeleteOutline />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowHistoryModal(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default NotepadWithLines;
