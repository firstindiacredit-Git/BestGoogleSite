import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { Back } from './back';

const GoogleMap = () => {
  const [query, setQuery] = useState('');
  const [total, setTotal] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://saasbackend.pizeonfly.com/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, total }),
      });

      if (response.ok) {
        const blob = await response.blob();
        saveAs(blob, 'google_maps_data.xlsx');
      } else {
        console.error('Error downloading file');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-2 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="relative p-4 sm:p-6">
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
              <Back />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-black">
              Google Maps Data Extractor
            </h1>
          </div>

          {/* Main Content */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="space-y-6">
              {/* Search Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Term
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter search term (e.g., 'restaurants in New York')"
                  className="w-full px-4 sm:px-6 py-3 bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl border border-gray-100 shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Results
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    min="1"
                    max="100"
                    placeholder="Enter number of results"
                    className="w-full px-4 sm:px-6 py-3 bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl border border-gray-100 shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    results
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleSearch}
                  disabled={loading || !query.trim()}
                  className={`px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-3.5 rounded-xl text-base sm:text-lg font-medium transition-all duration-200 ${
                    loading || !query.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                  } text-white min-w-[200px]`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Extracting Data...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download Excel
                    </div>
                  )}
                </button>
              </div>

              {/* Helper Text */}
              <div className="text-center text-sm text-gray-500 mt-4">
                Data will be downloaded as an Excel file containing business information from Google Maps
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMap;
