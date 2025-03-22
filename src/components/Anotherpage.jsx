import React, { useState, useEffect, useContext, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { motion } from "framer-motion";
import { Modal, message } from "antd";
import { Spin, Button as AntButton } from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import SkeletonLoader from "./SkeletonLoader.jsx";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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
  getAvailableWidgets,
  resetPageLayout,
  defaultWidgets,
} from "../firebase/widgetLayouts";
import TodoComponent from "./TodoComponent.jsx";
import NewsFeed from "./NewsFeed.jsx";
import CategoryHome from "./CategoryHome.jsx";
import { useTheme } from "../context/ThemeContext";

const Anotherpage = ({ visibleHandle, pageId = "home" }) => {
  const { isDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState(4);
  const [loading, setLoading] = useState(true); // Loading indicator
  const [isSorterOpen, setIsSorterOpen] = useState(false);
  const [sortedItems, setSortedItems] = useState([]);
  const [isApplying, setIsApplying] = useState(false);
  const [previewColumns, setPreviewColumns] = useState(4);
  const [availableWidgets, setAvailableWidgets] = useState([]);
  const [collapsedItems, setCollapsedItems] = useState(() => {
    const savedState = localStorage.getItem("collapsedItems");
    return savedState ? JSON.parse(savedState) : {};
  });
  const componentMap = {
    clock: <Clock collapsed={collapsedItems["clock"]} />,
    weather: <Weather collapsed={collapsedItems["weather"]} />,
    calculator: <Calculator collapsed={collapsedItems["calculator"]} />,
    notepad: <NotePage collapsed={collapsedItems["notepad"]} />,
    imageUploader: (
      <ImageUploader collapsed={collapsedItems["imageUploader"]} />
    ),
    calendar: <Calendar collapsed={collapsedItems["calendar"]} />,
    Bookmarks: (
      <CategoryHome
        categoryType="Popular"
        itemName="Popular"
        collapsed={collapsedItems["Bookmarks"]}
      />
    ),
    Bookmarks1: (
      <CategoryHome
        categoryType="AI"
        itemName="AI"
        collapsed={collapsedItems["Bookmarks1"]}
      />
    ),
    Bookmarks2: (
      <CategoryHome
        categoryType="Travel"
        itemName="Travel"
        collapsed={collapsedItems["Bookmarks2"]}
      />
    ),
    Bookmarks3: (
      <CategoryHome
        categoryType="Sports"
        itemName="Sports"
        collapsed={collapsedItems["Bookmarks3"]}
      />
    ),
    Bookmarks4: (
      <CategoryHome
        categoryType="Shopping"
        itemName="Shopping"
        collapsed={collapsedItems["Bookmarks4"]}
      />
    ),
    Bookmarks5: (
      <CategoryHome
        categoryType="News"
        itemName="News"
        collapsed={collapsedItems["Bookmarks5"]}
      />
    ),
    Todo: <TodoComponent collapsed={collapsedItems["Todo"]} />,
    NewsFeed: <NewsFeed collapsed={collapsedItems["NewsFeed"]} />,
  };
  const [isResetting, setIsResetting] = useState(false);

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

  // Modify the useEffect for loading layout
  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(
      authInstance,
      async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          // If user is logged in, get layout from Firebase
          const layout = await getPageLayout(currentUser.uid, pageId);
          setItems(layout.widgets);
          setColumns(layout.columns);
        } else {
          // If user is not logged in, get layout from localStorage or use default
          const localLayout = getFromLocalStorage();
          if (localLayout) {
            setItems(localLayout.widgets);
            setColumns(localLayout.columns);
          } else {
            // Use default layout from widgetLayouts.js
            const defaultLayout = {
              widgets: defaultWidgets[pageId] || [],
              columns: 4,
            };
            setItems(defaultLayout.widgets);
            setColumns(defaultLayout.columns);
            saveToLocalStorage(defaultLayout);
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
    setAvailableWidgets(getAvailableWidgets(sortedItems));
  }, [sortedItems]);

  // Modify onDragEnd to use debounced update
  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    // If dropped in the same position, don't do anything
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    try {
      const columnsArray = distributeItems();
      const sourceColumnIndex = parseInt(source.droppableId);
      const destColumnIndex = parseInt(destination.droppableId);

      // Get source and destination items
      const sourceItems = [...columnsArray[sourceColumnIndex]];
      const destItems =
        sourceColumnIndex === destColumnIndex
          ? sourceItems
          : [...columnsArray[destColumnIndex]];

      // Remove the dragged item from source
      const [draggedItem] = sourceItems.splice(source.index, 1);

      // Update positions for source items
      sourceItems.forEach((item, idx) => {
        item.position = idx;
      });

      // Insert the dragged item at destination
      draggedItem.column = destColumnIndex;
      draggedItem.position = destination.index;
      destItems.splice(destination.index, 0, draggedItem);

      // Update positions for destination items
      destItems.forEach((item, idx) => {
        item.position = idx;
      });

      // Update the columns array
      columnsArray[sourceColumnIndex] = sourceItems;
      if (sourceColumnIndex !== destColumnIndex) {
        columnsArray[destColumnIndex] = destItems;
      }

      // Flatten and update all positions
      const updatedItems = columnsArray.flat().map((item, idx) => ({
        ...item,
        globalPosition: idx,
      }));

      // Update local state immediately
      setItems(updatedItems);

      if (user) {
        // Use debounced update for Firebase
        debouncedUpdatePageLayout(user.uid, pageId, {
          widgets: updatedItems,
          columns: columns,
        });
      } else {
        // Update localStorage immediately since it's not expensive
        saveToLocalStorage({
          widgets: updatedItems,
          columns: columns,
        });
      }
    } catch (error) {
      console.error("Error updating layout:", error);
      message.error("Failed to update layout");
      // Revert to previous state on error
      const columnsArray = distributeItems();
      setItems(columnsArray.flat());
    }
  };

  const handleSortEnd = (result) => {
    const { source, destination } = result;

    // Drop outside the list
    if (!destination) {
      return;
    }

    // Drop in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Create a new copy of items
    const newItems = Array.from(sortedItems);

    // Get all items in the source column
    const sourceItems = newItems.filter(
      (item) => item.column === parseInt(source.droppableId)
    );

    // Get the item being dragged
    const [draggedItem] = sourceItems.splice(source.index, 1);
    const draggedItemIndex = newItems.findIndex(
      (item) => item.id === draggedItem.id
    );

    // Remove the dragged item from its original position
    newItems.splice(draggedItemIndex, 1);

    // Get all items in the destination column
    const destinationItems = newItems.filter(
      (item) => item.column === parseInt(destination.droppableId)
    );

    // Find where to insert in the destination column
    let insertIndex;
    if (destinationItems.length === 0) {
      // If destination column is empty, find the last item of the previous column
      insertIndex = newItems.findIndex(
        (item) => item.column > parseInt(destination.droppableId)
      );
      if (insertIndex === -1) insertIndex = newItems.length;
    } else {
      if (destination.index >= destinationItems.length) {
        // If dropping at the end of the column
        const lastItemInColumn = destinationItems[destinationItems.length - 1];
        insertIndex = newItems.indexOf(lastItemInColumn) + 1;
      } else {
        // If dropping in the middle of the column
        const itemAtDestination = destinationItems[destination.index];
        insertIndex = newItems.indexOf(itemAtDestination);
      }
    }

    // Update the dragged item's column
    draggedItem.column = parseInt(destination.droppableId);

    // Insert the dragged item at the new position
    newItems.splice(insertIndex, 0, draggedItem);

    // Update the state immediately
    setSortedItems(newItems);
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

  const handleRemoveWidget = (widgetId) => {
    const updatedItems = sortedItems.filter((item) => item.id !== widgetId);
    setSortedItems(updatedItems);
    setAvailableWidgets(getAvailableWidgets(updatedItems));
  };

  const handleAddWidget = (widget) => {
    const newWidget = {
      ...widget,
      column: 0, // Default to first column, will be redistributed
      isOpen: false,
      position: sortedItems.length,
    };
    setSortedItems([...sortedItems, newWidget]);
  };

  const distributeItems = () => {
    const columnsArray = Array.from({ length: columns }, () => []);

    // Create a copy and sort by column and position
    const itemsToDistribute = [...items].sort((a, b) => {
      if (a.column === b.column) {
        return (a.position || 0) - (b.position || 0);
      }
      return (a.column || 0) - (b.column || 0);
    });

    // Distribute items to columns
    itemsToDistribute.forEach((item) => {
      // Ensure column is valid
      const targetColumn = Math.min(Math.max(0, item.column || 0), columns - 1);
      columnsArray[targetColumn].push({
        ...item,
        column: targetColumn,
        position: columnsArray[targetColumn].length,
      });
    });

    return columnsArray;
  };

  // Modify handleResetLayout to handle both Firebase and localStorage
  const handleResetLayout = async () => {
    try {
      setIsResetting(true);
      let defaultLayout;

      if (user) {
        defaultLayout = await resetPageLayout(user.uid, pageId);
      } else {
        defaultLayout = {
          widgets: defaultWidgets[pageId] || [],
          columns: 4,
        };
        saveToLocalStorage(defaultLayout);
      }

      // Sort widgets by column and position
      const sortedWidgets = defaultLayout.widgets.sort((a, b) => {
        if (a.column === b.column) {
          return a.position - b.position;
        }
        return a.column - b.column;
      });

      // Update local state
      setItems(sortedWidgets);
      setColumns(defaultLayout.columns);
      setSortedItems(sortedWidgets);
      setPreviewColumns(defaultLayout.columns);

      // message.success("Layout has been reset to default");
      setIsSorterOpen(false);
    } catch (error) {
      console.error("Error resetting layout:", error);
      message.error("Failed to reset layout");
    } finally {
      setIsResetting(false);
    }
  };

  const renderWidgets = useMemo(() => {
    return items.map((item) => {
      // Widget rendering logic
      // ...
    });
  }, [items, isDarkMode, collapsedItems]);

  return (
    <div className={`anotherpage-container ${isDarkMode ? "dark" : ""}`}>
      <div style={{ position: "relative" }}>
        <div className="flex justify-center">
          <div className={`flex flex-col items-center w-full rounded-xl`}>
            <div className="p-4">
              {loading ? (
                <div className="w-[80vw] mx-auto" style={{ padding: "24px" }}>
                  <SkeletonLoader count={4} />
                </div>
              ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                  <div
                    style={{
                      display: "grid",
                      maxWidth: "85vw",
                      gridTemplateColumns: `repeat(${columns}, 1fr)`,
                      justifyContent: "center",
                    }}
                  >
                    {distributeItems().map((columnItems, columnIndex) => (
                      <Droppable
                        key={columnIndex}
                        droppableId={String(columnIndex)}
                        direction="vertical"
                      >
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`px-1 rounded-lg min-h-[200px] transition-all duration-300 ${
                              snapshot.isDraggingOver
                                ? "bg-blue-50/50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600"
                                : "bg-transparent border-2 border-dashed border-transparent"
                            }`}
                          >
                            {columnItems.map((item, index) => (
                              <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`bg-white/[var(--widget-opacity)] dark:bg-[#28283a]/[var(--widget-opacity)] mb-4  ${
                                      localStorage.getItem("backgroundImage")
                                        ? "shadow-sm "
                                        : ""
                                    }  rounded-sm transition-transform duration-200 ${
                                      snapshot.isDragging
                                        ? "shadow-lg scale-[1.02] rotate-1"
                                        : ""
                                    } ${
                                      snapshot.isDropAnimating
                                        ? "transition-all duration-300"
                                        : ""
                                    }`}
                                    style={{
                                      ...provided.draggableProps.style,
                                      transformOrigin: snapshot.isDragging
                                        ? "center"
                                        : "0 0",
                                    }}
                                  >
                                    <div>
                                      {visibleHandle && (
                                        <motion.div
                                          className={`w-full max-w-xl min-w-[21vw] text-left py-4 px-4 rounded-t-sm bg-gray-100/[var(--widget-opacity)] dark:bg-[#28283a]/[var(--widget-opacity)] dark:text-white font-semibold flex justify-between items-center cursor-pointer select-none ${
                                            snapshot.isDragging
                                              ? "cursor-grabbing"
                                              : ""
                                          }`}
                                          onClick={() =>
                                            toggleCollapse(item.id)
                                          }
                                        >
                                          <div
                                            {...provided.dragHandleProps}
                                            className={`cursor-grab mr-3 text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 w-5 ${
                                              snapshot.isDragging
                                                ? "cursor-grabbing"
                                                : ""
                                            }`}
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            ⋮⋮
                                          </div>
                                          <div>{item.name}</div>
                                          <div className="w-5">
                                            {collapsedItems[item.id] ? "" : ""}
                                          </div>
                                        </motion.div>
                                      )}
                                      <motion.div
                                        className={`w-full max-w-xl min-w-[21vw] dark:text-white bg-white/[var(--widget-opacity)] dark:bg-[#28283A]/[var(--widget-opacity)] ${
                                          visibleHandle
                                            ? "rounded-b-sm"
                                            : "rounded-sm"
                                        }`}
                                        initial={false}
                                        animate={{
                                          height: collapsedItems[item.id]
                                            ? 0
                                            : "auto",
                                          opacity: collapsedItems[item.id]
                                            ? 0
                                            : 1,
                                        }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                          overflow: "hidden",
                                          pointerEvents: collapsedItems[item.id]
                                            ? "none"
                                            : "auto",
                                        }}
                                      >
                                        <div
                                          className={`${
                                            visibleHandle
                                              ? "rounded-b-sm"
                                              : "rounded-sm"
                                          }`}
                                        >
                                          {componentMap[item.id]}
                                        </div>
                                      </motion.div>
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
              )}
            </div>
          </div>
        </div>

        {/* Floating Sort Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: isDarkMode ? "#28283a" : "#6366F1",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            zIndex: 997,
          }}
          onClick={() => setIsSorterOpen(true)}
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          >
            <path d="M3 4h18M3 12h18M3 20h18" />
          </svg>
        </motion.button>

        {/* Widget Controller Modal */}
        <Modal
          className="min-w-[50vw]"
          title="Widget Controller"
          open={isSorterOpen}
          onCancel={() => setIsSorterOpen(false)}
          footer={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div>
                <AntButton
                  className="dark:bg-gray-700/50 dark:hover:bg-gray-700 dark:text-white"
                  key="cancel"
                  type="dark:hover:text-white"
                  onClick={() => setIsSorterOpen(false)}
                >
                  <span className="justify-start">Cancel</span>
                </AntButton>
              </div>
              <div>
                <AntButton
                  key="reset"
                  type="dark:hover:text-white"
                  icon={<ReloadOutlined />}
                  onClick={handleResetLayout}
                  loading={isResetting}
                  className="dark:bg-gray-700/50 dark:hover:bg-gray-700 dark:text-white  mr-2"
                >
                  Default Layout
                </AntButton>
                <AntButton
                  key="apply"
                  type="primary"
                  onClick={handleApplySorting}
                  loading={isApplying}
                >
                  Apply Changes
                </AntButton>
              </div>
            </div>
          }
        >
          {isApplying ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "40px",
              }}
            >
              <Spin size="large" />
            </div>
          ) : (
            <>
              <div className="mb-6  flex items-center dark:bg-[#28283A] justify-between">
                <div className="text-sm text-gray-600  dark:text-gray-400">
                  Select number of columns:
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <AntButton
                      key={num}
                      type={
                        previewColumns === num
                          ? "primary"
                          : "dark:hover:text-white"
                      }
                      onClick={() => handleColumnChange(num)}
                      className={
                        previewColumns === num
                          ? ""
                          : "dark:hover:text-white dark:text-white dark:bg-gray-700/50 dark:hover:bg-gray-700"
                      }
                      size="small"
                    >
                      {num}
                    </AntButton>
                  ))}
                </div>
              </div>

              <DragDropContext className="w-full" onDragEnd={handleSortEnd}>
                <div
                  className="grid gap-4 mx-auto px-4"
                  style={{
                    width: "100%",
                    maxWidth: "1280px", // max-w-7xl equivalent
                    display: "grid",
                    gridTemplateColumns: `repeat(${previewColumns}, minmax(0, 1fr))`,
                    justifyContent: "center",
                    margin: "0 auto",
                  }}
                >
                  {Array.from({ length: previewColumns }, (_, i) => i).map(
                    (columnIndex) => (
                      <Droppable
                        key={columnIndex}
                        droppableId={columnIndex.toString()}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`p-4 rounded-lg align-center justify-center ${
                              snapshot.isDraggingOver
                                ? "bg-blue-50 dark:bg-blue-900/20"
                                : "bg-gray-50 dark:bg-gray-700/50"
                            }`}
                          >
                            <div
                              className="column-header justify-center"
                              style={{
                                marginBottom: "12px",
                                fontWeight: "bold",
                                textAlign: "center",
                                color: isDarkMode ? "#afafaf" : "#1890ff",
                              }}
                            >
                              Column {columnIndex + 1}
                            </div>
                            <div className="items-container  space-y-2">
                              {sortedItems
                                .filter((item) => item.column === columnIndex)
                                .map((item, index) => (
                                  <Draggable
                                    key={item.id}
                                    draggableId={item.id}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="bg-white dark:text-white dark:bg-[#462b75] p-2 rounded-sm shadow-sm border dark:border-[#462b75] border-gray-100 flex justify-between items-center"
                                        style={{
                                          ...provided.draggableProps.style,
                                          opacity: snapshot.isDragging
                                            ? 0.9
                                            : 1,
                                        }}
                                      >
                                        <div className="flex gap-2">
                                          <div
                                            className={`
                                      text-base transition-colors duration-200
                                      ${
                                        snapshot.isDragging
                                          ? "text-indigo-500"
                                          : "text-gray-400"
                                      }
                                    `}
                                          >
                                            ⋮⋮
                                          </div>
                                          <span>{item.name}</span>
                                        </div>
                                        <DeleteOutlined
                                          onClick={() =>
                                            handleRemoveWidget(item.id)
                                          }
                                          className="text-gray-400 hover:text-red-500 cursor-pointer"
                                        />
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                              {provided.placeholder}
                            </div>
                          </div>
                        )}
                      </Droppable>
                    )
                  )}
                </div>
              </DragDropContext>
              <div className="mt-6 dark:bg-[#28283A]">
                <div className="text-sm font-medium dark:bg-[#28283A] text-gray-700 mb-2">
                  Available Widgets
                </div>
                <div className="p-4 border-2 border-dashed dark:bg-[#28283A] border-gray-300 rounded-lg bg-gray-50">
                  <div className="flex flex-wrap gap-2">
                    {availableWidgets.length > 0 &&
                      availableWidgets.map((widget) => (
                        <AntButton
                          key={widget.id}
                          size="middle"
                          icon={<PlusOutlined />}
                          onClick={() => handleAddWidget(widget)}
                          className="flex items-center hover:scale-105 transition-transform dark:text-white dark:bg-[#462b75] bg-white"
                        >
                          {widget.name}
                        </AntButton>
                      ))}
                    {availableWidgets.length === 0 && (
                      <div className="w-full text-center py-4 dark:bg-[#28283A] text-gray-500">
                        No available widgets
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Anotherpage;
