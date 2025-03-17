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
import { Modal, Input, Form, message } from "antd";

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
    if (e.key === "Enter") {
      e.preventDefault();
      addBookmark({ name, link });
    }
  };

  // Add local storage functions
  const saveToLocalStorage = (bookmarks) => {
    localStorage.setItem("userBookmarks", JSON.stringify(bookmarks));
  };

  const getFromLocalStorage = () => {
    const savedBookmarks = localStorage.getItem("userBookmarks");
    return savedBookmarks ? JSON.parse(savedBookmarks) : [];
  };

  const addBookmark = async (values) => {
    const bookmarkName = values.name || name;
    const bookmarkLink = values.link || link;

    if (!bookmarkName || !bookmarkLink) {
      setErrorMessage("Both name and link fields are required!");
      return;
    }

    if (!validateURL(bookmarkLink)) {
      setErrorMessage("Please enter a valid URL.");
      return;
    }

    try {
      const newBookmark = {
        id: Date.now().toString(), // Generate unique ID for local storage
        name: bookmarkName,
        link: bookmarkLink,
        category: "Popular",
        createdAt: new Date().toISOString(),
        createdByUser: true,
      };

      if (user) {
        // If user is logged in, save to Firebase
        const docRef = await addDoc(
          collection(db, "users", user.uid, "shortcut"),
          {
            name: bookmarkName,
            link: bookmarkLink,
            category: "Popular",
            createdAt: new Date(),
          }
        );

        setUserBookmarks((prev) => [
          ...prev,
          {
            id: docRef.id,
            ...newBookmark,
          },
        ]);
      } else {
        // If user is not logged in, save to local storage
        const currentBookmarks = getFromLocalStorage();
        const updatedBookmarks = [...currentBookmarks, newBookmark];
        saveToLocalStorage(updatedBookmarks);
        setUserBookmarks(updatedBookmarks);
      }

      setSuccessMessage("Bookmark added successfully!");
      setName("");
      setLink("");
      setShowModal(false);
    } catch (error) {
      console.error("Error adding bookmark:", error);
      setErrorMessage("Failed to add bookmark. Please try again.");
    }
  };

  const handleAddBookmark = (values) => {
    addBookmark(values);
  };

  // Modify useEffect to handle both Firebase and local storage
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // If user is logged in, fetch from Firebase
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          const hiddenIds = userDocSnap.exists()
            ? userDocSnap.data().hiddenBookmarkIds || []
            : [];
          setHiddenBookmarkIds(hiddenIds);

          const userQuerySnapshot = await getDocs(
            collection(db, "users", currentUser.uid, "shortcut")
          );
          const userBookmarksList = userQuerySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdByUser: true,
          }));
          setUserBookmarks(userBookmarksList);

          const globalQuerySnapshot = await getDocs(
            collection(db, "bookmarks")
          );
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
      } else {
        // If user is not logged in, load from local storage
        const localBookmarks = getFromLocalStorage();
        setUserBookmarks(localBookmarks);
        setGlobalBookmarks([]); // Clear global bookmarks for non-logged in users
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const validateURL = (url) => {
    const pattern = /^(http|https):\/\/[^\s$.?#].[^\s]*$/;
    return pattern.test(url);
  };

  const getFavicon = (url) => {
    try {
      return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=64`
        ? `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=64`
        : "https://www.freeiconspng.com/uploads/web-icon-black-png-planet-web-world-icon-17.png";
    } catch (error) {
      return "https://www.freeiconspng.com/uploads/web-icon-black-png-planet-web-world-icon-17.png";
    }
  };

  const handleEditBookmark = (bookmark) => {
    setEditingBookmark(bookmark);
    setName(bookmark.name);
    setLink(bookmark.link);
    setEditMode(true);
    setShowModal(true);
  };

  const handleUpdateBookmark = async (values) => {
    if (!editingBookmark) return;

    try {
      const updatedData = {
        name: values.name || name,
        link: values.link || link,
      };

      if (user) {
        // Update in Firebase for logged-in users
        const docRef = doc(
          db,
          "users",
          user.uid,
          "shortcut",
          editingBookmark.id
        );
        await updateDoc(docRef, updatedData);

        setUserBookmarks((prev) =>
          prev.map((bm) =>
            bm.id === editingBookmark.id
              ? {
                  ...bm,
                  ...updatedData,
                }
              : bm
          )
        );
      } else {
        // Update in local storage for non-logged-in users
        const currentBookmarks = getFromLocalStorage();
        const updatedBookmarks = currentBookmarks.map((bm) =>
          bm.id === editingBookmark.id
            ? {
                ...bm,
                ...updatedData,
              }
            : bm
        );
        saveToLocalStorage(updatedBookmarks);
        setUserBookmarks(updatedBookmarks);
      }

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
    try {
      if (user) {
        const bookmark = userBookmarks.find((bm) => bm.id === bookmarkId);
         if (!bookmark) {
           // This is an admin bookmark, hide it instead
           return handleHideBookmark(bookmarkId);
         }
        // Delete from Firebase for logged-in users
        const docRef = doc(db, "users", user.uid, "shortcut", bookmarkId);
        await deleteDoc(docRef);
        setUserBookmarks((prev) => prev.filter((bm) => bm.id !== bookmarkId));
      } else {
        // Delete from local storage for non-logged-in users
        const currentBookmarks = getFromLocalStorage();
        const updatedBookmarks = currentBookmarks.filter(
          (bm) => bm.id !== bookmarkId
        );
        saveToLocalStorage(updatedBookmarks);
        setUserBookmarks(updatedBookmarks);
      }
      setSuccessMessage("Bookmark deleted successfully!");
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      setErrorMessage("Failed to delete bookmark. Please try again.");
    }
  };

  const handleHideBookmark = async (bookmarkId) => {
    try {
      if (user) {
        const newHiddenIds = [...hiddenBookmarkIds, bookmarkId];
        setHiddenBookmarkIds(newHiddenIds);

        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, { hiddenBookmarkIds: newHiddenIds });

        setGlobalBookmarks((prev) =>
          prev.map((bm) =>
            bm.id === bookmarkId ? { ...bm, isHidden: true } : bm
          )
        );

        setSuccessMessage("Bookmark hidden successfully!");
      } else {
        // For non-logged-in users, just remove the bookmark from the list
        const updatedBookmarks = userBookmarks.filter(
          (bm) => bm.id !== bookmarkId
        );
        saveToLocalStorage(updatedBookmarks);
        setUserBookmarks(updatedBookmarks);
        setSuccessMessage("Bookmark removed successfully!");
      }
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
    <div className="flex items-center gap-2 max-w-7xl dark:text-white justify-center mb-10 w-full">
      <div className="flex gap-2  flex-wrap">
        {combinedBookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="text-center hover:shadow-sm hover:dark:bg-[#28283a]/[var(--widget-opacity)] hover:backdrop-blur-lg  hover:bg-white/[var(--widget-opacity)]  cursor-pointer p-2 rounded-sm  group relative"
          >
            <a href={bookmark.link} className="block">
              <img
                src={getFavicon(bookmark.link)}
                alt={bookmark.name}
                className="w-7 h-7 mx-auto"
              />
            </a>
            <a href={bookmark.link} className="block">
              <h3 className="text-xs font-semibold mt-1 w-16 truncate mx-auto">
                {bookmark.name}
              </h3>
            </a>
            <div className="absolute top-0 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => toggleMenu(bookmark.id)}
                className="font-bold"
              >
                ⋮
              </button>
              {menuVisible === bookmark.id && (
                <div className="absolute bg-white right-0 top-6 backdrop-blur border rounded shadow-md text-left z-10">
                  {bookmark.createdByUser && (
                    <button
                      onClick={() => handleEditBookmark(bookmark)}
                      className="block w-full text-left px-2 py-1 dark:text-black text-sm hover:bg-gray-200"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteBookmark(bookmark.id)}
                    className="block w-full text-left px-2 py-1 text-sm text-red-500 hover:bg-gray-200"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center hover:shadow-sm hover:dark:bg-[#28283a]/[var(--widget-opacity)] hover:backdrop-blur-lg   hover:bg-white/[var(--widget-opacity)]  cursor-pointer p-2 rounded-sm">
        <button
          onClick={() => setShowModal(true)}
          className=" dark:text-white   w-12 h-12 flex items-center justify-center "
        >
          +
        </button>
      </div>
      <Modal
        title={editMode ? "Edit Bookmark" : "Add Bookmark"}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setEditMode(false);
          setName("");
          setLink("");
          setErrorMessage("");
          setSuccessMessage("");
        }}
        footer={
          <div className="flex justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditMode(false);
                setName("");
                setLink("");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="px-4 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-[#513a7a] dark:hover:bg-gray-600 dark:text-white rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
            >
              {editMode ? "Update" : "Add"}
            </button>
          </div>
        }
      >
        <Form
          onFinish={editingBookmark ? handleUpdateBookmark : handleAddBookmark}
          layout="vertical"
        >
          <Form.Item
            label={<span className="dark:text-white">Name</span>}
            name="name"
            rules={[{ required: true, message: "Please enter bookmark name" }]}
            initialValue={name}
          >
            <Input
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter bookmark name"
              className="dark:bg-[#513a7a] border dark:border-gray-600 dark:text-white"
            />
          </Form.Item>
          <Form.Item
            label={<span className="dark:text-white">URL</span>}
            name="link"
            rules={[
              { required: true, message: "Please enter URL" },
              { type: "url", message: "Please enter a valid URL" },
            ]}
            initialValue={link}
          >
            <Input
              onChange={(e) => setLink(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter URL"
              className="dark:bg-[#513a7a] border dark:border-gray-600 dark:text-white"
            />
          </Form.Item>
          {errorMessage && (
            <div className="text-red-500 mb-4">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="text-green-500 mb-4">{successMessage}</div>
          )}
        </Form>
      </Modal>
    </div>
  );
}

export default BookmarkPage;
