import { db } from '../firebase';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';

// Default widget configurations for different pages
const defaultWidgets = {
  home: [
    { id: "clock", name: "Clock", isOpen: false, column: 0, position: 0 },
    { id: "weather", name: "Weather", isOpen: false, column: 0, position: 1 },
    { id: "calculator", name: "Calculator", isOpen: false, column: 0, position: 2 },
    { id: "notepad", name: "Notepad", isOpen: false, column: 1, position: 0 },
    { id: "imageUploader", name: "Image Uploader", isOpen: false, column: 2, position: 0 },
    { id: "calendar", name: "Calendar", isOpen: false, column: 2, position: 1 },
    { id: "Bookmarks", name: "Bookmarks", isOpen: false, column: 2, position: 2 }, 
    { id: "NewsFeed", name: "News Feed", isOpen: false, column: 0, position: 3 }, 
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
  Bookmarks: { id: "Bookmarks", name: "Bookmarks" },
  Todo: { id: "Todo", name: "Todo List" },
  NewsFeed: { id: "NewsFeed", name: "News Feed" }
};

// Get available widgets that aren't already in use
export const getAvailableWidgets = (currentWidgets) => {
  const usedWidgetIds = new Set(currentWidgets.map(w => w.id));
  return Object.values(allWidgets).filter(widget => !usedWidgetIds.has(widget.id));
};

// Initialize default layout for a new user
export const initializeUserLayout = async (userId) => {
  try {
    const userLayoutRef = doc(db, 'users', userId, 'layouts', 'widgets');
    const layoutDoc = await getDoc(userLayoutRef);

    if (!layoutDoc.exists()) {
      await setDoc(userLayoutRef, {
        home: {
          widgets: defaultWidgets.home,
          columns: 3
        },
        popularBookmarks: {
          widgets: defaultWidgets.popularBookmarks,
          columns: 3
        }
      });
    }
  } catch (error) {
    console.error('Error initializing user layout:', error);
  }
};

// Get layout for a specific page
export const getPageLayout = async (userId, pageName) => {
  try {
    const userLayoutRef = doc(db, 'users', userId, 'layouts', 'widgets');
    const layoutDoc = await getDoc(userLayoutRef);

    if (layoutDoc.exists()) {
      const data = layoutDoc.data();
      return data[pageName] || {
        widgets: defaultWidgets[pageName] || [],
        columns: 3
      };
    }

    return {
      widgets: defaultWidgets[pageName] || [],
      columns: 3
    };
  } catch (error) {
    console.error('Error getting page layout:', error);
    return {
      widgets: defaultWidgets[pageName] || [],
      columns: 3
    };
  }
};

// Update layout for a specific page
export const updatePageLayout = async (userId, pageName, layout) => {
  try {
    const userLayoutRef = doc(db, 'users', userId, 'layouts', 'widgets');
    const layoutDoc = await getDoc(userLayoutRef);
    
    let currentData = {};
    if (layoutDoc.exists()) {
      currentData = layoutDoc.data();
    }

    await setDoc(userLayoutRef, {
      ...currentData,
      [pageName]: layout
    });

    return true;
  } catch (error) {
    console.error('Error updating page layout:', error);
    return false;
  }
};

// Remove widget from a page
export const removeWidgetFromPage = async (userId, pageName, widgetId) => {
  try {
    const layout = await getPageLayout(userId, pageName);
    const updatedWidgets = layout.widgets.filter(widget => widget.id !== widgetId);
    
    // Recalculate positions for remaining widgets
    updatedWidgets.forEach((widget, index) => {
      widget.position = index;
    });

    await updatePageLayout(userId, pageName, {
      ...layout,
      widgets: updatedWidgets
    });

    return true;
  } catch (error) {
    console.error('Error removing widget:', error);
    return false;
  }
};