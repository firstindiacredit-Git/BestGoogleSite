import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; // Firebase imports
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { MdAdd, MdDelete } from "react-icons/md";
import Weather from "./Weather";

// Pre-defined static bookmarks
const initialBookmarks = {
  Popular: [
    { name: "Google", link: "https://www.google.com" },
    { name: "Facebook", link: "https://www.facebook.com" },
    { name: "YouTube", link: "https://www.youtube.com" },
    { name: "LinkedIn", link: "https://www.linkedin.com" },
  ],
  Travel: [
    { name: "Booking.com", link: "https://www.booking.com" },
    { name: "Emirates", link: "https://www.emirates.com" },
    { name: "Hotels.com", link: "https://www.hotels.com" },
    { name: "Trip Advisor", link: "https://www.tripadvisor.com" },
  ],
  Shopping: [
    { name: "Amazon", link: "https://www.amazon.com" },
    { name: "Flipkart", link: "https://www.flipkart.com" },
    { name: "Rediff", link: "https://www.rediff.com" },
    { name: "Myntra", link: "https://www.myntra.com" },
  ],
};

const Bookmarks = () => {
  const [user, setUser] = useState(null); // User state
  const [firebaseBookmarks, setFirebaseBookmarks] = useState({
    Popular: [],
    Travel: [],
    Shopping: [],
  }); // Bookmarks from Firebase
  const [newBookmark, setNewBookmark] = useState({
    name: "",
    link: "",
    category: "Popular",
  }); // New bookmark
  const [showForm, setShowForm] = useState(false); // Form visibility

  // Fetch authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch bookmarks by category from Firebase
  useEffect(() => {
    if (user) {
      const categories = ["Popular", "Travel", "Shopping"];
      const unsubscribeFns = categories.map((category) => {
        const bookmarksRef = collection(db, "users", user.uid, "bookmarks");
        return onSnapshot(bookmarksRef, (snapshot) => {
          const bookmarksData = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((bookmark) => bookmark.category === category); // Filter by category

          setFirebaseBookmarks((prev) => ({
            ...prev,
            [category]: bookmarksData,
          }));
        });
      });

      return () => unsubscribeFns.forEach((unsubscribe) => unsubscribe());
    }
  }, [user]);

  // Add a new bookmark
  const addBookmark = async (e) => {
    e.preventDefault();
    if (!newBookmark.name || !newBookmark.link) return;
    if (!user) return alert("Please log in to save bookmarks.");

    try {
      await addDoc(collection(db, "users", user.uid, "bookmarks"), newBookmark);
      setNewBookmark({ name: "", link: "", category: "Popular" }); // Reset input fields
      setShowForm(false); // Hide the form after submission
    } catch (error) {
      console.error("Error adding bookmark: ", error);
      alert(`Error adding bookmark: ${error.message}`);
    }
  };

  // Delete a bookmark
  const deleteBookmark = async (category, id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "bookmarks", id));
      setFirebaseBookmarks((prev) => ({
        ...prev,
        [category]: prev[category].filter((bookmark) => bookmark.id !== id),
      }));
    } catch (error) {
      console.error("Error deleting bookmark: ", error);
      alert(`Error deleting bookmark: ${error.message}`);
    }
  };

  // Render bookmarks for a given category
  const renderBookmarks = (category) => {
    const combinedBookmarks = [
      ...initialBookmarks[category],
      ...firebaseBookmarks[category],
    ];

    return combinedBookmarks.map((bookmark, index) => (
      <div
        key={bookmark.id || index}
        className="flex flex-col w-full items-center gap-2 p-2 rounded transition"
      >
        <a
          href={bookmark.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col w-full items-center text-center"
        >
          <img
            src={`https://logo.clearbit.com/${new URL(bookmark.link).hostname}`}
            alt={`${bookmark.name} favicon`}
            className="w-10 h-10 mb-1" // Added margin-bottom for spacing
          />
          <span className="block w-2 mr-12">{bookmark.name}</span>
        </a>
        {/* Only allow deletion for Firebase bookmarks */}
        {bookmark.id && (
          <button
            onClick={() => deleteBookmark(category, bookmark.id)}
            className="ml-auto text-red-500"
          >
            <MdDelete />
          </button>
        )}
      </div>
    ));
  };

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-3xl font-semibold mb-6 text-center">My Bookmarks</h2>

      <div className="grid grid-cols-1  md:grid-cols-2  lg:grid-cols-2 gap-6">
        {/* Popular Bookmarks Section */}
        <section className="bg-white/20  p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Popular</h3>
          <div className="grid grid-cols-4 gap-2">
            {renderBookmarks("Popular")}
          </div>
        </section>

        {/* Travel Bookmarks Section */}
        <section className="bg-white/20 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Travel</h3>
          <div className="grid grid-cols-3 gap-2">
            {renderBookmarks("Travel")}
          </div>
        </section>

        {/* Shopping Bookmarks Section */}
        <section className="bg-white/20 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Shopping</h3>
          <div className="grid grid-row-2 gap-2 justify-start">
            {renderBookmarks("Shopping")}
          </div>
        </section>
      </div>

      {/* Add Bookmark Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center mt-6 text-blue-600 mx-auto"
      >
        <MdAdd className="mr-2" />
        Add Bookmark
      </button>

      {/* Form to Add Bookmark */}
      {showForm && (
        <form
          onSubmit={addBookmark}
          className="mt-4 grid grid-cols-2 gap-2 mx-auto"
        >
          <input
            type="text"
            placeholder="Bookmark Name"
            value={newBookmark.name}
            onChange={(e) =>
              setNewBookmark({ ...newBookmark, name: e.target.value })
            }
            className=" border p-1 text-black border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Bookmark URL"
            value={newBookmark.link}
            onChange={(e) =>
              setNewBookmark({ ...newBookmark, link: e.target.value })
            }
            className="border p-1 text-black border-gray-300 rounded-lg"
          />
          <select
            value={newBookmark.category}
            onChange={(e) =>
              setNewBookmark({ ...newBookmark, category: e.target.value })
            }
            className=" border p-1 text-black border-gray-300 rounded-lg"
          >
            <option value="Popular">Popular</option>
            <option value="Travel">Travel</option>
            <option value="Shopping">Shopping</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-2 py-2 rounded-lg"
          >
            Add
          </button>
        </form>
      )}
    </div>
  );
};

export default Bookmarks;
