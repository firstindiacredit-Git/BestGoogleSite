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
  EyeInvisibleOutlined,
  EyeOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  PictureOutlined,
  CloudOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  EllipsisOutlined,
  CheckOutlined,
} from "@ant-design/icons";

function PopularBookmarks() {
  const [categories, setCategories] = useState([]);
  const [links, setLinks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [faviconSize, setFaviconSize] = useState(32);
  const [categoryViewModes, setCategoryViewModes] = useState({});
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

  // Track auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  // Initialize view modes for categories
  useEffect(() => {
    const initViewModes = categories.reduce((acc, category) => {
      acc[category.id] = acc[category.id] || "list";
      return acc;
    }, {});
    setCategoryViewModes(initViewModes);
  }, [categories]);

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
          name: doc.data().newCategory, // Map newCategory to name for consistency
          isAdminCategory: false,
        }));

        // Combine and sort all categories
        const allCategories = [...adminCategories, ...userCategories];
        allCategories.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategories(allCategories);

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
          }));
        });

        const adminBookmarks = (
          await Promise.all(adminBookmarksPromises)
        ).flat();

        // Combine all bookmarks
        const allBookmarks = [...userBookmarks, ...adminBookmarks];
        setLinks(allBookmarks);
        setLoading(false);
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
    const { source, destination, draggableId } = result;

    if (!destination) return;

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
    }
  };

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
      setCategories((prevCategories) => [
        ...prevCategories,
        {
          id: docRef.id,
          userId: user.uid,
          newCategory: newCategoryName.trim(),
          order: categories.length,
        },
      ]);

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

      message.success("Category and its bookmarks deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      message.error("Failed to delete category");
    }
  };

  const handleDeleteBookmark = async (bookmarkId) => {
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
      // Find the category to get its type
      const category = categories.find((cat) => cat.id === selectedCategory.id);
      if (!category) {
        message.error("Selected category not found");
        return;
      }

      // Always store in user's collection, even for admin categories
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
          isAdminCategory: category.isAdminCategory || false, // Use the category's flag
        }
      );

      // Add to local state
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
      const batch = writeBatch(db);
      editModeBookmarks.forEach((item, index) => {
        const docRef = doc(db, "users", user.uid, "CatBookmarks", item.id);
        batch.update(docRef, {
          order: index,
          title: item.title,
          url: item.url,
        });
      });
      await batch.commit();

      // Update the links state to reflect changes in the category view
      setLinks((prevLinks) => {
        const updatedLinks = [...prevLinks];
        editModeBookmarks.forEach((editedBookmark) => {
          const index = updatedLinks.findIndex(
            (link) => link.id === editedBookmark.id
          );
          if (index !== -1) {
            updatedLinks[index] = {
              ...updatedLinks[index],
              title: editedBookmark.title,
              url: editedBookmark.url,
              order: editedBookmark.order,
              userId: user.uid,
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
            setCategoryViewModes((prev) => ({
              ...prev,
              [category.id]: newViewMode,
            }));
            saveUserPreferences(
              category.id,
              newViewMode,
              categoryBookmarkSizes[category.id]
            );
          },
        },
        {
          key: "grid",
          icon: <AppstoreOutlined />,
          label: "Grid View",
          onClick: () => {
            const newViewMode = "grid";
            setCategoryViewModes((prev) => ({
              ...prev,
              [category.id]: newViewMode,
            }));
            saveUserPreferences(
              category.id,
              newViewMode,
              categoryBookmarkSizes[category.id]
            );
          },
        },
        {
          key: "icon",
          icon: <PictureOutlined />,
          label: "Icon View",
          onClick: () => {
            const newViewMode = "icon";
            setCategoryViewModes((prev) => ({
              ...prev,
              [category.id]: newViewMode,
            }));
            saveUserPreferences(
              category.id,
              newViewMode,
              categoryBookmarkSizes[category.id]
            );
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
            setCategoryBookmarkSizes((prev) => ({
              ...prev,
              [category.id]: newSize,
            }));
            saveUserPreferences(
              category.id,
              categoryViewModes[category.id],
              newSize
            );
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
            saveUserPreferences(
              category.id,
              categoryViewModes[category.id],
              newSize
            );
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
            saveUserPreferences(
              category.id,
              categoryViewModes[category.id],
              newSize
            );
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
        setNewCategoryName(category.name);
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
    // ... rest of the menu items ...
  ];

  const getFaviconUrl = (url) => {
    try {
      if (!url) return "https://www.google.com/favicon.ico";
      let cleanUrl = url.trim();
      if (!cleanUrl.match(/^https?:\/\//i)) {
        cleanUrl = `http://${cleanUrl}`;
      }
      const urlObj = new URL(cleanUrl);
      const domain = urlObj.hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=24`;
    } catch (error) {
      return "https://www.google.com/favicon.ico";
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
          <List.Item
            actions={[
              <Tooltip title="Edit">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEditBookmark(link)}
                />
              </Tooltip>,
              <Tooltip title="Delete">
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteBookmark(link.id)}
                  danger
                />
              </Tooltip>,
            ]}
          >
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {categoryLinks.map((link) => (
            <div
              key={link.id}
              className="flex flex-col items-center p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group relative"
            >
              <div className="relative w-full flex justify-center">
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
                <div className="w-full text-center">
                  <span className="text-[12px] truncate -ml-1">
                    {link.title || link.name}
                  </span>
                </div>
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
        <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3 p-1">
          {categoryLinks.map((link) => (
            <div key={link.id} className="relative group flex justify-center">
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
      <div className="mb-2 ">
        <div className="flex justify-end mb-4">
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
                        className={`p-2 rounded transition-colors duration-200 ${
                          snapshot.isDraggingOver
                            ? "bg-blue-200 border-2 border-dashed border-blue-500"
                            : "bg-gray-700 border-2 border-dashed border-transparent"
                        }`}
                      >
                        <div className="text-center text-gray-400 text-sm mb-4"></div>
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
                                        ? "shadow-2xl rotate-1 scale-105"
                                        : "shadow-none rotate-0 scale-100"
                                    }`}
                                  >
                                    <Card className="max-w-sm mx-auto"
                                      title={
                                        <div className="bg-gradient-to-r rounded-lg from-blue-700 via-blue-600 to-blue-800 p-1 relative overflow-hidden">
                                          <div className="absolute left-0 w-full h-full">
                                            <div className="absolute inset-0 bg-white opacity-10 transform rotate-45 translate-x-[-50%] translate-y-[-50%] w-[200%] h-[200%]"></div>
                                          </div>
                                          <div className="relative z-10 flex justify-between items-center">
                                            <div className="flex items-center flex-1">
                                              <div
                                                {...provided.dragHandleProps}
                                                className={`cursor-move p-2 rounded-md transition-all duration-200 group ${
                                                  snapshot.isDragging
                                                    ? "bg-blue-500"
                                                    : "hover:bg-blue-500"
                                                }`}
                                              >
                                                <div className="flex flex-col gap-1">
                                                  <div className="flex gap-1">
                                                    <div className="w-1 h-1 rounded-full bg-white"></div>
                                                    <div className="w-1 h-1 rounded-full bg-white"></div>
                                                  </div>
                                                  <div className="flex gap-1">
                                                    <div className="w-1 h-1 rounded-full bg-white"></div>
                                                    <div className="w-1 h-1 rounded-full bg-white"></div>
                                                  </div>
                                                </div>
                                              </div>
                                              <span className="text-sm text-white font-semibold ml-2">
                                                {category.name ||
                                                  category.newCategory}
                                              </span>
                                            </div>
                                            <Space>
                                              <Tooltip title="Add Bookmark">
                                                <Button
                                                  type="text"
                                                  icon={<PlusOutlined />}
                                                  onClick={() => {
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
                                              >
                                                <Button
                                                  type="text"
                                                  icon={<MoreOutlined />}
                                                  style={{ color: "white" }}
                                                />
                                              </Dropdown>
                                            </Space>
                                          </div>
                                        </div>
                                      }
                                      headStyle={{
                                        padding: 0,
                                        borderBottom: "none",
                                        borderRadius: "8px 8px 0 0",
                                      }}
                                      bodyStyle={{
                                        padding: "16px",
                                        maxHeight: "400px",
                                        overflowY: "auto",
                                      }}
                                      style={{
                                        borderRadius: "8px",
                                        height: "100%",
                                        transition: "all 0.3s ease",
                                        transform: snapshot.isDragging
                                          ? "rotate(1deg)"
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

  // Add this function to save view mode and size preferences
  const saveUserPreferences = async (categoryId, viewMode, size) => {
    if (!user) return;
    try {
      const userPrefsRef = doc(db, "users", user.uid);
      await updateDoc(userPrefsRef, {
        [`categoryPreferences.${categoryId}`]: {
          viewMode,
          size,
          lastUpdated: new Date().toISOString(),
        },
        globalPreferences: {
          defaultViewMode: viewMode,
          faviconSize: size?.grid || 32,
          lastUpdated: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

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

          // Load view mode preferences
          if (data.categoryPreferences) {
            const viewModes = {};
            const sizes = {};
            Object.entries(data.categoryPreferences).forEach(
              ([categoryId, prefs]) => {
                if (prefs.viewMode) viewModes[categoryId] = prefs.viewMode;
                if (prefs.size) sizes[categoryId] = prefs.size;
              }
            );
            setCategoryViewModes(viewModes);
            setCategoryBookmarkSizes(sizes);
          }

          // Load global view preferences
          if (data.globalPreferences) {
            if (data.globalPreferences.defaultViewMode) {
              setViewMode(data.globalPreferences.defaultViewMode);
            }
            if (data.globalPreferences.faviconSize) {
              setFaviconSize(data.globalPreferences.faviconSize);
            }
          }
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };

    fetchUserPreferences();
  }, [user]);

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddCategoryModalVisible(true)}
          >
            Add Hello Category
          </Button>
        </Space>
      </div>

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