import React, { useRef, useEffect } from 'react';
import { isLightColor } from '../utils/colorUtils';

const predefinedColors = [
  "#000000", "#424242", "#666666", "#808080", "#999999", "#B3B3B3", "#CCCCCC", "#E6E6E6", "#F2F2F2", "#FFFFFF",
  "#FF0000", "#FF4500", "#FF8C00", "#32CD32", "#00FF00", "#00CED1", "#0000FF", "#8A2BE2", "#FF00FF",
  "#FFB6C1", "#FFA07A", "#FFE4B5", "#FFFACD", "#98FB98", "#AFEEEE", "#87CEEB", "#E6E6FA", "#DDA0DD", "#FFC0CB",
  "#DC143C", "#FFA500", "#FFD700", "#20B2AA", "#4169E1", "#9370DB", "#FF69B4"
];

const ColorPicker = ({ color = '#ffffff', onChange, onClose }) => {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleColorSelect = (selectedColor) => {
    onChange(selectedColor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={pickerRef}
        className="bg-white dark:bg-[#513a7a] border dark:border-gray-700 border-gray-300 rounded-sm p-4 shadow-lg w-72"
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">Choose Color</h3>
          <button
            onClick={() => handleColorSelect('auto')}
            className="w-full py-2 px-3 text-sm bg-gray-100 dark:bg-[#513a7a] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            Auto Theme Color
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {predefinedColors.map((c) => (
            <button
              key={c}
              onClick={() => handleColorSelect(c)}
              className="w-8 h-8 rounded border dark:border-gray-600 border-gray-200 cursor-pointer transition duration-300 ease-in-out transform hover:scale-110 focus:outline-none relative"
              style={{ backgroundColor: c }}
              title={c}
            >
              {color === c && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-lg ${isLightColor(c) ? 'text-black' : 'text-white'}`}>
                    ✓
                  </span>
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1 dark:text-white">Custom Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorSelect(e.target.value)}
            className="w-full h-10 p-0 border dark:border-gray-600 border-gray-300 rounded cursor-pointer focus:outline-none"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 text-sm bg-gray-100 dark:bg-[#513a7a] text-gray-700 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => handleColorSelect(color)}
            className="px-4 py-2 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
