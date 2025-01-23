import React, { useState, useEffect, useContext, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { WidgetTransparencyContext } from "../App";
import { motion } from "framer-motion";
import { Modal, message } from "antd";
import { Spin, Button as AntButton } from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
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
  updatePageLayout,
  getAvailableWidgets,
  resetPageLayout,
} from "../firebase/widgetLayouts";
import TodoComponent from "./TodoComponent.jsx";
import NewsFeed from "./NewsFeed.jsx";
import CategoryHome from "./CategoryHome.jsx";

const Anotherpage = ({ visibleHandle, pageId = "home" }) => {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState(4);
  const [loading, setLoading] = useState(true); // Loading indicator
  const [isSorterOpen, setIsSorterOpen] = useState(false);
  const [sortedItems, setSortedItems] = useState([]);
  const [isApplying, setIsApplying] = useState(false);
  const [previewColumns, setPreviewColumns] = useState(4);
  const [availableWidgets, setAvailableWidgets] = useState([]);
  const isDarkMode = localStorage.getItem("themeMode") === "dark";
  const componentMap = {
    clock: <Clock />,
    weather: <Weather />,
    calculator: <Calculator />,
    notepad: <NotePage />,
    imageUploader: <ImageUploader />,
    calendar: <Calendar />,
    Bookmarks: <CategoryHome categoryType="Popular" itemName="Popular " />,
    Bookmarks1: <CategoryHome categoryType="Travel" itemName="Travel" />,
    Bookmarks2: <CategoryHome categoryType="AI" itemName="AI" />,
    Bookmarks3: <CategoryHome categoryType="Sports" itemName="Sports" />,
    Bookmarks4: <CategoryHome categoryType="Shopping" itemName="Shopping" />,
    Bookmarks5: <CategoryHome categoryType="News" itemName="News" />,
    Todo: <TodoComponent />,
    NewsFeed: <NewsFeed />,
  };
  const [isCalculating, setIsCalculating] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [optimalColumns, setOptimalColumns] = useState(4);
  const [isResetting, setIsResetting] = useState(false);

  // Calculate optimal columns based on window width and widget width
  const calculateOptimalColumns = () => {
    const minWidgetWidth = 350; // Minimum width for a widget (21vw converted to approx pixels)
    const padding = 32; // Account for container padding
    const availableWidth = windowWidth - padding;
    const calculatedColumns = Math.floor(availableWidth / minWidgetWidth);
    return Math.min(Math.max(calculatedColumns, 1), 4); // Limit between 1 and 4 columns
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsCalculating(true);
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Recalculate columns when window width changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const newOptimalColumns = calculateOptimalColumns();
      setOptimalColumns(newOptimalColumns);
      setIsCalculating(false);
    }, 300); // Debounce the calculation

    return () => clearTimeout(timer);
  }, [windowWidth]);

  // Load user and layout
  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(
      authInstance,
      async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          const layout = await getPageLayout(currentUser.uid, pageId);
          setItems(layout.widgets);
          setColumns(layout.columns);
          setLoading(false);
        } else {
          setLoading(false);
        }
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

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination || !user) return;

    const columnsArray = distributeItems();
    const sourceColumnIndex = parseInt(source.droppableId);
    const destColumnIndex = parseInt(destination.droppableId);
    const sourceItems = columnsArray[sourceColumnIndex];
    const destItems = columnsArray[destColumnIndex];
    const [draggedItem] = sourceItems.splice(source.index, 1);
    draggedItem.column = destColumnIndex;
    destItems.splice(destination.index, 0, draggedItem);
    const updatedItems = columnsArray.flat();

    // Update local state
    setItems(updatedItems);

    // Update database
    try {
      await updatePageLayout(user.uid, pageId, {
        widgets: updatedItems,
        columns: columns,
      });
    } catch (error) {
      console.error("Error updating layout:", error);
      // Optionally revert the local state if the database update fails
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

  const toggleDropdown = (id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, isOpen: !item.isOpen } : item
      )
    );
  };

  const handleColumnChange = async (numColumns) => {
    setPreviewColumns(numColumns);

    const redistributedItems = sortedItems.map((item, index) => ({
      ...item,
      column: index % numColumns,
    }));

    setSortedItems(redistributedItems);
  };

  const handleApplySorting = async () => {
    if (!user) return;

    setIsApplying(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Update both local state and database
    setItems(sortedItems);
    setColumns(previewColumns);

    await updatePageLayout(user.uid, pageId, {
      widgets: sortedItems,
      columns: previewColumns,
    });

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
    items.forEach((item) => {
      if (item.column >= 0 && item.column < columns) {
        columnsArray[item.column].push(item);
      }
    });
    return columnsArray;
  };

  const handleResetLayout = async () => {
    if (!user) return;

    try {
      setIsResetting(true);
      const defaultLayout = await resetPageLayout(user.uid, pageId);

      // Update local state
      setItems(defaultLayout.widgets);
      setColumns(defaultLayout.columns);
      setSortedItems(defaultLayout.widgets);
      setPreviewColumns(defaultLayout.columns);

      message.success("Layout has been reset to default");
      setIsSorterOpen(false);
    } catch (error) {
      console.error("Error resetting layout:", error);
      message.error("Failed to reset layout");
    } finally {
      setIsResetting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-gray-500 text-5xl  my-20">
        <h1 className="text-center font-bold">LOGIN TO UNLOCK MORE FEATURES</h1>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <div className="flex justify-center">
        <div className={`flex flex-col items-center w-full    rounded-xl`}>
          <div className="p-4   ">
            {loading ? (
              <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" />
              </div>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <div
                  style={{
                    display: "grid",
                    maxWidth: "90vw",
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
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
                          style={{
                            backgroundColor: snapshot.isDraggingOver
                              ? "#f0f0f080"
                              : "transparent",
                            padding: "8px",
                            minHeight: "200px",
                            borderRadius: "0.5rem",
                          }}
                        >
                          {columnItems.map((item, index) => (
                            <Draggable
                              key={item.id}
                              draggableId={item.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)] mb-4 border-collapse ${
                                    localStorage.getItem("backgroundImage")
                                      ? " shadow-sm dark:border-gray-700/[var(--widget-opacity)] border-gray-100/[var(--widget-opacity)]"
                                      : "dark:border-gray-700 border-gray-100"
                                  } border-1 border  rounded-sm`}
                                >
                                  <div>
                                    {visibleHandle && (
                                      <motion.div
                                        className={`w-full max-w-xl min-w-[21vw] text-left py-2 px-4 rounded-t-sm bg-gray-100/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)] dark:text-white font-semibold flex justify-between items-center`}
                                      >
                                        <div
                                          {...provided.dragHandleProps}
                                          className="cursor-grab mr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 w-5"
                                        >
                                          ⋮⋮
                                        </div>
                                        <div className="w-5"></div>
                                      </motion.div>
                                    )}
                                    <motion.div
                                      className={`w-full max-w-xl min-w-[21vw] dark:text-white bg-white/[var(--widget-opacity)] dark:bg-[#28283A]/[var(--widget-opacity)] ${
                                        visibleHandle
                                          ? "rounded-b-sm"
                                          : "rounded-sm"
                                      }`}
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{
                                        height: "auto",
                                        opacity: 1,
                                      }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.1 }}
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
          backgroundColor: isDarkMode ? "#513A7A" : "#6366F1",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          zIndex: 1000,
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
        footer={[
          <AntButton
            key="reset"
            type="default"
            icon={<ReloadOutlined />}
            onClick={handleResetLayout}
            loading={isResetting}
            className="mr-auto hover:text-blue-500"
          >
            Reset Layout
          </AntButton>,
          <AntButton key="cancel" onClick={() => setIsSorterOpen(false)}>
            Cancel
          </AntButton>,
          <AntButton
            key="apply"
            type="primary"
            onClick={handleApplySorting}
            loading={isApplying}
          >
            Apply Changes
          </AntButton>,
        ]}
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
            <div className="mb-6  flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Select number of columns:
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <AntButton
                    key={num}
                    type={previewColumns === num ? "primary" : "default"}
                    onClick={() => handleColumnChange(num)}
                    className={
                      previewColumns === num ? "" : "hover:border-primary"
                    }
                    size="small"
                  >
                    {num}
                  </AntButton>
                ))}
              </div>
            </div>

            <DragDropContext onDragEnd={handleSortEnd}>
              <div className="grid grid-cols-4 gap-4">
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
                          className={`p-4 rounded-lg ${
                            snapshot.isDraggingOver
                              ? "bg-blue-50 dark:bg-blue-900/20"
                              : "bg-gray-50 dark:bg-gray-800/50"
                          }`}
                        >
                          <div
                            className="column-header"
                            style={{
                              marginBottom: "12px",
                              fontWeight: "bold",
                              color: isDarkMode ? "#afafaf" : "#1890ff",
                            }}
                          >
                            Column {columnIndex + 1}
                          </div>
                          <div className="items-container space-y-2">
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
                                      className="bg-white dark:bg-[#462b75] p-2 rounded-sm shadow-sm border dark:border-[#462b75] border-gray-100 flex justify-between items-center"
                                      style={{
                                        ...provided.draggableProps.style,
                                        opacity: snapshot.isDragging ? 0.9 : 1,
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
            <div className="mt-6">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Available Widgets
              </div>
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="flex flex-wrap gap-2">
                  {availableWidgets.length > 0 &&
                    availableWidgets.map((widget) => (
                      <AntButton
                        key={widget.id}
                        size="middle"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddWidget(widget)}
                        className="flex items-center hover:scale-105 transition-transform bg-white"
                      >
                        {widget.name}
                      </AntButton>
                    ))}
                  {availableWidgets.length === 0 && (
                    <div className="w-full text-center py-4 text-gray-500">
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
  );
};

export default Anotherpage;
