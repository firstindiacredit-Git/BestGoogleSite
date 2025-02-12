import React from "react";
import { useLocation } from "react-router-dom";
import SearchPage from "./SearchPage";

const ToolWrapper = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      {/* SearchPage at the top */}
      <div className="w-full">
        <SearchPage isToolPage={true} />
      </div>

      {/* Tool content below */}
      <div className="w-[90vw] mx-auto mt-6 pb-6">{children}</div>
    </div>
  );
};

export default ToolWrapper;
