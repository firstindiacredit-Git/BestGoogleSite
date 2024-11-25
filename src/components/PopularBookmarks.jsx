import React, { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

const initialData = {
  Social: [
    { id: 1, title: "Facebook", url: "https://facebook.com" },
    { id: 2, title: "Twitter", url: "https://twitter.com" },
  ],
  Popular: [
    { id: 3, title: "Amazon", url: "https://amazon.com" },
    { id: 4, title: "YouTube", url: "https://youtube.com" },
  ],
  Travel: [
    { id: 5, title: "TripAdvisor", url: "https://tripadvisor.com" },
    { id: 6, title: "Expedia", url: "https://expedia.com" },
  ],
  Shopping: [
    { id: 7, title: "eBay", url: "https://ebay.com" },
    { id: 8, title: "Walmart", url: "https://walmart.com" },
  ],
};

const colorPalette = [
  "#ff5722",
  "#ffc107",
  "#8bc34a",
  "#00bcd4",
  "#3f51b5",
  "#9c27b0",
  "#e91e63",
  "#607d8b",
  "#ffffff",
  "#000000",
];

const BookmarkPage = () => {
  const [data] = useState(initialData);
  const [categorySettings, setCategorySettings] = useState({
    Social: {
      bgColor: "#cfe8fc",
      textColor: "#000000",
      view: "list",
      position: "start",
    },
    Popular: {
      bgColor: "#f9e1cf",
      textColor: "#000000",
      view: "grid",
      position: "middle",
    },
    Travel: {
      bgColor: "#d8f8d8",
      textColor: "#000000",
      view: "icon",
      position: "end",
    },
    Shopping: {
      bgColor: "#fef6c3",
      textColor: "#000000",
      view: "list",
      position: "start",
    },
  });
  const [menuOpen, setMenuOpen] = useState({});

  const fetchFavicon = (url) =>
    `https://www.google.com/s2/favicons?sz=64&domain=${url}`;

  const toggleMenu = (category) => {
    setMenuOpen((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const updateCategorySetting = (category, settingType, value) => {
    setCategorySettings((prev) => ({
      ...prev,
      [category]: { ...prev[category], [settingType]: value },
    }));
  };
const renderBookmarks = (category) => {
  const bookmarks = data[category];
  const { view, textColor, position } = categorySettings[category];

  // Map position to Tailwind classes
  const positionClass =
    position === "start"
      ? "justify-start"
      :""
      ? "justify-center"
      : "justify-end";

  return bookmarks.map((bookmark) => (
    <div
      className={`grid gap-1 ${
        view === "grid"
          ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          : view === "icon"
          ? "grid-cols-4"
          : "grid-cols-1"
      } ${positionClass}`}
    >
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className={`p-3 rounded shadow-sm flex flex-col items-center`}
          style={{
            color: textColor,
            textAlign: "center",
          }}
        >
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={fetchFavicon(bookmark.url)}
              alt={bookmark.title}
              className="w-8 h-8 mx-auto mb-2"
            />
            {view !== "icon" && (
              <span className="text-sm block mt-1">{bookmark.title}</span>
            )}
          </a>
        </div>
      ))}
    </div>
  ));
};

  return (
    <div className="p-4 mt-2 grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
      {Object.keys(data).map((category) => (
        <div
          key={category}
          className="p-4 rounded-lg shadow-lg relative"
          style={{
            backgroundColor: categorySettings[category]?.bgColor,
            color: categorySettings[category]?.textColor,
          }}
        >
          {/* Card Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{category}</h2>
            <div className="relative">
              <button
                onClick={() => toggleMenu(category)}
                className="px-2 py-2 rounded-full hover:bg-gray-200"
              >
                <BsThreeDotsVertical />
              </button>

              {/* Three-dot Menu */}
              {menuOpen[category] && (
                <div className="absolute top-full right-0 mt-2 w-28 bg-white border border-gray-300 rounded-lg shadow-lg z-20">
                  <div className="p-4">
                    {/* Background Color Option */}
                    <button
                      onClick={() =>
                        updateCategorySetting(
                          category,
                          "showBgColor",
                          !categorySettings[category]?.showBgColor
                        )
                      }
                      className={`w-full text-left text-sm font-medium mb-2 ${
                        categorySettings[category]?.showBgColor
                          ? "text-red-500"
                          : ""
                      }`}
                    >
                      Background
                    </button>
                    {categorySettings[category]?.showBgColor && (
                      <>
                        <div className="flex p-1 flex-wrap gap-2 mb-">
                          {colorPalette.map((color) => (
                            <button
                              key={color}
                              className="w-6 h-6 rounded-full border"
                              style={{
                                backgroundColor: color,
                                borderColor:
                                  categorySettings[category]?.bgColor === color
                                    ? "black"
                                    : "transparent",
                              }}
                              onClick={() =>
                                updateCategorySetting(
                                  category,
                                  "bgColor",
                                  color
                                )
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs">Custom Color:</span>
                        <input
                          type="color"
                          value={
                            categorySettings[category]?.bgColor || "#ffffff"
                          }
                          onChange={(e) =>
                            updateCategorySetting(
                              category,
                              "bgColor",
                              e.target.value
                            )
                          }
                          className="w-full rounded-full mb-4 cursor-pointer"
                        />
                      </>
                    )}

                    {/* Text Color Option */}
                    <button
                      onClick={() =>
                        updateCategorySetting(
                          category,
                          "showTextColor",
                          !categorySettings[category]?.showTextColor
                        )
                      }
                      className={`w-full text-left text-sm font-medium mb-2 ${
                        categorySettings[category]?.showTextColor
                          ? "text-red-500"
                          : ""
                      }`}
                    >
                      Text Color
                    </button>
                    {categorySettings[category]?.showTextColor && (
                      <>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {colorPalette.map((color) => (
                            <button
                              key={color}
                              className="w-6 h-6 rounded-full border"
                              style={{
                                backgroundColor: color,
                                borderColor:
                                  categorySettings[category]?.textColor ===
                                  color
                                    ? "black"
                                    : "transparent",
                              }}
                              onClick={() =>
                                updateCategorySetting(
                                  category,
                                  "textColor",
                                  color
                                )
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs">Custom Color:</span>
                        <input
                          type="color"
                          value={
                            categorySettings[category]?.textColor || "#000000"
                          }
                          onChange={(e) =>
                            updateCategorySetting(
                              category,
                              "textColor",
                              e.target.value
                            )
                          }
                          className="w-full rounded-2xl mb-4 cursor-pointer"
                        />
                      </>
                    )}

                    {/* View Option */}
                    <button
                      onClick={() =>
                        updateCategorySetting(
                          category,
                          "showView",
                          !categorySettings[category]?.showView
                        )
                      }
                      className={`w-full text-left text-sm font-medium mb-2 ${
                        categorySettings[category]?.showView
                          ? "text-red-500"
                          : ""
                      }`}
                    >
                      View
                    </button>
                    {categorySettings[category]?.showView && (
                      <select
                        value={categorySettings[category]?.view || "list"}
                        onChange={(e) =>
                          updateCategorySetting(
                            category,
                            "view",
                            e.target.value
                          )
                        }
                        className="w-full p-1 border rounded"
                      >
                        <option value="list">List</option>
                        <option value="grid">Grid</option>
                        <option value="icon">Icon Only</option>
                      </select>
                    )}

                    {/* Position Option */}
                    <button
                      onClick={() =>
                        updateCategorySetting(
                          category,
                          "showPosition",
                          !categorySettings[category]?.showPosition
                        )
                      }
                      className={`w-full text-left text-sm font-medium mb-2 ${
                        categorySettings[category]?.showPosition
                          ? "text-red-500"
                          : ""
                      }`}
                    >
                      Position
                    </button>
                    {categorySettings[category]?.showPosition && (
                      <div className="flex border rounded-xl flex-col">
                        <button
                          onClick={() =>
                            updateCategorySetting(category, "position", "start")
                          }
                          className="w-full text-sm font-medium mb-2"
                        >
                          Start
                        </button>
                        <button
                          onClick={() =>
                            updateCategorySetting(
                              category,
                              "position",
                              "middle"
                            )
                          }
                          className="w-full text-sm font-medium mb-2"
                        >
                          Middle
                        </button>
                        <button
                          onClick={() =>
                            updateCategorySetting(category, "position", "end")
                          }
                          className="w-full text-sm font-medium mb-2"
                        >
                          End
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bookmarks */}
          <div
            className={`grid gap-4 justify-${categorySettings[category]?.position}`}
          >
            {renderBookmarks(category)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookmarkPage;
