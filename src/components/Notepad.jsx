import React, { useEffect, useState } from "react";
import {
  doc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase"; // Adjust import to your firebase setup
import { getAuth } from "firebase/auth"; // Import Firebase Auth

function Notepad() {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  const auth = getAuth(); // Get Firebase Auth
  const user = auth.currentUser; // Get the current user

  // Load notes from Firestore when component mounts or user changes
  useEffect(() => {
    const fetchNotes = async () => {
      if (user) {
        try {
          const notesCollection = collection(db, "users", user.uid, "notes");
          const notesSnapshot = await getDocs(notesCollection);
          const notesList = notesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setNotes(notesList);
        } catch (err) {
          setError("Error fetching notes: " + err.message);
        }
      } else {
        setNotes([]); // Clear notes if user is not logged in
      }
    };

    fetchNotes();
  }, [user]); // Depend on user to fetch notes when it changes

  // Handle note input change
  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };

  // Save or update a note
  const saveNote = async () => {
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
        setHistory((prev) => [...prev, note]);
        setEditingIndex(null);
      } else {
        // Add new note
        if (note.trim()) {
          const newNote = { text: note };
          const docRef = await addDoc(
            collection(db, "users", user.uid, "notes"),
            newNote
          );
          setNotes((prev) => [...prev, { id: docRef.id, ...newNote }]);
          setHistory((prev) => [...prev, note]);
        }
      }
      setNote(""); // Clear the textarea
    } catch (error) {
      console.error("Error saving note: ", error);
      setError("Error saving note: " + error.message);
    }
  };

  // Edit note
  const editNote = (index) => {
    setNote(notes[index].text);
    setEditingIndex(index);
  };

  // Delete note
  const deleteNote = async (id) => {
    if (user) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "notes", id));
        setNotes(notes.filter((note) => note.id !== id));
      } catch (error) {
        console.error("Error deleting note: ", error);
        setError("Error deleting note: " + error.message);
      }
    }
  };

  // Delete a note from history
  const deleteHistoryNote = (noteIndex) => {
    const updatedHistory = history.filter((_, i) => i !== noteIndex);
    setHistory(updatedHistory);
  };

  // Edit a note from history
  const editHistoryNote = (noteIndex) => {
    const noteToEdit = history[noteIndex];
    setNote(noteToEdit);
    setEditingIndex(null);
  };

  return (
    <div className="bg-transparent p-8 mb-4 flex">
      <div className="bg-white/30 backdrop-blur-lg border shadow-2xl my-4 rounded-lg p-6 w-[35%] h-[8%]">
        <h2 className="text-xl font-semibold mb-4">Notepad</h2>
        {error && <p className="text-red-500">{error}</p>}{" "}
        {/* Display error messages */}
        <textarea
          value={note}
          onChange={handleNoteChange}
          placeholder="Write your notes here..."
          rows="4"
          className="border border-gray-300 p-2 rounded-xl bg-transparent w-full mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-between mb-4">
          <button
            onClick={saveNote}
            className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition duration-200"
          >
            {editingIndex !== null ? "Update Note" : "Save Note"}
          </button>
        </div>
        <h3 className="text-lg font-semibold mb-2">Notes List</h3>
        <ul>
          {notes.map((note, index) => (
            <li key={note.id} className="flex justify-between mb-2">
              <span>{note.text}</span>
              <div>
                <button
                  onClick={() => editNote(index)}
                  className="bg-yellow-500 text-white rounded px-2 py-1 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="bg-red-500 text-white rounded px-2 py-1"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
        {editingIndex !== null && (
          <div className="mt-4">
            <button
              onClick={() => setEditingIndex(null)}
              className="bg-gray-500 text-white rounded px-4 py-2"
            >
              Cancel Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notepad;
