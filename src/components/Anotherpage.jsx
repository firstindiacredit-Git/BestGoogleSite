import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { motion } from "framer-motion"; // Add Framer Motion for animations
import Calculator from "./Calculator.jsx";
import Notepad from "./Notepad.jsx";
import ShowLinks from "./ShowLinks.jsx";
import Clock from "./Clock.jsx";
import Calendar from "./Calendar.jsx";
import ImageUploader from "./ImageUploader.jsx";
import PopularBookmarks from "./PopularBookmarks.jsx";
import Weather from "./Weather.jsx";
// import Todolist from "./Todolist.jsx";


const Anotherpage = ({ backgroundImage }) => {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([
    { id: "clock", name: "Clock", component: <Clock />, isOpen: false },
    { id: "weather", name: "Weather", component: <Weather />, isOpen: false },
    {
      id: "calculator",
      name: "Calculator",
      component: <Calculator />,
      isOpen: false,
    },
    // {
    //   id: "todolist",
    //   name: "Todo List",
    //   component: <Todolist />,
    //   isOpen: false,
    // },
    { id: "notepad", name: "Notepad", component: <Notepad />, isOpen: false },
    {
      id: "popularBookmarks",
      name: "Popular Bookmarks",
      component: <PopularBookmarks />,
      isOpen: false,
    },
    {
      id: "imageUploader",
      name: "Image Uploader",
      component: <ImageUploader />,
      isOpen: false,
    },
    {
      id: "calendar",
      name: "Calendar",
      component: <Calendar />,
      isOpen: false,
    },
  ]);

  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem("draggedItems"));
    if (savedItems) {
      const updatedItems = savedItems.map((item) => {
        const { id, name, isOpen } = item;
        let component;

        switch (id) {
          case "clock":
            component = <Clock />;
            break;
          case "weather":
            component = <Weather />;
            break;
          case "calculator":
            component = <Calculator />;
            break;
          // case "todolist":
          //   component = <Todolist />;
          //   break;
          case "notepad":
            component = <Notepad />;
            break;
          case "popularBookmarks":
            component = <PopularBookmarks />;
            break;
          case "imageUploader":
            component = <ImageUploader />;
            break;
          case "calendar":
            component = <Calendar />;
            break;
          default:
            break;
        }

        return { id, name, component, isOpen };
      });
      setItems(updatedItems);
    }
  }, []);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const updatedItems = Array.from(items);
    const [removed] = updatedItems.splice(source.index, 1);
    updatedItems.splice(destination.index, 0, removed);

    // Store only the necessary data (excluding React components)
    const itemsToSave = updatedItems.map(({ component, ...rest }) => rest);
    setItems(updatedItems);
    localStorage.setItem("draggedItems", JSON.stringify(itemsToSave));
  };

  const toggleDropdown = (id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, isOpen: !item.isOpen }
          : { ...item, isOpen: false }
      )
    );
  };

  const renderDroppable = (sectionItems, sectionId) => (
    <Droppable droppableId={sectionId} direction="vertical">
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-4"
        >
          <h2 className="text-lg font-semibold mb-2">
            {sectionId === "droppable1"
              ? "Widgets"
              : sectionId === "droppable2"
              ? "Tools"
              : "Media"}
          </h2>
          {sectionItems.length > 0 ? (
            sectionItems.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
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
                        {item.component}
                      </motion.div>
                    )}
                  </div>
                )}
              </Draggable>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              Drag an item here
            </p>
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

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
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4">
            {["droppable1", "droppable2", "droppable3"].map((sectionId) => {
              const sectionItems =
                sectionId === "droppable1"
                  ? items.filter((item) =>
                      ["clock", "weather", "calculator"].includes(item.id)
                    )
                  : sectionId === "droppable2"
                  ? items.filter((item) =>
                      [ "notepad", "popularBookmarks"].includes(
                        item.id
                      )
                    )
                  : items.filter((item) =>
                      ["imageUploader", "calendar"].includes(item.id)
                    );

              return renderDroppable(sectionItems, sectionId);
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Anotherpage;
