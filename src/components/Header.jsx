import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { FaSun, FaMoon, FaHome, FaArrowLeft } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { RiUserLine, RiAdminLine } from "react-icons/ri";
import { MdAddHomeWork } from "react-icons/md";
import { Modal, Input, Button, Dropdown, message, Alert } from "antd";
import {
  MenuOutlined,
  HomeOutlined,
  PlusOutlined,
  AppstoreOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
} from "@ant-design/icons";
import { CiEdit } from "react-icons/ci";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { FaCrown } from "react-icons/fa";

const Header = ({ isDarkMode, toggleTheme, onPageNameChange, goBack }) => {
  const [showButtons, setShowButtons] = useState(false);
  const [user, setUser] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [isAdmin, setIsAdmin] = useState(false);
  const [panel, setPanel] = useState(false);
  const [showHomeDropdown, setShowHomeDropdown] = useState(false);
  const [pages, setPages] = useState(() => {
    const savedPages = localStorage.getItem("customPages");
    return savedPages ? JSON.parse(savedPages) : [];
  });
  const [currentPageName, setCurrentPageName] = useState("Home");
  const navigate = useNavigate();
  const location = useLocation();
  const MAX_PAGES = 3; // Maximum allowed pages for free users
  const [showAdminBanner, setShowAdminBanner] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const pageId = urlParams.get("pageId");
    if (pageId) {
      const page = pages.find((p) => p.id.toString() === pageId);
      if (page) {
        setCurrentPageName(page.name);
      }
    } else {
      setCurrentPageName("Home");
    }
  }, [location.search, pages]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const userData = userDoc.data();
        setSubscriptionStatus(userData?.subscriptionStatus || "free");
        setIsAdmin(userData?.role === "admin");
        setShowAdminBanner(userData?.showAdminBanner !== false);

        setUser({
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          username: currentUser.username || null,
        });
      } else {
        setUser(null);
        setSubscriptionStatus("free");
        setIsAdmin(false);
        setShowAdminBanner(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const togglePanel = () => setPanel(!panel);

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
    if (!user) {
      message.error("Please sign in to create pages");
      return;
    }

    if (pages.length >= MAX_PAGES) {
      message.error("You can only create up to 3 pages");
      return;
    }

    const newPageNumber = pages.length + 1;
    const newPage = {
      id: Date.now(),
      name: `My Page ${newPageNumber}`,
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
      onOk: async () => {
        const updatedPages = pages.filter((page) => page.id !== pageId);
        setPages(updatedPages);
        localStorage.setItem("customPages", JSON.stringify(updatedPages));

        // Reset default page if the deleted page was default
        if (pageId.toString() === defaultPageId?.toString()) {
          const currentUser = auth.currentUser;
          if (currentUser) {
            const userDocRef = doc(db, "users", currentUser.uid);
            await setDoc(
              userDocRef,
              {
                defaultPageId: "",
              },
              { merge: true }
            );
            setDefaultPageId("");
          }
        }

        const urlParams = new URLSearchParams(window.location.search);
        const currentPageId = urlParams.get("pageId");
        if (currentPageId === pageId.toString()) {
          navigate("/search");
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

  const Back = () => {
    navigate("/search");
  };

  const setDefaultPage = async (pageId) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      message.error("Please sign in to set a default page");
      return;
    }

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      setDefaultPageId(pageId.toString());

      await setDoc(
        userDocRef,
        {
          defaultPageId: pageId,
        },
        { merge: true }
      );

      message.success("Default page updated successfully");
    } catch (error) {
      console.error("Error setting default page:", error);
      message.error("Failed to set default page");
      setDefaultPageId(null);
    }
  };

  const [defaultPageId, setDefaultPageId] = useState(null);

  useEffect(() => {
    const fetchDefaultPage = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setDefaultPageId(userDoc.data().defaultPageId);
        }
      } catch (error) {
        console.error("Error fetching default page:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchDefaultPage();
      } else {
        setDefaultPageId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const items = useMemo(
    () => [
      {
        key: "home",
        label: (
          <Link to="/search" className="flex items-center gap-2">
            <HomeOutlined />
            Home
          </Link>
        ),
      },
      { type: "divider" },
      ...pages.map((page) => ({
        key: page.id,
        label: (
          <div className="flex items-center justify-between gap-2">
            <span onClick={() => handlePageClick(page.id)}>{page.name}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDefaultPage(page.id);
                }}
                className="p-1 hover:bg-gray-100 rounded"
                title={
                  defaultPageId === page.id.toString()
                    ? "Default page"
                    : "Set as default"
                }
              >
                {defaultPageId === page.id.toString() ? (
                  <StarFilled className="text-yellow-500" />
                ) : (
                  <StarOutlined className="text-gray-500 hover:text-yellow-500" />
                )}
              </button>
              <button
                onClick={(e) => handlePageNameEdit(page.id, page.name, e)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <EditOutlined className="text-gray-500" />
              </button>
              <button
                onClick={(e) => deletePage(page.id, e)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <DeleteOutlined className="text-red-500" />
              </button>
            </div>
          </div>
        ),
      })),
      { type: "divider" },
      {
        key: "new",
        label: (
          <button
            onClick={createNewPage}
            className="flex items-center gap-2 w-full"
            disabled={pages.length >= MAX_PAGES}
          >
            <PlusOutlined />
            New Page
            {pages.length >= MAX_PAGES && (
              <span className="text-xs text-red-500 ml-2">
                (Maximum limit reached)
              </span>
            )}
          </button>
        ),
      },
    ],
    [
      pages,
      handlePageClick,
      handlePageNameEdit,
      deletePage,
      defaultPageId,
      setDefaultPage,
    ]
  );

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
    <>
      <header className=" bg-gray-200/[var(--widget-opacity)] backdrop-blur-sm dark:bg-[#513a7a]/[var(--widget-opacity)] border-b border dark:border-gray-800/20 border-gray-200/20  sticky top-0 z-50">
        {isAdmin && showAdminBanner && (
          <div className="bg-red-500/90 backdrop-blur-sm text-white py-1 px-4 text-center sticky top-0 z-50">
            <Alert
              message={
                <div className="flex items-center justify-center gap-2">
                  <RiAdminLine className="text-xl" />
                  <span className="font-semibold">Admin Mode Active</span>
                  <span className="text-sm">
                    - Please proceed with caution. Changes can affect system
                    functionality.
                  </span>
                </div>
              }
              type="error"
              showIcon={false}
              className="bg-transparent border-none text-white p-0"
              closable
            />
          </div>
        )}
        <div className="flex p-2 justify-between items-center">
          <div className="flex  items-center space-x-2">
            {user ? (
              <div className="relative flex items-center gap-2">
                {goBack ? (
                  <button
                    className="bg-indigo-500 py-1.5 px-4 flex items-center gap-2 rounded home-button"
                    onClick={Back}
                  >
                    <FaArrowLeft className="h-2 w-3 text-white" />
                    <span className="text-white">Back</span>
                  </button>
                ) : (
                  <Dropdown
                    menu={{ items }}
                    trigger={["click"]}
                    placement="bottomLeft"
                    overlayClassName="mt-1"
                  >
                    <button className="bg-indigo-500 border-none hover:bg-indigo-600 flex items-center gap-2 px-2 py-1 rounded-md transition-all duration-200">
                      <MenuOutlined className="text-white" />
                      <span className="text-white">{currentPageName}</span>
                    </button>
                  </Dropdown>
                )}
                <div
                  className={` p-2 rounded-lg text-sm flex items-center justify-center gap-2 
                      ${
                        subscriptionStatus === "pro"
                          ? "text-yellow-500"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                ></div>
              </div>
            ) : (
              <div className="w-36  "></div>
            )}
          </div>

          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold text-gray-800 dark:text-white"
            >
              <img src="/LOGO.svg" alt="Logo" className="h-10" />
            </Link>
          </div>

          <div className="flex items-center justify-between w-fit gap-4 space-x-4">
            <div
              onClick={toggleTheme}
              className="flex items-center text-sm dark:hover:bg-gray-800/20 transition-all hover:bg-gray-200/80 p-2 cursor-pointer rounded-md"
            >
              {isDarkMode ? (
                <FaSun className="w-5 h-5 text-white" />
              ) : (
                <FaMoon className="w-5 h-5 " />
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
                      <div
                        className={`mt-2 text-sm flex items-center justify-center gap-2 
                      ${
                        subscriptionStatus === "pro"
                          ? "text-yellow-500"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                      >
                        <FaCrown
                          className={`${
                            subscriptionStatus === "pro" ? "animate-pulse" : ""
                          }`}
                        />
                        <span>
                          {subscriptionStatus === "pro"
                            ? "Pro Member"
                            : "Free User"}
                        </span>
                      </div>
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
        </div>
      </header>
    </>
  );
};

export default Header;
