import React from "react";
import { useTheme } from "../context/ThemeContext";

const NewFooter = () => {
  const currentYear = new Date().getFullYear();
  const { isDarkMode } = useTheme();

  return (
    <footer className="w-full border-t border-gray-700 dark:border-gray-700 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Logo and Brand Name */}
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            {/* Stacked Blue Squares Logo */}
            <div className="relative w-10 h-10">
              <div className="absolute w-8 h-8 bg-blue-600 rounded-sm shadow-sm transform rotate-3"></div>
              <div className="absolute w-8 h-8 bg-blue-500 rounded-sm shadow-sm top-0.5 left-0.5 transform -rotate-1"></div>
              <div className="absolute w-8 h-8 bg-blue-400 rounded-sm shadow-sm top-1 left-1 transform rotate-2"></div>
            </div>
            {/* Brand Text */}
            <div className="flex flex-col">
              <span className={`text-lg font-bold ${isDarkMode ? 'text-red' : 'text-gray-900'}`}>
                Allmytab
              </span>
            </div>
          </div>
        
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;