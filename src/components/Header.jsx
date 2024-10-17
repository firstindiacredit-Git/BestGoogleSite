// src/components/Header.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const Header = ({ isDarkMode, toggleTheme }) => {
  const [panel, setPanel] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const userProfile = {
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          // uid: currentUser.uid,
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
    <header
      className={`flex items-center justify-between p-2 transition-colors duration-300 backdrop-blur-lg ${
        isDarkMode ? "bg-black/20 text-white" : "bg-white/10 text-black"
      }`}
    >
      <div className="flex items-center space-x-2">
        <span className="text-green-500 dark:text-green-300">Best</span>
        <span className="text-red-500 dark:text-red-300">Google</span>
        <span className="text-yellow-500 dark:text-yellow-300">Sites</span>

        <Link to="/PremiumPage">
          <button className="border ml-5 border-blue-500 text-blue-500 px-2 rounded">
            Premium
          </button>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="mr-1 text-sm flex items-center space-x-1 transition-colors duration-200"
        >
          {isDarkMode ? (
            <>
              <span>🌞</span> <span>Light Mode</span>
            </>
          ) : (
            <>
              <span>🌙</span> <span>Dark Mode</span>
            </>
          )}
        </button>

        {user ? (
          <div className="relative">
            <div
              onClick={panelClicker}
              className="flex items-center mr-1 cursor-pointer"
            >
              <img
                src={user.photoURL || "/default-avatar.png"}
                alt="User Avatar"
                className="h-[30px] w-[30px] rounded-full border border-gray-300 dark:border-gray-600 transition"
              />
            </div>

            {panel && (
              <div className="absolute right-0 mt-2 min-w-48 mr-10 py-2 bg-white/30 backdrop-blur-md shadow-md rounded-lg text-sm transition-colors duration-200">
                <div className="px-4 py-2 text-center">
                  <p className="font-bold">{user.displayName || "User"}</p>
                  <p>{user.email}</p>
                  {/* <p className="text-xs text-gray-500">UID: {user.uid}</p> */}
                </div>
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={handleSignOut}
                  className="w-full text-left flex justify-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex space-x-2">
            <Link to="/signin">
              <button className="px-4 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition-colors duration-200">
                Sign In
              </button>
            </Link>

            <Link to="/signup">
              <button className="px-4 py-1 border border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-white transition-colors duration-200">
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
