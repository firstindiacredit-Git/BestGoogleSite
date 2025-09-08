import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Determine if this is production
const isProduction = import.meta.env.PROD;

// Optimize service worker registration
if (isProduction && "serviceWorker" in navigator) {
  // Use requestIdleCallback for better performance
  const registerSW = () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker registered with scope:", registration.scope);
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(registerSW);
  } else {
    setTimeout(registerSW, 0);
  }
}

// Optimized performance reporting
function reportPerformance() {
  if (window.performance && "getEntriesByType" in window.performance) {
    // Use requestIdleCallback for non-blocking performance reporting
    const report = () => {
      const perfEntries = performance.getEntriesByType("navigation");
      if (perfEntries.length > 0) {
        const metrics = perfEntries[0];
        const domLoadTime = metrics.domContentLoadedEventEnd - metrics.startTime;
        const fullLoadTime = metrics.loadEventEnd - metrics.startTime;
        
        console.log("Time to load (DOMContentLoaded):", domLoadTime, "ms");
        console.log("Time to render (Load):", fullLoadTime, "ms");
        
        // Log performance warnings
        if (domLoadTime > 3000) {
          console.warn("Slow DOM load time detected:", domLoadTime, "ms");
        }
        if (fullLoadTime > 5000) {
          console.warn("Slow full load time detected:", fullLoadTime, "ms");
        }
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(report);
    } else {
      setTimeout(report, 1000);
    }
  }
}

// Optimize app mounting with error boundary
const mountApp = () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found");
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error("Failed to mount app:", error);
  }
};

// Use requestIdleCallback for better performance
if ('requestIdleCallback' in window) {
  requestIdleCallback(mountApp);
} else {
  // Fallback for browsers without requestIdleCallback
  setTimeout(mountApp, 0);
}

// Report performance if in development
if (!isProduction) {
  reportPerformance();
}
