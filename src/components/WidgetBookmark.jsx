import React from "react";
import { useTheme } from "../context/ThemeContext";

const WidgetBookmark = ({ bookmark }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`widget-bookmark ${isDarkMode ? "dark" : ""}`}>
      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className="bookmark-link"
      >
        <img
          src={
            bookmark.favicon ||
            `https://www.google.com/s2/favicons?domain=${bookmark.url}`
          }
          alt=""
          className="bookmark-favicon"
        />
        <span className="bookmark-title">{bookmark.title}</span>
      </a>
    </div>
  );
};

export default WidgetBookmark;
