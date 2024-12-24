import React, { useState, useEffect } from "react";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { IoGrid, IoList } from "react-icons/io5";
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
  getDoc,
} from "firebase/firestore";

function AddLinks() {
  const [link, setLink] = useState("");
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newLink, setNewLink] = useState({ name: "", link: "", category: "" });
  const [newCategories, setNewCategories] = useState([]);
  const [links, setLinks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownStates, setDropdownStates] = useState({}); 
  const [searchTerm, setSearchTerm] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isBookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedColor, setSelectedColor] = useState("#3B82F6"); // Default blue color

  const ITEMS_PER_PAGE = 5

  // Filter categories and their links based on search term
  const filteredCategories = newCategories
    .map(category => ({
      ...category,
      links: links.filter(link => 
        link.categoryId === category.id &&
        (link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         link.link.toLowerCase().includes(searchTerm.toLowerCase()) ||
         category.newCategory.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }))
    .filter(category => category.links.length > 0);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    const setAuthPersistence = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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
      const querySnapshot = await getDocs(collection(db, "bookmarks"));
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

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert("Category name is required!");
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const isAdmin = userDoc.data()?.role === 'admin';
      
      if (!isAdmin) {
        alert("Only admin users can add categories");
        return;
      }

      await addDoc(collection(db, "category"), {
        newCategory: newCategory.trim(),
        color: selectedColor,
        createdAt: new Date(),
      });
      
      setNewCategory("");
      setSelectedColor("#3B82F6");
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleAddLink = async () => {
    if (!newLink.name || !newLink.link || !newLink.category) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const isAdmin = userDoc.data()?.role === 'admin';
      
      if (!isAdmin) {
        alert("Only admin users can add bookmarks");
        return;
      }

      await addDoc(collection(db, "bookmarks"), {
        name: newLink.name,
        link: newLink.link,
        categoryId: newLink.category,
        createdAt: new Date(),
      });
      
      setNewLink({ name: "", link: "", category: "" });
      fetchLinks();
    } catch (error) {
      console.error("Error adding bookmark: ", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const isAdmin = userDoc.data()?.role === 'admin';
      
      if (!isAdmin) {
        alert("Only admin users can delete bookmarks");
        return;
      }

      const confirmDelete = window.confirm(
        "Are you sure you want to delete this bookmark?"
      );
      if (!confirmDelete) return;

      await deleteDoc(doc(db, "bookmarks", id));
      fetchLinks();
    } catch (error) {
      console.error("Error deleting bookmark: ", error);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const isAdmin = userDoc.data()?.role === 'admin';
      
      if (!isAdmin) {
        alert("Only admin users can delete categories");
        return;
      }

      const confirmDelete = window.confirm(
        "Are you sure you want to delete this category?"
      );
      if (!confirmDelete) return;

      await deleteDoc(doc(db, "category", id));
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category: ", error);
    }
  };

  const handleEdit = async (id, currentName, currentLink, currentCategory) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const isAdmin = userDoc.data()?.role === 'admin';
      
      if (!isAdmin) {
        alert("Only admin users can edit bookmarks");
        return;
      }

      const newName = prompt("Enter new name:", currentName);
      const newLink = prompt("Enter new link:", currentLink);
      const newCategory = prompt("Enter new category:", currentCategory);

      if (newName && newLink && newCategory) {
        await updateDoc(doc(db, "bookmarks", id), {
          name: newName,
          link: newLink,
          categoryId: newCategory,
        });
        fetchLinks();
      } else {
        alert("All fields are required for updating.");
      }
    } catch (error) {
      console.error("Error updating bookmark: ", error);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  

  if (loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900"></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 z-10 bg-white dark:bg-white/5 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            
            <div className="flex-1 flex items-center w-full  justify-between  space-x-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Add Bookmarks
            </h1>
            {/* Search Bar */}
            <div className="flex-1 max-w-lg">
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setIsGridView(true)}
                  className={`p-2 rounded ${
                    isGridView
                      ? "bg-white dark:bg-gray-700 shadow-sm"
                      : "hover:bg-white/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <svg className="w-5 h-5 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsGridView(false)}
                  className={`p-2 rounded ${
                    !isGridView
                      ? "bg-white dark:bg-gray-700 shadow-sm"
                      : "hover:bg-white/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <svg className="w-5 h-5 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Bookmark Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add Bookmark
                </h2>
                <button
                  onClick={() => setBookmarkModalOpen(!isBookmarkModalOpen)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  {isBookmarkModalOpen ? "Close Form" : "Add New Bookmark"}
                </button>
              </div>

              {isBookmarkModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Bookmark</h2>
                      <button
                        onClick={() => setBookmarkModalOpen(false)}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={newLink.name}
                          onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                          className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter bookmark name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Link
                        </label>
                        <input
                          type="text"
                          value={newLink.link}
                          onChange={(e) => setNewLink({ ...newLink, link: e.target.value })}
                          className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter bookmark URL"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Category
                        </label>
                        <select
                          value={newLink.category}
                          onChange={(e) => setNewLink({ ...newLink, category: e.target.value })}
                          className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a category</option>
                          {newCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.newCategory}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          onClick={() => setBookmarkModalOpen(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            handleAddLink();
                            setBookmarkModalOpen(false);
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                        >
                          Add Bookmark
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Add Category Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add Category
                </h2>
                <button
                  onClick={() => setCategoryModalOpen(!isCategoryModalOpen)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  {isCategoryModalOpen ? "Close Form" : "Add New Category"}
                </button>
              </div>

              {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Category</h2>
                      <button
                        onClick={() => setCategoryModalOpen(false)}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Category Name
                        </label>
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter category name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Category Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            className="h-10 w-20 rounded cursor-pointer"
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedColor.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          onClick={() => setCategoryModalOpen(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            handleAddCategory();
                            setCategoryModalOpen(false);
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                        >
                          Add Category
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bookmarks Display */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Categories ({filteredCategories.length})
          </h2>
          
          {isGridView ? (
            // Grid View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    <div className="p-4 flex justify-between font-medium text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                      <div>{category.newCategory}</div>
                      <div>{category.links.length}</div>
                    </div>
                    <div className="max-h-[50rem] overflow-y-auto">
                    {category.links.map((link) => (
                      <div
                        key={link.id}
                        className="p-4 hover:bg-gray-50  dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${new URL(link.link).hostname}`}
                            alt=""
                              className="w-5 h-5 flex-shrink-0"
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {link.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <a
                              href={link.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 truncate max-w-[70%]"
                            >
                              {link.link}
                            </a>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEdit(link.id, link.name, link.link, link.categoryId)}
                                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                              >
                                <FaRegEdit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(link.id)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <MdOutlineDeleteOutline size={20} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      </div>
                    </div>
                  
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="space-y-4">
              {paginatedCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-medium text-gray-900 dark:text-white">
                        {category.newCategory}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({category.links.length})
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <MdOutlineDeleteOutline size={20} />
                      </button>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                          expandedCategories[category.id] ? 'transform rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Links List */}
                  {expandedCategories[category.id] && (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {category.links.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${new URL(link.link).hostname}`}
                              alt=""
                              className="w-5 h-5 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {link.name}
                              </p>
                              <a
                                href={link.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 truncate block"
                              >
                                {link.link}
                              </a>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                              onClick={() => handleEdit(link.id, link.name, link.link, link.categoryId)}
                              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              <FaRegEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(link.id)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <MdOutlineDeleteOutline size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg border ${
                  currentPage === 1
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
                }`}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-lg border ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg border ${
                  currentPage === totalPages
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                } border-gray-300 dark:border-gray-600`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddLinks;
