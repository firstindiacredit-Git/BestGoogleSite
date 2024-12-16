import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Draggable from "react-draggable";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

 
function DraggableDropdown({
  category,
  toggleDropdown,
  isOpen,
  fetchLinks,
  cachedLinks,
  setCachedLinks,
  index,
  moveItem,
  isDraggable,
}) {
  const [links, setLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [error, setError] = useState(null);

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

  const handleStop = (e, data) => {
    if (isDraggable) moveItem(index, data.x);
  };

  const DropdownContent = (
    <div className="relative p-2 bg-transparent border ml-[18%] rounded-lg shadow-lg">
      <button
        onClick={toggleDropdown}
        className="bg-blue-500 text-white w-48 px-4 py-2 rounded focus:outline-none text-center"
      >
        {category}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 w-70 z-40 flex items-center justify-center">
          <div
            className="relative backdrop-blur-lg bg-white/30 text-black dark:text-white rounded-lg shadow-lg p-6"
            style={{ zIndex: 999, width: "100%", maxWidth: "23rem" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className=" text-black dark:text-white w-full font-semibold">
                Related Links
              </h2>
              <button
                onClick={toggleDropdown}
                className="text-black border dark:text-white bg-transparent px-2 py-1 rounded-lg transition"
              >
                Close
              </button>
            </div>
            {loadingLinks ? (
              <p>Loading links...</p>
            ) : error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : links.length > 0 ? (
              <div className="sm:grid-cols-2">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center bg-gray-100 p-1 rounded mb-1"
                  >
                    {link.logoUrl && (
                      <img
                        src={link.logoUrl}
                        alt={link.name}
                        className="w-4 h-4 mr-2 rounded-2xl"
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
  );

  return isDraggable ? (
    <Draggable
      axis="x"
      onStop={handleStop}
      position={{ x: index * 220, y: 0 }}
      bounds="parent"
    >
      {DropdownContent}
    </Draggable>
  ) : (
    DropdownContent
  );
}

DraggableDropdown.propTypes = {
  category: PropTypes.string.isRequired,
  toggleDropdown: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  fetchLinks: PropTypes.func.isRequired,
  cachedLinks: PropTypes.object.isRequired,
  setCachedLinks: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  moveItem: PropTypes.func.isRequired,
  isDraggable: PropTypes.bool.isRequired,
};
 
function ShowLinks() {
  const [isOpen, setIsOpen] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);
  const [cachedLinks, setCachedLinks] = useState({});
  const [items, setItems] = useState([]);
  const [isDraggable, setIsDraggable] = useState(true);

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
 
      const savedItems = JSON.parse(localStorage.getItem("draggableItems"));
      setItems(savedItems || fetchedCategories);
    } catch (error) {
      setError("Failed to load categories.");
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

  const moveItem = (index, newXPosition) => {
    const newItems = [...items];
    const movedItem = newItems[index];
    const newIndex = Math.floor(newXPosition / 220);
    if (newIndex !== index) {
      newItems.splice(index, 1);
      newItems.splice(newIndex, 0, movedItem);
      setItems(newItems);
 
      localStorage.setItem("draggableItems", JSON.stringify(newItems));
    }
  };

  const toggleDropdown = (index) => {
    setIsOpen((prevOpen) => (prevOpen === index ? null : index));
  };

  return (
    <div className="relative p-4 border-gray-300">
      {loadingCategories ? (
        <p className="justify-center">Loading categories...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <div className="flex justify-start -ml-36 -space-x-[14%]">
          {items.map((categoryItem, index) => (
            <DraggableDropdown
              key={categoryItem.id}
              category={categoryItem.newCategory || categoryItem.name}
              toggleDropdown={() => toggleDropdown(index)}
              isOpen={isOpen === index}
              fetchLinks={fetchLinks}
              cachedLinks={cachedLinks}
              setCachedLinks={setCachedLinks}
              index={index}
              moveItem={moveItem}
              isDraggable={isDraggable}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ShowLinks;
