import { useState, useEffect } from "react";
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

// Renamed to match import in SearchPage.jsx
const ShortCuts = () => {
  const [userBookmarks, setUserBookmarks] = useState([]);
  const [globalBookmarks, setGlobalBookmarks] = useState([]);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [user, setUser] = useState(null);
  const [hiddenBookmarkIds, setHiddenBookmarkIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formRef] = Form.useForm();

  const [menuVisible, setMenuVisible] = useState(null);

  // Hardcoded bookmarks for non-logged-in users
  const hardcodedBookmarks = [
    {
      id: "hardcoded-1",
      name: "Google",
      link: "https://google.com",
      category: "Popular",
      createdAt: new Date().toISOString(),
      createdByUser: false,
      isHardcoded: true,
    },
    {
      id: "hardcoded-2", 
      name: "YouTube",
      link: "https://youtube.com",
      category: "Popular",
      createdAt: new Date().toISOString(),
      createdByUser: false,
      isHardcoded: true,
    },
    {
      id: "hardcoded-3",
      name: "Facebook",
      link: "https://facebook.com",
      category: "Popular", 
      createdAt: new Date().toISOString(),
      createdByUser: false,
      isHardcoded: true,
    },
    {
      id: "hardcoded-4",
      name: "Twitter",
      link: "https://twitter.com",
      category: "Popular",
      createdAt: new Date().toISOString(),
      createdByUser: false,
      isHardcoded: true,
    },
    {
      id: "hardcoded-5",
      name: "LinkedIn",
      link: "https://linkedin.com",
      category: "Popular",
      createdAt: new Date().toISOString(),
      createdByUser: false,
      isHardcoded: true,
    },
  ];

  const toggleMenu = (id) => {
    setMenuVisible(menuVisible === id ? null : id);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      console.log("Enter key pressed, editMode:", editMode);
      
      formRef.validateFields()
        .then((values) => {
          console.log("Form validation passed, values:", values);
          if (editMode) {
            console.log("Calling handleUpdateBookmark");
            handleUpdateBookmark(values);
          } else {
            console.log("Calling addBookmark");
            addBookmark(values);
          }
        })
        .catch((info) => {
          console.log("Validate Failed:", info);
          const fieldErrors = info.errorFields
            .map((field) => `${field.name.join(".")}: ${field.errors.join(", ")}`)
            .join("; ");
          setErrorMessage(`Please correct these errors: ${fieldErrors || "Missing required fields"}`);
        });
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

  // Add a function to check user auth status that can be called directly
  const checkUserAuth = () => {
    console.log("Current user auth status:", !!auth.currentUser);
    console.log("User state in component:", !!user);
    return !!user;
  };

  const addBookmark = async (values) => {
    console.log("Adding bookmark with values:", values);

    if (!values) {
      console.error("Form values are undefined");
      setErrorMessage("Form submission error. Please try again.");
      return;
    }

    const bookmarkName = values.name;
    let bookmarkLink = values.link;

    if (!bookmarkName || !bookmarkLink) {
      console.error("Missing required fields:", {
        name: bookmarkName,
        link: bookmarkLink,
      });
      setErrorMessage("Both name and link fields are required!");
      return;
    }

    // Improve URL validation by adding protocol if missing
    if (
      !bookmarkLink.startsWith("http://") &&
      !bookmarkLink.startsWith("https://")
    ) {
      bookmarkLink = "https://" + bookmarkLink;
    }

    if (!validateURL(bookmarkLink)) {
      setErrorMessage("Please enter a valid URL.");
      return;
    }

    try {
      const newBookmark = {
        id: Date.now().toString(),
        name: bookmarkName,
        link: bookmarkLink,
        category: "Popular",
        createdAt: new Date().toISOString(),
        createdByUser: true,
      };

      const isUserLoggedIn = checkUserAuth();
      console.log("Is user logged in before saving:", isUserLoggedIn);

      if (isUserLoggedIn) {
        try {
          const collectionPath = `users/${user.uid}/shortcut`;
          console.log("Using collection path:", collectionPath);

          const docRef = await addDoc(
            collection(db, "users", user.uid, "shortcut"),
            {
              name: bookmarkName,
              link: bookmarkLink,
              category: "Popular",
              createdAt: new Date(),
            }
          );
          console.log("Firebase bookmark added with ID:", docRef.id);

          setUserBookmarks((prev) => [
            ...prev,
            {
              id: docRef.id,
              ...newBookmark,
              link: bookmarkLink,
            },
          ]);

          message.success("Bookmark added successfully!");
          setShowModal(false);
          formRef.resetFields();
          setErrorMessage("");
        } catch (firebaseError) {
          console.error("Firebase error:", firebaseError);
          setErrorMessage(`Firebase error: ${firebaseError.message}`);
          message.error("Failed to save to Firebase. Check console for details.");
        }
      } else {
        console.log("Adding bookmark to local storage");
        const currentBookmarks = getFromLocalStorage();
        const updatedBookmarks = [
          ...currentBookmarks,
          {
            ...newBookmark,
            link: bookmarkLink,
          },
        ];
        saveToLocalStorage(updatedBookmarks);
        setUserBookmarks(updatedBookmarks);

        message.success("Bookmark added to local storage!");
        setShowModal(false);
        formRef.resetFields();
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Error adding bookmark:", error);
      setErrorMessage(`Error: ${error.message}`);
      message.error("Failed to add bookmark. Please try again.");
    }
  };

  // Modify useEffect to handle both Firebase and local storage
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      console.log(
        "Auth state changed, user:",
        currentUser?.uid || "not logged in"
      );

      if (currentUser) {
        // If user is logged in, fetch from Firebase
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          const hiddenIds = userDocSnap.exists()
            ? userDocSnap.data().hiddenBookmarkIds || []
            : [];
          setHiddenBookmarkIds(hiddenIds);

          console.log("Fetching user shortcuts from Firebase");
          const userQuerySnapshot = await getDocs(
            collection(db, "users", currentUser.uid, "shortcut")
          );
          const userBookmarksList = userQuerySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdByUser: true,
          }));
          console.log("Fetched user bookmarks:", userBookmarksList.length);
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
          message.error("Failed to load bookmarks. Please refresh the page.");
        }
      } else {
        // If user is not logged in, load from local storage and add hardcoded bookmarks
        const localBookmarks = getFromLocalStorage();
        console.log(
          "Loaded bookmarks from local storage:",
          localBookmarks.length
        );
        setUserBookmarks(localBookmarks);
        setGlobalBookmarks(hardcodedBookmarks); // Set hardcoded bookmarks for non-logged in users
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const validateURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getFavicon = (url) => {
    try {
      return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=64`;
    } catch {
      return "https://www.freeiconspng.com/uploads/web-icon-black-png-planet-web-world-icon-17.png";
    }
  };

  const handleEditBookmark = (bookmark) => {
    // Check if it's a hardcoded bookmark
    if (bookmark.isHardcoded) {
      message.warning("Hardcoded bookmarks cannot be edited.");
      return;
    }
    
    console.log("Editing bookmark:", bookmark);
    setEditingBookmark(bookmark);
    formRef.setFieldsValue({
      name: bookmark.name,
      link: bookmark.link,
    });
    setEditMode(true);
    setShowModal(true);
    setErrorMessage("");
  };

  const handleUpdateBookmark = async (values) => {
    if (!editingBookmark) {
      setErrorMessage("No bookmark selected for editing");
      return;
    }

    let bookmarkLink = values.link;
    if (!bookmarkLink.startsWith("http://") && !bookmarkLink.startsWith("https://")) {
      bookmarkLink = "https://" + bookmarkLink;
    }
    if (!validateURL(bookmarkLink)) {
      setErrorMessage("Please enter a valid URL.");
      return;
    }

    const updatedData = {
      name: values.name,
      link: bookmarkLink,
    };

    try {
      if (user && editingBookmark.id.length === 20) { // Only update in Firestore if it's a Firestore doc
        const docRef = doc(db, "users", user.uid, "shortcut", editingBookmark.id);
        await updateDoc(docRef, updatedData);
        setUserBookmarks((prev) =>
          prev.map((bm) =>
            bm.id === editingBookmark.id ? { ...bm, ...updatedData } : bm
          )
        );
        message.success("Bookmark updated successfully!");
      } else {
        // Update in local storage for non-logged-in users or local bookmarks
        const currentBookmarks = getFromLocalStorage();
        const updatedBookmarks = currentBookmarks.map((bm) =>
          bm.id === editingBookmark.id ? { ...bm, ...updatedData } : bm
        );
        saveToLocalStorage(updatedBookmarks);
        setUserBookmarks(updatedBookmarks);
        message.success("Bookmark updated successfully!");
      }

      setErrorMessage("");
      setEditingBookmark(null);
      setEditMode(false);
      setShowModal(false);
      formRef.resetFields();
    } catch (error) {
      console.error("Error updating bookmark:", error);
      setErrorMessage("Failed to update bookmark. Please try again.");
      message.error("Failed to update bookmark. Please try again.");
    }
  };

  const handleDeleteBookmark = async (bookmarkId) => {
    try {
      // Check if it's a hardcoded bookmark
      const isHardcoded = bookmarkId.startsWith("hardcoded-");
      if (isHardcoded) {
        message.warning("Hardcoded bookmarks cannot be deleted.");
        return;
      }

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
        message.success("Bookmark deleted successfully!");
      } else {
        // Delete from local storage for non-logged-in users
        const currentBookmarks = getFromLocalStorage();
        const updatedBookmarks = currentBookmarks.filter(
          (bm) => bm.id !== bookmarkId
        );
        saveToLocalStorage(updatedBookmarks);
        setUserBookmarks(updatedBookmarks);
        message.success("Bookmark deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      setErrorMessage("Failed to delete bookmark. Please try again.");
      message.error("Failed to delete bookmark. Please try again.");
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

        message.success("Bookmark hidden successfully!");
      } else {
        // For non-logged-in users, just remove the bookmark from the list
        const updatedBookmarks = userBookmarks.filter(
          (bm) => bm.id !== bookmarkId
        );
        saveToLocalStorage(updatedBookmarks);
        setUserBookmarks(updatedBookmarks);
        message.success("Bookmark removed successfully!");
      }
    } catch (error) {
      console.error("Error hiding bookmark:", error);
      setErrorMessage("Failed to hide bookmark. Please try again.");
      message.error("Failed to hide bookmark. Please try again.");
    }
  };

  const combinedBookmarks = [
    ...userBookmarks,
    ...globalBookmarks.filter((bm) => !bm.isHidden),
  ];

  // Sort by createdAt (newest first)
  const sortedBookmarks = combinedBookmarks.sort((a, b) => {
    // If createdAt is a string, convert to Date for comparison
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return bTime - aTime;
  });

  const openAddModal = () => {
    formRef.resetFields();
    formRef.setFieldsValue({ name: "", link: "" });
    setErrorMessage("");
    setEditMode(false);
    setEditingBookmark(null);
    setShowModal(true);
    console.log("Add modal opened, form reset");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setEditingBookmark(null);
    setErrorMessage("");
    formRef.resetFields();
    console.log("Modal closed and form reset");
  };

  return (
    <div className="flex items-start gap-2 max-w-7xl dark:text-white justify-center mb-10 w-full">
      <div className="flex gap-2 flex-wrap items-start">
        {sortedBookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="text-center hover:shadow-sm hover:dark:bg-[#28283a]/[var(--widget-opacity)] hover:backdrop-blur-lg hover:bg-white/[var(--widget-opacity)] cursor-pointer p-2 rounded-sm group relative"
          >
            <a
              href={bookmark.link}
              className="block"
              rel="noopener noreferrer"
            >
              <img
                src={getFavicon(bookmark.link)}
                alt={bookmark.name}
                className="w-7 h-7 mx-auto"
                onError={(e) => {
                  e.target.src =
                    "https://www.freeiconspng.com/uploads/web-icon-black-png-planet-web-world-icon-17.png";
                }}
              />
            </a>
            <a
              href={bookmark.link}
              className="block"
              rel="noopener noreferrer"
            >
              <h3 className="text-xs font-semibold mt-1 w-16 truncate mx-auto">
                {bookmark.name}
              </h3>
            </a>
            <div className="absolute top-0 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleMenu(bookmark.id);
                }}
                className="font-bold"
              >
                ⋮
              </button>
              {menuVisible === bookmark.id && (
                <div
                  className="absolute bg-white right-0 top-6 backdrop-blur border rounded shadow-md text-left z-10"
                  onMouseLeave={() => setMenuVisible(null)}
                >
                  {bookmark.createdByUser && !bookmark.isHardcoded && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditBookmark(bookmark);
                      }}
                      className="block w-full text-left px-2 py-1 dark:text-black text-sm hover:bg-gray-200"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteBookmark(bookmark.id);
                    }}
                    className="block w-full text-left px-2 py-1 text-sm text-red-500 hover:bg-gray-200"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div className="text-center hover:shadow-sm hover:dark:bg-[#28283a]/[var(--widget-opacity)] hover:backdrop-blur-lg hover:bg-white/[var(--widget-opacity)] cursor-pointer p-2 rounded-sm">
          <button
            onClick={openAddModal}
            className="dark:text-white w-12 h-12 flex items-center justify-center"
            aria-label="Add shortcut"
          >
            +
          </button>
        </div>
      </div>
      <Modal
        title={editMode ? "Edit Bookmark" : "Add Bookmark"}
        open={showModal}
        onCancel={closeModal}
        footer={null} // Remove default footer for custom submit handling
      >
        <Form
          form={formRef}
          onFinish={editMode ? handleUpdateBookmark : addBookmark}
          layout="vertical"
        >
          <Form.Item
            label={<span className="dark:text-white">Name</span>}
            name="name"
            rules={[{ required: true, message: "Please enter bookmark name" }]}
          >
            <Input
              placeholder="Enter bookmark name"
              className="dark:bg-[#513a7a] border dark:border-gray-600 dark:text-white"
              onKeyDown={handleKeyDown}
            />
          </Form.Item>
          <Form.Item
            label={<span className="dark:text-white">URL</span>}
            name="link"
            rules={[{ required: true, message: "Please enter URL" }]}
            help={
              <span className="text-xs text-gray-500">
                Tip: You can enter with or without https:// | Press Enter to submit
              </span>
            }
          >
            <Input
              onKeyDown={handleKeyDown}
              placeholder="Enter URL (e.g. google.com)"
              className="dark:bg-[#513a7a] border dark:border-gray-600 dark:text-white"
            />
          </Form.Item>
          {errorMessage && (
            <div className="text-red-500 mb-4">{errorMessage}</div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-[#513a7a] dark:hover:bg-gray-600 dark:text-white rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-1.5 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
              onClick={() => {
                formRef
                  .validateFields()
                  .then((values) => {
                    if (editMode) {
                      handleUpdateBookmark(values);
                    } else {
                      addBookmark(values);
                    }
                  })
                  .catch((info) => {
                    console.log("Validate Failed:", info);
                    const fieldErrors = info.errorFields
                      .map((field) => `${field.name.join(".")}: ${field.errors.join(", ")}`)
                      .join("; ");
                    setErrorMessage(`Please correct these errors: ${fieldErrors || "Missing required fields"}`);
                  });
              }}
            >
              {editMode ? "Update" : "Add"}
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ShortCuts;