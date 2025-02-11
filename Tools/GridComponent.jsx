import React from "react";
import { Link } from "react-router-dom";

const GridComponent = ({ path, name, icon, onToolUse }) => {
  const handleClick = () => {
    const usedTools = JSON.parse(localStorage.getItem("usedTools") || "[]");
    if (!usedTools.includes(path)) {
      usedTools.push(path);
      localStorage.setItem("usedTools", JSON.stringify(usedTools));
      if (onToolUse) onToolUse();
    }
  };

  return (
    <Link to={path} className="block group" onClick={handleClick}>
      <div className="bg-white dark:bg-[#513a7a] p-4 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-transparent mb-3">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
              {icon}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white text-center">
            {name}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default GridComponent;
