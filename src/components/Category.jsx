import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { MdMoreVert, MdAdd } from "react-icons/md";
import { MdDeleteForever } from "react-icons/md";

const CategoryPage = () => {
  const [user, setUser] = useState(null);
  const [background, setBackground] = useState(false);
  const [textbackground, setTextBackground] = useState(false);
  const [viewbackground, setViewBackground] = useState(false);
  const [positionbackground, setPositionBackground] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newCatBookmark, setCatNewBookmark] = useState({ name: "", url: "" });
  const [firebaseBookmarks, setFirebaseBookmarks] = useState({});
  const [menuOpen, setMenuOpen] = useState({});
  const [visibleForm, setVisibleForm] = useState(null);
  const [categorySettings, setCategorySettings] = useState(() => {
    const storedSettings = localStorage.getItem("categorySettings");
    return storedSettings ? JSON.parse(storedSettings) : {};
  });

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
  const isLightColor = (color) => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  };

  useEffect(() => {
    localStorage.setItem("categorySettings", JSON.stringify(categorySettings));
  }, [categorySettings]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);
  const menuRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (user) {
      const categoriesRef = collection(db, "users", user.uid, "categories");
      const unsubscribeCategories = onSnapshot(categoriesRef, (snapshot) => {
        const categoriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoriesData);
      });

      return () => unsubscribeCategories();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const unsubscribeFns = categories.map((category) => {
        const bookmarksRef = collection(
          db,
          "users",
          user.uid,
          "categories",
          category.id,
          "catbookmarks"
        );
        const unsubscribeBookmarks = onSnapshot(bookmarksRef, (snapshot) => {
          const bookmarksData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFirebaseBookmarks((prev) => ({
            ...prev,
            [category.id]: bookmarksData,
          }));
        });
        return unsubscribeBookmarks;
      });

      return () => unsubscribeFns.forEach((unsubscribe) => unsubscribe());
    }
  }, [user, categories]);
  const handleDeleteCategory = async (categoryId) => {
    try {
      
      await deleteDoc(doc(db, "users", user.uid, "categories", categoryId));

      console.log(`Category ${categoryId} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting category: ", error);
    }
  };

  const handleSettingsChange = (categoryName, key, value) => {
    setCategorySettings((prevSettings) => ({
      ...prevSettings,
      [categoryName]: {
        ...prevSettings[categoryName],
        [key]: value,
      },
    }));
    console.log(key[1], "this is key");
  };
  useEffect(() => {
    localStorage.setItem("categorySettings", JSON.stringify(categorySettings));
  }, [categorySettings]);

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

  const fetchFavicon = (url) => {
    return `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`;
  };

  const handleAddCatBookmark = async (categoryId) => {
    if (
      !user ||
      newCatBookmark.name.trim() === "" ||
      newCatBookmark.url.trim() === ""
    )
      return;

    try {
      const faviconUrl = fetchFavicon(newCatBookmark.url);
      await addDoc(
        collection(
          db,
          "users",
          user.uid,
          "categories",
          categoryId,
          "catbookmarks"
        ),
        { ...newCatBookmark, favicon: faviconUrl }
      );
      setCatNewBookmark({ name: "", url: "" });
    } catch (error) {
      console.error("Error adding bookmark: ", error);
    }
  };

  const handleDeleteCatBookmark = async (categoryId, bookmarkId) => {
    try {
      await deleteDoc(
        doc(
          db,
          "users",
          user.uid,
          "categories",
          categoryId,
          "catbookmarks",
          bookmarkId
        )
      );
    } catch (error) {
      console.error("Error deleting bookmark: ", error);
    }
  };

  const toggleMenu = (category) => {
    setMenuOpen((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };
  const toggleBookmark = (categoryName) => {
    setBackground((prevState) => ({
      ...prevState,
      [categoryName]: {
        ...prevState[categoryName],
        showBgColor: !prevState[categoryName]?.showBgColor,
      },
    }));
  };
  const toggleTextBookmark = (categoryName) => {
    setTextBackground((prevState) => ({
      ...prevState,
      [categoryName]: {
        ...prevState[categoryName],
        showTextColor: !prevState[categoryName]?.showTextColor,
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
  const backgroundRef = useRef(null);
  const anotherRef = useRef(null);

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
        setTextBookmark(false); 
      }
    };

    document.addEventListener("mousedown", handleClickOption);
    return () => {
      document.removeEventListener("mousedown", handleClickOption);
    };
  }, []);

  const handleDeleteCatBookmarks = (category, bookmarkId) => {
    try {
     
      if (Array.isArray(category)) {
        const updatedCategory = category.filter(
          (bookmark) => bookmark.id !== bookmarkId
        );

             } else {
        throw new Error("Category is not an array");
      }
    } catch (error) {
      console.error("Error deleting bookmark: ", error);
    }
  };

  const toggleForm = (category) => {
    setVisibleForm((prev) => (prev === category ? null : category));
  };

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

  const renderPositionClass = (category) => {
    const { position = "start" } = categorySettings[category] || {};
    return (
      {
        start: "justify-start",
        Center: "justify-center",
        end: "justify-end",
      }[position] || "justify-start"
    );
  };

  

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {categories.map((category) => {
          const settings = categorySettings[category.name] || {
            bgColor: "#ffffff",
            textColor: "#000000",
            view: "grid",
            position: "start",
          };

          return (
            <section
              key={category.id}
              className="rounded-lg shadow relative"
              style={{ backgroundColor: settings.bgColor }}
            >
              <div className="flex justify-between items-center p-4">
                <h3
                  className="text-xl font-semibold"
                  style={{ color: settings.textColor }}
                >
                  {category.name}
                </h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleMenu(category.name)}
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
              {menuOpen[category.name] && (
                <div
                  ref={menuRef}
                  className="absolute top-12 -right-10 w-28 bg-white border border-gray-300 rounded-lg shadow-lg z-20 p-4"
                >
                  {/* Background Color Option */}
                  <div className="relative">
                    <button
                      onClick={() => toggleBookmark(category.name)}
                      className={`w-full text-left text-sm font-medium mb-2 ${
                        background[category.name]?.showBgColor
                          ? "text-red-500"
                          : ""
                      }`}
                    >
                      Background
                      <span
                        className={`transition-transform ${
                          background[category.name] ? "rotate-0" : "hidden"
                        }`}
                      >
                        ➤
                      </span>
                    </button>

                    {background[category.name] && (
                      <div
                        ref={backgroundRef}
                        className="absolute top-0 left-full ml-3 transform translate-x-2 w-60 bg-white border border-gray-300 rounded-lg shadow-lg z-20 p-4"
                      >
                        {/* Color Palette */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {colorPalette.map((color) => (
                            <div
                              key={color}
                              onClick={() =>
                                handleSettingsChange(
                                  category.name,
                                  "bgColor",
                                  color
                                )
                              }
                              style={{
                                backgroundColor: color,
                                width: 20,
                                height: 20,
                                cursor: "pointer",
                                border:
                                  categorySettings[category.name]?.bgColor ===
                                  color
                                    ? "2px solid black"
                                    : "none",
                                position: "relative", 
                              }}
                              className="w-[20px] h-[20px] border border-gray-300"
                            >
                              {categorySettings[category.name]?.bgColor ===
                                color && (
                                <span
                                  style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    color: isLightColor(color) ? "" : "", 
                                  }}
                                >
                                  ✓
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Custom Color Picker */}
                        <label className="text-xs block mb-1">
                          Custom Color:
                        </label>
                        <input
                          type="color"
                          value={
                            categorySettings[category.name]?.bgColor ||
                            "#ffffff"
                          }
                          onChange={(e) =>
                            handleSettingsChange(
                              category.name,
                              "bgColor",
                              e.target.value
                            )
                          }
                          className="w-full  cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Text Color Option */}
                  <div className="relative">
                    <button
                      onClick={() => toggleTextBookmark(category.name)}  
                      className={`w-full text-left text-sm font-medium mb-2 ${
                        textbackground[category.name]?.showTextColor
                          ? "text-red-500"
                          : ""
                      }`}
                    >
                      Text
                      <span
                        className={`transition-transform ${
                          textbackground[category.name]?.showTextColor
                            ? "rotate-90"
                            : "hidden"
                        }`}
                      >
                        ➤
                      </span>
                    </button>

                    {textbackground[category.name] && (
                      <div
                        ref={backgroundRef}
                        className="absolute top-0 left-full ml-3 transform translate-x-2 w-60 bg-white border border-gray-300 rounded-lg shadow-lg z-20 p-4"
                      >
                        {/* Color Palette */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {colorPalette.map((color) => (
                            <div
                              key={color}
                              onClick={() =>
                                handleSettingsChange(
                                  category.name,
                                  "textColor",
                                  color
                                )
                              }
                              style={{
                                backgroundColor: color,
                                width: 20,
                                height: 20,
                                cursor: "pointer",
                                border:
                                  categorySettings[category.name]?.textColor ===
                                  color
                                    ? "2px solid black"
                                    : "none",
                                position: "relative",  
                              }}
                              className="w-[20px] h-[20px] border border-gray-300"
                            >
                              {categorySettings[category.name]?.textColor ===
                                color && (
                                <span
                                  style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    color: isLightColor(color) ? "" : "",  
                                  }}
                                >
                                  ✓
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Custom Color Picker */}
                        <label className="text-xs block mb-1">
                          Custom Color:
                        </label>
                        <input
                          type="color"
                          value={
                            categorySettings[category.name]?.textColor ||
                            "#ffffff"
                          }
                          onChange={(e) =>
                            handleSettingsChange(
                              category.name,
                              "textColor",
                              e.target.value
                            )
                          }
                          className="w-full  cursor-pointer"
                        />
                      </div>
                    )}
                    {/* View Option */}
                    <div className="">
                      <button
                        onClick={() => toggleViewBookmark(category)}
                        className={`w-full text-left text-sm font-medium mb-2 ${
                          viewbackground[category]?.showView
                            ? "text-red-500"
                            : ""
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
                      {(viewbackground[category]?.showView ||
                        viewbackground[category?.name]?.view) && (
                        <div
                          ref={backgroundRef}
                          className="absolute top-8 ml-3 left-full transform translate-x-2 w-60 bg-white border border-gray-300 rounded-lg shadow-lg z-20 p-4"
                        >
                          {["list", "grid", "icon-only"].map((view) => (
                            <button
                              key={view}
                              onClick={() =>
                                handleSettingsChange(
                                  category.name,
                                  "view",
                                  view
                                )
                              }
                              className={`block w-full text-left px-2 py-1 rounded ${
                                categorySettings[category.name]?.view === view
                                  ? "bg-blue-100 text-blue-600"
                                  : "text-gray-700"
                              }`}
                            >
                              {view.charAt(0).toUpperCase() +
                                view.slice(1).replace("-", " ")}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

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
                        className="absolute top-16 ml-3 left-full transform translate-x-2 w-32 bg-white border border-gray-300 rounded-lg shadow-lg z-20 p-4"
                      >
                        <div className="flex rounded-xl flex-col">
                          {["start", "Center", "end"].map((pos) => (
                            <button
                              key={pos}
                              onClick={() =>
                                handleDeleteCatBookmark((prev) => ({
                                  ...prev,
                                  [category]: {
                                    ...prev[category],
                                    position: pos,
                                  },
                                }))
                              }
                              className={`w-18 text-sm font-medium px-2 py-1 rounded ${
                                categorySettings[category]?.position === pos
                                  ? "bg-green-100 text-green-600"
                                  : "text-gray-700"
                              }`}
                            >
                              {pos.charAt(0).toUpperCase() + pos.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="w-full text-left text-sm font-medium mb-2">
                      <button
                        onClick={() => handleDeleteCategory(category.id)}  
                        className="flex w-full text-left text-red-500 hover:bg-red-100"
                      >
                        <MdDeleteForever className="mt-[3px]" />
                        Category
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div
                className={`p-4 ${
                  settings.view === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4"
                    : settings.view === "list"
                    ? "flex flex-col gap-2"
                    : "flex flex-wrap gap-2"
                } ${renderPositionClass(category.name)}`}
              >
                {firebaseBookmarks[category.id]?.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className={`relative p-2 rounded shadow group ${
                      settings.view === "icon-only" ? "text-center" : ""
                    }`}
                    style={{ color: settings.textColor }}
                  >
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${
                        settings.view === "icon-only"
                          ? "block"
                          : "flex items-center gap-2"
                      }`}
                    >
                      <img
                        src={bookmark.favicon}
                        alt={`${bookmark.name} favicon`}
                        className="w-8 h-8"
                      />
                      {settings.view !== "icon-only" && bookmark.name}
                    </a>
                    {bookmark.id && (
                      <button
                        onClick={() =>
                          handleDeleteCatBookmarks(category, bookmark.id)
                        }
                        className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity  rounded-full hover:bg-red-200"
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
                {/* Add Bookmark Form */}
                {visibleForm === category && (
                  <div className="p-4" ref={formRef}>
                    <input
                      type="text"
                      value={newCatBookmark.name}
                      onChange={(e) =>
                        setCatNewBookmark({
                          ...newCatBookmark,
                          name: e.target.value,
                        })
                      }
                      placeholder="Name"
                      className="w-full border mb-2 rounded-lg p-2 "
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
                      placeholder="Link"
                      className="w-full mb-4 p-2 border rounded-lg"
                    />
                    <button
                      onClick={() => handleAddCatBookmark(category.id)}
                      className="bg-green-500 text-white w-full py-2 rounded-lg hover:bg-green-600 text-sm"
                    >
                      Add Bookmark
                    </button>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryPage;
