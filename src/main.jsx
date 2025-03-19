import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Determine if this is production
const isProduction = import.meta.env.PROD;

// Register the service worker only in production
if (isProduction && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope
        );
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}

// Create a function to measure and report performance metrics
function reportPerformance() {
  if (window.performance && "getEntriesByType" in window.performance) {
    setTimeout(() => {
      const perfEntries = performance.getEntriesByType("navigation");
      if (perfEntries.length > 0) {
        const metrics = perfEntries[0];
        console.log(
          "Time to load (DOMContentLoaded):",
          metrics.domContentLoadedEventEnd - metrics.startTime,
          "ms"
        );
        console.log(
          "Time to render (Load):",
          metrics.loadEventEnd - metrics.startTime,
          "ms"
        );
      }
    }, 1000);
  }
}

// Mount the app
createRoot(document.getElementById("root")).render(<App />);

// Report performance if in development
if (!isProduction) {
  reportPerformance();
}
