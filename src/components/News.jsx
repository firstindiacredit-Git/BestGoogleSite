import React, { useEffect, useState } from "react";
import axios from "axios";

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [country, setCountry] = useState("us"); // Default to India
  const [category, setCategory] = useState("general");
  const [language, setLanguage] = useState("en"); // Default to English

  const categories = [
    "general",
    "business",
    "technology",
    "health",
    "sports",
    "entertainment",
  ];

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    // Add more languages as needed
  ];

  const countries = [
    { code: "us", name: "United States" },
    { code: "in", name: "India" },
    { code: "gb", name: "United Kingdom" },
    { code: "au", name: "Australia" },
    { code: "ca", name: "Canada" },
    // Add more countries as needed
  ];

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching news for:", country, category, language); // Debug log
        const response = await axios.get(
          `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&language=${language}&apiKey=8062ee449f054dfaa9df5baaa2e9a439`
        );

        console.log("Response:", response.data); // Debug log
        if (response.data.articles && response.data.articles.length > 0) {
          setArticles(response.data.articles);
        } else {
          setError("No news articles found for this selection.");
        }
      } catch (err) {
        setError(
          "Failed to fetch news. Please try a different category or country."
        );
      }
      setLoading(false);
    };

    fetchNews();
  }, [country, category, language]);

  if (loading)
    return <p className="text-center text-lg text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-5">
      <h1 className="text-3xl font-bold text-center mb-6">Latest News</h1>

      {/* Country Selector */}
      <div className="flex space-x-2 mb-2 ">
        <div className="flex space-x-2 justify-center mb-4">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="p-2 border-2 rounded-3xl text-gray-800"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {/* Language Selector */}
        <div className="flex justify-center mb-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="p-2  border-2 rounded-3xl text-gray-800"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Buttons */}
      <div className="flex justify-center space-x-3 mb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full ${
              category === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto h-[75vh] p-2">
        {articles.map((article, index) => (
          <div
            key={index}
            className="border rounded-lg shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200"
          >
            {article.urlToImage && (
              <img
                src={article.urlToImage}
                alt={article.title}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
            )}
            <h2 className="text-lg  font-semibold mb-2">{article.title}</h2>
            <p className="text-gray-700 dark:text-blue-500 flex-grow">{article.description}</p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 mt-4 hover:underline"
            >
              Read more
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News;
