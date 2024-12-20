import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { MdAdd, MdMoreVert } from "react-icons/md";
import Category from "../components/Category";
import ShowLinks from "./ShowLinks";
import { Droppable, Draggable } from "react-beautiful-dnd";

// const initialBookmarks = {
//   Popular: [
//     { name: "Facebook", link: "https://www.facebook.com" },
//     { name: "Twitter", link: "https://www.twitter.com" },
//     { name: "Myntra", link: "https://www.myntra.com" },
//   ],
//   Travel: [
//     { name: "Booking", link: "https://www.booking.com" },
//     { name: "Emirates", link: "https://www.emirates.com" },
//     { name: "Trip Advisor", link: "https://www.tripadvisor.com" },
//   ],
// };

const colorPalette = [
  // Row 1
  "#000000",
  "#424242",
  "#666666",
  "#808080",
  "#999999",
  "#B3B3B3",
  "#CCCCCC",
  "#E6E6E6",
  "#F2F2F2",
  "#FFFFFF",
  // Row 2
  "#FF0000",
  "#FF4500",
  "#FF8C00",
  "#FFD700",
  "#32CD32",
  "#00FF00",
  "#00CED1",
  "#0000FF",
  "#8A2BE2",
  "#FF00FF",
  // Row 3
  "#FFB6C1",
  "#FFA07A",
  "#FFE4B5",
  "#FFFACD",
  "#98FB98",
  "#AFEEEE",
  "#87CEEB",
  "#E6E6FA",
  "#DDA0DD",
  "#FFC0CB",
  // Row 4
  "#DC143C",
  "#FF4500",
  "#FFA500",
  "#FFD700",
  "#32CD32",
  "#20B2AA",
  "#4169E1",
  "#8A2BE2",
  "#9370DB",
  "#FF69B4",
  // Row 5
  "#800000",
  "#D2691E",
  "#DAA520",
  "#808000",
  "#006400",
  "#008080",
  "#000080",
  "#4B0082",
  "#800080",
  "#C71585",
];

