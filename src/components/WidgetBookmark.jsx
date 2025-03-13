import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Select, Button, Tooltip } from "antd";
import { ColumnHeightOutlined, SaveOutlined } from "@ant-design/icons";

const WidgetBookmark = ({ bookmark, collapsed = false }) => {
  const { isDarkMode } = useTheme();
  const [columns, setColumns] = useState(4); // Default to 4 columns
  const [savedMessage, setSavedMessage] = useState("");

  // Load column preference from localStorage on component mount
  useEffect(() => {
    const savedColumns = localStorage.getItem("bookmark_columns");
    if (savedColumns) {
      setColumns(parseInt(savedColumns, 10));
    }
  }, []);

  // Save column preference to localStorage
  const handleColumnChange = (value) => {
    setColumns(value);
    localStorage.setItem("bookmark_columns", value.toString());
    setSavedMessage("Column preference saved!");

    // Clear the saved message after 2 seconds
    setTimeout(() => {
      setSavedMessage("");
    }, 2000);
  };

  if (collapsed) {
    return (
      <div className={`widget-bookmark-collapsed ${isDarkMode ? "dark" : ""}`}>
        <div className="bookmark-settings">
          <Select
            defaultValue={columns}
            style={{ width: 120 }}
            onChange={handleColumnChange}
            options={[
              { value: 1, label: "1 Column" },
              { value: 2, label: "2 Columns" },
              { value: 3, label: "3 Columns" },
              { value: 4, label: "4 Columns" },
              { value: 5, label: "5 Columns" },
              { value: 6, label: "6 Columns" },
            ]}
          />
          {savedMessage && (
            <span className="saved-message">{savedMessage}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`widget-bookmark ${isDarkMode ? "dark" : ""}`}>
      <div className="bookmark-content">
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

      <div className="bookmark-settings">
        <Tooltip title="Change number of columns">
          <Select
            defaultValue={columns}
            style={{ width: 120 }}
            onChange={handleColumnChange}
            options={[
              { value: 1, label: "1 Column" },
              { value: 2, label: "2 Columns" },
              { value: 3, label: "3 Columns" },
              { value: 4, label: "4 Columns" },
              { value: 5, label: "5 Columns" },
              { value: 6, label: "6 Columns" },
            ]}
            dropdownStyle={{ zIndex: 1100 }}
          />
        </Tooltip>
        {savedMessage && <span className="saved-message">{savedMessage}</span>}
      </div>
    </div>
  );
};

export default WidgetBookmark;
