import { db } from "../firebase";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";

// Default widget configurations for different pages
const defaultWidgets = {
  home: [
    { id: "weather", name: "Weather", isOpen: true, column: 0, position: 0 },
    { id: "clock", name: "Clock", isOpen: true, column: 0, position: 1 },
    { id: "calendar", name: "Calendar", isOpen: true, column: 0, position: 2 },
    {
      id: "calculator",
      name: "Calculator",
      isOpen: true,
      column: 0,
      position: 3,
    },
    {
      id: "Bookmarks",
      name: "Popular Bookmarks",
      isOpen: true,
      column: 1,
      position: 0,
    },
    { id: "Bookmarks1", name: "AI", isOpen: true, column: 2, position: 0 },
    { id: "Bookmarks2", name: "Travel", isOpen: true, column: 1, position: 1 },
    { id: "Bookmarks3", name: "Sports", isOpen: true, column: 2, position: 1 },
    {
      id: "Bookmarks4",
      name: "Shopping",
      isOpen: true,
      column: 1,
      position: 3,
    },
    {
      id: "Bookmarks5",
      name: "News",
      isOpen: true,
      column: 1,
      position: 4,
    },
    { id: "NewsFeed", name: "News Feed", isOpen: true, column: 3, position: 1 },
    {
      id: "imageUploader",
      name: "Image Uploader",
      isOpen: true,
      column: 3,
      position: 0,
    },
    { id: "Todo", name: "Todo List", isOpen: true, column: 3, position: 2 },
    { id: "notepad", name: "Notepad", isOpen: true, column: 3, position: 3 },
  ],
};

// List of all available widgets
export const allWidgets = {
  clock: { id: "clock", name: "Clock" },
  weather: { id: "weather", name: "Weather" },
  calculator: { id: "calculator", name: "Calculator" },
  notepad: { id: "notepad", name: "Notepad" },
  imageUploader: { id: "imageUploader", name: "Image Uploader" },
  calendar: { id: "calendar", name: "Calendar" },
  Bookmarks: { id: "Bookmarks", name: "Popular Bookmarks" },
  Bookmarks1: { id: "Bookmarks1", name: "AI" },
  Bookmarks2: { id: "Bookmarks2", name: "Travel" },
  Bookmarks3: { id: "Bookmarks3", name: "Sports" },
  Bookmarks4: { id: "Bookmarks4", name: "Shopping" },
  Bookmarks5: { id: "Bookmarks5", name: "News" },
  Todo: { id: "Todo", name: "Todo List" },
  NewsFeed: { id: "NewsFeed", name: "News Feed" },
};

// Get available widgets that aren't already in use
export const getAvailableWidgets = (currentWidgets) => {
  const usedWidgetIds = new Set(currentWidgets.map((w) => w.id));
  return Object.values(allWidgets).filter(
    (widget) => !usedWidgetIds.has(widget.id)
  );
};

// Initialize default layout for a new user
export const initializeUserLayout = async (userId) => {
  try {
    const userLayoutRef = doc(db, "users", userId, "layouts", "widgets");
    const layoutDoc = await getDoc(userLayoutRef);

    if (!layoutDoc.exists()) {
      await setDoc(userLayoutRef, {
        home: {
          widgets: defaultWidgets.home,
          columns: 4,
        },
        // popularBookmarks: {
        //   widgets: defaultWidgets.popularBookmarks,
        //   columns: 4
        // }
      });
    }
  } catch (error) {
    console.error("Error initializing user layout:", error);
  }
};

// Function to calculate optimal columns based on window width
const calculateOptimalColumns = (windowWidth) => {
  const minWidgetWidth = 350; // Minimum width for a widget
  const padding = 32; // Account for container padding
  const availableWidth = windowWidth - padding;
  const calculatedColumns = Math.floor(availableWidth / minWidgetWidth);
  return Math.min(Math.max(calculatedColumns, 1), 4); // Limit between 1 and 4 columns
};

// Function to redistribute widgets across new column count
const redistributeWidgets = (widgets, newColumnCount) => {
  if (!widgets || !widgets.length) return [];

  // Sort widgets by their current position
  const sortedWidgets = [...widgets].sort((a, b) => a.position - b.position);

  // Redistribute widgets across new columns
  return sortedWidgets.map((widget, index) => ({
    ...widget,
    column: index % newColumnCount,
    position: Math.floor(index / newColumnCount),
  }));
};

