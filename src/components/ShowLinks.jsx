import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Draggable from "react-draggable";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaEllipsisV } from "react-icons/fa";
import { FaLock, FaLockOpen } from "react-icons/fa";

function DraggableDropdown({
  category,
  fetchLinks,
  cachedLinks,
  setCachedLinks,
  index,
  moveItem,
  isDraggable,
  isLocked,
}) {
  const [links, setLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    background: false,
    text: false,
    view: false,
    position: false,
    menu: false,
  });
  // const [categorySettings, setCategorySettings] = useState(() => {
  //   const storedSettings = localStorage.getItem("Settings");
  //   return storedSettings ? JSON.parse(storedSettings) : {};
  // });
  // useEffect(() => {
  //   localStorage.setItem("categorySettings", JSON.stringify(Settings));
  // }, [categorySettings]);

  const updateCategorySetting = (key, value) => {
    setCategorySettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  useEffect(() => {
    if (cachedLinks[category]) {
      setLinks(cachedLinks[category]);
    } else {
      setLoadingLinks(true);
      setError(null);
      fetchLinks(category)
        .then((fetchedLinks) => {
          setLinks(fetchedLinks);
          setCachedLinks((prev) => ({
            ...prev,
            [category]: fetchedLinks,
          }));
        })
        .catch((error) => {
          console.error("Error fetching links:", error);
          setError("Failed to load links.");
        })
        .finally(() => setLoadingLinks(false));
    }
  }, [fetchLinks, category, cachedLinks, setCachedLinks]);

  const handleMenuToggle = () => setMenuOpen((prev) => !prev);

  const toggleDropdown = (key) => {
    setDropdowns((prev) => ({
      background: key === "background" ? !prev.background : false,
      text: key === "text" ? !prev.text : false,
      view: key === "view" ? !prev.view : false,
      position: key === "position" ? !prev.position : false,
    }));
  };
  const handleStop = (e, data) => {
    if (!isLocked && isDraggable) {
      moveItem(index, data.x, data.y);
    }
  };

  const handleClickOutside = (e) => {
    setDropdowns((prevDropdowns) => {
      const updatedDropdowns = { ...prevDropdowns };

      Object.keys(refs).forEach((key) => {
        if (
          menuOpen && // Check if menu is open
          menuRef.current && // Ensure ref exists
          !menuRef.current.contains(e.target) // Check if click is outside menu
        ) {
          setMenuOpen(false); // Close the menu
        }
        if (
          updatedDropdowns[key] &&
          refs[key].current &&
          !refs[key].current.contains(e.target)
        ) {
          updatedDropdowns[key] = false;
        }
      });

      return updatedDropdowns;
    });
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleDragStop = (e, data) => {
    if (!isLocked && isDraggable) {
      moveItem(index, data.x, data.y);
    }
  };
  // Fetch settings from storage
  const getSettingsFromStorage = (category) => {
    const savedSettings = localStorage.getItem(`settings_${category}`);
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          bgcolor: "#f8f9fa",
          textColor: "#000",
          viewMode: "list",
          position: "start",
        };
  };
   const [settings, setSettings] = useState(() =>
     getSettingsFromStorage(category)
   );

    useEffect(() => {
      localStorage.setItem(`settings_${category}`, JSON.stringify(settings));
    }, [settings, category]);

    const updateSettings = (key, value) => {
      setSettings((prevSettings) => ({
        ...prevSettings,
        [key]: value,
      }));
    };


  useEffect(() => {
    // Restore settings from localStorage when component mounts
    const savedSettings = localStorage.getItem(`settings_${category}`);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [category]);

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

  const uniqueColorPalette = [...new Set(colorPalette)];

  const backgroundRef = useRef(null);
  const menuRef = useRef(null);
  const textRef = useRef(null);
  const viewRef = useRef(null);
  const positionRef = useRef(null);

  const refs = {
    background: backgroundRef,
    text: textRef,
    view: viewRef,
    position: positionRef,
    menu: menuRef,
  };
  // const updateSettings = (key, value) => {
  //   setSettings((prevSettings) => ({
  //     ...prevSettings,
  //     [key]: value,
  //   }));
  // };
  const handlePositionChange = (newPosition) => {
    updateSettings("position", newPosition);
  };

  let positionClass = "";

  if (settings.position === "start") {
    positionClass = "justify-start";
  } else if (settings.position === "center") {
    positionClass = "justify-center";
  } else if (settings.position === "end") {
    positionClass = "justify-end";
  }

  const DropdownContent = (
    <div
      className="relative p-2 rounded-sm border mt-10 border-gray-200"
      style={{ backgroundColor: settings.bgcolor, color: settings.textColor }}
    >
      <h2 className="text-[14px] font-semibold mb-1 p-1">{category}</h2>
      <button
        onClick={handleMenuToggle}
        className="absolute top-2 text-gray-600 right-2 p-1 rounded-full"
      >
        <FaEllipsisV />
      </button>

      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute top-10 -right-20 w-28 bg-white border border-gray-300 rounded z-20 p-2"
        >
          {/* Background Picker */}
          <div>
            <button
              onClick={() => toggleDropdown("background")}
              className={`w-full text-left text-[14px] mb-1  ${
                dropdowns.background ? "text-red-500" : ""
              }`}
            >
              Background
              <span
                className={`transition-transform transform ${
                  dropdowns.background ? "rotate-0 ml-1" : "hidden"
                }`}
              >
                ➤
              </span>
            </button>
            {dropdowns.background && (
              <div
                ref={backgroundRef}
                className="absolute top-0 left-full transform translate-x-2 w-60 bg-white border border-gray-300 rounded-sm shadow-lg z-20 p-4"
              >
                {/* Color Palette */}
                <div className="flex flex-wrap gap-0.5 mb-2 p-2">
                  {uniqueColorPalette.map((color) => (
                    <div
                      key={color}
                      onClick={() => updateSettings("bgcolor", color)}
                      style={{
                        backgroundColor: color,
                        border:
                          settings.bgcolor === color
                            ? "2px solid #000"
                            : "1px solid #ccc",
                        padding: "-1px",
                      }}
                      className="w-5 h-5 cursor-pointer "
                    ></div>
                  ))}
                </div>

                {/* Custom Color Picker */}
                <label className="text-xs block mb-1">Custom Color:</label>
                <input
                  type="color"
                  value={settings.bgcolor}
                  onChange={(e) => updateSettings("bgcolor", e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Text Color Picker */}
          <div>
            <button
              onClick={() => toggleDropdown("text")}
              className={` w-full text-left text-[14px] mb-1  ${
                dropdowns.text ? "text-red-500" : ""
              }`}
            >
              Text
              <span
                className={`transition-transform transform ${
                  dropdowns.text ? "rotate-0 ml-1" : "hidden"
                }`}
              >
                ➤
              </span>
            </button>
            {dropdowns.text && (
              <div
                ref={textRef}
                className="absolute top-8 left-full transform translate-x-2 w-60 bg-white border border-gray-300 rounded-sm shadow-lg z-20 p-4"
              >
                <div className="flex flex-wrap gap-0.5 p-2 ">
                  {colorPalette.map((color) => (
                    <div
                      key={color}
                      onClick={() => updateSettings("textColor", color)}
                      style={{
                        backgroundColor: color,
                        border:
                          settings.textColor === color
                            ? "2px solid black"
                            : "1px solid #ccc",
                        padding: "-1px",
                      }}
                      className="w-5 h-5 cursor-pointer"
                    />
                  ))}
                </div>
                <label className="text-xs block">Custom Color:</label>
                <input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => updateSettings("textColor", e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* View Mode Picker */}
          <div>
            <button
              onClick={() => toggleDropdown("view")}
              className={` w-full text-left text-[14px] mb-1  ${
                dropdowns.view ? "text-red-500" : ""
              }`}
            >
              View
              <span
                className={`transition-transform transform ${
                  dropdowns.view ? "rotate-0 ml-1" : "hidden"
                }`}
              >
                ➤
              </span>
            </button>
            {dropdowns.view && (
              <div
                ref={viewRef}
                className="absolute top-14 -ml-1 left-full transform text-center translate-x-2 w-24 bg-white border border-gray-300 rounded-sm shadow-lg z-20 p-2"
              >
                <button
                  onClick={() => updateSettings("viewMode", "grid")}
                  className={`w-full text-center text-[14px]   mb-1 ${
                    settings.viewMode === "grid"
                      ? "bg-green-100 text-[14px] text-green-600"
                      : ""
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => updateSettings("viewMode", "list")}
                  className={`w-full text-center text-[14px] mb-1 ${
                    settings.viewMode === "list"
                      ? "bg-green-100 text-[14px]  text-green-600"
                      : ""
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => updateSettings("viewMode", "icon")}
                  className={`w-full text-center text-[14px]  ${
                    settings.viewMode === "icon"
                      ? "bg-green-100 text-[14px]  text-green-600"
                      : ""
                  }`}
                >
                  Icon
                </button>
              </div>
            )}
          </div>

          {/* Position Picker */}
          <div>
            <button
              onClick={() => toggleDropdown("position")}
              className={` w-full text-left text-[14px] mb-1  ${
                dropdowns.position ? "text-red-500" : ""
              }`}
            >
              Position
              <span
                className={`transition-transform transform ${
                  dropdowns.position ? "rotate-0 ml-1" : "hidden"
                }`}
              >
                ➤
              </span>
            </button>
            {dropdowns.position && (
              <div className="relative" ref={positionRef}>
                {dropdowns.position && (
                  <div className="absolute -top-7  text-[14px] left-24 transform translate-x-2 w-32 bg-white border border-gray-300 rounded shadow-lg z-20 p-2">
                    <button
                      className={`w-full text-center ${
                        settings.position === "start"
                          ? "bg-green-100 text-[14px] text-green-600"
                          : "hover:bg-gray-100 text-[14px]"
                      }`}
                      onClick={() => handlePositionChange("start")}
                    >
                      Start
                    </button>
                    <button
                      className={`w-full text-center ${
                        settings.position === "center"
                          ? "bg-green-100 text-[14px] text-green-600"
                          : "hover:bg-gray-100 text-[14px]"
                      }`}
                      onClick={() => handlePositionChange("center")}
                    >
                      Center
                    </button>
                    <button
                      className={`w-full text-center ${
                        settings.position === "end"
                          ? "bg-green-100 text-[14px] text-green-600"
                          : "hover:bg-gray-100 text-[14px]"
                      }`}
                      onClick={() => handlePositionChange("end")}
                    >
                      End
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Links View */}
      <div
        className={`p-1 grid gap-2 ${
          settings.viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            : settings.viewMode === "icon"
            ? "grid grid-cols-5"
            : `flex flex-col ${positionClass}` // Use flex in list view
        }`}
      >
        {links.map((link) => (
          <div key={link.id} className="flex flex-col items-center p-1 rounded">
            {link.logoUrl && (
              <img src={link.logoUrl} alt={link.name} className="w-7 h-7" />
            )}
            <a
              href={link.link}
              
              className="dark:text-white text-[12px] truncate "
            >
              {settings.viewMode !== "icon" && (
                <span className="text-[12px] mt-1">{link.name}</span>
              )}
            </a>
          </div>
        ))}
      </div>
    </div>
  );

  return isLocked ? (
    <div>{DropdownContent}</div>
  ) : (
    <Draggable onStop={handleStop} bounds="parent">
      {DropdownContent}
    </Draggable>
  );
}

DraggableDropdown.propTypes = {
  category: PropTypes.string.isRequired,
  fetchLinks: PropTypes.func.isRequired,
  cachedLinks: PropTypes.object.isRequired,
  setCachedLinks: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  moveItem: PropTypes.func.isRequired,
  isDraggable: PropTypes.bool.isRequired,
  isLocked: PropTypes.bool.isRequired,
  settings: PropTypes.object.isRequired,
  updateSettings: PropTypes.func.isRequired,
};
function ShowLinks() {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);
  const [cachedLinks, setCachedLinks] = useState({});
  const [items, setItems] = useState([]);
  const [locked, setLocked] = useState(false); // Global lock state
  const [settings, setSettings] = useState({});

  const fetchCategories = async () => {
    setLoadingCategories(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, "category"));
      const fetchedCategories = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(fetchedCategories);

      const savedItems = JSON.parse(localStorage.getItem("draggableItems"));
      setItems(savedItems || fetchedCategories);
    } catch (error) {
      setError("Failed to load categories.");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchLinks = async (newCategory) => {
    try {
      const linksQuery = query(
        collection(db, "links"),
        where("category", "==", newCategory)
      );
      const querySnapshot = await getDocs(linksQuery);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        logoUrl: `https://logo.clearbit.com/${
          new URL(doc.data().link).hostname
        }`,
      }));
    } catch (error) {
      setError("Failed to load links.");
      return [];
    }
  };

  const moveItem = (index, newXPosition, newYPosition) => {
    const newItems = [...items];
    const movedItem = newItems[index];
    const newIndexX = Math.floor(newXPosition / 200);
    const newIndexY = Math.floor(newYPosition / 100);

    if (newIndexX !== index || newIndexY !== index) {
      newItems.splice(index, 1);
      newItems.splice(newIndexX, 0, movedItem);
      setItems(newItems);

      localStorage.setItem("draggableItems", JSON.stringify(newItems));
    }
  };

  const updateSettings = (index, setting, value) => {
    setSettings((prev) => {
      const updatedSettings = { ...prev };
      if (!updatedSettings[index]) {
        updatedSettings[index] = {};
      }
      updatedSettings[index][setting] = value;

      localStorage.setItem("settings", JSON.stringify(updatedSettings));
      return updatedSettings;
    });
  };

  return (
    <div className="relative -space-y-12 min-h-screen">
      <button
        onClick={() => setLocked((prev) => !prev)} // Toggle global lock
        className="absolute top-full mt-16 right-4 p-2 bg-indigo-500 text-white rounded-full"
      >
        {locked ? <FaLock /> : <FaLockOpen />}
      </button>

      {loadingCategories ? (
        <p className="justify-center  text-gray-600">Loading categories...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <div className="grid space-y-auto w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-3">
          {items.map((categoryItem, index) => {
            const categorySettings = settings[index] || {
              bgcolor: "#f8f9fa",
              textColor: "#000",
              viewMode: "list",
              position: "center",
            };

            return (
              <DraggableDropdown
                key={categoryItem.id}
                category={categoryItem.newCategory || categoryItem.name}
                fetchLinks={fetchLinks}
                cachedLinks={cachedLinks}
                setCachedLinks={setCachedLinks}
                index={index}
                moveItem={moveItem}
                isDraggable={true}
                isLocked={locked} // Apply global lock here
                settings={categorySettings}
                updateSettings={updateSettings}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
export default ShowLinks;
