import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { FaSun, FaMoon, FaHome } from "react-icons/fa";
import { TbGridDots } from "react-icons/tb";
import galleryupload from "/galleryupload.png";
import layers from "/layers.png";
import remove from "/remove.png";
import { IoIosLogOut } from "react-icons/io";
import { RiUserLine } from "react-icons/ri";
import { MdAddHomeWork } from "react-icons/md";
import { Modal, Input } from 'antd';
import { CiEdit } from "react-icons/ci";

const Header = ({ isDarkMode, toggleTheme, handleImageChange, onPageNameChange }) => {
  const [showButtons, setShowButtons] = useState(false);
  const [user, setUser] = useState(null);
  const [panel, setPanel] = useState(false);
  const [showHomeDropdown, setShowHomeDropdown] = useState(false);
  const [pages, setPages] = useState(() => {
    const savedPages = localStorage.getItem('customPages');
    return savedPages ? JSON.parse(savedPages) : [];
  });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          username: currentUser.username || null,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const togglePanel = () => setPanel(!panel);

  const toggleMenu = () => setShowButtons(!showButtons);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.setItem("imageTrue", false);
      window.location.reload();
    } catch (error) {
      console.error("Sign out error:", error.message);
    }
  };

  const createNewPage = () => {
    const newPageNumber = pages.length + 1;
    const newPage = {
      id: Date.now(),
      name: `Page ${newPageNumber}`,
      widgets: []
    };
    
    const updatedPages = [...pages, newPage];
    setPages(updatedPages);
    localStorage.setItem('customPages', JSON.stringify(updatedPages));
    
    navigate(`/NewSearchPage?pageId=${newPage.id}`);
    setShowHomeDropdown(false);
  };

  const handlePageClick = (pageId) => {
    navigate(`/NewSearchPage?pageId=${pageId}`);
    setShowHomeDropdown(false);
  };

  const deletePage = (pageId, event) => {
    event.stopPropagation();
    const pageToDelete = pages.find(page => page.id === pageId);
    
    Modal.confirm({
      title: 'Delete Page',
      content: `Are you sure you want to delete "${pageToDelete.name}"?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        const updatedPages = pages.filter(page => page.id !== pageId);
        setPages(updatedPages);
        localStorage.setItem('customPages', JSON.stringify(updatedPages));
        
        const urlParams = new URLSearchParams(window.location.search);
        const currentPageId = urlParams.get('pageId');
        if (currentPageId === pageId.toString()) {
          navigate('/');
        }
      }
    });
  };

  const handlePageNameEdit = (pageId, currentName, event) => {
    event.stopPropagation();
    Modal.confirm({
      title: 'Edit Page Name',
      content: (
        <Input
          defaultValue={currentName}
          id="pageNameInput"
          placeholder="Enter new page name"
        />
      ),
      onOk() {
        const newName = document.getElementById('pageNameInput').value;
        if (newName.trim()) {
          const updatedPages = pages.map(page =>
            page.id === pageId ? { ...page, name: newName.trim() } : page
          );
          setPages(updatedPages);
          localStorage.setItem('customPages', JSON.stringify(updatedPages));
          onPageNameChange && onPageNameChange(pageId, newName.trim());
        }
      }
    });
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        !event.target.closest(".menu-buttons") &&
        !event.target.closest(".menu-icon")
      ) {
        setShowButtons(false);
      }

      if (
        !event.target.closest(".user-panel") &&
        !event.target.closest(".user-avatar")
      ) {
        setPanel(false);
      }

      if (!event.target.closest(".home-dropdown") && !event.target.closest(".home-button")) {
        setShowHomeDropdown(false);
      }
    };

    const handleScroll = () => {
      setShowButtons(false);
      setPanel(false);
    };

    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="p-2 bg-white/70 dark:bg-black/70 backdrop-blur-lg flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center space-x-2">
        <div className="relative">
          <button 
            className="h-10 w-10 rounded-2xl home-button"
            onClick={() => setShowHomeDropdown(!showHomeDropdown)}
          >
            <FaHome className="text-red-500 h-10 w-7 text-center justify-center m-auto" />
          </button>
          
          {showHomeDropdown && (
            <div className="absolute left-0 mt-2 w-40 bg-white shadow-lg rounded-lg text-sm dark:bg-gray-700 home-dropdown">
              <Link to="/">
                <button className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600 rounded transition-colors duration-200">
                  <FaHome />
                  <span>Home</span>
                </button>
              </Link>
              <button 
                onClick={createNewPage}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600 rounded transition-colors duration-200"
              >
                <MdAddHomeWork />
                <span>Add New Page</span>
              </button>
              
              {pages.map(page => (
                <button
                  key={page.id}
                  onClick={() => handlePageClick(page.id)}
                  className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600 rounded transition-colors duration-200 group"
                >
                  <div className="flex items-center gap-2">
                    <MdAddHomeWork />
                    <span className="hover:cursor-text" onClick={(e) => handlePageNameEdit(page.id, page.name, e)}>
                      {page.name}
                    </span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                    <button
                      onClick={(e) => handlePageNameEdit(page.id, page.name, e)}
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-600"
                    >
                      <CiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => deletePage(page.id, e)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <Link to="/">
          <span className="text-green-500 dark:text-green-300">Best</span>
          <span className="text-red-500 dark:text-red-300">Google</span>
          <span className="text-yellow-500 dark:text-yellow-300">Sites</span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <span className="text-sm mr-2 dark:text-white">
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={toggleTheme}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white border border-gray-300 rounded-full transition-transform peer-checked:translate-x-5 dark:border-gray-600"></div>
          </label>
        </div>

        <div className="-mb-2 -mt-2">
          <div
            onClick={toggleMenu}
            className="cursor-pointer flex justify-end menu-icon"
          >
            <TbGridDots className="w-8 h-8 hover:border dark:text-white border-slate-400 p-1 m-2 rounded-full" />
          </div>

          {showButtons && (
            <div className="absolute right-1 top-14 bg-white/10 p-3 w-70 mr-2 shadow-lg rounded-2xl menu-buttons">
              <div className="grid grid-cols-2 gap-1">
                <label
                  className="cursor-pointer text-xs p-1 rounded items-center justify-center"
                  htmlFor="image-upload"
                >
                  <img
                    src={galleryupload}
                    alt="Upload"
                    className="h-9 w-9 m-auto"
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
                  onClick={() => {
                    localStorage.removeItem("backgroundImage");
                    setShowButtons(false);
                    window.location.reload();
                  }}
                  className="text-xs -mr-4 p-1 w-32 rounded grid items-center justify-center"
                >
                  <img src={remove} alt="Remove" className="h-9 w-9 m-auto" />
                  <span className="dark:text-white">Remove Image</span>
                </button>
                <Link to="/NewSearchPage">
                  <img
                    src={layers}
                    alt="Customize"
                    className="h-9 w-9 m-auto"
                  />
                  <span className="text-xs p-1 dark:text-white w-28 rounded m-auto grid items-center justify-center">
                    Customize Widgets
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {user ? (
          <div className="relative">
            <div
              onClick={togglePanel}
              className="flex items-center cursor-pointer user-avatar"
            >
              <img
                src={user.photoURL || "/default-avatar.png"}
                alt="User Avatar"
                className="h-8 w-8 rounded-full border border-gray-300 dark:border-gray-500"
              />
            </div>

            {panel && (
              <div className="absolute right-0 mt-2 w-60 py-2 bg-white shadow-lg rounded-lg text-sm dark:bg-gray-700 user-panel">
                <div className="px-4 py-2 text-center dark:text-white">
                  <p className="font-bold">
                    {user.username || user.displayName || "User"}
                  </p>
                  <p>{user.email}</p>
                </div>
                <hr className="my-2 border-gray-200 dark:border-gray-600" />
                <Link to="/ProfilePage">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-center text-sm text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600 rounded transition-colors duration-200">
                    <RiUserLine />
                    <span>Profile</span>
                  </button>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-center text-sm text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600 rounded transition-colors duration-200"
                >
                  <IoIosLogOut />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex space-x-4">
            <Link
              to="/signin"
              className="px-2 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition-colors duration-200 dark:border-blue-300 dark:text-blue-300 dark:hover:bg-blue-300"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-2 py-1 border border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-white transition-colors duration-200 dark:border-green-300 dark:text-green-300 dark:hover:bg-green-300"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
