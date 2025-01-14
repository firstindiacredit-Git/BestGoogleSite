import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { FaSun, FaMoon, FaHome, FaArrowLeft } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { RiUserLine } from "react-icons/ri";
import { MdAddHomeWork } from "react-icons/md";
import { Modal, Input } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { CiEdit } from "react-icons/ci";

const Header = ({
  isDarkMode,
  toggleTheme,
  onPageNameChange,
  textColor,
  goBack,
}) => {
  const [showButtons, setShowButtons] = useState(false);
  const [user, setUser] = useState(null);
  const [panel, setPanel] = useState(false);
  const [showHomeDropdown, setShowHomeDropdown] = useState(false);
  const [pages, setPages] = useState(() => {
    const savedPages = localStorage.getItem("customPages");
    return savedPages ? JSON.parse(savedPages) : [];
  });
  const navigate = useNavigate();
  const Back = () => {
    navigate("/search");
  };

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

  // const toggleMenu = () => setShowButtons(!showButtons);

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
      widgets: [],
    };

    const updatedPages = [...pages, newPage];
    setPages(updatedPages);
    localStorage.setItem("customPages", JSON.stringify(updatedPages));

    navigate(`/NewSearchPage?pageId=${newPage.id}`);
    setShowHomeDropdown(false);
  };

  const handlePageClick = (pageId) => {
    navigate(`/NewSearchPage?pageId=${pageId}`);
    setShowHomeDropdown(false);
  };

  const deletePage = (pageId, event) => {
    event.stopPropagation();
    const pageToDelete = pages.find((page) => page.id === pageId);

    Modal.confirm({
      title: "Delete Page",
      content: `Are you sure you want to delete "${pageToDelete.name}"?`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        const updatedPages = pages.filter((page) => page.id !== pageId);
        setPages(updatedPages);
        localStorage.setItem("customPages", JSON.stringify(updatedPages));

        const urlParams = new URLSearchParams(window.location.search);
        const currentPageId = urlParams.get("pageId");
        if (currentPageId === pageId.toString()) {
          navigate("/");
        }
      },
    });
  };

  const handlePageNameEdit = (pageId, currentName, event) => {
    event.stopPropagation();
    Modal.confirm({
      title: "Edit Page Name",
      content: (
        <Input
          defaultValue={currentName}
          id="pageNameInput"
          placeholder="Enter new page name"
        />
      ),
      onOk() {
        const newName = document.getElementById("pageNameInput").value;
        if (newName.trim()) {
          const updatedPages = pages.map((page) =>
            page.id === pageId ? { ...page, name: newName.trim() } : page
          );
          setPages(updatedPages);
          localStorage.setItem("customPages", JSON.stringify(updatedPages));
          onPageNameChange && onPageNameChange(pageId, newName.trim());
        }
      },
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

      if (
        !event.target.closest(".home-dropdown") &&
        !event.target.closest(".home-button")
      ) {
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
    <header className="p-2 bg-gray-200/10 backdrop-blur-xl dark:bg-[#513a7a]/10 border-b border dark:border-gray-800/20 border-gray-200/20 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center space-x-2">
        {user && (
          <div className="relative">
            {goBack ? (
              <button
                className="bg-indigo-500 py-1.5 px-4 flex items-center gap-2 rounded home-button"
                onClick={Back}
              >
                <FaArrowLeft className="h-2 w-3 text-white" />
                <span className="text-white">Back</span>
              </button>
            ) : (
              <button
                className="bg-indigo-500 py-1.5 px-2.5 rounded home-button"
                onClick={() => setShowHomeDropdown(!showHomeDropdown)}
              >
                <MenuOutlined className="h-2 w-3 text-white" />{" "}
                <span className="text-white">Pages</span>
              </button>
            )}

            {showHomeDropdown && (
              <div className="absolute left-0 mt-2 w-40 bg-white shadow-lg rounded-lg text-sm dark:bg-[#513a7a] home-dropdown">
                <Link to="/search">
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors duration-200"
                    style={{ color: textColor }}
                  >
                    <FaHome style={{ color: textColor }} />
                    <span style={{ color: textColor }}>Home</span>
                  </button>
                </Link>
                <button
                  onClick={createNewPage}
                  className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600 rounded transition-colors duration-200"
                >
                  <MdAddHomeWork />
                  <span>Add New Page</span>
                </button>

                {pages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => handlePageClick(page.id)}
                    className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600 rounded transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-2">
                      <MdAddHomeWork />
                      <span
                        className="hover:cursor-text"
                        onClick={(e) =>
                          handlePageNameEdit(page.id, page.name, e)
                        }
                      >
                        {page.name}
                      </span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                      <button
                        onClick={(e) =>
                          handlePageNameEdit(page.id, page.name, e)
                        }
                        className="text-indigo-500 hover:text-indigo-700 dark:text-blue-400 dark:hover:text-indigo-600"
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
        )}
      </div>

      <div className="flex relative mx-auto justify-center">
        <img
          src={`${
            isDarkMode ? "/BrowseyFullDark2.svg" : "/BrowseyFullDark.svg"
          }`}
          className="w-40 drop-shadow-sm"
          alt="Browsey"
        />
      </div>

      <div className="flex items-center justify-between w-fit gap-4 space-x-4">
        <div
          onClick={toggleTheme}
          className="flex items-center text-sm dark:hover:bg-gray-800/20 transition-all hover:bg-gray-200/80 p-2 cursor-pointer rounded-md"
          style={{ color: textColor }}
        >
          {isDarkMode ? (
            <FaMoon className="w-5 h-5" style={{ color: textColor }} />
          ) : (
            <FaSun className="w-5 h-5" style={{ color: textColor }} />
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
              <div className="absolute right-0 mt-2 w-60 py-2 bg-white shadow-lg rounded-lg text-sm dark:bg-[#513a7a] user-panel">
                <div className="px-4 py-2 text-center dark:text-white">
                  <p className="font-bold">
                    {user.username || user.displayName || "User"}
                  </p>
                  <p>{user.email}</p>
                </div>
                <hr className="my-2 border-gray-200 dark:border-gray-600" />
                <Link to="/Profile">
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
          <div className="flex space-x-2">
            <Link
              to="/signin"
              className="px-2 py-1 border  text-white bg-green-500 border-green-500 dark:border-green-500 rounded hover:bg-green-600  transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-2 py-1 border text-white bg-blue-500 border-blue-500 dark:border-gray-500 rounded hover:bg-blue-600 transition-colors duration-200"
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
