import React from "react";
import { Link, useNavigate } from "react-router-dom";

const ButtonComponent = ({ path, name, icon, onToolUse }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    const usedTools = JSON.parse(localStorage.getItem("usedTools") || "[]");
    if (!usedTools.includes(path)) {
      usedTools.push(path);
      localStorage.setItem("usedTools", JSON.stringify(usedTools));
      if (onToolUse) onToolUse();
    }
    navigate(path);
  };

  return (
    <Link to={path} className="block mb-2 group" onClick={handleClick}>
      <div className="flex items-center justify-start backdrop-blur-sm bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)] p-3 rounded-lg  shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50/[var(--widget-opacity)] dark:bg-gray-700/[var(--widget-opacity)] group-hover:bg-blue-50 transition-colors duration-200">
          {icon}
        </div>
        <span className="ml-3 text-gray-700 dark:text-gray-200 font-medium group-hover:text-gray-900 dark:group-hover:text-white">
          {name}
        </span>
      </div>
    </Link>
  );
};

export default ButtonComponent;
