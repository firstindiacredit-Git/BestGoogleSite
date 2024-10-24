import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { FaSun, FaMoon } from "react-icons/fa";

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [panel, setPanel] = useState(false);
  const [user, setUser] = useState(null);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", !isDarkMode ? "dark" : "light");
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const userProfile = {
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
        };
        setUser(userProfile);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const panelClicker = () => {
    setPanel(!panel);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      alert("You have been signed out.");
    } catch (error) {
      console.error("Sign out error:", error.message);
    }
  };

  return (
    <header className="p-2 bg-white/10 dark:bg-black/10 backdrop-blur-lg shadow-md flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center space-x-2">
        <span className="text-green-500 dark:text-green-300">Best</span>
        <span className="text-red-500 dark:text-red-300">Google</span>
        <span className="text-yellow-500 dark:text-yellow-300">Sites</span>

        <Link to="/PremiumPage">
          <button className="border ml-5 border-blue-500 text-blue-500 px-3 py-1 rounded hover:bg-blue-500 hover:text-white transition-colors duration-200 dark:border-blue-300 dark:text-blue-300 dark:hover:bg-blue-300">
            Premium
          </button>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {/* Dark Mode Toggle Switch */}
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

        {user ? (
          <div className="relative">
            <div
              onClick={panelClicker}
              className="flex items-center cursor-pointer"
            >
              <img
                src={user.photoURL || "/default-avatar.png"}
                alt="User Avatar"
                className="h-8 w-8 rounded-full border border-gray-300 dark:border-gray-500"
              />
            </div>

            {panel && (
              <div className="absolute right-0 mt-2 w-48 py-2 bg-white shadow-lg rounded-lg text-sm dark:bg-gray-700">
                <div className="px-4 py-2 text-center dark:text-white">
                  <p className="font-bold">{user.displayName || "User"}</p>
                  <p>{user.email}</p>
                </div>
                <hr className="my-2 border-gray-200 dark:border-gray-600" />
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-center text-sm text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600 rounded transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex space-x-2">
            <Link to="/signin">
              <button className="px-4 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition-colors duration-200 dark:border-blue-300 dark:text-blue-300 dark:hover:bg-blue-300">
                Sign In
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-4 py-1 border border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-white transition-colors duration-200 dark:border-green-300 dark:text-green-300 dark:hover:bg-green-300">
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
