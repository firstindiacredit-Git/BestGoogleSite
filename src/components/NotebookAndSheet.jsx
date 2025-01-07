import React, { useState, useEffect, useRef } from "react";
import NotePage from "./NotePage";
import TodoComponent from "./TodoComponent";
import "react-quill/dist/quill.snow.css";
import Excel from "./Excel";


const NotebookAndDocumentSheet = () => {
  return (
    <div className="dark:bg-gray-900/50 bg-gray-200/50 w-fit mx-auto rounded-t-lg border border-gray-200 dark:border-gray-800 min-h-screen p-4">
      <div className="max-w-[1600px] mx-auto space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main NotePage section - 8 columns on large screens */}
          <div className="lg:col-span-8 border dark:border-gray-700 border-gray-200 dark:bg-gray-900 rounded-lg  overflow-hidden">
            <NotePage inNotebookSheet={true} />
          </div>
          
          {/* Todo section - 4 columns on large screens */}
          <div className="lg:col-span-4 border dark:border-gray-700 border-gray-200 bg-white dark:bg-gray-800 rounded-lg  overflow-hidden">
            <TodoComponent inNotebookSheet={true} />
          </div>
        </div>
        <div className="bg-white border dark:border-gray-700 border-gray-200 dark:bg-gray-800 rounded-lg  overflow-hidden">
        <h1 className="dark:text-white text-2xl mt-4 font-bold text-center ">
              Excel Sheet
            </h1>
          <Excel/>
        </div>
      </div>
    </div>
  );
};

export default NotebookAndDocumentSheet;
