import React, { useState, useEffect } from "react";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth, db } from "../../firebase";
import {
  addDoc,
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import Sidebar from "./Sidebar";
import Header from "./Header";

// AddLinks Component
function AddLinks() {
  const [link, setLink] = useState("");
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newCategories, setNewCategories] = useState([]);
  const [links, setLinks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownStates, setDropdownStates] = useState({});

  // Modal state variables
  const [isBookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);

  // Monitor authentication state and fetch data on user login
  useEffect(() => {
    const setAuthPersistence = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence); // Set persistence to local
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          console.log("Current user:", currentUser); // Debugging
          setUser(currentUser);
          if (currentUser) {
            fetchData();
          }
        });
        return () => unsubscribe();
      } catch (error) {
        console.error("Error setting persistence:", error);
      }
    };
    setAuthPersistence();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchLinks(), fetchCategories()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLinks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "links"));
      const fetchedLinks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLinks(fetchedLinks);
    } catch (error) {
      console.error("Error fetching links: ", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "category"));
      const fetchedCategories = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNewCategories(fetchedCategories);
    } catch (error) {
      console.error("Error fetching categories: ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !link || !category) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await addDoc(collection(db, "links"), {
        name,
        link,
        category,
        createdAt: new Date(),
        createdBy: user.uid,
      });
      setName("");
      setLink("");
      setCategory("");
      fetchLinks();
      alert("Bookmark added successfully!"); // Re-fetch links to get the latest data
    } catch (error) {
      console.error("Error adding bookmark: ", error);
    }
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!newCategory || !user) return;

    try {
      await addDoc(collection(db, "category"), {
        newCategory,
        createdAt: new Date(),
        createdBy: user.uid,
      });
      setNewCategory("");
      fetchCategories();
      alert("Category added successfully!"); // Re-fetch categories after adding a new one
    } catch (error) {
      console.error("Error adding category: ", error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this bookmark?"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "links", id));
      fetchLinks(); // Re-fetch links after deletion
    } catch (error) {
      console.error("Error deleting bookmark: ", error);
    }
  };

  const handleEdit = async (id, currentName, currentLink, currentCategory) => {
    const newName = prompt("Enter new name:", currentName);
    const newLink = prompt("Enter new link:", currentLink);
    const newCategory = prompt("Enter new category:", currentCategory);

    if (newName && newLink && newCategory) {
      try {
        await updateDoc(doc(db, "links", id), {
          name: newName,
          link: newLink,
          category: newCategory,
        });
        fetchLinks(); // Re-fetch links after update
      } catch (error) {
        console.error("Error updating bookmark: ", error);
      }
    } else {
      alert("All fields are required for updating.");
    }
  };

  const handleDeleteCategory = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (!confirmDelete) return;

    try {
      // Before deleting the category, consider deleting the links associated with it if needed
      await deleteDoc(doc(db, "category", id));
      fetchCategories(); // Re-fetch categories after deletion
    } catch (error) {
      console.error("Error deleting category: ", error);
    }
  };

  const toggleDropdown = (category) => {
    setDropdownStates((prevStates) => ({
      ...prevStates,
      [category]: !prevStates[category], // Toggle dropdown for the specific category
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <h1 className="text-4xl text-center  font-bold">ADD LINKS</h1>
        <div className="p-4 w-[70%] m-auto">
          {/* Add Bookmark Card */}
          <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold mb-2">Add Bookmark</h2>
            <button
              onClick={() => setBookmarkModalOpen(true)}
              className="p-2 bg-blue-500 text-white rounded"
            >
              Open Bookmark Form
            </button>
            {isBookmarkModalOpen && (
              <div className="mt-4 ">
                <form onSubmit={handleSubmit}>
                  <div className="flex  flex-col space-y-3">
                    <div>
                      <label htmlFor="name" className="block mb-1">
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        className="w-full p-2 border rounded"
                        placeholder="Bookmark Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="link" className="block mb-1">
                        Link
                      </label>
                      <input
                        id="link"
                        type="url"
                        className=" p-2 w-full border rounded"
                        placeholder="Bookmark URL"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="category" className="block mb-1">
                        Category
                      </label>
                      <select
                        id="category"
                        className="  p-2 w-[30%] border rounded"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="" disabled>
                          Select Category
                        </option>
                        {newCategories.map((cat) => (
                          <option key={cat.id} value={cat.newCategory}>
                            {cat.newCategory}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="p-2 bg-blue-500 text-white rounded"
                    >
                      Add Bookmark
                    </button>
                  </div>
                </form>
                <button
                  onClick={() => setBookmarkModalOpen(false)}
                  className="mt-4 p-2 bg-red-500 text-white rounded"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* Add Category Card */}
          <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold mb-2">Add Category</h2>
            <button
              onClick={() => setCategoryModalOpen(true)}
              className="p-2 bg-green-500 text-white rounded"
            >
              Open Category Form
            </button>
            {isCategoryModalOpen && (
              <div className="mt-4">
                <form onSubmit={handleCatSubmit}>
                  <div className="flex flex-col space-y-3">
                    <div>
                      <label htmlFor="newCategory" className="block mb-1">
                        New Category
                      </label>
                      <input
                        id="newCategory"
                        type="text"
                        className="w-full p-2 border rounded"
                        placeholder="Add New Category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="p-2 bg-green-500 text-white rounded"
                    >
                      Add Category
                    </button>
                  </div>
                </form>
                <button
                  onClick={() => setCategoryModalOpen(false)}
                  className="mt-4 p-2 bg-red-500 text-white rounded"
                >
                  Close
                </button>
              </div>
            )}
          </div>
          <p className="font-bold text-2xl">BOOKMARKS HISTORY</p>
          {/* Dropdowns for Links */}
          <div className="mt-4">
            {newCategories.map((category) => (
              <div key={category.id} className="mb-2">
                <button
                  className="w-[79%] text-left bg-gray-200 p-2 rounded"
                  onClick={() => toggleDropdown(category.newCategory)}
                >
                  {category.newCategory}
                </button>
                <button
                  className="text-red-500 w-[166px]"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <MdOutlineDeleteOutline className="flex mb-[-22px] ml-2" />{" "}
                  Delete Category
                </button>
                {dropdownStates[category.newCategory] && (
                  <div className="pl-4">
                    {links
                      .filter((link) => link.category === category.newCategory)
                      .map((link) => (
                        <div
                          key={link.id}
                          className="flex justify-between items-center bg-gray-100 p-2 rounded mb-1"
                        >
                          <div className="flex items-center">
                            {/* Display the favicon */}
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${
                                new URL(link.link).hostname
                              }`}
                              alt="favicon"
                              className="w-5 h-5 mr-2"
                            />
                            <strong>{link.name}</strong> -{" "}
                            <a
                              href={link.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mx-20"
                            >
                              {link.link}
                            </a>
                          </div>
                          <div>
                            <button
                              className="text-blue-500 mr-4"
                              onClick={() =>
                                handleEdit(
                                  link.id,
                                  link.name,
                                  link.link,
                                  link.category
                                )
                              }
                            >
                              <FaRegEdit />
                            </button>
                            <button
                              className="text-red-500"
                              onClick={() => handleDelete(link.id)}
                            >
                              <MdOutlineDeleteOutline />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                {/* Delete Category Button */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddLinks;
