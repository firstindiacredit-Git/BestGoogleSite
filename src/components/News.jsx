import React, { createContext, useState, useEffect, useContext } from "react";
import { Card, Row, Col, List, Button, Space, Spin, Input, Menu } from "antd";
import { AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons";

const { Meta } = Card;
const { Search } = Input;

// Create NewsContext
const NewsContext = createContext(null);

// NewsProvider component
const NewsProvider = ({ children }) => {
  const [newsapi, setNewsApi] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiKey = import.meta.env.VITE_NEWS_API_KEY;

  const fetchData = async (title = "") => {
    setLoading(true);
    try {
      const query = title || "general";
      const res = await fetch(
        `https://gnews.io/api/v4/top-headlines?q=${query}&apikey=${apiKey}`
      );
      const resData = await res.json();
      setNewsApi(resData.articles);
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

// Main NewsApp component
const NewsApp = () => {
  const { newsapi, loading, fetchData } = useContext(NewsContext);
  const [viewMode, setViewMode] = useState("grid");

  const menuItems = [
    { key: "latest", label: "Latest" },
    { key: "india", label: "India" },
    { key: "world", label: "World" },
    { key: "business", label: "Business" },
    { key: "technology", label: "Technology" },
    { key: "entertainment", label: "Entertainment" },
    { key: "health", label: "Health" },
    { key: "science", label: "Science" },
    { key: "sports", label: "Sports" },
    { key: "politics", label: "Politics" },
  ];

  const renderGridView = () => (
    <Row gutter={[16, 16]}>
      {newsapi?.map((news, index) => (
        <Col xs={24} sm={12} md={8} lg={6} key={index}>
          <Card
            hoverable
            className="h-[450px] overflow-hidden dark:bg-gray-800"
            cover={
              <img
                alt={news.title}
                src={news.image}
                className="h-[200px] object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x200?text=No+Image";
                }}
              />
            }
            actions={[
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 hover:text-indigo-600"
              >
                Read more →
              </a>,
            ]}
          >
            <Meta
              title={<span className="dark:text-white">{news.title}</span>}
              description={
                <span className="dark:text-gray-300">{news.description}</span>
              }
              className="h-[150px] overflow-hidden"
            />
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderListView = () => (
    <List
      itemLayout="vertical"
      size="large"
      dataSource={newsapi || []}
      renderItem={(news) => (
        <List.Item
          key={news.title}
          className="dark:bg-gray-800 dark:text-white mb-4 rounded-lg"
          extra={
            <img
              width={272}
              alt={news.title}
              src={news.image}
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/400x200?text=No+Image";
              }}
            />
          }
          actions={[
            <a
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
      <div className="mb-6">
        <Search
          placeholder="Search news..."
          onSearch={(value) => fetchData(value)}
          className="max-w-lg mx-auto block mb-4"
          enterButton
        />
        <Menu
          mode="horizontal"
          onClick={({ key }) => fetchData(key)}
          items={menuItems}
          className="justify-center dark:bg-gray-800 dark:text-white"
        />
      </div>

      <Space className="mb-4 w-full justify-end">
        <Button
          type={viewMode === "grid" ? "primary" : "default"}
          icon={<AppstoreOutlined />}
          onClick={() => setViewMode("grid")}
          className="dark:bg-gray-700 dark:text-white"
        />
        <Button
          type={viewMode === "list" ? "primary" : "default"}
          icon={<UnorderedListOutlined />}
          onClick={() => setViewMode("list")}
          className="dark:bg-gray-700 dark:text-white"
        />
      </Space>

      {loading ? (
        <div className="text-center p-12">
          <Spin size="large" />
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
    <div className="pb-10">
      <div className="p-8 rounded-sm backdrop-blur-sm shadow-sm w-[90vw] mx-auto bg-gray-200/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)]">
        <NewsProvider>
          <NewsApp />
        </NewsProvider>
      </div>
    </div>
  );
};

export default News;
