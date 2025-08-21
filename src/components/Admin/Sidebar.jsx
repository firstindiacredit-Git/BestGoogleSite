import React, { useEffect, useState, useContext } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { LuLayoutDashboard, LuUsers } from "react-icons/lu";
import { MdOutlineAddLink, MdBook, MdOutlineRateReview  } from "react-icons/md";
import { IoSettingsOutline, IoSunny, IoMoon, IoLogOut } from "react-icons/io5";
import { RiBloggerLine, RiImageLine } from "react-icons/ri";
import { BarChart3 } from "lucide-react";
import { signOut } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useTheme } from "../../context/ThemeContext";

export default function Sidebar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dispName, setDispName] = useState("");
  const [link, setLink] = useState("/default-avatar.png");
  const { isDarkMode, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAdminBanner, setShowAdminBanner] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.role === "admin") {
              setIsAdmin(true);
              setLink(userData.photoURL || "/default-avatar.png");
              setDispName(userData.displayName || "User");
            } else {
              navigate("../Admin/login");
            }
          } else {
            console.error("User document does not exist");
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      } else {
        navigate("../Admin/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const fetchBannerPreference = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setShowAdminBanner(userDoc.data().showAdminBanner !== false);
        }
      }
    };
    fetchBannerPreference();
  }, []);

  const toggleAdminBanner = async () => {
    if (auth.currentUser) {
      const newValue = !showAdminBanner;
      setShowAdminBanner(newValue);
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userDocRef, { showAdminBanner: newValue }, { merge: true });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Navigation items with their corresponding paths and icons
  const navItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: LuLayoutDashboard,
    },
    {
      path: "/admin/users",
      label: "Users",
      icon: LuUsers,
    },
    {
      path: "/admin/AddLinks",
      label: "Add Category",
      icon: MdOutlineAddLink,
    },
    {
      path: "/admin/AddBookmark",
      label: "Add Shortcuts",
      icon: MdOutlineAddLink,
    },
    {
      path: "/admin/bookmark-analytics",
      label: "Bookmark Analytics",
      icon: BarChart3,
    },
    {
      path: "/admin/BlogList",
      label: "Blog List",
      icon: MdOutlineAddLink,
    },
    {
      path: "/admin/AddBlog",
      label: "Add Blogs",
      icon: RiBloggerLine,
    },
    {
      path: "/admin/Review",
      label: "User Review",
      icon: MdOutlineRateReview,
    },
    {
      path: "/admin/adminImages",
      label: "Admin Images",
      icon: RiImageLine,
    },
    {
      path: "/admin/addsubcatbookmark",
      label: "Subcategory Bookmarks",
      icon: RiImageLine,
    },
  ];

  return (
    <div className="flex">
      <div className="w-[18rem] fixed left-0 top-0 h-screen bg-white dark:bg-[#37375d] border-r border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            Admin Panel
          </h1>
        </div>

        {/* Profile Section */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={link}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-lg"
                alt="Avatar"
              />
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800"></div>
            </div>
            <span className="mt-3 font-medium text-gray-900 dark:text-white">
              {dispName}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Administrator
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={index}
                to={item.path}
                className={`
                  flex items-center px-4 py-3 rounded-sm transition-all duration-200
                  ${
                    isActive
                      ? "bg-gray-100 dark:bg-[#513a7a] text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                />
                <span className="ml-3 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <button
              onClick={handleLogout}
              className="w-full flex items-center  px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/20 rounded-sm transition-colors duration-200"
            >
              <span>
                <IoLogOut />
              </span>
              Logout
            </button>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800/20 transition p-2 rounded"
              >
                <IoSettingsOutline className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>

              {showDropdown && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-[#513a7a] rounded-sm shadow-lg overflow-hidden">
                  <div className="py-1">
                    <button
                      onClick={toggleTheme}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      {isDarkMode ? (
                        <>
                          <IoSunny className="w-4 h-4 mr-2 text-yellow-300" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <IoMoon className="w-4 h-4 mr-2 text-indigo-500" />
                          Dark Mode
                        </>
                      )}
                    </button>
                    <button
                      onClick={toggleAdminBanner}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <span
                        className={`w-4 h-4 mr-2 ${
                          showAdminBanner ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {showAdminBanner ? "✓" : "×"}
                      </span>
                      Show Admin Banner
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 ml-[18rem] bg-gray-100 dark:bg-[#28283A]">
        <Outlet />
      </div>
    </div>
  );
}
