import React from "react";
import NotePage from "./NotePage";
import TodoComponent from "./TodoComponent";
import "react-quill/dist/quill.snow.css";
import Excel from "./Excel";


const NotebookAndDocumentSheet = () => {
  return (
    <div className="dark:bg-[#080318]/50 bg-gray-200/10 w-fit mx-auto rounded-t-lg border border-gray-200 dark:border-gray-800 min-h-screen p-4">
      <div className="max-w-[1600px] mx-auto space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main NotePage section - 8 columns on large screens */}
          <div className="lg:col-span-8 border dark:border-gray-700 bg-white border-gray-200 dark:bg-[#080318] rounded-lg  overflow-hidden">
            <NotePage inNotebookSheet={true} />
          </div>
          
          {/* Todo section - 4 columns on large screens */}
          <div className="lg:col-span-4 border dark:border-gray-700 border-gray-200 bg-white dark:bg-indigo-800 rounded-lg  overflow-hidden">
            <TodoComponent inNotebookSheet={true} />
          </div>
        </div>
        <div className="overflow-hidden">
          <Excel/>
        </div>
      </div>
    </div>
  );
};

export default NotebookAndDocumentSheet;
