import React, { useState, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import CustomColorPicker from "./CustomColorPicker";
import { FaPalette, FaUndo, FaCheck } from "react-icons/fa";

const ThemeColorSettings = () => {
  const {
    primaryColor,
    secondaryColor,
    updatePrimaryColor,
    updateSecondaryColor,
    resetColors,
  } = useTheme();

  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
  const [showSecondaryPicker, setShowSecondaryPicker] = useState(false);
  const [primarySuccess, setPrimarySuccess] = useState(false);
  const [secondarySuccess, setSecondarySuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const primaryRef = useRef(null);
  const secondaryRef = useRef(null);

  // Determine if a color is light or dark to set contrasting text
  const isLightColor = (color) => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  };

  // Handler for primary color change
  const handlePrimaryColorChange = (color) => {
    updatePrimaryColor(color);
    setPrimarySuccess(true);
    setTimeout(() => setPrimarySuccess(false), 2000);
  };

  // Handler for secondary color change
  const handleSecondaryColorChange = (color) => {
    updateSecondaryColor(color);
    setSecondarySuccess(true);
    setTimeout(() => setSecondarySuccess(false), 2000);
  };

  // Handler for reset
  const handleReset = () => {
    resetColors();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
  };

  return (
    <div className="p-6 border-t border-gray-800">
      <div className="mb-4">
        <h3 className="font-semibold dark:text-white mb-2">Theme Colors</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Customize the primary and secondary colors of the application. Changes
          will be applied immediately.
        </p>
      </div>

      {/* Primary Color Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Primary Color (Dark Backgrounds)
          {primarySuccess && (
            <span className="ml-2 text-green-500 inline-flex items-center">
              <FaCheck className="mr-1" size={12} /> Updated
            </span>
          )}
        </label>
        <div className="flex items-center space-x-4">
          <div className="relative" ref={primaryRef}>
            <button
              onClick={() => setShowPrimaryPicker(!showPrimaryPicker)}
              className="w-16 h-10 border rounded flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
              style={{
                backgroundColor: primaryColor,
                color: isLightColor(primaryColor) ? "#000" : "#fff",
                borderColor: isLightColor(primaryColor)
                  ? "rgba(0,0,0,0.2)"
                  : "rgba(255,255,255,0.2)",
              }}
            >
              <FaPalette />
            </button>
            {showPrimaryPicker && (
              <CustomColorPicker
                color={primaryColor}
                onChange={handlePrimaryColorChange}
                onClose={() => setShowPrimaryPicker(false)}
              />
            )}
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => handlePrimaryColorChange(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              placeholder="#28283a"
            />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Used for dark UI elements like header backgrounds and card
            backgrounds in dark mode.
          </p>
        </div>
      </div>

      {/* Secondary Color Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Secondary Color (Accent Elements)
          {secondarySuccess && (
            <span className="ml-2 text-green-500 inline-flex items-center">
              <FaCheck className="mr-1" size={12} /> Updated
            </span>
          )}
        </label>
        <div className="flex items-center space-x-4">
          <div className="relative" ref={secondaryRef}>
            <button
              onClick={() => setShowSecondaryPicker(!showSecondaryPicker)}
              className="w-16 h-10 border rounded flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
              style={{
                backgroundColor: secondaryColor,
                color: isLightColor(secondaryColor) ? "#000" : "#fff",
                borderColor: isLightColor(secondaryColor)
                  ? "rgba(0,0,0,0.2)"
                  : "rgba(255,255,255,0.2)",
              }}
            >
              <FaPalette />
            </button>
            {showSecondaryPicker && (
              <CustomColorPicker
                color={secondaryColor}
                onChange={handleSecondaryColorChange}
                onClose={() => setShowSecondaryPicker(false)}
              />
            )}
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={secondaryColor}
              onChange={(e) => handleSecondaryColorChange(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              placeholder="#513a7a"
            />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Used for accent elements, buttons, and interactive components.
          </p>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mb-6 p-4 rounded-lg border dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Preview
        </h4>
        <div className="flex flex-col space-y-3">
          <div
            className="p-3 rounded-md transition-colors shadow-sm"
            style={{
              backgroundColor: primaryColor,
              color: isLightColor(primaryColor) ? "black" : "white",
            }}
          >
            Primary Color Background
          </div>
          <div
            className="p-3 rounded-md transition-colors shadow-sm"
            style={{
              backgroundColor: secondaryColor,
              color: isLightColor(secondaryColor) ? "black" : "white",
            }}
          >
            Secondary Color Background
          </div>
          <div className="p-3 rounded-md bg-white dark:bg-gray-800 shadow-sm">
            <button
              className="px-4 py-2 rounded-md text-white transition-colors shadow-sm"
              style={{ backgroundColor: secondaryColor }}
            >
              Button with Secondary Color
            </button>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors text-gray-700 dark:text-gray-200"
        >
          {resetSuccess ? (
            <>
              <FaCheck size={14} className="text-green-500" />
              <span>Colors Reset!</span>
            </>
          ) : (
            <>
              <FaUndo size={14} />
              <span>Reset to Defaults</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ThemeColorSettings;
