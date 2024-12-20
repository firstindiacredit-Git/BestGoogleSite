import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { MdAdd, MdDeleteForever } from "react-icons/md";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { motion } from "framer-motion";

const PopularBookmarks = () => {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [bookmarks, setBookmarks] = useState({});
  const [newBookmark, setNewBookmark] = useState({ name: "", link: "" });
  const [visibleForm, setVisibleForm] = useState(null);
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem("bookmarkSettings");
    return stored ? JSON.parse(stored) : {};
  });

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("bookmarkSettings", JSON.stringify(settings));
  }, [settings]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Listen to categories
        const categoriesRef = collection(db, "users", currentUser.uid, "categories");
        const unsubCategories = onSnapshot(categoriesRef, (snapshot) => {
          const categoriesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            isOpen: false
          }));
          setCategories(categoriesData);
        });

        // Listen to bookmarks
        const bookmarksRef = collection(db, "users", currentUser.uid, "bookmarks");
        const unsubBookmarks = onSnapshot(bookmarksRef, (snapshot) => {
          const bookmarksData = {};
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            const category = data.category || 'uncategorized';
            if (!bookmarksData[category]) {
              bookmarksData[category] = [];
            }
            bookmarksData[category].push({
              id: doc.id,
              ...data,
              position: data.position || 0
            });
          });
          
          // Sort bookmarks by position
          Object.keys(bookmarksData).forEach(category => {
            bookmarksData[category].sort((a, b) => a.position - b.position);
          });
          
          setBookmarks(bookmarksData);
        });

        return () => {
          unsubCategories();
          unsubBookmarks();
        };
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAddBookmark = async (category) => {
    if (!user || !newBookmark.name || !newBookmark.link) return;

    try {
      const bookmarksRef = collection(db, "users", user.uid, "bookmarks");
      await addDoc(bookmarksRef, {
        ...newBookmark,
        category,
        position: bookmarks[category]?.length || 0,
        createdAt: new Date()
      });
      setNewBookmark({ name: "", link: "" });
      setVisibleForm(null);
    } catch (error) {
      console.error("Error adding bookmark:", error);
    }
  };

  const handleDeleteBookmark = async (category, bookmarkId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "bookmarks", bookmarkId));
    } catch (error) {
      console.error("Error deleting bookmark:", error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination || !user) return;

    const { source, destination } = result;
    const sourceCategory = source.droppableId;
    const destCategory = destination.droppableId;

    const newBookmarks = { ...bookmarks };
    const [movedBookmark] = newBookmarks[sourceCategory].splice(source.index, 1);
    
    if (!newBookmarks[destCategory]) {
      newBookmarks[destCategory] = [];
    }
    newBookmarks[destCategory].splice(destination.index, 0, movedBookmark);

    // Update positions in Firebase
    const updates = [];
    newBookmarks[sourceCategory].forEach((bookmark, index) => {
      updates.push(updateDoc(
        doc(db, "users", user.uid, "bookmarks", bookmark.id),
        { position: index, category: sourceCategory }
      ));
    });

    if (sourceCategory !== destCategory) {
      newBookmarks[destCategory].forEach((bookmark, index) => {
        updates.push(updateDoc(
          doc(db, "users", user.uid, "bookmarks", bookmark.id),
          { position: index, category: destCategory }
        ));
      });
    }

    try {
      await Promise.all(updates);
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error("Error updating positions:", error);
    }
  };

  const toggleCategory = (categoryId) => {
    setCategories(prevCategories =>
      prevCategories.map(cat =>
        cat.id === categoryId
          ? { ...cat, isOpen: !cat.isOpen }
          : { ...cat, isOpen: false }
      )
    );
  };

  const fetchFavicon = (url) => {
    return `https://www.google.com/s2/favicons?sz=64&domain=${url}`;
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-4">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              className="rounded shadow-lg bg-white dark:bg-gray-800"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                className="w-full text-left py-2 px-4 border-b bg-gray-200 dark:bg-gray-700 dark:text-white font-semibold flex justify-between items-center"
                onClick={() => toggleCategory(category.id)}
              >
                <span>{category.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setVisibleForm(category.id);
                  }}
                  className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full"
                >
                  <MdAdd className="text-xl" />
                </button>
              </motion.button>

              {category.isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-gray-50 dark:bg-gray-900"
                >
                  {visibleForm === category.id && (
                    <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                      <input
                        type="text"
                        placeholder="Bookmark name"
                        value={newBookmark.name}
                        onChange={(e) => setNewBookmark(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="URL"
                        value={newBookmark.link}
                        onChange={(e) => setNewBookmark(prev => ({ ...prev, link: e.target.value }))}
                        className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        onClick={() => handleAddBookmark(category.id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Add Bookmark
                      </button>
                    </div>
                  )}

                  <Droppable droppableId={category.id} direction="horizontal" mode="standard">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`grid grid-cols-4 gap-4 ${snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      >
                        {bookmarks[category.id]?.map((bookmark, index) => (
                          <Draggable
                            key={bookmark.id}
                            draggableId={bookmark.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`relative p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                                  snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
                                }`}
                              >
                                <div className="flex flex-col items-center space-y-2">
                                  <img
                                    src={fetchFavicon(bookmark.link)}
                                    alt={bookmark.name}
                                    className="w-8 h-8 rounded"
                                  />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                                    {bookmark.name}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteBookmark(category.id, bookmark.id)}
                                    className="absolute top-1 right-1 p-1 text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MdDeleteForever className="w-5 h-5" />
                                  </button>
                                  <a
                                    href={bookmark.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute inset-0"
                                    onClick={(e) => snapshot.isDragging && e.preventDefault()}
                                  />
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {(!bookmarks[category.id] || bookmarks[category.id].length === 0) && (
                          <div className="col-span-4 text-center py-8 text-gray-500 dark:text-gray-400">
                            No bookmarks in this category. Add some!
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default PopularBookmarks;
