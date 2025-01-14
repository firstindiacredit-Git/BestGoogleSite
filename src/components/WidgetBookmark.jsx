import React, { useState } from "react";

const BookmarksPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("social");

  const bookmarksData = [
    {
      id: 1,
      category: "social",
      name: "Facebook",
      url: "https://facebook.com",
      favicon: "https://www.facebook.com/favicon.ico",
    },
    {
      id: 2,
      category: "social",
      name: "Twitter",
      url: "https://twitter.com",
      favicon: "https://www.twitter.com/favicon.ico",
    },
    {
      id: 3,
      category: "popular",
      name: "Google",
      url: "https://google.com",
      favicon: "https://www.google.com/favicon.ico",
    },
    {
      id: 4,
      category: "news",
      name: "BBC News",
      url: "https://bbc.com",
      favicon: "https://www.bbc.com/favicon.ico",
    },
    {
      id: 5,
      category: "ai",
      name: "OpenAI",
      url: "https://openai.com",
      favicon: "https://www.openai.com/favicon.ico",
    },
    {
      id: 6,
      category: "shopping",
      name: "Amazon",
      url: "https://amazon.com",
      favicon: "https://www.amazon.com/favicon.ico",
    },
  ];

  const categories = ["social", "popular", "news", "ai", "shopping"];

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const filteredBookmarks = bookmarksData.filter(
    (bookmark) => bookmark.category === selectedCategory
  );

  return (
    <div className="container bg-transparent mx-auto p-4 border mt-5 rounded-sm">
      {/* Category Tabs */}
      <div className="flex justify-center space-x-4 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-2 py-1 rounded-xs font-semibold transition duration-200 ${
              selectedCategory === category
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-indigo-500 hover:text-white"
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookmarks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredBookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="bg-white rounded-sm shadow-lg overflow-hidden hover:shadow-xl transition duration-300"
          >
            <div className="p-3 flex flex-col items-center">
              <a href={bookmark.url} className="text-center">
                <img
                  src={bookmark.favicon}
                  alt={bookmark.name}
                  className="w-8 h-8 justify-center m-auto rounded-full mb-2"
                />
                <h3 className="text-sm font-semibold text-gray-800 -mb-2">
                  {bookmark.name}
                </h3>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookmarksPage;
