import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import Calculator from "./Calculator";
import Notepad from "./Notepad";
import ShowLinks from "./ShowLinks";
import Clock from "./Clock";
import Calendar from "./Calendar";
import ImageUploader from "./ImageUploader";
import PopularBookmarks from "./PopularBookmarks";
import Weather from "./Weather";
import TodoList from "./todolist";
import { auth, db } from "../firebase";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { FaListAlt } from "react-icons/fa";
import { BsFillGrid1X2Fill } from "react-icons/bs";

const Anotherpage = ({ backgroundImage }) => {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [visibleItem, setVisibleItem] = useState(null);

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

  // const saveItems = async (newItems) => {
  //   setItems(newItems);
  //   if (user) {
  //     const positions = newItems.map((item, index) => ({
  //       id: item.id,
  //       position: index,
  //     }));
  //     const docRef = doc(db, "Widgets", user.uid);
  //     try {
  //       await setDoc(docRef, { items: positions }, { merge: true });
  //     } catch (error) {
  //       console.error("Error saving items:", error);
  //     }
  //   }
  // };

  // useEffect(() => {
  //   const fetchWidgets = async () => {
  //     if (user) {
  //       const docRef = doc(db, "Widgets", user.uid);
  //       try {
  //         const docSnap = await getDoc(docRef);
  //         if (docSnap.exists()) {
  //           const savedItems = docSnap.data().items || [];
  //           const sortedItems = savedItems.sort(
  //             (a, b) => a.position - b.position
  //           );
  //           setItems(sortedItems.map((item) => ({ id: item.id })));
  //         } else {
  //           console.log("No such document!");
  //         }
  //       } catch (error) {
  //         console.error("Error fetching Widgets:", error);
  //       }
  //     }
  //   };
  //   fetchWidgets();
  // }, [user]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex((item) => item.id === active.id);
        const newIndex = prevItems.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(prevItems, oldIndex, newIndex);

        return newItems;
      });
    }
  };

  const handleClose = (id) => {
    setVisibleItem(null);
  };

  const handleToggleVisibility = (itemId) => {
    setVisibleItem((prevVisibleItem) =>
      prevVisibleItem === itemId ? null : itemId
    );
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div
        className={`bg-white dark:bg-gray-900 `}
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="flex justify-center gap-1 mt-4 -mb-4">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded ${
              viewMode === "grid"
                ? "bg-gray-200 text-black"
                : "bg-transparent border text-black dark:text-white"
            }`}
          >
            <BsFillGrid1X2Fill className="text-gray-500" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded ${
              viewMode === "list"
                ? "bg-gray-200 text-black border"
                : "bg-transparent border text-black dark:text-white"
            }`}
          >
            <FaListAlt className="text-gray-500" />
          </button>
        </div>

        <div
          className={`flex ${
            viewMode === "list" ? "flex-col" : "flex-row"
          } justify-between mt-2 w-full gap-4`}
        >
          {viewMode === "grid" ? (
            <>
              <div className="w-full md:w-1/4 lg:w-1/4 p-2">
                <Clock />
                <Weather />
                <Calculator />
                <TodoList />
                <Notepad />
              </div>
              <div className="w-full md:w-1/2 lg:w-1/2 ">
                <PopularBookmarks />
              </div>
              <div className="w-full md:w-1/4 lg:w-1/4 p-2">
                <ImageUploader />

                <Calendar />
              </div>
            </>
          ) : (
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={rectSortingStrategy}
            >
              <div className="w-full flex gap-2">
                <div className="w-full md:w-1/2 lg:w-1/2 gap-1">
                  <div className="relative flex items-center justify-between p-2 mb-2 border w-full rounded ">
                    <button
                      className="w-full dark:text-white text-left"
                      onClick={() => handleToggleVisibility("Calculator")}
                    >
                      Calculator
                    </button>
                    {visibleItem === "Calculator" && (
                      <>
                        <div className="fixed inset-0 bg-transparent bg-opacity-70 backdrop-blur-sm z-40"></div>
                        <div className="fixed top-1/2 left-1/2 z-50 w-[30%] h-[100%] p-4 shadow-lg transform -translate-x-1/2 -translate-y-1/2 bg-[#f3e9ff] dark:bg-[#4a454e] rounded-lg">
                          <Calculator />
                          <button
                            className="absolute top-3 right-3 dark:text-white"
                            onClick={() => handleClose("Calculator")}
                          >
                            <IoIosCloseCircleOutline size={30} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="relative flex items-center justify-between p-2 mb-2 border rounded w-full">
                    <button
                      className="w-full dark:text-white text-left"
                      onClick={() => handleToggleVisibility("Notepad")}
                    >
                      Notepad
                    </button>
                    {visibleItem === "Notepad" && (
                      <>
                        <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm z-40"></div>
                        <div className="fixed top-1/2 left-1/2 z-50 w-[50%] p-6 shadow-lg transform -translate-x-1/2 -translate-y-1/2 bg-[#f3e9ff] dark:bg-[#4a454e] rounded-lg">
                          <Notepad />
                          <button
                            className="absolute  top-1 right-2 mb-5 dark:text-white"
                            onClick={() => handleClose("Notepad")}
                          >
                            <IoIosCloseCircleOutline size={30} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="md:w-1/2 justify-between ">
                  <div className="relative flex items-center justify-between p-2 mb-2 border rounded w-full">
                    <button
                      className="w-full dark:text-white text-left"
                      onClick={() => handleToggleVisibility("PopularBookmarks")}
                    >
                      Popular Bookmarks
                    </button>
                    {visibleItem === "PopularBookmarks" && (
                      <>
                        {/* Transparent backdrop */}
                        <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm z-40"></div>

                        {/* Modal box */}
                        <div className="fixed top-1/2 left-1/2 z-50 w-[90%] max-w-2xl max-h-[90vh] p-6 shadow-lg transform -translate-x-1/2 -translate-y-1/2 bg-[#f3e9ff] dark:bg-[#4a454e] rounded-lg overflow-y-auto">
                          <PopularBookmarks />

                          {/* Close button */}
                          <button
                            className="absolute top-1 right-2 mb-5 dark:text-white"
                            onClick={() => handleClose("PopularBookmarks")}
                          >
                            <IoIosCloseCircleOutline size={30} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="relative flex items-center justify-between p-2 mb-2 border rounded w-full">
                    <button
                      className="w-full dark:text-white text-left"
                      onClick={() => handleToggleVisibility("Weather")}
                    >
                      Weather
                    </button>
                    {visibleItem === "Weather" && (
                      <>
                        <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm z-40"></div>
                        <div className="fixed top-1/2 left-1/2 z-50 w-[50%] h-[]p-6 shadow-lg transform -translate-x-1/2 -translate-y-1/2 bg-[#f3e9ff] dark:bg-[#4a454e] rounded-lg">
                          <Weather />
                          <button
                            className="absolute top-1 right-2 mb-5 dark:text-white "
                            onClick={() => handleClose("Weather")}
                          >
                            <IoIosCloseCircleOutline size={30} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="w-full md:w-1/2 lg:w-1/2">
                  <div className="relative flex items-center justify-between p-2 mb-2 border rounded w-full">
                    <button
                      className="w-full dark:text-white text-left"
                      onClick={() => handleToggleVisibility("Calendar")}
                    >
                      Calendar
                    </button>
                    {visibleItem === "Calendar" && (
                      <>
                        <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm z-40"></div>
                        <div className="fixed top-1/2 left-1/2 z-50 w-[50%] p-6 shadow-lg transform -translate-x-1/2 -translate-y-1/2 bg-[#f3e9ff] dark:bg-[#4a454e] rounded-lg">
                          <Calendar />
                          <button
                            className="absolute top-1 right-2 mb-5  dark:text-white"
                            onClick={() => handleClose("Calendar")}
                          >
                            <IoIosCloseCircleOutline size={30} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Add similar logic for Weather, PopularBookmarks, and Calendar */}
              </div>
            </SortableContext>
          )}
        </div>
      </div>
    </DndContext>
  );
};

export default Anotherpage;
