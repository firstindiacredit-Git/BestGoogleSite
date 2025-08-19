import React, { useState, useEffect, useRef, useCallback } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  query,
  where,
  deleteDoc,
  writeBatch,
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
  notification,
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
  ExpandOutlined,
  CompressOutlined,
  SettingOutlined,
  SmileOutlined,
  FullscreenOutlined,
} from "@ant-design/icons";
import debounce from "lodash/debounce";
import PropTypes from 'prop-types';

// Import the ThemeContext and useThemeAware hook
import { useThemeAware } from "../context/ThemeContext";
import { useCountry } from "../context/CountryContext";

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

// Helper function to validate URL
const validateUrl = (url) => {
  try {
    let cleanUrl = url.trim();
    if (!cleanUrl.match(/^https?:\/\//i)) {
      cleanUrl = `http://${cleanUrl}`;
    }
    new URL(cleanUrl);
    return cleanUrl;
  } catch {
    throw new Error("Invalid URL format");
  }
};

// Helper function to fetch favicon
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
  } catch {
    return "https://www.google.com/favicon.ico";
  }
};

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
  (prevProps, nextProps) => {
    return (
      prevProps.newBookmark.title === nextProps.newBookmark.title &&
      prevProps.newBookmark.url === nextProps.newBookmark.url
    );
  }
);
MemoizedBookmarkForm.displayName = 'MemoizedBookmarkForm';
MemoizedBookmarkForm.propTypes = {
  newBookmark: PropTypes.shape({
    title: PropTypes.string,
    url: PropTypes.string,
    favicon: PropTypes.string,
  }).isRequired,
  handleTitleChange: PropTypes.func.isRequired,
  handleUrlChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
};

