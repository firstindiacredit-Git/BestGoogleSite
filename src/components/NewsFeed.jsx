import React, { useState, useEffect, useContext, memo } from "react";
import { Spin } from "antd";
import { WidgetTransparencyContext } from "../App";

// Featured news item component
const FeaturedNewsItem = memo(({ news }) => (
  <div
    className={`pb-4 pt-2 px-4 border-b dark:border-gray-700/[var(--widget-opacity)]`}
  >
    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
      Source: {news.source_name}
    </div>
    <a
      href={news.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <div className="flex gap-4">
        {news.image_url && (
          <div className="w-24 h-24 flex-shrink-0">
            <img
              src={
                news.image_url ||
                "https://kvaser.com/wp-content/themes/kvaser/assets/images/new-homepage/blog/no-image.jpg"
              }
              alt={news.title}
              className="w-full h-full object-cover rounded"
            />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-base  text-indigo-600 dark:text-blue-400 mb-2 line-clamp-2">
            {news.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
            {news.description?.slice(0, 350)}...
          </p>
        </div>
      </div>
    </a>
  </div>
));

// News list item component
const NewsListItem = memo(({ news }) => (
  <a
    href={news.link}
    target="_blank"
    rel="noopener noreferrer"
    className="block py-2 border-b dark:border-gray-700 last:border-b-0  dark:hover:bg-gray-800/50/[var(--widget-opacity)] transition-colors"
  >
    <h3 className="text-sm  text-indigo-600 dark:text-blue-400  dark:hover:text-blue-500 line-clamp-2">
      {news.title}
    </h3>
  </a>
));

// Loading component
const LoadingState = () => (
  <div className="h-[300px] flex items-center justify-center">
    <Spin size="large" />
  </div>
);

// Error component
const ErrorState = ({ message }) => (
  <div className="p-4 text-center">
    <p className="text-red-500">{message}</p>
  </div>
);

const NewsFeed = () => {
  const [news, setNews] = useState(() => {
    const savedNews = localStorage.getItem("newsData");
    return savedNews ? JSON.parse(savedNews) : [];
  });
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState(null);
  const { widgetTransparency } = useContext(WidgetTransparencyContext);

  const fetchNews = async () => {
    try {
      // Check if we have recently fetched news (within last hour)
      const lastFetch = localStorage.getItem("lastNewsFetch");
      const now = Date.now();
      if (lastFetch && now - parseInt(lastFetch) < 3600000) {
        const savedNews = localStorage.getItem("newsData");
        if (savedNews) {
          setNews(JSON.parse(savedNews));
          setLoading(false);
          return;
        }
      }

      const response = await fetch(
        "https://bgs-backend.vercel.app/api/top100/news"
      );
      if (!response.ok) throw new Error("Failed to fetch news");

      const data = await response.json();
      if (Array.isArray(data)) {
        const filteredNews = data.filter(
          (item) => item.title && item.description
        );
        setNews(filteredNews);
        localStorage.setItem("newsData", JSON.stringify(filteredNews));
        localStorage.setItem("lastNewsFetch", now.toString());
      } else {
        throw new Error("No valid news items found");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();

    // Add event listener for drag end
    const handleDragEnd = () => {
      fetchNews();
    };

    document.addEventListener("dragend", handleDragEnd);

    // Cleanup
    return () => {
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const [mainNews, ...remainingNews] = news;

  return (
    <div
      style={{ opacity: widgetTransparency }}
      className="min-[21vw] backdrop-blur-sm rounded-b-sm overflow-hidden"
    >
      {!collapsed && mainNews && (
        <div>
          <FeaturedNewsItem news={mainNews} />
          <div className="px-4 py-2">
            {remainingNews.map((item, index) => (
              <NewsListItem key={index} news={item} />
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default memo(NewsFeed);
