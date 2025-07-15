import { useState, useEffect, useRef } from "react";
import { message, Modal } from "antd";
import { Button as AntButton } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import SkeletonLoader from "./SkeletonLoader.jsx";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import Calculator from "./Calculator.jsx";
import Clock from "./Clock.jsx";
import Calendar from "./Calendar.jsx";
import ImageUploader from "./ImageUploader.jsx";
import Weather from "./Weather.jsx";
import NotePage from "./NotePage.jsx";
import "./Anotherpage.css";
import {
  getPageLayout,
  debouncedUpdatePageLayout,
  defaultWidgets,
  defaultBookmarks,
} from "../firebase/widgetLayouts";
import TodoComponent from "./TodoComponent.jsx";
import NewsFeed from "./NewsFeed.jsx";
import { useTheme } from "../context/ThemeContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { PlusOutlined } from '@ant-design/icons';

const allCategories = [
  "Popular", "AI", "Travel", "Sports", "Shopping", "News", "Jobs", "Movie", "Finance", "Education"
];

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
  const [collapsedItems, setCollapsedItems] = useState(() => {
    const savedState = localStorage.getItem("collapsedItems");
    return savedState ? JSON.parse(savedState) : {};
  });
  // --- Persist last selected category in localStorage ---
  // On mount, read from localStorage
  const localCategoryKey = 'selectedCategory';
  const getInitialCategory = () => {
    const saved = localStorage.getItem(localCategoryKey);
    return saved ? saved : 'Popular';
  };
  const [selectedCategory, setSelectedCategory] = useState(getInitialCategory());

  // On category change, save to localStorage
  useEffect(() => {
    localStorage.setItem(localCategoryKey, selectedCategory);
  }, [selectedCategory]);
  const [collapsedSubcats, setCollapsedSubcats] = useState({});
  const [subcatBookmarks, setSubcatBookmarks] = useState({}); // { subcat: [bookmarks] }
  const [firestoreSubcats, setFirestoreSubcats] = useState([]); // For logged-in users
  const [firestoreUser, setFirestoreUser] = useState(null);

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

  // Handle drag end for subcategory cards
  // Remove unused onSubcatDragEnd function

  // Track auth state for Firestore
  useEffect(() => {
    const unsubscribe = auth ? auth.onAuthStateChanged((user) => {
      setFirestoreUser(user);
    }) : () => {};
    return () => unsubscribe();
  }, []);

  // Fetch subcategories from Firestore if logged in
  useEffect(() => {
    if (!firestoreUser) {
      setFirestoreSubcats([]);
      return;
    }
    // Fetch subcategories for selectedCategory
    const q = query(collection(db, "category"), where("newCategory", "==", selectedCategory));
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        setFirestoreSubcats(Array.isArray(docData.subcategories) ? docData.subcategories : []);
      } else {
        setFirestoreSubcats([]);
      }
    });
    return () => unsub();
  }, [firestoreUser, selectedCategory]);

  // Fetch bookmarks for a subcategory from Firestore (only when expanded)
  const fetchSubcatBookmarks = async (subcat) => {
    if (!firestoreUser) return;

    // Fetch user bookmarks
    const userQ = query(
      collection(db, "users", firestoreUser.uid, "bookmarks"),
      where("category", "==", selectedCategory),
      where("subcategory", "==", subcat)
    );
    const userSnapshot = await getDocs(userQ);
    const userBookmarks = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), addedByAdmin: false }));

    // Fetch admin bookmarks
    // First, get the category document ID for the selectedCategory
    const catQ = query(collection(db, "category"), where("newCategory", "==", selectedCategory));
    const catSnap = await getDocs(catQ);
    let adminBookmarks = [];
    if (!catSnap.empty) {
      const catId = catSnap.docs[0].id;
      const adminQ = query(
        collection(db, "links"),
        where("category", "==", catId),
        where("subcategory", "==", subcat),
        where("addedByAdmin", "==", true)
      );
      const adminSnap = await getDocs(adminQ);
      adminBookmarks = adminSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), addedByAdmin: true }));
    }

    // Combine and set
    setSubcatBookmarks((prev) => ({
      ...prev,
      [subcat]: [...adminBookmarks, ...userBookmarks]
    }));
  };

  // Toggle collapse/expand for a subcategory card
  const toggleSubcatCollapse = (subcat) => {
    setCollapsedSubcats((prev) => {
      const newState = { ...prev, [subcat]: !prev[subcat] };
      // If expanding and user is logged in, fetch bookmarks
      if (!newState[subcat] && firestoreUser) {
        fetchSubcatBookmarks(subcat);
      }
      return newState;
    });
    // If expanding and not logged in, no need to fetch (already in defaultBookmarks)
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
  const getSubcatIcon = (subcat) =>
    subcat && typeof subcat === 'object' && subcat.iconUrl
      ? subcat.iconUrl
      : null;

  // Remove unused variable renderSubcategoryCards if present
  // No PropTypes needed for SubcategoryCard or pageId

  // Remove SubcategoryCards from componentMap
  const componentMap = {
    clock: <Clock collapsed={collapsedItems["clock"]} />,
    weather: <Weather collapsed={collapsedItems["weather"]} />,
    calculator: <Calculator collapsed={collapsedItems["calculator"]} />,
    notepad: <NotePage collapsed={collapsedItems["notepad"]} />,
    imageUploader: (
      <ImageUploader collapsed={collapsedItems["imageUploader"]} />
    ),
    calendar: <Calendar collapsed={collapsedItems["calendar"]} />,
    Todo: <TodoComponent collapsed={collapsedItems["Todo"]} />,
    NewsFeed: <NewsFeed collapsed={collapsedItems["NewsFeed"]} />,
  };

  // Modify the useEffect for loading layout
  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(
      authInstance,
      async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          const layout = await getPageLayout(currentUser.uid, pageId);
          if (layout && layout.widgets && layout.columns) {
            setItems(layout.widgets);
            setColumns(layout.columns); // <-- THIS MUST BE 4 after Default!
          } else {
            setItems(defaultWidgets[pageId] || []);
            setColumns(4);
          }
        } else {
          const localLayout = getFromLocalStorage();
          if (localLayout && localLayout.widgets && localLayout.columns) {
            setItems(localLayout.widgets);
            setColumns(localLayout.columns); // <-- THIS MUST BE 4 after Default!
          } else {
            setItems(defaultWidgets[pageId] || []);
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
    // Update available widgets whenever sortedItems changes
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
        debouncedUpdatePageLayout(user.uid, pageId, {
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

  const toggleCollapse = (itemId) => {
    setCollapsedItems((prev) => {
      const newState = {
        ...prev,
        [itemId]: !prev[itemId],
      };
      localStorage.setItem("collapsedItems", JSON.stringify(newState));
      return newState;
    });
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
      if (!collapsedSubcats[subcatKey]) {
        fetchSubcatBookmarks(subcatKey);
      }
    });
    // eslint-disable-next-line
  }, [selectedCategory, firestoreUser, firestoreSubcats, subcatOrder]);

  // Helper: SubcategoryCard component
  const SubcategoryCard = ({ subcat, collapsed, toggleCollapse, bookmarks, iconUrl }) => {
    const subcatName = subcat && typeof subcat === 'object' && subcat.name ? subcat.name : (subcat || '');
    if (!subcatName) return null;

    // Optional: Menu button (three dots)
    const menuButton = (
      <button className="ml-2 text-gray-400 hover:text-gray-600">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="4" cy="10" r="2"/>
          <circle cx="10" cy="10" r="2"/>
          <circle cx="16" cy="10" r="2"/>
        </svg>
      </button>
    );

    return (
      <WidgetCard
        title={
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center">
              {iconUrl && <img src={iconUrl} alt="icon" className="w-5 h-5 rounded object-cover mr-2" />}
            {subcatName}
            </span>
            {menuButton}
          </div>
        }
      >
        {/* Bookmarks list, only if expanded */}
        {!collapsed && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-2 flex flex-col gap-2">
            {bookmarks.map((item) => (
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
                  className="w-5 h-5 rounded"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://www.google.com/favicon.ico'; }}
                />
                <span className="flex-1 text-gray-900 dark:text-gray-100 truncate">
                  {item.name}
                </span>
              </a>
            ))}
          </div>
        )}
      </WidgetCard>
    );
  };

  // Get subcategories for the selected category
  const subcats = firestoreUser && firestoreSubcats.length > 0 ? firestoreSubcats : subcatOrder;

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
    // Subcategory cards
    ...subcats
      .filter(subcat => subcat !== null && subcat !== undefined && getSubcatName(subcat))
      .map((subcat, index) => {
        const subcatKey = getSubcatKey(subcat);
        const subcatName = getSubcatName(subcat);
        const subcatIcon = getSubcatIcon(subcat);
        const collapsed = collapsedSubcats[subcatKey];
        const bookmarks = firestoreUser
          ? (subcatBookmarks[subcatKey] || [])
          : (defaultBookmarks[selectedCategory]?.[subcatName] || []);
        return {
          id: `subcat_${subcatKey}`,
          type: 'subcat',
          component: (
            <SubcategoryCard
              key={subcatKey}
              subcat={subcat}
              collapsed={collapsed}
              toggleCollapse={() => toggleSubcatCollapse(subcatKey)}
              bookmarks={bookmarks}
              iconUrl={subcatIcon}
            />
          ),
          defaultColumn: (index % 2) + 1,
        };
      }),
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

  // Use items state to store layout (id, column, position)
  // If items is empty, initialize from allWidgetItems
  useEffect(() => {
    if (!loading && items.length === 0) {
      // Initialize layout
      const initialLayout = allWidgetItems.map((item, idx) => ({
        id: item.id,
        column: item.defaultColumn,
        position: idx,
        type: item.type,
      }));
      setItems(initialLayout);
    }
    // eslint-disable-next-line
  }, [loading, allWidgetItems.length]);

  // Ensure all subcategories are always present in items
  useEffect(() => {
    if (loading) return;
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
  }, [subcats, allWidgetItems.length, items.length, loading]);

  // Helper to get the component for a given id
  const getComponentById = (id) => {
    const found = allWidgetItems.find((item) => item.id === id);
    return found ? found.component : null;
  };

  // Group items by column
  const columnItems = Array.from({ length: columns }, (_, colIdx) =>
    items
      .filter((item) => item.column === colIdx)
      .sort((a, b) => a.position - b.position)
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
      debouncedUpdatePageLayout(user.uid, pageId, {
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

  const WidgetCard = ({ title, menu, children }) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border p-4 mb-4">
      <div className="relative flex items-center mb-2">
        <div className="w-full text-center font-semibold text-lg capitalize">{title}</div>
        {menu && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            {menu}
          </div>
        )}
      </div>
      <div>{children}</div>
    </div>
  );

  // Widget Controller state
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
      // Calculate available widgets (not in preview)
      const usedIds = new Set(items.map(item => item.id));
      const available = allWidgetItems.filter(item => !usedIds.has(item.id));
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
    // Find the widget info from allWidgetItems
    const widget = allWidgetItems.find(w => w.id === widgetId);
    if (widget) {
      setAvailableWidgetsPreview(prev => [...prev, widget]);
    }
  };

  // Add widget from available to preview
  const handleAddWidgetToPreview = (widgetId) => {
    setHasUnsavedWidgetChanges(true);
    // Remove from available
    setAvailableWidgetsPreview(prev => prev.filter(w => w.id !== widgetId));
    // Add to preview, assign to column with least widgets
    setWidgetPreview(prev => {
      const widget = allWidgetItems.find(w => w.id === widgetId);
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
    const defaultLayout = {
      widgets: defaultWidgets[pageId] || [],
      columns: 4,
    };
    setWidgetControllerColumns(4);
    setColumns(4); // update main state
    setWidgetControllerColumns(4); // update controller preview
    // Save to DB/localStorage
    if (user) {
      debouncedUpdatePageLayout(user.uid, pageId, {
        widgets: distributedWidgets,
        columns: 4,
      });
    } else {
      saveToLocalStorage({
        widgets: distributedWidgets,
        columns: 4,
      });
    }

    // Update available widgets
    const usedIds = new Set(mergedWidgets.map(item => item.id));
    const available = allWidgetItems.filter(item => !usedIds.has(item.id));
    setAvailableWidgetsPreview(available);
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

  // Widget Controller component (custom modal)
  const WidgetController = () => (
    <CustomModal open={isWidgetControllerOpen} onClose={handleWidgetControllerCancel} width={900}>
        <div>
          <div className="text-lg font-semibold flex items-center gap-2">
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
        <span className="font-medium">Columns:</span>
        {[1,2,3,4].map(num => (
          <button
            key={num}
            className={`px-4 py-2 rounded-md font-semibold border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              widgetControllerColumns === num ? "bg-blue-500 text-white shadow" : "bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600"
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
                            <div className="font-semibold">{item.id.replace('subcat_', '')}</div>
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
                <span className="font-medium">{widget.id.replace('subcat_', '')}</span>
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
                debouncedUpdatePageLayout(user.uid, pageId, {
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

  return (
    <div className={`anotherpage-container ${isDarkMode ? "dark" : ""}`}>
      {/* Category navigation outside the widget grid */}
      <div className="flex flex-wrap gap-2 mb-4">
        {allCategories.map((cat) => (
          <button
            key={cat}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100'
                            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
                    ))}
                  </div>

      {/* Widget grid with drag and drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={`grid grid-cols-${columns} gap-4`}>
          {loading ? (
            <div className="col-span-4">
              <SkeletonLoader />
            </div>
          ) : (
            columnItems.map((colItems, colIdx) => (
              <Droppable droppableId={colIdx.toString()} key={colIdx}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col gap-4 min-h-[100px] p-2 transition-colors duration-200 ${
                      snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg' : ''
                    }`}
                  >
                    {colItems.map((item, idx) => (
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
                              <WidgetCard title={item.id.replace('subcat_', '')}>
                                {getComponentById(item.id)}
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
      <button
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
      </button>

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
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          cursor: 'pointer',
        }}
        onClick={() => setIsWidgetControllerOpen(true)}
        title="Widget Controller"
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

    </div>
  );
};

export default Anotherpage;