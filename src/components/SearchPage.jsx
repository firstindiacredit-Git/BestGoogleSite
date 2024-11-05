import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import AnimatedTooltipPreview from "./AnimatedTooltipPreview";
import Anotherpage from "../components/Anotherpage";
import { TbGridDots } from "react-icons/tb";
import galleryupload from "/galleryupload.png";
import layers from "/layers.png";
import remove from "/remove.png";
import { Link, useNavigate } from "react-router-dom";
import "./style.css";

function SearchPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [showButtons, setShowButtons] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedBackgroundImage = localStorage.getItem("backgroundImage");
    

    if (storedBackgroundImage) {
      setBackgroundImage(storedBackgroundImage);
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
        localStorage.setItem("backgroundImage", imageData);
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
  }, [navigate]);

  return (
    <div
      className="bg-zinc-100 dark:bg-[#060d1c] min-h-screen h-full"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <div className="mt-6">
        <div
          onClick={handleIconClick}
          className="cursor-pointer flex m-1 mr-3 justify-end"
        >
          <TbGridDots className="w-8 h-8 hover:border dark:text-white border-slate-400 p-1 m-2 shadow-lg rounded-full" />
        </div>
        {showButtons && (
          <div className="absolute right-10 top-20 bg-white/10 p-4 w-70 mr-2 shadow-lg rounded-2xl">
            <div className="grid grid-cols-2 gap-1">
              <label
                className="cursor-pointer text-xs p-1 rounded items-center justify-center"
                htmlFor="image-upload"
              >
                <img
                  src={galleryupload}
                  alt="Upload"
                  className="h-9 w-9 m-auto "
                />
                <span className="text-xs dark:text-white p-1 w-28 rounded grid items-center justify-center">
                  Change Image
                </span>
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
                className="text-xs p-1 w-32 rounded grid items-center justify-center "
                style={{ textAlign: "center" }}
              >
                <img src={remove} alt="Remove" className="h-9 w-9 m-auto" />
                <span className="dark:text-white">Remove Image</span>
              </button>
              <Link to="/">
                <img src={layers} alt="Upload" className="h-9 w-9 m-auto " />
                <span className="text-xs p-1 dark:text-white w-28 rounded m-auto grid items-center justify-center ">
                  Customize Widgets
                </span>
              </Link>
            </div>
          </div>
        )}
        <div className="flex flex-col items-center mt-[1vh]">
          <img
            src={isDarkMode ? "GoogleBlack.png" : "GoogleWhite.png"} // Adjusted for dark mode condition
            alt="Google Logo"
            className="mb-4 h-16"
          />
          <div className="gcse-searchbox-only" />
          <AnimatedTooltipPreview />
        </div>

        <Anotherpage
          backgroundImage={backgroundImage}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
}

export default SearchPage;
