import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Header from "./Header";

const NotFound = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [transparency, setTransparency] = useState(() =>
    parseInt(localStorage.getItem("bgTransparency") || "85")
  );
  const overlayStyles = useMemo(
    () => ({
      opacity: transparency / 100,
      zIndex: 0,
    }),
    [transparency]
  );
  return (
    <>
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <div
        className={`fixed inset-0 ${
          isDarkMode
            ? "bg-gradient-to-r from-[#1a1a2e] via-[#2a243f] to-[#1a1a2e]"
            : "bg-gradient-to-r from-indigo-200 via-blue-100 to-indigo-200"
        } transition-colors duration-300`}
        style={overlayStyles}
      >
        <div className="h-screen flex items-center justify-center ">
          {console.log(isDarkMode)}
          <div className="text-center px-4">
            <h1 className="text-9xl font-bold text-gray-800 dark:text-white mb-4">
              404
            </h1>
            <h2 className="text-3xl font-semibold text-gray-700 dark:text-white mb-6">
              Oops! Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-white text-xl max-w-lg mx-auto mb-8">
              We don't have this page, but we have other things worth finding
              out!
            </p>
            <Link
              to="/search"
              className="inline-block bg-indigo-500   text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors duration-300"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
