import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Image,
} from "antd";
import { FaTh } from "react-icons/fa";
import { FaList } from "react-icons/fa";
import sportsmen from "./sportsmen.json";
import brands from "./brand.json";
import bikes from "./bikes.json";
import gdp from "./gdp.json";
import banks from "./bank.json";
import cars from "./car.json";
import "./ToastifyNotification.css";
import SkeletonLoader from "./SkeletonLoader";

const { Title } = Typography;

const Top100Page = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("motorcycles");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);
  const searchBarRef = useRef(null);
  const year = new Date().getFullYear();
  const filteredItems = items
    .map((item, index) => ({
      ...item,
      originalIndex: index,
    }))
    .filter(
      (item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        "" ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ""
    );

  const mainCategories = [
    { key: "motorcycles", label: "Bikes" },
    { key: "crypto", label: "Crypto" },
    { key: "stocks", label: "Stocks" },
    { key: "billionaires", label: "Billionaires" },
    { key: "sportsmen", label: "Sports" },
    { key: "movies", label: "Movies" },
  ];

  const additionalCategories = [
    { key: "brands", label: "Brands" },
    { key: "gdp", label: "GDP" },
    { key: "cars", label: "Cars" },
    { key: "banks", label: "Banks" },
  ];

  const fetchTop100 = async (category) => {
    try {
      setLoading(true);
      if (["sportsmen", "brands", "motorcycles", "gdp", "banks", "cars", "billionaires"].includes(category)) {
        if (category === "sportsmen") {
          const processedData = sportsmen.map((person) => ({
            name: `${person.name} ${" "} $${(
              person.contract_value_usd / 1000000
            ).toFixed(1)}M`,
            description: `Sport: ${person.sport}, Contract: ${person.length_of_contract}`,
          }));
          setItems(processedData);
          setError(null);
          setLoading(false);
          return;
        }

        if (category === "brands") {
          const processedData = brands.map((brand) => ({
            logo: brand.logo || null,
            name: brand.Brand,
            description: `Rank: ${brand.Rank}, Change: ${brand.Change}, Value: ${brand.Value}`,
            value: `$${brand.Value}M`,
          }));
          setItems(processedData);
          setError(null);
          setLoading(false);
          return;
        }

        if (category === "motorcycles") {
          const processedData = bikes.motorcycles.map((bike) => ({
            name: bike.motorcycle,
            description: `Year: ${bike.model_year}, Time: ${bike.time_seconds}s, Mph Speed: ${bike.speed_mph}mph, Kmh Speed: ${bike.speed_kmh}km/h`,
            image: bike.logo,
          }));
          setItems(processedData);
          setError(null);
          setLoading(false);
          return;
        }

        if (category === "gdp") {
          const processedData = gdp.GDP_by_country.map((country) => ({
            name: country.Country,
            logo: country.logo || null,
            description: `IMF Forecast (${country.IMF?.Year || "N/A"}): $${(
              country.IMF?.Forecast / 1000
            ).toFixed(2)}T\n                          World Bank (${country.World_Bank?.Year || "N/A"}): $${(country.World_Bank?.Estimate / 1000).toFixed(
              2
            )}T\n                          UN (${country.United_Nations?.Year || "N/A"}): $${(
              country.United_Nations?.Estimate / 1000
            ).toFixed(2)}T`,
            value: country.IMF?.Forecast
              ? `$${(country.IMF.Forecast / 1000).toFixed(2)}T`
              : "N/A",
          }));
          setItems(processedData);
          setError(null);
          setLoading(false);
          return;
        }

        if (category === "banks") {
          const processedData = banks.map((bank) => ({
            name: bank.name,
            description: `Country: ${bank.country}, Stock Price: ${bank.stock_price}, Founded: ${bank.founded}`,
            image: bank.icon_url || null,
            value: `#${bank.rank}`,
          }));
          setItems(processedData);
          setError(null);
          setLoading(false);
          return;
        }

        if (category === "cars") {
          const processedData = cars.map((car) => ({
            name: car.name,
            description: `Country: ${car.country}, CEO: ${car.ceo}, Foounded: ${car.founded}`,
            image: car.icon_url || null,
            value: `#${car.rank}`,
          }));
          setItems(processedData);
          setError(null);
          setLoading(false);
          return;
        }

        if (category === "billionaires") {
          // Fetch from public folder
          const response = await fetch("/billionaires.json");
          const data = await response.json();
          const list = Array.isArray(data.personsLists) ? data.personsLists : [];
          const processedData = list.map((person) => ({
            name: person.personName,
            description: `Net Worth: $${(parseInt(person.finalWorth) / 1000).toFixed(1)}B, Source: ${person.source}, Country: ${person.countryOfCitizenship}`,
            image: person.person?.squareImage || null,
            value: person.finalWorth,
            rank: person.rank,
          }));
          setItems(processedData);
          setError(null);
          setLoading(false);
          return;
        }
      }

      // Handle crypto category with CoinGecko API
      if (category === "crypto") {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const processedData = data.map((coin) => ({
          name: coin.name,
          image: coin.image,
          value: `$${coin.current_price?.toLocaleString() || "N/A"}`,
          marketCap: `$${(coin.market_cap / 1000000000).toFixed(2)}B`,
          change24h: `${coin.price_change_percentage_24h?.toFixed(2) || "N/A"}%`,
        }));
        setItems(processedData);
        setError(null);
        setLoading(false);
        return;
      }

      // Handle movies category with IMDB RapidAPI
      if (category === "movies") {
        const response = await fetch(
          "https://imdb-top-100-movies.p.rapidapi.com/",
          {
            headers: {
              "x-rapidapi-key": "3751719246mshae6c08f97e9873fp141a5ajsncde31041dcdb",
              "x-rapidapi-host": "imdb-top-100-movies.p.rapidapi.com",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const processedData = data.map((movie) => ({
          name: movie.title,
          // description: `Year: ${movie.year || "N/A"}, Rating: ${movie.rating || "N/A"}, Director: ${movie.director || "N/A"}`,
          image: movie.image || null,
          value: movie.rating ? `${movie.rating}/10` : "N/A",
          year: movie.year || "N/A",
          imdb_link: movie.imdb_link || "N/A",
          // description: movie.description || "N/A"
        }));
        setItems(processedData);
        setError(null);
        setLoading(false);
        return;
      }

      // Handle other categories with existing backend API
      // Yahoo Finance Most Actives for stocks
      if (category === "stocks") {
        const response = await fetch(`https://bgs-backend.vercel.app/api/top100/stocks?year=${year}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Adjust this mapping based on the structure returned by your backend
        const processedData = data.map((stock) => ({
          name: stock.name || stock.symbol,
          description: `Price: $${stock.price}\nChange: ${stock.change} (${stock.changePercent}%)`,
          // Add more fields as needed
        }));
        setItems(processedData);
        setError(null);
        setLoading(false);
        return;
      }

      // Handle other categories with existing backend API
      const response = await fetch(
        `https://bgs-backend.vercel.app/api/top100/${category}?year=${year}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Process the data based on category
      let processedData;
      switch (category) {
        case "stocks":
          processedData = data.map((stock) => ({
            name: `${stock.symbol} (${stock.displaySymbol})`,
            description: `Type: ${stock.type || "N/A"}
                          Currency: ${stock.currency || "N/A"}
                          Description: ${stock.description || "N/A"}
                          MIC: ${stock.mic || "N/A"}
                          FIGI: ${stock.figi || "N/A"}`,
          }));
          break;
        case "billionaires":
          processedData = data.map((person) => ({
            name: person.personName,
            description: `Net Worth: $${(
              parseInt(person.finalWorth) / 1000
            ).toFixed(1)}B, Source: ${person.source
              .split(",")[0]
              .trim()}, Country: ${person.countryOfCitizenship}`,
            image: person.person?.squareImage || null,
          }));
          break;
      }

      setItems(processedData);
      setError(null);
    } catch (err) {
      console.error(`Error fetching ${category} data:`, err);
      setError(`Failed to fetch ${category} data: ${err.message}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true); // Set loading to true before fetching
    fetchTop100(category);
  }, [category, page]);

  // Click outside to close search bar
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setIsSearchBarOpen(false);
      }
    }
    if (isSearchBarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchBarOpen]);

  const renderGridView = () => (
    <Row gutter={[16, 16]}>
      {filteredItems.map((item, index) => (
        <Col xs={24} sm={12} lg={8} key={index}>
          <div className="bg-white/[var(--widget-opacity)] dark:bg-[#28283a]/[var(--widget-opacity)] backdrop-blur-sm p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex flex-col gap-4">
              {/* Header with number and title */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)]">
                  <span className="text-lg font-semibold text-gray-600 dark:text-gray-200">
                    {index + 1}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white flex-grow truncate">
                  {item.name}
                </h3>
                {(category === "brands" && item.logo) ||
                  (category === "billionaires" && item.image) ||
                  (category === "motorcycles" && item.image) ||
                  (category === "crypto" && item.image) ||
                  (category === "movies" && item.image) ||
                  (category === "banks" && item.image) ||
                  (category === "cars" && item.image) ||
                  (category === "gdp" && item.logo) ? (
                  <div className="flex-shrink-0 w-10 h-10">
                    <Image
                      src={category === "brands" ? item.logo : category === "gdp" ? item.logo : item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  </div>
                ) : null}
              </div>

              {/* Details Section */}
              <div className="flex flex-col gap-2 text-sm">
                {/* Primary Value (Net Worth / Value / Price) */}
                <div className="flex justify-between items-center text-gray-500 dark:text-gray-300">
                  <span>
                    {category === "crypto" && "Price"}
                    {category === "brands" && "Value"}
                    {category === "billionaires" && "Net Worth"}
                    {category === "motorcycles" && "Speed"}
                    {category === "gdp" && "GDP"}
                    {category === "movies" && "Rating"}
                    {category === "banks" && "Rank"}
                    {category === "cars" && "Rank"}
                  </span>
                  <span className="font-medium">
                    {category === "crypto" && item.value}
                    {category === "brands" && item.value}
                    {category === "billionaires" &&
                      item.description?.split("Net Worth: ")[1]?.split(",")[0]}
                    {category === "motorcycles" && (() => {
                      if (!item.description) return null;
                      const speedPart = item.description.split("Kmh Speed: ")[1];
                      if (!speedPart) return null;
                      const kmh = speedPart.split("km/h")[0];
                      return `${kmh} km/h`;
                    })()}
                    {category === "gdp" && item.value}
                    {category === "movies" && item.value}
                    {category === "banks" && item.value}
                    {category === "cars" && item.value}
                  </span>
                </div>

                {/* Crypto specific data */}
                {category === "crypto" && (
                  <>
                    <div className="flex justify-between items-center text-gray-500 dark:text-gray-300">
                      <span>Market Cap</span>
                      <span className="font-medium">{item.marketCap}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-500 dark:text-gray-300">
                      <span>24h Change</span>
                      <span className={`font-medium ${parseFloat(item.change24h) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {item.change24h}
                      </span>
                    </div>
                  </>
                )}

                {/* Movie specific data */}
                {category === "movies" && (
                  <>
                    <div className="flex justify-between items-center text-gray-500 dark:text-gray-300">
                      <span>Year</span>
                      <span className="font-medium">{item.year}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-500 dark:text-gray-300">
                      <span>IMBD</span>
                      <span className="font-medium">{item.imdb_link}</span>
                    </div>
                  </>
                )}

                {/* Sources Section */}
                {item.description?.split(",").map((info, i) => {
                  // Skip the first line for billionaires (duplicate net worth)
                  if (
                    category === "billionaires" &&
                    info.includes("Net Worth:")
                  ) {
                    return null;
                  }
                  // Skip speed line for motorcycles (already shown above)
                  if (
                    category === "motorcycles" &&
                    info.includes("Kmh Speed:")
                  ) {
                    return null;
                  }
                  // Skip crypto data that's already displayed above
                  if (
                    category === "crypto" &&
                    (info.includes("Price:") || info.includes("Market Cap:") || info.includes("24h Change:"))
                  ) {
                    return null;
                  }

                  // Handle Source information
                  if (info.trim().startsWith("Source:")) {
                    const sources = info
                      .replace("Source:", "")
                      .split("&")
                      .map((s) => s.trim());
                    return (
                      <div
                        key={i}
                        className="flex justify-between items-start text-gray-500 dark:text-gray-300"
                      >
                        <span>Source</span>
                        <div className="text-right">
                          {sources.map((source, idx) => (
                            <div key={idx} className="font-medium">
                              {source}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // Handle other key-value pairs
                  const [key, value] = info.split(":").map((str) => str.trim());
                  if (value) {
                    return (
                      <div
                        key={i}
                        className="flex justify-between items-center text-gray-500 dark:text-gray-300"
                      >
                        <span>{key}</span>
                        <span className="font-medium text-right">{value}</span>
                      </div>
                    );
                  }

                  // Handle plain text
                  return (
                    <div key={i} className="text-gray-500 dark:text-gray-300">
                      {info.trim()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Col>
      ))}
    </Row>
  );

  const renderListView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
      {/* Category sections */}
      <div className="col-span-full">
        {/* Title */}
        <h3 className="font-semibold text-lg dark:text-white text-neutral-600 text-left mb-4">
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </h3>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item, index) => (
            <div key={index} className="mb-2">
              <div className="flex  gap-2 p-2 bg-white dark:bg-[#28283a] rounded-lg hover:shadow-md transition-all duration-200">
                {/* Number/Image Circle */}
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50/[var(--w)] dark:bg-[#513a7a]/[var(--w)]">
                  <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                    {index + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {item.name}
                    </span>
                    {/* Category-specific values */}
                    {category === "crypto" && (
                      <span className="text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {item.value}
                      </span>
                    )}
                    {category === "brands" && (
                      <span className="text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {item.value}
                      </span>
                    )}
                    {category === "billionaires" && (
                      <span className="text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {
                          item.description
                            ?.split("Net Worth: ")[1]
                            ?.split(",")[0]
                        }
                      </span>
                    )}
                    {category === "motorcycles" && (() => {
                      if (!item.description) return null;
                      const speedPart = item.description.split("Kmh Speed: ")[1];
                      if (!speedPart) return null;
                      const kmh = speedPart.split("km/h")[0];
                      return `${kmh} km/h`;
                    })()}
                    {category === "gdp" && (
                      <span className="text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {item.value}
                      </span>
                    )}
                    {category === "movies" && (
                      <span className="text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {item.value}
                      </span>
                    )}
                    {category === "banks" && (
                      <span className="text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {item.value}
                      </span>
                    )}
                    {category === "cars" && (
                      <span className="text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {item.value}
                      </span>
                    )}
                  </div>
                  {/* Description */}
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {category === "crypto" ? (
                      <div className="space-y-1">
                        <p className="line-clamp-1">Market Cap: {item.marketCap}</p>
                        <p className={`line-clamp-1 ${parseFloat(item.change24h) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                          24h Change: {item.change24h}
                        </p>
                      </div>
                    ) : category === "movies" ? (
                      <div className="space-y-1">
                        <p className="line-clamp-1">Year: {item.year}</p>
                        <p className="line-clamp-1">Director: {item.director}</p>
                      </div>
                    ) : (
                      item.description?.split(",").map((info, i) => (
                        <p key={i} className="line-clamp-1">
                          {info.trim()}
                        </p>
                      ))
                    )}
                  </div>
                </div>

                {/* Crypto Logo */}
                {category === "crypto" && item.image && (
                  <div className="flex-shrink-0 w-10 h-10">
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  </div>
                )}

                {/* Movie Logo */}
                {category === "movies" && item.image && (
                  <div className="flex-shrink-0 w-10 h-10">
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  </div>
                )}

                {/* Bank Logo */}
                {category === "banks" && item.image && (
                  <div className="flex-shrink-0 w-10 h-10">
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  </div>
                )}

                {/* Car Logo */}
                {category === "cars" && item.image && (
                  <div className="flex-shrink-0 w-10 h-10">
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  </div>
                )}

                {/* GDP Country Logo */}
                {category === "gdp" && item.logo && (
                  <div className="flex-shrink-0 w-10 h-10">
                    <Image
                      src={item.logo}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Show skeleton while loading
  if (loading) {
    return (
      <div className="min-h-screen p-4 w-[90vw] mx-auto">
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginBottom: "2rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div className="relative flex items-center" ref={searchBarRef} style={{ width: 300 }}>
              <button
                onClick={() => setIsSearchBarOpen((prev) => !prev)}
                className="rounded-lg flex gap-2 items-center text-black bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)] px-3 py-2 dark:text-white transition-all duration-300 hover:scale-105"
                title="Search"
              >
                {isSearchBarOpen ? (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
                    <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" strokeWidth="2" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
                  </svg>
                )}
                {isSearchBarOpen ? "Close" : "Search"}
              </button>
              <div
                className={`absolute left-0 top-0 transition-all duration-300 ease-in-out ${isSearchBarOpen ? 'w-64 opacity-100 -translate-x-0' : 'w-0 opacity-0 -translate-x-4'} overflow-hidden`}
              >
                <input
                  type="text"
                  placeholder="Search items..."
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Escape') {
                      setIsSearchBarOpen(false);
                      setSearchQuery("");
                    }
                  }}
                  autoFocus={isSearchBarOpen}
                />
              </div>
            </div>
            <div className="dark:bg-[#513a7a]/[var(--widget-opacity)]  bg-white/[var(--widget-opacity)] backdrop-blur-sm rounded-lg border border-gray-400/10 dark:border-gray-800/10">
              <div>
                <button
                  className={`px-4 py-2 m-1 rounded dark:text-white  ${category === "motorcycles"
                    ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                    : ""
                    }`}
                  onClick={() => setCategory("motorcycles")}
                >
                  Bikes
                </button>
                <button
                  className={`px-4 py-2 m-1 rounded dark:text-white  ${category === "crypto"
                    ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                    : ""
                    }`}
                  onClick={() => setCategory("crypto")}
                >
                  Crypto
                </button>
                <button
                  className={`px-4 py-2 m-1 rounded dark:text-white  ${category === "stocks"
                    ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                    : ""
                    }`}
                  onClick={() => setCategory("stocks")}
                >
                  Stocks
                </button>
                <button
                  className={`px-4 py-2 m-1 rounded dark:text-white  ${category === "billionaires"
                    ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                    : ""
                    }`}
                  onClick={() => setCategory("billionaires")}
                >
                  Billionaires
                </button>
                <button
                  className={`px-4 py-2 m-1 rounded dark:text-white  ${category === "sportsmen"
                    ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                    : ""
                    }`}
                  onClick={() => setCategory("sportsmen")}
                >
                  Sports
                </button>
                <button
                  className={`px-4 py-2 m-1 rounded dark:text-white  ${category === "movies"
                    ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                    : ""
                    }`}
                  onClick={() => setCategory("movies")}
                >
                  Movies
                </button>
                <button
                  className={`px-4 py-2 m-1 rounded  dark:text-white ${category === "brands"
                    ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                    : ""
                    }`}
                  onClick={() => setCategory("brands")}
                >
                  Brands
                </button>
                <button
                  className={`px-4 py-2 m-1 rounded  dark:text-white ${category === "gdp"
                    ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                    : ""
                    }`}
                  onClick={() => setCategory("gdp")}
                >
                  GDP
                </button>
              </div>
            </div>

            <div className="w-[300px] flex justify-end">
              <div className="bg-white dark:bg-[#513a7a] rounded-lg shadow-sm p-1 inline-flex">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all duration-200 ${viewMode === "grid"
                    ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  title="Grid View"
                >
                  <FaTh size={15} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all duration-200 ${viewMode === "list"
                    ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  title="List View"
                >
                  <FaList size={15} />
                </button>
              </div>
            </div>
          </div>
        </Space>
        <Title
          level={1}
          style={{ textAlign: "center", marginBottom: "2rem" }}
          className="dark:text-white"
        >
          {category === "sportsmen"
            ? "Top 100 Contracts"
            : category === "motorcycles"
              ? "Top 100 Bikes "
              : `Top 100 ${category.charAt(0).toUpperCase() + category.slice(1)}`}
        </Title>
        {/* Skeleton Loader */}
        <SkeletonLoader count={100} isListView={viewMode === "list"} />
      </div>
    );
  }

  return (
    <div className="w-[90vw]  text-black dark:text-white mx-auto p-4">
      <Space
        direction="vertical"
        size="middle"
        style={{ width: "100%", marginBottom: "2rem" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="relative flex items-center" ref={searchBarRef} style={{ width: 300 }}>
            <button
              onClick={() => setIsSearchBarOpen((prev) => !prev)}
              className="rounded-lg flex gap-2 items-center text-black bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)] px-3 py-2 dark:text-white transition-all duration-300 hover:scale-105"
              title="Search"
            >
              {isSearchBarOpen ? (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
                  <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
                </svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" strokeWidth="2" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
                </svg>
              )}
              {isSearchBarOpen ? "Close" : "Search"}
            </button>
            <div
              className={`absolute left-0 top-0 transition-all duration-300 ease-in-out ${isSearchBarOpen ? 'w-64 opacity-100 -translate-x-0' : 'w-0 opacity-0 -translate-x-4'} overflow-hidden`}
            >
              <input
                type="text"
                placeholder="Search items..."
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') {
                    setIsSearchBarOpen(false);
                    setSearchQuery("");
                  }
                }}
                autoFocus={isSearchBarOpen}
              />
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="dark:bg-[#513a7a]/[var(--widget-opacity)] bg-white/[var(--widget-opacity)] backdrop-blur-sm rounded-lg border border-gray-400/10 dark:border-gray-800/10">
              {mainCategories.map((cat) => (
                <button
                  key={cat.key}
                  className={`px-4 py-2 m-1 rounded ${category === cat.key
                    ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                    : ""
                    }`}
                  onClick={() => setCategory(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
              {additionalCategories.map((cat) => (
                <button
                  key={cat.key}
                  className={`px-4 py-2 m-1 rounded ${category === cat.key
                    ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                    : ""
                    }`}
                  onClick={() => setCategory(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div className="w-[300px] flex justify-end">
            <div className="bg-white dark:bg-[#513a7a] rounded-lg shadow-sm p-1 inline-flex">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all duration-200 ${viewMode === "grid"
                  ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                title="Grid View"
              >
                <FaTh size={15} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all duration-200 ${viewMode === "list"
                  ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                title="List View"
              >
                <FaList size={15} />
              </button>
            </div>
          </div>
        </div>
      </Space>
      <Title
        level={1}
        style={{ textAlign: "center", marginBottom: "2rem" }}
        className="dark:text-white"
      >
        {category === "sportsmen"
          ? "Top 100 Contracts"
          : category === "motorcycles"
            ? "Top 100 Bikes "
            : `Top 100 ${category.charAt(0).toUpperCase() + category.slice(1)}`}
      </Title>
      {/* Only render content when not loading */}
      {!loading && (
        <div style={{ minHeight: "200px" }}>
          {viewMode === "grid" ? renderGridView() : renderListView()}
        </div>
      )}
    </div>
  );
};

export default Top100Page;