// Get layout for a specific page
export const getPageLayout = async (userId, pageName) => {
  try {
    const userLayoutRef = doc(db, "users", userId, "layouts", "widgets");
    const layoutDoc = await getDoc(userLayoutRef);
    const windowWidth = window.innerWidth;
    const optimalColumns = calculateOptimalColumns(windowWidth);

    if (layoutDoc.exists()) {
      const data = layoutDoc.data();
      const pageData = data[pageName] || {
        widgets: defaultWidgets[pageName] || [],
        columns: optimalColumns,
      };

      // Redistribute widgets if column count changed
      if (pageData.columns !== optimalColumns) {
        pageData.widgets = redistributeWidgets(
          pageData.widgets,
          optimalColumns
        );
        pageData.columns = optimalColumns;

        // Update the layout with new distribution
        await updatePageLayout(userId, pageName, pageData);
      }

      return pageData;
    }

    // For new layouts, use optimal column count
    const defaultLayout = {
      widgets: defaultWidgets[pageName] || [],
      columns: optimalColumns,
    };

    if (defaultLayout.widgets.length) {
      defaultLayout.widgets = redistributeWidgets(
        defaultLayout.widgets,
        optimalColumns
      );
    }

    return defaultLayout;
  } catch (error) {
    console.error("Error getting page layout:", error);
    return {
      widgets: defaultWidgets[pageName] || [],
      columns: 4,
    };
  }
};

// Update layout for a specific page
export const updatePageLayout = async (userId, pageName, layout) => {
  try {
    const userLayoutRef = doc(db, "users", userId, "layouts", "widgets");
    const layoutDoc = await getDoc(userLayoutRef);
    const windowWidth = window.innerWidth;
    const optimalColumns = calculateOptimalColumns(windowWidth);

    // Ensure layout uses optimal column count
    if (layout.columns !== optimalColumns) {
      layout.columns = optimalColumns;
      layout.widgets = redistributeWidgets(layout.widgets, optimalColumns);
    }

    let currentData = {};
    if (layoutDoc.exists()) {
      currentData = layoutDoc.data();
    }

    await setDoc(userLayoutRef, {
      ...currentData,
      [pageName]: layout,
    });

    return true;
  } catch (error) {
    console.error("Error updating page layout:", error);
    return false;
  }
};

// Remove widget from a page
export const removeWidgetFromPage = async (userId, pageName, widgetId) => {
  try {
    const layout = await getPageLayout(userId, pageName);
    const updatedWidgets = layout.widgets.filter(
      (widget) => widget.id !== widgetId
    );

    // Recalculate positions for remaining widgets
    updatedWidgets.forEach((widget, index) => {
      widget.position = index;
    });

    await updatePageLayout(userId, pageName, {
      ...layout,
      widgets: updatedWidgets,
    });

    return true;
  } catch (error) {
    console.error("Error removing widget:", error);
    return false;
  }
};

// Function to reset page layout to default
export const resetPageLayout = async (userId, pageName) => {
  try {
    const userLayoutRef = doc(db, "users", userId, "layouts", "widgets");
    const windowWidth = window.innerWidth;
    const optimalColumns = calculateOptimalColumns(windowWidth);

    // Get default layout with optimal columns
    const defaultLayout = {
      widgets: defaultWidgets[pageName] || [],
      columns: optimalColumns,
    };

    // Redistribute widgets if needed
    if (defaultLayout.widgets.length) {
      defaultLayout.widgets = redistributeWidgets(
        defaultLayout.widgets,
        optimalColumns
      );
    }

    // Update the layout in Firestore
    let currentData = {};
    const layoutDoc = await getDoc(userLayoutRef);
    if (layoutDoc.exists()) {
      currentData = layoutDoc.data();
    }

    await setDoc(userLayoutRef, {
      ...currentData,
      [pageName]: defaultLayout,
    });

    return defaultLayout;
  } catch (error) {
    console.error("Error resetting page layout:", error);
    throw error;
  }
};
