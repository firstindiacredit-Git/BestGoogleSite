import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const ToolOutlet = () => {
    return (
      <div className="bg-white dark:bg-[#513a7a]">
            <Header />
            <Outlet />
      </div>
    );
};

export default ToolOutlet;
