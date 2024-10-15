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
  cachedLinks, // Accept cachedLinks as a prop
  setCachedLinks, // Accept setCachedLinks to update the cached links
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
      // Check if links are already cached
      if (cachedLinks[category]) {
        setLinks(cachedLinks[category]);
      } else {
        setLoadingLinks(true);
        setError(null);
        fetchLinks(category)
          .then((fetchedLinks) => {
            setLinks(fetchedLinks);
            // Cache the fetched links
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
      setLinks([]); // Clear links when dropdown is closed
    }
  }, [isOpen, fetchLinks, category, cachedLinks, setCachedLinks]);

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
                <div className="flex justify-between  items-center mb-4">
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
                  <div className=" sm:grid-cols-2 gap-4">
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
  cachedLinks: PropTypes.object.isRequired, // Prop type for cachedLinks
  setCachedLinks: PropTypes.func.isRequired, // Prop type for setCachedLinks
};

// Main Component
function ShowLinks() {
  const [isDraggable, setIsDraggable] = useState(true);
  const [isOpen, setIsOpen] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);
  const [cachedLinks, setCachedLinks] = useState({}); // State for cached links

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

  // Fetch links for a specific category
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
        }`, // Adjusted syntax for logoUrl to use the correct field
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

  return (
    <div className="flex flex-wrap items-center justify-center space-x-4">
      {loadingCategories ? (
        <p>Loading categories...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        categories.map((categoryItem, index) => {
          const newCategory = categoryItem.newCategory || ""; // Ensure this matches your Firestore document structure

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
            />
          );
        })
      )}
      <button
        onClick={toggleDraggable}
        className="flex left-44 bg-transparent p-2 rounded-full shadow-lg"
      >
        {isDraggable ? <FaLockOpen size={20} /> : <FaLock size={20} />}
      </button>
    </div>
  );
}

export default ShowLinks;
