import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import AnimatedTooltipPreview from "./AnimatedTooltipPreview";
import Anotherpage from "../components/Anotherpage";
import { TbGridDots } from "react-icons/tb";
import galleryupload from "/galleryupload.png";
import remove from "/remove.png";
import "./style.css";

function SearchPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [showButtons, setShowButtons] = useState(false);

  
  useEffect(() => {
    const storedBackgroundImage = localStorage.getItem("backgroundImage");
    const storedTheme = localStorage.getItem("themeMode");

    if (storedBackgroundImage) {
      setBackgroundImage(storedBackgroundImage);
    }
    if (storedTheme === "dark") {
      setIsDarkMode(true);
    }
  }, []); 
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("themeMode", newMode ? "dark" : "light");
      return newMode;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setBackgroundImage(imageData);
        localStorage.setItem("backgroundImage", imageData); // Store background image in localStorage
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackground = () => {
    setBackgroundImage("");
    localStorage.removeItem("backgroundImage"); 
  };

  const handleIconClick = () => {
    setShowButtons(!showButtons);
  };

  // Google search script
  useEffect(() => {
    const script = document.createElement("script");
    script.id = "google-cse";
    script.src = "https://cse.google.com/cse.js?cx=80904074a37154829";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      className={`${
        isDarkMode ? "bg-gray-900 text-white" : "bg-zinc-100 text-black"
      } min-h-screen h-full`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <div className="mt-4">
      
        <div
          onClick={handleIconClick}
          className="cursor-pointer flex m-2 mr-3 justify-end"
        >
          <TbGridDots className="w-8 h-8 hover:border border-slate-400 p-1 m-2 shadow-lg rounded-full" />
        </div>

        
        {showButtons && (
          <div className="absolute right-10 top-20 bg-white/10 p-4 w-80 mr-2 shadow-lg rounded-md">
            <div className="flex flex-row">
              
       
              <label
                className="cursor-pointer text-xs p-1 rounded  grid items-center justify-center"
                htmlFor="image-upload"
              >
                <img
                  src={galleryupload}
                  alt="Upload"
                  className="h-9 w-9 m-auto " 
                />
                <span>Change Image</span>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                onClick={removeBackground}
                className="text-xs p-1 w-32 rounded  grid items-center justify-center "
                style={{ textAlign: "center" }}
              >
                <img src={remove} alt="Remove" className="h-9 w-9 m-auto" />{" "}
     
                <span>Remove Image</span>
              </button>
            </div>
          </div>
        )}

  
        <div className="flex flex-col items-center mt-[1vh]">
          <img
            src={isDarkMode ? "GoogleBlack.png" : "GoogleWhite.png"}
            alt="Google Logo"
            className="mb-4 h-16"
          />
          <div className="gcse-searchbox-only" />
          <AnimatedTooltipPreview />
        </div>

        
        <Anotherpage
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          backgroundImage={backgroundImage}
        />
      </div>
    </div>
  );
}

export default SearchPage;
