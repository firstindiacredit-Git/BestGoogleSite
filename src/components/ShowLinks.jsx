import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import Draggable from "react-draggable";
import { FaLock, FaLockOpen } from "react-icons/fa";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
} from "firebase/firestore";

// Draggable Dropdown Component
function DraggableDropdown({
  category,
  isDraggable,
  toggleDropdown,
  isOpen,
  fetchLinks,
  cachedLinks,
  setCachedLinks,
  onDragEnd,
  index, // Pass index to identify position
}) {
  const [links, setLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);
  const draggableRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        toggleDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, toggleDropdown]);

  useEffect(() => {
    if (isOpen) {
      if (cachedLinks[category]) {
        setLinks(cachedLinks[category]);
      } else {
        setLoadingLinks(true);
        setError(null);
        fetchLinks(category)
          .then((fetchedLinks) => {
            setLinks(fetchedLinks);
            setCachedLinks((prev) => ({
              ...prev,
              [category]: fetchedLinks,
            }));
          })
          .catch((error) => {
            console.error("Error fetching links: ", error);
            setError("Failed to load links.");
          })
          .finally(() => {
            setLoadingLinks(false);
          });
      }
    } else {
      setLinks([]);
    }
  }, [isOpen, fetchLinks, category, cachedLinks, setCachedLinks]);

  const handleDragStop = (e, data) => {
    // Notify parent of drag end
    onDragEnd(index, data.y);
  };

  return (
    <div className="relative">
      <Draggable
        disabled={!isDraggable}
        nodeRef={draggableRef}
        onStop={handleDragStop}
      >
        <div
          ref={draggableRef}
          className="relative gap-2 p-2 bg-transparent border rounded-lg shadow-lg"
        >
          <button
            onClick={toggleDropdown}
            className="bg-blue-500 text-white md:w-56 px-10 py-2 rounded focus:outline-none"
          >
            {category}
          </button>

          {isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 w-full z-40 flex items-center justify-center">
              <div
                ref={modalRef}
                className="relative backdrop-blur-lg bg-white/30 text-black dark:text-white rounded-lg shadow-lg p-6 transform transition-transform duration-300 scale-90"
                style={{ zIndex: 999, width: "90%", maxWidth: "50rem" }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg text-black w-full font-semibold">
                    Related Links
                  </h2>
                  <button
                    onClick={toggleDropdown}
                    className="text-black border bg-transparent px-3 py-1 rounded-lg transition"
                  >
                    Close
                  </button>
                </div>
                {loadingLinks ? (
                  <p>Loading links...</p>
                ) : error ? (
                  <p className="text-sm text-red-500">{error}</p>
                ) : links.length > 0 ? (
                  <div className="sm:grid-cols-2 gap-4">
                    {links.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center bg-gray-100 p-2 rounded mb-1"
                      >
                        {link.logoUrl && (
                          <img
                            src={link.logoUrl}
                            alt={link.name}
                            className="w-4 h-4 mr-2"
                          />
                        )}
                        <a
                          href={link.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-black font-semibold"
                        >
                          {link.name}
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No bookmarks available.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Draggable>
    </div>
  );
}

DraggableDropdown.propTypes = {
  category: PropTypes.string.isRequired,
  isDraggable: PropTypes.bool.isRequired,
  toggleDropdown: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  fetchLinks: PropTypes.func.isRequired,
  cachedLinks: PropTypes.object.isRequired,
  setCachedLinks: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired, // New prop
  index: PropTypes.number.isRequired, // New prop
};

// Main Component
function ShowLinks() {
  const [isDraggable, setIsDraggable] = useState(true);
  const [isOpen, setIsOpen] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);
  const [cachedLinks, setCachedLinks] = useState({});

  // Fetch categories from Firestore
  const fetchCategories = async () => {
    setLoadingCategories(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, "category"));
      const fetchedCategories = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCategories(fetchedCategories);
    } catch (error) {
      setError(error.message || "Failed to load categories.");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchLinks = async (newCategory) => {
    try {
      const linksQuery = query(
        collection(db, "links"),
        where("category", "==", newCategory)
      );
      const querySnapshot = await getDocs(linksQuery);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        logoUrl: `https://logo.clearbit.com/${
          new URL(doc.data().link).hostname
        }`,
      }));
    } catch (error) {
      setError("Failed to load links.");
      return [];
    }
  };

  const toggleDropdown = (index) => {
    setIsOpen((prevOpen) => (prevOpen === index ? null : index));
  };

  const toggleDraggable = () => {
    setIsDraggable((prev) => !prev);
  };

  const handleDragEnd = (index, yPosition) => {
    const draggedCategory = categories[index];

    // Calculate the new index based on the yPosition
    const newIndex = Math.round(yPosition / 50); // Adjust the divisor based on your item height
    if (newIndex < 0 || newIndex >= categories.length || newIndex === index)
      return;

    // Create a new array with the dragged category in its new position
    const newCategories = [...categories];
    newCategories.splice(index, 1);
    newCategories.splice(newIndex, 0, draggedCategory);

    // Update the state and Firebase
    setCategories(newCategories);
    saveCategoriesToFirebase(newCategories);
  };

  const saveCategoriesToFirebase = async (newCategories) => {
    // Save the new order to Firestore (you may want to set a specific document for this)
    const categoryRef = doc(db, "yourCategoriesDoc", "categories"); // Replace with your doc path
    await setDoc(categoryRef, { categories: newCategories });
  };

  return (
    <div className="flex flex-wrap items-center justify-center space-x-4">
      {loadingCategories ? (
        <p>Loading categories...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        categories.map((categoryItem, index) => {
          const newCategory = categoryItem.newCategory || "";

          if (!newCategory || newCategory.trim() === "") return null;

          return (
            <DraggableDropdown
              key={categoryItem.id}
              category={newCategory}
              isDraggable={isDraggable}
              toggleDropdown={() => toggleDropdown(index)}
              isOpen={isOpen === index}
              fetchLinks={fetchLinks}
              cachedLinks={cachedLinks}
              setCachedLinks={setCachedLinks}
              onDragEnd={handleDragEnd} // Pass down the drag end handler
              index={index} // Pass down the index
            />
          );
        })
      )}
      <button
        onClick={toggleDraggable}
        className="bg-transparent rounded-full shadow-lg"
      >
        {isDraggable ? <FaLockOpen size={20} /> : <FaLock size={20} />}
      </button>
    </div>
  );
}

export default ShowLinks;
