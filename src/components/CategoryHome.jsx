import { useState, useEffect, useRef } from "react";

import { createPortal } from "react-dom";
import { db, auth } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { X, Folder, Plus, Settings as SettingsIcon } from "lucide-react";
// Modal and Input removed (no longer used)
import PropTypes from "prop-types";
import { defaultBookmarks } from "../firebase/widgetLayouts";

const CategoryHome = ({ categoryType, collapsed = false }) => {
  // Removed unused user state
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode] = useState('subcategory'); // 'subcategory' or 'all'
  const [showSettings, setShowSettings] = useState(false);
  // Removed unused showUrl, iconSize, titleLines, dropdownPosition
  // Removed unused modal and hover state
  const buttonRef = useRef(null);
  const settingsMenuRef = useRef(null);
  const componentRef = useRef(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  // Removed modal state
  const [openSubcategory, setOpenSubcategory] = useState(null);
  const subcatButtonRefs = useRef({});
  const popupRef = useRef(null);
  // Removed showAllPopup state
  // Removed unused setDisplayMode
  const [showExtendPopup, setShowExtendPopup] = useState(false);
  // const [extendBookmarks, setExtendBookmarks] = useState([]); // No longer used
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState("");
  const [addLink, setAddLink] = useState("");
  const [addSubcategory, setAddSubcategory] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  // Add new state for list view
  const [mainViewMode, setMainViewMode] = useState('subcategory'); // 'subcategory', 'all', or 'list'
  const [selectedCategory, setSelectedCategory] = useState(Object.keys(defaultBookmarks)[0]);

  // Add localStorage keys
  const bookmarksStorageKey = `bookmarks_${categoryType}`;
  // Removed unused hiddenBookmarksStorageKey

  // Add localStorage helper functions
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

    // If no saved bookmarks or invalid data, return default bookmarks for the category and subcategory
    const defaultCategoryBookmarks = getDefaultBookmarksForCategory(categoryType, selectedSubcategory);

    // Save default bookmarks to localStorage
    localStorage.setItem(
      bookmarksStorageKey,
      JSON.stringify(defaultCategoryBookmarks)
    );
    return defaultCategoryBookmarks;
  };

  // Removed unused saveHiddenBookmarksToLocal

  // Removed unused getHiddenBookmarksFromLocal

  const preventScroll = (prevent) => {
    document.body.style.overflow = prevent ? "hidden" : "";
  };

  // Helper function to get all subcategories for a category
  const getSubcategoriesForCategory = (category) => {
    if (subcategories.length > 0) return subcategories;
    // fallback to defaultBookmarks if no Firestore subcategories
    const imported = defaultBookmarks[category];
    if (imported && typeof imported === 'object' && !Array.isArray(imported)) {
      return Object.keys(imported);
    }
    return [];
  };

  // Helper function to get default bookmarks for a category and subcategory
  const getDefaultBookmarksForCategory = (category, subcategory) => {
    const imported = defaultBookmarks[category];
    if (imported && typeof imported === 'object' && !Array.isArray(imported)) {
      if (subcategory && imported[subcategory]) {
        return imported[subcategory];
      }
      // fallback to first subcategory if not specified
      const subcats = Object.keys(imported);
      if (subcats.length > 0) {
        return imported[subcats[0]];
      }
    }
    return [];
  };

  // Helper to get all categories
  const getAllCategories = () => Object.keys(defaultBookmarks);

  // Helper to get all bookmarks for a category (flatten all subcategories)
  const getAllBookmarksForCategoryList = (cat) => {
    const catObj = defaultBookmarks[cat];
    if (!catObj) return [];
    return Object.values(catObj).flat();
  };

  // Fetch subcategories from Firestore when categoryType changes
  useEffect(() => {
    if (!categoryType) return;
    const categoryQuery = query(collection(db, "category"), where("newCategory", "==", categoryType));
    const unsubscribe = onSnapshot(categoryQuery, (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        setSubcategories(Array.isArray(docData.subcategories) ? docData.subcategories : []);
      } else {
        setSubcategories([]);
      }
    });
    return () => unsubscribe();
  }, [categoryType]);

  // Update selectedSubcategory on categoryType or subcategories change
  useEffect(() => {
    const subcats = getSubcategoriesForCategory(categoryType);
    setSelectedSubcategory(subcats[0] || null);
  }, [categoryType, subcategories]);

  useEffect(() => {
    let unsubscribes = [];

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);

      if (currentUser) {
        // Only show Firestore bookmarks (admin + user), ignore defaultBookmarks
        const userDocRef = doc(db, "users", currentUser.uid);
        try {
          await getDoc(userDocRef);
          const categoryQuery = query(
            collection(db, "category"),
            where("newCategory", "==", categoryType)
          );
          const unsubscribeCategory = onSnapshot(
            categoryQuery,
            async (categorySnapshot) => {
              unsubscribes.forEach((unsub) => {
                if (typeof unsub === "function") unsub();
              });
              unsubscribes = [];

              if (!categorySnapshot.empty) {
                const categoryDoc = categorySnapshot.docs[0];
                const categoryId = categoryDoc.id;
                // Fetch admin links for this category (addedByAdmin: true)
                const adminLinksQuery = query(
                  collection(db, "links"),
                  where("category", "==", categoryId),
                  where("addedByAdmin", "==", true)
                );
                const adminLinksUnsubscribe = onSnapshot(
                  adminLinksQuery,
                  (adminLinksSnapshot) => {
                    getDoc(userDocRef)
                      .then((latestUserDoc) => {
                        const latestHiddenIds = latestUserDoc.exists()
                          ? latestUserDoc.data().hiddenCategoryBookmarks || []
                          : [];
                        let adminLinksFiltered = adminLinksSnapshot.docs
                          .map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                            addedByAdmin: true,
                          }))
                          .filter(
                            (bookmark) => !latestHiddenIds.includes(bookmark.id)
                          );
                        // Fetch user's personal bookmarks
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
                            // Only show admin + user bookmarks (no defaultBookmarks)
                            const allBookmarks = [
                              ...adminLinksFiltered,
                              ...(viewMode === 'all'
                                ? userBookmarks
                                : userBookmarks.filter(b => b.subcategory === selectedSubcategory))
                            ];
                            setBookmarks(allBookmarks);
                            setLoading(false);
                          },
                          () => {
                            setLoading(false);
                          }
                        );
                        unsubscribes.push(userBookmarksUnsubscribe);
                      })
                      .catch(() => {
                        setLoading(false);
                      });
                  },
                  () => {
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
                    setBookmarks(userBookmarks);
                    setLoading(false);
                  },
                  () => {
                    setLoading(false);
                  }
                );
                unsubscribes.push(userBookmarksUnsubscribe);
              }
            },
            () => {
              setLoading(false);
            }
          );
          unsubscribes.push(unsubscribeCategory);
        } catch {
          setLoading(false);
          setBookmarks([]); // Do not fallback to defaultBookmarks
        }
      } else {
        // Not logged in: show only defaultBookmarks
        const localBookmarks = getBookmarksFromLocal();
        let filtered = localBookmarks;
        if (selectedSubcategory) {
          filtered = localBookmarks.filter(b => b.subcategory === selectedSubcategory);
        }
        setBookmarks(filtered);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribes.forEach((unsub) => {
        if (typeof unsub === "function") unsub();
      });
    };
  }, [categoryType, selectedSubcategory, viewMode]);

  useEffect(() => {
    if (showSettings && buttonRef.current) {
      // Removed unused setDropdownPosition and rect
      preventScroll(true);
    } else {
      preventScroll(false);
    }
    return () => preventScroll(false);
  }, [showSettings]);

  // The settings menu closes on outside click of the entire CategoryHome component, but user-selected options persist
  useEffect(() => {
    // Close the settings menu if a click occurs outside both the CategoryHome component and the settings menu
    const handleClickOutside = (event) => {
      if (
        componentRef.current &&
        !componentRef.current.contains(event.target) &&
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target)
      ) {
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close popup on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        !Object.values(subcatButtonRefs.current).some((btn) => btn && btn.contains(event.target))
      ) {
        setOpenSubcategory(null);
      }
    }
    if (openSubcategory) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openSubcategory]);

  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
    } catch {
      return `https://www.google.com/s2/favicons?sz=64&domain=google.com`; // Default favicon
    }
  };

  // Removed unused handleDelete

  // Add Bookmark handler
  const handleAddBookmark = async (e) => {
    e.preventDefault();
    setAddError("");
    if (!addName.trim() || !addLink.trim() || !addSubcategory.trim()) {
      setAddError("Please fill all fields.");
      return;
    }
    setAddLoading(true);
    try {
      if (auth.currentUser) {
        // Firestore: add to user's bookmarks
        await addDoc(collection(db, "users", auth.currentUser.uid, "bookmarks"), {
          name: addName.trim(),
          link: addLink.trim(),
          category: categoryType,
          subcategory: addSubcategory,
          createdAt: new Date(),
        });
      } else {
        // Guest: add to localStorage
        const local = getBookmarksFromLocal();
        const newBookmark = {
          id: `local_${Date.now()}`,
          name: addName.trim(),
          link: addLink.trim(),
          category: categoryType,
          subcategory: addSubcategory,
        };
        local.push(newBookmark);
        localStorage.setItem(bookmarksStorageKey, JSON.stringify(local));
      }
      setShowAddForm(false);
      setAddName("");
      setAddLink("");
      setAddSubcategory("");
      setAddError("");
      // Bookmarks will refresh via snapshot/local effect
    } catch {
      setAddError("Failed to add bookmark.");
    }
    setAddLoading(false);
  };

  // Removed unused handleEdit

  // View mode toggle (outside settings)
  // Removed unused renderViewModeToggle

  // Removed unused renderActionButtons

  // Helper function to get bookmarks for a subcategory
  const getBookmarksForSubcategory = (subcat) => {
    return bookmarks.filter(b => b.subcategory === subcat);
  };

  // All bookmarks for the category (ignoring subcategory)
  const getAllBookmarksForCategory = () => {
    if (bookmarks.length > 0) {
      // Combine all bookmarks, regardless of subcategory
      return bookmarks;
    }
    // For guests: combine all default bookmarks from all subcategories
    const allDefaults = defaultBookmarks[categoryType];
    if (allDefaults && typeof allDefaults === 'object') {
      return Object.values(allDefaults).flat();
    }
    return [];
  };

  // Bookmarks rendering for all display modes
  const renderBookmarksList = (items, displayMode) => {
    if (!items || items.length === 0) {
      return <div className="text-center text-gray-500">No bookmarks found.</div>;
    }
    if (displayMode === 'grid') {
      return (
        <div className="grid grid-cols-5 gap-4 pt-2">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group"
            >
              <img
                src={getFaviconUrl(item.link)}
                alt=""
                className="w-10 h-10 rounded mb-2"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://www.google.com/favicon.ico";
                }}
              />
              <span className="text-center text-gray-900 dark:text-gray-100 truncate w-full">
                {item.name}
              </span>
            </a>
          ))}
        </div>
      );
    } else if (displayMode === 'cloud') {
      return (
        <div className="flex flex-wrap gap-3 pt-2">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition cursor-pointer group"
            >
              <img
                src={getFaviconUrl(item.link)}
                alt=""
                className="w-6 h-6 rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://www.google.com/favicon.ico";
                }}
              />
              <span className="text-gray-900 dark:text-gray-100 truncate">
                {item.name}
              </span>
            </a>
          ))}
        </div>
      );
    } else {
      // list view
      return (
        <div className="flex flex-col gap-1 pt-2">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer group"
            >
              <img
                src={getFaviconUrl(item.link)}
                alt=""
                className="w-6 h-6 rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://www.google.com/favicon.ico";
                }}
              />
              <span className="flex-1 text-gray-900 dark:text-gray-100 truncate">
                {item.name}
              </span>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>
          ))}
        </div>
      );
    }
  };

  // Render all bookmarks inline (same style as subcategory bookmarks)
  const renderAllBookmarksInline = () => {
    const allBookmarks = getAllBookmarksForCategory();
    return (
      <div className="flex flex-col gap-1 mt-2">
        {renderBookmarksList(allBookmarks, 'grid')}
      </div>
    );
  };

  // In subcategory view, render bookmarks for selected subcategory
  const renderSubcategoryBookmarksInline = () => {
    if (!selectedSubcategory) return null;
    const subcatBookmarks = getBookmarksForSubcategory(selectedSubcategory);
    return (
      <div className="flex flex-col gap-1 mt-2">
        {renderBookmarksList(subcatBookmarks, 'grid')}
      </div>
    );
  };

  // Subcategory selector UI
  const renderSubcategorySelector = () => {
    const subcategories = getSubcategoriesForCategory(categoryType);
    if (subcategories.length === 0) return null;
    return (
      <div className="flex flex-col gap-1 mb-2 w-full">
        <div className="mb-2 font-semibold text-gray-700 dark:text-gray-200 text-base">Subcategories</div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {subcategories.map((subcatObj) => {
            const subcat = typeof subcatObj === 'string' ? subcatObj : subcatObj.name;
            const iconUrl = typeof subcatObj === 'object' ? subcatObj.iconUrl : '';
            return (
              <button
                key={subcat}
                ref={el => (subcatButtonRefs.current[subcat] = el)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition text-sm font-medium shadow-sm whitespace-nowrap
                  ${openSubcategory === subcat
                    ? 'bg-blue-600 text-white border-blue-700 shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300'}
                `}
                style={{ minWidth: 120 }}
                onClick={() => setOpenSubcategory(openSubcategory === subcat ? null : subcat)}
              >
                {iconUrl ? (
                  <img src={iconUrl} alt="icon" className="w-5 h-5 rounded object-cover border border-gray-200 dark:border-gray-700" />
                ) : (
                  <Folder className="w-5 h-5 text-blue-400 dark:text-blue-300" />
                )}
                <span className="truncate">{subcat}</span>
              </button>
            );
          })}
        </div>
        {openSubcategory && renderSubcategoryPopup(openSubcategory)}
      </div>
    );
  };

  // Floating popup for bookmarks
  const renderSubcategoryPopup = (subcat) => {
    // Centered popup
    const style = {
      position: 'fixed',
      zIndex: 9999,
      minWidth: 220,
      maxWidth: 320,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
    // Find the subcategory object to get iconUrl
    const subcategories = getSubcategoriesForCategory(categoryType);
    const subcatObj = subcategories.find(s => (typeof s === 'string' ? s : s.name) === subcat);
    const iconUrl = typeof subcatObj === 'object' ? subcatObj.iconUrl : '';
    const subcatBookmarks = getBookmarksForSubcategory(subcat);
    const displayBookmarks = subcatBookmarks.length > 0
      ? subcatBookmarks
      : getDefaultBookmarksForCategory(categoryType, subcat);
    // Overlay
    const overlay = (
      <div
        onClick={() => setOpenSubcategory(null)}
        style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
        className="bg-black bg-opacity-80"
      />
    );
    // Popup
    const popupContent = (
      <div
        ref={popupRef}
        style={style}
        className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-xs w-full max-h-96 overflow-y-auto"
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
          onClick={() => setOpenSubcategory(null)}
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <div className="mb-2 font-semibold text-gray-800 dark:text-gray-100 text-lg flex items-center gap-2">
          {iconUrl ? (
            <img src={iconUrl} alt="icon" className="w-6 h-6 rounded object-cover border border-gray-200 dark:border-gray-700" />
          ) : (
            <Folder className="w-5 h-5 text-blue-400 dark:text-blue-300" />
          )}
          <span>{subcat}</span>
        </div>
        {displayBookmarks.length === 0 ? (
          <div className="text-center text-gray-500">No bookmarks found.</div>
        ) : (
          <div className="flex flex-col gap-1">
            {displayBookmarks.map((item) => (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer group"
              >
                <img
                  src={getFaviconUrl(item.link)}
                  alt=""
                  className="w-6 h-6 rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://www.google.com/favicon.ico";
                  }}
                />
                <span className="flex-1 text-gray-900 dark:text-gray-100 truncate">
                  {item.name}
                </span>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </a>
            ))}
          </div>
        )}
      </div>
    );
    return (
      <>
        {createPortal(overlay, document.body)}
        {createPortal(popupContent, document.body)}
      </>
    );
  };

  // Removed unused renderBookmarks

  // Removed useEffect for showAllPopup

  // Extend popup/modal for all bookmarks
  const renderExtendPopup = () => {
    const allBookmarks = getAllBookmarksForCategory();
    // Overlay
    const overlay = (
      <div
        onClick={() => setShowExtendPopup(false)}
        style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
        className="bg-black bg-opacity-80"
      />
    );
    // Popup
    const style = {
      position: 'fixed',
      zIndex: 9999,
      minWidth: 320,
      maxWidth: 700,
      width: '90vw',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      maxHeight: '80vh',
      overflowY: 'auto',
    };
    const popupContent = (
      <div
        style={style}
        className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
          onClick={() => setShowExtendPopup(false)}
          aria-label="Close"
        >
          <X size={22} />
        </button>
        <div className="mb-4 font-semibold text-gray-800 dark:text-gray-100 text-xl text-center">
          All Bookmarks
        </div>
        {renderBookmarksList(allBookmarks, 'grid')}
      </div>
    );
    return (
      <>
        {createPortal(overlay, document.body)}
        {createPortal(popupContent, document.body)}
      </>
    );
  };

  // (handleExtendClick removed as it's not used)

  // Render category list view (like SearchPage navigation)
  const renderCategoryListView = () => (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-4">
        {getAllCategories().map((cat) => (
          <button
            key={cat}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-500 text-white dark:bg-[#513a7a]'
                : 'dark:text-white hover:bg-gray-100 dark:hover:bg-[#28283A] bg-gray-100'
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="mt-2">
        {getAllBookmarksForCategoryList(selectedCategory).length === 0 ? (
          <div className="text-center text-gray-500">No bookmarks found.</div>
        ) : (
          <div className="flex flex-col gap-1">
            {getAllBookmarksForCategoryList(selectedCategory).map((item) => (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer group"
              >
                <img
                  src={`https://www.google.com/s2/favicons?sz=64&domain=${(() => { try { return new URL(item.link).hostname; } catch { return 'google.com'; } })()}`}
                  alt=""
                  className="w-6 h-6 rounded"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.google.com/favicon.ico'; }}
                />
                <span className="flex-1 text-gray-900 dark:text-gray-100 truncate">
                  {item.name}
                </span>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      ref={componentRef}
      className="group relative rounded-sm p-1 shadow-sm isolate backdrop-blur-sm"
      style={{
        display: collapsed ? "none" : "block",
        transition: "height 0.2s ease-in-out",
      }}
    >
      {/* Add main view mode selector */}
      <div className="flex gap-1 mb-4">
          <button
          onClick={() => setMainViewMode('subcategory')}
          className={`px-3 py-2 rounded dark:border-gray-700 focus:outline-none transition text-sm ${mainViewMode === 'subcategory' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}
          >
            By Subcategory
          </button>
          <button
          onClick={() => setMainViewMode('all')}
          className={`px-3 py-2 rounded dark:border-gray-700 focus:outline-none transition text-sm ${mainViewMode === 'all' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}
          >
            All Bookmarks
          </button>
          <button
          onClick={() => setMainViewMode('list')}
          className={`px-3 py-2 rounded dark:border-gray-700 focus:outline-none transition text-sm ${mainViewMode === 'list' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}
        >
          Categories
          </button>
        </div>
      {/* Bookmarks UI: selector and list */}
      {mainViewMode === 'subcategory' && !collapsed && (
        <div className="relative">
          {renderSubcategorySelector()}
          {renderSubcategoryBookmarksInline()}
        </div>
      )}
      {mainViewMode === 'all' && !collapsed && (
        <div className="relative">
          {renderAllBookmarksInline()}
        </div>
      )}
      {mainViewMode === 'list' && !collapsed && renderCategoryListView()}
      {/* Bottom action row: toggle and buttons */}
      <div className="flex items-center justify-end gap-2 mt-6">
        {/* Add and Settings buttons */}
        <button
          className="p-2 rounded bg-gray-100 dark:bg-gray-800 dark:text-white text-gray-700 hover:bg-gray-200 transition"
          onClick={() => {
            setShowAddForm(true);
            setAddSubcategory(selectedSubcategory || "");
          }}
          aria-label="Add Bookmark"
          title="Add Bookmark"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          ref={buttonRef}
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Settings"
          title="Settings"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>
      {showExtendPopup && renderExtendPopup()}
      {loading && (
        <div className="flex justify-center items-center h-24 text-gray-600 dark:text-gray-300">
          Loading...
        </div>
      )}
      {/* Add Bookmark Modal */}
      {showAddForm && (
        createPortal(
          <>
            <div
              onClick={() => setShowAddForm(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
              className="bg-black bg-opacity-60"
            />
            <div
              style={{
                position: 'fixed',
                zIndex: 9999,
                minWidth: 320,
                maxWidth: 400,
                width: '90vw',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
                onClick={() => setShowAddForm(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
              <div className="mb-4 font-semibold text-gray-800 dark:text-gray-100 text-lg text-center">
                Add Bookmark
              </div>
              <form onSubmit={handleAddBookmark} className="flex flex-col gap-3">
                <input
                  type="text"
                  className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
                  placeholder="Name"
                  value={addName}
                  onChange={e => setAddName(e.target.value)}
                  autoFocus
                />
                <input
                  type="url"
                  className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
                  placeholder="https://example.com"
                  value={addLink}
                  onChange={e => setAddLink(e.target.value)}
                />
                <select
                  className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
                  value={addSubcategory}
                  onChange={e => setAddSubcategory(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Subcategory</option>
                  {getSubcategoriesForCategory(categoryType).map(subcat => (
                    <option key={subcat} value={subcat}>{subcat}</option>
                  ))}
                </select>
                {addError && <div className="text-red-500 text-sm">{addError}</div>}
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 mt-2 disabled:opacity-60"
                  disabled={addLoading}
                >
                  {addLoading ? 'Adding...' : 'Add Bookmark'}
                </button>
              </form>
            </div>
          </>,
          document.body
        )
      )}
    </div>
  );
};

export default CategoryHome;

CategoryHome.propTypes = {
  categoryType: PropTypes.string.isRequired,
  collapsed: PropTypes.bool,
};