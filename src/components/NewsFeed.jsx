import React, { useState, useEffect, useRef } from "react";
import { Carousel, Spin } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef();

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('https://bgs-backend.vercel.app/api/top100/news');

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        setNews(data.filter(item => item.title && item.description));
      } else {
        throw new Error('No news items found');
      }
    } catch (err) {
      console.error("Error fetching news:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    carouselRef.current?.prev();
  };

  const handleNext = () => {
    carouselRef.current?.next();
  };

  if (loading) {
    return (
      <div className=" h-[300px] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className=" p-4 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className=" max-w-sm bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
      <div className="news-carousel">
        <Carousel
          ref={carouselRef}
          dots={false}
          autoplay
          beforeChange={(current, next) => setCurrentSlide(next)}
        >
          {news.map((item, index) => (
            <div key={index} className="p-4">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="flex gap-4">
                  {item.image_url && (
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-blue-600 dark:text-blue-400 mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                      {item.description?.slice(0, 150)}...
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.pubDate).toLocaleString()}
                    </div>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </Carousel>
        <div className="flex items-center justify-center gap-4 p-2 border-t dark:border-gray-700">
          <button
            onClick={handlePrev}
            className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-2"
          >
            <LeftOutlined />
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentSlide + 1}/{news.length}
          </span>
          <button
            onClick={handleNext}
            className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-2"
          >
            <RightOutlined />
          </button>
        </div>
      </div>
      <style jsx>{`
        .news-carousel .ant-carousel .slick-slide {
          padding: 0;
        }
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

export default NewsFeed;
