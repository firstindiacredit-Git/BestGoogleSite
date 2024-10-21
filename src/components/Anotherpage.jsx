import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Corrected import
import { doc, getDoc, setDoc } from "firebase/firestore";
import { DndContext } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable"; // Ensure this is installed
import AddList from "./Calculator";
import Notepad from "./Notepad";
import ShowLinks from "./ShowLinks";
import Calendar from "./Calendar";
import ImageUploader from "./ImageUploader";
import PopularBookmarks from "./PopularBookmarks";
import Weather from "./Weather";
import { auth, db } from "../firebase";

const Anotherpage = ({ isDarkMode, toggleTheme, backgroundImage }) => {
  const [user, setUser] = useState(null); // State to hold authenticated user
  const [items, setItems] = useState([]); // State to hold draggable items

  // Effect to listen to auth state and set the user
  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set the authenticated user
      } else {
        setUser(null); // No user, reset state
      }
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  // Function to save item positions in Firestore
  const saveItems = async (newItems) => {
    setItems(newItems);
    if (user) {
      const positions = newItems.map((item, index) => ({
        id: item.id,
        position: index,
      })); // Save item ID and its position
      const docRef = doc(db, "Widgets", user.uid);
      try {
        await setDoc(docRef, { items: positions }, { merge: true }); // Save positions in Firestore, using merge to keep existing data
      } catch (error) {
        console.error("Error saving items:", error);
      }
    }
  };

  // Effect to fetch widgets from Firestore when user is authenticated
  useEffect(() => {
    const fetchWidgets = async () => {
      if (user) {
        const docRef = doc(db, "Widgets", user.uid);
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const savedItems = docSnap.data().items || [];
            const sortedItems = savedItems.sort(
              (a, b) => a.position - b.position
            ); // Sort by saved position
            setItems(sortedItems.map((item) => ({ id: item.id }))); // Map back to items with only id
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching widgets:", error);
        }
      }
    };

    fetchWidgets();
  }, [user]); // Only re-run when user changes

  // Handle drag-and-drop event
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex((item) => item.id === active.id);
        const newIndex = prevItems.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(prevItems, oldIndex, newIndex);
        saveItems(newItems); // Save new positions
        return newItems; // Update state with new order
      });
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div
        className={`mt-[13vh] ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        }`}
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <h1 className="text-2xl py-3 font-bold text-center">COMPONENTS</h1>

        <div>
          {/* ShowLinks can be implemented to render draggable items */}
          <ShowLinks items={items} />
        </div>

        <div className="flex flex-col md:flex-row justify-between w-full gap-4">
          <div className="w-full md:w-1/2 lg:w-1/2 p-2">
            <AddList />
            <Notepad />
          </div>

          <div className="w-full p-2">
            <PopularBookmarks />
          </div>

          <div className="w-full md:w-1/2 lg:w-1/2 p-2">
            <ImageUploader />
            <Weather />
            <Calendar />
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
            }`}
          >
            Switch to {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>
    </DndContext>
  );
};

export default Anotherpage;
