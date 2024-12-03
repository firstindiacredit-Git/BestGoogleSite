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


const initialBookmarks = {
  Popular: [
    { name: "Facebook", link: "https://www.facebook.com" },
    { name: "Twitter", link: "https://www.twitter.com" },
    { name: "Myntra", link: "https://www.myntra.com" },
  ],
  Travel: [
    { name: "Booking", link: "https://www.booking.com" },
    { name: "Emirates", link: "https://www.emirates.com" },
    { name: "Trip Advisor", link: "https://www.tripadvisor.com" },
  ],
};

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
            bgColor: "#cfe8fc",
            textColor: "#000",
            view: "grid",
            position: "start",
          },
          Travel: {
            bgColor: "#f9e1cf",
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

  useEffect(() => {
    if (user) {
      const unsubscribeFns = Object.keys(initialBookmarks).map((category) => {
        const bookmarksRef = collection(db, "users", user.uid, "bookmarks");
        return onSnapshot(bookmarksRef, (snapshot) => {
          const bookmarksData = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((bookmark) => bookmark.category === category);

          setFirebaseBookmarks((prev) => ({
            ...prev,
            [category]: bookmarksData,
          }));
        });
      });

      return () => unsubscribeFns.forEach((unsubscribe) => unsubscribe());
    }
  }, [user]);

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

    const combinedBookmarks = [
      ...initialBookmarks[category],
      ...(firebaseBookmarks[category] || []),
    ].sort((a, b) => a.name.localeCompare(b.name));

     const positionClass =
       position === "start"
         ? "justify-start"
         : ""
         ? "justify-center"
         : "justify-end";
    return (
      <div
        className={`grid p-4 gap-2 ${
          view === "grid"
            ? "grid-cols-1  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2"
            : view === "icon"
            ? "grid-cols-4"
            : "grid-cols-1"
        } ${positionClass}`}
        style={{ backgroundColor: bgColor }}
      >
        {combinedBookmarks.map((bookmark, index) => (
          <div
            key={bookmark.id || index}
            className="p-2 rounded shadow items-center relative group"
            style={{ color: textColor, textAlign: "center" }}
          >
            <a
              href={bookmark.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block items-center gap-2"
            >
              <img
                src={fetchFavicon(bookmark.link)}
                alt={bookmark.name}
                className="w-8 h-8 m-auto items-center"
              />
              {view !== "icon" && (
                <span className="text-sm block mt-1">{bookmark.name}</span>
              )}
            </a>
            {/* Delete Icon */}
            {bookmark.id && (
              <button
                onClick={() => handleDeleteBookmark(category, bookmark.id)}
                className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity  hover:bg-red-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-3 h-3 text-gray-700 hover:text-red-700"
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
        ))}
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
    <div className="container mx-auto">
      <h2 className="text-3xl dark:text-white font-semibold mb-6 text-center">My Bookmarks</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(initialBookmarks).map((category) => {
          // Define settings to avoid ReferenceError
          const settings = categorySettings[category] || {};

          return (
            <section
              key={category}
              className="rounded-lg shadow relative"
              style={{
                backgroundColor: settings.bgColor || " ", // Default to white if undefined
              }}
            >
              <div className="flex justify-between items-center p-4">
                <h3
                  className="text-xl font-semibold"
                  style={{ color: settings.textColor || " " }} // Default to black if undefined
                >
                  {category}
                </h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleMenu(category)}
                    className="text-gray-600"
                    ref={menuRef}
                  >
                    <MdMoreVert size={24} />
                  </button>
                  <button
                    onClick={() => toggleForm(category)}
                    className="text-blue-500"
                  >
                    <MdAdd size={24} />
                  </button>
                </div>
              </div>

              {/* Options Dropdown */}
              {menuOpen[category] && (
                <div
                  ref={menuRef}
                  className="absolute top-8 -right-10 mt-2 w-28 bg-white border border-gray-300 rounded-lg shadow-lg z-20"
                >
                  <div className="p-4">
                    {/* Background Color Option */}
                    <button
                      onClick={() => toggleBookmark(category)}
                      className={`w-full text-left text-sm font-medium mb-2 ${
                        background[category]?.showBgColor ? "text-red-500" : ""
                      }`}
                    >
                      Background
                      <span
                        className={`transition-transform ${
                          background[category]?.showBgColor
                            ? "rotate-90"
                            : "hidden"
                        }`}
                      >
                        ➤
                      </span>
                    </button>
                    {background[category]?.showBgColor && (
                      <div
                        ref={backgroundRef}
                        className="absolute top-0 left-full transform translate-x-2 w-60 bg-white border border-gray-300 rounded-lg shadow-lg z-20 p-4"
                      >
                        <div className="flex p-1 flex-wrap gap-1 ">
                          {colorPalette.map((color) => (
                            <button
                              key={color}
                              className={`w-5 h-5 border-1 transition-all duration-200 ${
                                background[category]?.bgColor === color
                                  ? "border-black" // Black border for the selected color
                                  : "border-gray-700" // Default light gray border
                              } hover:border-gray-500 focus:outline`}
                              style={{ backgroundColor: color }}
                              onClick={() =>
                                updateCategorySetting((prev) => ({
                                  ...prev,
                                  [category]: {
                                    ...prev[category],
                                    bgColor: color,
                                  },
                                }))
                              }
                              aria-label={`Select ${color} as background color`}
                              title={`Select ${color}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs">Custom Color:</span>
                        <input
                          type="color"
                          value={background[category]?.bgColor || "#ffffff"}
                          onChange={(e) =>
                            updateCategorySetting((prev) => ({
                              ...prev,
                              [category]: {
                                ...prev[category],
                                bgColor: e.target.value,
                              },
                            }))
                          }
                          className="w-full rounded-full cursor-pointer"
                        />
                      </div>
                    )}

                    {/* Text Color Option */}
                    <button
                      onClick={() => toggleTextBookmark(category)}
                      className={`w-full text-left text-sm font-medium mb-2 ${
                        textbackground[category]?.showTextColor
                          ? "text-red-500"
                          : ""
                      }`}
                    >
                      Text
                      <span
                        className={`transition-transform ${
                          textbackground[category]?.showTextColor
                            ? "rotate-90"
                            : "hidden"
                        }`}
                      >
                        ➤
                      </span>
                    </button>
                    {textbackground[category]?.showTextColor && (
                      <div
                        ref={backgroundRef}
                        className="absolute top-9 left-full transform translate-x-2 w-60 bg-white border border-gray-300 rounded-lg shadow-lg z-20 p-4"
                      >
                        <div className="flex p-1 flex-wrap gap-2 mb-2">
                          {colorPalette.map((color) => (
                            <button
                              key={color}
                              className={`w-5 h-5 border-1 transition-all duration-200 ${
                                background[category]?.textColor === color
                                  ? "border-black" // Black border for the selected color
                                  : "border-gray-700" // Default light gray border
                              } hover:border-gray-500 focus:outline`}
                              style={{ backgroundColor: color }}
                              onClick={() =>
                                updateCategorySetting((prev) => ({
                                  ...prev,
                                  [category]: {
                                    ...prev[category],
                                    textColor: color,
                                  },
                                }))
                              }
                              aria-label={`Select ${color} as background color`}
                              title={`Select ${color}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs">Custom Color:</span>
                        <input
                          type="color"
                          value={background[category]?.bgColor || "#ffffff"}
                          onChange={(e) =>
                            updateCategorySetting((prev) => ({
                              ...prev,
                              [category]: {
                                ...prev[category],
                                bgColor: e.target.value,
                              },
                            }))
                          }
                          className="w-full rounded-full cursor-pointer"
                        />
                      </div>
                    )}

                    {/* View Option */}
                    <button
                      onClick={() => toggleViewBookmark(category)}
                      className={`w-full text-left text-sm font-medium mb-2 ${
                        viewbackground[category]?.showView ? "text-red-500" : ""
                      }`}
                    >
                      View
                      <span
                        className={`transition-transform ${
                          viewbackground[category]?.showView
                            ? "rotate-90"
                            : "hidden"
                        }`}
                      >
                        ➤
                      </span>
                    </button>
                    {viewbackground[category]?.showView && (
                      <div
                        ref={backgroundRef}
                        className="absolute top-20 left-full transform translate-x-2 w-60 bg-white border border-gray-300 rounded-lg shadow-lg z-20 p-4"
                      >
                        <div
                          className="flex flex-col space-x-2"
                          aria-label={`Select view for ${category}`}
                        >
                          <button
                            className={` ${
                              categorySettings[category]?.view === "list"
                                ? "text-green-600 bg-green-100"
                                : "text-gray-700"
                            }`}
                            onClick={() =>
                              updateCategorySetting((prev) => ({
                                ...prev,
                                [category]: {
                                  ...prev[category],
                                  view: "list",
                                },
                              }))
                            }
                          >
                            List
                          </button>
                          <button
                            className={` ${
                              categorySettings[category]?.view === "grid"
                                ? "text-green-600 bg-green-100"
                                : "text-gray-700"
                            }`}
                            onClick={() =>
                              updateCategorySetting((prev) => ({
                                ...prev,
                                [category]: {
                                  ...prev[category],
                                  view: "grid",
                                },
                              }))
                            }
                          >
                            Grid
                          </button>
                          <button
                            className={` rounded-md ${
                              categorySettings[category]?.view === "icon"
                                ? "text-green-600 bg-green-100"
                                : "text-gray-700"
                            }`}
                            onClick={() =>
                              updateCategorySetting((prev) => ({
                                ...prev,
                                [category]: {
                                  ...prev[category],
                                  view: "icon",
                                },
                              }))
                            }
                          >
                            Icon Only
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Position Option */}
                    <button
                      onClick={() => togglePositionBookmark(category)}
                      className={`w-full text-left text-sm font-medium mb-2 ${
                        positionbackground[category]?.showPosition
                          ? "text-red-500"
                          : ""
                      }`}
                    >
                      Position
                      <span
                        className={`transition-transform ${
                          positionbackground[category]?.showPosition
                            ? "rotate-90"
                            : "hidden"
                        }`}
                      >
                        ➤
                      </span>
                    </button>
                    {positionbackground[category]?.showPosition && (
                      <div
                        ref={backgroundRef}
                        className="absolute top-28 left-full transform translate-x-2 w-32 bg-white border border-gray-300 rounded-lg shadow-lg z-20 p-4"
                      >
                        <div className="flex rounded-xl flex-col">
                          {["start", "Center", "end"].map((pos) => (
                            <button
                              key={pos}
                              onClick={() =>
                                updateCategorySetting((prev) => ({
                                  ...prev,
                                  [category]: {
                                    ...prev[category],
                                    position: pos,
                                  },
                                }))
                              }
                              className={`w-18 text-sm font-medium ${
                                categorySettings[category]?.position === pos
                                  ? "bg-green-100 text-green-600"
                                  : ""
                              }`}
                            >
                              {pos.charAt(0).toUpperCase() + pos.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Add Bookmark Form */}
              {visibleForm === category && (
                <div className="p-4" ref={formRef}>
                  <input
                    type="text"
                    placeholder="Name"
                    value={newBookmark.name}
                    onChange={(e) =>
                      setNewBookmark((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full mb-2 p-2 border rounded-lg"
                  />
                  <input
                    type="url"
                    placeholder="Link"
                    value={newBookmark.link}
                    onChange={(e) =>
                      setNewBookmark((prev) => ({
                        ...prev,
                        link: e.target.value,
                      }))
                    }
                    className="w-full mb-4 p-2 border rounded-lg"
                  />
                  <button
                    onClick={() => handleAddBookmark(category)}
                    className="w-full bg-green-500 text-white py-2 rounded-lg"
                  >
                    Add Bookmark
                  </button>
                </div>
              )}

              {/* Bookmarks */}
              <div
                className={`grid gap-4 justify-${categorySettings[category]?.position}`}
              >
                {renderBookmarks(category)}
              </div>
            </section>
          );
        })}

        {/* Categories and Bookmarks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white shadow-md rounded-lg p-4 flex flex-col"
            >
              {/* Category Title */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-700">
                  {category.name}
                </h3>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>

              

              {/* Add Bookmark */}
              {/* <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-2">
                  Add Bookmark
                </h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newCatBookmark.name}
                    onChange={(e) =>
                      setCatNewBookmark({
                        ...newCatBookmark,
                        name: e.target.value,
                      })
                    }
                    placeholder="Bookmark Name"
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                  <input
                    type="url"
                    value={newCatBookmark.url}
                    onChange={(e) =>
                      setCatNewBookmark({
                        ...newCatBookmark,
                        url: e.target.value,
                      })
                    }
                    placeholder="Bookmark URL"
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                  <button
                    onClick={() => handleAddCatBookmark(category.id)}
                    className="bg-green-500 text-white w-full py-2 rounded-lg hover:bg-green-600 text-sm"
                  >
                    Add Bookmark
                  </button>
                </div>
              </div> */}
            </div>
          ))}
        </div>
      </div>
      <div className="">
        <Category />
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
