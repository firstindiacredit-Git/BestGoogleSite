import React, { useState, useEffect, useRef, useContext } from "react";

import { createPortal } from "react-dom";
import { db, auth } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Settings, Edit, Plus, Trash2 } from "lucide-react";
import { Modal, message, Input } from "antd";
import { defaultBookmarks } from "../firebase/widgetLayouts";

const CategoryHome = ({ categoryType, collapsed = false }) => {
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [hiddenBookmarkIds, setHiddenBookmarkIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showUrl, setShowUrl] = useState(true);
  const [iconSize, setIconSize] = useState("large");
  const [showSettings, setShowSettings] = useState(false);
  const [titleLines, setTitleLines] = useState(1);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: null,
    right: null,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [newBookmark, setNewBookmark] = useState({ name: "", link: "" });
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef(null);
  const settingsMenuRef = useRef(null);
  const componentRef = useRef(null);

  // Add localStorage keys
  const bookmarksStorageKey = `bookmarks_${categoryType}`;
  const hiddenBookmarksStorageKey = `hidden_bookmarks_${categoryType}`;

  // Add localStorage helper functions
  const saveBookmarksToLocal = (bookmarksData) => {
    if (!user) {
      localStorage.setItem(bookmarksStorageKey, JSON.stringify(bookmarksData));
    }
  };

  const getBookmarksFromLocal = () => {
    const savedBookmarks = localStorage.getItem(bookmarksStorageKey);
    if (savedBookmarks) {
      try {
        const parsed = JSON.parse(savedBookmarks);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Error parsing saved bookmarks:", e);
      }
    }

    // If no saved bookmarks or invalid data, return default bookmarks for the category
    const defaultCategoryBookmarks =
      getDefaultBookmarksForCategory(categoryType);

    // Save default bookmarks to localStorage
    localStorage.setItem(
      bookmarksStorageKey,
      JSON.stringify(defaultCategoryBookmarks)
    );
    return defaultCategoryBookmarks;
  };

  const saveHiddenBookmarksToLocal = (hiddenIds) => {
    if (!user) {
      localStorage.setItem(
        hiddenBookmarksStorageKey,
        JSON.stringify(hiddenIds)
      );
    }
  };

  const getHiddenBookmarksFromLocal = () => {
    const savedHiddenIds = localStorage.getItem(hiddenBookmarksStorageKey);
    return savedHiddenIds ? JSON.parse(savedHiddenIds) : [];
  };

  const preventScroll = (prevent) => {
    document.body.style.overflow = prevent ? "hidden" : "";
  };

  useEffect(() => {
    let unsubscribes = [];

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(true); // Set loading to true when authentication state changes

      if (currentUser) {
        // First, fetch user's hidden bookmarks
        const userDocRef = doc(db, "users", currentUser.uid);

        try {
          const userDocSnap = await getDoc(userDocRef);
          const hiddenIds = userDocSnap.exists()
            ? userDocSnap.data().hiddenCategoryBookmarks || []
            : [];
          setHiddenBookmarkIds(hiddenIds);

          // Then fetch admin categories
          const categoryQuery = query(
            collection(db, "category"),
            where("newCategory", "==", categoryType)
          );

          const unsubscribeCategory = onSnapshot(
            categoryQuery,
            async (categorySnapshot) => {
              // Clean up previous listeners
              unsubscribes.forEach((unsub) => {
                if (typeof unsub === "function") unsub();
              });
              unsubscribes = [];

              if (!categorySnapshot.empty) {
                const categoryDoc = categorySnapshot.docs[0];
                const categoryId = categoryDoc.id;

                // Fetch admin links for this category
                const adminLinksQuery = query(
                  collection(db, "links"),
                  where("category", "==", categoryId)
                );

                const adminLinksUnsubscribe = onSnapshot(
                  adminLinksQuery,
                  (adminLinksSnapshot) => {
                    // Get the latest hiddenIds to ensure we filter properly
                    getDoc(userDocRef)
                      .then((latestUserDoc) => {
                        const latestHiddenIds = latestUserDoc.exists()
                          ? latestUserDoc.data().hiddenCategoryBookmarks || []
                          : [];

                        const adminLinks = adminLinksSnapshot.docs
                          .map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                            addedByAdmin: true,
                          }))
                          .filter(
                            (bookmark) => !latestHiddenIds.includes(bookmark.id)
                          ); // Filter with latest hidden ids

                        // Then fetch user's personal bookmarks
                        const userBookmarksQuery = query(
                          collection(db, "users", currentUser.uid, "bookmarks"),
                          where("category", "==", categoryType)
                        );

                        const userBookmarksUnsubscribe = onSnapshot(
                          userBookmarksQuery,
                          (userSnapshot) => {
                            const userBookmarks = userSnapshot.docs.map(
                              (doc) => ({
                                id: doc.id,
                                ...doc.data(),
                                addedByAdmin: false,
                              })
                            );

                            // Combine admin links and user bookmarks
                            const allBookmarks = [
                              ...adminLinks,
                              ...userBookmarks,
                            ];
                            console.log(
                              `Loaded ${allBookmarks.length} bookmarks for ${categoryType}`
                            );
                            setBookmarks(allBookmarks);
                            setLoading(false);
                          },
                          (error) => {
                            console.error(
                              "Error in user bookmarks listener:",
                              error
                            );
                            // // Add error handling for user bookmarks listener
                            // //(
                            //   "Error loading bookmarks. Please refresh the page."
                            // );
                            setLoading(false);
                          }
                        );

                        unsubscribes.push(userBookmarksUnsubscribe);
                      })
                      .catch((error) => {
                        console.error(
                          "Error fetching latest hidden IDs:",
                          error
                        );
                        setLoading(false);
                      });
                  },
                  (error) => {
                    console.error("Error in admin links listener:", error);
                    // Add error handling for admin links listener
                    // //(
                    //   "Error loading admin links. Please refresh the page."
                    // );
                    setLoading(false);
                  }
                );

                unsubscribes.push(adminLinksUnsubscribe);
              } else {
                // If no admin category found, just fetch user bookmarks
                const userBookmarksQuery = query(
                  collection(db, "users", currentUser.uid, "bookmarks"),
                  where("category", "==", categoryType)
                );

                const userBookmarksUnsubscribe = onSnapshot(
                  userBookmarksQuery,
                  (userSnapshot) => {
                    const userBookmarks = userSnapshot.docs
                      .map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                        addedByAdmin: false,
                      }))
                      .filter((bookmark) => !bookmark.hidden);

                    console.log(
                      `Loaded ${userBookmarks.length} user bookmarks for ${categoryType}`
                    );
                    setBookmarks(userBookmarks);
                    setLoading(false);
                  },
                  (error) => {
                    console.error("Error in user bookmarks listener:", error);
                    setLoading(false);
                  }
                );

                unsubscribes.push(userBookmarksUnsubscribe);
              }
            },
            (error) => {
              console.error("Error in category listener:", error);
              setLoading(false);
            }
          );

          unsubscribes.push(unsubscribeCategory);
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Add error handling for fetching user data
          //("Error loading bookmarks. Please refresh the page.");
          setLoading(false);

          // Load defaults as fallback
          const fallbackBookmarks =
            getDefaultBookmarksForCategory(categoryType);
          setBookmarks(fallbackBookmarks);
        }
      } else {
        // Load from localStorage for non-logged-in users
        const localBookmarks = getBookmarksFromLocal();
        const localHiddenIds = getHiddenBookmarksFromLocal();

        console.log(
          `Loaded ${localBookmarks.length} local bookmarks for ${categoryType}`
        );
        setBookmarks(localBookmarks);
        setHiddenBookmarkIds(localHiddenIds);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      // Clean up all snapshot listeners
      unsubscribes.forEach((unsub) => {
        if (typeof unsub === "function") unsub();
      });
    };
  }, [categoryType]);

  useEffect(() => {
    if (showSettings && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom - 340,
        right: window.innerWidth - rect.right,
      });
      preventScroll(true);
    } else {
      preventScroll(false);
    }
    return () => preventScroll(false);
  }, [showSettings]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both the settings menu and the settings button
      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        componentRef.current &&
        !componentRef.current.contains(event.target)
      ) {
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
    } catch (error) {
      return `https://www.google.com/s2/favicons?sz=64&domain=google.com`; // Default favicon
    }
  };

  const getIconSizeClass = () => {
    switch (iconSize) {
      case "small":
        return "w-4 h-4";
      case "large":
        return "w-8 h-8";
      default:
        return "w-6 h-6";
    }
  };

  const handleDelete = async (bookmark) => {
    try {
      if (user) {
        // For logged-in users
        if (bookmark.addedByAdmin) {
          // For admin-added bookmarks, we hide them rather than delete
          const newHiddenIds = [...hiddenBookmarkIds, bookmark.id];

          // Update Firestore first
          const userDocRef = doc(db, "users", user.uid);
          await setDoc(
            userDocRef,
            { hiddenCategoryBookmarks: newHiddenIds },
            { merge: true }
          );

          // Only update local state after the Firebase operation completes successfully
          setHiddenBookmarkIds(newHiddenIds);
          setBookmarks((prevBookmarks) =>
            prevBookmarks.filter((item) => item.id !== bookmark.id)
          );

          //("Bookmark hidden successfully!");
        } else {
          // For user-added bookmarks, delete the document
          try {
            const bookmarkRef = doc(
              db,
              "users",
              user.uid,
              "bookmarks",
              bookmark.id
            );

            // Check if bookmark exists before attempting to delete
            const bookmarkDoc = await getDoc(bookmarkRef);
            if (bookmarkDoc.exists()) {
              console.log("Deleting bookmark:", bookmark.name);
              await deleteDoc(bookmarkRef);

              // Manually update UI state to reflect deletion immediately
              // This prevents the need to wait for the onSnapshot to update
              setBookmarks((prevBookmarks) =>
                prevBookmarks.filter((item) => item.id !== bookmark.id)
              );

              //("Bookmark deleted successfully!");
            } else {
              console.log("Bookmark not found:", bookmark.id);
              // Remove it from the UI regardless since it doesn't exist in Firestore
              setBookmarks((prevBookmarks) =>
                prevBookmarks.filter((item) => item.id !== bookmark.id)
              );
            }
          } catch (deleteError) {
            console.error("Error during bookmark deletion:", deleteError);
            //(`Failed to delete bookmark: ${deleteError.message}`);
          }
        }
      } else {
        // For non-logged-in users (localStorage)
        if (bookmark.addedByAdmin) {
          const newHiddenIds = [...hiddenBookmarkIds, bookmark.id];
          setHiddenBookmarkIds(newHiddenIds);
          saveHiddenBookmarksToLocal(newHiddenIds);

          setBookmarks((prevBookmarks) =>
            prevBookmarks.filter((item) => item.id !== bookmark.id)
          );
        } else {
          const updatedBookmarks = bookmarks.filter(
            (b) => b.id !== bookmark.id
          );
          setBookmarks(updatedBookmarks);
          saveBookmarksToLocal(updatedBookmarks);
        }
        //("Bookmark deleted successfully!");
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
      //(`Failed to process bookmark: ${error.message}`);
    }
  };

  const handleAdd = async () => {
    try {
      if (!newBookmark.name || !newBookmark.link) {
        //("Please fill in all fields");
        return;
      }

      // Validate URL format
      let formattedUrl = newBookmark.link;
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }

      const bookmarkData = {
        id: Date.now().toString(), // Generate unique ID for local storage
        name: newBookmark.name,
        link: formattedUrl,
        category: categoryType,
        addedByAdmin: false,
        createdAt: new Date().toISOString(),
      };

      if (user) {
        // Remove id field as Firestore will generate its own
        const { id, ...firestoreData } = bookmarkData;

        // Add to Firestore
        await addDoc(
          collection(db, "users", user.uid, "bookmarks"),
          firestoreData
        );

        // Don't manually update the state - let the onSnapshot listener handle it
      } else {
        // Add to localStorage for non-logged-in users
        const updatedBookmarks = [...bookmarks, bookmarkData];
        setBookmarks(updatedBookmarks);
        saveBookmarksToLocal(updatedBookmarks);
      }

      //("Bookmark added successfully!");
      setShowAddModal(false);
      setNewBookmark({ name: "", link: "" });
    } catch (error) {
      console.error("Error adding bookmark:", error);
      // //(`Failed to add bookmark: ${error.message}`);
    }
  };

  const handleEdit = async () => {
    try {
      if (!editingBookmark.name || !editingBookmark.link) {
        // //("Please fill in all fields");
        return;
      }

      if (user) {
        // Handle editing based on whether it's an admin bookmark or user bookmark
        if (editingBookmark.addedByAdmin) {
          // For admin bookmarks, hide the original and add a new user bookmark
          const newHiddenIds = [...hiddenBookmarkIds, editingBookmark.id];
          setHiddenBookmarkIds(newHiddenIds);

          // Hide the admin bookmark
          const userDocRef = doc(db, "users", user.uid);
          await setDoc(
            userDocRef,
            { hiddenCategoryBookmarks: newHiddenIds },
            { merge: true }
          );

          // Add as a new user bookmark
          const newBookmarkData = {
            name: editingBookmark.name,
            link: editingBookmark.link,
            category: categoryType,
            addedByAdmin: false,
            createdAt: new Date().toISOString(),
          };

          await addDoc(
            collection(db, "users", user.uid, "bookmarks"),
            newBookmarkData
          );
        } else {
          // For user bookmarks, update the existing document
          const bookmarkRef = doc(
            db,
            "users",
            user.uid,
            "bookmarks",
            editingBookmark.id
          );
          await updateDoc(bookmarkRef, {
            name: editingBookmark.name,
            link: editingBookmark.link,
          });
        }
      } else {
        // Update in localStorage for non-logged-in users
        const updatedBookmarks = bookmarks.map((bookmark) =>
          bookmark.id === editingBookmark.id
            ? {
                ...bookmark,
                name: editingBookmark.name,
                link: editingBookmark.link,
              }
            : bookmark
        );
        setBookmarks(updatedBookmarks);
        saveBookmarksToLocal(updatedBookmarks);
      }

      //("Bookmark updated successfully!");
      setShowEditModal(false);
      setEditingBookmark(null);
    } catch (error) {
      // //("Failed to update bookmark");
      console.error("Error updating bookmark:", error);
    }
  };

  const renderSettingsMenu = () => {
    const dropdownContent = showSettings && (
      <div
        ref={settingsMenuRef}
        className={`absolute w-48 bg-white dark:text-white dark:bg-[#28283A] rounded-sm shadow-lg border border-gray-200 dark:border-gray-700 z-[9998]`}
        style={{
          top: `${dropdownPosition.top}px`,
          right: `${dropdownPosition.right}px`,
        }}
      >
        <div className="p-2">
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 p-2">
              Display
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1 rounded ${
                  viewMode === "list"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 rounded ${
                  viewMode === "grid"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("cloud")}
                className={`p-1 rounded ${
                  viewMode === "cloud"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Cloud
              </button>
            </div>
          </div>

          <div className="mb-4 border-t dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 p-2">
              Icon Size
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setIconSize("small")}
                className={`p-1 w-10 mx-2 rounded ${
                  iconSize === "small"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                S
              </button>
              <button
                onClick={() => setIconSize("medium")}
                className={`p-1 w-10 mx-2 rounded ${
                  iconSize === "medium"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                M
              </button>
              <button
                onClick={() => setIconSize("large")}
                className={`p-1 w-10 mx-2 rounded ${
                  iconSize === "large"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                L
              </button>
            </div>
          </div>

          <div className="mb-4 border-t dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 p-2">
              Title Lines
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setTitleLines(1)}
                className={`p-1 w-10 mx-2 rounded ${
                  titleLines === 1
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                1
              </button>
              <button
                onClick={() => setTitleLines(2)}
                className={`p-1 w-10 mx-2 rounded ${
                  titleLines === 2
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                2
              </button>
              <button
                onClick={() => setTitleLines(0)}
                className={`p-1 w-10 mx-2 rounded ${
                  titleLines === 0
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                All
              </button>
            </div>
          </div>

          <div className="border-t dark:border-gray-700 p-2 rounded ">
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 py-2 rounded">
              <input
                type="checkbox"
                checked={showUrl}
                onChange={() => setShowUrl(!showUrl)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              Show Name
            </label>
          </div>

          <div className="border-t dark:border-gray-700 pt-2">
            <button
              onClick={() => {
                setShowSettings(false);
                setShowEditModal(true);
              }}
              className="flex items-center gap-2 p-2 w-full rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
            >
              <Edit className="w-4 h-4" />
              Edit Bookmarks
            </button>
          </div>
        </div>
      </div>
    );

    return (
      <div className="relative backdrop-blur-sm isolate flex justify-between w-full">
        {dropdownContent && createPortal(dropdownContent, document.body)}
      </div>
    );
  };

  const renderBookmarks = () => {
    const commonClasses = {
      container: "transition-all duration-200 ease-in-out cursor-pointer",
      image: `${getIconSizeClass()} rounded`,
      title: `font-medium text-gray-900 dark:text-gray-100 break-words ${
        viewMode === "grid"
          ? titleLines === 0
            ? "whitespace-normal"
            : `line-clamp-${titleLines}`
          : ""
      }`,
    };

    const views = {
      list: {
        container: "flex flex-col space-y-2",
        item: "flex items-center p-2 rounded-sm bg-gray-50/[(var(--bg-opacity))] dark:bg-gray-700/[(var(--bg-opacity))] hover:bg-gray-100 dark:hover:bg-gray-600",
        content: "flex items-center gap-2 w-full",
        details: "flex-grow",
      },
      grid: {
        container: `grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4`,
        item: "flex flex-col items-center p-2 rounded-sm bg-gray-50/[(var(--bg-opacity))] dark:bg-gray-700/[(var(--bg-opacity))] hover:bg-gray-100 dark:hover:bg-gray-600",
        content: "flex flex-col items-center text-center w-full",
        details: "w-full mt-2 overflow-hidden",
      },
      cloud: {
        container: "flex flex-wrap gap-4",
        item: "flex items-center justify-center p-2 rounded-full bg-gray-50/[(var(--bg-opacity))] dark:bg-gray-700/[(var(--bg-opacity))] hover:bg-gray-100 dark:hover:bg-gray-600",
        content: "flex items-center gap-2 w-fit",
      },
    };

    const currentView = views[viewMode];

    return (
      <div className={`${currentView.container} pt-3`}>
        {bookmarks.map((item) => (
          <a
            key={item.id}
            href={item.link}
            className={`${commonClasses.container} ${currentView.item} `}
          >
            <div className={currentView.content}>
              <img
                src={getFaviconUrl(item.link)}
                alt=""
                className={commonClasses.image}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://www.google.com/favicon.ico";
                }}
              />
              <div className={currentView.details}>
                {showUrl && (
                  <div className={`${commonClasses.title} text-sm`}>
                    {item.name}
                  </div>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    );
  };

  // Helper function to get default bookmarks for a category
  const getDefaultBookmarksForCategory = (category) => {
    // Fallback default data in case the defaultBookmarks is undefined
    const fallbackDefaults = {
      Popular: [
        {
          id: "google",
          name: "Google",
          link: "https://www.google.com",
          addedByAdmin: true,
        },
        {
          id: "youtube",
          name: "YouTube",
          link: "https://www.youtube.com",
          addedByAdmin: true,
        },
      ],
      Shopping: [
        {
          id: "amazon",
          name: "Amazon",
          link: "https://www.amazon.com",
          addedByAdmin: true,
        },
        {
          id: "walmart",
          name: "Walmart",
          link: "https://www.walmart.com",
          addedByAdmin: true,
        },
        {
          id: "target",
          name: "Target",
          link: "https://www.target.com",
          addedByAdmin: true,
        },
        {
          id: "bestbuy",
          name: "Best Buy",
          link: "https://www.bestbuy.com",
          addedByAdmin: true,
        },
        {
          id: "ebay",
          name: "Ebay",
          link: "https://www.ebay.com",
          addedByAdmin: true,
        },
      ],
      AI: [
        {
          id: "chatgpt",
          name: "ChatGPT",
          link: "https://chat.openai.com",
          addedByAdmin: true,
        },
        {
          id: "bard",
          name: "Google Bard",
          link: "https://bard.google.com",
          addedByAdmin: true,
        },
      ],
      News: [
        {
          id: "cnn",
          name: "CNN",
          link: "https://www.cnn.com",
          addedByAdmin: true,
        },
        {
          id: "bbc",
          name: "BBC",
          link: "https://www.bbc.com",
          addedByAdmin: true,
        },
      ],
      Travel: [
        {
          id: "expedia",
          name: "Expedia",
          link: "https://www.expedia.com",
          addedByAdmin: true,
        },
        {
          id: "booking",
          name: "Booking.com",
          link: "https://www.booking.com",
          addedByAdmin: true,
        },
      ],
      Sports: [
        {
          id: "espn",
          name: "ESPN",
          link: "https://www.espn.com",
          addedByAdmin: true,
        },
        {
          id: "nba",
          name: "NBA",
          link: "https://www.nba.com",
          addedByAdmin: true,
        },
      ],
      Jobs: [
        {
          id: "job1",
          name: "LinkedIn Jobs",
          link: "https://www.linkedin.com/jobs",
          addedByAdmin: true,
        },
        {
          id: "job2",
          name: "Indeed",
          link: "https://www.indeed.com",
          addedByAdmin: true,
        },
      ],
    };

    // Try to get from imported defaults first
    const fromImported = defaultBookmarks[category] || [];

    // If imported defaults are empty, use our fallback defaults
    return fromImported.length > 0
      ? fromImported
      : fallbackDefaults[category] || [];
  };

  return (
    <div
      ref={componentRef}
      className="relative rounded-sm p-1 shadow-sm isolate backdrop-blur-sm"
      onMouseEnter={() => !collapsed && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: collapsed ? "none" : "block",
        height: collapsed ? 0 : "auto",
        overflow: "hidden",
        transition: "height 0.2s ease-in-out",
      }}
    >
      <div className="flex justify-end relative z-[9999]">
        {!collapsed && renderSettingsMenu()}
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-24 text-gray-600 dark:text-gray-300">
          Loading...
        </div>
      ) : (
        <div className="pb-10">
          {!collapsed && renderBookmarks()}
          {!collapsed && (
            <>
              <Modal
                title="Add New Bookmark"
                open={showAddModal}
                onOk={handleAdd}
                onCancel={() => {
                  setShowAddModal(false);
                  setNewBookmark({ name: "", link: "" });
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <Input
                      value={newBookmark.name}
                      onChange={(e) =>
                        setNewBookmark({ ...newBookmark, name: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAdd();
                        }
                      }}
                      placeholder="Enter bookmark name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      URL
                    </label>
                    <Input
                      value={newBookmark.link}
                      onChange={(e) =>
                        setNewBookmark({ ...newBookmark, link: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAdd();
                        }
                      }}
                      placeholder="Enter bookmark URL"
                    />
                  </div>
                </div>
              </Modal>
              <Modal
                title="Edit Bookmarks"
                open={showEditModal}
                footer={null}
                onCancel={() => {
                  setShowEditModal(false);
                  setEditingBookmark(null);
                }}
              >
                <div className="space-y-2">
                  {bookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="flex items-center justify-between p-4 rounded-sm bg-gray-50 dark:bg-gray-700"
                    >
                      <div className="flex items-center  gap-3">
                        <img
                          src={getFaviconUrl(bookmark.link)}
                          alt=""
                          className="w-6 h-6"
                        />
                        <div>
                          <div className="font-medium dark:text-white">
                            {bookmark.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {bookmark.link}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingBookmark(bookmark);
                          }}
                          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(bookmark)}
                          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Modal>
              {editingBookmark && (
                <Modal
                  title="Edit Bookmark"
                  open={!!editingBookmark}
                  onOk={handleEdit}
                  onCancel={() => {
                    setEditingBookmark(null);
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name
                      </label>
                      <Input
                        value={editingBookmark.name}
                        onChange={(e) =>
                          setEditingBookmark({
                            ...editingBookmark,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter bookmark name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        URL
                      </label>
                      <Input
                        value={editingBookmark.link}
                        onChange={(e) =>
                          setEditingBookmark({
                            ...editingBookmark,
                            link: e.target.value,
                          })
                        }
                        placeholder="Enter bookmark URL"
                      />
                    </div>
                  </div>
                </Modal>
              )}
            </>
          )}
          {isHovered && !collapsed && (
            <div className="fixed bottom-1 right-1 flex gap-2 p-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50">
              <button
                onClick={() => {
                  setShowSettings(false);
                  setNewBookmark({ name: "", link: "" });
                  setShowAddModal(true);
                }}
                className="flex dark:text-white/50 items-center rounded-sm gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                ref={buttonRef}
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-sm dark:text-white/50 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryHome;