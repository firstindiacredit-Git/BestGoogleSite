import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const GridComponent = ({ path, name, icon, onToolUse }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Scroll to top when the component mounts
    window.scrollTo({
      top: 0,
      behavior: "instant"
    });
  }, [location.pathname]);

  const handleClick = (e) => {
    e.preventDefault();
    const usedTools = JSON.parse(localStorage.getItem("usedTools") || "[]");
    if (!usedTools.includes(path)) {
      usedTools.push(path);
      localStorage.setItem("usedTools", JSON.stringify(usedTools));
      if (onToolUse) onToolUse();
    }
    // Force scroll to top before navigation
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    navigate(path);
  };

  return (
    <Link to={path} className="block group" onClick={handleClick}>
      <div className="bg-white/[var(--widget-opacity)] backdrop-blur-sm dark:bg-[#513a7a]/[var(--widget-opacity)] p-4 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200">
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