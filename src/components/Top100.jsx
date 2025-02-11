import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Alert,
  Radio,
  Input,
  List,
  Space,
  Image,
} from "antd";
import { AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons";
import sportsmen from "./sportsmen.json";
import brands from "./brand.json";
import bikes from "./bikes.json";
import gdp from "./gdp.json";
import "./ToastifyNotification.css";
import { FaTh, FaList } from "react-icons/fa";
import ButtonComponent from "../../Tools/ButtonComponent";
import GridComponent from "../../Tools/GridComponent";
import SkeletonLoader from "./SkeletonLoader";

const { Title } = Typography;
const { Search } = Input;

function WikipediaBanks() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://en.wikipedia.org/w/api.php?action=parse&page=List_of_largest_banks&format=json&origin=*"
        );
        const result = await response.json();
        const htmlContent = result.parse.text["*"];

        // Extract table data
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlContent;
        const tableElement = tempDiv.querySelector(".wikitable");

        // Convert HTML table to array of objects
        const rows = Array.from(tableElement.querySelectorAll("tr"));
        const headers = Array.from(rows[0].querySelectorAll("th")).map((th) =>
          th.textContent.trim()
        );

        const tableData = rows.slice(1).map((row, index) => {
          const cells = Array.from(row.querySelectorAll("td"));
          const rowData = cells.map((cell) => cell.textContent.trim());
          const obj = {
            key: index,
          };
          headers.forEach((header, i) => {
            obj[header] = rowData[i];
          });
          return obj;
        });

        setData(tableData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = data.filter(
    (item) =>
      item["Bank name"]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item["Rank"]?.toString().includes(searchQuery) ||
      item["Total assets(2023)(US$ billion)"]?.toString().includes(searchQuery)
  );

  const renderGridView = () => (
    <Row gutter={[16, 16]}>
      {filteredData.map((item, index) => (
        <Col xs={24} sm={12} lg={8} key={index}>
          <Card
            title={`${index + 1}. ${item["Bank name"] || "Unknown Bank"}`}
            bordered={true}
            hoverable
          >
            <p>Rank: {item["Rank"] || "N/A"}</p>
            <p>
              Total Assets: {item["Total assets(2023)(US$ billion)"] || "N/A"}{" "}
              billion USD
            </p>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderListView = () => (
    <List
      className="w-full"
      itemLayout="horizontal"
      dataSource={filteredData}
      grid={{
        gutter: 16,
        xs: 1,
        sm: 2,
        lg: 3,
      }}
      renderItem={(item, index) => (
        <List.Item className="bg-gray-200 dark:bg-[#28283A] dark:text-white rounded-sm mb-4">
          <List.Item.Meta
            title={
              item["Bank name"]?.toLowerCase().includes("bank") ? (
                <div className="dark:text-white flex justify-between items-center">
                  <span>
                    {index + 1}. {item["Bank name"]}
                  </span>
                </div>
              ) : (
                <div className="dark:text-white flex justify-between items-center">
                  <span>
                    {index + 1}. {item["Bank name"]}
                  </span>
                  <span>
                    {item["Total assets(2023)(US$ billion)"]?.toString()}{" "}
                    billion USD
                  </span>
                </div>
              )
            }
            description={
              <div className="dark:text-gray-300">
                {item["Bank name"] && (
                  <>
                    <p>Rank: {item["Rank"] || "N/A"}</p>
                    <p>
                      Total Assets:{" "}
                      {item["Total assets(2023)(US$ billion)"] || "N/A"} billion
                      USD
                    </p>
                  </>
                )}
              </div>
            }
          />
        </List.Item>
      )}
    />
  );

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Search
          placeholder="Search banks..."
          allowClear
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 300 }}
        />
        <Radio.Group
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
        >
          <Radio.Button value="grid">
            <AppstoreOutlined />
          </Radio.Button>
          <Radio.Button value="list">
            <UnorderedListOutlined />
          </Radio.Button>
        </Radio.Group>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", margin: "2rem", height: "200px" }}>
          <Spin size="large" />
        </div>
      ) : viewMode === "grid" ? (
        renderGridView()
      ) : (
        renderListView()
      )}
    </div>
  );
}

