import React, { useEffect, useState, useRef } from "react";

// Export the utility function
export function isLightColor(color) {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

const colorOptions = {
  standard: [
    "#000000", "#424242", "#666666", "#808080", "#999999", "#B3B3B3", "#CCCCCC", "#E6E6E6", "#F2F2F2", "#FFFFFF",
    "#FF0000", "#FF4500", "#FF8C00", "#FFD700", "#32CD32", "#00FF00", "#00CED1", "#0000FF", "#8A2BE2", "#FF00FF",
    "#FFB6C1", "#FFA07A", "#FFE4B5", "#FFFACD", "#98FB98", "#AFEEEE", "#87CEEB", "#E6E6FA", "#DDA0DD", "#FFC0CB",
    "#DC143C", "#FF4500", "#FFA500", "#FFD700", "#32CD32", "#20B2AA", "#4169E1", "#8A2BE2", "#9370DB", "#FF69B4",
    "#800000", "#D2691E", "#DAA520", "#808000", "#006400", "#008080", "#000080", "#4B0082", "#800080", "#C71585", "#fffacd"
  ],
  custom: []
};

const CustomColorPicker = ({ color, onChange, onClose }) => {
  const [hexInput, setHexInput] = useState("");
  const pickerRef = useRef(null);

  const handleHexInput = (e) => {
    const value = e.target.value;
    setHexInput(value);

    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onChange(value);
      setHexInput("");
      onClose();
    }
  };

  const handleHexKeyDown = (e) => {
    if (e.key === "Enter") {
      let value = hexInput;
      if (value.charAt(0) !== "#") {
        value = "#" + value;
      }
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        onChange(value);
        setHexInput("");
        onClose();
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      ref={pickerRef} 
      className="absolute z-50 bg-white border border-gray-300 rounded-sm p-4 shadow-lg w-64 bottom-full mb-2"
    >
      <div className="mb-4">
        <div className="font-bold mb-2">STANDARD</div>
        <div className="grid grid-cols-10 gap-0.5">
          {colorOptions.standard.map((c, i) => (
            <button
              key={i}
              onClick={() => {
                onChange(c);
                onClose();
              }}
              className="w-5 h-5 border border-gray-300 rounded-full cursor-pointer relative hover:scale-110 transition-transform"
              style={{ backgroundColor: c }}
              title={c}
            >
              {color === c && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs ${isLightColor(c) ? 'text-black' : 'text-white'}`}>
                    ✓
                  </span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="font-bold mb-2">ADD CUSTOM</div>
        <div className="flex gap-2  w-full">
          <input
            type="text"
            value={hexInput}
            onChange={handleHexInput}
            onKeyDown={handleHexKeyDown}
            placeholder="Enter hex code"
            className=" px-2 py-1 border border-gray-300 rounded w-[70%] focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => {
              if (/^#[0-9A-Fa-f]{6}$/.test(hexInput)) {
                onChange(hexInput);
                setHexInput("");
                onClose();
              }
            }}
            className="px-3 py-1 bg-indigo-500 text-white w-[30%] rounded hover:bg-indigo-600 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomColorPicker;