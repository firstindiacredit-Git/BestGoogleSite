import React, { useState, useEffect } from "react";
import { FaWifi, FaExclamationTriangle } from "react-icons/fa";

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine);
    setInitialLoad(false);

    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      // Hide the banner after 3 seconds when connection is restored
      const timer = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Show banner immediately if offline on initial load
    if (!navigator.onLine && !initialLoad) {
      setShowBanner(true);
    }

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [initialLoad]);

  // Don't render anything if we should not show the banner
  if (!showBanner) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
        showBanner ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
          isOnline ? "bg-green-500 text-white" : "bg-gray-900 text-white"
        }`}
      >
        <div className="flex items-center gap-3 min-w-[200px]">
          {isOnline ? (
            <FaWifi className="h-5 w-5" />
          ) : (
            <FaExclamationTriangle className="h-5 w-5" />
          )}
          <span className="font-medium whitespace-nowrap">
            {isOnline ? "You're back online" : "No Internet Connection"}
          </span>
        </div>

        {!isOnline && (
          <button
            onClick={() => window.location.reload()}
            className="ml-4 px-3 py-1 text-sm bg-white/10 hover:bg-white/20 rounded-md transition-colors duration-200"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

// Add these buttons for testing (remove in production)
{
  process.env.NODE_ENV === "development" && (
    <div className="fixed top-4 right-4 space-x-2">
      <button
        onClick={() => window.dispatchEvent(new Event("offline"))}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Test Offline
      </button>
      <button
        onClick={() => window.dispatchEvent(new Event("online"))}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Test Online
      </button>
    </div>
  );
}

export default NetworkStatus;
