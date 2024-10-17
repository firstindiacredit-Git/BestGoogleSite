import React from "react";
import AddList from "./Calculator";
import Notepad from "./Notepad";
import ShowLinks from "./ShowLinks";
import Calendar from "./Calendar";
import ImageUploader from "./ImageUploader";
import PopularBookmarks from "./PopularBookmarks";
import Weather from "./Weather";

const Anotherpage = ({ isDarkMode, toggleTheme, backgroundImage }) => {
  return (
    <div
      className={`mt-[13vh] ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
      }`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <h1 className="text-2xl py-3 font-bold text-center">COMPONENTS</h1>
      <ShowLinks />

      
      <div className="flex flex-col md:flex-row justify-between w-full gap-4">
       
          <div className="w-full md:w-1/2 lg:w-1/2 p-2">
            <AddList />
            <Notepad />
          </div>
      

        
          <div className="w-full  p-2">
            <PopularBookmarks />
          </div>
       

       
          <div className="w-full md:w-1/2 lg:w-1/2 p-2">
            <ImageUploader />
            <Weather />
            <Calendar />
          </div>
       
      </div>

      <div className="flex justify-center mt-4">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded ${
            isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
          }`}
        >
          Switch to {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </div>
  );
};

export default Anotherpage;
