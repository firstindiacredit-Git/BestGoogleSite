import {
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const DesignContext = createContext();

function DesignContextProvider({ children }) {
  const [simple, setIsSimple] = useState(() => {
    const savedDesign = localStorage.getItem("design");
    return savedDesign === "true";
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setIsSimple(false);
        localStorage.setItem("design", "false");
      }
    });

    return () => unsubscribe();
  }, []);

  const changeSimple = useCallback(() => {
    setIsSimple((prev) => {
      const newValue = !prev;
      localStorage.setItem("design", String(newValue));
      return newValue;
    });
  }, []);

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
