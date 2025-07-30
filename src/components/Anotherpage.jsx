import { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import PropTypes from "prop-types";
import { message, Modal } from "antd";
import { Button as AntButton } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import SkeletonLoader from "./SkeletonLoader.jsx";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, getDocs, addDoc } from "firebase/firestore";
import Calculator from "./Calculator.jsx";
import Clock from "./Clock.jsx";
import Calendar from "./Calendar.jsx";
import ImageUploader from "./ImageUploader.jsx";
import Weather from "./Weather.jsx";
import NotePage from "./NotePage.jsx";
import "./Anotherpage.css";
import {
  getPageLayout,
  // debouncedUpdatePageLayout,
  // Import updatePageLayout directly for immediate save
  updatePageLayout,
  defaultWidgets,
  defaultBookmarks,
} from "../firebase/widgetLayouts";
import TodoComponent from "./TodoComponent.jsx";
import NewsFeed from "./NewsFeed.jsx";
import { useTheme } from "../context/ThemeContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { PlusOutlined } from '@ant-design/icons';
import { SettingOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from "antd";
import { DragDropContext as DnDContext, Droppable as DnDDroppable, Draggable as DnDDraggable } from 'react-beautiful-dnd';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { collection as fsCollection, getDocs as fsGetDocs } from "firebase/firestore";

const defaultCategoryList = [
  "Not Selected", "Designer (UI/UX, Graphic, Web)", "Developer / Programmer", "Digital Marketer", "Student", "Teacher / Educator", "Enterprener / Founder", "Freelancer(Creative or Technical)", "Consultant / Advisor", "Working Professional", "Reseacher / Academic", "IT / Tech Support", "Medical Professional"
];

// Mapping from category name to profession ID
const categoryToProfessionId = {
  "Not Selected": "not_selected",
  "Developer / Programmer": "developer",
  "Designer (UI/UX, Graphic, Web)": "designer",
  "Digital Marketer": "digital_marketer",
  "Student": "student",
  "Teacher / Educator": "teacher",
  "Enterprener / Founder": "entrepreneur",
  "Freelancer(Creative or Technical)": "freelancer",
  "Consultant / Advisor": "consultant",
  "Working Professional": "working_professional",
  "Reseacher / Academic": "researcher",
  "IT / Tech Support": "it_support",
  "Medical Professional": "medical",
  "Retired": "retired",
  "Other": "other"
};

// Memoize all widget components
const MemoWeather = memo(Weather);
const MemoClock = memo(Clock);
const MemoCalendar = memo(Calendar);
const MemoCalculator = memo(Calculator);
const MemoImageUploader = memo(ImageUploader);
const MemoNewsFeed = memo(NewsFeed);
const MemoNotePage = memo(NotePage);
const MemoTodoComponent = memo(TodoComponent);

// Memoize componentMap
const WidgetCard = memo(function WidgetCard({ title, menu, children, collapsible = false, collapsed, onToggleCollapse }) {
  // If collapsible is true and collapsed/onToggleCollapse are not provided, manage local collapse state
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const isControlled = typeof collapsed === 'boolean' && typeof onToggleCollapse === 'function';
  const actualCollapsed = isControlled ? collapsed : localCollapsed;
  const handleToggle = isControlled ? onToggleCollapse : () => setLocalCollapsed(c => !c);
  return (
    <div className="">
      {title && (
        <div
          className={`bg-gray-100 dark:bg-[#28283b] relative flex items-center p-3 ${collapsible ? 'cursor-pointer select-none' : ''}`}
          onClick={collapsible ? handleToggle : undefined}
        >
          <div className="w-full dark:text-white text-center font-semibold text-lg capitalize flex items-center justify-center gap-2">
            {title}
          </div>
          {menu && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              {menu}
            </div>
          )}
        </div>
      )}
      {!collapsible || !actualCollapsed ? <div className="bg-white dark:bg-[#28283b]">{children}</div> : null}
    </div>
  );
});
WidgetCard.propTypes = {
  title: PropTypes.node,
  menu: PropTypes.node,
  children: PropTypes.node,
  collapsible: PropTypes.bool,
  collapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
};

