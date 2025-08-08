import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { FaSun, FaMoon, FaArrowLeft } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { RiUserLine, RiAdminLine } from "react-icons/ri";
import { Modal, Input, Dropdown, message, Alert } from "antd";
import {
  MenuOutlined,
  HomeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
} from "@ant-design/icons";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { FaCrown } from "react-icons/fa";
import Signin from "./Signup/signin.jsx";
import Signup from "./Signup.jsx";
import { useTheme } from "../context/ThemeContext";
import {
  getCustomPages,
  createCustomPage,
  updateCustomPage,
  deleteCustomPage,
  syncLocalPagesToFirebase
} from "../firebase/customPages";
import { useCountry } from "../context/CountryContext";
import { useAuth } from '../context/AuthContext.jsx';

const Header = ({ onPageNameChange, goBack, designChange, designContext }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { country: selectedCountry, setCountry: setSelectedCountry } = useCountry();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [user, setUser] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [isAdmin, setIsAdmin] = useState(false);
  const [panel, setPanel] = useState(false);
  const [pages, setPages] = useState([]);
  const [currentPageName, setCurrentPageName] = useState("Home");
  const navigate = useNavigate();
  const location = useLocation();
  const MAX_PAGES = 3; // Maximum allowed pages for free users
  const [showAdminBanner, setShowAdminBanner] = useState(true);
  const [showGoogleApps, setShowGoogleApps] = useState(false);
  const { logout } = useAuth();

  // Check if current page is balance sheet related
  const isBalanceSheetPage = location.pathname.includes('/balancesheet') || location.pathname.includes('/sheet/');

  const countries = [
    {
      key: "us",
      flag: "https://flagcdn.com/us.svg",
      name: "USA"
    },
    {
      key: "in",
      flag: "https://flagcdn.com/in.svg",
      name: "India"
    }
  ];

  // Load pages from Firebase or localStorage
  const loadPages = async (currentUser) => {
    if (currentUser) {
      try {
        // First try to sync any local pages to Firebase
        await syncLocalPagesToFirebase(currentUser.uid);

        // Then load pages from Firebase
        const firebasePages = await getCustomPages(currentUser.uid);
        setPages(firebasePages);
      } catch (error) {
        console.error("Error loading pages from Firebase:", error);
        // Fallback to localStorage if Firebase fails
        const savedPages = localStorage.getItem("customPages");
        if (savedPages) {
          setPages(JSON.parse(savedPages));
        }
      }
    } else {
      // For non-logged in users, use localStorage
      const savedPages = localStorage.getItem("customPages");
      if (savedPages) {
        setPages(JSON.parse(savedPages));
      }
    }
  };

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
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          username: currentUser.username || null,
        });

        // Load pages for logged in user
        await loadPages(currentUser);
      } else {
        setUser(null);
        setSubscriptionStatus("free");
        setIsAdmin(false);
        setShowAdminBanner(true);

        // Load pages for non-logged in user
        await loadPages(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const togglePanel = () => {
    setPanel(!panel);
    setShowGoogleApps(false); // Close Google Apps when toggling avatar panel
  };

  const handleGoogleAppsClick = () => {
    setShowGoogleApps(!showGoogleApps);
    setPanel(false); // Close avatar panel when toggling Google Apps
  };

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('userCredentials');
    localStorage.removeItem('username');
    
    // Call the original logout function
    logout();
    
    // Redirect to main app home
    navigate('/search');
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.setItem("imageTrue", false);
      localStorage.setItem("design", false);
      window.location.reload();
    } catch (error) {
      console.error("Sign out error:", error.message);
    }
  };

  const createNewPage = async () => {
    if (!user || !user.uid) {
      message.error("Please sign in to create pages");
      return;
    }

    if (pages.length >= MAX_PAGES) {
      message.error("You can only create up to 3 pages");
      return;
    }

    try {
      const newPageNumber = pages.length + 1;
      const pageData = {
        name: `My Page ${newPageNumber}`,
        widgets: [],
      };

      if (user && user.uid) {
        // Save to Firebase for logged in users
        const newPage = await createCustomPage(user.uid, pageData);
        setPages(prevPages => [...prevPages, newPage]);
        navigate(`/NewSearchPage?pageId=${newPage.id}`);
      } else {
        // Save to localStorage for non-logged in users
        const newPage = {
          id: Date.now(),
          name: pageData.name,
          widgets: pageData.widgets,
        };
        const updatedPages = [...pages, newPage];
        setPages(updatedPages);
        localStorage.setItem("customPages", JSON.stringify(updatedPages));
        navigate(`/NewSearchPage?pageId=${newPage.id}`);
      }
    } catch (error) {
      console.error("Error creating page:", error);
      message.error("Failed to create page. Please try again.");
    }
  };

  const handlePageClick = (pageId) => {
    navigate(`/NewSearchPage?pageId=${pageId}`);
  };

  const deletePage = async (pageId, event) => {
    event.stopPropagation();
    const pageToDelete = pages.find((page) => page.id === pageId);

    Modal.confirm({
      title: <div className="dark:text-white">Delete Page</div>,
      content: (
        <div className="dark:text-white">{`Are you sure you want to delete ${pageToDelete.name}`}</div>
      ),
      okText: <div className="dark:text-white">Yes</div>,
      cancelText: <div>No</div>,
      onOk: async () => {
        try {
          if (user && user.uid) {
            // Delete from Firebase for logged in users
            await deleteCustomPage(user.uid, pageId);
            message.success("Page deleted successfully from Firebase");
          } else {
            // Delete from localStorage for non-logged in users
            const updatedPages = pages.filter((page) => page.id !== pageId);
            localStorage.setItem("customPages", JSON.stringify(updatedPages));
            message.success("Page deleted successfully from local storage");
          }

          const updatedPages = pages.filter((page) => page.id !== pageId);
          setPages(updatedPages);

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
        } catch (error) {
          console.error("Error deleting page:", error);
          message.error("Failed to delete page. Please try again.");
        }
      },
    });
  };

  const handlePageNameEdit = async (pageId, currentName, event) => {
    event.stopPropagation();
    let newNameValue = currentName;

    let modalInstance = null;

    const onInputChange = (e) => {
      newNameValue = e.target.value;
    };

    modalInstance = Modal.confirm({
      title: <div className="dark:text-white">Edit Page Name</div>,
      content: (
        <Input
          defaultValue={currentName}
          id="pageNameInput"
          placeholder="Enter new page name"
          autoFocus
          onChange={onInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              modalInstance.destroy(); // Close the modal
              if (newNameValue.trim()) {
                updatePageName(pageId, newNameValue.trim());
              }
            }
          }}
        />
      ),
      onOk: async () => {
        const input = document.getElementById("pageNameInput");
        const newName = input ? input.value : newNameValue;
        if (newName.trim()) {
          await updatePageName(pageId, newName.trim());
        }
      },
      maskClosable: true, // Allow closing on outside click
    });

    // Helper to update the page name
    async function updatePageName(pageId, newName) {
      try {
        if (user && user.uid) {
          await updateCustomPage(user.uid, pageId, { name: newName });
        } else {
          const updatedPages = pages.map((page) =>
            page.id === pageId ? { ...page, name: newName } : page
          );
          localStorage.setItem("customPages", JSON.stringify(updatedPages));
        }
        const updatedPages = pages.map((page) =>
          page.id === pageId ? { ...page, name: newName } : page
        );
        setPages(updatedPages);
        onPageNameChange && onPageNameChange(pageId, newName);
      } catch (error) {
        console.error("Error updating page name:", error);
        message.error("Failed to update page name. Please try again.");
      }
    }
  };

  const Back = () => {
    if (location.pathname.includes('/sheet/')) {
      // If on a specific sheet page, go to balance sheet dashboard
      navigate('/balancesheetdashboard');
    } else if (location.pathname.includes('/balancesheet')) {
      // If on balance sheet dashboard or login, go to search page
      navigate('/search');
    } else {
      // For any other pages, go to search page
      navigate('/search');
    }
  };

  const setDefaultPage = async (pageId) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      message.error("Please sign in to set a default page");
      return;
    }

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const pageIdString = pageId.toString();
      
      // Update state immediately for better UX
      setDefaultPageId(pageIdString);

      await setDoc(
        userDocRef,
        {
          defaultPageId: pageIdString,
        },
        { merge: true }
      );

      message.success("Default page updated successfully");
      
      // Navigate to the new default page
      navigate(`/NewSearchPage?pageId=${pageIdString}`);
    } catch (error) {
      console.error("Error setting default page:", error);
      message.error("Failed to set default page");
      // Revert state on error
      setDefaultPageId(null);
    }
  };

  const removeDefaultPage = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      message.error("Please sign in to remove default page");
      return;
    }

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      
      await setDoc(
        userDocRef,
        {
          defaultPageId: null,
        },
        { merge: true }
      );

      setDefaultPageId(null);
      message.success("Default page removed successfully");
      
      // Navigate back to home page
      navigate("/search");
    } catch (error) {
      console.error("Error removing default page:", error);
      message.error("Failed to remove default page");
    }
  };

  const resetAllPages = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      message.error("Please sign in to reset pages");
      return;
    }

    Modal.confirm({
      title: <div className="dark:text-white">Reset All Pages</div>,
      content: (
        <div className="dark:text-white">
          Are you sure you want to delete all your custom pages? This action cannot be undone.
        </div>
      ),
      okText: <div className="dark:text-white">Yes, Reset</div>,
      cancelText: <div>Cancel</div>,
      onOk: async () => {
        try {
          // Delete all pages from Firebase
          for (const page of pages) {
            await deleteCustomPage(currentUser.uid, page.id);
          }

          // Clear default page
          const userDocRef = doc(db, "users", currentUser.uid);
          await setDoc(
            userDocRef,
            {
              defaultPageId: null,
            },
            { merge: true }
          );

          setPages([]);
          setDefaultPageId(null);
          message.success("All pages have been reset successfully");
          
          // Navigate back to home page
          navigate("/search");
        } catch (error) {
          console.error("Error resetting pages:", error);
          message.error("Failed to reset pages. Please try again.");
        }
      },
    });
  };

  const [defaultPageId, setDefaultPageId] = useState(null);
  const [showWarning, setShowWarning] = useState(true);



  useEffect(() => {
    const fetchDefaultPage = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const defaultPageId = userDoc.data().defaultPageId;
          // Ensure consistent string type for comparison
          setDefaultPageId(defaultPageId ? defaultPageId.toString() : null);
          
          // Auto-navigate to default page if user is on home page and has a default page set
          if (defaultPageId && location.pathname === "/search") {
            navigate(`/NewSearchPage?pageId=${defaultPageId.toString()}`);
          }
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
  }, [location.pathname, navigate]);

  const items = useMemo(
    () => [
      {
        key: "home",
        label: (
          <Link
            to="/search"
            style={{ color: isDarkMode ? "#f6f6f6" : "black" }}
            className="flex  w-full   items-center gap-4"
          >
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDefaultPage(page.id);
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-yellow-600 rounded"
              title={
                defaultPageId === page.id.toString()
                  ? "Default page"
                  : "Set as default"
              }
            >
              {defaultPageId === page.id.toString() ? (
                <StarFilled className="text-indigo-500" />
              ) : (
                <StarOutlined className="text-gray-500 hover:text-indigo-500" />
              )}
            </button>
            <span
              style={{ color: isDarkMode ? "#F2F2F2" : "black" }}
              onClick={() => handlePageClick(page.id)}
            >
              {page.name}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => handlePageNameEdit(page.id, page.name, e)}
                className="p-1 hover:bg-gray-100 rounded dark:hover:bg-blue-600"
              >
                <EditOutlined className="text-gray-500" />
              </button>
              <button
                onClick={(e) => deletePage(page.id, e)}
                className="p-1 hover:bg-gray-100 rounded dark:hover:bg-red-600"
              >
                <DeleteOutlined className="text-red-500" />
              </button>
            </div>
          </div>
        ),
      })),
      {
        key: "new",
        label:
          pages.length >= MAX_PAGES ? (
            <span className="text-sm text-red-500 ml-2">
              Maximum limit reached: 4
            </span>
          ) : (
            <button
              onClick={createNewPage}
              className="flex items-center gap-4 w-full dark:text-gray-200"
            >
              <PlusOutlined />
              New Page
            </button>
          ),
      },
      { type: "divider" },
      {
        key: "remove-default",
        label: (
          <button
            onClick={removeDefaultPage}
            disabled={!defaultPageId}
            className="flex items-center gap-4 w-full dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DeleteOutlined />
            Remove Default Page
          </button>
        ),
      },
      {
        key: "reset-all",
        label: (
          <button
            onClick={resetAllPages}
            disabled={pages.length === 0}
            className="flex items-center gap-4 w-full dark:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DeleteOutlined />
            Reset All Pages
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
      removeDefaultPage,
      resetAllPages,
    ]
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        !event.target.closest(".user-panel") &&
        !event.target.closest(".user-avatar") &&
        !event.target.closest(".google-apps-menu") &&
        !event.target.closest(".google-apps-button")
      ) {
        setPanel(false);
        setShowGoogleApps(false);
      }
    };

    const handleScroll = () => {
      setPanel(false);
      setShowGoogleApps(false);
    };

    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const closeLogin = () => {
    // Clean up reCAPTCHA before closing
    const script = document.getElementById("recaptcha-script-signin");
    if (script) script.remove();
    if (window.grecaptcha) {
      try {
        window.grecaptcha.reset();
      } catch (error) {
        console.error("reCAPTCHA reset error:", error);
      }
    }
    setShowLogin(false);
  };

  const closeSignup = () => {
    // Clean up reCAPTCHA before closing
    const script = document.getElementById("recaptcha-script-signup");
    if (script) script.remove();
    if (window.grecaptcha) {
      try {
        window.grecaptcha.reset();
      } catch (error) {
        console.error("reCAPTCHA reset error:", error);
      }
    }
    setShowSignup(false);
  };

  const switchToSignup = () => {
    closeLogin();
    // Small delay to ensure cleanup is complete
    setTimeout(() => setShowSignup(true), 100);
  };

  const switchToLogin = () => {
    closeSignup();
    // Small delay to ensure cleanup is complete
    setTimeout(() => setShowLogin(true), 100);
  };

  return (
    <>
      <header className=" backdrop-blur-sm  sticky top-0 z-50">
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
        {showWarning && !user && (
          <div className="w-full mx-auto mb-4 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-400 dark:border-indigo-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-indigo-400 dark:text-indigo-600 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-indigo-700 dark:text-indigo-200">
                  You are not logged in. Your layout changes will only be saved
                  locally and may be lost when clearing browser data.
                </p>
              </div>
              <div className="flex items-center gap-8">
                <button
                  onClick={() => setShowLogin(true)}
                  className="ml-4 text-sm font-medium text-indigo-700 dark:text-indigo-200 hover:text-indigo-600 dark:hover:text-indigo-300 underline"
                >
                  Login
                </button>
                <button
                  className="text-indigo-400 hover:text-indigo-600 dark:text-indigo-500 dark:hover:text-indigo-300"
                  onClick={() => setShowWarning(false)}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex p-2 justify-between items-center">
          <div className="flex  items-center space-x-2">
            {user ? (
              <div className="relative flex items-center gap-2">
                {isBalanceSheetPage && (
                  <button
                    className="bg-indigo-500 py-1.5 px-4 flex items-center gap-2 rounded home-button hover:bg-indigo-600 transition-colors"
                    onClick={Back}
                  >
                    <FaArrowLeft className="h-2 w-3 text-white" />
                    <span className="text-white">Back</span>
                  </button>
                )}
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
                    overlayClassName="mt-1 [&_.ant-dropdown-menu]:p-0 [&_.ant-dropdown-menu-item]:p-0 [&_ul]:dark:bg-[#28283a]"
                  >
                    <button className="bg-indigo-500 dark:bg-[#28283a] border-none hover:bg-indigo-600 flex items-center gap-2 px-2 py-1 rounded-md transition-all duration-200">
                      <MenuOutlined className="text-white" />
                      <span className="text-white">{currentPageName}</span>
                    </button>
                  </Dropdown>
                )}
                <div
                  className={` p-2 rounded-lg text-sm flex items-center justify-center gap-2 
                      ${subscriptionStatus === "pro"
                      ? "text-indigo-500"
                      : "text-gray-500 dark:text-gray-400"
                    }`}
                ></div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {isBalanceSheetPage && (
                  <button
                    className="bg-indigo-500 py-1 px-3 flex items-center gap-2 rounded-md home-button hover:bg-indigo-600 transition-colors"
                    onClick={() => navigate('/search')}
                  >
                    <FaArrowLeft className="h-2 w-3 text-white" />
                    <span className="text-white">Back</span>
                  </button>
                )}
                <div className="w-20"></div>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <Link
              to="/search"
              className="text-xl font-bold text-gray-800 dark:text-white"
            >
              <img src="/LOGO.svg" alt="Logo" className="h-10" />
            </Link>
          </div>

          <div className="flex items-center justify-between w-fit gap-4 space-x-4">
            {/* <Dropdown
              menu={{
                items: countries
                  .filter(country => country.key !== selectedCountry.key)
                  .map(country => ({
                    key: country.key,
                    label: (
                      <div
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => setSelectedCountry(country)}
                      >
                        <img
                          src={country.flag}
                          alt={country.name}
                          className="w-6 h-4 object-cover rounded-sm"
                        />
                        <span className="text-sm font-medium">{country.name}</span>
                      </div>
                    ),
                  })),
              }}
              trigger={["click"]}
              placement="bottomLeft"
              overlayClassName="mt-1 shadow-lg rounded-md border border-gray-200 dark:border-gray-700"
            >
              <button className="flex items-center gap-1 px-2 py-1.5 rounded-md  hover:bg-gray-200/80 dark:hover:bg-gray-800/20 transition-colors duration-200">
                <img
                  src={selectedCountry.flag}
                  alt={selectedCountry.name}
                  className="w-6 h-4 object-cover rounded-sm"
                />
                <svg
                  className="w-3 h-3 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </Dropdown> */}
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

            {user && (
              <div className="relative">

                <button
                  onClick={handleGoogleAppsClick}
                  className="flex items-center text-sm dark:hover:bg-gray-800/20 transition-all hover:bg-gray-200/80 p-2 cursor-pointer rounded-md google-apps-button"
                >
                  <svg className="w-6 h-6 " viewBox="0 0 24 24">
                    <path
                      fill={isDarkMode ? "white" : "currentColor"}
                      d="M6,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM16,6c0,1.1 0.9,2 2,2s2,-0.9 2,-2 -0.9,-2 -2,-2 -2,0.9 -2,2zM12,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2z"
                    />
                  </svg>
                </button>

                {showGoogleApps && user && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#28283A] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-500/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-blue-500 google-apps-menu">
                    <div className="backdrop-blur-sm grid grid-cols-3 gap-4">
                      <a
                        href="https://accounts.google.com"
                        className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <img
                          src={user?.photoURL || "/default-avatar.png"}
                          alt="Account"
                          className="w-10 h-10 mb-2 rounded-full"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          Account
                        </span>
                      </a>
                      <a
                        href="https://maps.google.com"
                        className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <img
                          src="/google-maps.png"
                          alt="Maps"
                          className="w-8 h-8 mb-2"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          Maps
                        </span>
                      </a>
                      <a
                        href="https://www.youtube.com"
                        className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <img
                          src="/youtube.png"
                          alt="YouTube"
                          className="w-8 h-8 mb-2"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          YouTube
                        </span>
                      </a>
                      <a
                        href="https://play.google.com"
                        className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <img
                          src="/google-play.png"
                          alt="Play"
                          className="w-8 h-8 mb-2"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          Play
                        </span>
                      </a>
                      <a
                        href="https://news.google.com"
                        className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <img
                          src="/google-news.png"
                          alt="News"
                          className="w-8 h-8 mb-2"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          News
                        </span>
                      </a>
                      <a
                        href="https://mail.google.com"
                        className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <img
                          src="/google-gmail.png"
                          alt="Gmail"
                          className="w-8 h-8 mb-2"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          Gmail
                        </span>
                      </a>
                      <a
                        href="https://meet.google.com"
                        className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <img
                          src="/google-meet.png"
                          alt="Meet"
                          className="w-8 h-8 mb-2"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          Meet
                        </span>
                      </a>

                      <a
                        href="https://docs.google.com"
                        className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <img
                          src="/google-docs.png"
                          alt="Docs"
                          className="w-8 h-8 mb-2"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          Docs
                        </span>
                      </a>
                      <a
                        href="https://sheets.google.com"
                        className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <img
                          src="/google-sheets.png"
                          alt="Sheets"
                          className="w-8 h-8 mb-2"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          Sheets
                        </span>
                      </a>

                      <a
                        href="https://keep.google.com"
                        className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <img
                          src="/google-keeps.png"
                          alt="Keep"
                          className="w-8 h-8 mb-2"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          Keep
                        </span>
                      </a>

                      <a
                        href="https://earth.google.com"
                        className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <img
                          src="/google-earth.png"
                          alt="Earth"
                          className="w-8 h-8 mb-2"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          Earth
                        </span>
                      </a>

                      <a
                        href="https://ads.google.com"
                        className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <img
                          src="/google-ads.png"
                          alt="Ads"
                          className="w-8 h-8 mb-2"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          Ads
                        </span>
                      </a>
                      <a
                        href="https://chrome.google.com/webstore"
                        className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <img
                          src="/google-chrome-webstore.png"
                          alt="Chrome Web Store"
                          className="w-8 h-8 mb-2"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          Extensions
                        </span>
                      </a>
                      <a
                        href="https://drive.google.com"
                        className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <img
                          src="/google-drive.png"
                          alt="Drive"
                          className="w-8 h-8 mb-2"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          Drive
                        </span>
                      </a>
                      <a
                        href="https://calendar.google.com"
                        className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <img
                          src="/google-calendar.png"
                          alt="Calendar"
                          className="w-8 h-8 mb-2"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          Calendar
                        </span>
                      </a>
                      <a
                        href="https://translate.google.com"
                        className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <img
                          src="/google-translate.png"
                          alt="Translate"
                          className="w-8 h-8 mb-2"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          Translate
                        </span>
                      </a>
                      <a
                        href="https://photos.google.com"
                        className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <img
                          src="/google-photos.png"
                          alt="Photos"
                          className="w-8 h-8 mb-2"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          Photos
                        </span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
            {user ? (
              <div className="relative">
                <div
                  onClick={togglePanel}
                  className="flex items-center cursor-pointer user-avatar"
                >
                  <img
                    src={user?.photoURL || "/default-avatar.png"}
                    alt="User Avatar"
                    className="h-8 w-8 rounded-full border border-gray-300 dark:border-gray-500"
                  />
                </div>

                {panel && (
                  <div className="absolute right-0 mt-2 w-60 py-2 bg-white shadow-lg rounded-lg text-sm dark:bg-[#28283a] user-panel">
                    <div className="px-4 py-2 text-center dark:text-white">
                      <p className="font-bold">
                        {user.username || user.displayName || "User"}
                      </p>
                      <div
                        className={`mt-2 text-sm flex items-center justify-center gap-2 
                      ${subscriptionStatus === "pro"
                            ? "text-indigo-500 dark:text-yellow-500"
                            : "text-gray-500 dark:text-gray-400"
                          }`}
                      >
                        <FaCrown
                          className={`${subscriptionStatus === "pro" ? "animate-pulse" : ""
                            }`}
                        />
                        <span>
                          {subscriptionStatus === "pro"
                            ? "Pro Member"
                            : "Free User"}
                        </span>
                      </div>
                    </div>
                    <hr className=" border-gray-200 dark:border-gray-600" />
                    <a href="./AllMytab.com.zip" download>
                      <div className="text-center py-2  dark:text-white dark:hover:bg-gray-800 hover:bg-gray-200 transition-all">
                        <button>Download Extension</button>
                      </div>
                    </a>

                    <div
                      onClick={() => {
                        const modal = document.createElement("div");
                        modal.className =
                          "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50";
                        modal.onclick = (e) => {
                          if (e.target === modal)
                            document.body.removeChild(modal);
                        };

                        const iframe = document.createElement("iframe");
                        iframe.src =
                          "https://www.youtube.com/embed/sStANg8CU2I";
                        iframe.className = "w-1/3 h-4/5 max-w-4xl";
                        iframe.allowFullscreen = true;

                        const closeBtn = document.createElement("button");
                        closeBtn.innerHTML = "&times;";
                        closeBtn.className =
                          "absolute top-4 right-4 text-white text-2xl font-bold";
                        closeBtn.onclick = () =>
                          document.body.removeChild(modal);

                        modal.appendChild(iframe);
                        modal.appendChild(closeBtn);
                        document.body.appendChild(modal);
                      }}
                      className="text-center py-2 dark:text-white dark:hover:bg-gray-800 hover:bg-gray-200 transition-all cursor-pointer"
                    >
                      Learn how to use?
                    </div>
                    <hr className="mb-2 border-gray-200 dark:border-gray-600" />
                    <div className="mx-auto w-fit">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={designContext}
                          className="sr-only peer"
                          onChange={designChange}
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                        <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                          {designContext ? "Minimal Mode" : "Normal Mode"}
                        </span>
                      </label>
                    </div>
                    <hr className=" border-gray-200 dark:border-gray-600" />

                    <button type="button"></button>
                    <Link to="/Profile">
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-center text-sm text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 rounded transition-colors duration-200">
                        <RiUserLine />
                        <span>Profile</span>
                      </button>
                    </Link>
                    <button
                      onClick={handleSignOut, handleLogout}
                      
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-center text-sm text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 rounded transition-colors duration-200"
                    >
                      <IoIosLogOut />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-2 py-1 border  text-white bg-green-500 border-green-500 dark:border-green-500 rounded hover:bg-green-600  transition-colors duration-200"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowSignup(true)}
                  className="px-2 py-1 border text-white bg-blue-500 border-blue-500 dark:border-gray-500 rounded hover:bg-blue-600 transition-colors duration-200"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      {showLogin && (
        <div className="fixed inset-0 backdrop-blur-md backdrop-brightness-50 z-[999]">
          <div className="flex h-screen items-center justify-center">
            <div>
              <div className="relative overflow-clip shadow-2xl shadow-gray-500/20 w-fit h-fit bg-white dark:bg-[#101020] border dark:border-gray-700 border-gray-100 rounded-3xl p-4">
                <button
                  className="dark:text-white text-black text-3xl absolute z-[999] top-5 right-5"
                  onClick={closeLogin}
                >
                  &times;
                </button>
                <div className="absolute -top-14 z-[999] left-12">
                  <img
                    src="/ShadowBlue.png"
                    className="opacity-45 w-80"
                    alt="close"
                  />
                </div>
                <Signin onSuccess={closeLogin} />
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Don't have an account?{" "}
                  <button
                    onClick={switchToSignup}
                    className="text-indigo-500 dark:text-gray-200"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {showSignup && (
        <div className="fixed inset-0 backdrop-blur-md backdrop-brightness-50 z-[999]">
          <div className="flex h-screen items-center justify-center">
            <div>
              <div className="relative overflow-clip shadow-2xl shadow-gray-500/20 w-fit h-fit bg-white dark:bg-[#101020] border dark:border-gray-700 border-gray-100 rounded-3xl p-4">
                <button
                  className="dark:text-white text-black text-3xl absolute z-[999] top-5 right-5"
                  onClick={closeSignup}
                >
                  &times;
                </button>
                <div className="absolute -top-14 z-[999] left-16">
                  <img
                    src="/ShadowBlue.png"
                    className="opacity-45 w-80"
                    alt="close"
                  />
                </div>
                <Signup />
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Already have an account?{" "}
                  <button
                    onClick={switchToLogin}
                    className="text-indigo-500 dark:text-gray-200"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;