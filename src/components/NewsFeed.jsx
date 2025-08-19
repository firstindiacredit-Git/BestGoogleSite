import React, { useState, useEffect, useContext, memo } from "react";
import { Spin } from "antd";
import { WidgetTransparencyContext } from "../App";

// Featured news item component
const FeaturedNewsItem = memo(({ news }) => {
  return (
    <div
      className={`pb-4 pt-2 px-4 border-b dark:border-gray-700/[var(--widget-opacity)]`}
    >
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        Source:{" "}
        {news.source_id || news.source?.name || news.source_name || "News"}
      </div>
      <a
        href={news.link || news.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="flex gap-4">
          {(news.image_url || news.image) && (
            <div className="w-24 h-24 flex-shrink-0">
              <img
                src={
                  news.image_url ||
                  news.image ||
                  "https://kvaser.com/wp-content/themes/kvaser/assets/images/new-homepage/blog/no-image.jpg"
                }
                alt={news.title}
                className="w-full h-full object-cover rounded"
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-base text-indigo-600 dark:text-blue-400 mb-2 line-clamp-2">
              {news.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
              {(news.description || news.content)?.slice(0, 350)}...
            </p>
          </div>
        </div>
      </a>
    </div>
  );
});

// News list item component
const NewsListItem = memo(({ news }) => (
  <a
    href={news.link || news.url}
    target="_blank"
    rel="noopener noreferrer"
    className="block py-2 border-b dark:border-gray-700 last:border-b-0 dark:hover:bg-gray-800/50/[var(--widget-opacity)] transition-colors"
  >
    <h3 className="text-sm text-indigo-600 dark:text-blue-400 dark:hover:text-blue-500 line-clamp-2">
      {news.title}
    </h3>
  </a>
));

// Loading component
const LoadingState = () => (
  <div className="h-[350px] flex items-center justify-center">
    <Spin size="large" />
  </div>
);

// Error component
const ErrorState = ({ message, onRetry }) => (
  <div className="p-4 text-center bg-red-50 dark:bg-red-900/20 rounded-lg">
    <p className="text-red-500 mb-2">{message}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2"
    >
      Retry
    </button>
  </div>
);

const NewsFeed = () => {
  const [news, setNews] = useState(() => {
    const savedNews = localStorage.getItem("newsData");
    try {
      return savedNews ? JSON.parse(savedNews) : [];
    } catch (e) {
      console.error("Error parsing saved news:", e);
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState(null);
  const { widgetTransparency } = useContext(WidgetTransparencyContext);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);

    try {
      //"Fetching news data...");

      // Check if we have recently fetched news (within last hour)
      const lastFetch = localStorage.getItem("lastNewsFetch");
      const now = Date.now();

      if (lastFetch && now - parseInt(lastFetch) < 3600000) {
        //"Using cached news data from localStorage");
        const savedNews = localStorage.getItem("newsData");

        if (savedNews) {
          try {
            const parsedNews = JSON.parse(savedNews);
            if (Array.isArray(parsedNews) && parsedNews.length > 0) {
              //`Found ${parsedNews.length} cached news items`);
              setNews(parsedNews);
              setLoading(false);
              return;
            } else {
              //
              //   "Cached news is empty or invalid, fetching fresh data"
              // );
            }
          } catch (e) {
            console.error("Error parsing cached news:", e);
          }
        }
      }

      //"Making API request for fresh news data");
      const response = await fetch(
        "https://newsdata.io/api/1/news?apikey=pub_63909ffdc676cafdb2b6287a51da5f0e581ff&country=in&language=en"
      );

      if (!response.ok) {
        console.error(`News API responded with status: ${response.status}`);
        throw new Error(`Failed to fetch news: ${response.statusText}`);
      }

      const data = await response.json();
      //"News API raw response:", data);

      // Handle newsdata.io format (results array)
      if (data && data.results && Array.isArray(data.results)) {
        //"Detected newsdata.io format with results array");
        const newsItems = data.results.filter((item) => item.title);
        //
        //   `Found ${newsItems.length} valid news items in results array`
        // );

        if (newsItems.length > 0) {
          setNews(newsItems);
          localStorage.setItem("newsData", JSON.stringify(newsItems));
          localStorage.setItem("lastNewsFetch", now.toString());
          setLoading(false);
          return;
        }
      }

      // Handle direct array format
      if (Array.isArray(data)) {
        //"Detected direct array format");
        const newsItems = data.filter((item) => item.title);
        //
        //   `Found ${newsItems.length} valid news items in direct array`
        // );

        if (newsItems.length > 0) {
          setNews(newsItems);
          localStorage.setItem("newsData", JSON.stringify(newsItems));
          localStorage.setItem("lastNewsFetch", now.toString());
          setLoading(false);
          return;
        }
      }

      // If we get here, try the gnews endpoint as fallback
      //"No valid news items found, trying gnews endpoint");
      const gnewsResponse = await fetch(
        "https://bgs-backend.vercel.app/api/top100/gnews?query=general"
      );

      if (!gnewsResponse.ok) {
        console.error(
          `GNews API responded with status: ${gnewsResponse.status}`
        );
        throw new Error("Failed to fetch news from all sources");
      }

      const gnewsData = await gnewsResponse.json();
      //"GNews API response:", gnewsData);

      if (Array.isArray(gnewsData) && gnewsData.length > 0) {
        //`Found ${gnewsData.length} news items from GNews`);

        // Transform gnews format to match our expected format
        const transformedNews = gnewsData.map((item) => ({
          title: item.title,
          description: item.description || item.content,
          link: item.url,
          image_url: item.image,
          source_id: item.source?.name || "GNews",
        }));

        setNews(transformedNews);
        localStorage.setItem("newsData", JSON.stringify(transformedNews));
        localStorage.setItem("lastNewsFetch", now.toString());
        setLoading(false);
        return;
      }

      // If we get here, we couldn't find any news from any source
      throw new Error("No valid news items found from any source");
    } catch (err) {
      console.error("News fetch error:", err);
      setError(err.message || "An error occurred while fetching news");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    // Clear cache and retry
    localStorage.removeItem("newsData");
    localStorage.removeItem("lastNewsFetch");
    fetchNews();
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
  if (error) return <ErrorState message={error} onRetry={handleRetry} />;
  if (!news || news.length === 0) {
    return (
      <ErrorState message="No news articles found" onRetry={handleRetry} />
    );
  }

  const [mainNews, ...remainingNews] = news;

  return (
    <div
      style={{ opacity: widgetTransparency / 100, height: '350px', minHeight: '350px' }}
      className="min-[21vw] backdrop-blur-sm rounded-b-sm overflow-hidden"
    >
      {!collapsed && mainNews && (
        <div className="h-full overflow-y-auto">
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
