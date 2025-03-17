import {
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
const DesignContext = createContext();

function DesignContextProvider({ children }) {
  const [simple, setIsSimple] = useState(() => {
    localStorage.getItem("design") === "true";
  });

  const changeSimple = useCallback(() => {
    setIsSimple((prev) => {
      const newValue = !prev;

      localStorage.setItem("design", newValue);
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
