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
              src={`https://logo.clearbit.com/${new URL(person.link).hostname}`}
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
              <div className="absolute bg-white/30 right-2 top-0 backdrop-blur border rounded shadow-md text-left">
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
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingBookmarkId, setEditingBookmarkId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cachedBookmarks, setCachedBookmarks] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);

        if (!cachedBookmarks.length) {
          try {
            const bookmarksSnapshot = await getDocs(
              collection(db, "users", user.uid, "addbookmarks")
            );
            const bookmarksData = bookmarksSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            setPeople([...defaultPeople, ...bookmarksData]);
            setCachedBookmarks(bookmarksData);
          } catch (error) {
            console.error("Error fetching bookmarks:", error);
            setErrorMessage("Failed to fetch bookmarks. Please try again.");
          }
        }
      } else {
        setUserId(null);
        setPeople(defaultPeople);
      }
    });

    return () => unsubscribe();
  }, []); // Dependencies removed to prevent looping

  const validateURL = (url) => {
    const pattern = /^(http|https):\/\/[^\s$.?#].[^\s]*$/;
    return pattern.test(url);
  };

  const saveBookmark = async (e) => {
    e.preventDefault();

    if (!userId || !newBookmark.name || !newBookmark.link) {
      alert("Please Login to Save Bookmarks");
      setErrorMessage("Please fill in both fields.");
      return;
    }

    if (!validateURL(newBookmark.link)) {
      setErrorMessage("Please enter a valid URL.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (editMode) {
        await updateDoc(
          doc(db, "users", userId, "addbookmarks", editingBookmarkId),
          {
            name: newBookmark.name,
            link: newBookmark.link,
          }
        );

        setPeople((prevPeople) =>
          prevPeople.map((bookmark) =>
            bookmark.id === editingBookmarkId
              ? { ...bookmark, name: newBookmark.name, link: newBookmark.link }
              : bookmark
          )
        );
        setSuccessMessage("Bookmark updated successfully!");
      } else {
        const newBookmarkRef = await addDoc(
          collection(db, "users", userId, "addbookmarks"),
          {
            name: newBookmark.name,
            link: newBookmark.link,
            image: "default.png",
          }
        );
        const addedBookmark = {
          id: newBookmarkRef.id,
          name: newBookmark.name,
          link: newBookmark.link,
          image: "default.png",
        };
        setPeople((prevPeople) => [...prevPeople, addedBookmark]);
        setCachedBookmarks((prev) => [...prev, addedBookmark]);
        setSuccessMessage("Bookmark added successfully!");
      }

      setNewBookmark({ name: "", link: "" });
      setShowModal(false);
      setEditMode(false);
      setEditingBookmarkId(null);
    } catch (error) {
      
      console.error("Error saving bookmark:", error);
      setErrorMessage("Failed to save bookmark. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", userId, "addbookmarks", id));
      setPeople((prevPeople) =>
        prevPeople.filter((person) => person.id !== id)
      );
      setCachedBookmarks((prev) => prev.filter((person) => person.id !== id));
      setSuccessMessage("Bookmark deleted successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      setErrorMessage("Failed to delete bookmark. Please try again.");
    }
  };

  const handleEdit = (bookmark) => {
    setNewBookmark({ name: bookmark.name, link: bookmark.link });
    setEditingBookmarkId(bookmark.id);
    setEditMode(true);
    setShowModal(true);
  };

  return (
    <div className="flex items-center mt-2 dark:text-white justify-center mb-10 w-full">
      <AnimatedTooltip
        items={people}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />

      <button
        onClick={() => setShowModal(true)}
        className="bg-white/20 border dark:text-white border-gray-400 mb-10 ml-3 rounded-full w-10 h-10 flex items-center justify-center mt-4"
      >
        +
      </button>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 dark:text-white p-4 rounded-2xl shadow-md w-80">
            <h2 className="text-lg font-semibold mb-4">
              {editMode ? "Edit" : "Add"} Bookmark
            </h2>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {successMessage && (
              <p className="text-green-500">{successMessage}</p>
            )}
            <form onSubmit={saveBookmark}>
              <div className="mb-4">
                <label htmlFor="name" className="block mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newBookmark.name}
                  onChange={(e) =>
                    setNewBookmark({ ...newBookmark, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="link" className="block mb-1">
                  Link
                </label>
                <input
                  type="text"
                  id="link"
                  value={newBookmark.link}
                  onChange={(e) =>
                    setNewBookmark({ ...newBookmark, link: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-3 py-2 rounded-md"
              >
                Save
              </button>
            </form>
            <button
              onClick={() => setShowModal(false)}
              className="mt-2 text-red-500 w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