const Top100Page = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("motorcycles");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
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

  const fetchTop100 = async (category) => {
    try {
      setLoading(true);
      if (["sportsmen", "brands", "motorcycles", "gdp"].includes(category)) {
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
            name: `${brand.Brand}`,
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
          }));
          setItems(processedData);
          setError(null);
          setLoading(false);
          return;
        }

        if (category === "gdp") {
          const processedData = gdp.GDP_by_country.map((country) => ({
            name: country.Country,
            description: `IMF Forecast (${country.IMF?.Year || "N/A"}): $${(
              country.IMF?.Forecast / 1000
            ).toFixed(2)}T
                          World Bank (${
                            country.World_Bank?.Year || "N/A"
                          }): $${(country.World_Bank?.Estimate / 1000).toFixed(
              2
            )}T
                          UN (${country.United_Nations?.Year || "N/A"}): $${(
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
      }
      const response = await fetch(
        `https://bgs-backend.vercel.app/api/top100/${category}?year=${year}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Process the data based on category
      let processedData = [];
      switch (category) {
        case "cars":
          processedData = data.map((vehicle) => ({
            name: `${vehicle.make} ${vehicle.model}`,
            description: `Year: ${vehicle.year}, Class: ${
              vehicle.class || "N/A"
            }`,
          }));
          break;
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
        case "crypto":
          processedData = data.map((coin) => ({
            name: coin.name,
            description: `Price: $${coin.current_price}, Market Cap: $${coin.market_cap}`,
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
        case "movies":
          processedData = data.map((movie) => ({
            name: movie.title,
            description: `Rating: ${movie.rating}, Year: ${movie.year}`,
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

  const renderGridView = () => (
    <Row gutter={[16, 16]}>
      {filteredItems.map((item, index) => (
        <Col xs={24} sm={12} lg={8} key={index}>
          <div className="bg-white dark:bg-[#513a7a] p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex flex-col gap-4">
              {/* Header with number and title */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
                  {category === "billionaires" && item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                      {index + 1}
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white flex-grow truncate">
                  {item.name}
                </h3>
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
                  </span>
                  <span className="font-medium">
                    {category === "crypto" &&
                      (item.description?.includes("Price: $")
                        ? `$${
                            item.description.split("Price: $")[1]?.split(",")[0]
                          }`
                        : "N/A")}
                    {category === "brands" && item.value}
                    {category === "billionaires" &&
                      item.description?.split("Net Worth: ")[1]?.split(",")[0]}
                    {category === "motorcycles" &&
                      `${
                        item.description
                          .split("Kmh Speed: ")[1]
                          ?.split("km/h")[0]
                      } km/h`}
                    {category === "gdp" && item.value}
                  </span>
                </div>

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
              <div className="flex  gap-2 p-2 bg-white dark:bg-[#513a7a] rounded-lg hover:shadow-md transition-all duration-200">
                {/* Number/Image Circle */}
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
                  {category === "billionaires" && item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                      {index + 1}
                    </span>
                  )}
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
                        {item.description?.includes("Price: $")
                          ? `$${
                              item.description
                                .split("Price: $")[1]
                                ?.split(",")[0]
                            }`
                          : ""}
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
                    {category === "motorcycles" && (
                      <span className="text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {
                          item.description
                            .split("Kmh Speed: ")[1]
                            ?.split("km/h")[0]
                        }{" "}
                        km/h
                      </span>
                    )}
                    {category === "gdp" && (
                      <span className="text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {item.value}
                      </span>
                    )}
                  </div>
                  {/* Description */}
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {item.description?.split(",").map((info, i) => (
                      <p key={i} className="line-clamp-1">
                        {info.trim()}
                      </p>
                    ))}
                  </div>
                </div>
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
            <Search
              placeholder="Search items..."
              allowClear
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 300 }}
            />
            <div style={{ textAlign: "center" }}>
              <Radio.Group
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button
                  className="dark:bg-[#28283A] dark:text-white"
                  value="motorcycles"
                >
                  Motorcycles
                </Radio.Button>
                <Radio.Button
                  className="dark:bg-[#28283A] dark:text-white"
                  value="crypto"
                >
                  Crypto
                </Radio.Button>
                <Radio.Button
                  className="dark:bg-[#28283A] dark:text-white"
                  value="stocks"
                >
                  Stocks
                </Radio.Button>
                <Radio.Button
                  className="dark:bg-[#28283A] dark:text-white"
                  value="billionaires"
                >
                  Billionaires
                </Radio.Button>
                <Radio.Button
                  className="dark:bg-[#28283A] dark:text-white"
                  value="sportsmen"
                >
                  Sports Contracts
                </Radio.Button>
                <Radio.Button
                  className="dark:bg-[#28283A] dark:text-white"
                  value="movies"
                >
                  Movies
                </Radio.Button>
                <Radio.Button
                  className="dark:bg-[#28283A] dark:text-white"
                  value="brands"
                >
                  Brands
                </Radio.Button>
                <Radio.Button
                  className="dark:bg-[#28283A] dark:text-white"
                  value="gdp"
                >
                  GDP
                </Radio.Button>
              </Radio.Group>
            </div>
            <div className="w-[300px] flex justify-end">
              <Radio.Group
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
              >
                <Radio.Button value="grid">
                  <AppstoreOutlined />
                </Radio.Button>
                <Radio.Button value="list">
                  <UnorderedListOutlined />
                </Radio.Button>
              </Radio.Group>
            </div>
          </div>
        </Space>
        <Title
          level={1}
          style={{ textAlign: "center", marginBottom: "2rem" }}
          className="dark:text-white"
        >
          Top 100 {category.charAt(0).toUpperCase() + category.slice(1)}
        </Title>
        {/* Skeleton Loader */}
        <SkeletonLoader count={100} isListView={viewMode === "list"} />
      </div>
    );
  }

  return (
    <div className="w-[90vw]  text-white mx-auto p-4">
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
          <Search
            placeholder="Search items..."
            allowClear
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 300 }}
          />
          <div style={{ textAlign: "center" }}>
            <Radio.Group
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button
                className="dark:bg-[#28283A] dark:text-white"
                value="motorcycles"
              >
                Motorcycles
              </Radio.Button>
              <Radio.Button
                className="dark:bg-[#28283A] dark:text-white"
                value="crypto"
              >
                Crypto
              </Radio.Button>
              <Radio.Button
                className="dark:bg-[#28283A] dark:text-white"
                value="stocks"
              >
                Stocks
              </Radio.Button>
              <Radio.Button
                className="dark:bg-[#28283A] dark:text-white"
                value="billionaires"
              >
                Billionaires
              </Radio.Button>
              <Radio.Button
                className="dark:bg-[#28283A] dark:text-white"
                value="sportsmen"
              >
                Sports Contracts
              </Radio.Button>
              <Radio.Button
                className="dark:bg-[#28283A] dark:text-white"
                value="movies"
              >
                Movies
              </Radio.Button>
              <Radio.Button
                className="dark:bg-[#28283A] dark:text-white"
                value="brands"
              >
                Brands
              </Radio.Button>
              <Radio.Button
                className="dark:bg-[#28283A] dark:text-white"
                value="gdp"
              >
                GDP
              </Radio.Button>
            </Radio.Group>
          </div>
          <div className="w-[300px] flex justify-end">
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
            >
              <Radio.Button value="grid">
                <AppstoreOutlined />
              </Radio.Button>
              <Radio.Button value="list">
                <UnorderedListOutlined />
              </Radio.Button>
            </Radio.Group>
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
          : `Top 100 ${category.charAt(0).toUpperCase() + category.slice(1)}`}
      </Title>
      {/* Only render content when not loading */}
      {!loading && (
        <>
          {category === "banks" ? (
            <WikipediaBanks />
          ) : (
            <div style={{ minHeight: "200px" }}>
              {viewMode === "grid" ? renderGridView() : renderListView()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Top100Page;
