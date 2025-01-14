import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../../firebase";

const fetchFavicon = (url) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  } catch (error) {
    return `https://www.google.com/s2/favicons?sz=64&domain=google.com`; // Default favicon
  }
};


function BookmarkManager() {
  const [bookmarks, setBookmarks] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const itemsPerPage = 12;

  // Bookmark states
  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({
    name: "",
    link: "",
  });
  const [adding, setAdding] = useState(false);
  const [newBookmark, setNewBookmark] = useState({
    name: "",
    link: "",
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "bookmarks"), orderBy("createdAt", "desc"), limit(itemsPerPage)),
      (snapshot) => {
        const fetchedBookmarks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookmarks(fetchedBookmarks);
      }
    );
    return () => unsubscribe();
  }, []);

  // Filter and search bookmarks
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.link.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Add bookmark with preview
  const handleAddBookmark = async () => {
    if (!newBookmark.name || !newBookmark.link) {
      alert("All fields are required!");
      return;
    }

    try {
      await addDoc(collection(db, "bookmarks"), {
        ...newBookmark,
        createdAt: new Date(),
      });
      setNewBookmark({ name: "", link: ""});
      setAdding(false);
      setShowPreview(false);
    } catch (error) {
      console.error("Error adding bookmark:", error);
      alert("Failed to add bookmark. Please try again.");
    }
  };

  const startEditing = (bookmark) => {
    setEditing(bookmark.id);
    setEditValues(bookmark);
  };

  const saveEdit = async (id) => {
    try {
      await updateDoc(doc(db, "bookmarks", id), editValues);
      setEditing(null);
    } catch (error) {
      console.error("Error editing bookmark:", error);
      alert("Failed to edit bookmark. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "bookmarks", id));
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      alert("Failed to delete bookmark. Please try again.");
    }
  };

  return (
    <div className="min-h-screen dark:bg-[#28283A] bg-gray-50">
      {/* Top Bar with Search and Filters */}
      <div className="sticky top-0 z-9 dark:bg-[#37375d] bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Add Shortcut
            </h1>
            {/* Search Bar */}
            <div className="relative flex-1 max-w-lg">
              <input
                type="text"
                placeholder="Search Shortcuts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-sm border dark:border-gray-600 dark:bg-[#513a7a] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters and View Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-600  p-1 rounded-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${
                    viewMode === "grid"
                      ? "bg-white  dark:bg-[#513a7a] shadow-sm"
                      : ""
                  }`}
                >
                  <svg
                    className="w-5 h-5 dark:text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${
                    viewMode === "list"
                      ? "bg-white  dark:bg-[#513a7a] shadow-sm"
                      : ""
                  }`}
                >
                  <svg
                    className="w-5 h-5 dark:text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarks Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5 py-4">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white dark:bg-[#513a7a] rounded-sm shadow-sm hover:shadow-md transition-shadow p-4"
              >
                {editing === bookmark.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editValues.name}
                      onChange={(e) =>
                        setEditValues({ ...editValues, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-[#513a7a] dark:text-white rounded-xs focus:ring-2 focus:ring-blue-500"
                      placeholder="Name"
                    />
                    <input
                      type="url"
                      value={editValues.link}
                      onChange={(e) =>
                        setEditValues({ ...editValues, link: e.target.value })
                      }
                      className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-[#513a7a] dark:text-white rounded-xs focus:ring-2 focus:ring-blue-500"
                      placeholder="Link"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditing(null)}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(bookmark.id)}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xs"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start gap-3">
                    <img
                      src={fetchFavicon(bookmark.link)}
                      alt=""
                      className="w-8 h-8 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-lg text-gray-900 dark:text-white truncate">
                          {bookmark.name}
                        </h3>
                        <div className="flex items-center gap-2 ml-2">
                          <button
                            onClick={() => startEditing(bookmark)}
                            className="p-1.5 text-indigo-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(bookmark.id)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <a
                        href={bookmark.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-blue-400 truncate block mt-1"
                      >
                        {bookmark.link}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white dark:bg-[#513a7a] rounded-sm shadow-sm hover:shadow-md transition-shadow p-4"
              >
                {editing === bookmark.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editValues.name}
                      onChange={(e) =>
                        setEditValues({ ...editValues, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-[#513a7a] dark:text-white rounded-xs focus:ring-2 focus:ring-blue-500"
                      placeholder="Name"
                    />
                    <input
                      type="url"
                      value={editValues.link}
                      onChange={(e) =>
                        setEditValues({ ...editValues, link: e.target.value })
                      }
                      className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-[#513a7a] dark:text-white rounded-xs focus:ring-2 focus:ring-blue-500"
                      placeholder="Link"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditing(null)}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(bookmark.id)}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xs"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center gap-4">
                    <img
                      src={fetchFavicon(bookmark.link)}
                      alt=""
                      className="w-8 h-8 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-lg text-gray-900 dark:text-white">
                            {bookmark.name}
                          </h3>
                          <a
                            href={bookmark.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-blue-400"
                          >
                            {bookmark.link}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditing(bookmark)}
                            className="p-1.5 text-indigo-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(bookmark.id)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Bookmark Modal */}
      {adding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Shortcut</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newBookmark.name}
                  onChange={(e) =>
                    setNewBookmark({ ...newBookmark, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link
                </label>
                <input
                  type="url"
                  value={newBookmark.link}
                  onChange={(e) =>
                    setNewBookmark({ ...newBookmark, link: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div></div>

              {/* Preview */}
              {showPreview && (
                <div className="mt-4 p-4 border rounded-sm bg-gray-50">
                  <h3 className="font-medium mb-2">Preview</h3>
                  <div className="bg-white p-4 rounded-sm shadow-sm">
                    <h4 className="font-medium">
                      {newBookmark.name || "Bookmark Name"}
                    </h4>
                    <a href="#" className="text-sm text-indigo-600">
                      {newBookmark.link || "https://example.com"}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xs"
                >
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </button>
                <button
                  onClick={() => setAdding(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBookmark}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xs"
                >
                  Add Bookmark
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={() => setAdding(true)}
        className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  );
}

export default BookmarkManager;