function PopularBookmarks() {
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [professionLoading, setProfessionLoading] = useState(false);
  const [lineOptions, setLineOptions] = useState(() => {
    const savedLineOptions = localStorage.getItem("bookmarkLineOptions");
    return savedLineOptions ? parseInt(savedLineOptions) : 1;
  });
  // Use the global theme context instead of local state
  const { isDarkMode } = useThemeAware();
  const { country: selectedCountry } = useCountry();

  // User profile data for filtering
  const [userProfession, setUserProfession] = useState(() => {
    // Initialize from localStorage if available
    const savedProfession = localStorage.getItem("userProfession");
    return savedProfession || "bpo";
  });
  
  // Cache for filtered categories based on profession
  const [filteredCategoriesCache, setFilteredCategoriesCache] = useState([]);
  const [lastProfessionFilterTime, setLastProfessionFilterTime] = useState(0);

  const [categoryViewModes, setCategoryViewModes] = useState(() => {
    const savedViewModes = localStorage.getItem("categoryViewModes");
    return savedViewModes ? JSON.parse(savedViewModes) : {};
  });
  const [isAddCategoryModalVisible, setIsAddCategoryModalVisible] =
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
  const [categoryBookmarkSizes, setCategoryBookmarkSizes] = useState({});
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
  const [categorySearch, setCategorySearch] = useState("");
  // Add state for show more/less categories
  const [showAllCategories, setShowAllCategories] = useState(false);
  // Add state for search bar visibility
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);


  // Ref for search bar
  const searchBarRef = React.useRef(null);

  // Add state for Category Manager modal and selection
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  // Add state for multi-select user categories in Category Manager
  const [selectedUserCategories, setSelectedUserCategories] = useState([]);

  // Add state for liked bookmarks
  const [likedBookmarks, setLikedBookmarks] = useState([]);
  const [showOnlyLiked, setShowOnlyLiked] = useState(false);
  const [bookmarkLikes, setBookmarkLikes] = useState({});
  const [userLikedBookmarks, setUserLikedBookmarks] = useState({});
  const [showSuggestionWidget, setShowSuggestionWidget] = useState(true);
  const [expandModalVisible, setExpandModalVisible] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedCategoryBookmarks, setExpandedCategoryBookmarks] = useState([]);

  const topFacebookLikedAdminBookmarks = React.useMemo(() => {
    const adminLinks = categories.filter(link => link.isAdminBookmark);
    const sorted = [...adminLinks].sort((a, b) => (bookmarkLikes[b.id] || 0) - (bookmarkLikes[a.id] || 0));
    return sorted.slice(0, 3).filter(link => (bookmarkLikes[link.id] || 0) > 0);
  }, [categories, bookmarkLikes]);



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
        ? ""
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
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user profile data for filtering
        try {
          await getDoc(doc(db, "users", currentUser.uid));
          // const userData = userDoc.data();
          // Do not setUserProfession here!
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Profession ID mapping to handle legacy profession names in database


  // Filter categories based on user preferences and selected country with caching
  const getFilteredCategories = (allCategories) => {
    const now = Date.now();
    
    // Check if we have a recent cache
    if (filteredCategoriesCache.length > 0 && 
        (now - lastProfessionFilterTime) < 5000 && // 5 second cache
        !professionLoading) {
      return filteredCategoriesCache;
    }
    
    // First, separate user-created and admin categories
    const userCategories = allCategories.filter(cat => !cat.isAdminCategory);
    const adminCategories = allCategories.filter(cat => cat.isAdminCategory);

    // Always show user-created categories
    let filteredCategories = [...userCategories];

    // For admin categories, filter based on country and profession
    const adminFilteredCategories = adminCategories.filter(category => {
      // Check country match first
      const matchesCountry = category.countries && (
        category.countries.includes(selectedCountry?.key) ||
        category.countries.includes("global") ||
        (selectedCountry?.key === 'IN' && category.countries.includes('india'))
      );

      // If country doesn't match, don't show the category
      if (!matchesCountry) return false;

      // If user has selected a specific profession (not "all"), filter by profession
      if (userProfession && userProfession !== "all") {
        // Check if category is relevant to the selected profession
        if (Array.isArray(category.professions)) {
          return category.professions.includes(userProfession);
        } else if (category.professions === "all") {
          return true; // Show categories marked for all professions
        } else {
          return false; // Don't show if no profession match
        }
      }

      // If "all" professions is selected, show all categories
      return true;
    });

    // Add filtered admin categories to the result
    filteredCategories = [...filteredCategories, ...adminFilteredCategories];

    // Sort categories by relevance to selected profession
    filteredCategories.sort((a, b) => {
      // If a specific profession is selected, prioritize categories for that profession
      if (userProfession && userProfession !== "all") {
        const aIsForProfession = a.isAdminCategory && (
          (Array.isArray(a.professions) && a.professions.includes(userProfession)) ||
          a.professions === "all"
        );
        const bIsForProfession = b.isAdminCategory && (
          (Array.isArray(b.professions) && b.professions.includes(userProfession)) ||
          b.professions === "all"
        );
        
        if (aIsForProfession && !bIsForProfession) return -1;
        if (!aIsForProfession && bIsForProfession) return 1;
      }
      
      // Then sort by country (India first)
      if (a.isAdminCategory && b.isAdminCategory) {
        if (selectedCountry?.key === 'IN') {
          const aIsIndia = a.countries?.includes('india') || false;
          const bIsIndia = b.countries?.includes('india') || false;
          if (aIsIndia && !bIsIndia) return -1;
          if (!aIsIndia && bIsIndia) return 1;
        }
      }
      return 0;
    });

    // Cache the result
    setFilteredCategoriesCache(filteredCategories);
    setLastProfessionFilterTime(now);

    return filteredCategories;
  };

  // Cache for categories and bookmarks to avoid repeated Firebase calls
  const [allCategoriesCache, setAllCategoriesCache] = useState([]);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const CACHE_DURATION = 1 * 60 * 1000; // 1 minute

  // Effect to handle profession changes and update categories
  useEffect(() => {
    if (allCategoriesCache.length > 0) {
      // Clear cache to force re-filtering when profession changes
      setFilteredCategoriesCache([]);
      setLastProfessionFilterTime(0);
      
      // Get filtered categories immediately
      const filtered = getFilteredCategories(allCategoriesCache);
      setCategories(filtered);
    }
  }, [userProfession, selectedCountry]);

  // Single effect to fetch all data when user changes
  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async (retryCount = 0) => {
      if (!user) {
        setLoading(false);
        setCategories([]);
        setCategoryColumns({ column1: [], column2: [], column3: [], column4: [] });
        setColumnCount(4);
        setHiddenBookmarkIds([]);
        setOpenCategories({});
        return;
      }

      // Check if we can use cached data
      const now = Date.now();
      const canUseCache = allCategoriesCache.length > 0 && (now - lastFetchTime) < CACHE_DURATION;
      
      if (canUseCache) {
        // Use cached categories and just filter them
        const matchingCategories = getFilteredCategories(allCategoriesCache, false);
        setCategories(matchingCategories);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch user doc
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.exists() ? userDocSnap.data() : {};

        // Fetch admin categories
        const adminCategorySnapshot = await getDocs(collection(db, "category"));
        const adminCategories = adminCategorySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isAdminCategory: true,
        }));

        // Fetch user categories
        const userCategorySnapshot = await getDocs(collection(db, "users", user.uid, "UserCategory"));
        const userCategories = userCategorySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          name: doc.data().newCategory,
          isAdminCategory: false,
        }));

        // Combine and sort categories
        const allCategories = [...adminCategories, ...userCategories].sort((a, b) => (a.order || 0) - (b.order || 0));

        // Cache the categories
        setAllCategoriesCache(allCategories);
        setLastFetchTime(now);

        // Get categories that match user preferences using optimized filtering
        const matchingCategories = getFilteredCategories(allCategories, false);

        // Get current column structure
        let currentColumns = userData.categoryPositions?.columns || { column1: [], column2: [], column3: [], column4: [] };
        let colCount = userData.categoryPositions?.columnCount || 4;

        // Auto-add matching categories to columns if they're not already there
        const updatedColumns = { ...currentColumns };
        const existingCategoryIds = new Set(Object.values(currentColumns).flat());

        matchingCategories.forEach((category) => {
          if (!existingCategoryIds.has(category.id)) {
            // Find the column with the least number of categories
            let minColumn = "column1";
            let minCount = updatedColumns.column1?.length || 0;

            Object.keys(updatedColumns).forEach((colKey) => {
              const colCount = updatedColumns[colKey]?.length || 0;
              if (colCount < minCount) {
                minCount = colCount;
                minColumn = colKey;
              }
            });

            // Add category to the column with least items
            updatedColumns[minColumn] = [...(updatedColumns[minColumn] || []), category.id];
            existingCategoryIds.add(category.id);
          }
        });

        // Save updated column structure to Firestore if there were changes
        const hasChanges = JSON.stringify(currentColumns) !== JSON.stringify(updatedColumns);
        if (hasChanges) {
          await updateDoc(userDocRef, {
            categoryPositions: {
              columns: updatedColumns,
              columnCount: colCount,
              lastUpdated: new Date().toISOString(),
            },
          });




        }

        // Use the updated columns for display
        const finalColumns = hasChanges ? updatedColumns : currentColumns;

        // Fetch all user bookmarks
        const userBookmarksSnapshot = await getDocs(collection(db, "users", user.uid, "CatBookmarks"));
        const hiddenIds = userData.hiddenBookmarkIds || [];
        const userBookmarks = userBookmarksSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            isHidden: hiddenIds.includes(doc.id),
            isAdminBookmark: false,
          };
        }).filter((bookmark) => !hiddenIds.includes(bookmark.id));

        // Store user bookmark URLs for deduplication
        const userBookmarkUrls = new Set(userBookmarks.map((b) => `${b.categoryId}-${b.url}`));

        // Fetch admin bookmarks for each admin category
        const adminBookmarksPromises = adminCategories.map(async (category) => {
            const bookmarksSnapshot = await getDocs(query(collection(db, "links"), where("category", "==", category.id)));
            return bookmarksSnapshot.docs.map((doc) => {
              const data = doc.data();
              const key = `${category.id}-${data.link}`;
              if (userBookmarkUrls.has(key)) return null;
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
            }).filter(Boolean).filter((bookmark) => !hiddenIds.includes(bookmark.id));
          });
        const adminBookmarks = (await Promise.all(adminBookmarksPromises)).flat();

        // Combine all bookmarks
        const allBookmarks = [...userBookmarks, ...adminBookmarks];

        // Open categories - default to collapsed state
        const savedOpenStates = localStorage.getItem("categoryOpenStates");
        const initialOpenStates = savedOpenStates
          ? JSON.parse(savedOpenStates)
          : allCategories.reduce((acc, category) => {
            acc[category.id] = false; // Set to false for collapsed state
            return acc;
          }, {});

        // Set state if still mounted
        if (isMounted) {
          setCategories(matchingCategories);
          setCategoryColumns(finalColumns);
          setColumnCount(colCount);
          setHiddenBookmarkIds(hiddenIds);
          setOpenCategories(initialOpenStates);

          // Load liked bookmarks
          if (userData.likedBookmarks && Array.isArray(userData.likedBookmarks)) {
            setLikedBookmarks(userData.likedBookmarks);
          }

          // Load bookmark like counts
          await loadBookmarkLikeCounts(allBookmarks);

          // Debug logging
          console.log('Categories loaded:', matchingCategories.length);
          console.log('User bookmarks loaded:', userBookmarks.length);
          console.log('Admin bookmarks loaded:', adminBookmarks.length);
          console.log('Total bookmarks:', allBookmarks.length);
        }
      } catch (error) {
        if (isMounted) {
          setCategories([]);
          setCategoryColumns({ column1: [], column2: [], column3: [], column4: [] });
          setColumnCount(4);
          setHiddenBookmarkIds([]);
          setOpenCategories({});
        }
        console.error("Error fetching all data:", error);
        
        // Implement retry logic for transient errors
        if (retryCount < 2 && (error.code === 'resource-exhausted' || error.code === 'unavailable')) {
          const delay = Math.pow(2, retryCount) * 2000; // 2s, 4s
          setTimeout(() => fetchAllData(retryCount + 1), delay);
          return;
        }
        
        // Show user-friendly error message
        if (error.code === 'resource-exhausted') {
          notification.error({
            message: "Service Temporarily Unavailable",
            description: "Too many requests. Please wait a moment and try again.",
            placement: "topRight",
            duration: 5
          });
        } else if (error.code === 'unavailable') {
          notification.error({
            message: "Connection Error",
            description: "Unable to connect to the server. Please check your internet connection.",
            placement: "topRight",
            duration: 5
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAllData();
    return () => { isMounted = false; };
  }, [user, selectedCountry]);

  // Effect to handle profession changes instantly using cached data
  useEffect(() => {
    if (user && allCategoriesCache.length > 0) {
      setProfessionLoading(true);
      
      // Use cached categories and filter them instantly
      const matchingCategories = getFilteredCategories(allCategoriesCache, false);
      setCategories(matchingCategories);
      
      // Update categoryColumns to match new categories
      setCategoryColumns(prevColumns => {
        // Only keep IDs that are in filteredCategories
        const validIds = matchingCategories.map(cat => cat.id);
        // Remove any IDs not in validIds
        let newColumns = {};
        let colCount = Object.keys(prevColumns).length || 4;
        for (let col = 1; col <= colCount; col++) {
          newColumns[`column${col}`] = [];
        }
        // Distribute validIds equally among columns
        validIds.forEach((id, index) => {
          const colIndex = (index % colCount) + 1;
          newColumns[`column${colIndex}`].push(id);
        });
        return newColumns;
      });
      
      // Small delay to show loading state for better UX
      setTimeout(() => setProfessionLoading(false), 100);
    }
  }, [userProfession, allCategoriesCache]);

  // Remove the old refiltering effect that was causing performance issues

  // Add useEffect to load saved positions
  useEffect(() => {
    const loadCategoryPositions = async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().categoryPositions) {
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

    // Update state immediately to prevent UI flicker
    setCategoryColumns(newColumns);

    try {
      // Save all positions in user document
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        categoryPositions: {
          columns: newColumns,
          columnCount,
          lastUpdated: new Date().toISOString(),
        },
      });
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
      // Fetch all categories (not just filtered ones) for the controller
      const fetchAllCategoriesForController = async () => {
        try {
          const adminCategorySnapshot = await getDocs(collection(db, "category"));
          const adminCategories = adminCategorySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            isAdminCategory: true,
          }));
          const userCategorySnapshot = await getDocs(collection(db, "users", user.uid, "UserCategory"));
          const userCategories = userCategorySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            name: doc.data().newCategory,
            isAdminCategory: false,
          }));
          const allCategories = [...adminCategories, ...userCategories].sort((a, b) => (a.order || 0) - (b.order || 0));

          // Filter categories based on selected country
          const countryFilteredCategories = allCategories.filter((category) => {
            // If user has selected a specific country, only show categories for that country
            if (selectedCountry && selectedCountry.key !== 'global') {
              // Check if category has countries field and includes the selected country
              if (category.countries && Array.isArray(category.countries)) {
                return category.countries.includes(selectedCountry.key) || category.countries.includes('global');
              }
              // If category doesn't have countries field, don't show it for specific country selection
              return false;
            }
            // If user hasn't selected a country or selected global, show all categories
            return true;
          });

          // Get categories that don't match user preferences
          const nonMatchingCategories = getFilteredCategories(countryFilteredCategories, true);
          const usedCategoryIds = new Set(previewCategories.map((category) => category.id));
          const available = nonMatchingCategories.filter((category) => !usedCategoryIds.has(category.id));
          setAvailableCategories((prevAvailable) => {
            if (prevAvailable.length === 0) {
              return available;
            }
            const existingIds = new Set(prevAvailable.map(cat => cat.id));
            const newAvailable = available.filter(cat => !existingIds.has(cat.id));
            return [...prevAvailable, ...newAvailable];
          });
        } catch (error) {
          console.error("Error fetching categories for controller:", error);
        }
      };

      fetchAllCategoriesForController();
    }
  }, [isControllerOpen, selectedCountry, userProfession]); // Removed previewCategories from dependencies

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
    if (!newCategoryName.trim()) return;

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

      const newCategory = {
        id: docRef.id,
        name: newCategoryName.trim(),
        userId: user.uid,
        newCategory: newCategoryName.trim(),
        order: categories.length,
      };

      setCategories((prevCategories) => [...prevCategories, newCategory]);
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

      // --- YEH PART ADD KARO: Category ko columns me bhi add karo ---
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
        // Firestore me bhi update karo
        const userDocRef = doc(db, "users", user.uid);
        updateDoc(userDocRef, {
          "categoryPositions.columns": newColumns,
        }).catch((error) => console.error("Error updating columns:", error));
        return newColumns;
      });
      // --- YAHAN TAK ---

      notification.success({
        message: "New category added!",
        description: "You can organize it in the Category Controller on the home page.",
        placement: "topRight",
        duration: 4
      });

      setNewCategoryName("");
      setIsAddCategoryModalVisible(false);
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
      const categoryBookmarks = categoryBookmarks[categoryId]?.bookmarks || [];

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
      setCategoryBookmarks(prev => {
        const newState = { ...prev };
        delete newState[categoryId];
        return newState;
      });

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

      // --- NEW: If controller is open, update availableCategories and previewCategories ---
      if (isControllerOpen) {
        setAvailableCategories((prevAvailable) => {
          // Find the deleted category in all categories (admin/user)
          const deletedCat = categories.find((cat) => cat.id === categoryId);
          if (!deletedCat) return prevAvailable;
          // Only add if not already present
          if (prevAvailable.some((cat) => cat.id === categoryId)) return prevAvailable;
          return [...prevAvailable, deletedCat];
        });
        setPreviewCategories((prevPreview) => prevPreview.filter((cat) => cat.id !== categoryId));
      }
      // --- END NEW ---

      //success("Category and its bookmarks deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      //error("Failed to delete category");
    } finally {
      setLoading(false);
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
      //error("Please select a category first");
      return;
    }
    if (!newBookmark.title.trim() || !newBookmark.url.trim()) {
      //error("Title and URL are required");
      return;
    }
    try {
      const normalizedUrl = validateUrl(newBookmark.url.trim());
      const urlKey = `${categoryToUse.id}-${normalizedUrl}`;
      const isDuplicate = categoryBookmarks[categoryToUse.id]?.bookmarks?.some((link) => {
        try {
          const linkUrl = validateUrl(link.url);
          return linkUrl === normalizedUrl;
        } catch {
          return false;
        }
      });
      if (isDuplicate) {
        //warning("This URL already exists in this category");
        return;
      }
      const bookmarkData = {
        title: newBookmark.title.trim(),
        url: normalizedUrl,
        favicon: newBookmark.favicon || (await fetchFavicon(normalizedUrl)),
        categoryId: categoryToUse.id,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        order: categoryBookmarks[categoryToUse.id]?.bookmarks?.length || 0,
        isAdminBookmark: false,
        _tempUrlKey: urlKey,
      };
      setCategoryBookmarks(prev => ({
        ...prev,
        [categoryToUse.id]: {
          ...(prev[categoryToUse.id] || {}),
          bookmarks: [...(prev[categoryToUse.id]?.bookmarks || []), bookmarkData],
        },
      }));
      await addDoc(
        collection(db, "users", user.uid, "CatBookmarks"),
        bookmarkData
      );
      setNewBookmark({ title: "", url: "", favicon: "" });
      setIsAddBookmarkModalVisible(false);
      setSelectedCategoryId("");
      //success("Bookmark added successfully");
    } catch {
      const normalizedUrl = validateUrl(newBookmark.url.trim());
      setCategoryBookmarks(prev => ({
        ...prev,
        [categoryToUse.id]: {
          ...(prev[categoryToUse.id] || {}),
          bookmarks: prev[categoryToUse.id]?.bookmarks?.filter(
            (link) =>
              !(
                link.id.startsWith("temp_") &&
                link.categoryId === (selectedCategoryId || (selectedCategory && selectedCategory.id)) &&
                link.url === normalizedUrl
              )
          ) || [],
        },
      }));
      // ... existing code ...
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
        const visibleBookmarks = categoryBookmarks[category.id]?.bookmarks?.filter(
          (link) => !hiddenBookmarkIds.includes(link.id)
        ) || [];

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
          // icon: (
          //   <div className="dark:text-black bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-md">
          //     <UnorderedListOutlined />
          //   </div>
          // ),
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
            //success("View mode to List");
          },
        },
        {
          key: "grid",
          // icon: (
          //   <div className="dark:text-black bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-md">
          //     <AppstoreOutlined />
          //   </div>
          // ),
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
            //success("View mode to Grid");
          },
        },
        {
          key: "icon",
          // icon: (
          //   <div className="dark:text-black bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-md">
          //     <PictureOutlined />
          //   </div>
          // ),
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
            //success("View mode to Icon");
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
          // icon: (
          //   <div className="dark:text-black bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-md">
          //     <UnorderedListOutlined />
          //   </div>
          // ),
          label: "Short name",
          onClick: () => {
            setLineOptions(1);
          },
        },
        {
          key: "Full name",
          // icon: (
          //   <div className="dark:text-black bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-md">
          //     <AppstoreOutlined />
          //   </div>
          // ),
          label: "Full name",
          onClick: () => {
            setLineOptions(2);
          },
        },
        // {
        //   key: "3 lines",
        //   // icon: (
        //   //   <div className="dark:text-black bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-md">
        //   //     <PictureOutlined />
        //   //   </div>
        //   // ),
        //   label: "Full lines",
        //   onClick: () => {
        //     setLineOptions("none");
        //   },
        // },
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
            setCategoryBookmarkSizes((prev) => ({
              ...prev,
              [category.id]: newSize,
            }));
            // saveUserPreferences(category.id, currentViewMode, newSize);
          },
        },
        {
          key: "medium",
          label: "Medium",
          onClick: () => {
            const newSize = { list: 28, grid: 32, icon: 32 };
            setCategoryBookmarkSizes((prev) => ({
              ...prev,
              [category.id]: newSize,
            }));
            // saveUserPreferences(category.id, currentViewMode, newSize);
          },
        },
        {
          key: "large",
          label: "Large",
          onClick: () => {
            const newSize = { list: 40, grid: 64, icon: 70 };
            setCategoryBookmarkSizes((prev) => ({
              ...prev,
              [category.id]: newSize,
            }));
            // saveUserPreferences(category.id, currentViewMode, newSize);
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
    } catch {
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
        await addDoc(
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
        setCategoryBookmarks(prev => {
          const filtered = prev[editingBookmark.categoryId]?.bookmarks?.filter(link => link.id !== editingBookmark.id) || [];
          return {
            ...prev,
            [editingBookmark.categoryId]: {
              ...(prev[editingBookmark.categoryId] || {}),
              bookmarks: [...filtered, userBookmarkData],
            },
          };
        });
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
        setCategoryBookmarks(prev => {
          const filtered = prev[editingBookmark.categoryId]?.bookmarks?.filter(link => link.id !== editingBookmark.id) || [];
          return {
            ...prev,
            [editingBookmark.categoryId]: {
              ...(prev[editingBookmark.categoryId] || {}),
              bookmarks: [...filtered, {
                ...editingBookmark,
                title: values.title,
                url: values.url,
                updatedAt: new Date().toISOString(),
              }],
            },
          };
        });
      }

      //success("Bookmark updated successfully");
      setEditingBookmark(null);
      setIsEditBookmarkModalVisible(false);
      editBookmarkForm.resetFields();
    } catch (error) {
      console.error("Error updating bookmark:", error);
      //error(`Failed to update bookmark: ${error.message}`);
    }
  };

  // Helper function to truncate text if longer than 15 characters
  const truncateText = (text, maxLength = 15) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const renderBookmarkList = (categoryLinks, categoryId) => {
    const isLoading = categoryBookmarks[categoryId]?.loading;
    
    if (isLoading) {
      return (
        <div className="bg-white/[(var(--widget-opacity))] dark:bg-[#28283a]/[(var(--widget-opacity))]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded mr-3"></div>
              <div className="flex-1">
                <div className="w-24 h-3 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                <div className="w-32 h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (!Array.isArray(categoryLinks)) {
      return (
        <div className="text-center p-4 text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span>Loading bookmarks...</span>
          </div>
        </div>
      );
    }

    const sizes = categoryBookmarkSizes[categoryId] || { list: 32 };

    // Filter bookmarks if showOnlyLiked is enabled
    const filteredLinks = showOnlyLiked
      ? categoryLinks.filter(link => likedBookmarks?.includes(link.id))
      : categoryLinks;

    return (
      <ul className="bg-white/[(var(--widget-opacity))] dark:bg-[#28283a]/[(var(--widget-opacity))]">
        {filteredLinks.map((link) => {
          if (!link || !link.id) return null;

          // Safely get like-related values with defaults
          const isLiked = userLikedBookmarks?.[link.id] || false;
          const likeCount = bookmarkLikes?.[link.id] || 0;
          const isFavorite = likedBookmarks?.includes(link.id) || false;

          // Truncate bookmark name and URL for list view
          const truncatedName = truncateText(link.title || link.name);
          const truncatedUrl = truncateText(link.url || link.link);

          return (
            <li
              key={link.id}
              className="flex items-center py-2 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg group"
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
              <div className="ml-3 flex flex-col flex-1">
                <a
                  href={link.url || link.link}
                  className="text-black dark:text-white hover:text-blue-500"
                  style={{ fontWeight: 500 }}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.title || link.name} // Show full name on hover
                >
                  {truncatedName}
                </a>
                <a
                  href={link.url || link.link}
                  className={`text-xs text-gray-500 dark:text-gray-400 hover:text-blue-400 break-all ${link.isAdminBookmark ? 'truncate whitespace-nowrap overflow-hidden max-w-[180px] block' : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginTop: 2 }}
                  title={link.url || link.link} // Show full URL on hover
                >
                  {truncatedUrl}
                </a>
              </div>

              {/* Like buttons for admin bookmarks */}
              {link.isAdminBookmark && (
                <div className="flex items-center gap-1 ml-2">
                  {/* Heart button (favorites) */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => handleToggleLike(link)}
                      className={`p-1 rounded-full transition-all duration-200 hover:scale-110 ${isFavorite
                          ? "text-red-500 hover:text-red-600"
                          : "text-gray-400 hover:text-red-500"
                        }`}
                      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <svg
                        width="16"
                        height="16"
                        fill={isFavorite ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        className="transition-all duration-200"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {isFavorite ? "1" : "0"}
                    </span>
                  </div>

                  {/* Facebook-style like button */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => handleFacebookLike(link)}
                      className={`p-1 rounded-full transition-all duration-200 hover:scale-110 ${isLiked
                          ? "text-blue-500 hover:text-blue-600"
                          : "text-gray-400 hover:text-blue-500"
                        }`}
                      title={isLiked ? "Unlike this bookmark" : "Like this bookmark"}
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="transition-all duration-200"
                      >
                        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                      </svg>
                    </button>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {likeCount}
                    </span>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderBookmarkGrid = (categoryLinks, categoryId) => {
    const sizes = categoryBookmarkSizes[categoryId] || { grid: 32 };
    const isLoading = categoryBookmarks[categoryId]?.loading;
    const displayedBookmarks = categoryLinks.slice(0, 10);
    
    // Show loading state if bookmarks are being fetched
    if (isLoading) {
      return (
        <div className="w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center p-2 bg-white/[(var(--widget-opacity))] dark:bg-[#513a7a]/[(var(--widget-opacity))] rounded-lg animate-pulse"
              >
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="w-16 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {displayedBookmarks.map((link) => (
            <div
              key={link.id}
              className="flex flex-col items-center p-2 bg-white/[(var(--widget-opacity))] dark:bg-[#513a7a]/[(var(--widget-opacity))] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300 group relative"
            >
              <div className="relative w-full flex justify-center mb-2">
                <a href={link.url || link.link} className="block" target="_blank" rel="noopener noreferrer">
                  <img
                    src={getFaviconUrl(link.url || link.link)}
                    alt={link.title || link.name}
                    style={{
                      width: `${sizes.grid}px`,
                      height: `${sizes.grid}px`,
                    }}
                    className="mx-auto object-contain transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://www.google.com/favicon.ico";
                    }}
                  />
                </a>
              </div>
              <a
                href={link.url || link.link}
                className="w-full text-center text-black dark:text-white hover:text-blue-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span
                  className={`text-sm break-words block ${lineOptions === 2
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
    const isLoading = categoryBookmarks[categoryId]?.loading;
    
    if (isLoading) {
      return (
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="relative group flex justify-center animate-pulse">
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-2">
          {categoryLinks.map((link) => (
            <div key={link.id} className="relative group flex justify-center">
              <Tooltip title={link.title || link.name}>
                <a href={link.url || link.link} className="block" target="_blank" rel="noopener noreferrer">
                  <img
                    src={getFaviconUrl(link.url || link.link)}
                    alt={link.title || link.name}
                    style={{
                      width: `${sizes.icon}px`,
                      height: `${sizes.icon}px`,
                    }}
                    className="mx-auto transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://www.google.com/favicon.ico";
                    }}
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





  const renderBookmarksByCategory = () => {
    const areAllOpen =
      categories.length > 0 &&
      categories.every((cat) => openCategories[cat.id]);

    // --- Enhanced Global Search: search both categories and bookmarks ---
    const searchTerm = (categorySearch || '').toLowerCase();

    // Helper: for each category, get bookmarks in that category
    const getCategoryLinks = (catId) => {
      const categoryLinks = categoryBookmarks[catId]?.bookmarks || [];

      // If no bookmarks found and category is open, load them
      if (categoryLinks.length === 0 && openCategories[catId]) {
        const category = categories.find(c => c.id === catId);
        if (category) {
          // Load bookmarks for this category asynchronously
          fetchBookmarksForCategory(catId);
        }
      }

      return categoryLinks;
    };

    // Helper: does a bookmark match the search?
    const bookmarkMatches = (bookmark) => {
      if (!searchTerm) return true;
      return (
        (bookmark.title && bookmark.title.toLowerCase().includes(searchTerm)) ||
        (bookmark.url && bookmark.url.toLowerCase().includes(searchTerm))
      );
    };

    // Filter categories: show if category name matches OR any bookmark matches
    const filteredCategoryIds = Object.values(categoryColumns)
      .flat()
      .filter((catId) => {
        const cat = categories.find((c) => c.id === catId);
        if (!cat) return false;
        const name = (cat.name || cat.newCategory || '').toLowerCase();
        if (name.includes(searchTerm)) return true;
        // If any bookmark in this category matches, include the category
        const catLinks = getCategoryLinks(catId);
        return catLinks.some(bookmarkMatches);
      });

    // Helper: get all filtered categories in the user's column structure
    const getAllColumns = () => {
      const result = {};
      for (let col = 1; col <= columnCount; col++) {
        const colKey = `column${col}`;
        result[colKey] = (categoryColumns[colKey] || []).filter(catId => filteredCategoryIds.includes(catId));
      }
      return result;
    };

    // Helper: get visible category IDs in the user's column structure, up to a total limit, distributed equally among columns
    const getLimitedColumns = (limit) => {
      // Step 1: Gather filtered categories per column, preserving order
      const perColumn = {};
      for (let col = 1; col <= columnCount; col++) {
        const colKey = `column${col}`;
        perColumn[colKey] = (categoryColumns[colKey] || []).filter(catId => filteredCategoryIds.includes(catId));
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

    // Decide which columns to render
    const columnsToRender = showAllCategories
      ? getAllColumns()
      : getLimitedColumns(16);

    // If user selected 'all' professions, group categories by profession
    if (userProfession === "all") {
      // 1. Group admin categories by profession
      const professionGroups = {};
      professionOptions.forEach((prof) => {
        if (prof.id === "all") return; // skip 'all' itself
        professionGroups[prof.id] = [];
      });
      // 2. Separate user and admin categories
      const userCategories = categories.filter(cat => !cat.isAdminCategory);
      const adminCategories = categories.filter(cat => cat.isAdminCategory);
      // 3. Assign admin categories to profession groups
      adminCategories.forEach(cat => {
        if (Array.isArray(cat.professions)) {
          cat.professions.forEach(profId => {
            if (professionGroups[profId]) {
              professionGroups[profId].push(cat);
            }
          });
        } else if (cat.professions === "all") {
          // If category is for all, add to all profession groups
          Object.keys(professionGroups).forEach(profId => {
            professionGroups[profId].push(cat);
          });
        }
      });
      // 4. Render grouped categories
      return (
        <div className="mb-2">
          {/* User Categories Section */}
          {userCategories.length > 0 && (
            <div id="user-categories-section" className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300">Your Categories</h3>
              <div className="grid grid-cols-4 gap-4">
                {userCategories.map((category) => {
                  // Get bookmarks for this category
                  let categoryLinks = getCategoryLinks(category.id);
                  const name = (category.name || category.newCategory || '').toLowerCase();
                  if (searchTerm && !name.includes(searchTerm)) {
                    categoryLinks = categoryLinks.filter(bookmarkMatches);
                  }

                  return (
                    <div key={category.id} className="w-full h-fit">
                      <Card
                        className="max-w-xl backdrop-blur-sm bg-white/[var(--widget-opacity)] dark:bg-[#28283a]/[var(--widget-opacity)] dark:text-white mx-auto rounded-sm"
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
                                    className={`cursor-grab active:cursor-grabbing p-2 transition-all duration-200 group hover:bg-gray-200/50 dark:hover:bg-gray-600/50 rounded`}
                                    title="Drag to reorder"
                                  >
                                    <div className="flex flex-col gap-[2px]">
                                      <div className="flex gap-[2px]">
                                        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                      </div>
                                      <div className="flex gap-[2px]">
                                        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                      </div>
                                      <div className="flex gap-[2px]">
                                        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`font-semibold ${category.isFavoritesCategory ? 'text-red-600 dark:text-red-400' : ''}`} title={category.name || category.newCategory}>
                                      {category.isFavoritesCategory && <span className="mr-1">❤️</span>}
                                      {truncateText(category.name || category.newCategory)}
                                    </span>
                                    {category.isFavoritesCategory && (
                                      <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded flex items-center gap-1">
                                        Favorites
                                      </span>
                                    )}
                                  </div>
                                </div>
                              <Space onClick={(e) => e.stopPropagation()}>
                                <Tooltip title="Add Bookmark">
                                  <AntButton
                                    type="text"
                                    icon={<PlusOutlined className="text-black dark:text-white" />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCategory(category);
                                      setSelectedCategoryId(category.id);
                                      setIsAddBookmarkModalVisible(true);
                                    }}
                                    style={{ color: "white" }}
                                  />
                                </Tooltip>
                                {(() => {
                                  const bookmarks = getCategoryLinks(category.id);
                                  console.log(`Category ${category.id}: ${bookmarks.length} bookmarks`);
                                  return bookmarks.length > 10;
                                })() && (
                                  <Tooltip title="Show All Bookmarks">
                                    <AntButton
                                      type="text"
                                      icon={<FullscreenOutlined className="text-black dark:text-white" />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedCategory(category.id);
                                        setExpandedCategoryBookmarks(getCategoryLinks(category.id));
                                        setExpandModalVisible(true);
                                      }}
                                      style={{ color: "white" }}
                                    />
                                  </Tooltip>
                                )}
                                <Dropdown
                                  menu={{
                                    items: getCategoryMenuItems(category),
                                  }}
                                  trigger={["click"]}
                                  overlayClassName="[&_.ant-dropdown-menu]:p-0 [&_.ant-dropdown-menu-item]:p-0 [&_ul]:dark:bg-[#28283a]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <AntButton
                                    type="text"
                                    icon={<MoreOutlined className="text-black dark:text-white" />}
                                    onClick={(e) => e.stopPropagation()}
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
                            display: openCategories[category.id] ? "block" : "none",
                            willChange: "transform, opacity",
                          },
                        }}
                        style={{
                          height: "100%",
                          transition: "all 0.15s ease",
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
                            {categoryViewModes[category.id] === "list" &&
                              renderBookmarkList(categoryLinks, category.id)}
                            {categoryViewModes[category.id] === "grid" &&
                              renderBookmarkGrid(categoryLinks, category.id)}
                            {categoryViewModes[category.id] === "icon" &&
                              renderBookmarkIcon(categoryLinks, category.id)}
                            {!categoryViewModes[category.id] &&
                              renderBookmarkGrid(categoryLinks, category.id)}
                          </>
                        )}
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Profession Groups */}
          {professionOptions.filter(p => p.id !== "all").map((prof) => (
            professionGroups[prof.id].length > 0 && (
              <div key={prof.id} id={`profession-section-${prof.id}`} className="mb-10">
                <h3 className="text-xl mx-auto text-center p-4 border bg-blue-500/50 border-blue-300 dark:border-blue-700 font-bold mb-4 flex items-center justify-between text-white dark:text-white cursor-pointer hover:bg-blue-600/50 transition-colors" onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Get all category IDs for this profession
                  const categoryIds = professionGroups[prof.id].map(cat => cat.id);
                  
                  // Check if all categories in this profession are currently open
                  const allOpen = categoryIds.every(catId => openCategories[catId]);
                  
                  // Create new state: if all are open, close all; if any are closed, open all
                  const newOpenCategories = { ...openCategories };
                  categoryIds.forEach(catId => {
                    newOpenCategories[catId] = !allOpen;
                  });
                  
                  // Update state immediately
                  setOpenCategories(newOpenCategories);
                  
                  // Save to localStorage asynchronously to avoid blocking
                  setTimeout(() => {
                    localStorage.setItem("categoryOpenStates", JSON.stringify(newOpenCategories));
                  }, 0);
                }}>
                  <div className="w-6"></div> {/* Spacer to keep center alignment */}
                  <div className="flex items-center gap-2">
                    <span>{prof.icon}</span> 
                    <span>{prof.name}</span>
                  </div>
                  <button className="p-1 rounded hover:bg-blue-700/50 transition-colors">
                    {professionGroups[prof.id].every(cat => openCategories[cat.id]) ? (
                      <CompressOutlined className="text-white" />
                    ) : (
                      <ExpandOutlined className="text-white" />
                    )}
                  </button>
                </h3>
                                  <div className="grid grid-cols-4 gap-4">
                    {professionGroups[prof.id].map((category) => {
                      // Get bookmarks for this category
                      let categoryLinks = getCategoryLinks(category.id);
                      const name = (category.name || category.newCategory || '').toLowerCase();
                      if (searchTerm && !name.includes(searchTerm)) {
                        categoryLinks = categoryLinks.filter(bookmarkMatches);
                      }

                    return (
                      <div key={category.id} className="w-full h-fit">
                        <Card
                          className="max-w-xl backdrop-blur-sm bg-white/[var(--widget-opacity)] dark:bg-[#28283a]/[var(--widget-opacity)] dark:text-white mx-auto rounded-sm"
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
                                    className={`cursor-grab active:cursor-grabbing p-2 transition-all duration-200 group hover:bg-gray-200/50 dark:hover:bg-gray-600/50 rounded`}
                                    title="Drag to reorder"
                                  >
                                    <div className="flex flex-col gap-[2px]">
                                      <div className="flex gap-[2px]">
                                        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                      </div>
                                      <div className="flex gap-[2px]">
                                        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                      </div>
                                      <div className="flex gap-[2px]">
                                        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`font-semibold ${category.isFavoritesCategory ? 'text-red-600 dark:text-red-400' : ''}`} title={category.name || category.newCategory}>
                                      {category.isFavoritesCategory && <span className="mr-1">❤️</span>}
                                      {truncateText(category.name || category.newCategory)}
                                    </span>
                                    {category.isFavoritesCategory && (
                                      <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded flex items-center gap-1">
                                        Favorites
                                      </span>
                                    )}
                                    {category.isAdminCategory && (
                                      <div className="flex gap-1">
                                        {/* Country indicator */}
                                        {category.countries?.includes('india') && selectedCountry?.key === 'IN' && (
                                          <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded">
                                            🇮🇳 India
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Space onClick={(e) => e.stopPropagation()}>
                                  <Tooltip title="Add Bookmark">
                                    <AntButton
                                      type="text"
                                      icon={<PlusOutlined className="text-black dark:text-white" />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCategory(category);
                                        setSelectedCategoryId(category.id);
                                        setIsAddBookmarkModalVisible(true);
                                      }}
                                      style={{ color: "white" }}
                                    />
                                  </Tooltip>
                                  {(() => {
                                    const bookmarks = getCategoryLinks(category.id);
                                    console.log(`Profession Category ${category.id}: ${bookmarks.length} bookmarks`);
                                    return bookmarks.length > 10;
                                  })() && (
                                    <Tooltip title="Show All Bookmarks">
                                      <AntButton
                                        type="text"
                                        icon={<FullscreenOutlined className="text-black dark:text-white" />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setExpandedCategory(category.id);
                                          setExpandedCategoryBookmarks(getCategoryLinks(category.id));
                                          setExpandModalVisible(true);
                                        }}
                                        style={{ color: "white" }}
                                      />
                                    </Tooltip>
                                  )}
                                  <Dropdown
                                    menu={{
                                      items: getCategoryMenuItems(category),
                                    }}
                                    trigger={["click"]}
                                    overlayClassName="[&_.ant-dropdown-menu]:p-0 [&_.ant-dropdown-menu-item]:p-0 [&_ul]:dark:bg-[#28283a]"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <AntButton
                                      type="text"
                                      icon={<MoreOutlined className="text-black dark:text-white" />}
                                      onClick={(e) => e.stopPropagation()}
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
                              display: openCategories[category.id] ? "block" : "none",
                            },
                          }}
                          style={{
                            height: "100%",
                            transition: "all 0.3s ease",
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
                              {categoryViewModes[category.id] === "list" &&
                                renderBookmarkList(categoryLinks, category.id)}
                              {categoryViewModes[category.id] === "grid" &&
                                renderBookmarkGrid(categoryLinks, category.id)}
                              {categoryViewModes[category.id] === "icon" &&
                                renderBookmarkIcon(categoryLinks, category.id)}
                              {!categoryViewModes[category.id] &&
                                renderBookmarkGrid(categoryLinks, category.id)}
                            </>
                          )}
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ))}
        </div>
      );
    }

    return (
      <div className="mb-2">
        {/* Profession-specific header when a specific profession is selected */}
        {userProfession && userProfession !== "all" && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            {/* <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">
                {professionOptions.find(p => p.id === userProfession)?.icon || "💼"}
              </span>
              <div className="text-center">
                <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">
                  {getProfessionDisplayName(userProfession)} Categories
                </h2>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  Showing categories specifically curated for {getProfessionDisplayName(userProfession).toLowerCase()} professionals
                </p>
              </div>
            </div> */}
          </div>
        )}
        
        {/* Search bar for categories */}
        <div className="flex justify-between mb-2 items-center gap-2">
          {/* User Preferences Indicator */}
          <div className="flex items-center gap-2">
            {/* Show Only Liked Filter Indicator */}
            {showOnlyLiked && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/20 rounded-lg text-sm">
                <span className="text-red-700 dark:text-red-300">Showing only liked bookmarks</span>
                <button
                  onClick={() => setShowOnlyLiked(false)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-xs underline"
                >
                  Show All
                </button>
              </div>
            )}

          </div>
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <div className="relative flex items-center" ref={searchBarRef}>
              <button
                onClick={() => setIsSearchBarOpen(!isSearchBarOpen)}
                className="rounded-lg flex gap-2 items-center mb-1.5 text-black bg-white/[var(--widget-opacity)] dark:bg-[#28283a]/[var(--widget-opacity)] px-3 py-2 dark:text-white transition-all duration-300 hover:scale-105"
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
                    <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
                    <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
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
                    <circle cx="11" cy="11" r="8" strokeWidth="2" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
                  </svg>
                )}
              </button>
              {/* Sliding Search Input */}
              <div
                className={`absolute right-0 top-0 transition-all duration-300 ease-in-out ${isSearchBarOpen
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

            {/* Add Button */}
            <Dropdown
              menu={{
                items: [
                  {
                    key: "addCategory",
                    icon: <PlusOutlined />,
                    label: "Add Category",
                    onClick: () => setIsAddCategoryModalVisible(true),
                  },
                  {
                    key: "addBookmark",
                    icon: <PlusOutlined />,
                    label: "Add Bookmark",
                    onClick: handleGlobalAddBookmark,
                  },
                ],
              }}
              trigger={["click"]}
            >
              <button className="rounded-lg flex gap-2 items-center text-black bg-white/[var(--widget-opacity)] dark:bg-[#28283a]/[var(--widget-opacity)] px-3 py-2 dark:text-white mb-2">
                <PlusOutlined />
              </button>
            </Dropdown>

            {/* Settings Button */}
            <Dropdown
              menu={{
                items: [
                  {
                    key: "expandCollapse",
                    icon: areAllOpen ? <CompressOutlined /> : <ExpandOutlined />, // dynamic icon
                    label: areAllOpen ? "Collapse All" : "Expand All", // dynamic label
                    onClick: toggleAllCategories,
                  },
                  {
                    key: "showLiked",
                    icon: <span style={{ color: "#e25555" }}>❤️</span>,
                    label: showOnlyLiked ? "Show All Bookmarks" : "Show Only Liked",
                    onClick: () => setShowOnlyLiked(!showOnlyLiked),
                  },
                  {
                    key: "categoryManager",
                    icon: <SettingOutlined />,
                    label: "Category Manager",
                    onClick: () => setIsCategoryManagerOpen(true),
                  },
                  {
                    key: "refresh",
                    icon: <span style={{ color: "#4fc3f7" }}>🔄</span>,
                    label: "Refresh Categories",
                    onClick: async () => {
                      try {
                        await refreshMainViewCategories();
                        notification.success({
                          message: "Categories Refreshed!",
                          description: "Your categories have been updated.",
                          placement: "topRight",
                          duration: 2
                        });
                                              } catch {
                        notification.error({
                          message: "Refresh Failed",
                          description: "Please try again.",
                          placement: "topRight",
                          duration: 2
                        });
                      }
                    },
                  },

                  {
                    key: "view",
                    icon: <UnorderedListOutlined />,
                    label: "View",
                    children: [
                      {
                        key: "view-list",
                        label: "List",
                        onClick: () => {
                          setCategoryViewModes(() => {
                            const newModes = {};
                            categories.forEach(cat => {
                              newModes[cat.id] = "list";
                            });
                            localStorage.setItem("categoryViewModes", JSON.stringify(newModes));
                            return newModes;
                          });
                        },
                      },
                      {
                        key: "view-grid",
                        label: "Grid",
                        onClick: () => {
                          setCategoryViewModes(() => {
                            const newModes = {};
                            categories.forEach(cat => {
                              newModes[cat.id] = "grid";
                            });
                            localStorage.setItem("categoryViewModes", JSON.stringify(newModes));
                            return newModes;
                          });
                        },
                      },
                      {
                        key: "view-icon",
                        label: "Icon",
                        onClick: () => {
                          setCategoryViewModes(() => {
                            const newModes = {};
                            categories.forEach(cat => {
                              newModes[cat.id] = "icon";
                            });
                            localStorage.setItem("categoryViewModes", JSON.stringify(newModes));
                            return newModes;
                          });
                        },
                      },
                    ],
                  },
                ],
              }}
              trigger={["click"]}
            >
              <button className="rounded-lg flex gap-2 items-center text-black bg-white/[var(--widget-opacity)] dark:bg-[#28283a]/[var(--widget-opacity)] px-3 py-2 dark:text-white mb-2">
                <SettingOutlined />
              </button>
            </Dropdown>

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
                        className={` transition-colors duration-200 ${snapshot.isDraggingOver
                            ? "bg-transparent border-2 border-dashed border-blue-500"
                            : "bg-transparent border-2 border-dashed border-transparent"
                          }`}
                      >
                        {columnsToRender[`column${colNum}`]?.map(
                          (categoryId, index) => {
                            const category = categories.find(
                              (c) => c.id === categoryId
                            );
                            if (!category) return null;

                            // Get bookmarks for this category, filter by search if needed
                            let categoryLinks = getCategoryLinks(category.id);
                            // Determine if this category is included because of a name match
                            const name = (category.name || category.newCategory || '').toLowerCase();
                            if (searchTerm && !name.includes(searchTerm)) {
                              // Only filter bookmarks if the category name does NOT match
                              categoryLinks = categoryLinks.filter(bookmarkMatches);
                            }

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
                                    className={`mb-4 transition-all duration-200 ${snapshot.isDragging
                                        ? "shadow-xl rotate-2 scale-105 z-50"
                                        : "shadow-none rotate-0 scale-100"
                                      }`}
                                    style={{
                                      ...provided.draggableProps.style,
                                      transform: snapshot.isDragging
                                        ? `${provided.draggableProps.style?.transform} rotate(2deg) scale(1.05)`
                                        : provided.draggableProps.style?.transform
                                    }}
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
                                                className={`cursor-grab active:cursor-grabbing p-2 transition-all duration-200 group hover:bg-gray-200/50 dark:hover:bg-gray-600/50 rounded ${snapshot.isDragging
                                                    ? "bg-gray-300/[(var(--widget-opacity))] rounded shadow-lg cursor-grabbing"
                                                    : ""
                                                  }`}
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                                title="Drag to reorder"
                                              >
                                                <div className="flex flex-col gap-[2px]">
                                                  <div className="flex gap-[2px]">
                                                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                                  </div>
                                                  <div className="flex gap-[2px]">
                                                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                                  </div>
                                                  <div className="flex gap-[2px]">
                                                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span className={`font-semibold ${category.isFavoritesCategory ? 'text-red-600 dark:text-red-400' : ''}`} title={category.name || category.newCategory}>
                                                  {category.isFavoritesCategory && <span className="mr-1">❤️</span>}
                                                  {truncateText(category.name || category.newCategory)}
                                                </span>
                                                {category.isFavoritesCategory && (
                                                  <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded flex items-center gap-1">
                                                    Favorites
                                                  </span>
                                                )}
                                                {category.isAdminCategory && (
                                                  <div className="flex gap-1">
                                                    {/* Country indicator */}
                                                    {category.countries?.includes('india') && selectedCountry?.key === 'IN' && (
                                                      <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded">
                                                        🇮🇳 India
                                                      </span>
                                                    )}
                                                    {/* Profession indicator - removed as requested */}
                                                    {/* Interest indicator */}
                                                    {/* {category.interests?.some(i => mainInterests.includes(i)) && (
                                                      <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded">
                                                        Interest Match
                                                      </span>
                                                    )} */}
                                                  </div>
                                                )}
                                              </div>
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

        {/* No Categories Message */}
        {/* {filteredCategoryIds.length === 0 && userProfession && (
          <div className="text-center py-8">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                No matching categories found
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                {!userProfession ? (
                  "Please set your profession to see relevant categories."
                ) : (
                  `No categories match your profession (${userProfession}).`
                )}
              </p>
              <div className="flex flex-col gap-4 items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Select your profession from the options above</p>
                {renderProfessionBar()}
              </div>
            </div>
          </div>
        )} */}
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
    // Prevent duplicates: check if category is already in previewCategories
    if (previewCategories.some(cat => cat.id === category.id)) return;
    // Also check if already in the column structure
    const categoriesInColumn = getColumnCategories(columnIndex);
    const newOrder = categoriesInColumn.length;

    // Add to preview categories
    setPreviewCategories((prev) => [
      ...prev,
      { ...category, column: columnIndex, order: newOrder },
    ]);

    // Remove from available categories to prevent duplicates
    setAvailableCategories((prev) =>
      prev.filter((cat) => cat.id !== category.id)
    );

    // Also update the actual column structure
    setCategoryColumns((prevColumns) => {
      const newColumns = { ...prevColumns };
      const colKey = `column${columnIndex + 1}`;
      if (!newColumns[colKey]) {
        newColumns[colKey] = [];
      }
      // Prevent duplicates in columns
      if (!newColumns[colKey].includes(category.id)) {
        newColumns[colKey] = [...newColumns[colKey], category.id];
      }
      return newColumns;
    });
  };



  // Function to remove category from a column
  const handleRemoveFromColumn = (category) => {
    // Remove from preview categories and column structure
    setPreviewCategories((prev) =>
      prev.filter((cat) => cat.id !== category.id)
    );

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
        // Remove the category from its current position
        const filteredCategories = updatedCategories.filter(
          (cat) => !(cat.column === sourceColumnIndex && cat.order === source.index)
        );

        // Update order of categories in the source column
        filteredCategories.forEach((cat) => {
          if (cat.column === sourceColumnIndex && cat.order > source.index) {
            cat.order -= 1;
          }
        });

        // Update order of categories in the destination column
        filteredCategories.forEach((cat) => {
          if (cat.column === destColumnIndex && cat.order >= destination.index) {
            cat.order += 1;
          }
        });

        // Add the moved category to its new position
        movedCategory.column = destColumnIndex;
        movedCategory.order = destination.index;

        const finalCategories = [...filteredCategories, movedCategory];

        // Sort categories by column and order
        return finalCategories.sort((a, b) => {
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
      });

      // Update local state immediately
      setColumnCount(previewColumns);
      setCategoryColumns(newColumnStructure);

      // Update localStorage
      localStorage.setItem("columnCount", previewColumns.toString());
      localStorage.setItem(
        "categoryColumns",
        JSON.stringify(newColumnStructure)
      );

      // Fetch all categories and update the main view
      const adminCategorySnapshot = await getDocs(collection(db, "category"));
      const adminCategories = adminCategorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isAdminCategory: true,
      }));

      const userCategorySnapshot = await getDocs(collection(db, "users", user.uid, "UserCategory"));
      const userCategories = userCategorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        name: doc.data().newCategory,
        isAdminCategory: false,
      }));

      const allCategories = [...adminCategories, ...userCategories].sort((a, b) => (a.order || 0) - (b.order || 0));

      // Get categories that match user preferences for main view
      const matchingCategories = getFilteredCategories(allCategories, false);

      // Update the categories state to show in main view
      setCategories(matchingCategories);

      // Force a re-render by updating the categories state again after a short delay
      setTimeout(() => {
        setCategories([...matchingCategories]);
      }, 100);

      
      setIsControllerOpen(false);
    } catch (error) {
      console.error("Error applying changes:", error);
      notification.error({
        message: "Failed to Apply Changes",
        description: "Please try again.",
        placement: "topRight",
        duration: 3
      });
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
      console.error("Error fetching categories:", error);
    }
  };

  // Function to refresh the main view categories
  const refreshMainViewCategories = async () => {
    if (!user) return;

    try {
      const adminCategorySnapshot = await getDocs(collection(db, "category"));
      const adminCategories = adminCategorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isAdminCategory: true,
      }));

      const userCategorySnapshot = await getDocs(collection(db, "users", user.uid, "UserCategory"));
      const userCategories = userCategorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        name: doc.data().newCategory,
        isAdminCategory: false,
      }));

      const allCategories = [...adminCategories, ...userCategories].sort((a, b) => (a.order || 0) - (b.order || 0));
      const filteredCategories = getFilteredCategories(allCategories, false);

      setCategories(filteredCategories);
    } catch (error) {
      console.error("Error refreshing categories:", error);
    }
  };

  // Add effect to fetch categories when user changes
  useEffect(() => {
    if (user) {
      fetchAndUpdateCategories();
    }
  }, [user]);

  // Add effect to fetch categories when user changes
  useEffect(() => {
    if (user) {
      fetchAndUpdateCategories();
    }
  }, [user]);

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
      //warning("No bookmarks selected for deletion");
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
          setCategoryBookmarks(prev => {
            const newState = { ...prev };
            bookmarksToDelete.forEach(bookmark => {
              newState[bookmark.categoryId] = {
                ...(prev[bookmark.categoryId] || {}),
                bookmarks: prev[bookmark.categoryId]?.bookmarks?.filter(b => b.id !== bookmark.id) || [],
              };
            });
            return newState;
          });
          setEditModeBookmarks((prevBookmarks) =>
            prevBookmarks.filter(
              (bookmark) => !selectedBookmarks.includes(bookmark.id)
            )
          );
          setSelectedBookmarks([]);
          setHasUnsavedChanges(true);
        } catch (error) {
          console.error("Error processing bookmarks:", error);
          //error(`Failed to process bookmarks: ${error.message}`);
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

  // Add a new useEffect to load hidden bookmark IDs
  useEffect(() => {
    const loadHiddenBookmarkIds = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();

          // Load hidden bookmark IDs
          if (
            userData.hiddenBookmarkIds &&
            Array.isArray(userData.hiddenBookmarkIds)
          ) {
            // console.log(
            //   "Loading hidden bookmark IDs:",
            //   userData.hiddenBookmarkIds
            // );
            setHiddenBookmarkIds(userData.hiddenBookmarkIds);
          }
        }
      } catch (error) {
        console.error("Error loading hidden bookmark IDs:", error);
      }
    };

    loadHiddenBookmarkIds();
  }, [user]);

  // Add this useEffect to save line options to localStorage
  useEffect(() => {
    localStorage.setItem("bookmarkLineOptions", lineOptions.toString());
  }, [lineOptions]);

  // Add effect to focus search input when search bar opens
  useEffect(() => {
    if (isSearchBarOpen) {
      const searchInput = searchBarRef.current?.querySelector('input');
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 100);
      }
    }
  }, [isSearchBarOpen]);





  // Helper to get all user category IDs
  const getAllUserCategoryIds = () =>
    categories.filter(cat => !cat.isAdminCategory).map(cat => cat.id);

  const handleSelectAllUserCategories = () => {
    const allIds = getAllUserCategoryIds();
    if (selectedUserCategories.length === allIds.length) {
      setSelectedUserCategories([]);
    } else {
      setSelectedUserCategories(allIds);
    }
  };

  const handleDeleteSelectedUserCategories = () => {
    if (selectedUserCategories.length === 0) return;
    Modal.confirm({
      title: `Delete Selected Categories`,
      content: `Are you sure you want to delete ${selectedUserCategories.length} selected categor${selectedUserCategories.length === 1 ? 'y' : 'ies'} and all their bookmarks? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setLoading(true);
          for (const catId of selectedUserCategories) {
            await handleDeleteCategory(catId);
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



  // --- 1. Add a helper to batch fetch like counts ---
  const batchFetchBookmarkLikes = async (bookmarkIds, db) => {
    if (!bookmarkIds.length) return { likeCounts: {}, userLiked: {} };
    const likeCounts = {};
    const userLiked = {};
    // Firestore does not support 'in' queries on document ID, so fetch each doc by ID
    await Promise.all(bookmarkIds.map(async (id) => {
      const docSnap = await getDoc(doc(db, "bookmarkLikes", id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        likeCounts[id] = data.likes || 0;
        userLiked[id] = data.likedBy || [];
      } else {
        likeCounts[id] = 0;
        userLiked[id] = [];
    }
    }));
    return { likeCounts, userLiked };
  };
  // --- 2. Refactor loadBookmarkLikeCounts to use batch fetch ---
  const loadBookmarkLikeCounts = async (bookmarks) => {
    try {
      // Initialize with empty objects first
      setBookmarkLikes({});
      setUserLikedBookmarks({});

      const adminBookmarks = bookmarks.filter(bookmark => bookmark.isAdminBookmark);
      if (!adminBookmarks.length) return;

      const bookmarkIds = adminBookmarks.map(b => b.id);
      if (!bookmarkIds.length) return;
      const { likeCounts, userLiked } = await batchFetchBookmarkLikes(bookmarkIds, db);
      const userId = user?.uid;

      // Update states with fetched data
      setBookmarkLikes(likeCounts || {});
      setUserLikedBookmarks(
        Object.fromEntries(
          bookmarkIds.map(id => [id, userLiked[id]?.includes(userId) || false])
        )
      );
    } catch (error) {
      console.error("Error loading bookmark like counts:", error);
      // Set default values on error
      setBookmarkLikes({});
      setUserLikedBookmarks({});
    }
  };
  // --- 3. Suggestion widget: always show on page load if there are liked bookmarks ---
  // Remove the auto-hide effect and instead always show the widget if there are top liked bookmarks
  // Replace this effect:
  // useEffect(() => {
  //   if (topFacebookLikedAdminBookmarks.length > 0) {
  //     setShowSuggestionWidget(true);
  //     const timer = setTimeout(() => setShowSuggestionWidget(false), 3000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [topFacebookLikedAdminBookmarks.map(b => b.id).join(','), topFacebookLikedAdminBookmarks.map(b => bookmarkLikes[b.id]).join(',')]);
  // With this:
  useEffect(() => {
    if (topFacebookLikedAdminBookmarks.length > 0) {
      setShowSuggestionWidget(true);
    } else {
      setShowSuggestionWidget(false);
    }
  }, [topFacebookLikedAdminBookmarks.length]);
  // ... existing code ...
  // --- 4. Render categories and bookmarks immediately, update like counts as soon as fetched ---
  // (No change needed if you already render categories and bookmarks as soon as they are available, and only like counts update later)
  // ... existing code ...

  // Floating Review Button State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", gmail: "", description: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Handler for review form input changes
  const handleReviewInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for review form submission
  const handleReviewSubmit = async () => {
    setReviewSubmitting(true);
    setTimeout(() => {
      setReviewSubmitting(false);
      setIsReviewModalOpen(false);
      setReviewForm({ name: "", gmail: "", description: "" });
      notification.success({
        message: "Thank you for your review!",
        description: "Your feedback has been submitted.",
        placement: "topRight",
        duration: 3,
        icon: <SmileOutlined style={{ color: '#52c41a' }} />,
      });
    }, 1200);
  };

  // --- Like/Favorite (Heart) Button Handler ---
  const handleToggleLike = async (bookmark) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      let newLikedBookmarks;
      let isAdding = false;
      
      if (likedBookmarks.includes(bookmark.id)) {
        // Remove from favorites
        newLikedBookmarks = likedBookmarks.filter((id) => id !== bookmark.id);
      } else {
        // Add to favorites
        newLikedBookmarks = [...likedBookmarks, bookmark.id];
        isAdding = true;
      }
      
      setLikedBookmarks(newLikedBookmarks);
      await updateDoc(userDocRef, { likedBookmarks: newLikedBookmarks });

      // If adding to favorites, ensure Favorites category exists and add bookmark
      if (isAdding) {
        await ensureFavoritesCategoryAndAddBookmark(bookmark);
      } else {
        // If removing from favorites, remove from Favorites category
        await removeBookmarkFromFavorites(bookmark);
      }
    } catch (error) {
      notification.error({
        message: "Failed to update favorites",
        description: error.message,
        placement: "topRight",
        duration: 2,
      });
    }
  };

  // Helper function to ensure Favorites category exists and add bookmark
  const ensureFavoritesCategoryAndAddBookmark = async (bookmark) => {
    try {
      // Check if Favorites category already exists
      const userCategorySnapshot = await getDocs(collection(db, "users", user.uid, "UserCategory"));
      const favoritesCategory = userCategorySnapshot.docs.find(doc => 
        doc.data().newCategory === "Favorites"
      );

      let favoritesCategoryId;
      
      if (!favoritesCategory) {
        // Create Favorites category
        const newCategoryDoc = await addDoc(collection(db, "users", user.uid, "UserCategory"), {
          newCategory: "Favorites",
          userId: user.uid,
          order: categories.length,
          createdAt: new Date().toISOString(),
          isFavoritesCategory: true, // Mark as favorites category
        });
        favoritesCategoryId = newCategoryDoc.id;
        
        // Add to local categories state
        const newFavoritesCategory = {
          id: favoritesCategoryId,
          name: "Favorites",
          newCategory: "Favorites",
          userId: user.uid,
          order: categories.length,
          isFavoritesCategory: true,
          isAdminCategory: false,
        };
        
        setCategories(prev => [...prev, newFavoritesCategory]);
        
        // Show success notification
        notification.success({
          message: "Favorites Category Created!",
          description: "A new 'Favorites' category has been created for your liked bookmarks.",
          placement: "topRight",
          duration: 3,
        });
      } else {
        favoritesCategoryId = favoritesCategory.id;
      }

      // Add bookmark to Favorites category
      const bookmarkData = {
        title: bookmark.title || bookmark.name,
        url: bookmark.url || bookmark.link,
        favicon: bookmark.favicon || getFaviconUrl(bookmark.url || bookmark.link),
        categoryId: favoritesCategoryId,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        order: 0,
        isAdminBookmark: false,
        originalBookmarkId: bookmark.id, // Reference to original bookmark
      };

      await addDoc(collection(db, "users", user.uid, "CatBookmarks"), bookmarkData);

      // Update local category bookmarks state
      setCategoryBookmarks(prev => ({
        ...prev,
        [favoritesCategoryId]: {
          ...(prev[favoritesCategoryId] || {}),
          bookmarks: [...(prev[favoritesCategoryId]?.bookmarks || []), bookmarkData],
          lastFetched: Date.now(),
        }
      }));

      // Show success notification
      notification.success({
        message: "Added to Favorites!",
        description: `"${bookmark.title || bookmark.name}" has been added to your Favorites category.`,
        placement: "topRight",
        duration: 2,
      });

    } catch (error) {
      console.error("Error ensuring favorites category:", error);
      notification.error({
        message: "Failed to add to Favorites",
        description: "Please try again.",
        placement: "topRight",
        duration: 2,
      });
    }
  };

  // Helper function to remove bookmark from Favorites category
  const removeBookmarkFromFavorites = async (bookmark) => {
    try {
      // Find the Favorites category
      const userCategorySnapshot = await getDocs(collection(db, "users", user.uid, "UserCategory"));
      const favoritesCategory = userCategorySnapshot.docs.find(doc => 
        doc.data().newCategory === "Favorites"
      );

      if (favoritesCategory) {
        // Find and delete the bookmark from Favorites category
        const bookmarksSnapshot = await getDocs(collection(db, "users", user.uid, "CatBookmarks"));
        const favoritesBookmark = bookmarksSnapshot.docs.find(doc => 
          doc.data().categoryId === favoritesCategory.id && 
          doc.data().originalBookmarkId === bookmark.id
        );

        if (favoritesBookmark) {
          await deleteDoc(doc(db, "users", user.uid, "CatBookmarks", favoritesBookmark.id));
          
          // Update local state
          setCategoryBookmarks(prev => ({
            ...prev,
            [favoritesCategory.id]: {
              ...(prev[favoritesCategory.id] || {}),
              bookmarks: prev[favoritesCategory.id]?.bookmarks?.filter(b => b.id !== favoritesBookmark.id) || [],
              lastFetched: Date.now(),
            }
          }));

          notification.success({
            message: "Removed from Favorites!",
            description: `"${bookmark.title || bookmark.name}" has been removed from your Favorites category.`,
            placement: "topRight",
            duration: 2,
          });
        }
      }
    } catch (error) {
      console.error("Error removing bookmark from favorites:", error);
      notification.error({
        message: "Failed to remove from Favorites",
        description: "Please try again.",
        placement: "topRight",
        duration: 2,
      });
    }
  };

  // --- Facebook-like Button Handler ---
  const handleFacebookLike = async (bookmark) => {
    if (!user) return;
    try {
      const likeDocRef = doc(db, "bookmarkLikes", bookmark.id);
      const likeDocSnap = await getDoc(likeDocRef);
      let likes = 0;
      let likedBy = [];
      if (likeDocSnap.exists()) {
        const data = likeDocSnap.data();
        likes = data.likes || 0;
        likedBy = data.likedBy || [];
      }
      let newLikes, newLikedBy;
      if (userLikedBookmarks[bookmark.id]) {
        // Unlike
        newLikes = Math.max(0, likes - 1);
        newLikedBy = likedBy.filter((uid) => uid !== user.uid);
      } else {
        // Like
        newLikes = likes + 1;
        newLikedBy = [...likedBy, user.uid];
      }
      // Optimistically update UI
      setBookmarkLikes((prev) => ({ ...prev, [bookmark.id]: newLikes }));
      setUserLikedBookmarks((prev) => ({ ...prev, [bookmark.id]: !userLikedBookmarks[bookmark.id] }));
      await setDoc(likeDocRef, { likes: newLikes, likedBy: newLikedBy }, { merge: true });
    } catch (error) {
      notification.error({
        message: "Failed to update like",
        description: error.message,
        placement: "topRight",
        duration: 2,
      });
    }
  };

  // Bookmarks per category: { [categoryId]: { bookmarks: [], loading: false, unsubscribe: null } }
  const [categoryBookmarks, setCategoryBookmarks] = useState({});



  // Helper: fetch admin bookmarks for a category
  const fetchAdminBookmarksForCategory = async (categoryId) => {
    try {
      const bookmarksSnapshot = await getDocs(query(collection(db, "links"), where("category", "==", categoryId)));
      return bookmarksSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          title: data.name,
          url: data.link,
          categoryId: categoryId,
          isAdminBookmark: true,
          createdBy: data.createdBy,
          updatedAt: data.updatedAt,
          order: data.order || 0,
        };
      });
    } catch (error) {
      console.error("Error fetching admin bookmarks:", error);
      return [];
    }
  };

  // THROTTLED: Fetch bookmarks for a category with request limiting and caching
  // - Implements request throttling to prevent Firebase rate limits
  // - Uses sequential fetching instead of concurrent to reduce load
  // - Implements exponential backoff for retries
  // - Added comprehensive error handling and offline support
  const fetchBookmarksForCategory = useCallback((categoryId) => {
    if (!user || !categoryId) return;
    
    // Check if already loading or loaded (with cache expiry)
    const currentState = categoryBookmarks[categoryId];
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes
    const isCacheValid = currentState?.lastFetched && 
      (Date.now() - currentState.lastFetched) < cacheExpiry;
    
    if (currentState?.loading || (currentState?.bookmarks && isCacheValid)) return;
    
    // Set loading state
    setCategoryBookmarks(prev => ({
      ...prev,
      [categoryId]: { ...(prev[categoryId] || {}), loading: true, error: null }
    }));

    // Throttled fetch with retry logic
    const fetchBookmarks = async (retryCount = 0) => {
      try {
        // Sequential fetching to reduce Firebase load
        const userSnapshot = await getDocs(query(
          collection(db, "users", user.uid, "CatBookmarks"), 
          where("categoryId", "==", categoryId)
        ));

        const userBookmarks = userSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(), 
          isAdminBookmark: false 
        }));

        // Fetch admin bookmarks with delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      const adminBookmarks = await fetchAdminBookmarksForCategory(categoryId);

        // Filter admin bookmarks efficiently
      const userBookmarkUrls = new Set(userBookmarks.map(b => b.url));
        const hiddenIds = new Set(hiddenBookmarkIds);
        const filteredAdmin = adminBookmarks.filter(b => 
          !userBookmarkUrls.has(b.url) && !hiddenIds.has(b.id)
        );

        // Merge and sort bookmarks
        const bookmarks = [...userBookmarks, ...filteredAdmin].sort((a, b) => 
          (a.order || 0) - (b.order || 0)
        );

        // Update state
      setCategoryBookmarks(prev => ({
        ...prev,
          [categoryId]: { 
            bookmarks, 
            loading: false,
            lastFetched: Date.now(),
            error: null
          }
        }));

      } catch (error) {
        console.error(`Error fetching bookmarks for category ${categoryId}:`, error);
        
        // Implement exponential backoff for retries
        if (retryCount < 3 && error.code !== 'permission-denied') {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          setTimeout(() => fetchBookmarks(retryCount + 1), delay);
          return;
        }

        // Final error state
        setCategoryBookmarks(prev => ({
          ...prev,
          [categoryId]: { 
            bookmarks: [], 
            loading: false,
            error: error.message || 'Failed to load bookmarks'
          }
        }));
      }
    };

    // Remove random delay for fastest fetch
    fetchBookmarks();
  }, [user, categoryBookmarks, hiddenBookmarkIds]);



  // Fetch bookmarks for all categories (open or closed) for fast loading
  useEffect(() => {
    if (!user || !categories.length) return;
    categories.forEach((cat) => {
      fetchBookmarksForCategory(cat.id);
    });
  }, [user, categories, fetchBookmarksForCategory]);

  // Handle category toggle events with throttled loading
  useEffect(() => {
    if (!user) return;
    
    // Get categories that need loading
    const categoriesToLoad = Object.entries(openCategories)
      .filter(([categoryId, isOpen]) => 
        isOpen && !categoryBookmarks[categoryId]?.bookmarks && !categoryBookmarks[categoryId]?.loading
      )
      .map(([categoryId]) => categoryId);

    // Load categories with staggered delays to prevent rate limiting
    categoriesToLoad.forEach((categoryId, index) => {
      const delay = index * 500; // 500ms between each category load
      setTimeout(() => {
        fetchBookmarksForCategory(categoryId);
      }, delay);
    });
  }, [openCategories, user, fetchBookmarksForCategory, categoryBookmarks]);

  // Profession options
  const professionOptions = [
    // { id: "developer", name: "Developer", icon: "💻" },
    // { id: "designer", name: "Designer", icon: "🎨" },
    // { id: "digital_marketer", name: "Marketer", icon: "📱" },
    // { id: "student", name: "Student", icon: "🎓" },
    // { id: "teacher", name: "Teacher", icon: "👩‍🏫" },
    // { id: "entrepreneur", name: "Founder", icon: "💼" },
    // { id: "freelancer", name: "Freelancer", icon: "🆓" },
    // { id: "consultant", name: "Consultant", icon: "💡" },
    // { id: "working_professional", name: "Professional", icon: "👔" },
    // { id: "researcher", name: "Researcher", icon: "🔬" },
    // { id: "it_support", name: "IT Support", icon: "🛠️" },
    // { id: "medical", name: "Medical", icon: "⚕️" },
    // { id: "other", name: "Other", icon: "✨" },
    { id: "all", name: "All Professions", icon: "🌐" },
    { id: "bpo", name: "BPO", icon: "📞" },
    { id: "productivity_management", name: "Productivity & Task Management", icon: "⚡" },
    { id: "ai_automation", name: "AI Tools & Automation", icon: "🤖" },
    { id: "education_learning", name: "Education & Learning", icon: "📚" },
    { id: "professional_entrepreneurship", name: "Professional & Entrepreneurship", icon: "💼" },
    { id: "tax_investments", name: "Tax & Investments", icon: "💰" },
    { id: "marketing_growth", name: "Marketing & Growth", icon: "📈" },
    { id: "creativity_design", name: "Creativity & Design", icon: "🎨" },
    { id: "programmer_developer", name: "Programmer & Developer", icon: "💻" },
    { id: "news", name: "News", icon: "📰" },
    { id: "shopping_deals", name: "Shopping & Deal Sites", icon: "🛒" },
    { id: "health_wellness", name: "Health & Wellness", icon: "🏥" },
    { id: "travel", name: "Travel", icon: "✈️" },
    { id: "entertainment_leisure", name: "Entertainment & Leisure", icon: "🎭" },
    { id: "career_jobs", name: "Career & Job Portals", icon: "💼" },
    { id: "privacy_security", name: "Privacy & Security", icon: "🔒" },
    { id: "india_specific", name: "India-Specific Portals", icon: "🇮🇳" },
    { id: "brain_interests", name: "Brain-Interests", icon: "🧠" },
    { id: "science_nature", name: "Science & Nature", icon: "🔬" },
    { id: "automotive_transport", name: "Automotive & Transport", icon: "🚗" },
    { id: "gaming_entertainment", name: "Gaming & Entertainment", icon: "🎮" },
    { id: "kids_family", name: "Kids & Family", icon: "👨‍👩‍👧‍👦" },
    { id: "international_tools", name: "International Tools", icon: "🌍" },
    { id: "events_conferences", name: "Events & Conferences", icon: "📅" },
    { id: "technology_computing", name: "Technology & Computing", icon: "💻" },
    { id: "social_community", name: "Social & Community", icon: "👥" },
    { id: "home_lifestyle", name: "Home & Lifestyle", icon: "🏠" },
    { id: "analytics_reporting", name: "Analytics & Reporting", icon: "📊" },
    { id: "startup_indie_tools", name: "Startup Directories & Indie Tools", icon: "🚀" },
    
  ];

  // Helper to get profession display name
  const getProfessionDisplayName = (professionId) => {
    const profession = professionOptions.find((p) => p.id === professionId);
    return profession ? profession.name : "Set Profession";
  };



    // State to track current visible profession when scrolling
  const [currentVisibleProfession, setCurrentVisibleProfession] = useState(userProfession);

  // Function to detect which profession section is currently visible
  const detectVisibleProfession = useCallback(() => {
    if (userProfession !== "all") {
      setCurrentVisibleProfession(userProfession);
      return;
    }

    const professionSections = professionOptions.filter(p => p.id !== "all").map(p => p.id);
    const userCategoriesSection = document.getElementById('user-categories-section');
    
    // Check if user categories section is visible
    if (userCategoriesSection) {
      const rect = userCategoriesSection.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        setCurrentVisibleProfession('user-categories');
        return;
      }
    }

    // Check each profession section
    for (const profId of professionSections) {
      const section = document.getElementById(`profession-section-${profId}`);
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          setCurrentVisibleProfession(profId);
          return;
        }
      }
    }
  }, [userProfession]);

  // Add scroll listener
  useEffect(() => {
    if (userProfession === "all") {
      const handleScroll = () => {
        detectVisibleProfession();
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setCurrentVisibleProfession(userProfession);
    }
  }, [userProfession, detectVisibleProfession]);

  // Add profession selection bar at the top
  const renderProfessionBar = useCallback(() => (
    <div className="mb-6">
      {/* Current Profession Display */}
      
      
      {/* All Profession Options in Single Row */}
      <div className="grid grid-cols-10 gap-2">
        {professionOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              // Set loading state
              setProfessionLoading(true);
              
              // Update profession and save to localStorage
              setUserProfession(option.id);
              localStorage.setItem("userProfession", option.id);
              
              // Clear cache to force re-filtering
              setFilteredCategoriesCache([]);
              setLastProfessionFilterTime(0);
              
              // Stop loading after a short delay
              setTimeout(() => setProfessionLoading(false), 300);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${userProfession === option.id
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            title={option.name}
          >
            <span className="text-base">{option.icon}</span>
            <span className="text-xs font-medium truncate">{option.name}</span>
            {userProfession === option.id && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 ml-auto"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  ), [userProfession]);

  if (loading) {
    return (
      <div className="w-[85vw] mx-auto" style={{ padding: "24px" }}>
        {renderProfessionBar()}
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <iframe 
              src="https://lottie.host/embed/0af2f653-3de1-41c3-ae8b-b59706cd0907/3OjO8sTisE.lottie"
              style={{ width: '500px', height: '500px', border: 'none' }}
              title="Loading Animation"
            />
          </div>
        </div>
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
      className={` w-[85vw] mx-auto popular-bookmarks-container ${isDarkMode ? "dark" : ""
        }`}
    >
      

      {renderProfessionBar()}
      
      {/* Profession loading indicator */}
      {professionLoading && (
        <div className="flex justify-center items-center py-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-blue-600 dark:text-blue-400 font-medium">Loading categories for {getProfessionDisplayName(userProfession)}...</span>
        </div>
      )}
      {/* Sticky Profession Header (iPhone notch style) */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 -mx-4 px-4 py-3 mb-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700 rounded-full">
            <span className="text-base">
              {currentVisibleProfession === 'user-categories' 
                ? "📁" 
                : professionOptions.find(p => p.id === currentVisibleProfession)?.icon || "🌐"
              }
            </span>
            <span className="text-sm font-semibold">
              {currentVisibleProfession === 'user-categories' 
                ? "Your Categories" 
                : getProfessionDisplayName(currentVisibleProfession)
              }
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"></span>
          </div>
        </div>
      </div>
      
      {/* Floating Most Facebook-Liked Bookmarks Suggestion Widget */}
      {showSuggestionWidget && topFacebookLikedAdminBookmarks.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: 75,
            zIndex: 1200,
            background: isDarkMode ? '#28283a' : '#fff',
            color: isDarkMode ? '#fff' : '#222',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            padding: '18px 20px 12px 20px',
            minWidth: 260,
            maxWidth: 320,
            border: isDarkMode ? '1px solid #444' : '1px solid #e0e0e0',
            transition: 'all 0.3s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: 0.2 }}>👍 Most Liked Bookmarks</span>
            <button
              onClick={() => setShowSuggestionWidget(false)}
              style={{ background: 'none', border: 'none', color: isDarkMode ? '#fff' : '#222', fontSize: 18, cursor: 'pointer', marginLeft: 8 }}
              title="Close"
            >
              ×
            </button>
          </div>
          <div>
            {topFacebookLikedAdminBookmarks.map((bookmark, idx) => (
              <a
                key={bookmark.id}
                href={bookmark.url || bookmark.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: '1px solid ' + (isDarkMode ? '#333' : '#eee'),
                  textDecoration: 'none',
                  color: isDarkMode ? '#fff' : '#222',
                  fontWeight: 500,
                }}
              >
                {/* Crown badge for #1 most liked */}
                {idx === 0 && (
                  <span style={{ marginRight: 4, display: 'flex', alignItems: 'center' }} title="Most Liked">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#FFD700" style={{ marginRight: 2 }}><path d="M12 2l2.09 6.26L20 9.27l-5 4.87L16.18 22 12 18.56 7.82 22 9 14.14l-5-4.87 5.91-.91z" /></svg>
                  </span>
                )}
                <img
                  src={bookmark.favicon || `https://www.google.com/s2/favicons?sz=32&domain=${(bookmark.url || bookmark.link || '').replace(/https?:\/\//, '').split('/')[0]}`}
                  alt=""
                  style={{ width: 22, height: 22, borderRadius: 4, marginRight: 4, background: '#fff' }}
                />
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bookmark.title || bookmark.name}</span>
                <span style={{ fontSize: 15, color: isDarkMode ? '#4fc3f7' : '#1976d2', fontWeight: 600, marginLeft: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 2 }}><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" /></svg>
                  {bookmarkLikes[bookmark.id] || 0}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
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
              Organize your categories into columns. Drag and drop to reorder. Changes are saved when you click &quot;Apply Changes&quot;.
            </div>
          </div>
        }
        open={isControllerOpen}
        onCancel={() => setIsControllerOpen(false)}
        width={1000}
        footer={[
          <div key="divider" className="border-t  border-gray-200 dark:border-gray-700 my-2"></div>,
          <div key="footer" className="flex justify-end items-center mt-2 gap-2">
            <AntButton
              key="cancel"
              value="dark:hover:bg-gray-800"
              onClick={() => setIsControllerOpen(false)}
              className="dark:text-white border-none dark:hover:bg-gray-800 dark:bg-gray-700"
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
        {/* Category Controller Header */}

        <div className="flex w-full mb-4 justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <div className="dark:text-white font-medium">Columns:</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  className={`px-4 py-2 rounded-md font-semibold border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 ${previewColumns === num ? "bg-blue-500 text-white shadow" : "bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600"
                    }`}
                  onClick={() => handlePreviewColumnChange(num)}
                  title={`Show ${num} column${num > 1 ? "s" : ""}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Active: {previewCategories.length}</span>
            <span>Available: {availableCategories.length}</span>
            <span>Total: {previewCategories.length + availableCategories.length}</span>
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
                    className={`p-4 rounded-lg min-h-[200px] transition-all duration-300 border-2 ${snapshot.isDraggingOver
                        ? "bg-indigo-50 dark:bg-gray-900/50 border-indigo-400 shadow-lg scale-105"
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
                              className={`flex items-center border-none dark:text-white justify-between p-3 rounded-lg transition-all duration-200 dark:bg-gray-600/50 bg-white shadow-sm ${snapshot.isDragging
                                  ? "shadow-xl border-2 border-indigo-400 scale-105 bg-indigo-50 dark:bg-indigo-900/60 rotate-2 z-50"
                                  : "hover:border-indigo-300 hover:shadow-md"
                                }`}
                              style={{
                                ...provided.draggableProps.style,
                                transform: snapshot.isDragging
                                  ? `${provided.draggableProps.style?.transform} rotate(2deg) scale(1.05)`
                                  : provided.draggableProps.style?.transform
                              }}
                            >
                              <div className="flex items-center border-none gap-3">
                                <span {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-2 transition-all duration-200 group hover:bg-gray-200/50 dark:hover:bg-gray-600/50 rounded" title="Drag to reorder">
                                  <div className="flex flex-col gap-[2px]">
                                    <div className="flex gap-[2px]">
                                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                    </div>
                                    <div className="flex gap-[2px]">
                                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                    </div>
                                    <div className="flex gap-[2px]">
                                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                    </div>
                                  </div>
                                </span>
                                <span className="font-medium transition-colors border-none duration-200 text-gray-700 dark:text-white" title={category.name || category.newCategory}>
                                  {truncateText(category.name || category.newCategory)}
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
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium dark:text-white text-gray-700 flex items-center gap-2">
              Available Categories ({availableCategories.length})
              <Tooltip title="Search categories">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" strokeWidth="2" /><line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" /></svg>
              </Tooltip>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCategorySearch("")}
                className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Clear Search
              </button>
              <button
                onClick={() => {
                  // Add all available categories to columns
                  const allAvailable = availableCategories.filter(cat =>
                    !categorySearch || (cat.name || cat.newCategory).toLowerCase().includes(categorySearch.toLowerCase())
                  );

                  setPreviewCategories(prev => {
                    const updated = [...prev];
                    allAvailable.forEach((category, index) => {
                      const colIndex = index % previewColumns;
                      const order = Math.floor(index / previewColumns);
                      updated.push({
                        ...category,
                        column: colIndex,
                        order: order
                      });
                    });
                    return updated;
                  });

                  setAvailableCategories(prev =>
                    prev.filter(cat =>
                      !allAvailable.some(availableCat => availableCat.id === cat.id)
                    )
                  );
                }}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add All Filtered
              </button>
            </div>
          </div>
          <input
            type="text"
            placeholder="Search categories..."
            className="mb-3 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={categorySearch || ""}
            onChange={e => setCategorySearch(e.target.value)}
          />
          <div className="p-4 border-2 border-dashed dark:text-white dark:bg-gray-700/50 border-gray-300 rounded-lg bg-gray-50 max-h-60 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {availableCategories
                .filter(cat => !categorySearch || (cat.name || cat.newCategory).toLowerCase().includes(categorySearch.toLowerCase()))
                .map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddToColumn(category, 0)}
                      className="flex gap-2 items-center text-black dark:bg-[#28283a]/[var(--widget-opacity)] px-3 py-2 rounded-lg dark:text-white bg-white hover:scale-105 transition-transform border border-gray-200 dark:border-gray-700 shadow-sm text-sm"
                      title={`Add ${category.name || category.newCategory} to first column`}
                    >
                      <PlusOutlined /> {truncateText(category.name || category.newCategory)}
                    </button>
                  </div>
                ))}
              {availableCategories.filter(cat => !categorySearch || (cat.name || cat.newCategory).toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                <div className="w-full text-center py-4 text-gray-500">
                  {categorySearch ? "No categories match your search" : "No available categories"}
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
                  {truncateText(cat.name || cat.newCategory)}
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
        title={`Edit Bookmarks - ${truncateText(selectedCategory?.name)}`}
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
          {editModeBookmarks.map((bookmark) => (
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



      {/* Floating Review Button */}
      <button
        onClick={() => setIsReviewModalOpen(true)}
        style={{
          position: "fixed",
          bottom: 90,
          right: 20,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "#f59e42",
          color: "#fff",
          border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          zIndex: 1100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          cursor: "pointer",
        }}
        title="Leave a Review"
      >
        <SmileOutlined />
      </button>
      <Modal
        title={<div className="text-lg font-semibold">Leave a Review</div>}
        open={isReviewModalOpen}
        onCancel={() => setIsReviewModalOpen(false)}
        onOk={handleReviewSubmit}
        okText={reviewSubmitting ? "Submitting..." : "Submit"}
        okButtonProps={{ loading: reviewSubmitting, disabled: reviewSubmitting }}
        cancelButtonProps={{ disabled: reviewSubmitting }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <Input
              name="name"
              value={reviewForm.name}
              onChange={handleReviewInputChange}
              placeholder="Enter your name"
              disabled={reviewSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gmail</label>
            <Input
              name="gmail"
              value={reviewForm.gmail}
              onChange={handleReviewInputChange}
              placeholder="Enter your Gmail address"
              type="email"
              disabled={reviewSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <Input.TextArea
              name="description"
              value={reviewForm.description}
              onChange={handleReviewInputChange}
              placeholder="Write your review..."
              rows={4}
              disabled={reviewSubmitting}
            />
          </div>
        </div>
      </Modal>

      {/* Expand Bookmarks Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">
              All Bookmarks - {expandedCategory ? categories.find(cat => cat.id === expandedCategory)?.name || categories.find(cat => cat.id === expandedCategory)?.newCategory : ''}
            </span>
            <span className="text-sm text-gray-500">({expandedCategoryBookmarks.length} bookmarks)</span>
          </div>
        }
        open={expandModalVisible}
        onCancel={() => setExpandModalVisible(false)}
        footer={null}
        width={800}
        className="expand-bookmarks-modal"
      >
        <div className="max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {expandedCategoryBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <div className="relative w-full flex justify-center mb-2">
                  <a href={bookmark.url || bookmark.link} className="block" target="_blank" rel="noopener noreferrer">
                    <img
                      src={getFaviconUrl(bookmark.url || bookmark.link)}
                      alt={bookmark.title || bookmark.name}
                      className="w-8 h-8 object-contain transition-transform duration-300 hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://www.google.com/favicon.ico";
                      }}
                    />
                  </a>
                </div>
                <a
                  href={bookmark.url || bookmark.link}
                  className="w-full text-center text-sm text-gray-700 dark:text-gray-300 hover:text-blue-500 truncate"
                  target="_blank"
                  rel="noopener noreferrer"
                  title={bookmark.title || bookmark.name}
                >
                  {bookmark.title || bookmark.name}
                </a>
              </div>
            ))}
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