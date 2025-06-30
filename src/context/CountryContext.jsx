import React, { createContext, useContext, useState } from "react";

const CountryContext = createContext();

export const CountryProvider = ({ children }) => {
  // Default to USA
  const [country, setCountry] = useState({
    key: "us",
    flag: "https://flagcdn.com/us.svg",
    name: "USA"
  });

  return (
    <CountryContext.Provider value={{ country, setCountry }}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => useContext(CountryContext); 