import React, { createContext, useState, useEffect, useContext } from "react";
import { Card, Row, Col, List, Button, Input, Menu, Image } from "antd";
import { AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons";
import SkeletonLoader from "./SkeletonLoader";

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
  const [viewMode, setViewMode] = useState("list");

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
    <Row gutter={[20, 20]}>
      {newsapi?.map((news, index) => (
        <Col xs={24} sm={12} md={8} lg={6} key={index}>
          <Card
            hoverable
            className=" bg-white overflow-hidden dark:bg-gray-800"
            cover={
              <img
                alt={news.title}
                src={news.image}
                className="h-[190px] object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://plus.unsplash.com/premium_photo-1707080369554-359143c6aa0b?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bmV3cyUyMHdlYnNpdGV8ZW58MHx8MHx8fDA%3D";
                }}
              />
            }
          >
            <Meta
              title={
                <a href={news.url} target="_blank" rel="noopener noreferrer">
                  <span className="dark:text-white">{news.title}</span>
                </a>
              }
              description={
                <a href={news.url} target="_blank" rel="noopener noreferrer">
                  <span className="dark:text-gray-300 text-sm">
                    {news.description}
                  </span>
                </a>
              }
              className="h-[100px] overflow-hidden"
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
      <div className="flex mb-5 ">
        <Menu
          mode="horizontal"
          onClick={({ key }) => fetchData(key)}
          items={menuItems}
          className="m-auto w-fit  rounded-md bg-white dark:bg-[#513a7a]"
        />

        <Button
          type={viewMode === "grid" ? "primary" : "default"}
          icon={<AppstoreOutlined />}
          onClick={() => setViewMode("grid")}
          className="dark:bg-gray-700 text-gray-800  dark:text-white"
        />
        <Button
          type={viewMode === "list" ? "primary" : "default"}
          icon={<UnorderedListOutlined />}
          onClick={() => setViewMode("list")}
          className="dark:bg-gray-700  text-gray-800 dark:text-white"
        />
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
      <div className="   w-[90vw] mx-auto bg-transparent ">
        <NewsProvider>
          <NewsApp />
        </NewsProvider>
      </div>
    </div>
  );
};

export default News;
