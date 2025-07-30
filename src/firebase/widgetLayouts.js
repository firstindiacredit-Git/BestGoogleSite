import { Support } from "@mui/icons-material";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Add debounce utility at the top of the file
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Default widget configurations for different pages
export const defaultWidgets = {
  home: [
    // Column 0
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

    // Column 3 (4th column): Forced widgets in order
    {
      id: "imageUploader",
      name: "Image Uploader",
      isOpen: true,
      column: 3,
      position: 0,
    },
    { id: "NewsFeed", name: "News Feed", isOpen: true, column: 3, position: 1 },
    { id: "notepad", name: "Notepad", isOpen: true, column: 3, position: 2 },
    { id: "Todo", name: "To Do List", isOpen: true, column: 3, position: 3 },
  ],
};

// List of all available widgets
export const allWidgets = {
  clock: { id: "clock", name: "Clock" },
  weather: { id: "weather", name: "Weather" },
  calculator: { id: "calculator", name: "Calculator" },
  notepad: { id: "notepad", name: "Notepad" },
  imageUploader: { id: "imageUploader", name: "Image" },
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
  Bookmarks10: { id: "Bookmarks10", name: "IT / Tech Support" },
  Todo: { id: "Todo", name: "To Do List" },
  NewsFeed: { id: "NewsFeed", name: "Latest News" },
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
      });
    }
  } catch (error) {
    console.error("Error initializing user layout:", error);
  }
};

// (redistributeWidgets removed as unused)

// Add or export updatePageLayout for direct Firestore updates
export const updatePageLayout = async (userId, pageName, layout) => {
  try {
    const userLayoutRef = doc(db, "users", userId, "layouts", "widgets");
    const layoutDoc = await getDoc(userLayoutRef);

    let currentData = {};
    if (layoutDoc.exists()) {
      currentData = layoutDoc.data();
    }

    await setDoc(userLayoutRef, {
      ...currentData,
      [pageName]: {
        widgets: layout.widgets,
        columns: layout.columns,
      },
    });

    return true;
  } catch (error) {
    console.error("Error updating page layout:", error);
    return false;
  }
};

// Get layout for a specific page
export const getPageLayout = async (userId, pageName) => {
  try {
    const userLayoutRef = doc(db, "users", userId, "layouts", "widgets");
    const layoutDoc = await getDoc(userLayoutRef);

    if (layoutDoc.exists()) {
      const data = layoutDoc.data();
      const pageData = data[pageName] || {
        widgets: defaultWidgets[pageName] || [],
        columns: 4, // Default columns if not set
      };

      return pageData; // Return the exact data from DB
    }

    return {
      widgets: defaultWidgets[pageName] || [],
      columns: 4,
    };
  } catch (error) {
    console.error("Error getting page layout:", error);
    return {
      widgets: defaultWidgets[pageName] || [],
      columns: 4,
    };
  }
};

// Add debounced version of updatePageLayout
export const debouncedUpdatePageLayout = debounce(
  async (userId, pageName, layout) => {
    try {
      const userLayoutRef = doc(db, "users", userId, "layouts", "widgets");
      const layoutDoc = await getDoc(userLayoutRef);

      let currentData = {};
      if (layoutDoc.exists()) {
        currentData = layoutDoc.data();
      }

      await setDoc(userLayoutRef, {
        ...currentData,
        [pageName]: {
          widgets: layout.widgets,
          columns: layout.columns,
        },
      });

      return true;
    } catch (error) {
      console.error("Error updating page layout:", error);
      return false;
    }
  },
  4000
); // 1 second debounce delay

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
    const optimalColumns = 4;

    // Get default layout with optimal columns
    const defaultLayout = {
      widgets: defaultWidgets[pageName] || [],
      columns: optimalColumns,
    };
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

