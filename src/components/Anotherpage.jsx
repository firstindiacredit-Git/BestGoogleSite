import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { motion } from "framer-motion";
import { Spin, Button, Modal } from "antd";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Calculator from "./Calculator.jsx";
import Notepad from "./Notepad.jsx";
import Clock from "./Clock.jsx";
import Calendar from "./Calendar.jsx";
import ImageUploader from "./ImageUploader.jsx";
import PopularBookmarks from "./PopularBookmarks.jsx";
import Weather from "./Weather.jsx";

const Anotherpage = ({ backgroundImage }) => {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([
    { id: "clock", name: "Clock", isOpen: false, column: 0 },
    { id: "weather", name: "Weather", isOpen: false, column: 0 },
    { id: "calculator", name: "Calculator", isOpen: false, column: 0 },
    { id: "notepad", name: "Notepad", isOpen: false, column: 1 },
    {
      id: "popularBookmarks",
      name: "Popular Bookmarks",
      isOpen: false,
      column: 1,
    },
    { id: "imageUploader", name: "Image Uploader", isOpen: false, column: 2 },
    { id: "calendar", name: "Calendar", isOpen: false, column: 2 },
  ]);

  const [columns, setColumns] = useState(
    parseInt(localStorage.getItem("columnCount")) || 3
  );
  const [loading, setLoading] = useState(false); // Loading indicator
  const [isSorterOpen, setIsSorterOpen] = useState(false);
  const [sortedItems, setSortedItems] = useState([]);
  const [isApplying, setIsApplying] = useState(false);

  const componentMap = {
    clock: <Clock />,
    weather: <Weather />,
    calculator: <Calculator />,
    notepad: <Notepad />,
    popularBookmarks: <PopularBookmarks />,
    imageUploader: <ImageUploader />,
    calendar: <Calendar />,
  };

  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      const savedItems = JSON.parse(localStorage.getItem("draggedItems"));
      if (Array.isArray(savedItems)) setItems(savedItems);
    } catch (e) {
      console.error("Failed to load items from localStorage", e);
    }
  }, []);

  useEffect(() => {
    setSortedItems([...items]);
  }, [items]);

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
    localStorage.setItem("draggedItems", JSON.stringify(updatedItems));
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

    const newItems = Array.from(sortedItems);
    
    // Find the actual items for source and destination
    const sourceItem = newItems.find(
      item => item.column === parseInt(source.droppableId) && 
      newItems.filter(i => i.column === parseInt(source.droppableId)).indexOf(item) === source.index
    );

    if (!sourceItem) return;

    // Remove item from source
    newItems.splice(newItems.indexOf(sourceItem), 1);

    // Find where to insert in destination
    const destinationItems = newItems.filter(
      item => item.column === parseInt(destination.droppableId)
    );

    // Update the column of the moved item
    sourceItem.column = parseInt(destination.droppableId);

    // Find the insertion index in the complete array
    const destinationIndex = newItems.findIndex(
      item => item.column === parseInt(destination.droppableId) && 
      destinationItems.indexOf(item) === destination.index
    );

    if (destinationIndex === -1) {
      // If no items in destination column, or inserting at the end
      newItems.push(sourceItem);
    } else {
      newItems.splice(destinationIndex, 0, sourceItem);
    }

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
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay for rendering

    const redistributedItems = items.map((item, index) => ({
      ...item,
      column: index % numColumns, // Distribute items evenly among the new columns
    }));

    setItems(redistributedItems);
    setColumns(numColumns);
    localStorage.setItem("draggedItems", JSON.stringify(redistributedItems));
    localStorage.setItem("columnCount", numColumns);
    setLoading(false);
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

  const distributeItemsForSort = (itemsToDistribute) => {
    const columnArrays = Array.from({ length: columns }, () => []);
    itemsToDistribute.forEach((item) => {
      columnArrays[item.column].push(item);
    });
    return columnArrays;
  };

  const handleApplySorting = async () => {
    setIsApplying(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setItems(sortedItems);
    localStorage.setItem("draggedItems", JSON.stringify(sortedItems));
    setIsApplying(false);
    setIsSorterOpen(false);
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div
        className={`bg-white dark:bg-gray-900`}
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="p-4">
          {/* Column number selection */}
          <div className="mb-4">
            {[1, 2, 3, 4,].map((num) => (
              <button
                key={num}
                onClick={() => handleColumnChange(num)}
                className="mr-2 text-gray-500 focus:bg-gray-200 focus:border focus:border-1 focus:border-gray-500 focus:text-gray-800 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-md"
              >
                {num} Column{num > 1 ? "s" : ""}
              </button>
            ))}
          </div>
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
                                {...provided.dragHandleProps}
                                className=" bg-white dark:bg-gray-700 mb-4 border-collapse border-1 border rounded-lg"
                              >
                                <motion.button
                                  className="w-full text-left py-2 px-4 border-b rounded-t-lg bg-gray-100 dark:bg-gray-700 dark:text-white font-semibold"
                                  onClick={() => toggleDropdown(item.id)}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {item.name}
                                </motion.button>
                                {item.isOpen && (
                                  <motion.div
                                    className=" bg-gray-50 dark:bg-gray-900 rounded-b-lg p-4"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    {componentMap[item.id]}
                                  </motion.div>
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
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: '#1890ff',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 1000
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
          <path d="M3 4h18M3 12h18M3 20h18"/>
        </svg>
      </motion.button>

      {/* Widget Sorter Modal */}
      <Modal
        title="Sort Widgets"
        open={isSorterOpen}
        onCancel={() => !isApplying && setIsSorterOpen(false)}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => setIsSorterOpen(false)}
            disabled={isApplying}
          >
            Cancel
          </Button>,
          <Button
            key="apply"
            type="primary"
            onClick={handleApplySorting}
            disabled={isApplying}
            loading={isApplying}
          >
            Apply Changes
          </Button>
        ]}
        width={800}
        centered
      >
        {isApplying ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <DragDropContext onDragEnd={handleSortEnd}>
            <div className="sort-columns-container" style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: '16px',
              marginBottom: '20px',
              maxHeight: '60vh',
              overflowY: 'auto',
              padding: '8px'
            }}>
              {Array.from({ length: columns }).map((_, columnIndex) => (
                <Droppable key={columnIndex} droppableId={String(columnIndex)}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="sort-column"
                      style={{
                        padding: '12px',
                        backgroundColor: snapshot.isDraggingOver 
                          ? 'rgba(24, 144, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.02)',
                        borderRadius: '8px',
                        minHeight: '150px',
                        transition: 'background-color 0.2s ease',
                        border: snapshot.isDraggingOver 
                          ? '2px dashed #1890ff'
                          : '2px solid transparent'
                      }}
                    >
                      <div className="column-header" style={{ 
                        marginBottom: '12px', 
                        fontWeight: 'bold',
                        color: '#1890ff'
                      }}>
                        Column {columnIndex + 1}
                      </div>
                      <div className="items-container" style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '8px' 
                      }}>
                        {sortedItems
                          .filter(item => item.column === columnIndex)
                          .map((item, index) => (
                            <Draggable
                              key={item.id}
                              draggableId={item.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <motion.div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="draggable-item"
                                  initial={false}
                                  animate={{
                                    scale: snapshot.isDragging ? 1.05 : 1,
                                    boxShadow: snapshot.isDragging 
                                      ? '0 8px 16px rgba(0,0,0,0.1)' 
                                      : '0 2px 4px rgba(0,0,0,0.05)',
                                    zIndex: snapshot.isDragging ? 999 : 1
                                  }}
                                  style={{
                                    ...provided.draggableProps.style,
                                    padding: '10px 12px',
                                    backgroundColor: snapshot.isDragging 
                                      ? '#fafafa' 
                                      : 'white',
                                    borderRadius: '6px',
                                    border: '1px solid #f0f0f0',
                                    cursor: 'grab',
                                    userSelect: 'none',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                  whileHover={{ 
                                    scale: 1.02,
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.08)'
                                  }}
                                >
                                  <div style={{ 
                                    marginRight: '8px',
                                    color: '#8c8c8c',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}>
                                    ⋮⋮
                                  </div>
                                  {item.name}
                                </motion.div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        )}
      </Modal>
    </div>
  );
};

export default Anotherpage;
