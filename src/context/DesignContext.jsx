import {
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const DesignContext = createContext();

function DesignContextProvider({ children }) {
  // Initialize from localStorage immediately with try/catch for error handling
  const [simple, setIsSimple] = useState(() => {
    try {
      const savedDesign = localStorage.getItem("design");
      return savedDesign === "true";
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return false;
    }
  });

  // Maintain a ref to avoid unnecessary re-renders when reading in effects
  const simpleRef = useRef(simple);
  useEffect(() => {
    simpleRef.current = simple;
  }, [simple]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Only update state if needed to avoid re-renders
        if (simpleRef.current) {
          setIsSimple(false);
          localStorage.setItem("design", "false");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const changeSimple = useCallback(() => {
    setIsSimple((prev) => {
      const newValue = !prev;
      try {
        localStorage.setItem("design", String(newValue));
      } catch (error) {
        console.error("Error writing to localStorage:", error);
      }
      return newValue;
    });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      changeSimple,
      simple,
    }),
    [changeSimple, simple]
  );

  return (
    <DesignContext.Provider value={value}>{children}</DesignContext.Provider>
  );
}
export { DesignContext, DesignContextProvider };
