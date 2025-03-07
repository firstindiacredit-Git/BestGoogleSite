import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.theme) {
            setIsDarkMode(userData.theme === "dark");
            localStorage.setItem("theme", userData.theme);
          }
        } else {
          await setDoc(userDocRef, {
            theme: isDarkMode ? "dark" : "light",
            email: user.email,
            displayName: user.displayName,
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    // Force widget updates
    window.dispatchEvent(new Event("themeChanged"));

    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      updateDoc(userDocRef, {
        theme: isDarkMode ? "dark" : "light",
      }).catch((error) => console.error("Error updating theme:", error));
    }
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      isDarkMode,
      toggleTheme,
    }),
    [isDarkMode, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
