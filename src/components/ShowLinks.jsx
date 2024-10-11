import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import Draggable from "react-draggable";
import { FaLock, FaLockOpen } from "react-icons/fa";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

// Draggable Dropdown Component
function DraggableDropdown({
  category,
  isDraggable,
  toggleDropdown,
  isOpen,
  fetchLinks,
}) {
  const [links, setLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);
  const draggableRef = useRef(null); // Ref for the draggable element

  // Close the dropdown when clicking outside the modal
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

  // Fetch links when the dropdown is open
  useEffect(() => {
    if (isOpen) {
      setLoadingLinks(true);
      setError(null);
      fetchLinks(category)
        .then((fetchedLinks) => {
          setLinks(fetchedLinks);
        })
        .catch((error) => {
          console.error("Error fetching links: ", error);
          setError("Failed to load links.");
        })
        .finally(() => {
          setLoadingLinks(false);
        });
    } else {
      setLinks([]); // Clear links when dropdown is closed
    }
  }, [isOpen, fetchLinks, category]);

  return (
    <div className="relative">
      <Draggable
        disabled={!isDraggable}
        nodeRef={draggableRef}
        defaultPosition={{ x: 0, y: 0 }}
      >
        <div
          ref={draggableRef}
          className="relative gap-2 p-2 bg-transparent border rounded-lg shadow-lg"
        >
          <button
            onClick={toggleDropdown}
            className="bg-blue-500 text-white w-52 px-10 py-2 rounded focus:outline-none"
          >
            {category}
          </button>

          {isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center">
              <div
                ref={modalRef}
                className="relative backdrop-blur-lg bg-white/30 text-black dark:text-white rounded-lg shadow-lg p-6 transform transition-transform duration-300 scale-90"
                style={{ zIndex: 999, width: "50rem" }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg text-black  font-semibold">
                    Related Links
                  </h2>
                  <button
                    onClick={toggleDropdown}
                    className="bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-black px-3 py-1 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                  >
                    Close
                  </button>
                </div>
                {loadingLinks ? (
                  <p>Loading links...</p>
                ) : error ? (
                  <p className="text-sm text-red-500">{error}</p>
                ) : links.length > 0 ? (
                  <div className="pl-4 w-48 ">
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
};

// Main Component
function ShowLinks() {
  const [isDraggable, setIsDraggable] = useState(true);
  const [isOpen, setIsOpen] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);

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

      // Debugging log to see the fetched categories
      console.log("Fetched categories: ", fetchedCategories);
      if (fetchedCategories.length === 0) {
        console.warn("No categories found in Firestore.");
      }

      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error fetching categories: ", error);
      setError(error.message || "Failed to load categories.");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch links for a specific category
  const fetchLinks = async (newCategory) => {
    console.log("Fetching links for category: ", newCategory);

    // Validate newCategory
    if (
      !newCategory ||
      typeof newCategory !== "string" ||
      newCategory.trim() === ""
    ) {
      console.error("Invalid category name provided:", newCategory);
      return []; // Return an empty array if categoryName is not valid
    }

    try {
      const linksQuery = query(
        collection(db, "links"),
        where("category", "==", newCategory)
      );
      const querySnapshot = await getDocs(linksQuery);

      console.log("Query Snapshot: ", querySnapshot); // Check the snapshot

      const fetchedLinks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        logoUrl: `https://logo.clearbit.com/${
          new URL(doc.data().link).hostname
        }`, // Adjusted syntax for logoUrl to use the correct field
      }));

      console.log("Fetched links for category: ", newCategory, fetchedLinks);
      return fetchedLinks;
    } catch (error) {
      console.error("Error fetching links: ", error);
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

  return (
    <div className="flex flex-wrap items-center bg-transparent justify-center space-x-4">
      <button
        onClick={toggleDraggable}
        className="flex left-44 bg-transparent p-2 rounded-full shadow-lg"
      >
        {isDraggable ? <FaLockOpen size={20} /> : <FaLock size={20} />}
      </button>

      {loadingCategories ? (
        <p>Loading categories...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        categories.map((categoryItem, index) => {
          const newCategory = categoryItem.newCategory || ""; // Ensure this matches your Firestore document structure

          // Validate the category name
          if (!newCategory || newCategory.trim() === "") {
            console.warn(
              "Category name is empty or whitespace for item:",
              categoryItem
            );
            return null;
          }

          return (
            <DraggableDropdown
              key={categoryItem.id}
              category={newCategory}
              isDraggable={isDraggable}
              toggleDropdown={() => toggleDropdown(index)}
              isOpen={isOpen === index}
              fetchLinks={fetchLinks}
            />
          );
        })
      )}
    </div>
  );
}

export default ShowLinks;
