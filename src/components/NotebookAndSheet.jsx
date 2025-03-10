import React from "react";
import NotePage from "./NotePage";
import TodoComponent from "./TodoComponent";
import "react-quill/dist/quill.snow.css";
import Excel from "./Excel";

const NotebookAndDocumentSheet = () => {
  return (
    <div className="   w-[90vw] mx-auto min-h-screen p-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main NotePage section - 8 columns on large screens */}
        <div className="lg:col-span-8 overflow-hidden">
          <NotePage inNotebookSheet={true} />
        </div>

        {/* Todo section - 4 columns on large screens */}
        <div className="lg:col-span-4 overflow-hidden">
          <TodoComponent inNotebookSheet={true} />
        </div>
      </div>
      <div className="overflow-hidden mt-4">
        <Excel />
      </div>
    </div>
  );
};

export default NotebookAndDocumentSheet;
