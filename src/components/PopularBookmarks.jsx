import React, { useState, useEffect } from "react";
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
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  Spin,
  Button,
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
} from "antd";
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

function PopularBookmarks() {
  const [categories, setCategories] = useState([]);
  const [links, setLinks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [faviconSize, setFaviconSize] = useState(32);
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
    return savedGridView ? JSON.parse(savedGridView) : true;
  });
  const [hiddenBookmarkIds, setHiddenBookmarkIds] = useState([]);

  // Track auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  // Fetch categories, links and hidden bookmarks
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

        // Combine and sort all categories
        const allCategories = [...adminCategories, ...userCategories];
        allCategories.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategories(allCategories);

        // Load saved states from localStorage or set defaults
        const savedStates = localStorage.getItem("categoryOpenStates");
        const initialOpenStates = savedStates
          ? JSON.parse(savedStates)
          : allCategories.reduce((acc, category) => {
              acc[category.id] = true; // Default to open if no saved state
              return acc;
            }, {});

        setOpenCategories(initialOpenStates);
        localStorage.setItem(
          "categoryOpenStates",
          JSON.stringify(initialOpenStates)
        );

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
        const adminBookmarksPromises = adminCategories.map(async (category) => {
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

        // Save bookmark positions when dragging
        const handleSaveBookmarkPositions = async (
          categoryId,
          updatedBookmarks
        ) => {
          try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            const existingPositions = userDoc.exists()
              ? userDoc.data().bookmarkPositions || {}
              : {};

            // Update positions for the specific category
            existingPositions[categoryId] = updatedBookmarks.map(
              (bookmark, index) => ({
                id: bookmark.id,
                order: index,
                isAdminBookmark: bookmark.isAdminBookmark,
              })
            );

            await updateDoc(userDocRef, {
              bookmarkPositions: existingPositions,
            });

            // Update local state to reflect new positions
            setLinks((prevLinks) => {
              const updatedLinks = [...prevLinks];
              updatedBookmarks.forEach((bookmark, index) => {
                const linkIndex = updatedLinks.findIndex(
                  (link) => link.id === bookmark.id
                );
                if (linkIndex !== -1) {
                  updatedLinks[linkIndex] = {
                    ...updatedLinks[linkIndex],
                    order: index,
                  };
                }
              });
              return updatedLinks;
            });
          } catch (error) {
            console.error("Error saving bookmark positions:", error);
            message.error("Failed to save bookmark positions");
          }
        };

        // Update the handleDragEnd function to save positions
        const handleDragEnd = async (result) => {
          if (!result.destination) return;

          const items = Array.from(editModeBookmarks);
          const [reorderedItem] = items.splice(result.source.index, 1);
          items.splice(result.destination.index, 0, reorderedItem);

          // Update orders for all items
          const updatedItems = items.map((item, index) => ({
            ...item,
            order: index,
          }));

          setEditModeBookmarks(updatedItems);
          setHasUnsavedChanges(true);

          // Save positions for admin bookmarks
          if (
            selectedCategory &&
            updatedItems.some((item) => item.isAdminBookmark)
          ) {
            await handleSaveBookmarkPositions(
              selectedCategory.id,
              updatedItems
            );
          }
        };

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
  }, [user]);

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

  // Update the redistributeCategories function
  const redistributeCategories = async (count) => {
    const allCategories = categories;
    const newColumns = {};

    for (let i = 1; i <= count; i++) {
      newColumns[`column${i}`] = [];
    }

    // Use saved positions if available, otherwise distribute evenly
    allCategories.forEach((category, index) => {
      const savedPosition = categoryPositions[category.id];
      if (savedPosition && savedPosition.columnIndex <= count) {
        const columnKey = `column${savedPosition.columnIndex}`;
        newColumns[columnKey] = newColumns[columnKey] || [];
        newColumns[columnKey].push(category.id);
      } else {
        const columnIndex = (index % count) + 1;
        newColumns[`column${columnIndex}`].push(category.id);
      }
    });

    setCategoryColumns(newColumns);

    // Save the new layout to database
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        categoryPositions: {
          columns: newColumns,
          columnCount: count,
          lastUpdated: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error saving category positions:", error);
      message.error("Failed to save layout");
    }
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
      message.success("Category position updated");
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

  const toggleBookmarkVisibility = async (bookmarkId) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      let updatedHiddenIds = [...hiddenIds];

      if (hiddenIds.includes(bookmarkId)) {
        updatedHiddenIds = updatedHiddenIds.filter((id) => id !== bookmarkId);
      } else {
        updatedHiddenIds.push(bookmarkId);
      }

      await setDoc(
        userDocRef,
        { hiddenBookmarkIds: updatedHiddenIds },
        { merge: true }
      );
      // setHiddenBookmarkIds(updatedHiddenIds);

      setLinks((prevLinks) =>
        prevLinks.map((link) =>
          link.id === bookmarkId ? { ...link, isHidden: !link.isHidden } : link
        )
      );
    } catch (error) {
      console.error("Error toggling bookmark visibility:", error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      message.error("Category name cannot be empty");
      return;
    }

    try {
      // Add the category to Firestore
      const docRef = await addDoc(
        collection(db, "users", user.uid, "UserCategory"),
        {
          newCategory: newCategoryName.trim(),
          userId: user.uid,
          order: categories.length,
          createdAt: new Date().toISOString(),
        }
      );

      // Create the new category object with the correct structure
      const newCategory = {
        id: docRef.id,
        userId: user.uid,
        newCategory: newCategoryName.trim(),
        name: newCategoryName.trim(), // Add name field to match the structure
        order: categories.length,
        isAdminCategory: false,
        createdAt: new Date().toISOString(),
      };

      // Add the new category to the local state
      setCategories((prevCategories) => [...prevCategories, newCategory]);

      // Add the new category to a column (default to the first column with least items)
      const columnWithLeastItems = Object.entries(categoryColumns).reduce(
        (acc, [key, value]) => {
          return value.length < acc.length
            ? { key, length: value.length }
            : acc;
        },
        { key: "column1", length: Infinity }
      );

      setCategoryColumns((prev) => ({
        ...prev,
        [columnWithLeastItems.key]: [
          ...prev[columnWithLeastItems.key],
          docRef.id,
        ],
      }));

      // Save the updated column layout to the database
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        categoryPositions: {
          columns: {
            ...categoryColumns,
            [columnWithLeastItems.key]: [
              ...categoryColumns[columnWithLeastItems.key],
              docRef.id,
            ],
          },
          columnCount,
          lastUpdated: new Date().toISOString(),
        },
      });

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

  const handleDeleteBookmark = async (bookmarkId) => {
    const bookmark = links.find((link) => link.id === bookmarkId);

    if (bookmark.isAdminBookmark) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const currentHiddenIds = userDoc.exists()
          ? userDoc.data().hiddenBookmarkIds || []
          : [];

        // Add the bookmark ID if it's not already hidden
        if (!currentHiddenIds.includes(bookmarkId)) {
          const newHiddenIds = [...currentHiddenIds, bookmarkId];
          await updateDoc(userDocRef, { hiddenBookmarkIds: newHiddenIds });
          setHiddenBookmarkIds(newHiddenIds);

          // Update local state to reflect hidden status
          setLinks((prevLinks) =>
            prevLinks.map((link) =>
              link.id === bookmarkId ? { ...link, isHidden: true } : link
            )
          );

          message.success("Bookmark hidden successfully");
        }
      } catch (error) {
        console.error("Error hiding bookmark:", error);
        message.error("Failed to hide bookmark");
      }
    } else {
      // For user bookmarks, delete as usual
      try {
        await deleteDoc(doc(db, "users", user.uid, "CatBookmarks", bookmarkId));
        setLinks((prevLinks) =>
          prevLinks.filter((link) => link.id !== bookmarkId)
        );
        message.success("Bookmark deleted successfully");
      } catch (error) {
        console.error("Error deleting bookmark:", error);
        message.error("Failed to delete bookmark");
      }
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

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(editModeBookmarks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update orders for all items
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setEditModeBookmarks(updatedItems);
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      if (editModeBookmarks.length === 0) {
        message.error("No bookmarks to save");
        return;
      }

      const batch = writeBatch(db);
      const userDocRef = doc(db, "users", user.uid);

      // Get current positions
      const userDoc = await getDoc(userDocRef);
      const existingPositions = userDoc.exists()
        ? userDoc.data().bookmarkPositions || {}
        : {};

      // Prepare positions update
      const categoryPositions = {};
      editModeBookmarks.forEach((bookmark, index) => {
        if (bookmark.isAdminBookmark) {
          categoryPositions[bookmark.id] = {
            order: index,
            isAdminBookmark: true,
          };
        }
      });

      // Update positions in batch
      if (Object.keys(categoryPositions).length > 0) {
        batch.update(userDocRef, {
          [`bookmarkPositions.${selectedCategory.id}`]: categoryPositions,
        });
      }

      // Update user bookmarks in batch
      editModeBookmarks.forEach((bookmark, index) => {
        if (!bookmark.isAdminBookmark) {
          const docRef = doc(
            db,
            "users",
            user.uid,
            "CatBookmarks",
            bookmark.id
          );
          batch.update(docRef, {
            order: index,
            title: bookmark.title,
            url: bookmark.url,
            updatedAt: new Date().toISOString(),
          });
        }
      });

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

      setHasUnsavedChanges(false);
      message.success("Changes saved successfully");
      setIsEditModePanelVisible(false);
    } catch (error) {
      console.error("Error saving changes:", error);
      message.error("Failed to save changes");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedBookmarks.length === 0) return;

    try {
      const batch = writeBatch(db);
      selectedBookmarks.forEach((bookmarkId) => {
        const docRef = doc(db, "users", user.uid, "CatBookmarks", bookmarkId);
        batch.delete(docRef);
      });
      await batch.commit();

      setLinks((prevLinks) =>
        prevLinks.filter((link) => !selectedBookmarks.includes(link.id))
      );
      setSelectedBookmarks([]);
      message.success("Selected bookmarks deleted successfully");
    } catch (error) {
      console.error("Error deleting bookmarks:", error);
      message.error("Failed to delete bookmarks");
    }
  };

  const toggleBookmarkSelection = (bookmarkId) => {
    setSelectedBookmarks((prev) =>
      prev.includes(bookmarkId)
        ? prev.filter((id) => id !== bookmarkId)
        : [...prev, bookmarkId]
    );
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
      icon: <UnorderedListOutlined />,
      label: "View Options",
      children: [
        {
          key: "list",
          icon: <UnorderedListOutlined />,
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
          icon: <AppstoreOutlined />,
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
          icon: <PictureOutlined />,
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
      icon: <PictureOutlined />,
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
      icon: <EditOutlined />,
      label: "Rename Category",
      onClick: () => {
        setSelectedCategory(category);
        setNewCategoryName(category.name || category.newCategory);
        setIsRenameCategoryModalVisible(true);
      },
    },
    {
      key: "editMode",
      icon: <EditOutlined />,
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
      icon: <DeleteOutlined />,
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

  const handleColumnCountChange = (count) => {
    setColumnCount(count);
    // Redistribute categories when column count changes
    redistributeCategories(count);
  };

  const renderBookmarkList = (categoryLinks, categoryId) => {
    const sizes = categoryBookmarkSizes[categoryId] || { list: 32 };
    return (
      <List
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
                  target="_blank"
                  rel="noopener noreferrer"
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categoryLinks.map((link) => (
            <div
              key={link.id}
              className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300 group relative"
            >
              <div className="relative w-full flex justify-center mb-2">
                <a
                  href={link.url || link.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
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
                  target="_blank"
                  rel="noopener noreferrer"
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
                <a
                  href={link.url || link.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
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
    // Filter out hidden categories
    const visibleCategories = categories.filter(
      (category) => !hiddenCategories.includes(category.id)
    );

    return (
      <div className="mb-2">
        <div className="flex justify-between mb-2">
          <div style={{ marginBottom: "24px" }}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsAddCategoryModalVisible(true)}
              >
                Add Category
              </Button>
            </Space>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center bg-white/[var(--widget-opacity)] backdrop-blur-sm dark:bg-[#28283A]/[var(--widget-opacity)] p-1 rounded-sm`}
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
                    : "hover:bg-white/50 dark:hover:bg-gray-700/50"
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
            <Radio.Group
              value={columnCount}
              onChange={(e) => handleColumnCountChange(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value={1}>1</Radio.Button>
              <Radio.Button value={2}>2</Radio.Button>
              <Radio.Button value={3}>3</Radio.Button>
              <Radio.Button value={4}>4</Radio.Button>
            </Radio.Group>
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
                        className={`p-2 transition-colors duration-200 ${
                          snapshot.isDraggingOver
                            ? "bg-transparent border-2 border-dashed border-blue-500"
                            : "bg-transparent border-2 border-dashed border-transparent"
                        }`}
                      >
                        {categoryColumns[`column${colNum}`]?.map(
                          (categoryId, index) => {
                            const category = visibleCategories.find(
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
                                      className="max-w-xl backdrop-blur-sm bg-white/[var(--widget-opacity)] dark:bg-gray-800/[var(--widget-opacity)] mx-auto rounded-sm"
                                      title={
                                        <div
                                          className="bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)] dark:text-white relative overflow-hidden p-2 cursor-pointer"
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
                                                    ? "bg-gray-300 rounded"
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
                                                <Button
                                                  type="text"
                                                  icon={
                                                    <PlusOutlined className="text-black" />
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
                                                <Button
                                                  type="text"
                                                  icon={
                                                    <MoreOutlined className="text-black" />
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

  // Update the useEffect that fetches user data to include preferences
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          // Load hidden categories
          setHiddenCategories(data.hiddenCategories || []);
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
        message.error("Failed to load preferences");
      }
    };

    fetchUserPreferences();
  }, [user]);

  // Add this function to toggle category visibility
  const toggleCategoryVisibility = async (categoryId) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const newHiddenCategories = hiddenCategories.includes(categoryId)
        ? hiddenCategories.filter((id) => id !== categoryId)
        : [...hiddenCategories, categoryId];

      await updateDoc(userDocRef, {
        hiddenCategories: newHiddenCategories,
      });

      setHiddenCategories(newHiddenCategories);
      message.success(
        hiddenCategories.includes(categoryId)
          ? "Category is now visible"
          : "Category is now hidden"
      );
    } catch (error) {
      console.error("Error toggling category visibility:", error);
      message.error("Failed to update category visibility");
    }
  };

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

  // Initialize categories with isOpen property
  useEffect(() => {
    const initCategories = categories.map((category) => ({
      ...category,
      isOpen: openCategories[category.id] || false,
    }));
    setCategories(initCategories);
  }, [openCategories]);

  // Add function to handle grid view changes
  const handleGridViewChange = (isGrid) => {
    setGrid(isGrid);
    localStorage.setItem("bookmarksGridView", JSON.stringify(isGrid));
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div style={{ padding: "24px" }}>
      {renderBookmarksByCategory()}

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
          <Form.Item label="Title" required>
            <Input
              placeholder="Enter bookmark title"
              value={newBookmark.title}
              onChange={(e) =>
                setNewBookmark((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </Form.Item>
          <Form.Item label="URL" required>
            <Input
              placeholder="Enter bookmark URL"
              value={newBookmark.url}
              onChange={handleUrlChange}
              addonBefore={
                newBookmark.favicon && (
                  <img
                    src={newBookmark.favicon}
                    alt=""
                    style={{ width: 16, height: 16 }}
                  />
                )
              }
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
              title: "Unsaved Changes",
              content:
                "You have unsaved changes. Are you sure you want to exit?",
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
          <Button key="selectAll" onClick={selectAllBookmarks}>
            {selectedBookmarks.length === editModeBookmarks.length
              ? "Deselect All"
              : "Select All"}
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            disabled={selectedBookmarks.length === 0}
            onClick={handleDeleteSelected}
          >
            Delete Selected ({selectedBookmarks.length})
          </Button>,
          <Button
            key="cancel"
            onClick={() => {
              if (hasUnsavedChanges) {
                Modal.confirm({
                  title: "Unsaved Changes",
                  content:
                    "You have unsaved changes. Are you sure you want to exit?",
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
          </Button>,
          <Button
            key="save"
            type="primary"
            disabled={!hasUnsavedChanges}
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>,
        ]}
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="bookmarks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{ minHeight: "100px" }}
              >
                {editModeBookmarks.map((bookmark, index) => (
                  <Draggable
                    key={bookmark.id}
                    draggableId={bookmark.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          padding: "8px",
                          margin: "8px 0",
                          backgroundColor: selectedBookmarks.includes(
                            bookmark.id
                          )
                            ? "#e6f7ff"
                            : "#fff",
                          border: "1px solid #f0f0f0",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          ...provided.draggableProps.style,
                        }}
                      >
                        <Checkbox
                          checked={selectedBookmarks.includes(bookmark.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBookmarks([
                                ...selectedBookmarks,
                                bookmark.id,
                              ]);
                            } else {
                              setSelectedBookmarks(
                                selectedBookmarks.filter(
                                  (id) => id !== bookmark.id
                                )
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
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEditBookmark(bookmark)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Modal>
    </div>
  );
}

export default PopularBookmarks;
