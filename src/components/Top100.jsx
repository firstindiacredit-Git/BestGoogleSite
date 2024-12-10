import React, { useState, useEffect } from "react";

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const countries = ["us", "in", "gb", "ca", "au", "de", "fr", "br"]; // List of countries to fetch news for
  const apiKey = "8062ee449f054dfaa9df5baaa2e9a439";

  const fetchNews = async (page) => {
    const cachedData = localStorage.getItem(`news-all-countries-${page}`);
    if (cachedData) {
      const cachedNews = JSON.parse(cachedData);
      setNews(cachedNews.articles);
      setTotalResults(cachedNews.totalResults);
      setLoading(false);
      return;
    }

    const countryParams = countries.join(",");
    // const url = `https://newsapi.org/v2/top-headlines?country=${countryParams}&page=${page}&pageSize=20&apiKey=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data); // Check the API response
      if (data.status === "ok") {
        setNews(data.articles);
        setTotalResults(data.totalResults);
        localStorage.setItem(
          `news-all-countries-${page}`,
          JSON.stringify(data)
        );
      } else {
        throw new Error(data.message || "Something went wrong");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Current page:", page); // Check if page is updating
    fetchNews(page);
  }, [page]);

  const totalPages = Math.ceil(totalResults / 20);

  return (
    <div className="max-w-screen-xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Top News from All Countries
      </h1>

      {loading && <p className="text-center text-lg">Loading news...</p>}
      {error && <p className="text-center text-red-600">{`Error: ${error}`}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((article, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-lg overflow-hidden border"
          >
            {article.urlToImage && (
              <img
                src={article.urlToImage}
                alt={article.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                <h3 className="text-xl font-semibold text-gray-800">
                  {article.title}
                </h3>
              </a>
              <p className="text-gray-600 mt-2">{article.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center space-x-4 mt-6">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
        >
          Previous
        </button>
        <span className="text-lg">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default NewsPage;
