import { useState } from "react";
import { Back } from "./back";

const TrafficChecker = () => {
  const [url, setUrl] = useState("");
  const [trafficData, setTrafficData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const extractDomain = (inputUrl) => {
    try {
      const { hostname } = new URL(inputUrl);
      return hostname.replace(/^www\./, "");
    } catch {
      return inputUrl;
    }
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!url) {
      setError("Please enter a valid URL");
      return;
    }
    setError("");
    setLoading(true);
    const domain = extractDomain(url);

    try {
      const response = await fetch(
        `https://similarweb-traffic.p.rapidapi.com/traffic?domain=${domain}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-rapidapi-key": "4418627201msh7986898a90dc9b9p11b3a7jsn0fc2cf19b847",
            "x-rapidapi-host": "similarweb-traffic.p.rapidapi.com",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        const trafficSources = data?.TrafficSources || {};
        const topCountries = data?.TopCountryShares?.map(
          (country) => `${country.CountryCode} (${(country.Value * 100).toFixed(2)}%)`
        );

        setTrafficData({
          totalVisits: data?.Engagments?.Visits || "N/A",
          topCountries: topCountries || [],
          trafficSources: {
            Direct: (trafficSources.Direct || 0) * 100,
            Search: (trafficSources.Search || 0) * 100,
            Social: (trafficSources.Social || 0) * 100,
            Mail: (trafficSources.Mail || 0) * 100,
            Referrals: (trafficSources.Referrals || 0) * 100,
            PaidReferrals: (trafficSources["Paid Referrals"] || 0) * 100,
          },
        });
      } else {
        setError(data.message || "No traffic data available for this domain.");
      }
    } catch (err) {
      setError("An error occurred while fetching traffic data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex justify-center pt-8">
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-[30px] shadow-lg overflow-hidden">
          <div className="p-4 relative">
            <div className="absolute top-6 left-4">
              <Back />
            </div>
            
            <h1 className="text-xl font-bold text-center text-gray-800 mb-4 pt-2">
              Website Traffic Checker
            </h1>

            <div className="grid gap-3 max-w-xl mx-auto">
              {/* Input Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3">
                <label className="block text-gray-700 text-base font-semibold mb-1">
                  Website URL
                </label>
                <form onSubmit={handleUrlSubmit} className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter Website URL (e.g., https://example.com)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                  />
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      disabled={loading}
                    >
                      {loading ? "Checking..." : "Check Traffic"}
                    </button>
                  </div>
                </form>
                {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
              </div>

              {/* Results Section */}
              {trafficData && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3">
                  <h2 className="text-base font-semibold text-gray-700 mb-2">
                    Traffic Data for {extractDomain(url)}
                  </h2>
                  <div className="space-y-2">
                    <div className="bg-white rounded-lg p-2 border-2 border-gray-200">
                      <p className="text-sm font-semibold text-gray-600">Total Visits</p>
                      <p className="text-lg font-bold text-gray-800">{trafficData.totalVisits}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-2 border-2 border-gray-200">
                      <p className="text-sm font-semibold text-gray-600">Top Countries</p>
                      <p className="text-sm text-gray-800">
                        {trafficData.topCountries.length > 0
                          ? trafficData.topCountries.join(", ")
                          : "N/A"}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-2 border-2 border-gray-200">
                      <p className="text-sm font-semibold text-gray-600 mb-1">Traffic Sources</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(trafficData.trafficSources).map(([source, value]) => (
                          <div key={source} className="text-sm">
                            <span className="text-gray-600">{source}:</span>{" "}
                            <span className="font-semibold text-gray-800">
                              {value.toFixed(2)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficChecker;
