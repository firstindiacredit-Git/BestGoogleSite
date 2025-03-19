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
  // Initialize from localStorage for immediate rendering without flash
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Use a try-catch to handle localStorage errors
    try {
      const savedTheme = localStorage.getItem("theme");
      // Apply theme to document root immediately during initialization
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return savedTheme === "dark";
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return false;
    }
  });

  // Use debouncedThemeUpdate for Firestore writes to reduce database operations
  const debouncedThemeUpdateRef = useRef(null);

  // Force update function - kept more focused and only used when needed
  const [updateKey, setUpdateKey] = useState(0);
  const forceUpdate = useCallback(() => {
    setUpdateKey((prev) => prev + 1);
  }, []);

  // Keep track of theme change timestamp for components to check
  const themeChangeTimestamp = useRef(Date.now());

  // Load user theme from Firestore only once on auth state change
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.theme) {
              setIsDarkMode(userData.theme === "dark");
            }
          } else {
            // Create user doc if it doesn't exist
            await setDoc(userDocRef, {
              theme: isDarkMode ? "dark" : "light",
              email: user.email,
              displayName: user.displayName,
            });
          }
        } catch (error) {
          console.error("Error fetching user theme:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Apply theme changes to DOM and localStorage
  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }

      // Update timestamp for theme change
      themeChangeTimestamp.current = Date.now();

      // Use a more targeted custom event
      const themeEvent = new CustomEvent("themeChanged", {
        detail: { isDarkMode, timestamp: themeChangeTimestamp.current },
      });
      window.dispatchEvent(themeEvent);

      // Debounce Firestore updates to reduce writes
      if (debouncedThemeUpdateRef.current) {
        clearTimeout(debouncedThemeUpdateRef.current);
      }

      debouncedThemeUpdateRef.current = setTimeout(() => {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          updateDoc(userDocRef, {
            theme: isDarkMode ? "dark" : "light",
          }).catch((error) => console.error("Error updating theme:", error));
        }
        debouncedThemeUpdateRef.current = null;
      }, 2000); // Only update after 2 seconds of no changes
    } catch (error) {
      console.error("Error applying theme:", error);
    }
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  // Highly optimized context value with useMemo
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

// Enhanced hook to subscribe to theme changes with better performance
export const useThemeUpdate = (callback) => {
  const callbackRef = useRef(callback);

  // Keep the callback reference updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleThemeChange = (event) => {
      if (callbackRef.current) {
        callbackRef.current(event.detail);
      }
    };

    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);
};

// Optimized hook for components that need to be aware of theme changes
export const useThemeAware = () => {
  const { isDarkMode, updateKey } = useTheme();
  return { isDarkMode, updateKey };
};
