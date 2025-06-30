import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  deleteDoc,
  writeBatch,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  Button as AntButton,
  Modal,
  Input,
  Space,
  Tooltip,
  Form,
  Dropdown,
  Checkbox,
  Card,
  Empty,
  Row,
  Col,
} from "antd";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  UnorderedListOutlined,
  FontSizeOutlined,
  PictureOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  MenuOutlined,
  ExpandOutlined,
  CompressOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import debounce from "lodash/debounce";
import SkeletonLoader from "./SkeletonLoader";

// Import the ThemeContext and useThemeAware hook
import { useThemeAware } from "../context/ThemeContext";

// Import the BookmarkErrorBoundary component
import BookmarkErrorBoundary from "./BookmarkErrorBoundary";

// Add this debounce utility near the top of the file, after imports
// Add a debounced version of fetchFavicon to avoid excessive network requests
const debouncedFetchFavicon = debounce(async (url, callback) => {
  try {
    if (!url) return;
    const validatedUrl = validateUrl(url);
    const favicon = await fetchFavicon(validatedUrl);
    callback(favicon);
  } catch (error) {
    console.warn("Favicon fetch failed:", error);
    callback("");
  }
}, 500); // Wait 500ms after typing stops

// Add this memoized form component near the top of the file, before the PopularBookmarks function
const MemoizedBookmarkForm = React.memo(
  ({ newBookmark, handleTitleChange, handleUrlChange, onKeyDown }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title
        </label>
        <Input
          value={newBookmark.title}
          onChange={handleTitleChange}
          onKeyDown={onKeyDown}
          placeholder="Enter bookmark title"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL
        </label>
        <Input
          value={newBookmark.url}
          onChange={handleUrlChange}
          onKeyDown={onKeyDown}
          placeholder="Enter URL (e.g. google.com)"
        />
      </div>
    </div>
  ),
  // Only re-render if title or URL actually changed
  (prevProps, nextProps) => {
    return (
      prevProps.newBookmark.title === nextProps.newBookmark.title &&
      prevProps.newBookmark.url === nextProps.newBookmark.url
    );
  }
);

import { Parser } from "htmlparser2"; // Add at the top for HTML parsing

// Import the CountryContext and useCountry hook
import { useCountry } from "../context/CountryContext";

