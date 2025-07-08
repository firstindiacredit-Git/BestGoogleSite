import React, { createContext, useContext, useState, useEffect } from "react";

const CountryContext = createContext();

export const CountryProvider = ({ children }) => {
  // Load country from localStorage or default to USA
  const [country, setCountry] = useState(() => {
    const savedCountry = localStorage.getItem("selectedCountry");
    if (savedCountry) {
      try {
        return JSON.parse(savedCountry);
      } catch (error) {
        console.error("Error parsing saved country:", error);
      }
    }
    return {
      key: "us",
      flag: "https://flagcdn.com/us.svg",
      name: "USA"
    };
  });

  // Save country to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("selectedCountry", JSON.stringify(country));
  }, [country]);

  return (
    <CountryContext.Provider value={{ country, setCountry }}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => useContext(CountryContext); 