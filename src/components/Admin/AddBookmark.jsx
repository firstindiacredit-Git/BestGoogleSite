import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebase"; // Import Firebase Firestore

function BookmarkManager() {
  const [bookmarks, setBookmarks] = useState([]);
  const [editing, setEditing] = useState(null); // Bookmark being edited
  const [editValues, setEditValues] = useState({
    name: "",
    link: "",
    category: "",
  });

  const [adding, setAdding] = useState(false); // Toggle add bookmark modal
  const [newBookmark, setNewBookmark] = useState({
    name: "",
    link: "",
    category: "Popular",
  });

  // Fetch bookmarks on component mount
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "bookmarks"), (snapshot) => {
      const fetchedBookmarks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookmarks(fetchedBookmarks);
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  // Add a new bookmark
  const handleAddBookmark = async () => {
    if (!newBookmark.name || !newBookmark.link || !newBookmark.category) {
      alert("All fields are required!");
      return;
    }

    try {
      await addDoc(collection(db, "bookmarks"), {
        ...newBookmark,
        createdAt: new Date(),
      });
      alert("Bookmark added successfully!");
      setNewBookmark({ name: "", link: "", category: "Popular" });
      setAdding(false);
    } catch (error) {
      console.error("Error adding bookmark:", error);
      alert("Failed to add bookmark. Please try again.");
    }
  };

  // Delete a bookmark
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bookmark?")) {
      try {
        await deleteDoc(doc(db, "bookmarks", id));
        alert("Bookmark deleted successfully!");
      } catch (error) {
        console.error("Error deleting bookmark:", error);
        alert("Failed to delete bookmark. Please try again.");
      }
    }
  };

  // Handle edit start
  const startEditing = (bookmark) => {
    setEditing(bookmark.id);
    setEditValues({
      name: bookmark.name,
      link: bookmark.link,
      category: bookmark.category,
    });
  };

  // Handle edit save
  const saveEdit = async (id) => {
    try {
      await updateDoc(doc(db, "bookmarks", id), editValues);
      alert("Bookmark updated successfully!");
      setEditing(null); // Exit editing mode
    } catch (error) {
      console.error("Error updating bookmark:", error);
      alert("Failed to update bookmark. Please try again.");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditing(null);
    setEditValues({ name: "", link: "", category: "" });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Bookmarks</h1>

      {/* Add Bookmark Modal */}
      {adding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Add Bookmark</h2>
            <div className="space-y-3">
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Name"
                value={newBookmark.name}
                onChange={(e) =>
                  setNewBookmark({ ...newBookmark, name: e.target.value })
                }
              />
              <input
                type="url"
                className="w-full p-2 border rounded"
                placeholder="Link"
                value={newBookmark.link}
                onChange={(e) =>
                  setNewBookmark({ ...newBookmark, link: e.target.value })
                }
              />
              <select
                className="w-full p-2 border rounded"
                value={newBookmark.category}
                onChange={(e) =>
                  setNewBookmark({ ...newBookmark, category: e.target.value })
                }
              >
                <option value="Popular">Popular</option>
                <option value="Travel">Travel</option>
                <option value="Shortcut">Shortcut</option>
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddBookmark}
                  className="p-2 bg-blue-500 text-white rounded"
                >
                  Add
                </button>
                <button
                  onClick={() => setAdding(false)}
                  className="p-2 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bookmark Button */}
      <button
        onClick={() => setAdding(true)}
        className="mb-4 p-2 bg-green-500 text-white rounded"
      >
        Add Bookmark
      </button>

      {/* Bookmark List */}
      <div className="space-y-4">
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="p-4 border rounded bg-gray-50 dark:bg-gray-800"
          >
            {editing === bookmark.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="Name"
                  value={editValues.name}
                  onChange={(e) =>
                    setEditValues({ ...editValues, name: e.target.value })
                  }
                />
                <input
                  type="url"
                  className="w-full p-2 border rounded"
                  placeholder="Link"
                  value={editValues.link}
                  onChange={(e) =>
                    setEditValues({ ...editValues, link: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="Category"
                  value={editValues.category}
                  onChange={(e) =>
                    setEditValues({ ...editValues, category: e.target.value })
                  }
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveEdit(bookmark.id)}
                    className="p-2 bg-blue-500 text-white rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2 bg-gray-500 text-white rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-bold">{bookmark.name}</h2>
                <p>
                  <a
                    href={bookmark.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                  >
                    {bookmark.link}
                  </a>
                </p>
                <p className="text-gray-600">Category: {bookmark.category}</p>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => startEditing(bookmark)}
                    className="p-2 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(bookmark.id)}
                    className="p-2 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookmarkManager;