// Memoize componentMap
const Anotherpage = ({ pageId = "home" }) => {
  const { isDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState(4);
  const [loading, setLoading] = useState(true); // Loading indicator
  const [isSorterOpen, setIsSorterOpen] = useState(false);
  const [sortedItems, setSortedItems] = useState([]);
  const [isApplying, setIsApplying] = useState(false);
  const [previewColumns, setPreviewColumns] = useState(4);
  // Remove collapsedSubcats from parent state
  const [collapsedItems, setCollapsedItems] = useState(() => {
    const savedState = localStorage.getItem("collapsedItems");
    return savedState ? JSON.parse(savedState) : {};
  });

  // Demo mode state for logged out users
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // --- Persist last selected category in localStorage ---
  // On mount, read from localStorage
  const localCategoryKey = 'selectedCategory';
  const getInitialCategory = () => {
    const saved = localStorage.getItem(localCategoryKey);
    return saved ? saved : 'Not Selected';
  };
  const [selectedCategory, setSelectedCategory] = useState(getInitialCategory());
  // Add state for selected profession
  const [allCategories, setAllCategories] = useState(defaultCategoryList);

  // On category change, save to localStorage
  useEffect(() => {
    localStorage.setItem(localCategoryKey, selectedCategory);
  }, [selectedCategory]);

  // Handle dropdown clicks in demo mode
  const handleDropdownClick = () => {
    if (isDemoMode) {
      setShowLoginModal(true);
    }
  };
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categorySnapshot = await getDocs(collection(db, "category"));
        const hardcodedCatNames = defaultCategoryList;

        // Filter Firestore docs to only include admin-added categories
        const adminAddedCategories = categorySnapshot.docs
          .map(doc => doc.data())
          .filter(data => data.addedByAdmin === true)
          .map(data => data.newCategory);

        // Merge the hardcoded list with the admin-added list
        const mergedCategories = [...new Set([...hardcodedCatNames, ...adminAddedCategories])];
        
        setAllCategories(mergedCategories.sort());
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to default list on error
        setAllCategories(defaultCategoryList);
      }
    };

    fetchCategories();
  }, []);

  // On profession change, save to localStorage
  const [subcatBookmarks, setSubcatBookmarks] = useState({}); // { subcat: [bookmarks] }
  const [firestoreSubcats, setFirestoreSubcats] = useState([]); // For logged-in users
  const [firestoreUser, setFirestoreUser] = useState(null);
  const [interestLoading, setInterestLoading] = useState(true);
  const [interestsLoading, setInterestsLoading] = useState(false);

  // Add new function to handle local storage operations
  const localStorageKey = "widget_layout";

  const saveToLocalStorage = (layout) => {
    if (!user) {
      localStorage.setItem(localStorageKey, JSON.stringify(layout));
    }
  };

  const getFromLocalStorage = () => {
    const savedLayout = localStorage.getItem(localStorageKey);
    return savedLayout ? JSON.parse(savedLayout) : null;
  };

  // Add state for subcategory card order (per category)
  const getInitialSubcatOrder = (cat) => {
    const key = `subcatOrder_${cat}`;
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    const subcats = Object.keys(defaultBookmarks[cat] || {});
    localStorage.setItem(key, JSON.stringify(subcats));
    return subcats;
  };
  const [subcatOrder, setSubcatOrder] = useState(getInitialSubcatOrder(selectedCategory));

  // Update subcatOrder when selectedCategory changes
  useEffect(() => {
    setSubcatOrder(getInitialSubcatOrder(selectedCategory));
  }, [selectedCategory]);

  // Track auth state for Firestore
  useEffect(() => {
    const unsubscribe = auth ? auth.onAuthStateChanged((user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        getDoc(userDocRef)
          .then(userDocSnap => {
            if (userDocSnap.exists() && userDocSnap.data().selectedInterest) {
              setSelectedInterest(userDocSnap.data().selectedInterest);
            }
          })
          .catch(error => {
            console.error("Error fetching user's selected interest:", error);
          })
          .finally(() => {
            setInterestLoading(false);
          });
        setIsDemoMode(false);
      } else {
        const saved = localStorage.getItem('selectedInterest');
        setSelectedInterest(saved || 'not_select');
        setInterestLoading(false);
        setIsDemoMode(true);
      }
      setFirestoreUser(user);
    }) : () => {
      setInterestLoading(false);
      setIsDemoMode(true);
    };
    return () => unsubscribe();
  }, []);

  // Fetch subcategories from Firestore if logged in
  useEffect(() => {
    if (!selectedCategory) {
      setFirestoreSubcats([]);
      return;
    }
    // Fetch subcategories for selectedCategory, regardless of login status
    const q = query(collection(db, "category"), where("newCategory", "==", selectedCategory));
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        // Category found in Firestore, use its subcategories
        const docData = snapshot.docs[0].data();
        setFirestoreSubcats(Array.isArray(docData.subcategories) ? docData.subcategories : []);
      } else {
        // Fallback to defaultBookmarks if not found in Firestore (for pure hardcoded categories)
        setFirestoreSubcats(Object.keys(defaultBookmarks[selectedCategory] || {}));
      }
    });
    return () => unsub();
  }, [selectedCategory]);

  // Fetch bookmarks for a subcategory from Firestore (only when expanded)
  const fetchSubcatBookmarks = async (subcat) => {
    // If in demo mode (logged out), use hardcoded bookmarks
    if (isDemoMode) {
      // Find the category that contains this subcategory
      let foundBookmarks = [];
      Object.entries(defaultBookmarks).forEach(([, subcategories]) => {
        if (subcategories[subcat]) {
          foundBookmarks = subcategories[subcat];
        }
      });
      setSubcatBookmarks(prev => ({ ...prev, [subcat]: foundBookmarks }));
      return;
    }

    // If an interest is selected, fetch bookmarks based on interestId
    if (selectedInterest !== 'not_select' && selectedInterest !== 'all') {
      const q = query(collection(db, "links"), where("interestId", "==", selectedInterest), where("subcategory", "==", subcat));
      try {
      const snap = await getDocs(q);
        const bookmarks = snap.docs.map(doc => ({ id: doc.id, ...doc.data(), addedByAdmin: true }));
        setSubcatBookmarks(prev => ({ ...prev, [subcat]: bookmarks }));
      } catch (error) {
        console.error("Error fetching interest bookmarks:", error);
      }
      return;
    }

    // 1. Always fetch admin bookmarks for the category/subcategory from Firestore.
    const catQ = query(collection(db, "category"), where("newCategory", "==", selectedCategory));
    const catSnap = await getDocs(catQ);
    let adminBookmarks = [];

    if (!catSnap.empty) {
      const catId = catSnap.docs[0].id;
      const adminQ = query(
        collection(db, "links"),
        where("category", "==", catId),
        where("subcategory", "==", subcat)
      );
      const adminSnap = await getDocs(adminQ);
      adminBookmarks = adminSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), addedByAdmin: true }));
    }

    // 2. If no admin bookmarks are found, fall back to hardcoded defaults.
    if (adminBookmarks.length === 0) {
      adminBookmarks = defaultBookmarks[selectedCategory]?.[subcat] || [];
    }
    
    // 3. If a user is logged in, fetch their specific bookmarks.
    let userBookmarks = [];
    if (firestoreUser) {
      const userQ = query(
        collection(db, "users", firestoreUser.uid, "bookmarks"),
        where("category", "==", selectedCategory),
        where("subcategory", "==", subcat)
      );
      const userSnapshot = await getDocs(userQ);
      userBookmarks = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), addedByAdmin: false }));
    }

    // 4. Combine and set bookmarks.
    setSubcatBookmarks((prev) => ({
      ...prev,
      [subcat]: [...adminBookmarks, ...userBookmarks],
    }));
  };

  // Helper functions for subcategory object/string handling
  const getSubcatKey = (subcat) =>
    subcat && typeof subcat === 'object' && subcat.name
      ? subcat.name
      : typeof subcat === 'string'
      ? subcat
      : '';
  const getSubcatName = (subcat) =>
    subcat && typeof subcat === 'object' && subcat.name
      ? subcat.name
      : typeof subcat === 'string'
      ? subcat
      : '';

  // Remove unused variable renderSubcategoryCards if present
  // No PropTypes needed for SubcategoryCard or pageId

  // Remove SubcategoryCards from componentMap
  const componentMap = useMemo(() => ({
    clock: <WidgetCard><MemoClock /></WidgetCard>,
    weather: <WidgetCard><MemoWeather /></WidgetCard>,
    calculator: <WidgetCard><MemoCalculator /></WidgetCard>,
    notepad: <WidgetCard><MemoNotePage /></WidgetCard>,
    imageUploader: <WidgetCard ><MemoImageUploader /></WidgetCard>,
    calendar: <WidgetCard ><MemoCalendar /></WidgetCard>,
    Todo: <WidgetCard><MemoTodoComponent /></WidgetCard>,
    NewsFeed: <WidgetCard><MemoNewsFeed /></WidgetCard>,
  }), []);

  // Modify the useEffect for loading layout
  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(
      authInstance,
      async (currentUser) => {
        setUser(currentUser);
        
        // Check if this is a new page (not "home")
        const isNewPage = pageId !== "home";
        
        if (currentUser) {
          const layout = await getPageLayout(currentUser.uid, pageId);
          if (layout && layout.widgets && layout.columns) {
            setItems(layout.widgets);
            setColumns(layout.columns);
          } else if (isNewPage) {
            // For new pages, start with empty layout
            setItems([]);
            setColumns(4);
          } else {
            setItems(defaultWidgets[pageId] || []);
            setColumns(4);
          }
        } else {
          let localLayout = getFromLocalStorage();
          
          if (isNewPage) {
            // For new pages, start with empty layout
            setItems([]);
            setColumns(4);
          } else {
            // Always force the 4 widgets to be in the correct columns/positions
            const forceWidgets = [
              { id: 'imageUploader', column: 3, name: 'Image Uploader', position: 0 },
              { id: 'NewsFeed', column: 3, name: 'News Feed', position: 1 },
              { id: 'notepad', column: 3, name: 'Notepad ', position: 2 },
              { id: 'Todo', column: 3, name: 'To Do List', position: 3 },
            ];
            let widgets = (localLayout && localLayout.widgets) ? [...localLayout.widgets] : (defaultWidgets[pageId] ? [...defaultWidgets[pageId]] : []);
            // Remove any of the 4 widgets if present
            widgets = widgets.filter(w => !forceWidgets.some(fw => fw.id === w.id));
            // Start with the forced widgets in their columns/positions
            let newWidgets = forceWidgets.map(fw => ({
              id: fw.id,
              name: fw.name,
              isOpen: true,
              column: fw.column,
              position: fw.position,
            }));
            // For all other widgets, distribute them after the forced widgets in their column
            let colPositions = [0, 0, 0, 4]; // next position for each column (col 3 starts at 4)
            widgets.forEach(w => {
              // If column is not set or out of range, put in column 0
              let col = (typeof w.column === 'number' && w.column >= 0 && w.column < 4) ? w.column : 0;
              // If col is 3, start after the 4 forced widgets
              let pos = col === 3 ? colPositions[3]++ : colPositions[col]++;
              newWidgets.push({
                ...w,
                column: col,
                position: pos,
              });
            });
            setItems(newWidgets);
            setColumns(4);
          }
        }
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [pageId]);

  useEffect(() => {
    if (isSorterOpen) {
      setPreviewColumns(columns);
      setSortedItems([...items]);
    }
  }, [isSorterOpen, columns, items]);

  useEffect(() => {
    // setAvailableWidgets(getAvailableWidgets(sortedItems)); // This line was removed
  }, [sortedItems]);

  // Modify handleApplySorting to use debounced update
  const handleApplySorting = async () => {
    setIsApplying(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Update local state immediately
    setItems(sortedItems);
    setColumns(previewColumns);

    try {
      if (user) {
        // Use debounced update for Firebase
        updatePageLayout(user.uid, pageId, {
          widgets: sortedItems,
          columns: previewColumns,
        });
      } else {
        // Update localStorage immediately
        saveToLocalStorage({
          widgets: sortedItems,
          columns: previewColumns,
        });
      }
      // message.success("Layout updated successfully");
    } catch (error) {
      console.error("Error saving layout:", error);
      message.error("Failed to save layout");
    }

    setIsApplying(false);
    setIsSorterOpen(false);
  };

  // Add useEffect to handle persistence
  useEffect(() => {
    localStorage.setItem("collapsedItems", JSON.stringify(collapsedItems));
  }, [collapsedItems]);

  const handleColumnChange = async (numColumns) => {
    setPreviewColumns(numColumns);
    const redistributedItems = sortedItems.map((item, index) => ({
      ...item,
      column: index % numColumns,
    }));

    setSortedItems(redistributedItems);
  };

  // (renderWidgets removed as unused)

  useEffect(() => {
    // Get the list of subcategories (from Firestore or default)
    const subcats = firestoreUser && firestoreSubcats.length > 0 ? firestoreSubcats : subcatOrder;
    // For each expanded subcategory, fetch bookmarks
    subcats.forEach((subcat) => {
      const subcatKey = getSubcatKey(subcat);
      if (!collapsedItems[subcatKey]) {
        fetchSubcatBookmarks(subcatKey);
      }
    });
    // eslint-disable-next-line
  }, [selectedCategory, firestoreUser, firestoreSubcats, subcatOrder]);

  // Add this useEffect to load hidden bookmarks for all subcategories on mount and when user/category/subcats change
  useEffect(() => {
    // Get the list of subcategories (from Firestore or default)
    const subcatsList = firestoreSubcats;
    subcatsList.forEach((subcat) => {
      if (!subcat) return; // skip null/undefined
      const subcatKey = typeof subcat === 'object' && subcat.name ? subcat.name : subcat;
      if (subcatKey) loadHiddenBookmarks(subcatKey);
    });
    // eslint-disable-next-line
  }, [firestoreUser, selectedCategory, firestoreSubcats]);

  // State for subcategory display modes
  // Load persisted view modes and icon sizes from localStorage
  const getLocal = (key, fallback = {}) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  };
  const [subcatDisplayModes, setSubcatDisplayModes] = useState(() => getLocal('subcatDisplayModes'));
  const [subcatIconSizes, setSubcatIconSizes] = useState(() => getLocal('subcatIconSizes'));
  const [widgetDisplayModes] = useState(() => getLocal('widgetDisplayModes'));
  const [widgetIconSizes] = useState(() => getLocal('widgetIconSizes'));

  // Persist to localStorage on change
  useEffect(() => { localStorage.setItem('subcatDisplayModes', JSON.stringify(subcatDisplayModes)); }, [subcatDisplayModes]);
  useEffect(() => { localStorage.setItem('subcatIconSizes', JSON.stringify(subcatIconSizes)); }, [subcatIconSizes]);
  useEffect(() => { localStorage.setItem('widgetDisplayModes', JSON.stringify(widgetDisplayModes)); }, [widgetDisplayModes]);
  useEffect(() => { localStorage.setItem('widgetIconSizes', JSON.stringify(widgetIconSizes)); }, [widgetIconSizes]);

  const handleSubcatDisplayMode = useCallback((subcatKey, mode) => {
    setSubcatDisplayModes(prev => ({ ...prev, [subcatKey]: mode }));
  }, []);
  const handleSubcatIconSize = useCallback((subcatKey, size) => {
    setSubcatIconSizes(prev => ({ ...prev, [subcatKey]: size }));
  }, []);

  // --- Add state for bookmarks modal ---
  const [openBookmarksModal, setOpenBookmarksModal] = useState(null); // subcatKey or null
  const [showAdminBookmarks, setShowAdminBookmarks] = useState(true);
  const [userBookmarksOrder, setUserBookmarksOrder] = useState({}); // { subcatKey: [bookmarkIds] }

  // --- Add state for hidden bookmarks ---
  const [hiddenBookmarks, setHiddenBookmarks] = useState({}); // { subcatKey: [bookmarkIds] }
  const [showHidden, setShowHidden] = useState(false);

  // Helper to load hidden bookmarks from Firestore/localStorage
  const loadHiddenBookmarks = async (subcatKey) => {
    if (firestoreUser) {
      // Firestore: /users/{uid}/hiddenBookmarks/{category}_{subcatKey}
      const docId = `${selectedCategory}_${subcatKey}`;
      try {
        const docRef = doc(db, "users", firestoreUser.uid, "hiddenBookmarks", docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHiddenBookmarks(prev => ({ ...prev, [subcatKey]: docSnap.data().ids || [] }));
        } else {
          setHiddenBookmarks(prev => ({ ...prev, [subcatKey]: [] }));
        }
      } catch {
        setHiddenBookmarks(prev => ({ ...prev, [subcatKey]: [] }));
      }
    } else {
      // LocalStorage
      const key = `hiddenBookmarks_${selectedCategory}_${subcatKey}`;
      const ids = JSON.parse(localStorage.getItem(key) || '[]');
      setHiddenBookmarks(prev => ({ ...prev, [subcatKey]: ids }));
    }
  };

  // Helper to persist hidden bookmarks
  const persistHiddenBookmarks = async (subcatKey, ids) => {
    if (firestoreUser) {
      const docId = `${selectedCategory}_${subcatKey}`;
      const docRef = doc(db, "users", firestoreUser.uid, "hiddenBookmarks", docId);
      await setDoc(docRef, { ids });
    } else {
      const key = `hiddenBookmarks_${selectedCategory}_${subcatKey}`;
      localStorage.setItem(key, JSON.stringify(ids));
    }
  };

  // Helper to open bookmarks modal for a subcategory
  const handleOpenBookmarksModal = (subcatKey) => {
    setOpenBookmarksModal(subcatKey);
    setShowAdminBookmarks(true);
    // If user bookmarks order not set, initialize from current bookmarks
    if (firestoreUser && subcatBookmarks[subcatKey]) {
      setUserBookmarksOrder((prev) => ({
        ...prev,
        [subcatKey]: subcatBookmarks[subcatKey]
          .filter(b => !b.addedByAdmin)
          .map(b => b.id),
      }));
    } else if (!firestoreUser && defaultBookmarks[selectedCategory]?.[subcatKey]) {
      setUserBookmarksOrder((prev) => ({
        ...prev,
        [subcatKey]: defaultBookmarks[selectedCategory][subcatKey].map(b => b.id),
      }));
    }
  };
  const handleCloseBookmarksModal = () => setOpenBookmarksModal(null);

  // --- Update BookmarksModal ---
  const BookmarksModal = ({ subcatKey, open, onClose }) => {
    // --- Move all hooks to the top ---
    const [editingId, setEditingId] = useState(null);
    const [editFields, setEditFields] = useState({ name: '', link: '' });
    const [editError, setEditError] = useState('');

    useEffect(() => {
      if (!open) {
        setEditingId(null);
        setEditFields({ name: '', link: '' });
        setEditError('');
      }
    }, [open]);

    // Helper for URL validation (reuse from AddBookmarkModal)
    const isValidUrl = (url) => {
      try {
        const u = new URL(url);
        return u.protocol === 'http:' || u.protocol === 'https:';
      } catch {
        return false;
      }
    };

    // Load hidden bookmarks on open
    useEffect(() => {
      if (open) loadHiddenBookmarks(subcatKey);
      // eslint-disable-next-line
    }, [open, subcatKey, firestoreUser]);
    if (!open) return null;
    // Get bookmarks for this subcat
    const allBookmarks = firestoreUser
      ? (subcatBookmarks[subcatKey] || [])
      : (defaultBookmarks[selectedCategory]?.[subcatKey] || []);
    const adminBookmarks = allBookmarks.filter(b => b.addedByAdmin);
    const userBookmarks = allBookmarks.filter(b => !b.addedByAdmin);
    // Get hidden bookmarks for this subcat
    const hiddenIds = hiddenBookmarks[subcatKey] || [];
    // Get user bookmarks order
    const orderedUserBookmarks = (userBookmarksOrder[subcatKey] || userBookmarks.map(b => b.id))
      .map(id => userBookmarks.find(b => b.id === id)).filter(Boolean);
    // Filter bookmarks based on hidden state
    const visibleUserBookmarks = orderedUserBookmarks.filter(b => !hiddenIds.includes(b.id));
    const hiddenUserBookmarks = orderedUserBookmarks.filter(b => hiddenIds.includes(b.id));
    // Admin bookmarks: filter by hidden state
    const visibleAdminBookmarks = adminBookmarks.filter(b => !hiddenIds.includes(b.id));

    // Drag and drop handler
    const onDragEnd = async (result) => {
      if (!result.destination) return;
      const reordered = Array.from(visibleUserBookmarks);
      const [removed] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination.index, 0, removed);
      setUserBookmarksOrder(prev => ({ ...prev, [subcatKey]: [
        ...reordered.map(b => b.id),
        ...hiddenUserBookmarks.map(b => b.id), // keep hidden at end
      ] }));
      // Save order (Firestore or localStorage)
      if (firestoreUser) {
        const docId = `${selectedCategory}_${subcatKey}`;
        await db.collection('users').doc(firestoreUser.uid).collection('bookmarkOrder').doc(docId).set({ ids: [
          ...reordered.map(b => b.id),
          ...hiddenUserBookmarks.map(b => b.id),
        ] });
      } else {
        const key = `userBookmarksOrder_${selectedCategory}_${subcatKey}`;
        localStorage.setItem(key, JSON.stringify([
          ...reordered.map(b => b.id),
          ...hiddenUserBookmarks.map(b => b.id),
        ]));
      }
    };

    // Hide/unhide handler
    const handleHideBookmark = async (id, hide) => {
      const newHidden = hide
        ? [...hiddenIds, id]
        : hiddenIds.filter(hid => hid !== id);
      setHiddenBookmarks(prev => ({ ...prev, [subcatKey]: newHidden }));
      await persistHiddenBookmarks(subcatKey, newHidden);
    };

    // Edit handlers
    const cancelEdit = () => {
      setEditingId(null);
      setEditFields({ name: '', link: '' });
      setEditError('');
    };
    const saveEdit = async (b) => {
      // Validate
      if (!editFields.name.trim()) {
        setEditError('Name is required');
        return;
      }
      if (!editFields.link.trim()) {
        setEditError('URL is required');
        return;
      }
      // Remove URL validation for logged-in users
      if (!firestoreUser && !isValidUrl(editFields.link.trim())) {
        setEditError('Please enter a valid URL (http/https)');
        return;
      }
      // Duplicate check (ignore self)
      const normalizedUrl = normalizeDomain(editFields.link);
      const isDuplicate = orderedUserBookmarks.some(
        x => x.id !== b.id && normalizeDomain(x.link || '') === normalizedUrl
      );
      if (isDuplicate) {
        setEditError('A bookmark with this URL already exists.');
        return;
      }
      // Update in Firestore or localStorage
      if (firestoreUser) {
        // Firestore: update doc
        const docRef = doc(db, 'users', firestoreUser.uid, 'bookmarks', b.id);
        await setDoc(docRef, {
          ...b,
          name: editFields.name.trim(),
          link: editFields.link.trim(),
        }, { merge: true });
      } else {
        // LocalStorage
        const key = `userBookmarks_${selectedCategory}_${subcatKey}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = existing.map(x => x.id === b.id ? { ...x, name: editFields.name.trim(), link: editFields.link.trim() } : x);
        localStorage.setItem(key, JSON.stringify(updated));
        setSubcatBookmarks(prev => ({
          ...prev,
          [subcatKey]: updated
        }));
      }
      // Optimistically update UI
      setSubcatBookmarks(prev => ({
        ...prev,
        [subcatKey]: (prev[subcatKey] || []).map(x => x.id === b.id ? { ...x, name: editFields.name.trim(), link: editFields.link.trim() } : x)
      }));
      cancelEdit();
    };
    // Delete handler
    const deleteBookmark = async (b) => {
      if (!window.confirm('Are you sure you want to delete this bookmark?')) return;
      if (firestoreUser) {
        const docRef = doc(db, 'users', firestoreUser.uid, 'bookmarks', b.id);
        await setDoc(docRef, {}, { merge: false }); // Remove doc
        // Firestore doesn't have a direct delete in this import, so use deleteDoc if available
        try { await (await import('firebase/firestore')).deleteDoc(docRef); } catch (e) {
          console.error("Error deleting document:", e);
        }
      } else {
        const key = `userBookmarks_${selectedCategory}_${subcatKey}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = existing.filter(x => x.id !== b.id);
        localStorage.setItem(key, JSON.stringify(updated));
        setSubcatBookmarks(prev => ({
          ...prev,
          [subcatKey]: updated
        }));
      }
      // Optimistically update UI
      setSubcatBookmarks(prev => ({
        ...prev,
        [subcatKey]: (prev[subcatKey] || []).filter(x => x.id !== b.id)
      }));
    };

    return (
      <CustomModal open={open} onClose={onClose} width={500}>
        <div className="font-semibold text-lg mb-2 flex items-center justify-between">
          Manage Bookmarks
        </div>
        <div className="mb-3 flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showAdminBookmarks} onChange={e => setShowAdminBookmarks(e.target.checked)} />
            <span>Show Admin Bookmarks</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showHidden} onChange={e => setShowHidden(e.target.checked)} />
            <span>Show Hidden</span>
          </label>
        </div>
        {showAdminBookmarks && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-500 mb-1">Admin Bookmarks</div>
            <div className="flex flex-col gap-2">
              {(showHidden ? adminBookmarks : visibleAdminBookmarks).map(b => (
                <div key={b.id} className={`flex items-center gap-2 p-2 rounded bg-gray-100 dark:bg-gray-800 ${hiddenIds.includes(b.id) ? 'opacity-50' : ''}`}>
                  <img src={`https://www.google.com/s2/favicons?sz=64&domain=${(() => { try { return new URL(b.link).hostname; } catch { return 'google.com'; } })()}`} alt="" className="w-5 h-5 rounded" />
                  <span className="flex-1 text-gray-900 dark:text-gray-100 truncate max-w-[150px] overflow-hidden whitespace-nowrap">{truncateName(b.name)}</span>
                  <a href={b.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs underline">Visit</a>
                  <button
                    className={`ml-2 px-2 py-1 rounded text-xs ${hiddenIds.includes(b.id) ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => handleHideBookmark(b.id, !hiddenIds.includes(b.id))}
                    title={hiddenIds.includes(b.id) ? 'Unhide' : 'Hide'}
                  >
                    {hiddenIds.includes(b.id) ? 'Unhide' : 'Hide'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mb-2 text-xs font-semibold text-gray-500">Your Bookmarks</div>
        <DnDContext onDragEnd={onDragEnd}>
          <DnDDroppable droppableId="userBookmarks">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-2">
                {(showHidden ? orderedUserBookmarks : visibleUserBookmarks).map((b, idx) => (
                  <DnDDraggable key={b.id} draggableId={b.id} index={idx} isDragDisabled={showHidden && hiddenIds.includes(b.id)}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex items-center gap-3 p-3 rounded border transition-colors duration-150 bg-white dark:bg-gray-900 ${snapshot.isDragging ? 'shadow-lg' : ''} ${hiddenIds.includes(b.id) ? 'opacity-50' : ''} ${editingId === b.id ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300' : 'border-gray-200 dark:border-gray-700'} relative`}
                        style={{ minHeight: 48 }}
                      >
                        <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 bg-white dark:bg-gray-800 mr-2">
                          <img src={`https://www.google.com/s2/favicons?sz=64&domain=${(() => { try { return new URL(b.link).hostname; } catch { return 'google.com'; } })()}`} alt="" className="w-5 h-5 rounded" />
                        </div>
                        {editingId === b.id ? (
                          <>
                            <input
                              className="flex-1 text-gray-900 dark:text-gray-100 max-w-[100px] overflow-hidden whitespace-nowrap border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                              value={editFields.name}
                              onChange={e => setEditFields(f => ({ ...f, name: e.target.value }))}
                              aria-label="Bookmark name"
                            />
                            <input
                              className="flex-1 text-gray-900 dark:text-gray-100 max-w-[120px] overflow-hidden whitespace-nowrap border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                              value={editFields.link}
                              onChange={e => setEditFields(f => ({ ...f, link: e.target.value }))}
                              aria-label="Bookmark URL"
                            />
                            <div className="flex gap-1 ml-2">
                              <button title="Save" aria-label="Save" className="text-green-600 text-xs px-2 py-1 hover:bg-green-50 rounded focus:outline-none focus:ring-2 focus:ring-green-400" onClick={e => { e.stopPropagation(); saveEdit(b); }}>
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                              </button>
                              <button title="Cancel" aria-label="Cancel" className="text-gray-500 text-xs px-2 py-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-gray-400" onClick={e => { e.stopPropagation(); cancelEdit(); }}>
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                            {editError && <span className="text-red-500 text-xs ml-2">{editError}</span>}
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-gray-900 dark:text-gray-100 truncate max-w-[150px] overflow-hidden whitespace-nowrap">{truncateName(b.name)}</span>
                            <a href={b.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs underline" title="Visit bookmark" aria-label="Visit bookmark">Visit</a>
                            <div className="flex gap-1 ml-2">
                              <button
                                className={`px-2 py-1 rounded text-xs ${hiddenIds.includes(b.id) ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'} hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400`}
                                onClick={e => { e.stopPropagation(); handleHideBookmark(b.id, !hiddenIds.includes(b.id)); }}
                                title={hiddenIds.includes(b.id) ? 'Unhide' : 'Hide'}
                                aria-label={hiddenIds.includes(b.id) ? 'Unhide bookmark' : 'Hide bookmark'}
                              >
                                {hiddenIds.includes(b.id)
                                  ? (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>)
                                  : (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.81 21.81 0 0 1 5.06-7.06M1 1l22 22"/><path d="M9.53 9.53A3.001 3.001 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/></svg>)}
                              </button>
                              <button title="Edit" aria-label="Edit bookmark" className="text-yellow-600 px-2 py-1 hover:bg-yellow-50 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400" onClick={e => { e.stopPropagation(); setEditingId(b.id); setEditFields({ name: b.name, link: b.link }); setEditError(''); }}>
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                              </button>
                              <button title="Delete" aria-label="Delete bookmark" className="text-red-600 px-2 py-1 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-red-400" onClick={e => { e.stopPropagation(); deleteBookmark(b); }}>
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                              </button>
                            </div>
                          </>
                        )}
                        {/* Divider for clarity */}
                        {idx < (showHidden ? orderedUserBookmarks : visibleUserBookmarks).length - 1 && (
                          <div className="absolute left-0 bottom-0 w-full h-px bg-gray-100 dark:bg-gray-800" style={{ pointerEvents: 'none' }} />
                        )}
                      </div>
                    )}
                  </DnDDraggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </DnDDroppable>
        </DnDContext>
      </CustomModal>
    );
  };
  BookmarksModal.propTypes = {
    subcatKey: PropTypes.string,
    open: PropTypes.bool,
    onClose: PropTypes.func,
  };

  // --- Add state for Add Bookmark modal ---
  const [addBookmarkModal, setAddBookmarkModal] = useState({ open: false, subcatKey: null });

  // Add handler to save new bookmark
  const handleAddBookmark = async (subcatKey, bookmark) => {
    // --- Duplicate check before add ---
    const normalizedNewUrl = normalizeDomain(bookmark.link);
    // Get all bookmarks for this subcat (from state, which is up-to-date)
    const existingBookmarks = subcatBookmarks[subcatKey] || [];
    const isDuplicate = existingBookmarks.some(b => normalizeDomain(b.link || '') === normalizedNewUrl);
    if (isDuplicate) {
      message.error('A bookmark with this URL already exists in this subcategory.');
      setAddBookmarkModal({ open: false, subcatKey: null });
      return;
    }
    if (!bookmark.name || !bookmark.link) return;
    if (firestoreUser) {
      // Save to Firestore (modular API)
      const docRef = await addDoc(
        collection(db, 'users', firestoreUser.uid, 'bookmarks'),
        {
          name: bookmark.name,
          link: bookmark.link,
          category: selectedCategory,
          subcategory: subcatKey,
          addedByAdmin: false,
        }
      );
      // Optimistically update UI (ensure no duplicate)
      setSubcatBookmarks(prev => {
        const prevArr = prev[subcatKey] || [];
        const filtered = prevArr.filter(b => normalizeDomain(b.link || '') !== normalizedNewUrl);
        return {
          ...prev,
          [subcatKey]: [
            ...filtered,
            {
              id: docRef.id,
              name: bookmark.name,
              link: bookmark.link,
              category: selectedCategory,
              subcategory: subcatKey,
              addedByAdmin: false,
            }
          ]
        };
      });
      fetchSubcatBookmarks(subcatKey); // Still fetch to ensure sync
    } else {
      // Save to localStorage
      const key = `userBookmarks_${selectedCategory}_${subcatKey}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      // Remove any existing with same normalized URL
      const filtered = existing.filter(b => normalizeDomain(b.link || '') !== normalizedNewUrl);
      const newEntry = {
        id: Date.now().toString(),
        name: bookmark.name,
        link: bookmark.link,
        addedByAdmin: false,
      };
      localStorage.setItem(key, JSON.stringify([...filtered, newEntry]));
      // Update state
      setSubcatBookmarks(prev => ({
        ...prev,
        [subcatKey]: [...filtered, newEntry]
      }));
    }
    setAddBookmarkModal({ open: false, subcatKey: null });
  };

  // AddBookmarkModal component (move above usage)
  function normalizeDomain(url) {
    try {
      const u = new URL(url.trim().toLowerCase());
      return u.hostname.replace(/^www\./, '');
    } catch {
      return url.trim().toLowerCase();
    }
  }
  const AddBookmarkModal = ({ open, subcatKey, onClose }) => {
    // Get all subcategories for dropdown
    const subcatsList = firestoreUser && firestoreSubcats.length > 0 ? firestoreSubcats : subcatOrder;
    // Local state for form and errors
    const [localBookmark, setLocalBookmark] = useState({ name: '', link: '', subcat: subcatKey });
    const [error, setError] = useState('');

    // Reset form when modal opens/closes or subcatKey changes
    useEffect(() => {
      if (open) {
        setLocalBookmark({ name: '', link: '', subcat: subcatKey });
        setError('');
      }
    }, [open, subcatKey]);

    // Basic URL validation
    const isValidUrl = (url) => {
      try {
        const u = new URL(url);
        return u.protocol === 'http:' || u.protocol === 'https:';
      } catch {
        return false;
      }
    };

    // Get all bookmarks for the selected subcategory for duplicate check
    const allBookmarks = subcatBookmarks[localBookmark.subcat] || [];

    const handleSubmit = () => {
      if (!localBookmark.name.trim()) {
        setError('Name is required');
        return;
      }
      if (!localBookmark.link.trim()) {
        setError('URL is required');
        return;
      }
      // Remove URL validation for logged-in users
      if (!firestoreUser && !isValidUrl(localBookmark.link.trim())) {
        setError('Please enter a valid URL (http/https)');
        return;
      }
      // Duplicate URL check (case-insensitive, trimmed, ignore www.)
      const normalizedUrl = normalizeDomain(localBookmark.link);
      const isDuplicate = allBookmarks.some(b => normalizeDomain(b.link || '') === normalizedUrl);
      if (isDuplicate) {
        setError('A bookmark with this URL already exists in the selected subcategory.');
        return;
      }
      setError('');
      // Directly call handleAddBookmark with bookmark data
      handleAddBookmark(localBookmark.subcat, { name: localBookmark.name.trim(), link: localBookmark.link.trim() });
    };

    const isDisabled = !localBookmark.name.trim() || !localBookmark.link.trim() || (!firestoreUser && !isValidUrl(localBookmark.link.trim()));

    return open ? (
      <CustomModal open={open} onClose={onClose} width={400}>
        <div className="font-semibold text-lg mb-2">Add Bookmark</div>
        <label className="block mb-1 text-sm font-medium">Subcategory</label>
        <select
          className="w-full mb-2 p-2 border rounded"
          value={localBookmark.subcat}
          onChange={e => setLocalBookmark(b => ({ ...b, subcat: e.target.value }))}
        >
          {subcatsList.map(subcat => {
            const key = typeof subcat === 'object' && subcat.name ? subcat.name : subcat;
            return <option key={key} value={key}>{key}</option>;
          })}
        </select>
        <label className="block mb-1 text-sm font-medium">Bookmark Name</label>
        <input
          className="w-full mb-2 p-2 border rounded"
          placeholder="Bookmark Name"
          value={localBookmark.name}
          onChange={e => setLocalBookmark(b => ({ ...b, name: e.target.value }))}
        />
        <label className="block mb-1 text-sm font-medium">Bookmark URL</label>
        <input
          className="w-full mb-2 p-2 border rounded"
          placeholder="Bookmark URL (https://...)"
          value={localBookmark.link}
          onChange={e => setLocalBookmark(b => ({ ...b, link: e.target.value }))}
        />
        {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
        <button
          className={`px-4 py-2 bg-blue-600 text-white rounded w-full ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          onClick={handleSubmit}
          disabled={isDisabled}
        >
          Add
        </button>
      </CustomModal>
    ) : null;
  };
  AddBookmarkModal.propTypes = {
    open: PropTypes.bool,
    subcatKey: PropTypes.string,
    onClose: PropTypes.func,
  };

  // Memoized SubcategoryCard
  const SubcategoryCard = memo(function SubcategoryCard({ subcat, bookmarks, displayMode, iconSize, onDisplayModeChange, onIconSizeChange }) {
    // Local collapse state, persisted in localStorage
    const subcatName = subcat && typeof subcat === 'object' && subcat.name ? subcat.name : (subcat || '');
    const localKey = `collapsedSubcat_${subcatName}`;
    const [collapsed, setCollapsed] = useState(() => {
      const saved = localStorage.getItem(localKey);
      return saved ? JSON.parse(saved) : false;
    });
    useEffect(() => {
      localStorage.setItem(localKey, JSON.stringify(collapsed));
    }, [collapsed, localKey]);
    if (!subcatName) return null;

    // Get hidden bookmarks for this subcat
    const subcatKey = subcatName;
    const hiddenIds = hiddenBookmarks[subcatKey] || [];
    // Filter bookmarks for display
    const visibleBookmarks = Array.isArray(bookmarks) ? bookmarks.filter(b => !hiddenIds.includes(b.id)) : [];

    // Nested settings menu (gear icon)
    const settingsMenu = (
      <Menu>
        <Menu.SubMenu key="viewmode" title="View Mode">
          <Menu.Item key="list" onClick={e => { e.domEvent.stopPropagation(); onDisplayModeChange('list'); }}>List</Menu.Item>
          <Menu.Item key="grid" onClick={e => { e.domEvent.stopPropagation(); onDisplayModeChange('grid'); }}>Grid</Menu.Item>
          <Menu.Item key="cloud" onClick={e => { e.domEvent.stopPropagation(); onDisplayModeChange('cloud'); }}>Cloud</Menu.Item>
          <Menu.Item key="icon" onClick={e => { e.domEvent.stopPropagation(); onDisplayModeChange('icon'); }}>Icon Only</Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu key="iconsize" title="Icon Size">
          <Menu.Item key="small" onClick={e => { e.domEvent.stopPropagation(); onIconSizeChange('small'); }}>Small</Menu.Item>
          <Menu.Item key="medium" onClick={e => { e.domEvent.stopPropagation(); onIconSizeChange('medium'); }}>Medium</Menu.Item>
          <Menu.Item key="large" onClick={e => { e.domEvent.stopPropagation(); onIconSizeChange('large'); }}>Large</Menu.Item>
        </Menu.SubMenu>
        <Menu.Divider />
        <Menu.Item key="bookmarks" onClick={e => { e.domEvent.stopPropagation(); handleOpenBookmarksModal(subcatName); }}>Bookmarks</Menu.Item>
      </Menu>
    );
    const settingsButton = (
      <Dropdown overlay={settingsMenu} trigger={["click"]} placement="bottomRight">
        <button className="hover:bg-gray-300 text-gray-500 mr-1.5 hover:text-gray-600 p-2 rounded bg-transparent" onClick={e => e.stopPropagation()} title="Settings">
          <SettingOutlined style={{ fontSize: 15 }} />
        </button>
      </Dropdown>
    );

    return (
      <WidgetCard
        title={null}
        collapsible={true}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      >
        {/* Bookmarks list, only if expanded */}
        {!collapsed && (
          <>
            <div>
              {renderBookmarksView(visibleBookmarks, displayMode, iconSize)}
            </div>
            <div className="flex justify-end ">
              <div className="w-18 shadow-lg mb-1 flex">
              <button
                className="p-1.5 dark:text-white text-gray-500 rounded  hover:bg-gray-300 transition flex items-center justify-center"
                onClick={() => setAddBookmarkModal({ open: true, subcatKey: subcatName })}
                title="Add Bookmark"
                aria-label="Add Bookmark"
              >
                {/* Plus Icon SVG */}
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
              </button>
              {settingsButton}
              </div>
            </div>
          </>
        )}
      </WidgetCard>
    );
  });
  SubcategoryCard.propTypes = {
    subcat: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
    bookmarks: PropTypes.array,
    displayMode: PropTypes.string,
    iconSize: PropTypes.string,
    onDisplayModeChange: PropTypes.func,
    onIconSizeChange: PropTypes.func,
  };

  // --- Interest Dropdown State ---
  const localInterestKey = 'selectedInterest';
  const getInitialInterest = () => {
    const saved = localStorage.getItem(localInterestKey);
    return saved ? saved : 'not_select'; // Default to 'not_select' instead of 'all'
  };
  const [selectedInterest, setSelectedInterest] = useState(getInitialInterest());
  const [interestOptions, setInterestOptions] = useState([{ id: 'all', name: 'All Interests' }]);
  const [interestSubcats, setInterestSubcats] = useState([]); // [{name: string}]
  const [isAutoCategoryChange, setIsAutoCategoryChange] = useState(false);

  // Reset selectedInterest when selectedCategory changes, but keep interest if "Not Selected" is chosen
  useEffect(() => {
    if (selectedCategory !== 'Not Selected' && !isAutoCategoryChange) {
      setSelectedInterest('not_select');
    }
    // Reset the auto change flag
    if (isAutoCategoryChange) {
      setIsAutoCategoryChange(false);
    }
  }, [selectedCategory, isAutoCategoryChange]);

  // Fetch interests from Firestore only if user is authenticated
  useEffect(() => {
    if (!firestoreUser) return;
    setInterestsLoading(true);
    async function fetchInterests() {
      try {
        const snap = await fsGetDocs(fsCollection(db, 'interests'));
        const options = [{ id: 'all', name: 'All Interests' }];
        snap.forEach(doc => {
          options.push({ id: doc.id, name: doc.data().name, subcategories: doc.data().subcategories || [] });
        });
        setInterestOptions(options);
      } catch {
        setInterestOptions([{ id: 'all', name: 'All Interests' }]);
      } finally {
        setInterestsLoading(false);
      }
    }
    fetchInterests();
  }, [firestoreUser]);
  // Persist selectedInterest
  useEffect(() => {
    if (interestLoading) {
      return; // Don't save while initial state is loading
    }
    if (firestoreUser) {
      const userDocRef = doc(db, "users", firestoreUser.uid);
      setDoc(userDocRef, { selectedInterest: selectedInterest }, { merge: true });
    } else {
    localStorage.setItem(localInterestKey, selectedInterest);
    }
  }, [selectedInterest, firestoreUser, interestLoading]);
  // Fetch subcategories for selected interest
  useEffect(() => {
    if (selectedInterest === 'all' || selectedInterest === 'not_select') {
      setInterestSubcats([]);
      return;
    }
    const found = interestOptions.find(i => i.id === selectedInterest);
    setInterestSubcats(found?.subcategories || []);
  }, [selectedInterest, interestOptions]);

  // --- Update subcats logic to use interest if selected ---
  const subcats = (selectedInterest !== 'not_select' && selectedInterest !== 'all')
    ? interestSubcats
    : (selectedCategory === 'Not Selected' && selectedInterest !== 'not_select')
      ? interestSubcats // Show interests when "Not Selected" is chosen and interest is selected
      : (isDemoMode 
          ? Object.keys(defaultBookmarks[selectedCategory] || {}).map(name => ({ name }))
          : (firestoreSubcats.length > 0 
              ? firestoreSubcats 
              : Object.keys(defaultBookmarks[selectedCategory] || {}).map(name => ({ name }))
            ));

  // Hide interest subcategories when selectedInterest is 'not_select'
  useEffect(() => {
    if (selectedInterest === 'not_select') {
      setInterestSubcats([]);
    }
  }, [selectedInterest]);

  // NEW: useEffect to fetch all bookmarks for the current subcategories
  useEffect(() => {
    if (isDemoMode) {
      if (selectedInterest !== 'not_select' && selectedInterest !== 'all') {
        // Load bookmarks for interest subcategories in demo mode
        interestSubcats.forEach(subcat => {
          const subcatName = getSubcatName(subcat);
          if (subcatName) {
            fetchSubcatBookmarks(subcatName);
          }
        });
      } else {
        // Load all bookmarks for first 3 categories and subcategories in demo mode
        Object.entries(defaultBookmarks).slice(0, 3).forEach(([, subcategories]) => {
          Object.keys(subcategories).forEach(subcatName => {
            if (subcatName) {
              fetchSubcatBookmarks(subcatName);
            }
          });
        });
      }
    } else {
      // Ensure all subcategories for the selected category are loaded
      const allSubcats = firestoreSubcats.length > 0 
        ? firestoreSubcats.map(subcat => getSubcatName(subcat))
        : Object.keys(defaultBookmarks[selectedCategory] || {});
      
      allSubcats.forEach(subcatName => {
        if (subcatName) {
          fetchSubcatBookmarks(subcatName);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, isDemoMode, firestoreSubcats, selectedInterest, interestSubcats]);

  // NEW: useEffect to fetch bookmarks for interest subcategories
  useEffect(() => {
    if (selectedInterest !== 'not_select' && selectedInterest !== 'all' && interestSubcats.length > 0) {
      interestSubcats.forEach(subcat => {
        const subcatName = getSubcatName(subcat);
        if (subcatName) {
          fetchSubcatBookmarks(subcatName);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInterest, interestSubcats]);

  // Build the widgets to render: all normal widgets + subcategory widgets
  const allWidgetItems = [
    // Weather, Clock, Calendar, Calculator
    ...Object.entries(componentMap)
      .filter(([key]) => ['weather', 'clock', 'calendar', 'calculator'].includes(key))
      .map(([key, component]) => ({
      id: key,
        type: 'widget',
      component,
        defaultColumn: 0,
    })),
    // Subcategory cards - only show if not a new page
    ...(pageId === "home" ? (isDemoMode 
        ? (selectedInterest !== 'not_select' && selectedInterest !== 'all')
          ? // Show interest subcategories in demo mode
            interestSubcats
              .filter(subcat => subcat !== null && subcat !== undefined && getSubcatName(subcat))
              .map((subcat, index) => {
                const subcatKey = getSubcatKey(subcat);
                const subcatName = getSubcatName(subcat);
                const bookmarks = subcatBookmarks[subcatKey] || [];
                const displayMode = subcatDisplayModes[subcatKey] || 'grid';
                const iconSize = subcatIconSizes[subcatKey] || 'medium';
                return {
                  id: `subcat_${subcatKey}`,
                  type: 'subcat',
                  component: (
                    <SubcategoryCard
                      key={subcatKey}
                      subcat={{ name: subcatName }}
                      bookmarks={bookmarks}
                      displayMode={displayMode}
                      iconSize={iconSize}
                      onDisplayModeChange={mode => handleSubcatDisplayMode(subcatKey, mode)}
                      onIconSizeChange={size => handleSubcatIconSize(subcatKey, size)}
                    />
                  ),
                  defaultColumn: (index % 2) + 1,
                };
              })
          : // Show default bookmarks in demo mode
            Object.entries(defaultBookmarks).slice(0, 3).flatMap(([, subcategories]) => 
              Object.keys(subcategories).map((subcatName, index) => {
                const bookmarks = subcatBookmarks[subcatName] || subcategories[subcatName] || [];
                const displayMode = subcatDisplayModes[subcatName] || 'list';
                const iconSize = subcatIconSizes[subcatName] || 'medium';
                return {
                  id: `subcat_${subcatName}`,
                  type: 'subcat',
                  component: (
                    <SubcategoryCard
                      key={`${subcatName}`}
                      subcat={{ name: subcatName }}
                      bookmarks={bookmarks}
                      displayMode={displayMode}
                      iconSize={iconSize}
                      onDisplayModeChange={mode => handleSubcatDisplayMode(subcatName, mode)}
                      onIconSizeChange={size => handleSubcatIconSize(subcatName, size)}
                    />
                  ),
                  defaultColumn: (index % 2) + 1,
                };
              })
            )
        : subcats
            .filter(subcat => subcat !== null && subcat !== undefined && getSubcatName(subcat))
            .map((subcat, index) => {
              const subcatKey = getSubcatKey(subcat);
              const subcatName = getSubcatName(subcat);
              const bookmarks = firestoreUser
                ? (subcatBookmarks[subcatKey] || [])
                : (defaultBookmarks[selectedCategory]?.[subcatName] || []);
              const displayMode = subcatDisplayModes[subcatKey] || 'grid';
              const iconSize = subcatIconSizes[subcatKey] || 'medium';
              return {
                id: `subcat_${subcatKey}`,
                type: 'subcat',
                component: (
                  <SubcategoryCard
                    key={subcatKey}
                    subcat={{ name: subcatName }}
                    bookmarks={bookmarks}
                    displayMode={displayMode}
                    iconSize={iconSize}
                    onDisplayModeChange={mode => handleSubcatDisplayMode(subcatKey, mode)}
                    onIconSizeChange={size => handleSubcatIconSize(subcatKey, size)}
                  />
                ),
                defaultColumn: (index % 2) + 1,
              };
            })
    ) : []),
    // ImageUploader, NewsFeed, Notepad, TodoList
    ...Object.entries(componentMap)
      .filter(([key]) => ['imageUploader', 'NewsFeed', 'notepad', 'Todo'].includes(key))
      .map(([key, component]) => ({
        id: key,
        type: 'widget',
        component,
        defaultColumn: 3,
      })),
  ];

  // Function to get all available widgets for the controller (including subcategories for new pages)
  const getAllAvailableWidgetsForController = () => {
    const baseWidgets = [
      // Weather, Clock, Calendar, Calculator
      ...Object.entries(componentMap)
        .filter(([key]) => ['weather', 'clock', 'calendar', 'calculator'].includes(key))
        .map(([key, component]) => ({
          id: key,
          type: 'widget',
          component,
          defaultColumn: 0,
        })),
      // ImageUploader, NewsFeed, Notepad, TodoList
      ...Object.entries(componentMap)
        .filter(([key]) => ['imageUploader', 'NewsFeed', 'notepad', 'Todo'].includes(key))
        .map(([key, component]) => ({
          id: key,
          type: 'widget',
          component,
          defaultColumn: 3,
        })),
    ];

    // Add subcategories for controller (always include them)
    const subcategoryWidgets = (isDemoMode 
      ? (selectedInterest !== 'not_select' && selectedInterest !== 'all')
        ? // Show interest subcategories in demo mode
          interestSubcats
            .filter(subcat => subcat !== null && subcat !== undefined && getSubcatName(subcat))
            .map((subcat, index) => {
              const subcatKey = getSubcatKey(subcat);
              const subcatName = getSubcatName(subcat);
              const bookmarks = subcatBookmarks[subcatKey] || [];
              const displayMode = subcatDisplayModes[subcatKey] || 'list';
              const iconSize = subcatIconSizes[subcatKey] || 'medium';
              return {
                id: `subcat_${subcatKey}`,
                type: 'subcat',
                component: (
                  <SubcategoryCard
                    key={subcatKey}
                    subcat={{ name: subcatName }}
                    bookmarks={bookmarks}
                    displayMode={displayMode}
                    iconSize={iconSize}
                    onDisplayModeChange={mode => handleSubcatDisplayMode(subcatKey, mode)}
                    onIconSizeChange={size => handleSubcatIconSize(subcatKey, size)}
                  />
                ),
                defaultColumn: (index % 2) + 1,
              };
            })
        : // Show default bookmarks in demo mode
          Object.entries(defaultBookmarks).slice(0, 3).flatMap(([, subcategories]) => 
            Object.keys(subcategories).map((subcatName, index) => {
              const bookmarks = subcatBookmarks[subcatName] || subcategories[subcatName] || [];
              const displayMode = subcatDisplayModes[subcatName] || 'list';
              const iconSize = subcatIconSizes[subcatName] || 'medium';
              return {
                id: `subcat_${subcatName}`,
                type: 'subcat',
                component: (
                  <SubcategoryCard
                    key={`${subcatName}`}
                    subcat={{ name: subcatName }}
                    bookmarks={bookmarks}
                    displayMode={displayMode}
                    iconSize={iconSize}
                    onDisplayModeChange={mode => handleSubcatDisplayMode(subcatName, mode)}
                    onIconSizeChange={size => handleSubcatIconSize(subcatName, size)}
                  />
                ),
                defaultColumn: (index % 2) + 1,
              };
            })
          )
      : subcats
          .filter(subcat => subcat !== null && subcat !== undefined && getSubcatName(subcat))
          .map((subcat, index) => {
            const subcatKey = getSubcatKey(subcat);
            const subcatName = getSubcatName(subcat);
            const bookmarks = firestoreUser
              ? (subcatBookmarks[subcatKey] || [])
              : (defaultBookmarks[selectedCategory]?.[subcatName] || []);
            const displayMode = subcatDisplayModes[subcatKey] || 'list';
            const iconSize = subcatIconSizes[subcatKey] || 'medium';
            return {
              id: `subcat_${subcatKey}`,
              type: 'subcat',
              component: (
                <SubcategoryCard
                  key={subcatKey}
                  subcat={{ name: subcatName }}
                  bookmarks={bookmarks}
                  displayMode={displayMode}
                  iconSize={iconSize}
                  onDisplayModeChange={mode => handleSubcatDisplayMode(subcatKey, mode)}
                  onIconSizeChange={size => handleSubcatIconSize(subcatKey, size)}
                />
              ),
              defaultColumn: (index % 2) + 1,
            };
          })
    );

    return [...baseWidgets, ...subcategoryWidgets];
  };

  // Only set default layout if items is empty and not on every render (only for home page)
  useEffect(() => {
    if (!loading && items.length === 0 && pageId === "home") {
      // Initialize layout only if items is empty and it's the home page
      const initialLayout = allWidgetItems.map((item, idx) => ({
        id: item.id,
        column: item.defaultColumn,
        position: idx,
        type: item.type,
      }));
      setItems(initialLayout);
    }
    // eslint-disable-next-line
  }, [loading, allWidgetItems.length, pageId]);

  // Ensure all subcategories are always present in items (only for home page)
  useEffect(() => {
    if (loading || pageId !== "home") return;
    // Find subcat ids in allWidgetItems
    const subcatIds = allWidgetItems.filter(i => i.type === 'subcat').map(i => i.id);
    // Remove subcat items not in current subcatIds
    let filteredItems = items.filter(item => item.type !== 'subcat' || subcatIds.includes(item.id));
    // Find missing subcat ids in items
    const missingSubcats = subcatIds.filter(id => !filteredItems.some(item => item.id === id));
    if (missingSubcats.length > 0) {
      // Add missing subcats to items, assign to column 1 or 2, position at end
      let maxPosCol1 = Math.max(-1, ...filteredItems.filter(i => i.column === 1).map(i => i.position));
      let maxPosCol2 = Math.max(-1, ...filteredItems.filter(i => i.column === 2).map(i => i.position));
      const newItems = [...filteredItems];
      missingSubcats.forEach((id, idx) => {
        // Find the widget info from allWidgetItems
        const widget = allWidgetItems.find(i => i.id === id);
        // Alternate between column 1 and 2
        const col = (idx % 2) + 1;
        const pos = col === 1 ? ++maxPosCol1 : ++maxPosCol2;
        newItems.push({
          id: widget.id,
          column: col,
          position: pos,
          type: widget.type,
        });
      });
      setItems(newItems);
    } else if (filteredItems.length !== items.length) {
      setItems(filteredItems);
    }
    // eslint-disable-next-line
  }, [subcats, allWidgetItems.length, items.length, loading, pageId]);

  // Fetch bookmarks for subcategories when they are added to items
  useEffect(() => {
    if (loading) return;
    
    // Find subcategories in current items that might need bookmarks fetched
    const subcatItems = items.filter(item => item.type === 'subcat' && item.id.startsWith('subcat_'));
    
    subcatItems.forEach(item => {
      const subcatName = item.id.replace('subcat_', '');
      // Only fetch if bookmarks haven't been loaded yet
      if (!subcatBookmarks[subcatName] || subcatBookmarks[subcatName].length === 0) {
        fetchSubcatBookmarks(subcatName);
      }
    });
  }, [items, loading]);

  // Helper to get the component for a given id
  const getComponentById = (id) => {
    // First try to find in allWidgetItems (for home page)
    let found = allWidgetItems.find((item) => item.id === id);
    
    // If not found and it's a subcategory, try to get from controller widgets
    if (!found && id.startsWith('subcat_')) {
      const controllerWidgets = getAllAvailableWidgetsForController();
      found = controllerWidgets.find((item) => item.id === id);
    }
    
    return found ? found.component : null;
  };

  // Widget grid render: always use 'items' state for layout
  const columnItems = useMemo(() =>
    Array.from({ length: columns }, (_, colIdx) =>
      items
        .filter((item) => item.column === colIdx)
        .sort((a, b) => a.position - b.position)
    ),
    [items, columns]
  );

  // Drag and drop logic for all items
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceCol = parseInt(result.source.droppableId);
    const destCol = parseInt(result.destination.droppableId);
    const sourceIdx = result.source.index;
    const destIdx = result.destination.index;

    // Deep copy items
    let newItems = [...items];

    // Find the item being moved
    const movingItemIdx = newItems.findIndex(
      (item) => item.column === sourceCol && item.position === sourceIdx
    );
    if (movingItemIdx === -1) return;
    const [movedItem] = newItems.splice(movingItemIdx, 1);

    // Update column
    movedItem.column = destCol;

    // Insert into new position
    // Find all items in destCol
    const destColItems = newItems.filter((item) => item.column === destCol);
    // Insert at destIdx
    newItems = [
      ...newItems.filter((item) => item.column !== destCol),
      ...[...destColItems.slice(0, destIdx), movedItem, ...destColItems.slice(destIdx)],
    ];

    // Reassign positions in each column
    for (let col = 0; col < columns; col++) {
      let colItems = newItems.filter((item) => item.column === col);
      colItems.forEach((item, idx) => {
        item.position = idx;
      });
    }

    // Flatten and sort
    newItems.sort((a, b) => a.column - b.column || a.position - b.position);

    setItems(newItems);

    // Save layout
    if (user) {
      updatePageLayout(user.uid, pageId, {
        widgets: newItems,
        columns,
      });
    } else {
      saveToLocalStorage({
        widgets: newItems,
        columns,
      });
    }
  };

  // Update WidgetCard to support collapse/expand
  // WidgetController state
  const [isWidgetControllerOpen, setIsWidgetControllerOpen] = useState(false);
  const [widgetPreview, setWidgetPreview] = useState([]); // for previewing changes
  const [widgetControllerColumns, setWidgetControllerColumns] = useState(columns);
  const [hasUnsavedWidgetChanges, setHasUnsavedWidgetChanges] = useState(false);
  // Track available widgets in controller
  const [availableWidgetsPreview, setAvailableWidgetsPreview] = useState([]);
    
  // At the top level of your component:
  const prevWidgetControllerOpen = useRef(false);
    
  // When opening the controller, sync preview and columns, and reset unsaved changes
  useEffect(() => {
    if (isWidgetControllerOpen && !prevWidgetControllerOpen.current) {
      setWidgetPreview(items.map((item) => ({ ...item })));
      setWidgetControllerColumns(columns);
      setHasUnsavedWidgetChanges(false);
      // Calculate available widgets (not in preview) - include subcategories for controller
      const usedIds = new Set(items.map(item => item.id));
      const controllerWidgets = getAllAvailableWidgetsForController();
      const available = controllerWidgets.filter(item => !usedIds.has(item.id));
      setAvailableWidgetsPreview(available);
    }
    prevWidgetControllerOpen.current = isWidgetControllerOpen;
    // eslint-disable-next-line
  }, [isWidgetControllerOpen]);
    
  // Only redistribute widgets if the user changes the column count in the controller
  const prevWidgetControllerColumns = useRef(columns);
  useEffect(() => {
    if (!isWidgetControllerOpen) return;
    if (widgetControllerColumns === prevWidgetControllerColumns.current) return;
    // Distribute widgets across columns
    setWidgetPreview(prev => {
      setHasUnsavedWidgetChanges(true);
      return prev.map((item, idx) => {
        if (widgetControllerColumns === 3 && item.type === 'subcat') {
          return { ...item, column: 1, position: idx };
        }
        if (widgetControllerColumns === 4 && item.type === 'subcat') {
          // Distribute evenly between columns 1 and 2
          return { ...item, column: 1 + (idx % 2), position: idx };
        }
        return {
        ...item,
        column: idx % widgetControllerColumns,
        position: Math.floor(idx / widgetControllerColumns),
        };
      });
    });
    prevWidgetControllerColumns.current = widgetControllerColumns;
    // eslint-disable-next-line
  }, [widgetControllerColumns, isWidgetControllerOpen]);

  // Mark unsaved changes on drag/drop in controller
  const onWidgetControllerDragEnd = (result) => {
    if (!result.destination) return;
    setHasUnsavedWidgetChanges(true);

    setWidgetPreview(prev => {
      const sourceCol = parseInt(result.source.droppableId);
      const destCol = parseInt(result.destination.droppableId);
      const sourceIdx = result.source.index;
      const destIdx = result.destination.index;

      // Get items in each column
      let colItems = Array.from({ length: widgetControllerColumns }, (_, colIdx) =>
        prev.filter(w => w.column === colIdx).sort((a, b) => a.position - b.position)
      );
      // Remove from source
      const [moved] = colItems[sourceCol].splice(sourceIdx, 1);
      // Insert into dest
      moved.column = destCol;
      colItems[destCol].splice(destIdx, 0, moved);
      // Reassign positions in each column
      colItems.forEach((arr, colIdx) => {
        arr.forEach((item, idx) => {
          item.position = idx;
          item.column = colIdx;
        });
      });
      // Flatten
      return colItems.flat();
    });
  };

  // Delete widget from preview and add to available
  const handleDeleteWidgetFromPreview = (widgetId) => {
    setHasUnsavedWidgetChanges(true);
    setWidgetPreview(prev => prev.filter(w => w.id !== widgetId));
    // Find the widget info from controller widgets
    const controllerWidgets = getAllAvailableWidgetsForController();
    const widget = controllerWidgets.find(w => w.id === widgetId);
    if (widget) {
      setAvailableWidgetsPreview(prev => [...prev, widget]);
    }
  };

  // Add widget from available to preview
  const handleAddWidgetToPreview = (widgetId) => {
    setHasUnsavedWidgetChanges(true);
    // Remove from available
    setAvailableWidgetsPreview(prev => prev.filter(w => w.id !== widgetId));
    
    // If it's a subcategory, fetch its bookmarks
    if (widgetId.startsWith('subcat_')) {
      const subcatName = widgetId.replace('subcat_', '');
      fetchSubcatBookmarks(subcatName);
    }
    
    // Add to preview, assign to column with least widgets
    setWidgetPreview(prev => {
      const controllerWidgets = getAllAvailableWidgetsForController();
      const widget = controllerWidgets.find(w => w.id === widgetId);
      if (!widget) return prev;
      let column = 0;
      if (widgetControllerColumns === 3 && widget.type === 'subcat') {
        column = 1; // center column
      } else if (widgetControllerColumns === 4 && widget.type === 'subcat') {
        // Alternate between columns 1 and 2 for subcats
        const subcatCount = prev.filter(w => w.type === 'subcat').length;
        column = 1 + (subcatCount % 2);
      } else {
        // Find column with least widgets
        const colCounts = Array.from({ length: widgetControllerColumns }, (_, colIdx) =>
          prev.filter(w => w.column === colIdx).length
        );
        column = colCounts.indexOf(Math.min(...colCounts));
      }
      const pos = prev.filter(w => w.column === column).length;
      return [
        ...prev,
        {
          id: widget.id,
          type: widget.type,
          column,
          position: pos,
        },
      ];
    });
  };

  // Reset to default layout in controller (does not close modal)
  const handleControllerDefault = () => {
    setWidgetControllerColumns(4);
    setColumns(4);
    // Reset preview to default widgets
    const defaultWidgetsArr = (defaultWidgets[pageId] || []).map((item, idx) => ({ ...item, position: idx, column: idx % 4 }));
    setWidgetPreview(defaultWidgetsArr);
    // Update available widgets
    const usedIds = new Set(defaultWidgetsArr.map(item => item.id));
    const controllerWidgets = getAllAvailableWidgetsForController();
    const available = controllerWidgets.filter(item => !usedIds.has(item.id));
    setAvailableWidgetsPreview(available);
    setHasUnsavedWidgetChanges(true);
};

  // Confirm before closing if there are unsaved changes
  const handleWidgetControllerCancel = () => {
    if (hasUnsavedWidgetChanges) {
      Modal.confirm({
        title: 'Discard changes?',
        content: 'You have unsaved changes in the Widget Controller. Are you sure you want to close without saving?',
        okText: 'Discard',
        cancelText: 'Keep Editing',
        onOk: () => {
          setIsWidgetControllerOpen(false);
          setHasUnsavedWidgetChanges(false);
        },
      });
    } else {
      setIsWidgetControllerOpen(false);
    }
  };

  // Custom Modal for Widget Controller
  const CustomModal = ({ open, onClose, children, width = 900 }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-[1200] flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity duration-200"
          onClick={onClose}
        />
        {/* Modal Content */}
        <div
          className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6"
          style={{ width: width, maxWidth: '95vw', maxHeight: '80vh', overflowY: 'auto' }}
        >
          {/* Close Button */}
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold focus:outline-none"
            onClick={onClose}
            title="Close"
          >
            ×
          </button>
          {children}
        </div>
      </div>
    );
  };
  CustomModal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    children: PropTypes.node,
    width: PropTypes.number,
  };

  // Widget Controller component (custom modal)
  const WidgetController = () => (
    <CustomModal open={isWidgetControllerOpen} onClose={handleWidgetControllerCancel} width={900}>
        <div>
          <div className="text-lg dark:text-white font-semibold flex items-center gap-2">
            Widget Controller
            {hasUnsavedWidgetChanges && (
              <span className="ml-2 text-xs text-orange-500 font-semibold flex items-center gap-1">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="orange" strokeWidth="2" fill="none"/><path d="M12 8v4m0 4h.01" stroke="orange" strokeWidth="2"/></svg>
                Unsaved changes
              </span>
            )}
          </div>
        <div className="text-gray-500 text-sm mt-1 mb-4">
            Organize your widgets. Drag and drop to reorder. Select columns (1-4). Click Apply to save.
          </div>
      <div className="mb-4 flex gap-4 items-center">
        <span className="font-medium dark:text-white">Columns:</span>
        {[1,2,3,4].map(num => (
          <button
            key={num}
            className={`px-4 py-2 rounded-md font-semibold border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              widgetControllerColumns === num ? "bg-blue-500 text-white shadow" : "bg-white dark:bg-gray-700 hover:bg-blue-100 dark:text-white dark:hover:bg-gray-600"
            }`}
            onClick={() => setWidgetControllerColumns(num)}
          >
            {num}
          </button>
        ))}
          <button
            className="ml-4 px-4 py-2 rounded-md font-semibold border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2"
            onClick={handleControllerDefault}
            title="Reset to Default Layout"
          >
            {/* Reset Icon */}
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4v5h.582M20 20v-5h-.581M5.003 9A9 9 0 0 1 12 5c2.386 0 4.553.936 6.197 2.463M18.997 15A9 9 0 0 1 12 19c-2.386 0-4.553-.936-6.197-2.463"/></svg>
            Default
          </button>
        {hasUnsavedWidgetChanges && (
          <span className="ml-4 text-xs text-orange-500 font-semibold flex items-center gap-1">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="orange" strokeWidth="2" fill="none"/><path d="M12 8v4m0 4h.01" stroke="orange" strokeWidth="2"/></svg>
            Unsaved changes
          </span>
        )}
      </div>
      <DragDropContext onDragEnd={onWidgetControllerDragEnd}>
        <div className={`grid grid-cols-${widgetControllerColumns} gap-4`}>
          {Array.from({ length: widgetControllerColumns }).map((_, colIdx) => (
            <Droppable droppableId={colIdx.toString()} key={colIdx}>
              {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  className="flex flex-col gap-4 min-h-[100px] p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                  {widgetPreview
                    .filter(w => w.column === colIdx)
                    .sort((a, b) => a.position - b.position)
                    .map((item, idx) => (
                      <Draggable key={item.id} draggableId={item.id} index={idx}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-4 border rounded flex flex-col items-center bg-white dark:bg-gray-800 transition-shadow duration-200 ${snapshot.isDragging ? 'shadow-2xl' : ''}`}
                          >
                              <div className="flex w-full items-center justify-between">
                                <div>
                            <div className="font-semibold dark:text-white">{item.id.replace('subcat_', '')}</div>
                            <div className="text-xs text-gray-400">{item.type}</div>
                                </div>
                                <button
                                  className="ml-2 p-2 rounded bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center justify-center"
                                  title="Remove Widget"
                                  onClick={() => handleDeleteWidgetFromPreview(item.id)}
                                >
                                  {/* Trash Icon */}
                                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M3 6h18" />
                                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                    <path d="M10 11v6" />
                                    <path d="M14 11v6" />
                                  </svg>
                                </button>
                              </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
          ))}
                  </div>
      </DragDropContext>
        {/* Available Widgets Section */}
        <div className="mt-8">
          <div className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Available Widgets ({availableWidgetsPreview.length})</div>
          <div className="flex flex-wrap gap-3">
            {availableWidgetsPreview.length === 0 && (
              <div className="text-gray-400">No available widgets</div>
            )}
            {availableWidgetsPreview.map(widget => (
              <div key={widget.id} className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded shadow-sm">
                <span className="font-medium dark:text-white">{widget.id.replace('subcat_', '')}</span>
                <button
                  className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition flex items-center justify-center"
                  title="Add Widget"
                  onClick={() => handleAddWidgetToPreview(widget.id)}
                >
                  {/* Plus Icon */}
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* Footer actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-5 py-2 rounded-md font-semibold border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            onClick={handleWidgetControllerCancel}
          >
            Cancel
          </button>
          <button
            className={`px-5 py-2 rounded-md font-semibold bg-blue-600 text-white shadow hover:bg-blue-700 transition ${!hasUnsavedWidgetChanges ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={!hasUnsavedWidgetChanges}
            onClick={() => {
              setItems(widgetPreview); // Only here!
              setColumns(widgetControllerColumns);
              setIsWidgetControllerOpen(false);
              setHasUnsavedWidgetChanges(false);
              // Save to localStorage or Firestore as needed
              if (user) {
                updatePageLayout(user.uid, pageId, {
                  widgets: widgetPreview,
                  columns: widgetControllerColumns,
                });
              } else {
                saveToLocalStorage({
                  widgets: widgetPreview,
                  columns: widgetControllerColumns,
                });
              }
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </CustomModal>
  );

  // Helper function to truncate bookmark names after 10 characters
  function truncateName(name, len = 10) {
    if (!name) return '';
    return name.length > len ? name.slice(0, len) + '...' : name;
  }

  // Helper to render bookmarks in the selected mode
  function renderBookmarksView(bookmarks, mode = 'list', iconSize = 'medium') {
    if (!Array.isArray(bookmarks)) return null;
    // Remove duplicates by normalized URL
    const seen = new Set();
    const uniqueBookmarks = bookmarks.filter(item => {
      const norm = normalizeDomain(item.link || '');
      if (seen.has(norm)) return false;
      seen.add(norm);
      return true;
    });
    // Icon size classes
    const sizeClass = iconSize === 'small' ? 'w-4 h-4' : iconSize === 'large' ? 'w-10 h-10' : 'w-7 h-7';
    const sizeClassList = iconSize === 'small' ? 'w-5 h-5' : iconSize === 'large' ? 'w-12 h-12' : 'w-7 h-7';
    if (mode === 'list') {
      // Show all bookmarks in a scrollable container (max 5 visible at a time)
      return (
        <div className="flex flex-col gap-2 p-3 max-h-64 overflow-y-auto" style={{ maxHeight: '220px', minHeight: '0' }}>
          {uniqueBookmarks.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group"
            >
              <img
                src={`https://www.google.com/s2/favicons?sz=64&domain=${(() => { try { return new URL(item.link).hostname; } catch { return 'google.com'; } })()}`}
                alt=""
                className={sizeClassList + " rounded"}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.google.com/favicon.ico'; }}
              />
              <span className="flex-1 text-gray-900 dark:text-gray-100 max-w-xs overflow-hidden whitespace-nowrap">
                {item.name}
              </span>
            </a>
          ))}
        </div>
      );
    }
    if (mode === 'grid') {
      // Show 3 rows (5 columns per row) in a scrollable grid
      const maxRows = 2.5;
      // Icon size affects row height, so set a fixed height per row
      let rowHeight = 70; // default for medium
      if (iconSize === 'small') rowHeight = 50;
      if (iconSize === 'large') rowHeight = 100;
      const gridHeight = rowHeight * maxRows + 16; // +16 for padding/gap
      return (
        <div
          className="grid grid-cols-5 gap-2 p-3 overflow-y-auto"
          style={{ maxHeight: `${gridHeight}px`, minHeight: '0' }}
        >
          {uniqueBookmarks.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group"
            >
              <img
                src={`https://www.google.com/s2/favicons?sz=64&domain=${(() => { try { return new URL(item.link).hostname; } catch { return 'google.com'; } })()}`}
                alt=""
                className={sizeClass + " rounded mb-1"}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.google.com/favicon.ico'; }}
              />
              <span className="text-xs text-gray-900 dark:text-gray-100 truncate max-w-[80px] overflow-hidden whitespace-nowrap text-center">
                {truncateName(item.name, 6)}
              </span>
            </a>
          ))}
        </div>
      );
    }
    if (mode === 'cloud') {
      return (
        <div className="flex flex-wrap gap-2 p-3">
          {uniqueBookmarks.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-100 text-xs font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-700 transition flex items-center gap-1"
            >
              <img
                src={`https://www.google.com/s2/favicons?sz=64&domain=${(() => { try { return new URL(item.link).hostname; } catch { return 'google.com'; } })()}`}
                alt=""
                className={sizeClass + " rounded"}
                style={{ minWidth: '1em' }}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.google.com/favicon.ico'; }}
              />
              <span className="truncate max-w-[100px] overflow-hidden whitespace-nowrap">{item.name}</span>
            </a>
          ))}
        </div>
      );
    }
    if (mode === 'icon') {
      return (
        <div className="grid grid-cols-6 gap-2 p-3">
          {uniqueBookmarks.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group flex items-center justify-center"
            >
              <img
                src={`https://www.google.com/s2/favicons?sz=64&domain=${(() => { try { return new URL(item.link).hostname; } catch { return 'google.com'; } })()}`}
                alt=""
                className={sizeClass + " rounded"}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.google.com/favicon.ico'; }}
              />
            </a>
          ))}
        </div>
      );
    }
    return null;
  }

  // Helper to check if a widget is a bookmarks widget
  function isBookmarksWidget(id) {
    return id === 'Bookmarks';
  }

  // Only keep Bookmarks widget logic if needed (remove Bookmarks1-9 logic)
  // If you need Bookmarks widget, you can use:
  // const allBookmarks = ... (for 'Popular' category)

  // Add state for global search
  const [globalSearch, setGlobalSearch] = useState("");

  // Add state for search results modal
  const [searchResults] = useState({ bookmarks: [], widgets: [] });
  const [showSearchModal, setShowSearchModal] = useState(false);
  const searchModalRef = useRef(null);

  // Close search modal on outside click or Escape
  useEffect(() => {
    if (!showSearchModal) return;
    function handleKey(e) {
      if (e.key === "Escape") setShowSearchModal(false);
    }
    function handleClick(e) {
      if (searchModalRef.current && !searchModalRef.current.contains(e.target)) {
        setShowSearchModal(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [showSearchModal]);

  // Helper to get all bookmarks (user and default)
  function getAllBookmarks() {
    let all = [];
    // User bookmarks
    Object.entries(subcatBookmarks).forEach(([subcat, arr]) => {
      if (Array.isArray(arr)) {
        arr.forEach(b => all.push({ ...b, subcat, category: selectedCategory }));
      }
    });
    // Default bookmarks (for all categories)
    Object.entries(defaultBookmarks).forEach(([cat, subcats]) => {
      Object.entries(subcats).forEach(([subcat, arr]) => {
        arr.forEach(b => all.push({ ...b, subcat, category: cat }));
      });
    });
    return all;
  }
  // Helper to get all widgets/components (by display name)
  function getAllWidgets() {
    return Object.entries(componentMap).map(([key]) => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
    }));
  }

  // Add state for filtered grid view
  const [activeSearchIds, setActiveSearchIds] = useState(null); // null = no search, array = filtered

  // Update handleGlobalSearch to filter the main grid
  const runLiveSearch = (query) => {
    query = query.trim().toLowerCase();
    if (!query) {
      setActiveSearchIds(null);
      return;
    }
    // Bookmarks
    const allBookmarks = getAllBookmarks();
    const filteredBookmarks = allBookmarks.filter(b =>
      (b.name && b.name.toLowerCase().includes(query)) ||
      (b.link && b.link.toLowerCase().includes(query))
    );
    // Widgets
    const allWidgets = getAllWidgets();
    const filteredWidgets = allWidgets.filter(w =>
      w.name.toLowerCase().includes(query)
    );
    // Collect matching widget IDs and subcat IDs
    const widgetIds = filteredWidgets.map(w => w.id);
    const subcatIds = filteredBookmarks.map(b => `subcat_${b.subcat}`);
    // If a widget is a bookmarks widget, also include it
    if (filteredBookmarks.length > 0) widgetIds.push('Bookmarks');
    setActiveSearchIds([...new Set([...widgetIds, ...subcatIds])]);
  };

  // On input change, run live search
  const handleSearchInput = (e) => {
    setGlobalSearch(e.target.value);
    runLiveSearch(e.target.value);
  };

  // On form submit, just prevent default and clear if empty
  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (!globalSearch.trim()) setActiveSearchIds(null);
  };

  // When search input is cleared, restore full grid
  useEffect(() => {
    if (!globalSearch.trim()) {
      setActiveSearchIds(null);
    }
  }, [globalSearch]);

  // In the grid rendering, filter items if activeSearchIds is set
  const filteredColumnItems = useMemo(() => {
    if (!activeSearchIds) return columnItems;
    return columnItems.map(col =>
      col.filter(item => activeSearchIds.includes(item.id))
    );
  }, [columnItems, activeSearchIds]);

  // Add state for sliding search
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Focus input when open
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!searchOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") setSearchOpen(false);
    }
    function handleClick(e) {
      if (searchInputRef.current && !searchInputRef.current.parentNode.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [searchOpen]);

  // Add state for three-dot menu
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Collapse/Expand all handlers
  const handleCollapseAll = () => {
    setCollapsedItems(() => {
      const newState = {};
      items.forEach(item => { newState[item.id] = true; });
      localStorage.setItem("collapsedItems", JSON.stringify(newState));
      return newState;
    });
    setMenuOpen(false);
  };
  const handleExpandAll = () => {
    setCollapsedItems(() => {
      const newState = {};
      items.forEach(item => { newState[item.id] = false; });
      localStorage.setItem("collapsedItems", JSON.stringify(newState));
      return newState;
    });
    setMenuOpen(false);
  };

  // Add state for all bookmarks view modal
  const [showAllBookmarks, setShowAllBookmarks] = useState(false);

  // Helper to check if all widgets are collapsed
  const allCollapsed = useMemo(() => {
    return items.every(item => collapsedItems[item.id]);
  }, [items, collapsedItems]);

  // Add state for view mode modal
  const [showViewModeModal, setShowViewModeModal] = useState(false);

  // Add state for submenu open
  const [viewModeSubmenuOpen, setViewModeSubmenuOpen] = useState(false);

  // Add refs for menu and submenu
  const menuContainerRef = useRef(null);
  const submenuRef = useRef(null);

  // Close menu and submenu on outside click
  useEffect(() => {
    if (!menuOpen && !viewModeSubmenuOpen) return;
    function handleClick(e) {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(e.target) &&
        (!submenuRef.current || !submenuRef.current.contains(e.target))
      ) {
        setMenuOpen(false);
        setViewModeSubmenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen, viewModeSubmenuOpen]);

  // Add this near the top, after user is fetched
  const userProfession = user?.profession || null;

  // Filter categories to only those with at least one subcategory for the user's profession
  const filteredCategories = isDemoMode
    ? Object.keys(defaultBookmarks) // Show all demo categories in demo mode
    : (!userProfession
        ? allCategories
        : allCategories.filter(cat => {
            // Get subcategories for this category
            const subcatsRaw = (firestoreUser && firestoreSubcats.length > 0 && selectedCategory === cat)
              ? firestoreSubcats
              : (defaultBookmarks[cat] ? Object.values(defaultBookmarks[cat]) : []);
            // Flatten if needed
            const subcatsArr = Array.isArray(subcatsRaw) ? subcatsRaw : Object.values(subcatsRaw);
            // Check if any subcategory matches the user's profession
            return subcatsArr.some(
              subcat =>
                typeof subcat === 'object' &&
                Array.isArray(subcat.professions) &&
                subcat.professions.includes(userProfession)
            );
          }));

  // Add at the top of Anotherpage component
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [firstTimeStep, setFirstTimeStep] = useState(null); // 'category' or 'interest'
  const [firstTimeSelection, setFirstTimeSelection] = useState("");

  // Check on mount if user has selected category/interest
  useEffect(() => {
    async function checkFirstTime() {
      let hasCategory = false;
      let hasInterest = false;
      if (firestoreUser) {
        const userDocRef = doc(db, "users", firestoreUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          hasCategory = !!data.selectedCategory;
          hasInterest = !!data.selectedInterest && data.selectedInterest !== 'not_select';
        }
      } else {
        hasCategory = !!localStorage.getItem('selectedCategory');
        hasInterest = !!localStorage.getItem('selectedInterest') && localStorage.getItem('selectedInterest') !== 'not_select';
      }
      if (!hasCategory && !hasInterest) {
        setShowFirstTimeModal(true);
      }
    }
    checkFirstTime();
  }, [firestoreUser]);

  // Handle first time modal selection
  const handleFirstTimeChoice = (choice) => {
    setFirstTimeStep(choice); // 'category' or 'interest'
  };
  const handleFirstTimeSelect = async (value) => {
    setFirstTimeSelection(value);
    if (firstTimeStep === 'category') {
      setSelectedCategory(value);
      if (firestoreUser) {
        const userDocRef = doc(db, "users", firestoreUser.uid);
        const professionId = categoryToProfessionId[value] || "other";
        await setDoc(userDocRef, { selectedCategory: value, profession: professionId }, { merge: true });
      } else {
        localStorage.setItem('selectedCategory', value);
      }
    } else if (firstTimeStep === 'interest') {
      setSelectedInterest(value);
      if (firestoreUser) {
        const userDocRef = doc(db, "users", firestoreUser.uid);
        await setDoc(userDocRef, { selectedInterest: value }, { merge: true });
      } else {
        localStorage.setItem('selectedInterest', value);
      }
    }
    setShowFirstTimeModal(false);
  };

  return (
    <div className={`anotherpage-container ${isDarkMode ? "dark" : ""}`}> 
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 mb-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <span className="font-semibold">Demo Mode</span>
                <span className="ml-2 text-blue-100">You&apos;re viewing demo version with thier bookmarks. Sign in to access your personal data!</span>
              </div>
            </div>
            {/* <button
              onClick={() => {}}
              className="text-blue-100 hover:text-white transition-colors"
              title="Hide demo banner"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button> */}
          </div>
        </div>
      )}
      
      {allCategories.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-2xl font-semibold text-gray-500 dark:text-gray-300 mt-20">No subcategories found for your profession.</div>
        </div>
      ) : (
      <>
      {/* Profession, Interest, Search, and Menu in separate divs at the top */}
      <div className="w-full flex items-center mb-1 justify-between" style={{ maxWidth: '90vw', margin: '0 auto', position: 'relative' }}>
        {/* Left: Profession and Interest Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: 6 }}>
          {/* Profession Dropdown */}
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Dropdown
              overlay={
                <Menu style={{ width: 250, maxHeight: 280, overflowY: 'auto' }}>
                  {filteredCategories.map(cat => (
                    <Menu.Item key={cat} onClick={async () => {
                      if (isDemoMode) {
                        setShowLoginModal(true);
                        return;
                      }
                      setSelectedCategory(cat);
                      if (firestoreUser) {
                        const userDocRef = doc(db, "users", firestoreUser.uid);
                        const professionId = categoryToProfessionId[cat] || "other";
                        await setDoc(userDocRef, { selectedCategory: cat, profession: professionId }, { merge: true });
                      } else {
                        localStorage.setItem('selectedCategory', cat);
                      }
                    }}>
                      {cat}
                    </Menu.Item>
                  ))}
                </Menu>
              }
              trigger={["click"]}
              placement="bottomLeft"
              disabled={isDemoMode}
            >
              <button
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition cursor-pointer ${
                  isDemoMode 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed' 
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800'
                }`}
                style={{ minWidth: 0, marginRight: 1, width: 120, justifyContent: 'flex-start' }}
                title={isDemoMode ? "Sign in to change category" : "Select Category"}
                onClick={() => handleDropdownClick('category')}
              >
                <span className="truncate max-w-[110px]">{selectedCategory}</span>
                <span className={`ml-auto flex items-center ${isDemoMode ? 'text-gray-400' : 'text-blue-400'}`}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
                </span>
              </button>
            </Dropdown>
          </div>
          {/* Interest Dropdown */}
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 1, marginRight: 12 }}>
            <Dropdown
              overlay={
                <Menu style={{ width: 250 }}>
                  <Menu.Item key="not_select" onClick={async () => {
                    if (isDemoMode) {
                      setShowLoginModal(true);
                      return;
                    }
                    setSelectedInterest('not_select');
                    // Don't change profession when "Not Selected" is chosen in interest dropdown
                  }}>
                    Not Selected
                  </Menu.Item>
                  {interestOptions.map(i => (
                    <Menu.Item key={i.id} onClick={async () => {
                      if (isDemoMode) {
                        setShowLoginModal(true);
                        return;
                      }
                      setSelectedInterest(i.id);
                      // Automatically set profession to "Not Selected" when any interest is selected
                      setIsAutoCategoryChange(true);
                      setSelectedCategory('Not Selected');
                      if (firestoreUser) {
                        const userDocRef = doc(db, "users", firestoreUser.uid);
                        await setDoc(userDocRef, { 
                          selectedCategory: 'Not Selected', 
                          profession: 'not_selected',
                          selectedInterest: i.id 
                        }, { merge: true });
                      } else {
                        localStorage.setItem('selectedCategory', 'Not Selected');
                      }
                    }}>
                      {i.name}
                    </Menu.Item>
                  ))}
                </Menu>
              }
              trigger={["click"]}
              placement="bottomLeft"
              disabled={isDemoMode}
            >
              <button
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition cursor-pointer ${
                  isDemoMode 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed' 
                    : selectedCategory === 'Not Selected'
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700 hover:bg-orange-200 dark:hover:bg-orange-800'
                      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-800'
                }`}
                style={{ minWidth: 0, width: selectedCategory === 'Not Selected' ? 180 : 150, justifyContent: 'flex-start' }}
                title={isDemoMode ? "Sign in to change interest" : selectedCategory === 'Not Selected' ? "Select Interest (Required when no profession selected)" : "Select Interest"}
                onClick={() => handleDropdownClick('interest')}
              >
                <span className="truncate max-w-[130px]">
                  {selectedCategory === 'Not Selected' && selectedInterest === 'not_select'
                    ? 'Select Interest *'
                    : selectedInterest === 'not_select'
                    ? 'Not Selected'
                    : (interestOptions.find(i => i.id === selectedInterest)?.name || 'All Interests')}
                </span>
                <span className={`ml-auto flex items-center ${isDemoMode ? 'text-gray-400' : selectedCategory === 'Not Selected' ? 'text-orange-400' : 'text-purple-400'}`}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
                </span>
              </button>
            </Dropdown>
          </div>
        </div>
        {/* Helpful message when "Not Selected" is chosen */}
        {selectedCategory === 'Not Selected' && selectedInterest === 'not_select' && !isDemoMode && (
          <div className="w-full text-center py-2 px-4 mb-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
            <span className="text-orange-700 dark:text-orange-300 text-sm">
              💡 Since you haven&apos;t selected a specific profession, please choose an interest to see relevant bookmarks and tools.
            </span>
          </div>
        )}

        {/* Right: Search and Three-dot Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 1, marginRight: 7 }}>
          {/* Search Input/Button */}
          <div style={{  position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 1, marginRight: 2 }}>
            {searchOpen ? (
              <form
                onSubmit={handleGlobalSearch}
                className={`transition-all duration-300 overflow-hidden w-[220px] opacity-100 ml-2 flex items-center`}
                style={{ maxWidth: 320 }}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  className="flex-1 h-9 px-5 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-base bg-white shadow"
                  placeholder="Search bookmarks, widgets, anything..."
                  value={globalSearch}
                  onChange={handleSearchInput}
                  style={{ minWidth: 0 }}
                />
              </form>
            ) : (
              <button
                type="button"
                className={`h-4 w-4 dark:bg-[#28283b] bg-white shadow flex items-center justify-center rounded hover:bg-gray-100 transition`}
                title="Search"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                tabIndex={0}
                style={{ minWidth: 30, minHeight: 30 }}
              >
                <svg width="16" height="16" fill="none" stroke="#6366F1" strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </button>
            )}
          </div>
          {/* Three-dot Menu */}
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="relative">
              <button
                type="button"
                className="h-9 w-9 flex items-center justify-center rounded  dark:bg-[#28283b] dark:hover:bg-gray-900 bg-white hover:bg-gray-200 transition"
                title="More options"
                aria-label="More options"
                onClick={() => setMenuOpen(o => !o)}
              >
                <svg width="20" height="20" fill="none" stroke="#6366F1" strokeWidth="2.2" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="1.5"/>
                  <circle cx="12" cy="12" r="1.5"/>
                  <circle cx="12" cy="19" r="1.5"/>
                </svg>
              </button>
              {menuOpen && (
                <div ref={menuContainerRef} className="absolute right-0 bottom-full mb-2 w-36 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-[1200]">
                  {/* ...menu content... */}
                  {!allCollapsed ? (
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      onClick={handleCollapseAll}
                    >
                      Collapse All
                    </button>
                  ) : (
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      onClick={handleExpandAll}
                    >
                      Expand All
                    </button>
                  )}
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    onClick={() => { setShowAllBookmarks(true); setMenuOpen(false); }}
                  >
                    All Bookmark
                  </button>
                  <div
                    className="relative"
                    tabIndex={0}
                  >
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center justify-between"
                      onClick={() => setViewModeSubmenuOpen(v => !v)}
                      aria-haspopup="true"
                      aria-expanded={viewModeSubmenuOpen}
                    >
                      View Mode
                      <svg width="16" height="16" fill="none" stroke="#6366F1" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
                    </button>
                    {viewModeSubmenuOpen && (
                      <div ref={submenuRef} className="absolute left-full top-0 ml-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-2xl z-[1200] flex flex-col py-2 px-1">
                        {/* ...submenu content... */}
                        {[
                          { mode: 'list', label: 'List', icon: <svg width="20" height="20" fill="none" stroke="#6366F1" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="2" rx="1"/><rect x="4" y="11" width="16" height="2" rx="1"/><rect x="4" y="16" width="16" height="2" rx="1"/></svg> },
                          { mode: 'grid', label: 'Grid', icon: <svg width="20" height="20" fill="none" stroke="#6366F1" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/></svg> },
                          { mode: 'icon', label: 'Icon', icon: <svg width="20" height="20" fill="none" stroke="#6366F1" strokeWidth="2" viewBox="0 0 24 24"><circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="3"/></svg> },
                          { mode: 'cloud', label: 'Cloud', icon: <svg width="20" height="20" fill="none" stroke="#6366F1" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.5 19a4.5 4.5 0 0 0 0-9c-.2 0-.4 0-.6.03A6 6 0 1 0 6 17.5"/></svg> },
                        ].map(({ mode, label, icon }) => (
                          <button
                            key={mode}
                            className={`w-full flex items-center gap-3 px-4 py-2 rounded text-sm font-semibold border-b last:border-b-0 border-gray-100 dark:border-gray-700 transition relative ${Object.values(subcatDisplayModes).every(v => v === mode) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'} hover:bg-blue-100`}
                            onClick={async () => {
                              const subcats = firestoreUser && firestoreSubcats.length > 0 ? firestoreSubcats : subcatOrder;
                              const updates = {};
                              subcats.forEach(subcat => {
                                const key = typeof subcat === 'object' && subcat.name ? subcat.name : subcat;
                                updates[key] = mode;
                              });
                              setSubcatDisplayModes(prev => ({ ...prev, ...updates }));
                              if (firestoreUser) {
                                // Persist for all subcats
                                const key = `subcatDisplayModes`;
                                let allModes = { ...subcatDisplayModes, ...updates };
                                localStorage.setItem(key, JSON.stringify(allModes));
                              } else {
                                localStorage.setItem('subcatDisplayModes', JSON.stringify({ ...subcatDisplayModes, ...updates }));
                              }
                              setViewModeSubmenuOpen(false);
                              setMenuOpen(false);
                            }}
                          >
                            <span>{icon}</span>
                            <span>{label}</span>
                            {Object.values(subcatDisplayModes).every(v => v === mode) && (
                              <span className="absolute right-3">
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Widget grid with drag and drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={`w-[90%] mx-auto grid grid-cols-${columns} gap-1`}>
          {loading ? (
            <div className="col-span-4">
              <SkeletonLoader />
            </div>
          ) : items.length === 0 ? (
            // Empty State with Animation
            <div className="col-span-4 flex flex-col items-center justify-center min-h-[60vh] p-8">
              <div className="text-center max-w-md mx-auto">
                {/* Animated Plus Icon */}
                <div className="relative mb-8">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <svg 
                      width="48" 
                      height="48" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      viewBox="0 0 24 24"
                      className="text-white animate-bounce"
                    >
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </div>
                  
                  {/* Floating Arrow Animation */}
                  <div className="absolute -bottom-22 -right-4 animate-bounce">
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-blue-500 transform rotate-90">
                      <path d="M7 17L17 7M17 7H7M17 7V17"/>
                    </svg>
                  </div>
                </div>

                {/* Main Message */}
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                  Welcome to Your Dashboard!
                </h2>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  This is your personal workspace. Start by adding widgets and tools to customize your experience.
                </p>

                {/* Animated Steps */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 animate-fade-in-up">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">Click the Blue Button</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Find the floating blue button in the bottom right corner</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">Choose Your Widgets</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Select from weather, clock, calculator, and more</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">Organize & Save</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Drag to arrange and click Apply to save your layout</p>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <button
                  onClick={() => setIsWidgetControllerOpen(true)}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 animate-pulse"
                >
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Start Adding Widgets
                </button>

                {/* Floating Widgets Preview */}
                {/* <div className="mt-12 grid grid-cols-3 gap-4 max-w-sm mx-auto">
                  {['weather', 'clock', 'calculator'].map((widget, index) => (
                    <div 
                      key={widget}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700 animate-float"
                      style={{animationDelay: `${index * 0.3}s`}}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-lg">
                            {widget === 'weather' ? '🌤️' : widget === 'clock' ? '🕐' : '🧮'}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{widget}</p>
                      </div>
                    </div>
                  ))}
                </div> */}
              </div>
            </div>
          ) : (
            filteredColumnItems.map((colItems, colIdx) => (
              <Droppable droppableId={colIdx.toString()} key={colIdx}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col gap-4 min-h-[100px] p-2 transition-colors duration-200 ${
                      snapshot.isDraggingOver ? 'bg-white-100/10 dark:bg-blue-900/20 rounded-lg' : ''
                    }`}
                  >
                    {colItems
                      .filter(item => {
                        // Hide Bookmarks1, Bookmarks2, etc. for all users
                        if (/^Bookmarks\d+$/.test(item.id)) return false;
                        return true;
                      })
                      .map((item, idx) => (
                      <Draggable key={item.id} draggableId={item.id} index={idx}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`transition-shadow duration-200 ${
                              snapshot.isDragging ? 'shadow-2xl' : ''
                            }`}
                          >
                            <div {...provided.dragHandleProps} className="cursor-move">
                              <WidgetCard
                                title={item.id.replace('subcat_', '')}
                                collapsible={true}
                                collapsed={!!collapsedItems[item.id]}
                                onToggleCollapse={() => {
                                  setCollapsedItems(prev => {
                                    const newState = { ...prev, [item.id]: !prev[item.id] };
                                    localStorage.setItem("collapsedItems", JSON.stringify(newState));
                                    return newState;
                                  });
                                }}
                              >
                                {/* If this is a bookmarks widget, render bookmarks in the selected mode */}
                                {(() => {
                                  // Bookmarks widgets: render with display mode and icon size
                                  if (isBookmarksWidget(item.id)) {
                                    const allBookmarks = defaultBookmarks[selectedCategory] || [];
                                    const mode = widgetDisplayModes[item.id] || 'list';
                                    const iconSize = widgetIconSizes[item.id] || 'medium';
                                    return renderBookmarksView(Object.values(allBookmarks).flat(), mode, iconSize);
                                  }
                                  return getComponentById(item.id);
                                })()}
                              </WidgetCard>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))
          )}
        </div>
      </DragDropContext>

      {/* Floating Review Button */}
      {/* <button
        onClick={() => setIsReviewModalOpen && setIsReviewModalOpen(true)}
        style={{
          position: "fixed",
          bottom: 90,
          right: 20,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "#f59e42",
          color: "#fff",
          border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          zIndex: 1100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          cursor: "pointer",
        }}
        title="Leave a Review"
      >
        <span role="img" aria-label="Review">😊</span>
      </button> */}

      {/* Floating Widget Controller Button (just below review button) */}
      <button
        style={{
          position: 'fixed',
          bottom: 24, // 24px below the bottom, so it's below the review button
          right: 20,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: '#6366F1',
          color: '#fff',
          border: 'none',
          boxShadow: items.length === 0 ? '0 4px 20px rgba(99, 102, 241, 0.4)' : '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          cursor: 'pointer',
          animation: items.length === 0 ? 'pulse 2s infinite' : 'none',
        }}
        onClick={() => setIsWidgetControllerOpen(true)}
        title="Widget Controller"
        className={items.length === 0 ? 'animate-pulse' : ''}
      >
        <PlusOutlined />
      </button>
      <WidgetController />

      {/* Sorter and Apply Sorting */}
      {isSorterOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex items-center gap-2">
            <AntButton onClick={() => setIsSorterOpen(false)}>
              <ReloadOutlined />
            </AntButton>
            <select
              value={previewColumns}
              onChange={(e) => handleColumnChange(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="1">1 Column</option>
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
              <option value="4">4 Columns</option>
            </select>
            <AntButton onClick={handleApplySorting} loading={isApplying}>
              Apply Sorting
            </AntButton>
          </div>
        </div>
      )}

      {openBookmarksModal && (
        <BookmarksModal
          subcatKey={openBookmarksModal}
          open={!!openBookmarksModal}
          onClose={handleCloseBookmarksModal}
        />
      )}
      <AddBookmarkModal
        open={addBookmarkModal.open}
        subcatKey={addBookmarkModal.subcatKey}
        onClose={() => setAddBookmarkModal({ open: false, subcatKey: null })}
      />
      {showSearchModal && (
        <div className="fixed inset-0 z-[1200] flex items-start justify-center bg-black/20" style={{ paddingTop: 90 }}>
          <div ref={searchModalRef} className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-lg mx-auto">
            <div className="font-semibold text-lg mb-3">Search Results</div>
            <div className="mb-4">
              <div className="font-semibold text-gray-500 mb-1">Bookmarks</div>
              {searchResults.bookmarks.length === 0 ? (
                <div className="text-gray-400 text-sm">No bookmarks found.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {searchResults.bookmarks.map((b, i) => (
                    <a
                      key={b.id + i}
                      href={b.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group"
                    >
                      <img
                        src={`https://www.google.com/s2/favicons?sz=64&domain=${(() => { try { return new URL(b.link).hostname; } catch { return 'google.com'; } })()}`}
                        alt=""
                        className="w-5 h-5 rounded"
                        onError={e => { e.target.onerror = null; e.target.src = 'https://www.google.com/favicon.ico'; }}
                      />
                      <span className="flex-1 text-gray-900 dark:text-gray-100 max-w-xs overflow-hidden whitespace-nowrap">
                        {b.name}
                      </span>
                      <span className="text-xs text-gray-400">[{b.category} / {b.subcat}]</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-500 mb-1">Widgets/Tools</div>
              {searchResults.widgets.length === 0 ? (
                <div className="text-gray-400 text-sm">No widgets found.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {searchResults.widgets.map(w => (
                    <div key={w.id} className="flex items-center gap-2 p-2 rounded bg-gray-100 dark:bg-gray-800">
                      <span className="flex-1 text-gray-900 dark:text-gray-100">{w.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={() => setShowSearchModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {showAllBookmarks && (
        <div className="fixed inset-0 z-[1200] flex items-start justify-center bg-black/20" style={{ paddingTop: 90 }}>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-lg mx-auto">
            <div className="font-semibold dark:text-white text-lg mb-3">All Bookmarks View</div>
            {/* Only show bookmarks list, no view mode selector */}
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
              {getAllBookmarks().map((b, i) => (
                <a
                  key={b.id + i}
                  href={b.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group"
                >
                  <img
                    src={`https://www.google.com/s2/favicons?sz=64&domain=${(() => { try { return new URL(b.link).hostname; } catch { return 'google.com'; } })()}`}
                    alt=""
                    className="w-5 h-5 rounded"
                    onError={e => { e.target.onerror = null; e.target.src = 'https://www.google.com/favicon.ico'; }}
                  />
                  <span className="flex-1 text-gray-900 dark:text-gray-100 max-w-xs overflow-hidden whitespace-nowrap">
                    {b.name}
                  </span>
                  <span className="text-xs text-gray-400">[{b.category} / {b.subcat}]</span>
                </a>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={() => setShowAllBookmarks(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {showViewModeModal && (
        <div className="fixed inset-0 z-[1200] flex items-start justify-center bg-black/40" style={{ paddingTop: 90 }}>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-lg mx-auto">
            <div className="font-semibold text-lg mb-3">Set All Subcategories View Mode</div>
            <div className="flex items-center gap-3 mb-4">
              {['list','grid','icon','cloud'].map(mode => (
                <button
                  key={mode}
                  className={`px-3 py-1 rounded text-sm font-semibold border ${Object.values(subcatDisplayModes).every(v => v === mode) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 border-gray-300 text-gray-700'} hover:bg-blue-100 transition`}
                  onClick={async () => {
                    // Update all subcat display modes in state
                    const subcats = firestoreUser && firestoreSubcats.length > 0 ? firestoreSubcats : subcatOrder;
                    const updates = {};
                    subcats.forEach(subcat => {
                      const key = typeof subcat === 'object' && subcat.name ? subcat.name : subcat;
                      updates[key] = mode;
                    });
                    setSubcatDisplayModes(prev => ({ ...prev, ...updates }));
                    // Persist for all subcats
                    if (firestoreUser) {
                      const key = `subcatDisplayModes`;
                      let allModes = { ...subcatDisplayModes, ...updates };
                      localStorage.setItem(key, JSON.stringify(allModes));
                    } else {
                      localStorage.setItem('subcatDisplayModes', JSON.stringify({ ...subcatDisplayModes, ...updates }));
                    }
                    setShowViewModeModal(false);
                  }}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={() => setShowViewModeModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      <Modal
        open={showFirstTimeModal}
        footer={null}
        closable={false}
        centered
        
      >
        {!firstTimeStep && (
          <div className="flex flex-col items-center gap-6 p-8 bg-white">
            <h2 className="text-2xl font-bold mb-2 text-blue-700">Welcome!</h2>
            <p className="mb-4 text-gray-600 text-center">How would you like to personalize your experience?</p>
            <div className="flex gap-4 w-full justify-center">
              <AntButton type="primary" className="!bg-white hover:!text-white !text-black !border-gray-300 !rounded-full !px-8 !py-2 !text-lg hover:!bg-blue-700 transition" onClick={() => handleFirstTimeChoice('category')}>Professionals</AntButton>
              <AntButton type="default" className="!rounded-full !px-8 !py-2 !text-lg hover:!text-white !text-black !border-gray-300 hover:!bg-blue-700 transition" onClick={() => handleFirstTimeChoice('interest')}>Interests</AntButton>
            </div>
          </div>
        )}
        {firstTimeStep === 'category' && (
          <div className="flex flex-col items-center gap-6 p-0 bg-transparent">
            <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 flex flex-col items-center relative">
              {/* Back Button */}
              <button
                className="absolute left-4 top-4 flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-base focus:outline-none"
                onClick={() => setFirstTimeStep(null)}
                style={{ zIndex: 10 }}
                aria-label="Back"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
                Back
              </button>
              <h2 className="text-2xl font-bold mb-1 text-blue-700 mt-8">Select a Profession</h2>
              <p className="text-gray-500 text-center mb-4">Choose your main professional area to personalize your dashboard.</p>
              <label className="block w-full text-left text-gray-600 font-medium mb-2">Profession</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full mb-4">
              {allCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`py-4 rounded-xl border-2 font-semibold transition text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-800 bg-blue-50 hover:bg-blue-100 border-blue-200 shadow-sm flex items-center justify-center text-center whitespace-normal break-words min-h-[66px] relative ${firstTimeSelection === cat ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-400' : ''}`}
                    onClick={() => setFirstTimeSelection(cat)}
                  >
                    {cat}
                    {firstTimeSelection === cat && (
                      <span className="absolute top-2 right-2 text-white bg-blue-500 rounded-full p-1">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                      </span>
                    )}
                  </button>
              ))}
              </div>
              <button
                className={`w-full py-3 rounded-full bg-blue-600 text-white font-semibold text-lg shadow-lg hover:bg-blue-700 transition ${!firstTimeSelection ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={!firstTimeSelection}
                onClick={() => handleFirstTimeSelect(firstTimeSelection)}
              >
                Confirm
              </button>
            </div>
          </div>
        )}
        {firstTimeStep === 'interest' && (
          <div className="flex flex-col items-center gap-6 p-0 bg-transparent">
              <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 flex flex-col items-center relative">
              {/* Back Button */}
              <button
                className="absolute left-4 top-4 flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium text-base focus:outline-none"
                onClick={() => setFirstTimeStep(null)}
                style={{ zIndex: 10 }}
                aria-label="Back"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
                Back
              </button>
              <h2 className="text-2xl font-bold mb-1 text-purple-700 mt-8">Select an Interest</h2>
              <p className="text-gray-500 text-center mb-4">Pick an interest to tailor your experience.</p>
              <label className="block w-full text-left text-gray-600 font-medium mb-2">Interest</label>
            {interestsLoading ? (
                <div className="flex items-center justify-center w-full h-12">
                  <svg className="animate-spin h-6 w-6 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full mb-4">
                {interestOptions.filter(i => i.id !== 'all').map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`py-4 px-4 rounded-xl border-2 font-semibold transition text-base focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-gray-800 bg-purple-50 hover:bg-purple-100 border-purple-200 shadow-sm flex items-center justify-center text-center whitespace-normal break-words min-h-[56px] relative ${firstTimeSelection === opt.id ? 'bg-purple-600 text-white border-purple-600 ring-2 ring-purple-400' : ''}`}
                      onClick={() => setFirstTimeSelection(opt.id)}
                    >
                      {opt.name}
                      {firstTimeSelection === opt.id && (
                        <span className="absolute top-2 right-2 text-white bg-purple-500 rounded-full p-1">
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                        </span>
                      )}
                    </button>
                ))}
                </div>
              )}
              <button
                className={`w-full py-3 rounded-full bg-purple-600 text-white font-semibold text-lg shadow-lg hover:bg-purple-700 transition ${!firstTimeSelection ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={!firstTimeSelection}
                onClick={() => handleFirstTimeSelect(firstTimeSelection)}
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Login Modal for Demo Mode */}
      <Modal
        open={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
        footer={null}
        width={400}
        centered
      >
        <div className="text-center py-6">
          <div className="mb-4">
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mx-auto text-blue-500 mb-4">
              <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sign In Required</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              To change categories and interests, please sign in to your account.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowLoginModal(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowLoginModal(false);
                // You can add navigation to login page here
                window.location.href = '/signin';
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </Modal>
      </>
      )}
    </div>
  );
};

Anotherpage.propTypes = {
  pageId: PropTypes.string
};

export default Anotherpage;