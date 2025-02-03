import React from "react";
import { Link } from "react-router-dom";

const ButtonComponent = ({ path, name, icon, onToolUse }) => {
  const handleClick = () => {
    // Store tool usage in localStorage
    const usedTools = JSON.parse(localStorage.getItem("usedTools") || "[]");
    if (!usedTools.includes(path)) {
      usedTools.push(path);
      localStorage.setItem("usedTools", JSON.stringify(usedTools));
      if (onToolUse) onToolUse();
    }
  };

  return (
    <Link to={path} className="block mb-2 group" onClick={handleClick}>
      <div className="flex items-center justify-start bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors duration-200">
          {icon}
        </div>
        <span className="ml-3 text-gray-700 font-medium group-hover:text-gray-900">
          {name}
        </span>
      </div>
    </Link>
  );
};

export default ButtonComponent;
