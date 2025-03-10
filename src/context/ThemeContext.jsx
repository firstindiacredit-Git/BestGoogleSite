import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  // Force update function with a more reliable approach
  const [updateKey, setUpdateKey] = useState(0);
  const forceUpdate = useCallback(() => {
    setUpdateKey((prev) => prev + 1);
  }, []);

  // Keep track of theme change timestamp for components to check
  const themeChangeTimestamp = useRef(Date.now());

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

    // Update timestamp for theme change
    themeChangeTimestamp.current = Date.now();

    // Force widget updates with a more specific event
    const themeEvent = new CustomEvent("themeChanged", {
      detail: { isDarkMode, timestamp: themeChangeTimestamp.current },
    });
    window.dispatchEvent(themeEvent);

    // Force a re-render of all components using the theme
    forceUpdate();

    // Update theme in database
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      updateDoc(userDocRef, {
        theme: isDarkMode ? "dark" : "light",
      }).catch((error) => console.error("Error updating theme:", error));
    }
  }, [isDarkMode, forceUpdate]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  // Include updateKey in the context value to force re-renders
  const value = useMemo(
    () => ({
      isDarkMode,
      toggleTheme,
      themeChangeTimestamp: themeChangeTimestamp.current,
      updateKey,
    }),
    [isDarkMode, toggleTheme, updateKey]
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

// Enhanced hook to subscribe to theme changes with more reliable updates
export const useThemeUpdate = (callback) => {
  const callbackRef = useRef(callback);

  // Keep the callback reference updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleThemeChange = (event) => {
      if (callbackRef.current) {
        // Pass theme data to the callback
        callbackRef.current(event.detail);
      }
    };

    window.addEventListener("themeChanged", handleThemeChange);

    // Immediately call the callback once to ensure initial state is correct
    if (callbackRef.current) {
      const { isDarkMode } = useTheme();
      callbackRef.current({ isDarkMode, timestamp: Date.now() });
    }

    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);
};

// New hook for components that need to force re-render on theme change
export const useThemeAware = () => {
  const { isDarkMode, updateKey } = useTheme();
  const [, forceRender] = useState(0);

  useEffect(() => {
    const handleThemeChange = () => {
      forceRender((prev) => prev + 1);
    };

    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  return { isDarkMode, updateKey };
};
