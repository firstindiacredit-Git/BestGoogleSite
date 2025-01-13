import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaArrowUp } from "react-icons/fa";
import Header from "../components/Header";
import Shortcut from "./ShortCuts";
import Anotherpage from "../components/Anotherpage";
import PopularBookmarks from "../components/PopularBookmarks";
import NotebookAndSheet from "../components/NotebookAndSheet";
import PasswordGenerator from "../components/PasswordGenerater";
import News from "../components/News";
import Tool from "../components/Tool";
import Sports from '../components/Sports'
import Top100 from "../components/Top100";
import "./style.css";
import { Modal, Input } from 'antd';
import { CiEdit } from "react-icons/ci";

function NewSearchPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [activeComponent, setActiveComponent] = useState(null);
  const navigate = useNavigate();
  const [showButton, setShowButton] = useState(false);
  const [pageData, setPageData] = useState(null);
  const location = useLocation();

  // Theme mode effect
  useEffect(() => {
    const storedThemeMode = localStorage.getItem("themeMode");
    if (storedThemeMode) {
      setIsDarkMode(storedThemeMode === "dark");
    }
  }, []);

  // Background image effect
  useEffect(() => {
    const storedBackgroundImage = localStorage.getItem("backgroundImage");
    if (storedBackgroundImage) {
      setBackgroundImage(storedBackgroundImage);
    }
  }, []);

  // Scroll button effect
  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dark mode class effect
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const pageId = urlParams.get('pageId');
    
    if (pageId) {
      const savedPages = localStorage.getItem('customPages');
      const pages = savedPages ? JSON.parse(savedPages) : [];
      
      const currentPage = pages.find(page => page.id === parseInt(pageId));
      if (currentPage) {
        setPageData(currentPage);
      }
    }
  }, [location]);

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

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("themeMode", newMode ? "dark" : "light");
      return newMode;
    });
  };

  const handleToggleComponent = (componentName) => {
    setActiveComponent((prevComponent) =>
      prevComponent === componentName ? null : componentName
    );
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Google CSE script effect
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

  const handlePageNameEdit = () => {
    if (!pageData) return;
    
    Modal.confirm({
      title: 'Edit Page Name',
      content: (
        <Input
          defaultValue={pageData.name}
          id="pageNameInput"
          placeholder="Enter new page name"
        />
      ),
      onOk() {
        const newName = document.getElementById('pageNameInput').value;
        if (newName.trim()) {
          const savedPages = localStorage.getItem('customPages');
          const pages = savedPages ? JSON.parse(savedPages) : [];
          
          const updatedPages = pages.map(page =>
            page.id === pageData.id ? { ...page, name: newName.trim() } : page
          );
          
          localStorage.setItem('customPages', JSON.stringify(updatedPages));
          setPageData({ ...pageData, name: newName.trim() });
        }
      }
    });
  };

  const handleHeaderPageNameChange = (pageId, newName) => {
    if (pageData && pageData.id === pageId) {
      setPageData({ ...pageData, name: newName });
    }
  };

  return (
    <div className="bg-white dark:bg-[#28283A] min-h-screen pb-10">
      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        handleImageChange={handleImageChange}
        onPageNameChange={handleHeaderPageNameChange}
      />

      <div className="-mt-20">
        <div style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }} className="flex pt-24 flex-col items-center min-h-[23vw]">
          <img
            src={isDarkMode ? "GoogleBlack.png" : "GoogleWhite.png"}
            alt="Google Logo"
            className="mb-4 filter bluescale contrast-700 h-20"
          />
          <div
            className="gcse-searchbox-only"
            data-resultsurl="https://www.google.com/search?client=ms-google-coop&qcx=80904074a37154829"
            data-defaulttoimagesearch="true"
          />
          <Shortcut />
        </div>

        {/* Empty state message */}
        {pageData && (
          <div className="text-center mt-10 text-gray-600 dark:text-gray-400">
            <h2 
              className="text-2xl font-bold mb-4 group relative inline-block cursor-pointer"
              onClick={handlePageNameEdit}
            >
              {pageData.name}
              <span className="invisible group-hover:visible absolute -right-6 top-1 text-indigo-500">
                <CiEdit className="w-4 h-4" />
              </span>
            </h2>
            {pageData.widgets.length === 0 && (
              <p>This is a new page. Add widgets to customize it.</p>
            )}
          </div>
        )}
      </div>

      {pageData && (
        <Anotherpage 
        //   backgroundImage={backgroundImage}
          pageId={pageData.id.toString()}
        />
      )}
    </div>
  );
}

export default NewSearchPage;
