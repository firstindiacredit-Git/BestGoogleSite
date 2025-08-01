import { createContext, useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";

import SkeletonLoader from "./SkeletonLoader";
import { FaList, FaTh } from "react-icons/fa";

// Create NewsContext
const NewsContext = createContext(null);

// NewsProvider component
const NewsProvider = ({ children }) => {
  const [allNews, setAllNews] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const fetchCategoryNews = async (category) => {
    try {
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Use different API endpoints and search terms for better category coverage
      let apiUrl;
      const searchTerms = {
        'india': 'india',
        'latest': '',
        'world': 'world international',
        'business': 'business economy',
        'technology': 'technology tech',
        'sports': 'sports',
        'entertainment': 'entertainment',
        'health': 'health medical',
        'science': 'science research',
        'politics': 'politics government',
        'education': 'education',
        'crime': 'crime',
        'lifestyle': 'lifestyle',
        'automobile': 'automobile cars',
        'weather': 'weather climate',
        'finance': 'finance banking',
        'economy': 'economy economic',
        'startup': 'startup entrepreneurship',
        'ai': 'artificial intelligence AI',
        'cybersecurity': 'cybersecurity security',
        'gaming': 'gaming video games',
        'movies': 'movies film',
        'music': 'music',
        'fashion': 'fashion',
        'travel': 'travel tourism'
      };

      const searchTerm = searchTerms[category] || category;
      
      if (category === 'india') {
        apiUrl = `https://gnews.io/api/v4/top-headlines?q=${searchTerm}&lang=en&country=in&max=10&apikey=d1561b9a1c352425b78fd42024da7255`;
      } else if (category === 'latest') {
        apiUrl = `https://gnews.io/api/v4/top-headlines?lang=en&country=us&max=10&apikey=d1561b9a1c352425b78fd42024da7255`;
      } else {
        apiUrl = `https://gnews.io/api/v4/top-headlines?q=${searchTerm}&lang=en&max=10&apikey=d1561b9a1c352425b78fd42024da7255`;
      }
      
      const res = await fetch(apiUrl);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const newsData = await res.json();
      return newsData.articles || [];
    } catch (error) {
      console.error(`Error fetching ${category} news:`, error);
      return [];
    }
  };

  const fetchAllNews = async () => {
    setLoading(true);
    const categories = [
      "india", "latest", "world", "business", "technology", 
      "sports", "entertainment", "health", "science", "politics", 
      "education", "crime", "lifestyle", "automobile", "weather",
      "finance", "economy", "startup", "ai", "cybersecurity",
      "gaming", "movies", "music", "fashion", "travel"
    ];

    // Fetch categories in batches to avoid overwhelming the API
    const batchSize = 5;
    const newsByCategory = {};
    
    for (let i = 0; i < categories.length; i += batchSize) {
      const batch = categories.slice(i, i + batchSize);
      const batchPromises = batch.map(async (category) => {
        const news = await fetchCategoryNews(category);
        return { category, news };
      });

      try {
        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(({ category, news }) => {
          if (news && news.length > 0) {
            newsByCategory[category] = news;
          }
        });
        
        // Update progress
        const progress = Math.round(((i + batchSize) / categories.length) * 100);
        setLoadingProgress(Math.min(progress, 100));
      } catch (error) {
        console.error(`Error fetching batch ${i / batchSize + 1}:`, error);
      }
    }

    setAllNews(newsByCategory);
    setLoading(false);
    setLoadingProgress(0);
  };

  useEffect(() => {
    fetchAllNews();
  }, []);

  return (
    <NewsContext.Provider value={{ allNews, loading, loadingProgress, fetchAllNews }}>
      {children}
    </NewsContext.Provider>
  );
};

NewsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Main NewsApp component
const NewsApp = () => {
  const { allNews, loading, loadingProgress } = useContext(NewsContext);
  const [viewMode, setViewMode] = useState("grid");

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
    { key: "weather", label: "Weather" },
    { key: "finance", label: "Finance" },
    { key: "economy", label: "Economy" },
    { key: "startup", label: "Startup" },
    { key: "ai", label: "AI & Machine Learning" },
    { key: "cybersecurity", label: "Cybersecurity" },
    { key: "gaming", label: "Gaming" },
    { key: "movies", label: "Movies" },
    { key: "music", label: "Music" },
    { key: "fashion", label: "Fashion" },
    { key: "travel", label: "Travel" }
  ];

  const renderNewsCard = (news, index) => (
    <div
      key={index}
      className="bg-white/[var(--widget-opacity)] backdrop-blur-sm dark:bg-[#28283a]/[var(--widget-opacity)] flex flex-col justify-between h-[30rem] overflow-hidden p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
    >
      <div className="w-full">
        <img
          alt={news.title}
          src={news.image}
          className="h-[18rem] w-full object-cover rounded-md"
          onError={(e) => {
            e.target.src =
              "https://plus.unsplash.com/premium_photo-1707080369554-359143c6aa0b?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bmV3cyUyMHdlYnNpdGV8ZW58MHx8MHx8fDA%3D";
          }}
        />
      </div>
      <div>
        <a href={news.url} target="_blank" rel="noopener noreferrer">
          <div className="dark:text-white font-bold py-2 line-clamp-2">
            {news.title}
          </div>
        </a>

        <a href={news.url} target="_blank" rel="noopener noreferrer">
          <div className="dark:text-gray-300 text-sm line-clamp-3 max-w-[80ch] truncate overflow-ellipsis py-2">
            {news.description}
          </div>
        </a>
      </div>
      <a href={news.url} target="_blank" rel="noopener noreferrer">
        <button className="bg-indigo-500 w-full rounded-lg py-2 text-white hover:bg-indigo-600 transition-colors duration-200">
          Read More
        </button>
      </a>
    </div>
  );

  const renderNewsListItem = (news, index) => (
    <div
      key={index}
      className="bg-white/[var(--widget-opacity)] dark:bg-[#332B4A]/[var(--widget-opacity)] backdrop-blur-sm rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/4">
          <img
            alt={news.title}
            src={news.image}
            className="w-full h-48 md:h-32 object-cover rounded-lg"
            onError={(e) => {
              e.target.src =
                "https://plus.unsplash.com/premium_photo-1707080369554-359143c6aa0b?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bmV3cyUyMHdlYnNpdGV8ZW58MHx8MHx8fDA%3D";
            }}
          />
        </div>
        <div className="md:w-3/4 flex flex-col justify-between">
          <div>
            <a href={news.url} target="_blank" rel="noopener noreferrer">
              <h3 className="dark:text-white font-bold text-lg mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                {news.title}
              </h3>
            </a>
            <p className="dark:text-gray-300 text-sm line-clamp-3 mb-3">
              {news.description}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {news.publishedAt ? new Date(news.publishedAt).toLocaleDateString() : 'No date'}
            </span>
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors duration-200"
            >
              Read more →
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="space-y-12">
      {menuItems.map((item) => {
        const categoryNews = allNews[item.key];
        if (!categoryNews || categoryNews.length === 0) return null;

        return (
          <div key={item.key} className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-2">{item.label} News</h2>
              <p className="text-indigo-100">Latest updates from {item.label.toLowerCase()} category</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {categoryNews.map((news, index) => renderNewsCard(news, index))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-12">
      {menuItems.map((item) => {
        const categoryNews = allNews[item.key];
        if (!categoryNews || categoryNews.length === 0) return null;

        return (
          <div key={item.key} className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-2">{item.label} News</h2>
              <p className="text-indigo-100">Latest updates from {item.label.toLowerCase()} category</p>
            </div>
            <div className="space-y-4">
              {categoryNews.map((news, index) => renderNewsListItem(news, index))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex mb-5 flex-wrap gap-2 justify-between items-center sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm py-2">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold dark:text-white">All News Categories</h1>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Object.keys(allNews).length} categories loaded
          </span>
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
          <div className="text-center mb-8">
            <div className="text-2xl font-bold dark:text-white mb-4">Loading News Categories...</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {loadingProgress}% Complete
            </div>
          </div>
          <SkeletonLoader count={10} isListView={viewMode === "list"} />
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {viewMode === "grid" ? renderGridView() : renderListView()}
        </div>
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
