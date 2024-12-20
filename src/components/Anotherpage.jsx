import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { motion } from "framer-motion";
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

  const toggleDropdown = (id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, isOpen: !item.isOpen } : item
      )
    );
  };

  const handleColumnChange = (numColumns) => {
    setColumns(numColumns);
    localStorage.setItem("columnCount", numColumns);
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
        <div className="mb-4">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => handleColumnChange(num)}
              className="mr-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md"
            >
              {num} Column{num > 1 ? "s" : ""}
            </button>
          ))}
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <div
            style={{
              display: "grid",
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
                        ? "lightblue"
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
                            className="rounded shadow-lg bg-white dark:bg-gray-800 mb-4"
                          >
                            <motion.button
                              className="w-full text-left py-2 px-4 border-b bg-gray-200 dark:bg-gray-700 dark:text-white font-semibold"
                              onClick={() => toggleDropdown(item.id)}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              {item.name}
                            </motion.button>
                            {item.isOpen && (
                              <motion.div
                                className="mt-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
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
      </div>
    </div>
  );
};

export default Anotherpage;
