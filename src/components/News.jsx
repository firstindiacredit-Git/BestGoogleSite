import React, { createContext, useState, useEffect, useContext } from "react";
import { Row, Col, List, Image } from "antd";
import PropTypes from "prop-types";

import SkeletonLoader from "./SkeletonLoader";
import { FaList, FaTh } from "react-icons/fa";

// Create NewsContext
const NewsContext = createContext(null);

// NewsProvider component
const NewsProvider = ({ children }) => {
  const [newsapi, setNewsApi] = useState([]);

  const [loading, setLoading] = useState(false);

  const fetchData = async (category = "latest") => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://gnews.io/api/v4/top-headlines?q=${category}&lang=en&country=${category === 'india' ? 'in' : 'us'}&max=10&apikey=d1561b9a1c352425b78fd42024da7255`
      );
      const newsData = await res.json();
      setNewsApi(newsData.articles || []);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <NewsContext.Provider value={{ newsapi, fetchData, loading }}>
      {children}
    </NewsContext.Provider>
  );
};

NewsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Main NewsApp component
const NewsApp = () => {
  const { newsapi, loading, fetchData } = useContext(NewsContext);
  const [viewMode, setViewMode] = useState("grid");
  const [currentSet, setCurrentSet] = useState("Latest");
  const setSHow = (a) => {
    setCurrentSet(a);
  };
  const menuItems = [
    { key: "india", label: "India" },
    { key: "latest", label: "Latest" },
    { key: "world", label: "World" },
    { key: "business", label: "Business" },
    { key: "technology", label: "Technology" },
    { key: "sports", label: "Sports" },
    { key: "entertainment", label: "Entertainment" },
    { key: "health", label: "Health" },
    { key: "science", label: "Science" },
    { key: "politics", label: "Politics" },
    { key: "education", label: "Education" },
    { key: "crime", label: "Crime" },
    { key: "lifestyle", label: "Lifestyle" },
    { key: "automobile", label: "Automobile" },
    { key: "weather", label: "Weather" }
  ];

  const renderGridView = () => (
    <Row gutter={[20, 20]}>
      {newsapi?.map((news, index) => (
        <Col xs={24} sm={12} md={8} lg={6} key={index}>
          <div
            className="bg-white/[var(--widget-opacity)] backdrop-blur-sm dark:bg-[#28283a]/[var(--widget-opacity)] flex flex-col justify-between h-[30rem] overflow-hidden p-3 rounded-lg"
          >
            <div className="w-full">
              <img
                alt={news.title}
                src={news.image}
                className="h-[18rem] w-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://plus.unsplash.com/premium_photo-1707080369554-359143c6aa0b?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bmV3cyUyMHdlYnNpdGV8ZW58MHx8MHx8fDA%3D";
                }}
              />
            </div>
            <div>
              <a href={news.url} target="_blank" rel="noopener noreferrer">
                <div className="dark:text-white font-bold py-2">
                  {news.title}
                </div>
              </a>

              <a href={news.url} target="_blank" rel="noopener noreferrer">
                <div className="dark:text-gray-300 text-sm line-clamp-2 max-w-[80ch] truncate overflow-ellipsis py-2">
                  {news.description}
                </div>
              </a>
            </div>
            <a href={news.url} target="_blank" rel="noopener noreferrer">
              <button className="bg-indigo-500 w-full rounded-lg py-2 text-white">
                Read More
              </button>
            </a>
          </div>
        </Col>
      ))}
    </Row>
  );

  const renderListView = () => (
    <List
      itemLayout="vertical"
      size="large"
      dataSource={newsapi || []}
      renderItem={(news, index) => (
        <List.Item
          key={index}
          className="dark:bg-[#332B4A] mb-3 bg-white dark:text-white rounded-lg"
          extra={
            <Image
              height={150}
              width={150}
              alt={news.title}
              style={{ objectFit: "cover" }}
              src={
                news.image ||
                "https://plus.unsplash.com/premium_photo-1707080369554-359143c6aa0b?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bmV3cyUyMHdlYnNpdGV8ZW58MHx8MHx8fDA%3D"
              }
              onError={(e) => {
                e.target.src =
                  "https://plus.unsplash.com/premium_photo-1707080369554-359143c6aa0b?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bmV3cyUyMHdlYnNpdGV8ZW58MHx8MHx8fDA%3D";
              }}
            />
          }
          actions={[
            <a
              key="read-more"
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:text-indigo-600"
            >
              Read more →
            </a>,
          ]}
        >
          <List.Item.Meta
            title={<span className="dark:text-white">{news.title}</span>}
            description={
              <span className="dark:text-gray-300">{news.description}</span>
            }
          />
        </List.Item>
      )}
    />
  );

  return (
    <div className="p-6">
      <div className="flex mb-5 flex-wrap gap-2 justify-between items-center">
        <div className="p-1 dark:text-white flex flex-wrap justify-center mx-auto  gap-2 rounded-md backdrop-blur-sm bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)]">
          {menuItems.map((item, key) => (
            <div
              key={key}
              className={`cursor-pointer px-3 py-2 rounded-md ${
                item.label === currentSet
                  ? "bg-indigo-500 text-white dark:bg-[#513a7a]"
                  : "hover:bg-gray-200/20 hover:dark:bg-[#513a7a]/20"
              }`}
              onClick={() => {
                fetchData(item.key);
                setSHow(item.label);
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-[#513a7a] rounded-lg shadow-sm p-1 inline-flex ml-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-all duration-200 ${
              viewMode === "grid"
                ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
            title="Grid View"
          >
            <FaTh size={15} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-all duration-200 ${
              viewMode === "list"
                ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
            title="List View"
          >
            <FaList size={15} />
          </button>
        </div>
      </div>
      {loading ? (
        <div className="min-h-screen p-4 w-[90vw] mx-auto">
          <SkeletonLoader count={10} isListView={viewMode === "list"} />
        </div>
      ) : viewMode === "grid" ? (
        renderGridView()
      ) : (
        renderListView()
      )}
    </div>
  );
};

// Main News component
const News = () => {
  return (
    <div className="pb-9">
      <div className="w-[90vw] mx-auto bg-transparent">
        <NewsProvider>
          <NewsApp />
        </NewsProvider>
      </div>
    </div>
  );
};

export default News;