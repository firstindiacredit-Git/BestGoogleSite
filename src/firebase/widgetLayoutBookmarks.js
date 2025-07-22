import { Bookmark } from "lucide-react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, collection, updateDoc } from "firebase/firestore";

// Default widget configurations for different pages
const defaultWidgets = {
  home: [
    { id: "weather", name: "Weather", isOpen: false, column: 0, position: 0 },
    { id: "clock", name: "Clock", isOpen: false, column: 0, position: 1 },
    { id: "calendar", name: "Calendar", isOpen: false, column: 0, position: 2 },
    {
      id: "calculator",
      name: "Calculator",
      isOpen: false,
      column: 0,
      position: 3,
    },
    {
      id: "Bookmarks",
      name: "Designer (UI/UX, Graphic, Web)",
      isOpen: false,
      column: 1,
      position: 0,
    },
    { id: "Bookmarks1", name: "Developer / Programmer", isOpen: false, column: 2, position: 0 },
    { id: "Bookmarks2", name: "Digital Marketer", isOpen: false, column: 1, position: 1 },
    { id: "Bookmarks3", name: "Student", isOpen: false, column: 2, position: 1 },
    { id: "Bookmarks5", name: "Teacher / Educator", isOpen: true, column: 2, position: 2 },
    { id: "Bookmarks8", name: "Enterprener / Founder", isOpen: true, column: 2, position: 3 },
    { id: "Bookmarks9", name: "Freelancer(Creative or Technical)", isOpen: true, column: 2, position: 4 },
    { id: "Bookmarks10", name: "Consultant / Advisor", isOpen: true, column: 2, position: 5 },
    
    {
      id: "Bookmarks4",
      name: "Working Professional",
      isOpen: false,
      column: 1,
      position: 3,
    },
    { id: "Bookmarks6", name: "Reseacher / Academic", isOpen: true, column: 1, position: 3 },
    { id: "Bookmarks7", name: "IT / Tech Support", isOpen: true, column: 1, position: 4 },
    {
      id: "NewsFeed",
      name: "News Feed",
      isOpen: false,
      column: 3,
      position: 0,
    },
    {
      id: "imageUploader",
      name: "Image Uploader",
      isOpen: false,
      column: 3,
      position: 1,
    },
    { id: "Todo", name: "To do List", isOpen: false, column: 3, position: 2 },
    { id: "notepad", name: "Notepad", isOpen: false, column: 3, position: 3 },
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
  Bookmarks: { id: "Bookmarks", name: "Designer (UI/UX, Graphic, Web)" },
  Bookmarks1: { id: "Bookmarks1", name: "Developer / Programmer" },
  Bookmarks2: { id: "Bookmarks2", name: "Digital Marketer" },
  Bookmarks3: { id: "Bookmarks3", name: "Student" },
  Bookmarks4: { id: "Bookmarks4", name: "Teacher / Educator" },
  Bookmarks5: { id: "Bookmarks5", name: "Enterprener / Founder" },
  Bookmarks6: { id: "Bookmarks6", name: "Freelancer(Creative or Technical)" },
  Bookmarks7: { id: "Bookmarks7", name: "Consultant / Advisor" },
  Bookmarks8: { id: "Bookmarks8", name: "Working Professional" },
  Bookmarks9: { id: "Bookmarks9", name: "Reseacher / Academic" },
  Bookmark10: { id:"Bookmarks10", name: "IT / Tech Support"},
  Todo: { id: "Todo", name: "To do List" },
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

// Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Update bookmark positions with debouncing
export const debouncedUpdateBookmarkPositions = debounce(
  async (userId, categoryId, bookmarks) => {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        [`bookmarkLayouts.${categoryId}`]: {
          bookmarks,
          lastUpdated: new Date().toISOString(),
        },
      });
      return true;
    } catch (error) {
      console.error("Error updating bookmark positions:", error);
      return false;
    }
  },
  4000
); // 4 second debounce delay

// Get bookmark layout for a category
export const getBookmarkLayout = async (userId, categoryId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.bookmarkLayouts?.[categoryId] || { bookmarks: [] };
    }
    return { bookmarks: [] };
  } catch (error) {
    console.error("Error getting bookmark layout:", error);
    return { bookmarks: [] };
  }
};

// Initialize bookmark layouts for a new user
export const initializeBookmarkLayouts = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(
      userDocRef,
      {
        bookmarkLayouts: {},
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error initializing bookmark layouts:", error);
  }
};

// Update a single bookmark's position
export const updateSingleBookmark = async (
  userId,
  categoryId,
  bookmarkId,
  updates
) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      [`bookmarkLayouts.${categoryId}.bookmarks.${bookmarkId}`]: {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    });
    return true;
  } catch (error) {
    console.error("Error updating single bookmark:", error);
    return false;
  }
};

// Debounced function to update category positions
export const debouncedUpdateCategoryPositions = debounce(
  async (userId, categories) => {
    try {
      const userDocRef = doc(db, "users", userId);
      await setDoc(userDocRef, { categories }, { merge: true });
      return true;
    } catch (error) {
      console.error("Error updating category positions:", error);
      return false;
    }
  },
  2000
); // 2 second debounce

// Debounced function to update column layout
export const debouncedUpdateColumnLayout = debounce(
  async (userId, categoryColumns) => {
    try {
      const userDocRef = doc(db, "users", userId);
      await setDoc(userDocRef, { categoryColumns }, { merge: true });
      return true;
    } catch (error) {
      console.error("Error updating column layout:", error);
      return false;
    }
  },
  2000
); // 2 second debounce