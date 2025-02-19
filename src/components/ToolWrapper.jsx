import React from "react";
import { useLocation } from "react-router-dom";
import SearchPage from "./SearchPage";

const ToolWrapper = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#513a7a]">
      {/* SearchPage at the top */}
      <div className="w-full">
        <SearchPage isToolPage={true} />
      </div>

      {/* Tool content below */}
      <div className="w-full max-w-7xl mx-auto mt-6 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#28283a] rounded-lg shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ToolWrapper;
