import { BsThreeDotsVertical } from "react-icons/bs";
import React, { useState, useEffect } from "react";
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
import { db } from "../firebase"; // Firebase configuration
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { MdDeleteOutline } from "react-icons/md";
import { CiEdit } from "react-icons/ci";

const NotepadWithLines = () => {
  const [note, setNote] = useState("");
  const [history, setHistory] = useState([]); // History state for user's notes
  const [notes, setNotes] = useState([]); // State for fetched notes
  const [editingIndex, setEditingIndex] = useState(null); // Track index of note being edited
  const [format, setFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  });
  const [user, setUser] = useState(null); // Track logged-in user
  const [error, setError] = useState("");
  const [showHistoryModal, setShowHistoryModal] = useState(false);
   const [backgroundColor, setBackgroundColor] = useState("#FFFFF0"); // Default color
   const [showColorPicker, setShowColorPicker] = useState(false);

  const auth = getAuth();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchNotes(currentUser.uid);
         await fetchBackgroundColor(currentUser.uid);
      } else {
        setNotes([]);
        setHistory([]);
        setBackgroundColor("#FFFFF0");
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  // Fetch notes for the logged-in user
  const fetchNotes = async (userId) => {
    try {
      const notesCollection = collection(db, "users", userId, "notes");
      const notesSnapshot = await getDocs(notesCollection);
      const notesList = notesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(notesList);
      setHistory(notesList.map((note) => note.text)); // Populate history with note texts
    } catch (err) {
      setError("Error fetching notes: " + err.message);
    }
  };

  const fetchBackgroundColor = async (userId) => {
    try {
      const userDoc = doc(db, "users", userId);
      const docSnapshot = await getDoc(userDoc);
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setBackgroundColor(data.backgroundColor || "#F9FB99");
      }
    } catch (err) {
      setError("Error fetching background color: " + err.message);
    }
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

   const handleBackgroundColorChange = (e) => {
     const color = e.target.value;
     setBackgroundColor(color);
     saveBackgroundColor(color);
   };

  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };

  const toggleFormat = (type) => {
    setFormat((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const applyStyle = () => {
    let style = {};
    if (format.bold) style.fontWeight = "bold";
    if (format.italic) style.fontStyle = "italic";
    if (format.underline) style.textDecoration = "underline";
    if (format.strikethrough) style.textDecoration = "line-through";
    return style;
  };

  const saveNote = async () => {
    if (!user) {
      alert("Please log in to save notes.");
      return;
    }

    try {
      if (editingIndex !== null) {
        // Update existing note
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
        // Add new note
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

  const editHistoryNote = (index) => {
    setNote(history[index]);
    const editingNote = notes.find((note) => note.text === history[index]);
    setEditingIndex(notes.indexOf(editingNote));
    setShowHistoryModal(false); // Close the modal while editing
  };

  const deleteHistoryNote = async (index) => {
    const noteToDelete = notes.find((note) => note.text === history[index]);
    if (noteToDelete) {
      await deleteNote(noteToDelete.id);
    }
  };

  return (
    <div
      className="w-[101%] mt-1 border bg-yellow-100 p-4 rounded-lg shadow-md"
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
            <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg p-4">
              <label className="block mb-2 text-sm font-medium">
                Choose Background Color:
              </label>
              <input
                type="color"
                value={backgroundColor}
                onChange={handleBackgroundColorChange}
                className="w-full h-10 cursor-pointer border border-gray-300 rounded"
              />
            </div>
          )}
        </div>
      </h3>
      <div className="flex gap-2 mb-3">
        <button
          className={`p-2 border rounded ${
            format.bold ? "bg-gray-300 font-bold" : "bg-white"
          }`}
          onClick={() => toggleFormat("bold")}
        >
          B
        </button>
        <button
          className={`p-2 border rounded ${
            format.italic ? "bg-gray-300 italic" : "bg-white"
          }`}
          onClick={() => toggleFormat("italic")}
        >
          I
        </button>
        <button
          className={`p-2 border rounded ${
            format.underline ? "bg-gray-300 underline" : "bg-white"
          }`}
          onClick={() => toggleFormat("underline")}
        >
          U
        </button>
        <button
          className={`p-2 border rounded ${
            format.strikethrough ? "bg-gray-300 line-through" : "bg-white"
          }`}
          onClick={() => toggleFormat("strikethrough")}
        >
          S
        </button>
      </div>
      <textarea
        value={note}
        onChange={handleNoteChange}
        style={applyStyle()}
        placeholder="Start writing..."
        className="w-full h-32 p-2 bg-yellow-50 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500 bg-[linear-gradient(to_bottom,#eaeaea_1px,transparent_1px)] bg-[length:100%_20px]"
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

      {/* History Modal */}
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
                      className="px-3 py-1  text-white rounded hover:bg-blue-600"
                    >
                      <CiEdit className="text-black" />
                    </button>
                    <button
                      onClick={() => deleteHistoryNote(index)}
                      className="px-3 py-1 text-white rounded hover:bg-red-600"
                    >
                      <MdDeleteOutline className="text-black" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowHistoryModal(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-gray-600"
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
