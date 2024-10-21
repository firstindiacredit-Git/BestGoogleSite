import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const defaultPeople = [
  {
    id: 1,
    name: "Youtube",
    designation: "YouTube all Fav",
    image: "youtube.png",
    link: "https://youtube.com/",
  },
  {
    id: 2,
    name: "Gmail",
    designation: "Google All Mails",
    image: "googlemail.png",
    link: "https://mail.google.com/",
  },
  {
    id: 3,
    name: "Github",
    designation: "Github Easy Access",
    image: "github.png",
    link: "https://github.com/",
  },
];

function AnimatedTooltip({ items, handleEdit, handleDelete }) {
  const [menuVisible, setMenuVisible] = useState(null);

  const toggleMenu = (id) => {
    setMenuVisible(menuVisible === id ? null : id);
  };

  return (
    <div className="flex gap-3 mt-2">
      {items.map((person) => (
        <div
          key={person.id}
          className="text-center bg-transparent rounded-lg transition-transform transform hover:scale-105 group relative"
        >
          <a href={person.link} target="_blank" rel="noopener noreferrer">
            <img
              src={`https://logo.clearbit.com/${new URL(person.link).hostname}`} // Fixed variable reference
              alt={person.name}
              className="w-7 h-7 mx-auto rounded-[50%] transition-transform duration-300 transform hover:scale-110 hover:shadow-lg"
              
            />
          </a>
          <h3 className="text-md font-semibold mb-2 w-16 mt-2 transition-all duration-300 transform group-hover:translate-y-1 group-hover:translate-x-1">
            {person.name}
          </h3>

          <div className="absolute top-6 right-[-2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button onClick={() => toggleMenu(person.id)} className="font-bold">
              ⋮
            </button>

            {menuVisible === person.id && (
              <div className="absolute  bg-white/30 right-2 top-0 backdrop-blur border rounded shadow-md text-left">
                <button
                  className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-200"
                  onClick={() => {
                    toggleMenu(null);
                    handleEdit(person);
                  }}
                >
                  Edit
                </button>
                <button
                  className="block w-full text-left px-2 py-1 text-sm text-red-500 hover:bg-gray-200"
                  onClick={() => {
                    toggleMenu(null);
                    handleDelete(person.id);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnimatedTooltipPreview() {
  const [people, setPeople] = useState(defaultPeople);
  const [newBookmark, setNewBookmark] = useState({ name: "", link: "" });
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingBookmarkId, setEditingBookmarkId] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null); // Reset user ID if no user is logged in
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (userId) {
        try {
          const bookmarksSnapshot = await getDocs(
            collection(db, "users", userId, "bookmarks")
          );
          const bookmarksData = bookmarksSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setPeople((prev) => [...defaultPeople, ...bookmarksData]);
        } catch (error) {
          console.error("Error fetching bookmarks:", error);
        }
      }
    };

    fetchBookmarks();
  }, [userId]);

  const saveBookmark = async () => {
    if (userId && newBookmark.name && newBookmark.link) {
      try {
        if (editMode) {
          await updateDoc(
            doc(db, "users", userId, "bookmarks", editingBookmarkId),
            {
              name: newBookmark.name,
              link: newBookmark.link,
            }
          );
          // Update the local state after editing
          setPeople((prevPeople) =>
            prevPeople.map((bookmark) =>
              bookmark.id === editingBookmarkId
                ? {
                    ...bookmark,
                    name: newBookmark.name,
                    link: newBookmark.link,
                  }
                : bookmark
            )
          );
        } else {
          const newBookmarkRef = await addDoc(
            collection(db, "users", userId, "bookmarks"),
            {
              name: newBookmark.name,
              link: newBookmark.link,
              image: "default.png", // Consider updating this to dynamically fetch images
            }
          );
          const addedBookmark = {
            id: newBookmarkRef.id,
            name: newBookmark.name,
            link: newBookmark.link,
            image: "default.png", // Same here
          };
          setPeople((prevPeople) => [...prevPeople, addedBookmark]);
        }
        setNewBookmark({ name: "", link: "" });
        setShowForm(false);
        setEditMode(false);
        setEditingBookmarkId(null);
      } catch (error) {
        console.error("Error saving bookmark:", error);
      }
    } else {
      alert("Please fill in both fields."); // Alert if fields are empty
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", userId, "bookmarks", id));
      setPeople((prevPeople) =>
        prevPeople.filter((person) => person.id !== id)
      );
    } catch (error) {
      console.error("Error deleting bookmark:", error);
    }
  };

  const handleEdit = (bookmark) => {
    setNewBookmark({ name: bookmark.name, link: bookmark.link });
    setEditingBookmarkId(bookmark.id);
    setEditMode(true);
    setShowForm(true);
  };

  return (
    <div className="flex flex-col items-center mt-2 justify-center mb-10 w-full">
      <AnimatedTooltip
        items={people}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center mt-4"
      >
        +
      </button>

      {showForm && (
        <div className="mt-4 flex flex-col items-center">
          <input
            type="text"
            placeholder="Bookmark Name"
            value={newBookmark.name}
            onChange={(e) =>
              setNewBookmark({ ...newBookmark, name: e.target.value })
            }
            className="p-2 mb-2 border rounded"
          />
          <input
            type="text"
            placeholder="Bookmark Link"
            value={newBookmark.link}
            onChange={(e) =>
              setNewBookmark({ ...newBookmark, link: e.target.value })
            }
            className="p-2 mb-2 border rounded"
          />
          <button
            onClick={saveBookmark}
            className="bg-green-500 text-white rounded-full w-20 h-8 flex items-center justify-center"
          >
            {editMode ? "Update" : "Add"}
          </button>
        </div>
      )}
    </div>
  );
}
