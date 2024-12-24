import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function BookmarkPage() {
  const [userBookmarks, setUserBookmarks] = useState([]);
  const [globalBookmarks, setGlobalBookmarks] = useState([]);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [user, setUser] = useState(null);
  const [hiddenBookmarkIds, setHiddenBookmarkIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [menuVisible, setMenuVisible] = useState(null);

  const toggleMenu = (id) => {
    setMenuVisible(menuVisible === id ? null : id);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAddBookmark(e);
  };

  // Fetch user and global bookmarks on mount
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;

      try {
        // Fetch hidden bookmarks
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const hiddenIds = userDocSnap.exists()
          ? userDocSnap.data().hiddenBookmarkIds || []
          : [];
        setHiddenBookmarkIds(hiddenIds);

        // Fetch user bookmarks
        const userQuerySnapshot = await getDocs(
          collection(db, "users", user.uid, "shortcut")
        );
        const userBookmarksList = userQuerySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdByUser: true,
        }));
        setUserBookmarks(userBookmarksList);

        // Fetch bookmarks set By admin
        const globalQuerySnapshot = await getDocs(collection(db, "bookmarks"));
        const globalBookmarksList = globalQuerySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdByUser: false,
          isHidden: hiddenIds.includes(doc.id),
        }));
        setGlobalBookmarks(globalBookmarksList);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      }
    };

    fetchBookmarks();
  }, [user]);

  // Track auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  const validateURL = (url) => {
    const pattern = /^(http|https):\/\/[^\s$.?#].[^\s]*$/;
    return pattern.test(url);
  };

  const getFavicon = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://logo.clearbit.com/${domain}`> 0? `https://logo.clearbit.com/${domain}` : "https://www.freeiconspng.com/uploads/web-icon-black-png-planet-web-world-icon-17.png";
    } catch (error) {
      return "https://www.freeiconspng.com/uploads/web-icon-black-png-planet-web-world-icon-17.png"; // Fallback favicon
    }
  };

  const handleAddBookmark = async (e) => {
    e.preventDefault();

    if (!name || !link) {
      setErrorMessage("Both name and link fields are required!");
      return;
    }

    if (!validateURL(link)) {
      setErrorMessage("Please enter a valid URL.");
      return;
    }

    try {
      if (!user || !user.uid) {
        alert("You must be logged in to add bookmarks.");
        return;
      }

      const docRef = await addDoc(
        collection(db, "users", user.uid, "shortcut"),
        {
          name,
          link,
          category: "Popular",
          createdAt: new Date(),
        }
      );

      setUserBookmarks((prev) => [
        ...prev,
        {
          id: docRef.id,
          name,
          link,
          category: "Popular",
          createdAt: new Date(),
          createdByUser: true,
        },
      ]);

      setSuccessMessage("Bookmark added successfully!");
      setName("");
      setLink("");
    } catch (error) {
      console.error("Error adding bookmark:", error);
      setErrorMessage("Failed to add bookmark. Please try again.");
    }
  };

  const handleEditBookmark = (bookmark) => {
    setEditingBookmark(bookmark);
    setName(bookmark.name);
    setLink(bookmark.link);
    setEditMode(true);
    setShowModal(true);
  };

  const handleUpdateBookmark = async (e) => {
    e.preventDefault();

    if (!editingBookmark) return;

    try {
      const docRef = doc(
        db,
        "users",
        user.uid,
        "shortcut",
        editingBookmark.id
      );
      await updateDoc(docRef, { name, link });

      setUserBookmarks((prev) =>
        prev.map((bm) =>
          bm.id === editingBookmark.id ? { ...bm, name, link } : bm
        )
      );

      setSuccessMessage("Bookmark updated successfully!");
      setEditingBookmark(null);
      setName("");
      setLink("");
      setEditMode(false);
      setShowModal(false);
    } catch (error) {
      console.error("Error updating bookmark:", error);
      setErrorMessage("Failed to update bookmark. Please try again.");
    }
  };

  const handleDeleteBookmark = async (bookmarkId) => {
    const bookmark = userBookmarks.find((bm) => bm.id === bookmarkId);
    if (!bookmark) {
      // This is an admin bookmark, hide it instead
      return handleHideBookmark(bookmarkId);
    }

    try {
      const docRef = doc(db, "users", user.uid, "shortcut", bookmarkId);
      await deleteDoc(docRef);
      setUserBookmarks((prev) => prev.filter((bm) => bm.id !== bookmarkId));
      setSuccessMessage("Bookmark deleted successfully!");
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      setErrorMessage("Failed to delete bookmark. Please try again.");
    }
  };

  const handleHideBookmark = async (bookmarkId) => {
    try {
      const newHiddenIds = [...hiddenBookmarkIds, bookmarkId];
      setHiddenBookmarkIds(newHiddenIds);

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { hiddenBookmarkIds: newHiddenIds });

      // Update the global bookmarks state to reflect the hidden status
      setGlobalBookmarks((prev) =>
        prev.map((bm) =>
          bm.id === bookmarkId ? { ...bm, isHidden: true } : bm
        )
      );

      setSuccessMessage("Bookmark hidden successfully!");
    } catch (error) {
      console.error("Error hiding bookmark:", error);
      setErrorMessage("Failed to hide bookmark. Please try again.");
    }
  };

  const combinedBookmarks = [
    ...userBookmarks,
    ...globalBookmarks.filter((bm) => !bm.isHidden),
  ];

  return (
    <div className="flex items-center dark:text-white justify-center mb-10 w-full">
      <div className="flex gap-3  flex-wrap">
        {combinedBookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="text-center bg-transparent rounded-lg transition-transform transform hover:scale-105 group relative"
          >
            <a
              href={bookmark.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={getFavicon(bookmark.link) }
                alt={bookmark.name}
                className="w-7 h-7 mx-auto rounded-full transition-transform duration-300 transform hover:scale-110 hover:shadow-lg"
              />
            </a>
            <h3 className="text-xs font-semibold mt-1 w-16 truncate mx-auto">
              {bookmark.name}
            </h3>
            <div className="absolute top-0 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => toggleMenu(bookmark.id)}
                className="font-bold"
              >
                ⋮
              </button>
              {menuVisible === bookmark.id && (
                <div className="absolute bg-white/30 right-0 top-6 backdrop-blur border rounded shadow-md text-left z-10">
                  {bookmark.createdByUser && (
                    <button
                      onClick={() => handleEditBookmark(bookmark)}
                      className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-200"
                    >
                      Edit
                    </button>
                  )}
                  {bookmark.createdByUser ? (
                    <button
                      onClick={() => handleDeleteBookmark(bookmark.id)}
                      className="block w-full text-left px-2 py-1 text-sm text-red-500 hover:bg-gray-200"
                    >
                      Delete
                    </button>
                  ) : (
                    <button
                      onClick={() => handleHideBookmark(bookmark.id)}
                      className="block w-full text-left px-2 py-1 text-sm text-red-500 hover:bg-gray-200"
                    >
                      Hide
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="bg-white/20 border dark:text-white border-gray-400 mb-10 ml-3 rounded-full w-10 h-10 flex items-center justify-center mt-5"
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
            <form
              onSubmit={
                editingBookmark ? handleUpdateBookmark : handleAddBookmark
              }
            >
              <div className="flex flex-col space-y-3">
                <div>
                  <label htmlFor="name" className="block mb-1">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full p-2 dark:text-white dark:bg-gray-800 border rounded"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="link" className="block mb-1">
                    Link
                  </label>
                  <input
                    id="link"
                    type="url"
                    className="w-full p-2 dark:text-white dark:bg-gray-800 border rounded"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e)}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
                >
                  {editMode ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditMode(false);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="bg-gray-400 text-white rounded px-4 py-2 hover:bg-gray-500 mt-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookmarkPage;
