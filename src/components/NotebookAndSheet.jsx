import React from "react";
import NotePage from "./NotePage";
import TodoComponent from "./TodoComponent";
import "react-quill/dist/quill.snow.css";
import Excel from "./Excel";

const NotebookAndDocumentSheet = () => {
  return (
    <div className="dark:bg-[#28283A]/[var(--widget-opacity)] backdrop-blur-sm bg-gray-200/[var(--widget-opacity)] w-[90vw] mx-auto rounded-t-sm  min-h-screen p-4">
      <div className=" ">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main NotePage section - 8 columns on large screens */}
          <div className="lg:col-span-8 border dark:border-gray-700 bg-white border-gray-200 dark:bg-[#28283A] rounded-sm  overflow-hidden">
            <NotePage inNotebookSheet={true} />
          </div>

          {/* Todo section - 4 columns on large screens */}
          <div className="lg:col-span-4 border dark:border-gray-700 border-gray-200 bg-white dark:bg-[#513a7a] rounded-sm  overflow-hidden">
            <TodoComponent inNotebookSheet={true} />
          </div>
        </div>
        <div className="overflow-hidden mt-4">
          <Excel />
        </div>
      </div>
    </div>
  );
};

export default NotebookAndDocumentSheet;
