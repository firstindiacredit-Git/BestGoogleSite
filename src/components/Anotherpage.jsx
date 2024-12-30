import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { motion } from "framer-motion";
import { Modal } from "antd";
import { Spin, Button as AntButton } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Calculator from "./Calculator.jsx";
import Clock from "./Clock.jsx";
import Calendar from "./Calendar.jsx";
import Category from "./Category.jsx";
import ImageUploader from "./ImageUploader.jsx";
import Weather from "./Weather.jsx";
import NotePage from "./NotePage.jsx";
import {
  getPageLayout,
  updatePageLayout,
  getAvailableWidgets,
  getAdminData,
  getUserData
} from "../firebase/widgetLayouts";
import TodoComponent from "./TodoComponent.jsx";

const Anotherpage = ({ backgroundImage }) => {
  const [grid, isGrid] = useState(true);
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState(3);
  const [loading, setLoading] = useState(true); // Loading indicator
  const [isSorterOpen, setIsSorterOpen] = useState(false);
  const [sortedItems, setSortedItems] = useState([]);
  const [isApplying, setIsApplying] = useState(false);
  const [previewColumns, setPreviewColumns] = useState(3);
  const [availableWidgets, setAvailableWidgets] = useState([]);
  const [widgetData, setWidgetData] = useState({
    todos: [],
    notes: [],
    bookmarks: [],
    images: []
  });

  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
      setUser(currentUser);
      setLoading(true);

      try {
        // Try to get data from localStorage first
        const cachedData = localStorage.getItem('widgetData');
        if (cachedData) {
          setWidgetData(JSON.parse(cachedData));
        }

        let data;
        if (currentUser) {
          // If user is logged in, get their data
          data = await getUserData(currentUser.uid);
          if (!data) {
            // If no user data, fall back to admin data
            data = await getAdminData();
          }
        } else {
          // If no user, get admin data
          data = await getAdminData();
        }

        if (data) {
          setWidgetData(data);
          localStorage.setItem('widgetData', JSON.stringify(data));
        }

        // Load layout
        const layout = currentUser
          ? await getPageLayout(currentUser.uid, "home")
          : defaultWidgets.home;

        setItems(layout || defaultWidgets.home);
        
        if (currentUser) {
          const available = getAvailableWidgets(layout || []);
          setAvailableWidgets(available);
        } else {
          setAvailableWidgets(Object.values(allWidgets));
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const componentMap = {
    clock: <Clock />,
    weather: <Weather />,
    calculator: <Calculator />,
    notepad: <NotePage data={widgetData.notes} />,
    imageUploader: <ImageUploader data={widgetData.images} />,
    calendar: <Calendar />,
    Bookmarks: <Category data={widgetData.bookmarks} />,
    Todo: <TodoComponent data={widgetData.todos} />,
  };

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

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    const columnsArray = distributeItems();
    const sourceColumnIndex = parseInt(source.droppableId);
    const destColumnIndex = parseInt(destination.droppableId);
    const sourceItems = columnsArray[sourceColumnIndex];
    const destItems = columnsArray[destColumnIndex];
    const [draggedItem] = sourceItems.splice(source.index, 1);
    draggedItem.column = destColumnIndex;
    destItems.splice(destination.index, 0, draggedItem);
    const updatedItems = columnsArray.flat();
    setItems(updatedItems);
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

    await updatePageLayout(user.uid, "home", {
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

  const handleAddWidget = (columnIndex, widget) => {
    const newWidget = {
      ...widget,
      column: columnIndex,
      isOpen: false,
      position: sortedItems.filter((item) => item.column === columnIndex)
        .length,
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

  return (
    <div style={{ position: "relative" }}>
      <div className="flex items-center gap-2 w-fit mx-auto my-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => {isGrid(true); console.log("workingGrid")}}
          className={`p-2 rounded ${
            grid
              ? "bg-white dark:bg-gray-700 shadow-sm"
              : "hover:bg-white/50 dark:hover:bg-gray-700/50"
          }`}
        >
          <svg
            className="w-5 h-5 dark:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </button>
        <button
          onClick={() => {isGrid(false); console.log("workingList")}}
          className={`p-2 rounded ${
            !grid
              ? "bg-white dark:bg-gray-700 shadow-sm"
              : "hover:bg-white/50 dark:hover:bg-gray-700/50"
          }`}
        >
          <svg
            className="w-5 h-5 dark:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
      <div
        className={`bg-white dark:bg-gray-800 flex justify-center rounded-xl`}
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="p-4 w-fit">
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
                  gap: "16px",
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
                                className=" bg-white dark:bg-gray-700 mb-4 border-collapse dark:border-gray-700 dark:drop-shadow-md border-1 border rounded-lg"
                              >
                                {grid ? (
                                  <></>
                                ) : (
                                  <></>
                                )}
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
          backgroundColor: "#1890ff",
          color: "white",
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

      {/* Widget Sorter Modal */}
      <Modal
        title="Sort Widgets"
        open={isSorterOpen}
        onCancel={() => {
          if (!isApplying) {
            setIsSorterOpen(false);
            // Reset preview state when closing
            setSortedItems([...items]);
            setPreviewColumns(columns);
          }
        }}
        footer={[
          <AntButton
            key="cancel"
            onClick={() => {
              setIsSorterOpen(false);
              // Reset preview state when canceling
              setSortedItems([...items]);
              setPreviewColumns(columns);
            }}
            disabled={isApplying}
          >
            Cancel
          </AntButton>,
          <AntButton
            key="apply"
            type="primary"
            onClick={handleApplySorting}
            disabled={isApplying}
            loading={isApplying}
          >
            Apply Changes
          </AntButton>,
        ]}
        width={800}
        centered
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
          <></>
        )}
      </Modal>
    </div>
  );
};

export default Anotherpage;