// Add default bookmarks for non-logged in users
export const defaultBookmarks = {
  "Designer (UI/UX, Graphic, Web)": {
    "Tranding": [
      {
        id: "popular1",
        name: "Google Search",
        link: "https://www.google.com",
        addedByAdmin: true,
      },
      {
        id: "popular2",
        name: "ChatGPT",
        link: "https://chat.openai.com",
        addedByAdmin: true,
      },
       {
        id: "popular3",
        name: "GitHub",
        link: "https://www.github.com",
        addedByAdmin: true,
      },
       {
        id: "popular4",
        name: "Hacker News",
        link: "https://news.ycombinator.com",
        addedByAdmin: true,
      },
       {
        id: "popular6",
        name: "Khan Academy",
        link: "https://www.khanacademy.org",
        addedByAdmin: true,
      },
    ],
    "Most Liked": [
      {
        id: "popular3",
        name: "Facebook",
        link: "https://www.facebook.com",
        addedByAdmin: true,
      },
        {
          id: "popular4",
          name: "Twitter",
          link: "https://www.twitter.com",
          addedByAdmin: true,
        },
        {
          id: "popular5",
          name: "YouTube",
          link: "https://www.youtube.com",
          addedByAdmin: true,
        },
        {
          id: "popular7",
          name: "Reddit",
          link: "https://www.reddit.com",
          addedByAdmin: true,
        },
        {
          id: "popular9",
          name: "Instagram",
          link: "https://www.instagram.com",
          addedByAdmin: true,
        }, 

    ],
  },
  "Developer / Programmer": {
    "Most Favoured": [
      {
        id: "ai1",
        name: "ChatGPT",
        link: "https://chat.openai.com",
        addedByAdmin: true,
      },
      {
        id: "ai2",
        name: "TikTok ",
        link: "https://www.tiktok.com",
        addedByAdmin: true,
      },
      {
        id: "ai3",
        name: " Discord ",
        link: "https://www.discord.com",
        addedByAdmin: true,
      },  {
        id: "ai4",
        name: "TradingView",
        link: "https://www.tradingview.com",
        addedByAdmin: true,
      },  {
        id: "ai5",
        name: "Canva",
        link: "https://www.canva.com",
        addedByAdmin: true,
      },

    ],
    "Most Viewed": [
      {
        id: "ai3",
        name: "Google ",
        link: "https://www.google.com",
        addedByAdmin: true,
      },
      {
        id: "ai4",
        name: "YouTube ",
        link: "https://www.youtube.com",
        addedByAdmin: true,
      },
      {
        id: "ai6",
        name: "Facebook  ",
        link: "https://www.facebook.com",
        addedByAdmin: true,
      },
       {
        id: "ai7",
        name: "Instagram ",
        link: "https://www.instagram.com",
        addedByAdmin: true,
      },
       {
        id: "ai9",
        name: "Twitter  ",
        link: "https://www.twitter.com",
        addedByAdmin: true,
      },
    ],
  },
  "Digital Marketer": {
    "Editor's Pick": [
      {
        id: "travel1",
        name: "Notion",
        link: "https://www.notion.so",
        addedByAdmin: true,
      },
      {
        id: "travel2",
        name: "TED",
        link: "https://www.ted.com",
        addedByAdmin: true,
      },
       {
        id: "travel3",
        name: "Product Hunt",
        link: "https://www.producthunt.com",
        addedByAdmin: true,
      },
       {
        id: "travel4",
        name: "CodePen",
        link: "https://www.codepen.io",
        addedByAdmin: true,
      },
      {
        id: "travel6",
        name: "Unsplash",
        link: "https://www.unsplash.com",
        addedByAdmin: true,
      },
    ],
    "Recently Added": [
      {
        id: "travel3",
        name: "Expedia",
        link: "https://www.expedia.com",
        addedByAdmin: true,
      },
      {
        id: "travel4",
        name: "Kayak",
        link: "https://www.kayak.com",
        addedByAdmin: true,
      },
       {
        id: "travel7",
        name: "Booking.com",
        link: "https://www.booking.com",
        addedByAdmin: true,
      },
       {
        id: "travel4",
        name: "Airbnb",
        link: "https://www.airbnb.com",
        addedByAdmin: true,
      }, 
      {
        id: "travel8",
        name: "TripAdvisor",
        link: "https://www.tripadvisor.com",
        addedByAdmin: true,
      },

    ],
  },
  Student: {
    News: [
      {
        id: "sports1",
        name: "ESPN",
        link: "https://www.espn.com",
        addedByAdmin: true,
      },
      {
        id: "sports2",
        name: "BBC Sport",
        link: "https://www.bbc.com/sport",
        addedByAdmin: true,
      },
    ],
    Leagues: [
      {
        id: "sports3",
        name: "NBA",
        link: "https://www.nba.com",
        addedByAdmin: true,
      },
      {
        id: "sports4",
        name: "FIFA",
        link: "https://www.fifa.com",
        addedByAdmin: true,
      },
    ],
  },
  "Teacher / Educator": {
    "E-Commerce": [
      {
        id: "shopping1",
        name: "Amazon",
        link: "https://www.amazon.com",
        addedByAdmin: true,
      },
      {
        id: "shopping2",
        name: "eBay",
        link: "https://www.ebay.com",
        addedByAdmin: true,
      },
    ],
    Retail: [
      {
        id: "shopping3",
        name: "Walmart",
        link: "https://www.walmart.com",
        addedByAdmin: true,
      },
      {
        id: "shopping4",
        name: "Target",
        link: "https://www.target.com",
        addedByAdmin: true,
      },
    ],
  },
  "Enterprener / Founder": {
    International: [
      {
        id: "news1",
        name: "CNN",
        link: "https://www.cnn.com",
        addedByAdmin: true,
      },
      {
        id: "news2",
        name: "BBC",
        link: "https://www.bbc.com",
        addedByAdmin: true,
      },
    ],
    Finance: [
      {
        id: "news3",
        name: "Reuters",
        link: "https://www.reuters.com",
        addedByAdmin: true,
      },
      {
        id: "news4",
        name: "Bloomberg",
        link: "https://www.bloomberg.com",
        addedByAdmin: true,
      },
    ],
  },
  "Freelancer(Creative or Technical)": {
    "Job Boards": [
      {
        id: "job1",
        name: "LinkedIn Jobs",
        link: "https://www.linkedin.com/jobs",
        addedByAdmin: true,
      },
      {
        id: "job2",
        name: "Indeed",
        link: "https://www.indeed.com",
        addedByAdmin: true,
      },
    ],
    "Company Careers": [
      {
        id: "job3",
        name: "Google Careers",
        link: "https://careers.google.com",
        addedByAdmin: true,
      },
      {
        id: "job4",
        name: "Amazon Jobs",
        link: "https://www.amazon.jobs",
        addedByAdmin: true,
      },
    ],
  },
  "Consultant / Advisor": {
    Streaming: [
      {
        id: "movie1",
        name: "Netflix",
        link: "https://www.netflix.com",
        addedByAdmin: true,
      },
      {
        id: "movie2",
        name: "Amazon Prime Video",
        link: "https://www.primevideo.com",
        addedByAdmin: true,
      },
    ],
    Reviews: [
      {
        id: "movie3",
        name: "Rotten Tomatoes",
        link: "https://www.rottentomatoes.com",
        addedByAdmin: true,
      },
      {
        id: "movie4",
        name: "IMDb",
        link: "https://www.imdb.com",
        addedByAdmin: true,
      },
    ],
  },
  "Working Professional": {
    Payments: [
      {
        id: "finance1",
        name: "PayPal",
        link: "https://www.paypal.com",
        addedByAdmin: true,
      },
      {
        id: "finance2",
        name: "Stripe",
        link: "https://www.stripe.com",
        addedByAdmin: true,
      },
    ],
    Banking: [
      {
        id: "finance3",
        name: "Wise (TransferWise)",
        link: "https://wise.com",
        addedByAdmin: true,
      },
      {
        id: "finance4",
        name: "Revolut",
        link: "https://www.revolut.com",
        addedByAdmin: true,
      },
    ],
  },
  "Reseacher / Academic": {
    "Online Courses": [
      {
        id: "edu1",
        name: "Khan Academy",
        link: "https://www.khanacademy.org",
        addedByAdmin: true,
      },
      {
        id: "edu2",
        name: "Coursera",
        link: "https://www.coursera.org",
        addedByAdmin: true,
      },
    ],
    "Skill Learning": [
      {
        id: "edu3",
        name: "Udemy",
        link: "https://www.udemy.com",
        addedByAdmin: true,
      },
      {
        id: "edu4",
        name: "Skillshare",
        link: "https://www.skillshare.com",
        addedByAdmin: true,
      },
    ],
  },
  "IT/Tech Support": {
    Courses: [
      {
        id: "bpo1",
        name: "Khan Academy",
        link: "https://www.khanacademy.org",
        addedByAdmin: true,
      },
      {
        id: "bpo2",
        name: "Coursera",
        link: "https://www.coursera.org",
        addedByAdmin: true,
      },
    ],
    "Skill Learning": [
      {
        id: "bpo3",
        name: "Udemy",
        link: "https://www.udemy.com",
        addedByAdmin: true,
      },
      {
        id: "bpo4",
        name: "Skillshare",
        link: "https://www.skillshare.com",
        addedByAdmin: true,
      },
    ],
  },
};
