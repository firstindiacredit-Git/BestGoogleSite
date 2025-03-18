import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
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
  Spin,
  Button as AntButton,
  Modal,
  Input,
  Space,
  Radio,
  Slider,
  message,
  Tooltip,
  Form,
  Dropdown,
  Menu,
  Checkbox,
  Card,
  List,
  Avatar,
  Empty,
  Row,
  Col,
  Button,
} from "antd";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  UnorderedListOutlined,
  AppstoreOutlined,
  PictureOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import debounce from "lodash/debounce";
import SkeletonLoader from "./SkeletonLoader";

// Import the ThemeContext and useThemeAware hook
import { useTheme, useThemeAware } from "../context/ThemeContext";

function PopularBookmarks() {
  const [categories, setCategories] = useState([]);
  const [links, setLinks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
  const [grid, setGrid] = useState(() => {
    const savedGridView = localStorage.getItem("bookmarksGridView");
    return savedGridView ? JSON.parse(savedGridView) : false;
  });
  const [hiddenBookmarkIds, setHiddenBookmarkIds] = useState([]);
  const [isControllerOpen, setIsControllerOpen] = useState(false);
  const [previewCategories, setPreviewCategories] = useState([]);
  const [previewColumns, setPreviewColumns] = useState(columnCount);
  const [isApplyingChanges, setIsApplyingChanges] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);

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
  const [dragsPreview, setDragsPreview] = useState({
    isPreviewActive: false,
    sourceItem: null,
    destinationColumn: null,
    previewPosition: null,
    previewOpacity: 0,
    previewScale: 1,
  });

  const dropdownRef = useRef(null); // Create a ref for the dropdown

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsEditModePanelVisible(false); // Close the dropdown if clicked outside
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside); // Add event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Cleanup on unmount
    };
  }, []);

  // Advanced drag start handler with precise tracking and preview
  const handleDragStart = (category, columnIndex, event) => {
    // Capture initial drag position
    const startX = event.clientX || (event.touches && event.touches[0].clientX);
    const startY = event.clientY || (event.touches && event.touches[0].clientY);

    // Update drag state
    setDragState({
      isDragging: true,
      draggedItem: category,
      sourceColumn: columnIndex,
      destinationColumn: null,
      dragPosition: { x: startX, y: startY },
      dragProgress: 0,
    });

    // Initialize preview state
    setDragsPreview({
      isPreviewActive: true,
      sourceItem: category,
      destinationColumn: null,
      previewPosition: { x: startX, y: startY },
      previewOpacity: 0.5,
      previewScale: 1.05,
    });

    // Enhanced feedback
    try {
      // Haptic feedback
      if ("vibrate" in navigator) {
        navigator.vibrate([25, 50, 25]);
      }

      // Spatial audio feedback
      const startDragAudio = new Audio("path/to/drag-start-spatial.mp3");
      startDragAudio.playbackRate = 1.2;
      startDragAudio.volume = 0.3;
      startDragAudio.play().catch(() => {});
    } catch (error) {
      console.warn("Drag start feedback failed", error);
    }
  };

  // Advanced drag update with progress tracking
  const handleDragUpdate = (result, provided) => {
    if (result.destination) {
      // Calculate drag progress based on movement
      const progress = Math.min(
        1,
        Math.abs(
          (result.destination.index - result.source.index) /
            Math.max(1, result.destination.droppableId.length)
        )
      );

      setDragState((prev) => ({
        ...prev,
        destinationColumn: parseInt(result.destination.droppableId),
        dragProgress: progress,
        dragPosition: {
          x: provided.clientX || prev.dragPosition.x,
          y: provided.clientY || prev.dragPosition.y,
        },
      }));

      // Update preview state
      setDragsPreview((prev) => ({
        ...prev,
        destinationColumn: parseInt(result.destination.droppableId),
        previewPosition: {
          x: provided.clientX || prev.previewPosition.x,
          y: provided.clientY || prev.previewPosition.y,
        },
        previewOpacity: 0.8,
        previewScale: 1.1,
      }));
      s;
      // Visual and audio feedback based on drag progress
      try {
        if (progress > 0.5) {
          const progressAudio = new Audio("path/to/drag-progress.mp3");
          progressAudio.volume = progress * 0.3;
          progressAudio.playbackRate = 1 + progress * 0.5;
          progressAudio.play().catch(() => {});
        }
      } catch (error) {
        console.warn("Drag update feedback failed", error);
      }
    }
  };

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
      // Fetch admin categories
      const adminCategorySnapshot = await getDocs(collection(db, "category"));
      const adminCategories = adminCategorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isAdminCategory: true,
      }));

      // Fetch user categories
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
      message.error("Failed to fetch categories");
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
            message.error("Failed to process category updates");
          }
        },
        error: (error) => {
          console.error("Error in category snapshot:", error);
          message.error("Failed to listen for category updates");
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
          message.error("Failed to process layout updates");
        }
      },
      error: (error) => {
        console.error("Error in positions snapshot:", error);
        message.error("Failed to listen for layout updates");
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
        message.error("Failed to load initial data");
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
        // Fetch hidden bookmarks
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const hiddenIds = userDocSnap.exists()
          ? userDocSnap.data().hiddenBookmarkIds || []
          : [];

        setHiddenBookmarkIds(hiddenIds);

        // Fetch all user bookmarks
        const userBookmarksSnapshot = await getDocs(
          collection(db, "users", user.uid, "CatBookmarks")
        );
        const userBookmarks = userBookmarksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isHidden: hiddenIds.includes(doc.id),
          isAdminBookmark: false,
        }));

        // Fetch admin bookmarks for each admin category
        const adminBookmarksPromises = categories.map(async (category) => {
          const bookmarksSnapshot = await getDocs(
            query(collection(db, "links"), where("category", "==", category.id))
          );
          return bookmarksSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            title: doc.data().name,
            url: doc.data().link,
            categoryId: doc.data().category,
            isHidden: hiddenIds.includes(doc.id),
            isAdminBookmark: true,
            createdBy: doc.data().createdBy,
            updatedAt: doc.data().updatedAt,
            order: doc.data().order || 0,
          }));
        });

        const adminBookmarks = (
          await Promise.all(adminBookmarksPromises)
        ).flat();

        // Combine all bookmarks
        const allBookmarks = [...userBookmarks, ...adminBookmarks];
        setLinks(allBookmarks);
        setLoading(false);

        // Load saved positions for admin bookmarks
        const loadSavedPositions = async () => {
          try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists() && userDocSnap.data().bookmarkPositions) {
              const savedPositions = userDocSnap.data().bookmarkPositions;

              // Apply saved positions to links
              setLinks((prevLinks) => {
                const updatedLinks = [...prevLinks];
                Object.entries(savedPositions).forEach(
                  ([categoryId, categoryPositions]) => {
                    // Ensure categoryPositions is an array before using forEach
                    if (
                      categoryPositions &&
                      typeof categoryPositions === "object"
                    ) {
                      // If it's an object, convert it to array format
                      const positionsArray = Object.entries(
                        categoryPositions
                      ).map(([bookmarkId, data]) => ({
                        id: bookmarkId,
                        ...data,
                      }));
                      positionsArray.forEach((pos) => {
                        const linkIndex = updatedLinks.findIndex(
                          (link) =>
                            link.id === pos.id &&
                            link.categoryId === categoryId &&
                            link.isAdminBookmark === pos.isAdminBookmark
                        );
                        if (linkIndex !== -1) {
                          updatedLinks[linkIndex] = {
                            ...updatedLinks[linkIndex],
                            order: pos.order,
                          };
                        }
                      });
                    }
                  }
                );
                return updatedLinks.sort(
                  (a, b) => (a.order || 0) - (b.order || 0)
                );
              });
            }
          } catch (error) {
            console.error("Error loading saved positions:", error);
          }
        };

        // Call loadSavedPositions after fetching links
        await loadSavedPositions();
      } catch (error) {
        console.error("Error fetching data:", error);
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
      // message.success("Category position updated");
    } catch (error) {
      console.error("Error updating category positions:", error);
      message.error("Failed to update category position");
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
      message.error("Category name cannot be empty");
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

      message.success("Category added successfully");
      setNewCategoryName("");
      setIsAddCategoryModalVisible(false);
    } catch (error) {
      console.error("Error adding category:", error);
      message.error("Failed to add category");
    }
  };

  const handleRenameCategory = async () => {
    if (!newCategoryName.trim() || !selectedCategory) {
      message.error("Category name cannot be empty");
      return;
    }

    try {
      const categoryRef = doc(
        db,
        "users",
        user.uid,
        "UserCategory",
        selectedCategory.id
      );
      await updateDoc(categoryRef, {
        newCategory: newCategoryName.trim(),
      });

      // Update local state while preserving open state
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === selectedCategory.id
            ? { ...cat, newCategory: newCategoryName.trim() }
            : cat
        )
      );

      message.success("Category renamed successfully");
      setNewCategoryName("");
      setIsRenameCategoryModalVisible(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error renaming category:", error);
      message.error("Failed to rename category");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      // Delete the category
      await deleteDoc(doc(db, "users", user.uid, "UserCategory", categoryId));

      // Delete all bookmarks in this category
      const categoryLinks = links.filter(
        (link) => link.categoryId === categoryId
      );
      for (const link of categoryLinks) {
        await deleteDoc(doc(db, "links", link.id));
      }

      // Update local state
      setCategories((prevCategories) =>
        prevCategories.filter((cat) => cat.id !== categoryId)
      );
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

      message.success("Category and its bookmarks deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      message.error("Failed to delete category");
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

  const handleUrlChange = async (e) => {
    const url = e.target.value;
    setNewBookmark((prev) => ({ ...prev, url }));

    if (url) {
      const favicon = await fetchFavicon(url);
      setNewBookmark((prev) => ({ ...prev, favicon }));
    }
  };

  const handleAddBookmark = async () => {
    if (!selectedCategory) {
      message.error("Please select a category first");
      return;
    }

    if (!newBookmark.title.trim() || !newBookmark.url.trim()) {
      message.error("Title and URL are required");
      return;
    }

    try {
      const category = categories.find((cat) => cat.id === selectedCategory.id);
      if (!category) {
        message.error("Selected category not found");
        return;
      }

      const docRef = await addDoc(
        collection(db, "users", user.uid, "CatBookmarks"),
        {
          title: newBookmark.title.trim(),
          url: newBookmark.url.trim(),
          favicon: newBookmark.favicon,
          categoryId: selectedCategory.id,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          order: links.filter((link) => link.categoryId === selectedCategory.id)
            .length,
          isAdminCategory: category.isAdminCategory || false,
        }
      );

      // Add to local state while preserving open states
      setLinks((prevLinks) => [
        ...prevLinks,
        {
          id: docRef.id,
          title: newBookmark.title.trim(),
          url: newBookmark.url.trim(),
          favicon: newBookmark.favicon,
          categoryId: selectedCategory.id,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          order: links.filter((link) => link.categoryId === selectedCategory.id)
            .length,
          isAdminCategory: category.isAdminCategory || false,
          isAdminBookmark: false,
        },
      ]);

      setNewBookmark({ title: "", url: "", favicon: "" });
      setIsAddBookmarkModalVisible(false);
      message.success("Bookmark added successfully");
    } catch (error) {
      console.error("Error adding bookmark:", error);
      message.error("Failed to add bookmark");
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    try {
      const items = Array.from(editModeBookmarks);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      // Update local state first for immediate feedback
      const updatedItems = items.map((item, index) => ({
        ...item,
        order: index,
      }));

      setEditModeBookmarks(updatedItems);
      setHasUnsavedChanges(true);

      // Update Firestore in the background
      if (user) {
        const batch = writeBatch(db);

        updatedItems.forEach((item, index) => {
          if (item.isAdminBookmark) {
            const bookmarkRef = doc(db, "bookmarks", item.id);
            batch.update(bookmarkRef, { order: index });
          }
        });

        await batch.commit();
      }
    } catch (error) {
      console.error("Error handling drag end:", error);
      message.error("Failed to update bookmark order");
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
      key: "viewOptions",
      icon: (
        <div className="dark:text-black bg-gray-200 dark:bg-gray-400 px-2 py-1 rounded-md">
          <UnorderedListOutlined />
        </div>
      ),
      label: "View Options",
      children: [
        {
          key: "list",
          icon: (
            <div className="dark:text-black bg-gray-200 dark:bg-gray-400 px-2 py-1 rounded-md">
              <UnorderedListOutlined />
            </div>
          ),
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
            message.success("View mode to List");
          },
        },
        {
          key: "grid",
          icon: (
            <div className="dark:text-black bg-gray-200 dark:bg-gray-400 px-2 py-1 rounded-md">
              <AppstoreOutlined />
            </div>
          ),
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
            message.success("View mode to Grid");
          },
        },
        {
          key: "icon",
          icon: (
            <div className="dark:text-black bg-gray-200 dark:bg-gray-400 px-2 py-1 rounded-md">
              <PictureOutlined />
            </div>
          ),
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
            message.success("View mode to Icon");
          },
        },
      ],
    },
    {
      key: "size",
      icon: (
        <div className="dark:text-black bg-gray-200 dark:bg-gray-400 px-2 py-1 rounded-md">
          <PictureOutlined />
        </div>
      ),
      label: "Icon Size",
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
      key: "rename",
      icon: (
        <div className="dark:text-black bg-gray-200 dark:bg-gray-400 px-2 py-1 rounded-md">
          <EditOutlined />
        </div>
      ),
      label: "Rename Category",
      onClick: () => {
        setSelectedCategory(category);
        setNewCategoryName(category.name || category.newCategory);
        setIsRenameCategoryModalVisible(true);
      },
    },
    {
      key: "editMode",
      icon: (
        <div className=" bg-gray-200 dark:bg-gray-400 px-2 py-1 rounded-md">
          <EditOutlined />
        </div>
      ),
      label: "Edit Mode",
      onClick: () => {
        setSelectedCategory(category);
        setEditModeBookmarks(
          links
            .filter((link) => link.categoryId === category.id)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((link) => ({ ...link, isEditing: false }))
        );
        setIsEditModePanelVisible(true);
      },
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
          title: "Delete Category",
          content:
            "Are you sure you want to delete this category and all its bookmarks?",
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

      if (editingBookmark.isAdminBookmark) {
        // Update admin bookmark in links collection
        const docRef = doc(db, "links", editingBookmark.id);
        await updateDoc(docRef, {
          name: values.title, // Changed from title to name
          link: values.url, // Changed from url to link
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Update user bookmark in CatBookmarks collection
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
      }

      // Update local state
      setLinks((prevLinks) => {
        return prevLinks.map((link) => {
          if (link.id === editingBookmark.id) {
            return {
              ...link,
              title: values.title,
              url: values.url,
              name: values.title, // Update both title and name
              link: values.url, // Update both url and link
              updatedAt: new Date().toISOString(),
            };
          }
          return link;
        });
      });

      setEditingBookmark(null);
      setIsEditBookmarkModalVisible(false);
      editBookmarkForm.resetFields();
      message.success("Bookmark updated successfully");
    } catch (error) {
      console.error("Error updating bookmark:", error);
      message.error("Failed to update bookmark");
    }
  };

  const renderBookmarkList = (categoryLinks, categoryId) => {
    const sizes = categoryBookmarkSizes[categoryId] || { list: 32 };
    return (
      <List
        className="bg-white/[(var(--widget-opacity))]"
        itemLayout="horizontal"
        dataSource={categoryLinks}
        renderItem={(link) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar
                  src={getFaviconUrl(link.url || link.link)}
                  size={sizes.list}
                  style={{ padding: "2px" }}
                />
              }
              title={
                <a
                  href={link.url || link.link}
                  className="text-black dark:text-white"
                >
                  {link.title || link.name}
                </a>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  const renderBookmarkGrid = (categoryLinks, categoryId) => {
    const sizes = categoryBookmarkSizes[categoryId] || { grid: 32 };
    return (
      <div className="w-full">
        <div className="grid grid-cols-2  sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
              <Tooltip title={link.title || link.name}>
                <a
                  href={link.url || link.link}
                  className="w-full text-center text-black dark:text-white hover:text-blue-500"
                >
                  <span className="text-sm truncate block">
                    {link.title || link.name}
                  </span>
                </a>
              </Tooltip>
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

  const renderBookmarksByCategory = () => {
    return (
      <div className="mb-2">
        <div className="flex justify-between mb-2">
          <button
            className="rounded-lg flex gap-4 items-center text-black bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)]  px-3 py-2 dark:text-white mb-2"
            onClick={() => setIsAddCategoryModalVisible(true)}
          >
            <PlusOutlined />
            Add Category
          </button>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center bg-white/[(var(--widget-opacity))] backdrop-blur-lg dark:bg-[#28283A]/[(var(--widget-opacity))] p-1 rounded-sm`}
            >
              <button
                onClick={() => handleGridViewChange(true)}
                className={`p-2 rounded ${
                  grid
                    ? "bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)] shadow-sm"
                    : "hover:bg-white/[var(--widget-opacity)] dark:hover:bg-gray-700/[var(--widget-opacity)]"
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
                onClick={() => handleGridViewChange(false)}
                className={`p-2 rounded ${
                  !grid
                    ? "bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)] shadow-sm"
                    : "hover:bg-white dark:hover:bg-gray-700/50"
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
                        {categoryColumns[`column${colNum}`]?.map(
                          (categoryId, index) => {
                            const category = categories.find(
                              (c) => c.id === categoryId
                            );
                            if (!category) return null;

                            const categoryLinks = links
                              .filter(
                                (link) =>
                                  link.categoryId === category.id &&
                                  !link.isHidden
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
                                          onClick={(e) => {
                                            if (
                                              !grid &&
                                              (e.target === e.currentTarget ||
                                                e.target.closest(
                                                  ".category-header-content"
                                                ))
                                            ) {
                                              toggleDropdown(category.id);
                                            }
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
                                          display:
                                            grid || openCategories[category.id]
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
        console.error("Error setting up listeners:", error);
        if (isComponentMounted) {
          message.error("Failed to load data. Please refresh the page.");
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
  const handleGridViewChange = (isGrid) => {
    setGrid(isGrid);
    localStorage.setItem("bookmarksGridView", JSON.stringify(isGrid));
  };

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

      message.success("Changes applied successfully");
      setIsControllerOpen(false);
    } catch (error) {
      console.error("Error applying changes:", error);
      message.error("Failed to apply changes");
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
      message.error("Failed to fetch latest category positions");
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
    const unsubscribe = onSnapshot(
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
        console.error("Error in real-time sync:", error);
        message.error("Failed to sync with latest changes");
      }
    );

    return unsubscribe;
  };

  // Effect to setup and cleanup database listeners
  useEffect(() => {
    let unsubscribe = null;

    if (user) {
      unsubscribe = setupDatabaseListeners();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
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

  // Function to handle saving changes to bookmarks
  const handleSaveChanges = async () => {
    try {
      // Validate bookmark changes
      if (editModeBookmarks.length === 0) {
        message.warning("No bookmarks to save", 2);
        return;
      }

      // Check for unsaved changes
      if (!hasUnsavedChanges) {
        message.info("No changes to save", 2);
        return;
      }

      // Start loading state
      setIsApplyingChanges(true);

      // Create a batch write for efficient updates
      const batch = writeBatch(db);
      const userDocRef = doc(db, "users", user.uid);

      // Get current positions from Firestore
      const userDoc = await getDoc(userDocRef);
      const existingPositions = userDoc.exists()
        ? userDoc.data().bookmarkPositions || {}
        : {};

      // Track save progress
      const totalBookmarks = editModeBookmarks.length;
      let savedCount = 0;

      // Prepare batch updates
      const savePromises = editModeBookmarks.map(async (bookmark, index) => {
        if (bookmark.isAdminBookmark) {
          // Update admin bookmark positions
          const bookmarkRef = doc(db, "bookmarks", bookmark.id);
          batch.update(bookmarkRef, {
            order: index,
            updatedAt: new Date().toISOString(),
          });
        } else {
          // Update user's personal bookmarks
          const bookmarkRef = doc(
            db,
            "users",
            user.uid,
            "CatBookmarks",
            bookmark.id
          );
          batch.update(bookmarkRef, {
            order: index,
            title: bookmark.title,
            url: bookmark.url,
            updatedAt: new Date().toISOString(),
          });
        }

        savedCount++;

        // Progress notification
        if (savedCount % 5 === 0 || savedCount === totalBookmarks) {
          message.info(`Saving bookmarks: ${savedCount}/${totalBookmarks}`);
        }
      });

      // Wait for all save operations to be prepared
      await Promise.all(savePromises);

      // Commit batch updates
      await batch.commit();

      // Update local state
      setLinks((prevLinks) => {
        const updatedLinks = [...prevLinks];
        editModeBookmarks.forEach((editedBookmark, index) => {
          const linkIndex = updatedLinks.findIndex(
            (link) => link.id === editedBookmark.id
          );
          if (linkIndex !== -1) {
            updatedLinks[linkIndex] = {
              ...updatedLinks[linkIndex],
              order: index,
              title: editedBookmark.title,
              url: editedBookmark.url,
            };
          }
        });
        return updatedLinks;
      });

      // Haptic and audio feedback
      try {
        if ("vibrate" in navigator) {
          navigator.vibrate([50, 100, 50]);
        }

        const saveAudio = new Audio("path/to/save-success.mp3");
        saveAudio.volume = 0.4;
        saveAudio.play().catch(() => {});
      } catch (error) {
        console.warn("Save feedback failed", error);
      }

      // Reset state
      setHasUnsavedChanges(false);
      message.success(`${totalBookmarks} bookmark(s) saved successfully`, 3);
      setIsEditModePanelVisible(false);
    } catch (error) {
      console.error("Error saving changes:", error);

      // Detailed error handling
      if (error.code === "permission-denied") {
        message.error("You don't have permission to save these bookmarks", 4);
      } else if (error.code === "unavailable") {
        message.error(
          "Network is unavailable. Please check your connection.",
          4
        );
      } else {
        message.error("Failed to save bookmark changes. Please try again.", 4);
      }
    } finally {
      // Ensure loading state is reset
      setIsApplyingChanges(false);
    }
  };

  // Function to handle deletion of selected bookmarks
  const handleDeleteSelected = () => {
    if (selectedBookmarks.length === 0) {
      message.warning("No bookmarks selected for deletion");
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
          const batch = writeBatch(db);

          // Delete each selected bookmark
          for (const bookmarkId of selectedBookmarks) {
            const bookmarkRef = doc(
              db,
              "users",
              user.uid,
              "CatBookmarks",
              bookmarkId
            );
            batch.delete(bookmarkRef);
          }

          await batch.commit();

          // Update local state
          setEditModeBookmarks((prevBookmarks) =>
            prevBookmarks.filter(
              (bookmark) => !selectedBookmarks.includes(bookmark.id)
            )
          );
          setSelectedBookmarks([]);
          setHasUnsavedChanges(true);

          message.success(
            `Successfully deleted ${selectedBookmarks.length} bookmark(s)`
          );
        } catch (error) {
          console.error("Error deleting bookmarks:", error);
          message.error("Failed to delete bookmarks. Please try again.");
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
              <button
                onClick={() => handleGridViewChange(true)}
                className={`p-2 rounded ${
                  grid
                    ? "bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)] shadow-sm"
                    : "hover:bg-white/[var(--widget-opacity)] dark:hover:bg-gray-700/[var(--widget-opacity)]"
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
                onClick={() => handleGridViewChange(false)}
                className={`p-2 rounded ${
                  !grid
                    ? "bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)] shadow-sm"
                    : "hover:bg-white dark:hover:bg-gray-700/50"
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
          backgroundColor: isDarkMode ? "#513A7A" : "#6366F1",
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
        title="Category Controller"
        open={isControllerOpen}
        onCancel={() => setIsControllerOpen(false)}
        width={800}
        footer={[
          <div key="footer" className="flex justify-between items-center">
            <div>
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
            </div>
          </div>,
        ]}
      >
        <div className="flex w-full mb-4  justify-between items-center gap-2">
          <div className="dark:text-white">Columns:</div>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-md dark:text-white dark:bg-gray-700 border-none outline-none ${
                previewColumns === 1 ? "bg-blue-500 text-white" : ""
              }`}
              onClick={() => handlePreviewColumnChange(1)}
            >
              1
            </button>
            <button
              className={`px-4 py-2 rounded-md dark:text-white dark:bg-gray-700 border-none outline-none ${
                previewColumns === 2 ? "bg-blue-500 text-white" : ""
              }`}
              onClick={() => handlePreviewColumnChange(2)}
            >
              2
            </button>
            <button
              className={`px-4 py-2 rounded-md dark:text-white dark:bg-gray-700 border-none outline-none ${
                previewColumns === 3 ? "bg-blue-500 text-white" : ""
              }`}
              onClick={() => handlePreviewColumnChange(3)}
            >
              3
            </button>
            <button
              className={`px-4 py-2 rounded-md dark:text-white dark:bg-gray-700 border-none outline-none ${
                previewColumns === 4 ? "bg-blue-500 text-white" : ""
              }`}
              onClick={() => handlePreviewColumnChange(4)}
            >
              4
            </button>
          </div>
        </div>
        <DragDropContext onDragEnd={handlePreviewDragEnd}>
          <div
            className="sort-columns-container "
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
                    className={`
                        p-4 rounded-lg min-h-[200px] transition-all duration-300
                        ${
                          snapshot.isDraggingOver
                            ? "bg-indigo-50 dark:bg-gray-900/50 border-2 border-dashed border-indigo-400 shadow-lg"
                            : " border dark:text-white border-none dark:bg-gray-700/50 "
                        }
                      `}
                  >
                    <div
                      className={`
                        text-center mb-4 font-semibold transition-colors duration-300
                        ${
                          snapshot.isDraggingOver
                            ? "text-indigo-600"
                            : "text-gray-700"
                        }
                      `}
                    >
                      <div className="dark:text-white">
                        Column {columnIndex + 1}
                      </div>
                    </div>
                    <div className="space-y-2 border-none dark:text-white min-h-[100px]">
                      {getColumnCategories(columnIndex).map(
                        (category, index) => (
                          <Draggable
                            key={category.id}
                            draggableId={category.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`
                                  flex items-center border-none dark:text-white justify-between p-3 rounded-lg
                                  transition-all duration-200 dark:bg-gray-600/50
                                  ${
                                    snapshot.isDragging
                                      ? "shadow-lg border-2 border-indigo-400 scale-105"
                                      : "shadow-sm border border-none border-gray-200 hover:border-indigo-300"
                                  }
                                `}
                                style={provided.draggableProps.style}
                              >
                                <div className="flex items-center border-none  gap-3">
                                  <div
                                    className={`
                                    text-base transition-colors duration-200
                                    ${
                                      snapshot.isDragging
                                        ? "text-indigo-500"
                                        : "text-gray-400"
                                    }
                                  `}
                                  >
                                    ⋮⋮
                                  </div>
                                  <span
                                    className={`
                                    font-medium transition-colors border-none duration-200
                                    ${
                                      snapshot.isDragging
                                        ? "text-indigo-600"
                                        : "text-gray-700 border-none dark:text-white"
                                    }
                                  `}
                                  >
                                    {category.name || category.newCategory}
                                  </span>
                                </div>
                                <AntButton
                                  type="text"
                                  icon={<DeleteOutlined />}
                                  onClick={() =>
                                    handleRemoveFromColumn(category)
                                  }
                                  className={`
                                    transition-colors duration-200
                                    ${
                                      snapshot.isDragging
                                        ? "text-indigo-500"
                                        : "text-gray-400 hover:text-red-500"
                                    }
                                  `}
                                />
                              </div>
                            )}
                          </Draggable>
                        )
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
          <div className="text-sm font-medium dark:text-white text-gray-700 mb-2">
            Available Categories
          </div>
          <div className="p-4 border-2 border-dashed dark:text-white dark:bg-gray-700/50 border-gray-300 rounded-lg bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleAddToColumn(category, 0)}
                  className="flex gap-2 items-center text-black dark:bg-[#28283a]/[var(--widget-opacity)] px-4 py-2 rounded-lg dark:text-white bg-white hover:scale-105 transition-transform "
                >
                  <PlusOutlined /> {category.name || category.newCategory}
                </button>
              ))}
              {availableCategories.length === 0 && (
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
        />
      </Modal>

      <Modal
        title="Rename Category"
        open={isRenameCategoryModalVisible}
        onOk={handleRenameCategory}
        onCancel={() => {
          setIsRenameCategoryModalVisible(false);
          setNewCategoryName("");
          setSelectedCategory(null);
        }}
      >
        <Input
          placeholder="Enter new category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
      </Modal>

      <Modal
        title="Add Bookmark"
        open={isAddBookmarkModalVisible}
        onOk={handleAddBookmark}
        onCancel={() => {
          setIsAddBookmarkModalVisible(false);
          setNewBookmark({ title: "", url: "", favicon: "" });
        }}
      >
        <Form layout="vertical">
          <Form.Item
            label={<span className="dark:text-white">Title</span>}
            required
          >
            <Input
              placeholder="Enter bookmark title"
              value={newBookmark.title}
              onChange={(e) =>
                setNewBookmark((prev) => ({ ...prev, title: e.target.value }))
              }
              className="text-black bg-white dark:text-white"
            />
          </Form.Item>
          <Form.Item
            label={<span className="dark:text-white">URL</span>}
            required
          >
            <Input
              placeholder="Enter bookmark URL"
              value={newBookmark.url}
              onChange={handleUrlChange}
              className=" "
            />
          </Form.Item>
        </Form>
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
          <AntButton
            key="save"
            type="primary"
            disabled={!hasUnsavedChanges}
            onClick={handleSaveChanges}
          >
            <span className="dark:text-white"> Save Changes</span>
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
    </div>
  );
}

export default PopularBookmarks;
