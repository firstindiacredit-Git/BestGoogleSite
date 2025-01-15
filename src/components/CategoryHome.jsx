import React, { useState, useEffect, useRef } from "react";
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
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Settings, Edit, Plus, Trash2 } from "lucide-react";
import { Modal, message, Input } from "antd";

const CategoryHome = ({ categoryType, itemName }) => {
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showUrl, setShowUrl] = useState(true);
  const [iconSize, setIconSize] = useState("large");
  const [collapsed, setCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [newBookmark, setNewBookmark] = useState({ name: "", link: "" });
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef(null);

  const collapse = () => {
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // First, fetch admin categories
        const categoryQuery = query(
          collection(db, "category"),
          where("newCategory", "==", categoryType)
        );

        const unsubscribeCategory = onSnapshot(
          categoryQuery,
          async (categorySnapshot) => {
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
                  const adminLinks = adminLinksSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    addedByAdmin: true,
                  }));

                  // Then fetch user's personal bookmarks
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

                      // Combine admin links and user bookmarks
                      const allBookmarks = [...adminLinks, ...userBookmarks];
                      setBookmarks(allBookmarks);
                      setLoading(false);
                    }
                  );

                  return () => {
                    userBookmarksUnsubscribe();
                  };
                }
              );

              return () => {
                adminLinksUnsubscribe();
              };
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
                }
              );

              return () => userBookmarksUnsubscribe();
            }
          }
        );

        return () => {
          unsubscribeCategory();
        };
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [categoryType]);

  useEffect(() => {
    if (showSettings && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [showSettings]);

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
      if (bookmark.addedByAdmin) {
        // Just hide the bookmark for this user
        await updateDoc(doc(db, "users", user.uid, "bookmarks", bookmark.id), {
          hidden: true,
        });
        message.success("Bookmark hidden successfully!");
      } else {
        // Actually delete the bookmark
        await deleteDoc(doc(db, "users", user.uid, "bookmarks", bookmark.id));
        message.success("Bookmark deleted successfully!");
      }
    } catch (error) {
      message.error("Failed to delete bookmark");
      console.error("Error deleting bookmark:", error);
    }
  };

  const handleAdd = async () => {
    try {
      if (!newBookmark.name || !newBookmark.link) {
        message.error("Please fill in all fields");
        return;
      }

      const bookmarkData = {
        name: newBookmark.name,
        link: newBookmark.link,
        category: categoryType,
        addedByAdmin: false,
        createdAt: new Date().toISOString(),
      };

      await addDoc(
        collection(db, "users", user.uid, "bookmarks"),
        bookmarkData
      );
      message.success("Bookmark added successfully!");
      setShowAddModal(false);
      setNewBookmark({ name: "", link: "" });
    } catch (error) {
      message.error("Failed to add bookmark");
      console.error("Error adding bookmark:", error);
    }
  };

  const handleEdit = async () => {
    try {
      if (!editingBookmark.name || !editingBookmark.link) {
        message.error("Please fill in all fields");
        return;
      }

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

      message.success("Bookmark updated successfully!");
      setShowEditModal(false);
      setEditingBookmark(null);
    } catch (error) {
      message.error("Failed to update bookmark");
      console.error("Error updating bookmark:", error);
    }
  };

  const renderSettingsMenu = () => {
    const dropdownContent = showSettings && (
      <div
        className="fixed w-48 bg-white dark:text-white dark:bg-[#28283A] rounded-sm shadow-lg border border-gray-200 dark:border-gray-700 z-[9999]"
        style={{
          top: `${dropdownPosition.top}px`,
          right: `${dropdownPosition.right}px`,
        }}
      >
        <div className="p-2">
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
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

          <div className="mb-4">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
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

          <div className="border-t dark:border-gray-700 pt-2">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Options
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
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
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
            >
              <Edit className="w-4 h-4" />
              Edit Bookmarks
            </button>
          </div>
        </div>
      </div>
    );

    return (
      <div className="relative flex justify-between w-full">
        <div
          className="dark:text-white text-xl font-medium p-2 w-full cursor-pointer flex items-center"
          onClick={collapse}
        >
          {itemName}
        </div>
        {isHovered && (
          <button
            onClick={() => {
              setShowSettings(false);
              setShowAddModal(true);
            }}
            className="flex dark:text-white/50 items-center rounded-sm gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}

        {isHovered && (
          <button
            ref={buttonRef}
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-sm dark:text-white/50 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
        {dropdownContent && createPortal(dropdownContent, document.body)}
      </div>
    );
  };

  const renderBookmarks = () => {
    const commonClasses = {
      container: "transition-all mt-8 duration-200 ease-in-out cursor-pointer",
      image: `${getIconSizeClass()} rounded`,
      title: "font-medium text-gray-900 dark:text-gray-100",
    };

    const views = {
      list: {
        container: "flex flex-col  space-y-2",
        item: "flex items-center p-2 rounded-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600",
        content: "flex items-center w-full",
        details: "flex-grow",
      },
      grid: {
        container: `grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4`,
        item: "flex flex-col items-center p-2 rounded-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600",
        content: "flex flex-col items-center text-center w-full",
        details: "w-full mt-2 overflow-hidden",
      },
      cloud: {
        container: "flex flex-wrap gap-4",
        item: "flex items-center justify-center p-2 rounded-full bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600",
        content: "flex items-center w-fit",
      },
    };

    const currentView = views[viewMode];

    return (
      <div className={currentView.container}>
        {bookmarks.map((item) => (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`${commonClasses.container} ${currentView.item}`}
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
                  <div
                    className={`${commonClasses.title} ${
                      viewMode === "grid" ? "truncate text-center text-sm" : ""
                    }`}
                  >
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

  return (
    <div
      className="bg-white dark:bg-[#28283A] rounded-sm p-3 shadow-sm isolate"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-end relative z-[9999]">
        {renderSettingsMenu()}
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-24 text-gray-600 dark:text-gray-300">
          Loading...
        </div>
      ) : (
        <>
          {!collapsed && renderBookmarks()}
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
                  className="flex items-center justify-between p-3 rounded-sm bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex items-center gap-3">
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
                        setNewBookmark({
                          name: bookmark.name,
                          link: bookmark.link,
                        });
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
                setNewBookmark({ name: "", link: "" });
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
    </div>
  );
};

export default CategoryHome;
