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

// Default color values
const DEFAULT_PRIMARY_COLOR = "#28283a";
const DEFAULT_SECONDARY_COLOR = "#513a7a";

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  // Add state for primary and secondary colors
  const [primaryColor, setPrimaryColor] = useState(() => {
    const savedPrimaryColor = localStorage.getItem("primaryColor");
    return savedPrimaryColor || DEFAULT_PRIMARY_COLOR;
  });

  const [secondaryColor, setSecondaryColor] = useState(() => {
    const savedSecondaryColor = localStorage.getItem("secondaryColor");
    return savedSecondaryColor || DEFAULT_SECONDARY_COLOR;
  });

  // Force update function with a more reliable approach
  const [updateKey, setUpdateKey] = useState(0);
  const forceUpdate = useCallback(() => {
    setUpdateKey((prev) => prev + 1);
  }, []);

  // Keep track of theme change timestamp for components to check
  const themeChangeTimestamp = useRef(Date.now());

  // Apply colors to CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", primaryColor);
    document.documentElement.style.setProperty(
      "--secondary-color",
      secondaryColor
    );

    // Save to localStorage
    localStorage.setItem("primaryColor", primaryColor);
    localStorage.setItem("secondaryColor", secondaryColor);

    // Save to Firestore if user is logged in
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      updateDoc(userDocRef, {
        primaryColor,
        secondaryColor,
      }).catch((error) => console.error("Error updating colors:", error));
    }

    // Trigger a theme changed event
    themeChangeTimestamp.current = Date.now();
    const themeEvent = new CustomEvent("themeChanged", {
      detail: {
        isDarkMode,
        primaryColor,
        secondaryColor,
        timestamp: themeChangeTimestamp.current,
      },
    });
    window.dispatchEvent(themeEvent);

    // Force update
    forceUpdate();
  }, [primaryColor, secondaryColor, forceUpdate]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Handle theme mode
          if (userData.theme) {
            setIsDarkMode(userData.theme === "dark");
            localStorage.setItem("theme", userData.theme);
          }

          // Handle custom colors
          if (userData.primaryColor) {
            setPrimaryColor(userData.primaryColor);
            localStorage.setItem("primaryColor", userData.primaryColor);
          }

          if (userData.secondaryColor) {
            setSecondaryColor(userData.secondaryColor);
            localStorage.setItem("secondaryColor", userData.secondaryColor);
          }
        } else {
          await setDoc(userDocRef, {
            theme: isDarkMode ? "dark" : "light",
            primaryColor,
            secondaryColor,
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
      detail: {
        isDarkMode,
        primaryColor,
        secondaryColor,
        timestamp: themeChangeTimestamp.current,
      },
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
  }, [isDarkMode, forceUpdate, primaryColor, secondaryColor]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  // Add color update functions
  const updatePrimaryColor = useCallback((color) => {
    setPrimaryColor(color);
  }, []);

  const updateSecondaryColor = useCallback((color) => {
    setSecondaryColor(color);
  }, []);

  // Reset colors to defaults
  const resetColors = useCallback(() => {
    setPrimaryColor(DEFAULT_PRIMARY_COLOR);
    setSecondaryColor(DEFAULT_SECONDARY_COLOR);
  }, []);

  // Include updateKey in the context value to force re-renders
  const value = useMemo(
    () => ({
      isDarkMode,
      toggleTheme,
      primaryColor,
      secondaryColor,
      updatePrimaryColor,
      updateSecondaryColor,
      resetColors,
      themeChangeTimestamp: themeChangeTimestamp.current,
      updateKey,
    }),
    [
      isDarkMode,
      toggleTheme,
      primaryColor,
      secondaryColor,
      updatePrimaryColor,
      updateSecondaryColor,
      resetColors,
      updateKey,
    ]
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
      const { isDarkMode, primaryColor, secondaryColor } = useTheme();
      callbackRef.current({
        isDarkMode,
        primaryColor,
        secondaryColor,
        timestamp: Date.now(),
      });
    }

    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);
};

// New hook for components that need to force re-render on theme change
export const useThemeAware = () => {
  const { isDarkMode, updateKey, primaryColor, secondaryColor } = useTheme();
  const [, forceRender] = useState(0);

  useEffect(() => {
    const handleThemeChange = () => {
      forceRender((prev) => prev + 1);
    };

    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  return { isDarkMode, updateKey, primaryColor, secondaryColor };
};