function PopularBookmarks() {
  const { country } = useCountry();
  const [categories, setCategories] = useState([]);
  const [links, setLinks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lineOptions, setLineOptions] = useState(() => {
    const savedLineOptions = localStorage.getItem("bookmarkLineOptions");
    return savedLineOptions ? parseInt(savedLineOptions) : 1;
  });
  // Use the global theme context instead of local state
  const { isDarkMode } = useThemeAware();

  const [categoryViewModes, setCategoryViewModes] = useState(() => {
    const savedViewModes = localStorage.getItem("categoryViewModes");
    return savedViewModes ? JSON.parse(savedViewModes) : {};
  });
  const [isAddCategoryModalVisible, setIsAddCategoryModalVisible] =
    useState(false);
  const [isRenameCategoryModalVisible, setIsRenameCategoryModalVisible] =
    useState(false);
  const [isAddBookmarkModalVisible, setIsAddBookmarkModalVisible] =
    useState(false);
  const [isEditModePanelVisible, setIsEditModePanelVisible] = useState(false);
  const [isEditBookmarkModalVisible, setIsEditBookmarkModalVisible] =
    useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newBookmark, setNewBookmark] = useState({
    title: "",
    url: "",
    favicon: "",
  });
  const [selectedBookmarks, setSelectedBookmarks] = useState([]);
  const [editModeBookmarks, setEditModeBookmarks] = useState([]);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editBookmarkForm] = Form.useForm();
  const [columnCount, setColumnCount] = useState(4);
  const [categoryColumns, setCategoryColumns] = useState({
    column1: [],
    column2: [],
    column3: [],
    column4: [],
  });
  const [categoryPositions, setCategoryPositions] = useState({});
  const [categoryBookmarkSizes, setCategoryBookmarkSizes] = useState({});
  const [hiddenCategories, setHiddenCategories] = useState([]);
  const [openCategories, setOpenCategories] = useState(() => {
    // Load initial state from localStorage
    const savedState = localStorage.getItem("categoryOpenStates");
    return savedState ? JSON.parse(savedState) : {};
  });
  // const [grid, setGrid] = useState(() => {
  //   const savedGridView = localStorage.getItem("bookmarksGridView");
  //   return savedGridView ? JSON.parse(savedGridView) : false;
  // });
  const [hiddenBookmarkIds, setHiddenBookmarkIds] = useState([]);
  const [isControllerOpen, setIsControllerOpen] = useState(false);
  const [previewCategories, setPreviewCategories] = useState([]);
  const [previewColumns, setPreviewColumns] = useState(columnCount);
  const [isApplyingChanges, setIsApplyingChanges] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");
  // Add state for show more/less categories
  const [showAllCategories, setShowAllCategories] = useState(false);
  // Add state for search bar visibility
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);

  // State for previewing imported bookmarks
  const [importedPreview, setImportedPreview] = useState([]);

  // Ref for import bookmarks file input
  const fileInputRef = React.useRef(null);
  // Ref for search bar
  const searchBarRef = React.useRef(null);

  // Add state for Category Manager modal and selection
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [selectedImported, setSelectedImported] = useState([]); // [{catIdx, linkIdx}]

  // Add state for multi-select user categories in Category Manager
  const [selectedUserCategories, setSelectedUserCategories] = useState([]);

  // Import bookmarks from HTML file (now supports Chrome bookmarks format)
  const handleImportBookmarks = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const html = e.target.result;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      let importedCategories = [];
      let rootLevelLinks = [];

      // Chrome bookmarks: parse <DL> structure recursively, always create a category for each <H3>
      function parseDL(dl, parentName = null, isRoot = false) {
        let categories = [];
        let children = Array.from(dl.children);
        for (let i = 0; i < children.length; i++) {
          const el = children[i];
          if (el.tagName === 'DT') {
            const h3 = el.querySelector('h3');
            if (h3) {
              // New folder/category
              const folderName = h3.textContent.trim();
              const nextDL = el.nextElementSibling;
              if (nextDL && nextDL.tagName === 'DL') {
                // Collect all direct links and subfolders
                let links = [];
                let subcategories = [];
                for (let j = 0; j < nextDL.children.length; j++) {
                  const subEl = nextDL.children[j];
                  if (subEl.tagName === 'DT') {
                    const subH3 = subEl.querySelector('h3');
                    if (subH3) {
                      // Subfolder
                      const subDL = subEl.nextElementSibling;
                      if (subDL && subDL.tagName === 'DL') {
                        const subResult = parseDL(subDL, subH3.textContent.trim());
                        subcategories = subcategories.concat(subResult);
                      }
                    } else {
                      const a = subEl.querySelector('a');
                      if (a) {
                        links.push({
                          title: a.textContent,
                          url: a.getAttribute('href'),
                        });
                      }
                    }
                  }
                }
                // Always create a category for this folder, even if it has both links and subfolders
                categories.push({ name: folderName, links });
                categories = categories.concat(subcategories);
              } else {
                // Empty folder
                categories.push({ name: folderName, links: [] });
              }
            } else {
              const a = el.querySelector('a');
              if (a && parentName) {
                // Top-level link under a parent folder
                categories.push({ name: parentName, links: [{ title: a.textContent, url: a.getAttribute('href') }] });
              } else if (a && isRoot) {
                // Root-level link (not in any folder)
                rootLevelLinks.push({ title: a.textContent, url: a.getAttribute('href') });
              }
            }
          }
        }
        return categories;
      }

      // Try Chrome bookmarks format first
      const mainDL = doc.querySelector('dl');
      if (mainDL) {
        importedCategories = parseDL(mainDL, null, true);
        // After parsing, if there are root-level bookmarks, add them as their own category
        if (rootLevelLinks.length > 0) {
          importedCategories.unshift({ name: 'Imported - Uncategorized', links: rootLevelLinks });
        }
      } else {
        // Fallback: old format (h2/ul)
        const categoryHeadings = doc.querySelectorAll('h2');
        categoryHeadings.forEach((heading) => {
          const categoryName = heading.textContent.trim();
          const ul = heading.nextElementSibling;
          if (ul && ul.tagName === 'UL') {
            const links = Array.from(ul.querySelectorAll('a')).map((a) => ({
              title: a.textContent,
              url: a.getAttribute('href'),
            }));
            importedCategories.push({ name: categoryName, links });
          }
        });
      }

      // Merge categories with the same name (optional, for Chrome's nested folders)
      const merged = {};
      importedCategories.forEach(cat => {
        if (!cat.name) return;
        if (!merged[cat.name]) merged[cat.name] = { name: cat.name, links: [] };
        merged[cat.name].links = merged[cat.name].links.concat(cat.links);
      });
      importedCategories = Object.values(merged);

      // Show preview
      setImportedPreview(importedCategories);

      // Add to Firestore (or local state)
      if (!user) return;
      importedCategories.forEach(async (cat) => {
        // Add category
        const catDoc = await addDoc(collection(db, 'users', user.uid, 'UserCategory'), {
          newCategory: cat.name,
          userId: user.uid,
          order: categories.length,
          createdAt: new Date().toISOString(),
        });
        // Add bookmarks
        for (const link of cat.links) {
          await addDoc(collection(db, 'users', user.uid, 'CatBookmarks'), {
            title: link.title,
            url: link.url,
            favicon: '',
            categoryId: catDoc.id,
            userId: user.uid,
            createdAt: new Date().toISOString(),
            order: 0,
            isAdminBookmark: false,
          });
        }
      });
      // Optionally, show a success message
      // success('Bookmarks imported!');

      // ...inside handleImportBookmarks, after setImportedPreview(importedCategories);
      Modal.info({
        title: "Import Successful",
        content: (
          <div>
            <p>Your imported categories have been added to your account.</p>
            <p>You can view and manage them in the <b>Category Manager</b> (click the "Category Manager" button above your bookmarks).</p>
          </div>
        ),
        okText: "OK",
      });
    };
    reader.readAsText(file);
  };

  const toggleAllCategories = () => {
    const areAllOpen =
      categories.length > 0 &&
      categories.every((cat) => openCategories[cat.id]);
    const newState = {};
    categories.forEach((category) => {
      newState[category.id] = !areAllOpen;
    });
    setOpenCategories(newState);
    localStorage.setItem("categoryOpenStates", JSON.stringify(newState));
  };

  // Enhanced drag state with more comprehensive tracking
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedItem: null,
    sourceColumn: null,
    destinationColumn: null,
    dragPosition: { x: 0, y: 0 },
    dragProgress: 0, // 0-1 range for drag progress
  });

  // Enhanced drag preview state
  // const [dragsPreview, setDragsPreview] = useState({
  //   isPreviewActive: false,
  //   sourceItem: null,
  //   destinationColumn: null,
  //   previewPosition: null,
  //   previewOpacity: 0,
  //   previewScale: 1,
  // });

  const dropdownRef = useRef(null); // Create a ref for the dropdown

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsEditModePanelVisible(false); // Close the dropdown if clicked outside
    }
    // Close search bar if clicked outside
    if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
      setIsSearchBarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside); // Add event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Cleanup on unmount
    };
  }, []);

  // Advanced drag start handler with precise tracking and preview
  // const handleDragStart = (category, columnIndex, event) => {
  //   // Capture initial drag position
  //   const startX = event.clientX || (event.touches && event.touches[0].clientX);
  //   const startY = event.clientY || (event.touches && event.touches[0].clientY);

  //   // Update drag state
  //   setDragState({
  //     isDragging: true,
  //     draggedItem: category,
  //     sourceColumn: columnIndex,
  //     destinationColumn: null,
  //     dragPosition: { x: startX, y: startY },
  //     dragProgress: 0,
  //   });

  //   // Initialize preview state
  //   setDragsPreview({
  //     isPreviewActive: true,
  //     sourceItem: category,
  //     destinationColumn: null,
  //     previewPosition: { x: startX, y: startY },
  //     previewOpacity: 0.5,
  //     previewScale: 1.05,
  //   });

  //   // Enhanced feedback
  //   try {
  //     // Haptic feedback
  //     if ("vibrate" in navigator) {
  //       navigator.vibrate([25, 50, 25]);
  //     }

  //     // Spatial audio feedback
  //     const startDragAudio = new Audio("path/to/drag-start-spatial.mp3");
  //     startDragAudio.playbackRate = 1.2;
  //     startDragAudio.volume = 0.3;
  //     startDragAudio.play().catch(() => {});
  //   } catch (error) {
  //     console.warn("Drag start feedback failed", error);
  //   }
  // };

  // Advanced drag update with progress tracking
  // const handleDragUpdate = (result, provided) => {
  //   if (result.destination) {
  //     // Calculate drag progress based on movement
  //     const progress = Math.min(
  //       1,
  //       Math.abs(
  //         (result.destination.index - result.source.index) /
  //           Math.max(1, result.destination.droppableId.length)
  //       )
  //     );

  //     setDragState((prev) => ({
  //       ...prev,
  //       destinationColumn: parseInt(result.destination.droppableId),
  //       dragProgress: progress,
  //       dragPosition: {
  //         x: provided.clientX || prev.dragPosition.x,
  //         y: provided.clientY || prev.dragPosition.y,
  //       },
  //     }));

  //     // Update preview state
  //     setDragsPreview((prev) => ({
  //       ...prev,
  //       destinationColumn: parseInt(result.destination.droppableId),
  //       previewPosition: {
  //         x: provided.clientX || prev.previewPosition.x,
  //         y: provided.clientY || prev.previewPosition.y,
  //       },
  //       previewOpacity: 0.8,
  //       previewScale: 1.1,
  //     }));
  //     s;
  //     // Visual and audio feedback based on drag progress
  //     try {
  //       if (progress > 0.5) {
  //         const progressAudio = new Audio("path/to/drag-progress.mp3");
  //         progressAudio.volume = progress * 0.3;
  //         progressAudio.playbackRate = 1 + progress * 0.5;
  //         progressAudio.play().catch(() => {});
  //       }
  //     } catch (error) {
  //       console.warn("Drag update feedback failed", error);
  //     }
  //   }
  // };

  const getBookmarkItemStyle = (isSelected) => ({
    padding: "8px",
    margin: "8px 0",
    backgroundColor: isSelected
      ? isDarkMode
        ? "#1f1f1f"
        : "#e6f7ff"
      : isDarkMode
      ? "#141414"
      : "#fff",
    border: `${isDarkMode ? "#303030" : "#f0f0f0"}`,
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    color: isDarkMode ? "#ffffff" : "#000000",
  });

  // Track auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  // Add new helper function for category fetching
  const fetchCategories = async () => {
    if (!user) return [];

    try {
      // Fetch admin categories (country-specific)
      const adminCategorySnapshot = await getDocs(collection(db, `category_${country.key === "us" ? "USA" : "INDIA"}`));
      const adminCategories = adminCategorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isAdminCategory: true,
      }));

      // Fetch user categories (user-specific, not country-specific)
      const userCategorySnapshot = await getDocs(
        collection(db, "users", user.uid, "UserCategory")
      );
      const userCategories = userCategorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        name: doc.data().newCategory,
        isAdminCategory: false,
      }));

      // Combine and sort categories
      return [...adminCategories, ...userCategories].sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  };

  // Add improved snapshot listener setup
  const setupSnapshotListeners = () => {
    if (!user)
      return { unsubscribeCategories: null, unsubscribePositions: null };

    // Listen for user category changes
    const unsubscribeCategories = onSnapshot(
      collection(db, "users", user.uid, "UserCategory"),
      {
        next: async (snapshot) => {
          try {
            const changes = snapshot.docChanges();

            // Handle incremental updates
            setCategories((prevCategories) => {
              const updatedCategories = [...prevCategories];

              changes.forEach((change) => {
                const categoryData = {
                  id: change.doc.id,
                  ...change.doc.data(),
                  name: change.doc.data().newCategory,
                  isAdminCategory: false,
                };

                if (change.type === "added") {
                  if (
                    !updatedCategories.some((cat) => cat.id === categoryData.id)
                  ) {
                    updatedCategories.push(categoryData);
                  }
                } else if (change.type === "modified") {
                  const index = updatedCategories.findIndex(
                    (cat) => cat.id === categoryData.id
                  );
                  if (index !== -1) {
                    updatedCategories[index] = categoryData;
                  }
                } else if (change.type === "removed") {
                  const index = updatedCategories.findIndex(
                    (cat) => cat.id === categoryData.id
                  );
                  if (index !== -1) {
                    updatedCategories.splice(index, 1);
                  }
                }
              });

              return updatedCategories.sort(
                (a, b) => (a.order || 0) - (b.order || 0)
              );
            });

            // Update columns if needed
            if (
              changes.some(
                (change) => change.type === "added" || change.type === "removed"
              )
            ) {
              setCategoryColumns((prevColumns) =>
                ensureAllCategoriesInColumns(categories, prevColumns)
              );
            }
          } catch (error) {
            console.error("Error processing category changes:", error);
          }
        },
        error: (error) => {
          console.error("Error in category snapshot:", error);
        },
      }
    );

    // Listen for position changes
    const unsubscribePositions = onSnapshot(doc(db, "users", user.uid), {
      next: (docSnapshot) => {
        try {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            if (data.categoryPositions) {
              const { columns, columnCount: newColumnCount } =
                data.categoryPositions;

              // Update columns with optimistic UI
              setCategoryColumns((prevColumns) => {
                const newColumns = { ...columns };
                // Ensure all categories are included
                return ensureAllCategoriesInColumns(categories, newColumns);
              });

              // Update column count if changed
              if (newColumnCount !== columnCount) {
                setColumnCount(newColumnCount);
              }

              // Update localStorage for persistence
              localStorage.setItem("columnCount", newColumnCount.toString());
              localStorage.setItem("categoryColumns", JSON.stringify(columns));
            }
          }
        } catch (error) {
          console.error("Error processing position changes:", error);
        }
      },
      error: (error) => {
        console.error("Error in positions snapshot:", error);
      },
    });

    return { unsubscribeCategories, unsubscribePositions };
  };

  // Update the useEffect for initial data loading and snapshot setup
  useEffect(() => {
    let unsubscribeCallbacks = {
      unsubscribeCategories: null,
      unsubscribePositions: null,
    };

    const initializeData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Initial fetch of categories
        const initialCategories = await fetchCategories();
        setCategories(initialCategories);

        // Setup real-time listeners
        unsubscribeCallbacks = setupSnapshotListeners();

        // Load saved states from localStorage
        const savedOpenStates = localStorage.getItem("categoryOpenStates");
        const initialOpenStates = savedOpenStates
          ? JSON.parse(savedOpenStates)
          : initialCategories.reduce((acc, category) => {
              acc[category.id] = true;
              return acc;
            }, {});

        setOpenCategories(initialOpenStates);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();

    // Cleanup function
    return () => {
      if (unsubscribeCallbacks.unsubscribeCategories) {
        unsubscribeCallbacks.unsubscribeCategories();
      }
      if (unsubscribeCallbacks.unsubscribePositions) {
        unsubscribeCallbacks.unsubscribePositions();
      }
    };
  }, [user]);

  // Fetch all user bookmarks
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch hidden bookmarks first
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const hiddenIds = userDocSnap.exists()
          ? userDocSnap.data().hiddenBookmarkIds || []
          : [];

        setHiddenBookmarkIds(hiddenIds);

        // Create a Set to track unique URLs per category
        const uniqueUrlsPerCategory = new Map();

        // Fetch all user bookmarks
        const userBookmarksSnapshot = await getDocs(
          collection(db, `links_${country.key === "us" ? "USA" : "INDIA"}`)
        );
        const userBookmarks = userBookmarksSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            const key = `${data.categoryId}-${data.url}`;
            if (!uniqueUrlsPerCategory.has(key)) {
              uniqueUrlsPerCategory.set(key, doc.id);
              return {
                id: doc.id,
                ...data,
                isHidden: hiddenIds.includes(doc.id),
                isAdminBookmark: false,
              };
            }
            return null;
          })
          .filter(Boolean)
          .filter((bookmark) => !hiddenIds.includes(bookmark.id));

        // Store user bookmark IDs for deduplication
        const userBookmarkIds = new Set(userBookmarks.map((b) => b.id));
        const userBookmarkUrls = new Set(
          userBookmarks.map((b) => `${b.categoryId}-${b.url}`)
        );

        // Fetch admin bookmarks for each admin category
        const adminBookmarksPromises = categories.map(async (category) => {
          const bookmarksSnapshot = await getDocs(
            query(collection(db, `links_${country.key === "us" ? "USA" : "INDIA"}`), where("category", "==", category.id))
          );
          return bookmarksSnapshot.docs
            .map((doc) => {
              const data = doc.data();
              const key = `${category.id}-${data.link}`;
              // Skip if we already have this URL in user bookmarks or if it's a duplicate
              if (userBookmarkUrls.has(key) || uniqueUrlsPerCategory.has(key)) {
                return null;
              }
              uniqueUrlsPerCategory.set(key, doc.id);
              return {
                id: doc.id,
                ...data,
                title: data.name,
                url: data.link,
                categoryId: category.id,
                isHidden: hiddenIds.includes(doc.id),
                isAdminBookmark: true,
                createdBy: data.createdBy,
                updatedAt: data.updatedAt,
                order: data.order || 0,
              };
            })
            .filter(Boolean)
            .filter((bookmark) => !hiddenIds.includes(bookmark.id));
        });

        const adminBookmarks = (
          await Promise.all(adminBookmarksPromises)
        ).flat();

        // Combine all bookmarks
        const allBookmarks = [...userBookmarks, ...adminBookmarks];
        // console.log(
        //   `Loaded ${userBookmarks.length} user bookmarks and ${adminBookmarks.length} admin bookmarks`
        // );

        setLinks(allBookmarks);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookmark data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [user, categories]);

  // Add useEffect to load saved positions
  useEffect(() => {
    const loadCategoryPositions = async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().categoryPositions) {
          setCategoryPositions(userDocSnap.data().categoryPositions);
          // Initialize columns based on saved positions
          const savedColumns = userDocSnap.data().categoryPositions;
          setCategoryColumns(savedColumns.columns || defaultColumnState());
          setColumnCount(savedColumns.columnCount || 4);
        }
      } catch (error) {
        console.error("Error loading category positions:", error);
      }
    };
    loadCategoryPositions();
  }, [user]);

  // Add function to get default column state
  const defaultColumnState = () => ({
    column1: [],
    column2: [],
    column3: [],
    column4: [],
  });

  // Add function to ensure all categories are in columns
  const ensureAllCategoriesInColumns = (allCategories, currentColumns) => {
    const newColumns = { ...currentColumns };
    const existingCategoryIds = new Set(Object.values(newColumns).flat());

    // Add missing categories to columns
    allCategories.forEach((category) => {
      if (!existingCategoryIds.has(category.id)) {
        // Find the column with the least number of categories
        let minColumn = "column1";
        let minCount = newColumns.column1?.length || 0;

        Object.keys(newColumns).forEach((colKey) => {
          const colCount = newColumns[colKey]?.length || 0;
          if (colCount < minCount) {
            minCount = colCount;
            minColumn = colKey;
          }
        });

        // Add category to the column with least items
        newColumns[minColumn] = [...(newColumns[minColumn] || []), category.id];
      }
    });

    return newColumns;
  };

  // Update the onDragEnd function
  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination || !user) return;

    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;
    const newColumns = { ...categoryColumns };

    // Remove from source column
    const [movedCategoryId] = newColumns[sourceColId].splice(source.index, 1);

    // Add to destination column
    newColumns[destColId].splice(destination.index, 0, movedCategoryId);

    // Update state
    setCategoryColumns(newColumns);

    try {
      const batch = writeBatch(db);
      const updates = {};

      // Update positions for all categories in affected columns
      Object.entries(newColumns).forEach(([columnId, categoryIds]) => {
        categoryIds.forEach((categoryId, index) => {
          const category = categories.find((c) => c.id === categoryId);
          if (category) {
            const columnIndex = parseInt(columnId.replace("column", ""));
            updates[categoryId] = {
              columnIndex,
              order: index,
              lastUpdated: new Date().toISOString(),
            };

            if (!category.isAdminCategory) {
              const categoryRef = doc(
                db,
                "users",
                user.uid,
                "UserCategory",
                categoryId
              );
              batch.update(categoryRef, {
                columnIndex,
                order: index,
              });
            }
          }
        });
      });

      // Save all positions in user document
      const userDocRef = doc(db, "users", user.uid);
      batch.update(userDocRef, {
        categoryPositions: {
          columns: newColumns,
          columnCount,
          positions: updates,
          lastUpdated: new Date().toISOString(),
        },
      });

      await batch.commit();
    } catch (error) {
      console.error("Error updating category positions:", error);
      // Revert local state on error
      setCategoryColumns(categoryColumns);
    }
  };

  // Add function to initialize category columns
  useEffect(() => {
    const initializeCategoryColumns = async () => {
      if (!user || categories.length === 0) return;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const savedPositions = userDocSnap.exists()
          ? userDocSnap.data().categoryPositions
          : null;

        if (savedPositions && savedPositions.columns) {
          setCategoryColumns(savedPositions.columns);
          setColumnCount(savedPositions.columnCount || 4);
        } else {
          // Initialize default positions if none exist
          const defaultColumns = defaultColumnState();
          categories.forEach((category, index) => {
            const columnIndex = (index % 4) + 1;
            defaultColumns[`column${columnIndex}`].push(category.id);
          });

          setCategoryColumns(defaultColumns);

          // Save default positions
          await updateDoc(userDocRef, {
            categoryPositions: {
              columns: defaultColumns,
              columnCount: 4,
              lastUpdated: new Date().toISOString(),
            },
          });
        }
      } catch (error) {
        console.error("Error initializing category columns:", error);
      }
    };

    initializeCategoryColumns();
  }, [user, categories]);

  // Effect to manage available and active categories
  useEffect(() => {
    if (isControllerOpen) {
      // Get all categories that are not currently in any column
      const usedCategoryIds = new Set(
        previewCategories.map((category) => category.id)
      );

      const available = categories.filter(
        (category) => !usedCategoryIds.has(category.id)
      );

      setAvailableCategories(available);
      setActiveCategories(previewCategories);
    }
  }, [isControllerOpen, previewCategories, categories]);

  // Effect to initialize preview categories when modal opens
  useEffect(() => {
    if (isControllerOpen) {
      // Get all categories from current columns
      const allColumnCategories = Object.values(categoryColumns)
        .flat()
        .map((catId) => categories.find((cat) => cat.id === catId))
        .filter(Boolean);

      // Create preview categories with their current positions
      const previewCats = allColumnCategories.map((category) => {
        let categoryColumn = 0;
        Object.entries(categoryColumns).forEach(([colKey, colCategories]) => {
          if (colCategories?.includes(category.id)) {
            categoryColumn = parseInt(colKey.replace("column", "")) - 1;
          }
        });

        return {
          ...category,
          column: categoryColumn,
          order:
            categoryColumns[`column${categoryColumn + 1}`]?.indexOf(
              category.id
            ) || 0,
        };
      });

      // Set preview categories
      setPreviewCategories(previewCats);

      // Set available categories (categories not in any column)
      const columnCategoryIds = new Set(Object.values(categoryColumns).flat());
      const availableCats = categories.filter(
        (cat) => !columnCategoryIds.has(cat.id)
      );
      setAvailableCategories(availableCats);

      setPreviewColumns(columnCount);
    }
  }, [isControllerOpen, categories, categoryColumns, columnCount]);

  // Function to get categories for a specific column
  const getColumnCategories = (columnIndex) => {
    return previewCategories
      .filter((cat) => cat.column === columnIndex)
      .sort((a, b) => {
        // First sort by order
        const orderDiff = a.order - b.order;
        if (orderDiff !== 0) return orderDiff;

        // If orders are equal, use column positions as fallback
        const colKey = `column${columnIndex + 1}`;
        const aIndex = categoryColumns[colKey]?.indexOf(a.id) || 0;
        const bIndex = categoryColumns[colKey]?.indexOf(b.id) || 0;
        return aIndex - bIndex;
      });
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      return;
    }

    try {
      const docRef = await addDoc(
        collection(db, "users", user.uid, "UserCategory"),
        {
          newCategory: newCategoryName.trim(),
          userId: user.uid,
          order: categories.length,
          createdAt: new Date().toISOString(),
        }
      );

      // Add the new category to the local state immediately
      const newCategory = {
        id: docRef.id,
        name: newCategoryName.trim(),
        userId: user.uid,
        newCategory: newCategoryName.trim(),
        order: categories.length,
      };

      setCategories((prevCategories) => [...prevCategories, newCategory]);

      // Set the new category to be open by default
      setOpenCategories((prev) => ({
        ...prev,
        [docRef.id]: true,
      }));
      localStorage.setItem(
        "categoryOpenStates",
        JSON.stringify({
          ...openCategories,
          [docRef.id]: true,
        })
      );

      // Also add the new category to a column
      setCategoryColumns((prevColumns) => {
        // Find the column with the least number of categories
        const columnKeys = Object.keys(prevColumns);
        let minColumn = columnKeys[0];
        let minCount = prevColumns[minColumn]?.length || 0;
        columnKeys.forEach((colKey) => {
          const colCount = prevColumns[colKey]?.length || 0;
          if (colCount < minCount) {
            minCount = colCount;
            minColumn = colKey;
          }
        });
        // Add new category to the column with the least items
        const newColumns = { ...prevColumns };
        newColumns[minColumn] = [...(newColumns[minColumn] || []), newCategory.id];
        // Also update in Firestore
        const userDocRef = doc(db, "users", user.uid);
        updateDoc(userDocRef, {
          "categoryPositions.columns": newColumns,
        }).catch((error) => console.error("Error updating columns:", error));
        return newColumns;
      });

      // Make sure this category is not in hiddenCategories
      setHiddenCategories((prev) => {
        const filtered = prev.filter((id) => id !== newCategory.id);

        // Update in Firestore if there was a change
        if (prev.length !== filtered.length) {
          const userDocRef = doc(db, "users", user.uid);
          updateDoc(userDocRef, {
            hiddenCategories: filtered,
          }).catch((error) =>
            console.error("Error updating hidden categories:", error)
          );
        }

        return filtered;
      });

      setNewCategoryName("");
      setIsAddCategoryModalVisible(false);
      // Show tip if controller is open
      if (isControllerOpen) {
        Modal.info({
          title: "Tip",
          content: (
            <div>
              <p>Click the column number to auto arrange your categories.</p>
            </div>
          ),
          okText: "OK",
        });
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      // Set loading state
      setLoading(true);

      // Delete the category document
      await deleteDoc(doc(db, "users", user.uid, "UserCategory", categoryId));

      // Get all bookmarks in this category
      const categoryBookmarks = links.filter(
        (link) => link.categoryId === categoryId
      );

      console.log(
        `Found ${categoryBookmarks.length} bookmarks to delete in category ${categoryId}`
      );

      // Separate admin and user bookmarks
      const adminBookmarks = categoryBookmarks.filter(
        (link) => link.isAdminBookmark
      );
      const userBookmarks = categoryBookmarks.filter(
        (link) => !link.isAdminBookmark
      );

      // Use a batch for efficient deletion of user bookmarks
      if (userBookmarks.length > 0) {
        const batch = writeBatch(db);

        // Add all user bookmarks to the deletion batch
        userBookmarks.forEach((bookmark) => {
          const bookmarkRef = doc(
            db,
            "users",
            user.uid,
            "CatBookmarks",
            bookmark.id
          );
          batch.delete(bookmarkRef);
        });

        // Commit the batch deletion
        await batch.commit();
        console.log(`Deleted ${userBookmarks.length} user bookmarks`);
      }

      // For admin bookmarks, hide them instead of deleting (add to hidden bookmarks)
      if (adminBookmarks.length > 0) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const currentHiddenIds = userDocSnap.exists()
          ? userDocSnap.data().hiddenBookmarkIds || []
          : [];

        // Add all admin bookmark IDs to hidden list
        const newHiddenIds = [
          ...new Set([
            ...currentHiddenIds,
            ...adminBookmarks.map((bookmark) => bookmark.id),
          ]),
        ];

        // Update the user document with the new hidden IDs
        await updateDoc(userDocRef, {
          hiddenBookmarkIds: newHiddenIds,
        });

        console.log(`Hid ${adminBookmarks.length} admin bookmarks`);
      }

      // Update local state
      setCategories((prevCategories) =>
        prevCategories.filter((cat) => cat.id !== categoryId)
      );

      // Remove all bookmarks for this category from the link state
      setLinks((prevLinks) =>
        prevLinks.filter((link) => link.categoryId !== categoryId)
      );

      // Remove the category from openCategories state
      setOpenCategories((prev) => {
        const newState = { ...prev };
        delete newState[categoryId];
        localStorage.setItem("categoryOpenStates", JSON.stringify(newState));
        return newState;
      });

      // Update column state to remove the category
      setCategoryColumns((prevColumns) => {
        const newColumns = { ...prevColumns };
        Object.keys(newColumns).forEach((colKey) => {
          if (Array.isArray(newColumns[colKey])) {
            newColumns[colKey] = newColumns[colKey].filter(
              (id) => id !== categoryId
            );
          }
        });

        // Update Firestore with new column layout
        const userDocRef = doc(db, "users", user.uid);
        updateDoc(userDocRef, {
          "categoryPositions.columns": newColumns,
        }).catch((err) => console.error("Error updating column layout:", err));

        return newColumns;
      });
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavicon = async (url) => {
    try {
      let cleanUrl = url.trim();
      if (!cleanUrl.match(/^https?:\/\//i)) {
        cleanUrl = `http://${cleanUrl}`;
      }
      const urlObj = new URL(cleanUrl);
      const domain = urlObj.hostname;

      // Try to fetch favicon
      const faviconUrl = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
        domain
      )}&size=32`;

      // Test if favicon exists
      const response = await fetch(faviconUrl);
      if (response.ok) {
        return faviconUrl;
      }
      return "https://www.google.com/favicon.ico";
    } catch (error) {
      return "https://www.google.com/favicon.ico";
    }
  };

  const validateUrl = (url) => {
    try {
      let cleanUrl = url.trim();
      if (!cleanUrl.match(/^https?:\/\//i)) {
        cleanUrl = `http://${cleanUrl}`;
      }
      new URL(cleanUrl);
      return cleanUrl;
    } catch (error) {
      throw new Error("Invalid URL format");
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    // Just update the URL immediately, without fetching favicon on every keystroke
    setNewBookmark((prev) => ({ ...prev, url }));

    // Only fetch favicon after user stops typing for a bit
    if (url) {
      debouncedFetchFavicon(url, (favicon) => {
        setNewBookmark((prev) => ({ ...prev, favicon }));
      });
    }
  };

  const [selectedCategoryId, setSelectedCategoryId] = useState(""); // For global add bookmark

  const handleGlobalAddBookmark = () => {
    if (categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
      setSelectedCategory(categories[0]);
    } else {
      setSelectedCategoryId("");
      setSelectedCategory(null);
    }
    setIsAddBookmarkModalVisible(true);
  };

  const handleCategoryDropdownChange = (value) => {
    setSelectedCategoryId(value);
    const cat = categories.find((c) => c.id === value);
    setSelectedCategory(cat || null);
  };

  const handleAddBookmark = async () => {
    const categoryToUse = selectedCategoryId
      ? categories.find((cat) => cat.id === selectedCategoryId)
      : selectedCategory;
    if (!categoryToUse) {
      return;
    }
    if (!newBookmark.title.trim() || !newBookmark.url.trim()) {
      return;
    }
    try {
      const normalizedUrl = validateUrl(newBookmark.url.trim());
      const urlKey = `${categoryToUse.id}-${normalizedUrl}`;
      const isDuplicate = links.some((link) => {
        if (link.categoryId !== categoryToUse.id) return false;
        try {
          const linkUrl = validateUrl(link.url);
          return linkUrl === normalizedUrl;
        } catch (e) {
          return false;
        }
      });
      if (isDuplicate) {
        return;
      }
      const tempId = `temp_${btoa(urlKey).replace(/[^a-zA-Z0-9]/g, "")}_${Date.now()}`;
      const bookmarkData = {
        title: newBookmark.title.trim(),
        url: normalizedUrl,
        favicon: newBookmark.favicon || (await fetchFavicon(normalizedUrl)),
        categoryId: categoryToUse.id,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        order: links.filter((link) => link.categoryId === categoryToUse.id).length,
        isAdminBookmark: false,
        _tempUrlKey: urlKey,
      };
      setLinks((prevLinks) => {
        const existingBookmark = prevLinks.find(
          (link) =>
            link.categoryId === categoryToUse.id &&
            link.url === normalizedUrl
        );
        if (existingBookmark) {
          return prevLinks;
        }
        return [...prevLinks, { ...bookmarkData, id: tempId }];
      });
      const docRef = await addDoc(
        collection(db, "users", user.uid, "CatBookmarks"),
        bookmarkData
      );
      setNewBookmark({ title: "", url: "", favicon: "" });
      setIsAddBookmarkModalVisible(false);
      setSelectedCategoryId("");
    } catch (error) {
      const normalizedUrl = validateUrl(newBookmark.url.trim());
      setLinks((prevLinks) =>
        prevLinks.filter(
          (link) =>
            !(
              link.id.startsWith("temp_") &&
              link.categoryId === (selectedCategoryId || (selectedCategory && selectedCategory.id)) &&
              link.url === normalizedUrl
            )
        )
      );
    }
  };

  const selectAllBookmarks = () => {
    if (selectedBookmarks.length === editModeBookmarks.length) {
      setSelectedBookmarks([]);
    } else {
      setSelectedBookmarks(editModeBookmarks.map((bookmark) => bookmark.id));
    }
  };

  const getCategoryMenuItems = (category) => [
    {
      key: "editMode",
      icon: (
        <div className=" bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-md">
          <EditOutlined />
        </div>
      ),
      label: <div className="dark:text-white">Edit Mode</div>,
      onClick: () => {
        setSelectedCategory(category);
        // Filter out hidden bookmarks when setting editModeBookmarks
        const visibleBookmarks = links
          .filter((link) => {
            // Check if the bookmark is not hidden
            const isNotHidden = !hiddenBookmarkIds.includes(link.id);
            // Check if it belongs to the selected category
            const belongsToCategory = link.categoryId === category.id;
            return isNotHidden && belongsToCategory;
          })
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((link) => ({ ...link, isEditing: false }));

        setEditModeBookmarks(visibleBookmarks);
        setIsEditModePanelVisible(true);
      },
    },

    {
      key: "viewOptions",
      icon: (
        <div className="dark:text-black bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-md">
          <UnorderedListOutlined />
        </div>
      ),
      label: <div className="dark:text-white">View Options</div>,
      children: [
        {
          key: "list",
          label: "List View",
          onClick: () => {
            const newViewMode = "list";
            const updatedModes = {
              ...categoryViewModes,
              [category.id]: newViewMode,
            };
            setCategoryViewModes(updatedModes);
            localStorage.setItem(
              "categoryViewModes",
              JSON.stringify(updatedModes)
            );
          },
        },
        {
          key: "grid",
          label: "Grid View",
          onClick: () => {
            const newViewMode = "grid";
            const updatedModes = {
              ...categoryViewModes,
              [category.id]: newViewMode,
            };
            setCategoryViewModes(updatedModes);
            localStorage.setItem(
              "categoryViewModes",
              JSON.stringify(updatedModes)
            );
          },
        },
        {
          key: "icon",
          label: "Icon View",
          onClick: () => {
            const newViewMode = "icon";
            const updatedModes = {
              ...categoryViewModes,
              [category.id]: newViewMode,
            };
            setCategoryViewModes(updatedModes);
            localStorage.setItem(
              "categoryViewModes",
              JSON.stringify(updatedModes)
            );
          },
        },
      ],
    },
    {
      key: "lineOptions",
      icon: (
        <div className="dark:text-black bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-md">
          <FontSizeOutlined />
        </div>
      ),
      label: <div className="dark:text-white">Line Options</div>,
      children: [
        {
          key: "Short name",
          label: "Short name",
          onClick: () => {
            setLineOptions(1);
          },
        },
        {
          key: "Full name",
          label: "Full name",
          onClick: () => {
            setLineOptions(2);
          },
        },
      ],
    },
    {
      key: "size",
      icon: (
        <div className="dark:text-black bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-md">
          <PictureOutlined />
        </div>
      ),
      label: <div className="dark:text-white">Icon Size</div>,
      children: [
        {
          key: "small",
          label: "Small",
          onClick: () => {
            const newSize = { list: 24, grid: 24, icon: 24 };
            const currentViewMode = categoryViewModes[category.id] || "grid";
            setCategoryBookmarkSizes((prev) => ({
              ...prev,
              [category.id]: newSize,
            }));
            saveUserPreferences(category.id, currentViewMode, newSize);
          },
        },
        {
          key: "medium",
          label: "Medium",
          onClick: () => {
            const newSize = { list: 28, grid: 32, icon: 32 };
            const currentViewMode = categoryViewModes[category.id] || "grid";
            setCategoryBookmarkSizes((prev) => ({
              ...prev,
              [category.id]: newSize,
            }));
            saveUserPreferences(category.id, currentViewMode, newSize);
          },
        },
        {
          key: "large",
          label: "Large",
          onClick: () => {
            const newSize = { list: 40, grid: 64, icon: 70 };
            const currentViewMode = categoryViewModes[category.id] || "grid";
            setCategoryBookmarkSizes((prev) => ({
              ...prev,
              [category.id]: newSize,
            }));
            saveUserPreferences(category.id, currentViewMode, newSize);
          },
        },
      ],
    },

    {
      key: "delete",
      icon: (
        <div className=" dark:bg-red-500 bg-red-200  px-2 py-1 rounded-md">
          <DeleteOutlined />
        </div>
      ),
      label: "Delete Category",
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: <div className="dark:text-white">Delete Category</div>,
          content: (
            <div className="dark:text-white">
              Are you sure you want to delete this category and all its
              bookmarks?
            </div>
          ),
          okText: "Yes",
          okType: "danger",
          cancelText: "No",
          onOk: () => handleDeleteCategory(category.id),
        });
      },
    },
  ];

  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
    } catch (error) {
      return `https://www.google.com/s2/favicons?sz=64&domain=google.com`; // Default favicon
    }
  };

  const handleEditBookmark = (bookmark) => {
    setEditingBookmark(bookmark);
    editBookmarkForm.setFieldsValue({
      title: bookmark.title,
      url: bookmark.url,
    });
    setIsEditBookmarkModalVisible(true);
  };

  const handleEditBookmarkSubmit = async () => {
    try {
      const values = await editBookmarkForm.validateFields();
      console.log("Editing bookmark:", editingBookmark);
      console.log("New values:", values);

      if (editingBookmark.isAdminBookmark) {
        // For admin bookmarks, create a user-owned copy instead of modifying the original
        const userBookmarkData = {
          title: values.title,
          url: values.url,
          favicon: editingBookmark.favicon || getFaviconUrl(values.url),
          categoryId: editingBookmark.categoryId,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          order: editingBookmark.order || 0,
          originalBookmarkId: editingBookmark.id, // Reference to original bookmark
          isAdminBookmark: false, // Mark as user bookmark
        };

        // Add to user's collection
        const docRef = await addDoc(
          collection(db, "users", user.uid, "CatBookmarks"),
          userBookmarkData
        );

        // Hide the original admin bookmark
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const hiddenIds = userDocSnap.exists()
          ? userDocSnap.data().hiddenBookmarkIds || []
          : [];

        if (!hiddenIds.includes(editingBookmark.id)) {
          await updateDoc(userDocRef, {
            hiddenBookmarkIds: [...hiddenIds, editingBookmark.id],
          });
        }

        console.log("Created user copy of admin bookmark");

        // Update local state to show the new bookmark
        setLinks((prevLinks) => [
          ...prevLinks.filter((link) => link.id !== editingBookmark.id), // Remove original from view
          {
            ...userBookmarkData,
            id: docRef.id,
          },
        ]);
      } else {
        // User bookmarks can be updated directly
        const docRef = doc(
          db,
          "users",
          user.uid,
          "CatBookmarks",
          editingBookmark.id
        );
        await updateDoc(docRef, {
          title: values.title,
          url: values.url,
          updatedAt: new Date().toISOString(),
        });
        console.log("Updated user bookmark");

        // Update local state
        setLinks((prevLinks) =>
          prevLinks.map((link) =>
            link.id === editingBookmark.id
              ? {
                  ...link,
                  title: values.title,
                  url: values.url,
                }
              : link
          )
        );
      }

      setEditingBookmark(null);
      setIsEditBookmarkModalVisible(false);
      editBookmarkForm.resetFields();
    } catch (error) {
      console.error("Error updating bookmark:", error);
    }
  };

  const renderBookmarkList = (categoryLinks, categoryId) => {
    const sizes = categoryBookmarkSizes[categoryId] || { list: 32 };
    return (
      <ul className="bg-white/[(var(--widget-opacity))] dark:bg-[#28283a]/[(var(--widget-opacity))]">
        {categoryLinks.map((link) => (
          <li
            key={link.id}
            className="flex items-center py-2 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
          >
            <img
              src={getFaviconUrl(link.url || link.link)}
              alt=""
              style={{
                width: `${sizes.list}px`,
                height: `${sizes.list}px`,
                padding: "2px",
              }}
              className="flex-shrink-0"
            />
            <div className="ml-3 flex flex-col">
              <a
                href={link.url || link.link}
                className="text-black dark:text-white hover:text-blue-500"
                style={{ fontWeight: 500 }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.title || link.name}
              </a>
              <a
                href={link.url || link.link}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-400 break-all"
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginTop: 2 }}
              >
                {link.url || link.link}
              </a>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const renderBookmarkGrid = (categoryLinks, categoryId) => {
    const sizes = categoryBookmarkSizes[categoryId] || { grid: 32 };
    return (
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categoryLinks.map((link) => (
            <div
              key={link.id}
              className="flex flex-col items-center p-2 bg-white/[(var(--widget-opacity))] dark:bg-[#513a7a]/[(var(--widget-opacity))] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300 group relative"
            >
              <div className="relative w-full flex justify-center mb-2">
                <a href={link.url || link.link} className="block">
                  <img
                    src={getFaviconUrl(link.url || link.link)}
                    alt={link.title || link.name}
                    style={{
                      width: `${sizes.grid}px`,
                      height: `${sizes.grid}px`,
                    }}
                    className="mx-auto object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </a>
              </div>
              <a
                href={link.url || link.link}
                className="w-full text-center text-black dark:text-white hover:text-blue-500"
              >
                <span
                  className={`text-sm break-words block ${
                    lineOptions === 2
                      ? "whitespace-normal"
                      : lineOptions === "none"
                      ? "whitespace-normal"
                      : "line-clamp-1 truncate"
                  }`}
                  title={lineOptions !== 2 ? link.title || link.name : undefined}
                >
                  {link.title || link.name}
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBookmarkIcon = (categoryLinks, categoryId) => {
    const sizes = categoryBookmarkSizes[categoryId] || { icon: 24 };
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-2">
          {categoryLinks.map((link) => (
            <div key={link.id} className="relative group flex justify-center">
              <Tooltip title={link.title || link.name}>
                <a href={link.url || link.link} className="block">
                  <img
                    src={getFaviconUrl(link.url || link.link)}
                    alt={link.title || link.name}
                    style={{
                      width: `${sizes.icon}px`,
                      height: `${sizes.icon}px`,
                    }}
                    className="mx-auto transition-transform duration-300 group-hover:scale-110"
                  />
                </a>
              </Tooltip>
              <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper to get categories to display based on showAllCategories
  const getVisibleCategoryIds = () => {
    const allCategoryIds = Object.values(categoryColumns).flat();
    if (showAllCategories || allCategoryIds.length <= 16) return allCategoryIds;
    return allCategoryIds.slice(0, 16);
  };

  // Helper to distribute category IDs equally among columns
  const getDistributedCategoryColumns = () => {
    const visibleCategoryIds = getVisibleCategoryIds();
    const distributed = {};
    const perCol = Math.floor(visibleCategoryIds.length / columnCount);
    let extra = visibleCategoryIds.length % columnCount;
    let idx = 0;
    for (let col = 1; col <= columnCount; col++) {
      const count = perCol + (extra > 0 ? 1 : 0);
      distributed[`column${col}`] = visibleCategoryIds.slice(idx, idx + count);
      idx += count;
      if (extra > 0) extra--;
    }
    return distributed;
  };

  const renderBookmarksByCategory = () => {
    const areAllOpen =
      categories.length > 0 &&
      categories.every((cat) => openCategories[cat.id]);

    // Filter categories by search
    const searchTerm = (categorySearch || '').toLowerCase();
    const filteredCategoryIds = Object.values(categoryColumns)
      .flat()
      .filter((catId) => {
        const cat = categories.find((c) => c.id === catId);
        if (!cat) return false;
        const name = (cat.name || cat.newCategory || '').toLowerCase();
        return name.includes(searchTerm);
      });

    // Helper: get visible category IDs in the user's column structure, up to a total limit, distributed equally among columns
    const getLimitedColumns = (limit) => {
      // Step 1: Gather filtered categories per column, preserving order
      const perColumn = {};
      let totalCategories = 0;
      for (let col = 1; col <= columnCount; col++) {
        const colKey = `column${col}`;
        perColumn[colKey] = (categoryColumns[colKey] || []).filter(catId => filteredCategoryIds.includes(catId));
        totalCategories += perColumn[colKey].length;
      }
      // Step 2: Calculate how many per column
      const basePerCol = Math.floor(limit / columnCount);
      let remainder = limit % columnCount;
      // Step 3: Build result with up to basePerCol + 1 (if remainder > 0) per column
      const result = {};
      let used = 0;
      for (let col = 1; col <= columnCount; col++) {
        const colKey = `column${col}`;
        let take = basePerCol + (remainder > 0 ? 1 : 0);
        remainder = Math.max(0, remainder - 1);
        result[colKey] = perColumn[colKey].slice(0, take);
        used += result[colKey].length;
      }
      // If for some reason we have more than limit (e.g. not enough in some columns), trim extra from the end
      if (used > limit) {
        // Flatten, trim, then rebuild columns
        const all = [];
        for (let col = 1; col <= columnCount; col++) {
          for (const catId of result[`column${col}`]) {
            all.push({ col, catId });
          }
        }
        const trimmed = all.slice(0, limit);
        // Rebuild columns
        const newResult = {};
        for (let col = 1; col <= columnCount; col++) newResult[`column${col}`] = [];
        trimmed.forEach(({ col, catId }) => {
          newResult[`column${col}`].push(catId);
        });
        return newResult;
      }
      return result;
    };

    // Helper: get all filtered categories in the user's column structure
    const getAllColumns = () => {
      const result = {};
      for (let col = 1; col <= columnCount; col++) {
        const colKey = `column${col}`;
        result[colKey] = (categoryColumns[colKey] || []).filter(catId => filteredCategoryIds.includes(catId));
      }
      return result;
    };

    // Decide which columns to render
    const columnsToRender = showAllCategories
      ? getAllColumns()
      : getLimitedColumns(16);

    return (
      <div className="mb-2">
        {/* Search bar for categories */}
        <div className="flex justify-between mb-2 items-center gap-2">
          <div className="flex gap-2">
            <button
              className="rounded-lg flex gap-2 items-center text-black bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)]  px-3 py-2 dark:text-white mb-2"
              onClick={() => setIsAddCategoryModalVisible(true)}
            >
              <PlusOutlined />
              Add Category
            </button>
            <button
              className="rounded-lg flex gap-2 items-center text-black bg-white/[var(--widget-opacity)] dark:bg-[#28283a]/[var(--widget-opacity)]  px-3 py-2 dark:text-white mb-2"
              onClick={handleGlobalAddBookmark}
            >
              <PlusOutlined />
              Add Bookmark
            </button>
            <button
              className="rounded-lg flex gap-2 items-center text-black bg-white/[var(--widget-opacity)] dark:bg-[#28283a]/[var(--widget-opacity)]  px-3 py-2 dark:text-white mb-2"
              onClick={handleExportBookmarks}
            >
              Export Bookmarks
            </button>
            <button
              className="rounded-lg flex gap-2 items-center text-black bg-white/[var(--widget-opacity)] dark:bg-[#28283a]/[var(--widget-opacity)]  px-3 py-2 dark:text-white mb-2"
              onClick={() => importInputRef.current && importInputRef.current.click()}
            >
              Import Bookmarks
            </button>
            <input
              type="file"
              accept=".html"
              ref={importInputRef}
              style={{ display: "none" }}
              onChange={handleImportBookmarks}
            />
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center bg-white/[(var(--widget-opacity))] backdrop-blur-lg dark:bg-[#28283A]/[(var(--widget-opacity))] p-1 rounded-sm`}
            >
            </div>
            <button
              className="rounded-lg flex gap-2 items-center text-black bg-white/[var(--widget-opacity)] dark:bg-[#28283a]/[var(--widget-opacity)] px-3 py-2 dark:text-white mb-2"
              onClick={toggleAllCategories}
            >
              {areAllOpen ? <CompressOutlined /> : <ExpandOutlined />}
              {areAllOpen ? "Collapse All" : "Expand All"}
            </button>
            <div
              className={`flex items-center bg-white/[(var(--widget-opacity))] backdrop-blur-lg dark:bg-[#28283A]/[(var(--widget-opacity))] p-1 rounded-sm`}
            >
            </div>
            <button
              className="rounded-lg flex gap-2 items-center text-black bg-white/[var(--widget-opacity)] dark:bg-[#28283a]/[var(--widget-opacity)] px-3 py-2 dark:text-white mb-2"
              onClick={() => importInputRef.current && importInputRef.current.click()}
            >
              Import Bookmarks
            </button>
            <input
              type="file"
              accept=".html,text/html"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImportBookmarks}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex items-center" ref={searchBarRef}>
              {/* Search Button */}
              <button
                onClick={() => setIsSearchBarOpen(!isSearchBarOpen)}
                className="rounded-lg flex gap-2 items-center text-black bg-white/[var(--widget-opacity)] dark:bg-[#28283a]/[var(--widget-opacity)] px-3 py-2 dark:text-white transition-all duration-300 hover:scale-105"
                title="Search categories"
              >
                {isSearchBarOpen ? (
                  <svg 
                    width="16" 
                    height="16" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2"/>
                  </svg>
                ) : (
                  <svg 
                    width="16" 
                    height="16" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2"/>
                  </svg>
                )}
                {isSearchBarOpen ? "Close" : "Search"}
              </button>
              
              {/* Sliding Search Input */}
              <div 
                className={`absolute right-0 top-0 transition-all duration-300 ease-in-out ${
                  isSearchBarOpen 
                    ? 'w-64 opacity-100 translate-x-0' 
                    : 'w-0 opacity-0 translate-x-4'
                } overflow-hidden`}
              >
                <input
                  type="text"
                  placeholder="Search categories..."
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
                  value={categorySearch || ''}
                  onChange={e => setCategorySearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsSearchBarOpen(false);
                      setCategorySearch('');
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Row gutter={[16, 16]}>
            {Array.from({ length: columnCount }, (_, i) => i + 1).map(
              (colNum) => (
                <Col
                  key={`column${colNum}`}
                  xs={24}
                  sm={columnCount <= 2 ? 12 : 24}
                  lg={24 / columnCount}
                >
                  <Droppable droppableId={`column${colNum}`}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={` transition-colors duration-200 ${
                          snapshot.isDraggingOver
                            ? "bg-transparent border-2 border-dashed border-blue-500"
                            : "bg-transparent border-2 border-dashed border-transparent"
                        }`}
                      >
                        {columnsToRender[`column${colNum}`]?.map(
                          (categoryId, index) => {
                            const category = categories.find(
                              (c) => c.id === categoryId
                            );
                            if (!category) {
                              return null;
                            }

                            // Get bookmarks for this category
                            const categoryLinks = links
                              .filter(
                                (link) =>
                                  link.categoryId === category.id &&
                                  !hiddenBookmarkIds.includes(link.id)
                              )
                              .sort((a, b) => (a.order || 0) - (b.order || 0));

                            return (
                              <Draggable
                                key={category.id}
                                draggableId={category.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`mb-4 transition-all duration-200 ${
                                      snapshot.isDragging
                                        ? ""
                                        : "shadow-none rotate-0 scale-100"
                                    }`}
                                  >
                                    <Card
                                      className="max-w-xl backdrop-blur-sm  bg-white/[var(--widget-opacity)] dark:bg-[#28283a]/[var(--widget-opacity)]  dark:text-white mx-auto rounded-sm"
                                      title={
                                        <div
                                          className="bg-white/[(var(--widget-opacity))] dark:bg-[#513a7a]/[(var(--widget-opacity))] dark:text-white p-1 relative overflow-hidden cursor-pointer"
                                          onClick={() => {
                                            toggleDropdown(category.id);
                                          }}
                                        >
                                          <div className="absolute left-0 w-full h-full">
                                            <div className="absolute inset-0 opacity-10 transform rotate-45 translate-x-[-50%] translate-y-[-50%] w-[200%] h-[200%]"></div>
                                          </div>
                                          <div className="relative z-10 flex justify-between items-center category-header-content">
                                            <div className="flex items-center flex-1">
                                              <div
                                                {...provided.dragHandleProps}
                                                className={`cursor-move p-3 transition-all duration-200 group ${
                                                  snapshot.isDragging
                                                    ? "bg-gray-300/[(var(--widget-opacity))] rounded"
                                                    : ""
                                                }`}
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                              >
                                                <div className="flex flex-col gap-1">
                                                  ⋮⋮
                                                </div>
                                              </div>
                                              <span className="font-semibold">
                                                {category.name ||
                                                  category.newCategory}
                                              </span>
                                            </div>
                                            <Space
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                            >
                                              <Tooltip title="Add Bookmark">
                                                <AntButton
                                                  type="text"
                                                  icon={
                                                    <PlusOutlined className="text-black dark:text-white" />
                                                  }
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedCategory(
                                                      category
                                                    );
                                                    setSelectedCategoryId(
                                                      category.id
                                                    );
                                                    setIsAddBookmarkModalVisible(
                                                      true
                                                    );
                                                  }}
                                                  style={{ color: "white" }}
                                                />
                                              </Tooltip>
                                              <Dropdown
                                                menu={{
                                                  items:
                                                    getCategoryMenuItems(
                                                      category
                                                    ),
                                                }}
                                                trigger={["click"]}
                                                overlayClassName="[&_.ant-dropdown-menu]:p-0 [&_.ant-dropdown-menu-item]:p-0 [&_ul]:dark:bg-[#28283a]"
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                              >
                                                <AntButton
                                                  type="text"
                                                  icon={
                                                    <MoreOutlined className="text-black dark:text-white" />
                                                  }
                                                  onClick={(e) =>
                                                    e.stopPropagation()
                                                  }
                                                  style={{ color: "white" }}
                                                />
                                              </Dropdown>
                                            </Space>
                                          </div>
                                        </div>
                                      }
                                      styles={{
                                        header: {
                                          padding: 0,
                                          borderBottom: "none",
                                        },
                                        body: {
                                          padding: "16px",
                                          maxHeight: "400px",
                                          overflowY: "auto",
                                          display: openCategories[category.id]
                                            ? "block"
                                            : "none",
                                        },
                                      }}
                                      style={{
                                        height: "100%",
                                        transition: "all 0.3s ease",
                                        transform: snapshot.isDragging
                                          ? ""
                                          : "rotate(0deg)",
                                        boxShadow: snapshot.isDragging
                                          ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                                          : "none",
                                        border: "none",
                                      }}
                                    >
                                      {categoryLinks.length === 0 ? (
                                        <Empty
                                          description="No bookmarks in this category yet"
                                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        />
                                      ) : (
                                        <>
                                          {categoryViewModes[category.id] ===
                                            "list" &&
                                            renderBookmarkList(
                                              categoryLinks,
                                              category.id
                                            )}
                                          {categoryViewModes[category.id] ===
                                            "grid" &&
                                            renderBookmarkGrid(
                                              categoryLinks,
                                              category.id
                                            )}
                                          {categoryViewModes[category.id] ===
                                            "icon" &&
                                            renderBookmarkIcon(
                                              categoryLinks,
                                              category.id
                                            )}
                                          {!categoryViewModes[category.id] &&
                                            renderBookmarkGrid(
                                              categoryLinks,
                                              category.id
                                            )}
                                        </>
                                      )}
                                    </Card>
                                  </div>
                                )}
                              </Draggable>
                            );
                          }
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Col>
              )
            )}
          </Row>
        </DragDropContext>
        {/* Show More/Less Button */}
        {filteredCategoryIds.length > 16 && (
          <div className="flex justify-center mt-4">
            <AntButton onClick={() => setShowAllCategories((prev) => !prev)}>
              {showAllCategories ? "Show Less" : "Show More"}
            </AntButton>
          </div>
        )}
      </div>
    );
  };

  // Initialize categories with isOpen property
  useEffect(() => {
    if (!categories.length || !Object.keys(openCategories).length) return;

    const initCategories = categories.map((category) => ({
      ...category,
      isOpen: openCategories[category.id] ?? true,
    }));

    // Only update if there's an actual change
    const hasChanges = categories.some(
      (category, index) => category.isOpen !== initCategories[index].isOpen
    );

    if (hasChanges) {
      setCategories(initCategories);
    }
  }, [openCategories]); // Only depend on openCategories changes

  // Main effect for handling user data and categories
  useEffect(() => {
    if (!user) return;

    let unsubscribeUserDoc = null;
    let unsubscribeCategories = null;
    let isComponentMounted = true;

    const setupListeners = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!isComponentMounted) return;

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          // Set initial data
          if (data.hiddenCategories) {
            setHiddenCategories(data.hiddenCategories);
          }
          if (data.categoryPositions) {
            const { columns, columnCount: count } = data.categoryPositions;
            if (columns) setCategoryColumns(columns);
            if (count) setColumnCount(count);
          }
        }

        // Setup real-time listener for user document
        unsubscribeUserDoc = onSnapshot(
          userDocRef,
          { includeMetadataChanges: true },
          (docSnapshot) => {
            if (!isComponentMounted || docSnapshot.metadata.hasPendingWrites)
              return;

            if (docSnapshot.exists()) {
              const data = docSnapshot.data();

              // Update hidden categories
              if (data.hiddenCategories) {
                setHiddenCategories((prev) => {
                  // Only update if there's a change
                  if (
                    JSON.stringify(prev) !==
                    JSON.stringify(data.hiddenCategories)
                  ) {
                    console.log(
                      "Updating hidden categories from snapshot:",
                      data.hiddenCategories
                    );
                    return data.hiddenCategories;
                  }
                  return prev;
                });
              }

              // Update hidden bookmark IDs
              if (data.hiddenBookmarkIds) {
                setHiddenBookmarkIds((prev) => {
                  // Only update if there's a change
                  if (
                    JSON.stringify(prev) !==
                    JSON.stringify(data.hiddenBookmarkIds)
                  ) {
                    console.log(
                      "Updating hidden bookmark IDs from snapshot:",
                      data.hiddenBookmarkIds
                    );
                    return data.hiddenBookmarkIds;
                  }
                  return prev;
                });
              }

              // Update category positions
              if (data.categoryPositions) {
                const { columns, columnCount: newCount } =
                  data.categoryPositions;
                if (columns) {
                  setCategoryColumns((prev) =>
                    JSON.stringify(prev) !== JSON.stringify(columns)
                      ? columns
                      : prev
                  );
                }
                if (typeof newCount === "number") {
                  setColumnCount((prev) =>
                    prev !== newCount ? newCount : prev
                  );
                }
              }
            }
          }
        );

        // Setup real-time listener for user categories
        unsubscribeCategories = onSnapshot(
          collection(db, "users", user.uid, "UserCategory"),
          { includeMetadataChanges: true },
          (snapshot) => {
            if (!isComponentMounted || snapshot.metadata.hasPendingWrites)
              return;

            const userCategories = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              name: doc.data().newCategory,
              isAdminCategory: false,
            }));

            setCategories((prevCategories) => {
              const adminCategories = prevCategories.filter(
                (cat) => cat.isAdminCategory
              );
              const mergedCategories = [
                ...adminCategories,
                ...userCategories,
              ].sort((a, b) => (a.order || 0) - (b.order || 0));

              // Only update if there's an actual change
              return JSON.stringify(prevCategories) !==
                JSON.stringify(mergedCategories)
                ? mergedCategories
                : prevCategories;
            });
          }
        );
      } catch (error) {
        if (isComponentMounted) {
        }
      }
    };

    setupListeners();

    // Cleanup function
    return () => {
      isComponentMounted = false;
      if (unsubscribeUserDoc) unsubscribeUserDoc();
      if (unsubscribeCategories) unsubscribeCategories();
    };
  }, [user]); // Only depend on user changes

  // Optimize controller state updates with debounce
  useEffect(() => {
    if (!isControllerOpen || !categories.length) return;

    const debouncedUpdate = debounce(() => {
      const allColumnCategories = Object.values(categoryColumns)
        .flat()
        .map((catId) => categories.find((cat) => cat.id === catId))
        .filter(Boolean);

      const previewCats = allColumnCategories.map((category) => {
        let categoryColumn = 0;
        Object.entries(categoryColumns).forEach(([colKey, colCategories]) => {
          if (colCategories?.includes(category.id)) {
            categoryColumn = parseInt(colKey.replace("column", "")) - 1;
          }
        });

        return {
          ...category,
          column: categoryColumn,
          order:
            categoryColumns[`column${categoryColumn + 1}`]?.indexOf(
              category.id
            ) || 0,
        };
      });

      const columnCategoryIds = new Set(Object.values(categoryColumns).flat());
      const availableCats = categories.filter(
        (cat) => !columnCategoryIds.has(cat.id)
      );

      setPreviewCategories((prev) =>
        JSON.stringify(prev) !== JSON.stringify(previewCats)
          ? previewCats
          : prev
      );
      setAvailableCategories((prev) =>
        JSON.stringify(prev) !== JSON.stringify(availableCats)
          ? availableCats
          : prev
      );
      setPreviewColumns(columnCount);
    }, 150);

    debouncedUpdate();
    return () => debouncedUpdate.cancel();
  }, [isControllerOpen, categories, categoryColumns, columnCount]);

  // Add toggleDropdown function with localStorage save
  const toggleDropdown = (categoryId) => {
    setOpenCategories((prev) => {
      const newState = {
        ...prev,
        [categoryId]: !prev[categoryId],
      };
      // Save to localStorage
      localStorage.setItem("categoryOpenStates", JSON.stringify(newState));
      return newState;
    });
  };

  // Add function to handle grid view changes
  // const handleGridViewChange = (isGrid) => {
  //   setGrid(isGrid);
  //   localStorage.setItem("bookmarksGridView", JSON.stringify(isGrid));
  // };

  // Handle column count changes in preview mode
  const handlePreviewColumnChange = (numColumns) => {
    setPreviewColumns(numColumns);

    // Redistribute categories across new columns
    const updatedCategories = previewCategories.map((category, index) => ({
      ...category,
      column: index % numColumns,
      order: Math.floor(index / numColumns),
    }));

    setPreviewCategories(updatedCategories);
  };

  // Function to add category to a column
  const handleAddToColumn = (category, columnIndex) => {
    const categoriesInColumn = getColumnCategories(columnIndex);
    const newOrder = categoriesInColumn.length;

    setPreviewCategories((prev) => [
      ...prev,
      { ...category, column: columnIndex, order: newOrder },
    ]);

    setAvailableCategories((prev) =>
      prev.filter((cat) => cat.id !== category.id)
    );
  };

  // Function to remove category from a column
  const handleRemoveFromColumn = (category) => {
    // Remove from preview categories and column structure
    setPreviewCategories((prev) =>
      prev.filter((cat) => cat.id !== category.id)
    );

    setPreviewColumnStructure((prev) => {
      const newStructure = { ...prev };
      // Remove category from its current column
      Object.keys(newStructure).forEach((columnIndex) => {
        newStructure[columnIndex] = newStructure[columnIndex].filter(
          (cat) => cat.id !== category.id
        );
      });
      return newStructure;
    });

    // Add to available categories if not already present
    setAvailableCategories((prev) => {
      const exists = prev.some((cat) => cat.id === category.id);
      if (!exists) {
        return [...prev, category];
      }
      return prev;
    });
  };

  // Handle drag end in preview mode
  const handlePreviewDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceColumnIndex = parseInt(source.droppableId);
    const destColumnIndex = parseInt(destination.droppableId);

    setPreviewCategories((prev) => {
      const updatedCategories = [...prev];

      // Find the category being moved
      const movedCategory = updatedCategories.find(
        (cat) => cat.column === sourceColumnIndex && cat.order === source.index
      );

      if (movedCategory) {
        // Update the moved category's column and order
        movedCategory.column = destColumnIndex;
        movedCategory.order = destination.index;

        // Update order of other categories in the destination column
        updatedCategories.forEach((cat) => {
          if (cat.column === destColumnIndex && cat.id !== movedCategory.id) {
            if (cat.order >= destination.index) {
              cat.order += 1;
            }
          }
        });

        // Update order of categories in the source column
        if (sourceColumnIndex !== destColumnIndex) {
          updatedCategories.forEach((cat) => {
            if (cat.column === sourceColumnIndex && cat.order > source.index) {
              cat.order -= 1;
            }
          });
        }

        // Sort categories by column and order
        return updatedCategories.sort((a, b) => {
          if (a.column === b.column) {
            return a.order - b.order;
          }
          return a.column - b.column;
        });
      }

      return prev;
    });
  };

  // Handler for applying changes
  const handleApplyChanges = async () => {
    try {
      setIsApplyingChanges(true);

      // Get all category IDs that are in preview categories
      const activeCategories = previewCategories.map((cat) => cat.id);

      // Any category not in activeCategories should be hidden
      const newHiddenCategories = categories
        .filter((cat) => !activeCategories.includes(cat.id))
        .map((cat) => cat.id);

      // Prepare column structure
      const newColumnStructure = Array.from({ length: previewColumns }).reduce(
        (acc, _, index) => {
          const columnKey = `column${index + 1}`;
          acc[columnKey] = previewCategories
            .filter((cat) => cat.column === index)
            .sort((a, b) => a.order - b.order)
            .map((cat) => cat.id);
          return acc;
        },
        {}
      );

      // Update database
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        categoryPositions: {
          columns: newColumnStructure,
          columnCount: previewColumns,
          lastUpdated: new Date().toISOString(),
        },
        hiddenCategories: newHiddenCategories,
      });

      // Update local state
      setHiddenCategories(newHiddenCategories);
      setColumnCount(previewColumns);
      setCategoryColumns(newColumnStructure);

      // Update localStorage
      localStorage.setItem("columnCount", previewColumns.toString());
      localStorage.setItem(
        "categoryColumns",
        JSON.stringify(newColumnStructure)
      );

      setIsControllerOpen(false);
    } catch (error) {
    } finally {
      setIsApplyingChanges(false);
    }
  };

  // Function to fetch and update category positions
  const fetchAndUpdateCategories = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        const updates = {
          categories: data.categories,
          columnCount: data.columnCount,
          categoryColumns: data.categoryColumns,
        };

        // Only update states that have changed
        Object.entries(updates).forEach(([key, value]) => {
          if (value !== undefined) {
            const setter = {
              categories: setCategories,
              columnCount: setColumnCount,
              categoryColumns: setCategoryColumns,
            }[key];
            setter(value);
          }
        });
      }
    } catch (error) {
    }
  };

  // Add effect to fetch categories when user changes
  useEffect(() => {
    if (user) {
      fetchAndUpdateCategories();
    }
  }, [user]);

  // Function to setup real-time database listeners
  const setupDatabaseListeners = () => {
    if (!user) return null;

    const userDocRef = doc(db, "users", user.uid);

    // Setup real-time listener for user document
    const unsubscribeUserDoc = onSnapshot(
      userDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();

          // Check if any relevant data has changed
          const updates = {
            categories: data.categories,
            columnCount: data.columnCount,
            categoryColumns: data.categoryColumns,
          };

          let hasChanges = false;

          // Compare with current state and update only if changed
          Object.entries(updates).forEach(([key, newValue]) => {
            if (newValue !== undefined) {
              const currentValue = {
                categories,
                columnCount,
                categoryColumns,
              }[key];

              // Deep comparison for objects, direct comparison for primitives
              const hasChanged =
                typeof newValue === "object" && newValue !== null
                  ? JSON.stringify(newValue) !== JSON.stringify(currentValue)
                  : newValue !== currentValue;

              if (hasChanged) {
                hasChanges = true;
                const setter = {
                  categories: setCategories,
                  columnCount: setColumnCount,
                  categoryColumns: setCategoryColumns,
                }[key];
                setter(newValue);

                // Update localStorage
                try {
                  localStorage.setItem(
                    key,
                    typeof newValue === "object"
                      ? JSON.stringify(newValue)
                      : String(newValue)
                  );
                } catch (error) {
                  console.error("Error updating localStorage:", error);
                }
              }
            }
          });
        }
      },
      (error) => {
      }
    );

    // Add a listener for user bookmarks
    const unsubscribeBookmarks = onSnapshot(
      collection(db, "users", user.uid, "CatBookmarks"),
      (snapshot) => {
        const changes = snapshot.docChanges();

        if (changes.length > 0) {
          setLinks((prevLinks) => {
            // Create map of existing category-URL combinations to prevent duplicates
            const existingUrlsByCategory = new Map();

            // First pass - track all existing bookmarks by category and URL
            prevLinks.forEach((link) => {
              if (link.categoryId && link.url) {
                const key = `${link.categoryId}-${link.url}`;
                existingUrlsByCategory.set(key, link.id);
              }
            });

            let updatedLinks = [...prevLinks];
            let hasChanges = false;

            changes.forEach((change) => {
              const bookmarkData = {
                id: change.doc.id,
                ...change.doc.data(),
                isAdminBookmark: false,
              };

              // Create a unique key for this bookmark
              const key = `${bookmarkData.categoryId}-${bookmarkData.url}`;

              if (change.type === "added") {
                // Check if it's a temporary ID being replaced
                const tempIndex = updatedLinks.findIndex(
                  (link) =>
                    link.id.startsWith("temp_") &&
                    link.categoryId === bookmarkData.categoryId &&
                    link.url === bookmarkData.url
                );

                if (tempIndex !== -1) {
                  // Replace the temporary bookmark with the real one
                  updatedLinks[tempIndex] = bookmarkData;
                  hasChanges = true;
                }
                // Check if URL already exists in this category
                else if (existingUrlsByCategory.has(key)) {
                  const existingId = existingUrlsByCategory.get(key);
                  // If this is a different document with the same URL, skip it
                  if (existingId !== bookmarkData.id) {
                    console.warn(
                      `Duplicate URL detected in category ${bookmarkData.categoryId}: ${bookmarkData.url}`
                    );
                  } else {
                    // Update the existing bookmark if it's the same document
                    const index = updatedLinks.findIndex(
                      (link) => link.id === existingId
                    );
                    if (index !== -1) {
                      updatedLinks[index] = bookmarkData;
                      hasChanges = true;
                    }
                  }
                }
                // Add as new bookmark if it doesn't exist
                else {
                  // Check if it's already in the array by ID
                  const exists = updatedLinks.some(
                    (link) => link.id === bookmarkData.id
                  );
                  if (!exists) {
                    updatedLinks.push(bookmarkData);
                    existingUrlsByCategory.set(key, bookmarkData.id);
                    hasChanges = true;
                  }
                }
              } else if (change.type === "modified") {
                const index = updatedLinks.findIndex(
                  (link) => link.id === bookmarkData.id
                );
                if (index !== -1) {
                  updatedLinks[index] = {
                    ...updatedLinks[index],
                    ...bookmarkData,
                  };
                  hasChanges = true;
                }
              } else if (change.type === "removed") {
                const initialLength = updatedLinks.length;
                updatedLinks = updatedLinks.filter(
                  (link) => link.id !== bookmarkData.id
                );
                if (initialLength !== updatedLinks.length) {
                  existingUrlsByCategory.delete(key);
                  hasChanges = true;
                }
              }
            });

            // Only update state if something changed
            return hasChanges ? updatedLinks : prevLinks;
          });
        }
      },
      (error) => {
      }
    );

    return () => {
      unsubscribeUserDoc();
      unsubscribeBookmarks();
    };
  };

  // Effect to setup and cleanup database listeners
  useEffect(() => {
    let cleanupFn = null;

    if (user) {
      cleanupFn = setupDatabaseListeners();
    }

    return () => {
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [user]); // Only re-run when user changes

  const renderDraggableBookmark = (provided, snapshot, bookmark) => {
    return (
      <div
        style={{
          ...getBookmarkItemStyle(selectedBookmarks.includes(bookmark.id)),
        }}
      >
        <Checkbox
          checked={selectedBookmarks.includes(bookmark.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedBookmarks([...selectedBookmarks, bookmark.id]);
            } else {
              setSelectedBookmarks(
                selectedBookmarks.filter((id) => id !== bookmark.id)
              );
            }
          }}
          style={{ marginRight: 8 }}
        />
        <img
          src={getFaviconUrl(bookmark.url)}
          alt=""
          style={{
            width: 16,
            height: 16,
            marginRight: 8,
          }}
        />
        <span style={{ flex: 1 }}>{bookmark.title}</span>
        <AntButton
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleEditBookmark(bookmark)}
        />
      </div>
    );
  };

  // Function to handle deletion of selected bookmarks
  const handleDeleteSelected = () => {
    if (selectedBookmarks.length === 0) {
      return;
    }

    Modal.confirm({
      title: "Delete Selected Bookmarks",
      content: `Are you sure you want to delete ${selectedBookmarks.length} selected bookmark(s)? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setLoading(true);

          // Get the bookmarks to delete
          const bookmarksToDelete = editModeBookmarks.filter((bookmark) =>
            selectedBookmarks.includes(bookmark.id)
          );

          // Separate admin and user bookmarks
          const adminBookmarks = bookmarksToDelete.filter(
            (b) => b.isAdminBookmark
          );
          const userBookmarks = bookmarksToDelete.filter(
            (b) => !b.isAdminBookmark
          );

          // Delete user bookmarks
          if (userBookmarks.length > 0) {
            const userBatch = writeBatch(db);
            for (const bookmark of userBookmarks) {
              const bookmarkRef = doc(
                db,
                "users",
                user.uid,
                "CatBookmarks",
                bookmark.id
              );
              userBatch.delete(bookmarkRef);
            }
            await userBatch.commit();
          }

          // Hide admin bookmarks
          if (adminBookmarks.length > 0 && user) {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            const currentHiddenIds = userDoc.data()?.hiddenBookmarkIds || [];
            const newHiddenIds = [
              ...new Set([
                ...currentHiddenIds,
                ...adminBookmarks.map((b) => b.id),
              ]),
            ];
            await updateDoc(userDocRef, {
              hiddenBookmarkIds: newHiddenIds,
            });
          }

          // Update local state
          setLinks((prevLinks) =>
            prevLinks.filter((link) => !selectedBookmarks.includes(link.id))
          );
          setEditModeBookmarks((prevBookmarks) =>
            prevBookmarks.filter(
              (bookmark) => !selectedBookmarks.includes(bookmark.id)
            )
          );
          setSelectedBookmarks([]);
          setHasUnsavedChanges(true);
        } catch (error) {
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Function to toggle controller visibility
  const toggleController = () => {
    setIsControllerOpen((prev) => !prev);
  };

  // Add a new useEffect to load hidden categories
  useEffect(() => {
    const loadHiddenCategories = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();

          // Load hidden categories
          if (
            userData.hiddenCategories &&
            Array.isArray(userData.hiddenCategories)
          ) {
            setHiddenCategories(userData.hiddenCategories);
          }

          // Also load hidden bookmark IDs
          if (
            userData.hiddenBookmarkIds &&
            Array.isArray(userData.hiddenBookmarkIds)
          ) {
            setHiddenBookmarkIds(userData.hiddenBookmarkIds);
          }
        }
      } catch (error) {
        console.error("Error loading hidden categories:", error);
      }
    };

    loadHiddenCategories();
  }, [user]);

  // Add this useEffect to save line options to localStorage
  useEffect(() => {
    localStorage.setItem("bookmarkLineOptions", lineOptions.toString());
  }, [lineOptions]);

  // Import/Export refs
  const importInputRef = useRef(null);

  // Export bookmarks as HTML (Netscape format)
  const handleExportBookmarks = () => {
    // Group bookmarks by category
    const bookmarksByCategory = {};
    links.forEach((link) => {
      if (!bookmarksByCategory[link.categoryId]) bookmarksByCategory[link.categoryId] = [];
      bookmarksByCategory[link.categoryId].push(link);
    });
    // Build HTML
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n`;
    html += `<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n`;
    html += `<TITLE>Bookmarks</TITLE>\n`;
    html += `<H1>Bookmarks</H1>\n`;
    html += `<DL><p>\n`;
    categories.forEach((cat) => {
      if (bookmarksByCategory[cat.id] && bookmarksByCategory[cat.id].length > 0) {
        html += `  <DT><H3>${cat.name || cat.newCategory}</H3>\n`;
        html += `  <DL><p>\n`;
        bookmarksByCategory[cat.id].forEach((link) => {
          html += `    <DT><A HREF=\"${link.url || link.link}\">${link.title || link.name}</A>\n`;
        });
        html += `  </DL><p>\n`;
      }
    });
    html += `</DL><p>\n`;
    // Download
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookmarks.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import bookmarks from HTML
  // const handleImportBookmarks = async (event) => {
  //   const file = event.target.files[0];
  //   if (!file) return;
  //   const text = await file.text();
  //   const imported = [];
  //   let currentCategory = null;
  //   const parser = new Parser({
  //     onopentag(name, attribs) {
  //       if (name === "h3") {
  //         currentCategory = "";
  //       }
  //       if (name === "a" && attribs.href) {
  //         imported.push({
  //           category: currentCategory,
  //           url: attribs.href,
  //           title: "",
  //         });
  //       }
  //     },
  //     ontext(text) {
  //       if (currentCategory !== null) {
  //         currentCategory += text;
  //       } else if (imported.length > 0 && !imported[imported.length - 1].title) {
  //         imported[imported.length - 1].title = text;
  //       }
  //     },
  //     onclosetag(name) {
  //       if (name === "h3") {
  //         currentCategory = currentCategory.trim();
  //       }
  //     },
  //   }, { decodeEntities: true });
  //   parser.write(text);
  //   parser.end();
  //   const categoryMap = {};
  //   for (const cat of categories) {
  //     categoryMap[(cat.name || cat.newCategory).toLowerCase()] = cat.id;
  //   }
  //   for (const bm of imported) {
  //     let catId = categoryMap[bm.category?.toLowerCase() || ""];
  //     if (!catId && bm.category) {
       
  //       const docRef = await addDoc(collection(db, "users", user.uid, "UserCategory"), {
  //         newCategory: bm.category,
  //         userId: user.uid,
  //         order: categories.length,
  //         createdAt: new Date().toISOString(),
  //       });
  //       catId = docRef.id;
  //       categoryMap[bm.category.toLowerCase()] = catId;
  //       setCategories((prev) => [...prev, { id: catId, name: bm.category, userId: user.uid, newCategory: bm.category, order: categories.length }]);
  //       console.log('Created new category:', bm.category, 'with id:', catId);
  //     }
  //     if (catId && bm.url) {
        
  //       await addDoc(collection(db, "users", user.uid, "CatBookmarks"), {
  //         title: bm.title || bm.url,
  //         url: bm.url,
  //         favicon: await fetchFavicon(bm.url),
  //         categoryId: catId,
  //         userId: user.uid,
  //         createdAt: new Date().toISOString(),
  //         order: 0,
  //         isAdminBookmark: false,
  //       });
  //       console.log('Added bookmark:', bm.title || bm.url, 'to category:', catId);
  //     }
  //   }
    
  //   event.target.value = ""; 
  // };

  const getAllUserCategoryIds = () => categories.filter(cat => !cat.isAdminCategory).map(cat => cat.id);

  const handleSelectAllUserCategories = () => {
    if (selectedUserCategories.length === getAllUserCategoryIds().length) {
      setSelectedUserCategories([]);
    } else {
      setSelectedUserCategories(getAllUserCategoryIds());
    }
  };

  const handleDeleteSelectedUserCategories = async () => {
    if (selectedUserCategories.length === 0) return;

    Modal.confirm({
      title: "Delete Selected Categories",
      content: `Are you sure you want to delete ${selectedUserCategories.length} selected category(ies)? All bookmarks in these categories will also be deleted.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setLoading(true);
          for (const categoryId of selectedUserCategories) {
            // Delete the category document
            await deleteDoc(doc(db, "users", user.uid, "UserCategory", categoryId));
            // Delete all bookmarks in this category
            const bookmarksSnapshot = await getDocs(
              collection(db, "users", user.uid, "CatBookmarks")
            );
            const bookmarksToDelete = bookmarksSnapshot.docs.filter(
              (docSnap) => docSnap.data().categoryId === categoryId
            );
            for (const bm of bookmarksToDelete) {
              await deleteDoc(doc(db, "users", user.uid, "CatBookmarks", bm.id));
            }
          }
          setSelectedUserCategories([]);
        } catch (error) {
          console.error("Error deleting selected categories:", error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="w-[85vw] mx-auto" style={{ padding: "24px" }}>
        <div className="flex justify-between mb-2">
          <button className="rounded-lg flex gap-4 items-center text-black bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)]  px-3 py-2 dark:text-white mb-2">
            <PlusOutlined />
            Add Category
          </button>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center bg-white/[(var(--widget-opacity))] backdrop-blur-lg dark:bg-[#28283A]/[(var(--widget-opacity))] p-1 rounded-sm`}
            >
            </div>
          </div>
        </div>
        <SkeletonLoader count={6} />
      </div>
    );
  }
  if (!user) {
    return (
      <div className=" w-[90%] mx-auto rounded-lg  relative ">
        <div className="text-indigo-500 inset-0 flex justify-center items-center h-[60vh]  z-50 absolute top-0 left-0 right-0 w-full  backdrop-blur-md dark:text-white">
          <div className="text-xl -mt-24">Login to use this Feature</div>
        </div>
        <div className="flex justify-center opacity-50 -z-50 pt-24">
          {isDarkMode ? (
            <img src="./DOSB.png" className="h-96 " alt="" />
          ) : (
            <img src="./DOSW.png" className="h-96 " />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={` w-[85vw] mx-auto popular-bookmarks-container ${
        isDarkMode ? "dark" : ""
      }`}
    >
      {renderBookmarksByCategory()}

      {/* Floating Button for Controller */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleController}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          backgroundColor: isDarkMode ? "#28283a" : "#6366F1",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          zIndex: 1000,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        >
          <path d="M3 4h18M3 12h18M3 20h18" />
        </svg>
      </motion.button>

      <Modal
        title={
          <div>
            <div className="text-lg font-semibold">Category Controller</div>
            <div className="text-gray-500 dark:text-gray-300 text-sm mt-1">
              Organize your categories into columns. Drag and drop to reorder. Changes are saved when you click "Apply Changes".
            </div>
          </div>
        }
        open={isControllerOpen}
        onCancel={() => setIsControllerOpen(false)}
        width={900}
        footer={[
          <div key="divider" className="border-t border-gray-200 dark:border-gray-700 my-2"></div>,
          <div key="footer" className="flex justify-end items-center mt-2 gap-2">
            <AntButton
              key="cancel"
              value="dark:hover:bg-gray-800"
              onClick={() => setIsControllerOpen(false)}
              className="dark:text-white border-none  dark:hover:bg-gray-800 dark:bg-gray-700"
            >
              Cancel
            </AntButton>
            <AntButton
              key="apply"
              type="primary"
              loading={isApplyingChanges}
              onClick={handleApplyChanges}
              style={{ marginLeft: "8px" }}
            >
              Apply Changes
            </AntButton>
          </div>,
        ]}
      >
        <div className="flex w-full mb-4 justify-between items-center gap-2">
          <div className="dark:text-white font-medium">Columns:</div>
          <div className="flex gap-2">
            {[1,2,3,4].map(num => (
              <button
                key={num}
                className={`px-4 py-2 rounded-md font-semibold border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 ${
                  previewColumns === num ? "bg-blue-500 text-white shadow" : "bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600"
                }`}
                onClick={() => handlePreviewColumnChange(num)}
                title={`Show ${num} column${num > 1 ? 's' : ''}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
        <DragDropContext onDragEnd={handlePreviewDragEnd}>
          <div
            className="sort-columns-container"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${previewColumns}, 1fr)`,
              gap: "16px",
              marginBottom: "20px",
              maxHeight: "60vh",
              overflowY: "auto",
            }}
          >
            {Array.from({ length: previewColumns }).map((_, columnIndex) => (
              <Droppable key={columnIndex} droppableId={String(columnIndex)}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 rounded-lg min-h-[200px] transition-all duration-300 border-2 ${
                      snapshot.isDraggingOver
                        ? "bg-indigo-50 dark:bg-gray-900/50 border-indigo-400 shadow-lg"
                        : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-center font-semibold dark:text-white">
                        Column {columnIndex + 1}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-300">
                        {getColumnCategories(columnIndex).length} category{getColumnCategories(columnIndex).length !== 1 ? 'ies' : 'y'}
                      </div>
                    </div>
                    <div className="space-y-2 border-none dark:text-white min-h-[100px]">
                      {getColumnCategories(columnIndex).map((category, index) => (
                        <Draggable
                          key={category.id}
                          draggableId={category.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center border-none dark:text-white justify-between p-3 rounded-lg transition-all duration-200 dark:bg-gray-600/50 bg-white shadow-sm ${
                                snapshot.isDragging
                                  ? "shadow-lg border-2 border-indigo-400 scale-105 bg-indigo-50 dark:bg-indigo-900/60"
                                  : "hover:border-indigo-300"
                              }`}
                              style={provided.draggableProps.style}
                            >
                              <div className="flex items-center border-none gap-3">
                                <span {...provided.dragHandleProps} className="cursor-grab text-lg text-gray-400 hover:text-indigo-500 transition-colors" title="Drag to reorder">
                                  <MenuOutlined />
                                </span>
                                <span className="font-medium transition-colors border-none duration-200 text-gray-700 dark:text-white">
                                  {category.name || category.newCategory}
                                </span>
                              </div>
                              <Tooltip title="Remove from column">
                                <AntButton
                                  type="text"
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleRemoveFromColumn(category)}
                                  className="transition-colors duration-200 text-gray-400 hover:text-red-500"
                                />
                              </Tooltip>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {getColumnCategories(columnIndex).length === 0 && (
                        <div className="text-center text-gray-400 dark:text-gray-500 py-8 select-none">
                          No categories in this column
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
        <div className="mt-6">
          <div className="text-sm font-medium dark:text-white text-gray-700 mb-2 flex items-center gap-2">
            Available Categories
            <Tooltip title="Search categories">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2"/></svg>
            </Tooltip>
          </div>
          <input
            type="text"
            placeholder="Search categories..."
            className="mb-3 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={categorySearch || ""}
            onChange={e => setCategorySearch(e.target.value)}
          />
          <div className="p-4 border-2 border-dashed dark:text-white dark:bg-gray-700/50 border-gray-300 rounded-lg bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {availableCategories
                .filter(cat => !categorySearch || (cat.name || cat.newCategory).toLowerCase().includes(categorySearch.toLowerCase()))
                .map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleAddToColumn(category, 0)}
                    className="flex gap-2 items-center text-black dark:bg-[#28283a]/[var(--widget-opacity)] px-4 py-2 rounded-lg dark:text-white bg-white hover:scale-105 transition-transform border border-gray-200 dark:border-gray-700 shadow-sm"
                    title="Add to first column"
                  >
                    <PlusOutlined /> {category.name || category.newCategory}
                  </button>
                ))}
              {availableCategories.filter(cat => !categorySearch || (cat.name || cat.newCategory).toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                <div className="w-full text-center py-4 text-gray-500">
                  No available categories
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        title="Add New Category"
        open={isAddCategoryModalVisible}
        onOk={handleAddCategory}
        onCancel={() => {
          setIsAddCategoryModalVisible(false);
          setNewCategoryName("");
        }}
      >
        <Input
          placeholder="Enter category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCategory();
            }
          }}
        />
      </Modal>

      <Modal
        title="Add Bookmark"
        open={isAddBookmarkModalVisible}
        onOk={handleAddBookmark}
        onCancel={() => {
          setIsAddBookmarkModalVisible(false);
          setNewBookmark({ title: "", url: "", favicon: "" });
          setSelectedCategoryId("");
        }}
      >
        <div className="flex gap-2 mb-4 items-end">
          <div style={{ flex: 1 }}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              className="w-full border rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
              value={selectedCategoryId}
              onChange={(e) => handleCategoryDropdownChange(e.target.value)}
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name || cat.newCategory}
                </option>
              ))}
            </select>
          </div>
          <button
            className="rounded flex gap-1 items-center text-black bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)] px-2 py-1 dark:text-white border border-gray-300 dark:border-gray-700"
            style={{ height: 32 }}
            onClick={() => setIsAddCategoryModalVisible(true)}
            type="button"
          >
            <PlusOutlined style={{ fontSize: 14 }} />
            Add Category
          </button>
        </div>
        <MemoizedBookmarkForm
          newBookmark={newBookmark}
          handleTitleChange={(e) => {
            const title = e.target.value;
            setNewBookmark((prev) => {
              if (prev.title === title) return prev;
              return { ...prev, title };
            });
          }}
          handleUrlChange={handleUrlChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddBookmark();
            }
          }}
        />
      </Modal>

      <Modal
        title="Edit Bookmark"
        open={isEditBookmarkModalVisible}
        onCancel={() => {
          setIsEditBookmarkModalVisible(false);
          setEditingBookmark(null);
          editBookmarkForm.resetFields();
        }}
        onOk={handleEditBookmarkSubmit}
      >
        <Form
          form={editBookmarkForm}
          layout="vertical"
          initialValues={{
            title: editingBookmark?.title || "",
            url: editingBookmark?.url || "",
          }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: "Please input bookmark title!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="url"
            label="URL"
            rules={[
              { required: true, message: "Please input bookmark URL!" },
              {
                type: "url",
                message: "Please enter a valid URL!",
                transform: (value) => {
                  if (!/^https?:\/\//i.test(value)) {
                    return `http://${value}`;
                  }
                  return value;
                },
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Edit Bookmarks - ${selectedCategory?.name}`}
        open={isEditModePanelVisible}
        width={800}
        onCancel={() => {
          if (hasUnsavedChanges) {
            Modal.confirm({
              title: <span className="dark:text-white">Unsaved Changes</span>,
              content: (
                <span className="dark:text-white">
                  You have unsaved changes. Are you sure you want to exit?
                </span>
              ),
              onOk: () => {
                setIsEditModePanelVisible(false);
                setHasUnsavedChanges(false);
                setSelectedBookmarks([]);
              },
              okText: "Yes, Exit",
              cancelText: "Stay",
            });
          } else {
            setIsEditModePanelVisible(false);
            setSelectedBookmarks([]);
          }
        }}
        footer={[
          <AntButton
            key="selectAll"
            className="dark:text-white dark:bg-transparent"
            onClick={selectAllBookmarks}
          >
            {selectedBookmarks.length === editModeBookmarks.length
              ? "Deselect All"
              : "Select All"}
          </AntButton>,
          <AntButton
            key="delete"
            type="primary"
            danger
            disabled={selectedBookmarks.length === 0}
            onClick={handleDeleteSelected}
          >
            <span className="dark:text-white">
              Delete Selected({selectedBookmarks.length})
            </span>
          </AntButton>,
          <AntButton
            key="cancel"
            className="dark:text-white dark:bg-transparent"
            onClick={() => {
              if (hasUnsavedChanges) {
                Modal.confirm({
                  title: (
                    <span className="dark:text-white">Unsaved Changes</span>
                  ), // Added dark text color
                  content: (
                    <span className="dark:text-white">
                      You have unsaved changes. Are you sure you want to exit?
                    </span>
                  ), // Added dark text color
                  onOk: () => {
                    setIsEditModePanelVisible(false);
                    setHasUnsavedChanges(false);
                    setSelectedBookmarks([]);
                  },
                  okText: "Yes, Exit",
                  cancelText: "Stay",
                });
              } else {
                setIsEditModePanelVisible(false);
                setSelectedBookmarks([]);
              }
            }}
          >
            Cancel
          </AntButton>,
        ]}
      >
        <div style={{ minHeight: "100px" }}>
          {editModeBookmarks.map((bookmark, index) => (
            <div key={bookmark.id}>
              {renderDraggableBookmark(null, null, bookmark)}
            </div>
          ))}
        </div>
      </Modal>

      {/* Category Manager Modal */}
      <Modal
        title="Category Manager"
        open={isCategoryManagerOpen}
        onCancel={() => setIsCategoryManagerOpen(false)}
        footer={null}
        width={600}
      >
        {/* Imported Bookmarks Preview */}
        {importedPreview.length === 0 ? (
          <div className="text-center text-gray-500">No imported bookmarks to manage.</div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Imported Bookmarks</span>
              <div className="flex gap-2">
                <AntButton onClick={handleSelectAllImported}>
                  {selectedImported.length === getAllImportedKeys().length ? 'Deselect All' : 'Select All'}
                </AntButton>
                <AntButton
                  danger
                  disabled={selectedImported.length === 0}
                  onClick={handleDeleteSelectedImported}
                >
                  Delete Selected ({selectedImported.length})
                </AntButton>
              </div>
            </div>
            <div style={{ maxHeight: 350, overflowY: 'auto' }}>
              {importedPreview.map((cat, catIdx) => (
                <div key={catIdx} className="mb-4">
                  <div className="font-semibold mb-1">{cat.name}</div>
                  <ul className="ml-4">
                    {cat.links.map((link, linkIdx) => {
                      const key = `${catIdx}-${linkIdx}`;
                      return (
                        <li key={key} className="flex items-center gap-2 mb-1">
                          <Checkbox
                            checked={selectedImported.includes(key)}
                            onChange={e => {
                              setSelectedImported(sel =>
                                e.target.checked
                                  ? [...sel, key]
                                  : sel.filter(k => k !== key)
                              );
                            }}
                          />
                          <span className="truncate max-w-xs">{link.title}</span>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-xs ml-2">{link.url}</a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Divider */}
        <hr className="my-6" />

        {/* User Categories (from Firestore) */}
        <div>
          <div className="font-semibold mb-2 flex items-center gap-2">
            Your Categories
            <AntButton size="small" onClick={handleSelectAllUserCategories}>
              {selectedUserCategories.length === getAllUserCategoryIds().length ? 'Deselect All' : 'Select All'}
            </AntButton>
            <AntButton
              danger
              size="small"
              disabled={selectedUserCategories.length === 0}
              onClick={handleDeleteSelectedUserCategories}
            >
              Delete Selected ({selectedUserCategories.length})
            </AntButton>
          </div>
          <div style={{ maxHeight: 250, overflowY: 'auto' }}>
            {categories.filter(cat => !cat.isAdminCategory).length === 0 ? (
              <div className="text-gray-500">No user categories found.</div>
            ) : (
              categories
                .filter(cat => !cat.isAdminCategory)
                .map(cat => (
                  <div key={cat.id} className="flex items-center justify-between mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedUserCategories.includes(cat.id)}
                        onChange={e => {
                          setSelectedUserCategories(sel =>
                            e.target.checked
                              ? [...sel, cat.id]
                              : sel.filter(id => id !== cat.id)
                          );
                        }}
                      />
                      <span>{cat.name || cat.newCategory}</span>
                    </div>
                    <AntButton
                      danger
                      size="small"
                      onClick={() => handleDeleteCategory(cat.id)}
                    >
                      Delete
                    </AntButton>
                  </div>
                ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Wrap the main component with error boundary
function PopularBookmarksWithErrorBoundary() {
  return (
    <BookmarkErrorBoundary>
      <PopularBookmarks />
    </BookmarkErrorBoundary>
  );
}

export default PopularBookmarksWithErrorBoundary;