const Bookmarks = () => {
  const [user, setUser] = useState(null);
  const [background, setBackground] = useState(false);
  const [textbackground, setTextBackground] = useState(false);
  const [viewbackground, setViewBackground] = useState(false);
  const [positionbackground, setPositionBackground] = useState(false);
  const [categories, setCategories] = useState([]); // Categories data
  const [newCategory, setNewCategory] = useState("");
  const [firebaseBookmarks, setFirebaseBookmarks] = useState("");

  // Load category settings from localStorage or use default values
  const [categorySettings, updateCategorySetting] = useState(() => {
    const storedSettings = localStorage.getItem("categorySettings");
    return storedSettings
      ? JSON.parse(storedSettings)
      : {
          Popular: {
            bgColor: "#f8f9fa",
            textColor: "#000",
            view: "grid",
            position: "start",
          },
          Travel: {
            bgColor: "#f8f9fa",
            textColor: "#000",
            view: "list",
            position: "start",
          },
        };
  });

  const [menuOpen, setMenuOpen] = useState({});
  const [visibleForm, setVisibleForm] = useState(null);
  const [newBookmark, setNewBookmark] = useState({
    name: "",
    link: "",
    category: "",
  });

  const handleDeleteBookmark = async (category, id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "bookmarks", id));
      setFirebaseBookmarks((prev) => ({
        ...prev,
        [category]: prev[category].filter((bookmark) => bookmark.id !== id),
      }));
    } catch (error) {
      console.error("Error deleting bookmark: ", error);
      alert(`Error deleting bookmark: ${error.message}`);
    }
  };

  // Add a new category
  const handleAddCategory = async () => {
    if (!user || newCategory.trim() === "") return;

    try {
      await addDoc(collection(db, "users", user.uid, "categories"), {
        name: newCategory,
        createdAt: new Date(),
      });
      setNewCategory("");
    } catch (error) {
      console.error("Error adding category: ", error);
    }
  };

  // Delete a category
  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "categories", categoryId));
      setFirebaseBookmarks((prev) => {
        const updated = { ...prev };
        delete updated[categoryId];
        return updated;
      });
    } catch (error) {
      console.error("Error deleting category: ", error);
    }
  };

  const menuRef = useRef(null); // Reference for menu
  const backgroundRef = useRef(null);
  const anotherRef = useRef(null);
  const formRef = useRef(null); // Reference for form

  useEffect(() => {
    localStorage.setItem("categorySettings", JSON.stringify(categorySettings));
  }, [categorySettings]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // useEffect(() => {
  //   if (user) {
  //     const unsubscribeFns = Object.keys(initialBookmarks).map((category) => {
  //       const bookmarksRef = collection(db, "users", user.uid, "bookmarks");
  //       return onSnapshot(bookmarksRef, (snapshot) => {
  //         const bookmarksData = snapshot.docs
  //           .map((doc) => ({ id: doc.id, ...doc.data() }))
  //           .filter((bookmark) => bookmark.category === category);

  //         setFirebaseBookmarks((prev) => ({
  //           ...prev,
  //           [category]: bookmarksData,
  //         }));
  //       });
  //     });

  //     return () => unsubscribeFns.forEach((unsubscribe) => unsubscribe());
  //   }
  // }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen({});
      }
      if (formRef.current && !formRef.current.contains(event.target)) {
        setVisibleForm(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOption = (event) => {
      if (
        backgroundRef.current &&
        !backgroundRef.current.contains(event.target)
      ) {
        setBackground(false);
        setTextBackground(false);
        setViewBackground(false);
        setPositionBackground(false);
      }
      if (anotherRef.current && !anotherRef.current.contains(event.target)) {
        setTextBackground(false);
      }
    };

    document.addEventListener("mousedown", handleClickOption);
    return () => {
      document.removeEventListener("mousedown", handleClickOption);
    };
  }, []);

  const toggleBookmark = (category) => {
    setBackground((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        showBgColor: !prev[category]?.showBgColor,
      },
    }));
  };
  const toggleTextBookmark = (category) => {
    setTextBackground((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        showTextColor: !prev[category]?.showTextColor,
      },
    }));
  };
  const toggleViewBookmark = (category) => {
    setViewBackground((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        showView: !prev[category]?.showView,
      },
    }));
  };
  const togglePositionBookmark = (category) => {
    setPositionBackground((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        showPosition: !prev[category]?.showPosition,
      },
    }));
  };

  const fetchFavicon = (url) =>
    `https://www.google.com/s2/favicons?sz=64&domain=${url}`;

  const handleAddBookmark = async (category) => {
    if (newBookmark.name && newBookmark.link) {
      try {
        const bookmarksRef = collection(db, "users", user.uid, "bookmarks");
        await addDoc(bookmarksRef, { ...newBookmark, category });
        setNewBookmark({ name: "", link: "" });
        setVisibleForm(null);
      } catch (error) {
        console.error("Error adding bookmark:", error);
      }
    } else {
      alert("Please provide both a name and a valid link.");
    }
  };

  const initializeCategorySettings = (category) => {
    updateCategorySetting((prevSettings) => ({
      ...prevSettings,
      [category]: {
        bgColor: "#fff",
        textColor: "#000",
        view: "grid",
        position: "start",
      },
    }));
  };

  const renderBookmarks = (category) => {
    if (!categorySettings[category]) {
      initializeCategorySettings(category);
    }

    const {
      view = "grid",
      textColor = "#000",
      bgColor = "#fff",
      position = "start",
    } = categorySettings[category] || {};

    const bookmarks = firebaseBookmarks[category] || [];

    return (
      <div className="bookmark-container">
        <h3 className="text-lg font-semibold mb-3">{category}</h3>
        <Droppable droppableId={category} direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`bookmark-grid ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
            >
              {bookmarks.map((bookmark, index) => (
                <Draggable
                  key={bookmark.id}
                  draggableId={bookmark.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`bookmark-item ${snapshot.isDragging ? 'dragging' : ''}`}
                    >
                      <img
                        src={fetchFavicon(bookmark.link)}
                        alt={bookmark.name}
                        className="bookmark-icon"
                      />
                      {view !== "icon" && (
                        <span className="bookmark-name">
                          {bookmark.name}
                        </span>
                      )}
                      <a
                        href={bookmark.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 z-10"
                        onClick={(e) => snapshot.isDragging && e.preventDefault()}
                      />
                      {bookmark.id && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteBookmark(category, bookmark.id);
                          }}
                          className="bookmark-delete"
                          aria-label="Delete bookmark"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {bookmarks.length === 0 && !snapshot.isDraggingOver && (
                <div className="bookmark-placeholder">
                  Drop bookmarks here
                </div>
              )}
            </div>
          )}
        </Droppable>
      </div>
    );
  };

  const toggleMenu = (category) => {
    setMenuOpen((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleForm = (category) => {
    setVisibleForm((prev) => (prev === category ? null : category));
  };
  return (
    <div className="container mt-7 mx-auto">
      <div className="">
        <Category />
        <ShowLinks />
      </div>
      {/* Add Category */}
      <div className="mb-6 mt-4">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New Category Name"
          className="border rounded-lg p-2 w-full"
        />
        <button
          onClick={handleAddCategory}
          className="bg-blue-500 text-white py-2 px-4 mt-2 rounded-lg hover:bg-blue-600"
        >
          Add Category
        </button>
      </div>
    </div>
  );
};

export default Bookmarks;
