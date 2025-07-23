import { useState, useEffect, useMemo } from "react";
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
  getDoc,
} from "firebase/firestore";
import {
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

// Comprehensive countries list
const countries = [
  { key: "us", flag: "https://flagcdn.com/us.svg", name: "USA" },
  { key: "in", flag: "https://flagcdn.com/in.svg", name: "India" },
  { key: "global", flag: "https://flagcdn.com/un.svg", name: "Global" },
];

// Profession options
const professionOptions = [
  { id: "all", name: "All Professions" },
  // Previous Professions
  { id: "developer", name: "Developer / Programmer" },
  { id: "designer", name: "Designer (UI/UX, Graphic, Web)" },
  { id: "digital_marketer", name: "Digital Marketer" },
  { id: "student", name: "Student" },
  { id: "teacher", name: "Teacher / Educator" },
  { id: "entrepreneur", name: "Entrepreneur / Founder" },
  { id: "freelancer", name: "Freelancer (Creative or Technical)" },
  { id: "consultant", name: "Consultant / Advisor" },
  { id: "professional", name: "Working Professional" },
  { id: "researcher", name: "Researcher / Academic" },
  { id: "it_support", name: "IT / Tech Support" },
  { id: "medical", name: "Medical Professional" },
  // New Professions
  { id: "bpo", name: "BPO" },
  { id: "productivity_management", name: "Productivity & Task Management" },
  { id: "ai_automation", name: "AI Tools & Automation" },
  { id: "education_learning", name: "Education & Learning" },
  { id: "professional_entrepreneurship", name: "Professional & Entrepreneurship" },
  { id: "tax_investments", name: "Tax & Investments" },
  { id: "marketing_growth", name: "Marketing & Growth" },
  { id: "creativity_design", name: "Creativity & Design" },
  { id: "programmer_developer", name: "Programmer & Developer" },
  { id: "news", name: "News" },
  { id: "shopping_deals", name: "Shopping & Deal Sites" },
  { id: "health_wellness", name: "Health & Wellness" },
  { id: "travel", name: "Travel" },
  { id: "entertainment_leisure", name: "Entertainment & Leisure" },
  { id: "career_jobs", name: "Career & Job Portals" },
  { id: "privacy_security", name: "Privacy & Security" },
  { id: "india_specific", name: "India-Specific Portals" },
  { id: "brain_interests", name: "Brain-Interests" },
  { id: "science_nature", name: "Science & Nature" },
  { id: "automotive_transport", name: "Automotive & Transport" },
  { id: "gaming_entertainment", name: "Gaming & Entertainment" },
  { id: "kids_family", name: "Kids & Family" },
  { id: "international_tools", name: "International Tools" },
  { id: "events_conferences", name: "Events & Conferences" },
  { id: "technology_computing", name: "Technology & Computing" },
  { id: "social_community", name: "Social & Community" },
  { id: "home_lifestyle", name: "Home & Lifestyle" },
  { id: "analytics_reporting", name: "Analytics & Reporting" },
  { id: "startup_indie_tools", name: "Startup Directories & Indie Tools" }
];

// Interest options
const interestOptions = [
  { id: "productivity_seeker", name: "Productivity Seeker", icon: "💻" },
  { id: "lifelong_learner", name: "Lifelong Learner", icon: "🏀" },
  { id: "self_improvement_indfulness", name: "Self-Improvement / Mindfulness", icon: "🎨" },
  { id: "traveller_explorer", name: "Traveller / Explorer", icon: "🎵" },
  { id: "content_creator_youTuber", name: "Content Creator / YouTuber", icon: "🔬" },
  { id: "gamer", name: "Gamer", icon: "✈️" },
  { id: "music_lover_podcaster", name: "Music Lover / Podcaster", icon: "📚" },
  { id: "cooking_& _foodie", name: "Cooking & Foodie", icon: "🎮" },
  { id: "photographer", name: "Photographer", icon: "🍔" },
  { id: "artist_creative", name: "Artist / Creative", icon: "🌳" },
  { id: "reader_bookworm", name: "Reader / Bookworm", icon: "💼" },
  { id: "investor_trader", name: "Investor / Trader", icon: "🎓" },
  { id: "smart_shopper", name: "Smart Shopper / Deal Hunter", icon: "🏥" }
];

// Optimized for minimal Firestore read requests:
// - Uses one-time reads instead of real-time listeners
// - Updates local state instead of re-fetching after operations
// - Manual refresh button for when fresh data is needed
// - No automatic polling or background updates
function AddLinks() {
  const [newCategory, setNewCategory] = useState("");
  const [newLink, setNewLink] = useState({ name: "", link: "", category: "" });
  const [newCategories, setNewCategories] = useState([]);
  const [links, setLinks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isBookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [editBookmarkData, setEditBookmarkData] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editCategoryData, setEditCategoryData] = useState(null);
  const [isCategoryEditModalOpen, setIsCategoryEditModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // New state for category form
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState(["global"]);
  const [selectedProfessions, setSelectedProfessions] = useState(["all"]);

  const ITEMS_PER_PAGE = 10;

  // Filter categories based on user preferences and search term
  const filteredCategories = useMemo(() => newCategories
    .map((category) => ({
      ...category,
      links:
        links.filter(
          (link) =>
            link.category === category.id &&
            (link.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              link.link?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              category.newCategory
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()))
        ) || [],
    }))
    .filter((category) => {
      // Filter by search term
      const matchesSearch = category.newCategory?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by country - be more inclusive for new categories
      const categoryCountries = Array.isArray(category.countries) 
        ? category.countries 
        : category.countries 
          ? [category.countries] 
          : [];
          
      const matchesCountry = categoryCountries.length === 0 || 
        categoryCountries.includes("global") ||
        selectedCountries.includes("global") ||
        categoryCountries.some(country => selectedCountries.includes(country));
      
      // Filter by profession - be more inclusive for new categories
      const profs = Array.isArray(category.professions)
        ? category.professions
        : category.professions
          ? [category.professions]
          : [];

      const matchesProfession = profs.length === 0 ||
        profs.includes("all") ||
        selectedProfessions.includes("all") ||
        profs.some(profession => selectedProfessions.includes(profession));
      
      // Filter by interests - be more inclusive for new categories
      const matchesInterests = !category.interests || 
        category.interests.length === 0 || 
        selectedInterests.length === 0 ||
        category.interests.some(interest => selectedInterests.includes(interest));
      
      const shouldShow = category.newCategory && matchesSearch && matchesCountry && matchesProfession && matchesInterests;
      
      // Debug logging for categories that don't show
      if (!shouldShow && category.newCategory) {
        console.log("Category filtered out:", category.newCategory, {
          matchesSearch,
          matchesCountry,
          matchesProfession,
          matchesInterests,
          categoryCountries: category.countries,
          selectedCountries,
          categoryProfessions: category.professions,
          selectedProfessions,
          categoryInterests: category.interests,
          selectedInterests
        });
      }
      
      return shouldShow;
    }), [newCategories, links, searchTerm, selectedCountries, selectedProfessions, selectedInterests]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = useMemo(() => filteredCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  ), [filteredCategories, currentPage]);

  const getFaviconUrl = (link) => {
    try {
      if (!link) return "";
      const url = new URL(link);
      return `https://www.google.com/s2/favicons?domain=${url.hostname}`;
    } catch {
      console.error("Invalid URL:", link);
      return "";
    }
  };

  useEffect(() => {
    const setAuthPersistence = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          setUser(currentUser);
          if (currentUser) {
            // Fetch user data to get profession and interests
            try {
              const userDoc = await getDoc(doc(db, "users", currentUser.uid));
              const userData = userDoc.data();
              
              // Set default filters based on user data
              if (userData?.profession) {
                setSelectedProfessions([userData.profession]);
              }
              if (userData?.interests && userData.interests.length > 0) {
                setSelectedInterests(userData.interests);
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
            
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

  useEffect(() => {
    if (user) {
      fetchLinks();
      fetchCategories();
    }
  }, [user]);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchLinks(), fetchCategories()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
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
      console.log("Fetched Categories:", fetchedCategories);
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
      const docRef = await addDoc(collection(db, "category"), {
        newCategory: newCategory.trim(),
        color: selectedColor,
        interests: selectedInterests,
        countries: selectedCountries,
        professions: selectedProfessions,
        createdAt: new Date(),
      });

      // Add the new category to local state instead of fetching all data
      const newCategoryData = {
        id: docRef.id,
        newCategory: newCategory.trim(),
        color: selectedColor,
        interests: selectedInterests,
        countries: selectedCountries,
        professions: selectedProfessions,
        createdAt: new Date(),
      };
      
      setNewCategories(prev => [...prev, newCategoryData]);

      setNewCategory("");
      setSelectedColor("#3B82F6");
      setSelectedInterests([]);
      setSelectedCountries(["global"]);
      setSelectedProfessions(["all"]);
      setCategoryModalOpen(false);
      
      // Reset search term to show all categories
      setSearchTerm("");
      
      // Reset to first page to show the new category
      setCurrentPage(1);
      
      // Show success message
      alert("Category added successfully!");
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category. Please try again.");
    }
  };

  const handleAddLink = async () => {
    if (!newLink.name || !newLink.link || !newLink.category) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "links"), {
        name: newLink.name,
        link: newLink.link,
        category: newLink.category,
        createdAt: new Date(),
        createdBy: user.uid,
      });

      // Add the new link to local state instead of fetching all data
      const newLinkData = {
        id: docRef.id,
        name: newLink.name,
        link: newLink.link,
        category: newLink.category,
        createdAt: new Date(),
        createdBy: user.uid,
      };
      
      setLinks(prev => [...prev, newLinkData]);
      setNewLink({ name: "", link: "", category: "" });
      setBookmarkModalOpen(false);
      alert("Bookmark added successfully!");
    } catch (error) {
      console.error("Error adding bookmark: ", error);
      alert("Failed to add bookmark. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this bookmark?"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "links", id));
      // Remove from local state instead of fetching all data
      setLinks(prev => prev.filter(link => link.id !== id));
    } catch (error) {
      console.error("Error deleting bookmark: ", error);
      alert("Failed to delete bookmark. Please try again.");
    }
  };

  const handleEdit = async (id, currentName, currentLink, currentCategory) => {
    setEditBookmarkData({
      id,
      name: currentName,
      link: currentLink,
      category: currentCategory,
    });
    setEditModalOpen(true);
  };

  const handleUpdateBookmark = async () => {
    if (!editBookmarkData) return;

    try {
      await updateDoc(doc(db, "links", editBookmarkData.id), {
        name: editBookmarkData.name,
        link: editBookmarkData.link,
        category: editBookmarkData.category,
        updatedAt: new Date(),
      });
      
      // Update local state instead of fetching all data
      setLinks(prev => prev.map(link => 
        link.id === editBookmarkData.id 
          ? { ...link, ...editBookmarkData, updatedAt: new Date() }
          : link
      ));
      
      setEditModalOpen(false);
      setEditBookmarkData(null);
    } catch (error) {
      console.error("Error updating bookmark:", error);
      alert("Failed to update bookmark. Please try again.");
    }
  };

  const handleDeleteCategory = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "category", id));
      // Remove from local state instead of fetching all data
      setNewCategories(prev => prev.filter(category => category.id !== id));
      // Also remove all links in this category
      setLinks(prev => prev.filter(link => link.category !== id));
    } catch (error) {
      console.error("Error deleting category: ", error);
      alert("Failed to delete category. Please try again.");
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleEditCategory = async (categoryId, currentName, currentInterests, currentCountries, currentProfessions) => {
    setEditCategoryData({
      id: categoryId,
      name: currentName,
      interests: currentInterests || [],
      countries: currentCountries || ["global"],
      professions: currentProfessions || ["all"],
    });
    setIsCategoryEditModalOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editCategoryData) return;

    try {
      await updateDoc(doc(db, "category", editCategoryData.id), {
        newCategory: editCategoryData.name,
        interests: editCategoryData.interests,
        countries: editCategoryData.countries,
        professions: editCategoryData.professions,
        updatedAt: new Date(),
      });
      
      // Update local state instead of fetching all data
      setNewCategories(prev => prev.map(category => 
        category.id === editCategoryData.id 
          ? { 
              ...category, 
              newCategory: editCategoryData.name,
              interests: editCategoryData.interests,
              countries: editCategoryData.countries,
              professions: editCategoryData.professions,
              updatedAt: new Date()
            }
          : category
      ));
      
      setIsCategoryEditModalOpen(false);
      setEditCategoryData(null);
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category. Please try again.");
    }
  };

  // Helper to get only USA and India for the add form
  const getCountryOptions = () => {
    return countries.filter(c => c.key === "us" || c.key === "in");
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-[#28283A]"></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#28283A]">
      <div className="sticky top-0 z-10 bg-white dark:bg-[#37375d] shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
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
                  className="w-full px-4 py-2 rounded-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#513a7a] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-[#513a7a] hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh data from server"
              >
                <svg className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#38394c] p-1 rounded-sm">
                <button
                  onClick={() => setIsGridView(true)}
                  className={`p-2 rounded ${
                    isGridView
                      ? "bg-white dark:bg-[#513a7a] shadow-sm"
                      : "hover:bg-gray-200/10 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <svg
                    className="w-5 h-5 dark:text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setIsGridView(false)}
                  className={`p-2 rounded ${
                    !isGridView
                      ? "bg-white dark:bg-[#513a7a] shadow-sm"
                      : "hover:bg-gray-200/10 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <svg
                    className="w-5 h-5 dark:text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5 py-4">
        {/* Filter Controls */}
        <div className="mb-6 bg-white dark:bg-[#513a7a] rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Categories</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedCountries(["global"]);
                  setSelectedProfessions(["all"]);
                  setSelectedInterests([]);
                  setSearchTerm("");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-sm"
              >
                Show All Categories
              </button>
              <button
                onClick={() => {
                  setSelectedCountries(["global"]);
                  setSelectedProfessions(["all"]);
                  setSelectedInterests([]);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-sm hover:bg-gray-600 transition-colors text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Countries
              </label>
              <select
                value={selectedCountries}
                onChange={(e) =>
                  setSelectedCountries(
                    Array.from(e.target.selectedOptions, option => option.value)
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#513a7a] text-gray-900 dark:text-white rounded-sm focus:ring-2 focus:ring-blue-500"
                multiple
              >
                {getCountryOptions().map((country) => (
                  <option key={country.key} value={country.key}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Professions
              </label>
              <div className="flex flex-wrap gap-2 mb-2 max-h-[100px] overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded">
                {selectedProfessions.map((id) => {
                  const p = professionOptions.find(p => p.id === id);
                  return (
                    <span key={id} className="inline-flex items-center bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded text-xs font-medium">
                      {p?.name || id}
                      <button onClick={() => setSelectedProfessions(selectedProfessions.filter(k => k !== id))} className="ml-1 text-green-500 hover:text-red-500">×</button>
                    </span>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded">
                {professionOptions.filter(p => !selectedProfessions.includes(p.id)).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProfessions([...selectedProfessions, p.id])}
                    className="inline-flex items-center bg-gray-100 dark:bg-gray-700 hover:bg-green-200 dark:hover:bg-green-800 text-gray-700 dark:text-gray-200 px-2 py-1 rounded text-xs font-medium"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Interests
              </label>
              <div className="flex flex-wrap gap-2 mb-2 max-h-[100px] overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded">
                {selectedInterests.map((id) => {
                  const i = interestOptions.find(i => i.id === id);
                  return (
                    <span key={id} className="inline-flex items-center bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded text-xs font-medium">
                      {i?.icon} {i?.name || id}
                      <button onClick={() => setSelectedInterests(selectedInterests.filter(k => k !== id))} className="ml-1 text-purple-500 hover:text-red-500">×</button>
                    </span>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded">
                {interestOptions.filter(i => !selectedInterests.includes(i.id)).map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => setSelectedInterests([...selectedInterests, i.id])}
                    className="inline-flex items-center bg-gray-100 dark:bg-gray-700 hover:bg-purple-200 dark:hover:bg-purple-800 text-gray-700 dark:text-gray-200 px-2 py-1 rounded text-xs font-medium"
                  >
                    {i.icon} {i.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Bookmark Card */}
          <div className="bg-white dark:bg-[#513a7a] rounded-sm shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add Bookmark
                </h2>
                <button
                  onClick={() => setBookmarkModalOpen(!isBookmarkModalOpen)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  {isBookmarkModalOpen ? "Close Form" : "Add New Bookmark"}
                </button>
              </div>

              {isBookmarkModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-[#513a7a] rounded-sm max-w-md w-full p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Add New Bookmark
                      </h2>
                      <button
                        onClick={() => setBookmarkModalOpen(false)}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
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
                          onChange={(e) =>
                            setNewLink({ ...newLink, name: e.target.value })
                          }
                          className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-[#513a7a] dark:text-white rounded-xs focus:ring-2 focus:ring-blue-500"
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
                          onChange={(e) =>
                            setNewLink({ ...newLink, link: e.target.value })
                          }
                          className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-[#513a7a] dark:text-white rounded-xs focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter bookmark URL"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Category
                        </label>
                        <select
                          value={newLink.category}
                          onChange={(e) =>
                            setNewLink({ ...newLink, category: e.target.value })
                          }
                          className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-[#513a7a] dark:text-white rounded-xs focus:ring-2 focus:ring-blue-500"
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
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xs transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            handleAddLink();
                            setBookmarkModalOpen(false);
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xs transition-colors"
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
          <div className="bg-white dark:bg-[#513a7a] rounded-sm shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add Category
                </h2>
                <button
                  onClick={() => setCategoryModalOpen(!isCategoryModalOpen)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  {isCategoryModalOpen ? "Close Form" : "Add New Category"}
                </button>
              </div>

              {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-white dark:bg-[#513a7a] rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col shadow-xl">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Category</h2>
                        <button
                          onClick={() => setCategoryModalOpen(false)}
                          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1">
                      <div className="space-y-4">
                        {/* Category Name */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Category Name</label>
                          <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-[#513a7a] dark:text-white rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter category name"
                          />
                        </div>
                        {/* Category Color */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Category Color</label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="color"
                              value={selectedColor}
                              onChange={(e) => setSelectedColor(e.target.value)}
                              className="h-8 w-16 rounded cursor-pointer"
                            />
                            <span className="text-sm text-gray-500 dark:text-gray-400">{selectedColor.toUpperCase()}</span>
                          </div>
                        </div>
                        {/* Countries Tag Selector */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Countries</label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {selectedCountries.map((key) => {
                              const c = countries.find(c => c.key === key);
                              return (
                                <span key={key} className="inline-flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
                                  {c?.flag && <img src={c.flag} alt="" className="w-4 h-4 mr-1 inline" />} {c?.name || key}
                                  <button onClick={() => setSelectedCountries(selectedCountries.filter(k => k !== key))} className="ml-1 text-blue-500 hover:text-red-500">×</button>
                            </span>
                              );
                            })}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {getCountryOptions().filter(c => !selectedCountries.includes(c.key)).map((country) => (
                              <button
                                key={country.key}
                                type="button"
                                onClick={() => setSelectedCountries([...selectedCountries, country.key])}
                                className="inline-flex items-center bg-gray-100 dark:bg-gray-700 hover:bg-blue-200 dark:hover:bg-blue-800 text-gray-700 dark:text-gray-200 px-2 py-1 rounded text-xs font-medium"
                              >
                                {country.flag && <img src={country.flag} alt="" className="w-4 h-4 mr-1 inline" />} {country.name}
                              </button>
                            ))}
                        </div>
                        </div>
                        {/* Professions Tag Selector */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Professions</label>
                          <div className="flex flex-wrap gap-2 mb-2 max-h-[100px] overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded">
                            {selectedProfessions.map((id) => {
                              const p = professionOptions.find(p => p.id === id);
                              return (
                                <span key={id} className="inline-flex items-center bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded text-xs font-medium">
                                  {p?.name || id}
                                  <button onClick={() => setSelectedProfessions(selectedProfessions.filter(k => k !== id))} className="ml-1 text-green-500 hover:text-red-500">×</button>
                                </span>
                              );
                            })}
                          </div>
                          <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded">
                            {professionOptions.filter(p => !selectedProfessions.includes(p.id)).map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => setSelectedProfessions([...selectedProfessions, p.id])}
                                className="inline-flex items-center bg-gray-100 dark:bg-gray-700 hover:bg-green-200 dark:hover:bg-green-800 text-gray-700 dark:text-gray-200 px-2 py-1 rounded text-xs font-medium"
                              >
                                {p.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Interests Tag Selector */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Interests</label>
                          <div className="flex flex-wrap gap-2 mb-2 max-h-[100px] overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded">
                            {selectedInterests.map((id) => {
                              const i = interestOptions.find(i => i.id === id);
                              return (
                                <span key={id} className="inline-flex items-center bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded text-xs font-medium">
                                  {i?.icon} {i?.name || id}
                                  <button onClick={() => setSelectedInterests(selectedInterests.filter(k => k !== id))} className="ml-1 text-purple-500 hover:text-red-500">×</button>
                                </span>
                              );
                            })}
                          </div>
                          <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded">
                            {interestOptions.filter(i => !selectedInterests.includes(i.id)).map((i) => (
                              <button
                                key={i.id}
                                type="button"
                                onClick={() => setSelectedInterests([...selectedInterests, i.id])}
                                className="inline-flex items-center bg-gray-100 dark:bg-gray-700 hover:bg-purple-200 dark:hover:bg-purple-800 text-gray-700 dark:text-gray-200 px-2 py-1 rounded text-xs font-medium"
                              >
                                {i.icon} {i.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            onClick={() => setCategoryModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              handleAddCategory();
                              setCategoryModalOpen(false);
                            }}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
                          >
                            Add Category
                          </button>
                        </div>
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Categories ({filteredCategories.length} of {newCategories.length})
          </h2>
            {filteredCategories.length !== newCategories.length && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {newCategories.length - filteredCategories.length} categories hidden by filters
              </span>
            )}
          </div>

          {isGridView ? (
            // Grid View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto items-start">
              {paginatedCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white dark:bg-[#38394c] rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-fit"
                >
                  <div className="flex flex-col h-full">
                    <div className="p-4 flex justify-between font-medium text-gray-800 dark:text-white bg-gray-100 dark:bg-[#513a7a] border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div>{category.newCategory}</div>
                        <div>({category.links?.length || 0})</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          {category.countries && category.countries.length > 0 && !category.countries.includes("global") && (
                            <span className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-xs">
                              {category.countries.length === 1 
                                ? countries.find(c => c.key === category.countries[0])?.name || category.countries[0]
                                : `${category.countries.length} countries`
                              }
                            </span>
                          )}
                          {category.professions && category.professions.length > 0 && !category.professions.includes("all") && (
                            <span className="px-1 py-0.5 bg-green-100 dark:bg-green-900 rounded text-xs">
                              {category.professions.length === 1 
                                ? professionOptions.find(p => p.id === category.professions[0])?.name || category.professions[0]
                                : `${category.professions.length} professions`
                              }
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {category.interests && category.interests.length > 0 && (
                          <div className="flex items-center gap-1">
                            {category.interests.slice(0, 3).map((interest) => {
                              const interestOption = interestOptions.find(i => i.id === interest);
                              return interestOption ? (
                                <span key={interest} className="text-xs" title={interestOption.name}>
                                  {interestOption.icon}
                                </span>
                              ) : null;
                            })}
                            {category.interests.length > 3 && (
                              <span className="text-xs text-gray-500">+{category.interests.length - 3}</span>
                            )}
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(
                              category.id,
                              category.newCategory,
                              category.interests,
                              category.countries,
                              category.professions
                            );
                          }}
                          className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <EditOutlined style={{ fontSize: "14px" }} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <DeleteOutlined style={{ fontSize: "14px" }} />
                        </button>
                      </div>
                    </div>
                    {(category.links || []).length > 0 && (
                      <div className="max-h-[20rem] overflow-y-auto">
                        {(category.links || []).map((link) => (
                          <div
                            key={link.id}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <div className="flex items-center space-x-3 mb-2">
                              <img
                                src={getFaviconUrl(link.link)}
                                alt=""
                                className="w-5 h-5 flex-shrink-0"
                                onError={(e) => {
                                  e.target.src =
                                    "https://www.google.com/s2/favicons?domain=default"; // Fallback favicon
                                }}
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
                                className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-blue-400 truncate max-w-[70%]"
                              >
                                {link.link}
                              </a>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() =>
                                    handleEdit(
                                      link.id,
                                      link.name,
                                      link.link,
                                      link.category
                                    )
                                  }
                                  className="p-1 text-gray-400 hover:text-indigo-500 transition-colors"
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
                    )}
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
                  className="mb-6 bg-white  dark:bg-[#37375d] rounded-lg shadow-sm"
                >
                  <div
                    onClick={() => toggleCategory(category.id)}
                    className="flex cursor-pointer  items-center justify-between p-4 bg-gray-100 dark:bg-[#513a7a] rounded-t-lg"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {category.newCategory}
                        </h2>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({category.links?.length || 0})
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          {category.countries && category.countries.length > 0 && !category.countries.includes("global") && (
                            <span className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-xs">
                              {category.countries.length === 1 
                                ? countries.find(c => c.key === category.countries[0])?.name || category.countries[0]
                                : `${category.countries.length} countries`
                              }
                            </span>
                          )}
                          {category.professions && category.professions.length > 0 && !category.professions.includes("all") && (
                            <span className="px-1 py-0.5 bg-green-100 dark:bg-green-900 rounded text-xs">
                              {category.professions.length === 1 
                                ? professionOptions.find(p => p.id === category.professions[0])?.name || category.professions[0]
                                : `${category.professions.length} professions`
                              }
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center  ml-3">
                        {category.interests && category.interests.length > 0 && (
                          <div className="flex items-center gap-1 mr-2">
                            {category.interests.slice(0, 3).map((interest) => {
                              const interestOption = interestOptions.find(i => i.id === interest);
                              return interestOption ? (
                                <span key={interest} className="text-xs" title={interestOption.name}>
                                  {interestOption.icon}
                                </span>
                              ) : null;
                            })}
                            {category.interests.length > 3 && (
                              <span className="text-xs text-gray-500">+{category.interests.length - 3}</span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCategory(
                                category.id,
                                category.newCategory,
                                category.interests,
                                category.countries,
                                category.professions
                              );
                            }}
                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <EditOutlined style={{ fontSize: "14px" }} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCategory(category.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <DeleteOutlined style={{ fontSize: "14px" }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {expandedCategories[category.id] &&
                    (category.links || []).length > 0 && (
                      <div className="divide-y  divide-gray-200 dark:divide-gray-700">
                        {(category.links || []).map((link) => (
                          <div
                            key={link.id}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <img
                                src={getFaviconUrl(link.link)}
                                alt=""
                                className="w-5 h-5 flex-shrink-0"
                                onError={(e) => {
                                  e.target.src =
                                    "https://www.google.com/s2/favicons?domain=default"; // Fallback favicon
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {link.name}
                                </p>
                                <a
                                  href={link.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-blue-400 truncate block"
                                >
                                  {link.link}
                                </a>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <button
                                onClick={() =>
                                  handleEdit(
                                    link.id,
                                    link.name,
                                    link.link,
                                    link.category
                                  )
                                }
                                className="p-1 text-gray-400 hover:text-indigo-500 transition-colors"
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
                className={`px-3 py-1 rounded-sm border ${
                  currentPage === 1
                    ? "bg-gray-100 dark:bg-[#513a7a] text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "bg-white dark:bg-[#513a7a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
                }`}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-sm border ${
                    currentPage === i + 1
                      ? "bg-indigo-600 text-white border-blue-600"
                      : "bg-white dark:bg-[#513a7a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-sm border ${
                  currentPage === totalPages
                    ? "bg-gray-100 dark:bg-[#513a7a] text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "bg-white dark:bg-[#513a7a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                } border-gray-300 dark:border-gray-600`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      {isEditModalOpen && editBookmarkData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#513a7a] rounded-sm max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Bookmark
              </h2>
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setEditBookmarkData(null);
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
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
                  value={editBookmarkData.name}
                  onChange={(e) =>
                    setEditBookmarkData({
                      ...editBookmarkData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-[#513a7a] dark:text-white rounded-xs focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter bookmark name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link
                </label>
                <input
                  type="text"
                  value={editBookmarkData.link}
                  onChange={(e) =>
                    setEditBookmarkData({
                      ...editBookmarkData,
                      link: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-[#513a7a] dark:text-white rounded-xs focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter bookmark URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={editBookmarkData.category}
                  onChange={(e) =>
                    setEditBookmarkData({
                      ...editBookmarkData,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-[#513a7a] dark:text-white rounded-xs focus:ring-2 focus:ring-blue-500"
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
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditBookmarkData(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateBookmark}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xs transition-colors"
                >
                  Update Bookmark
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isCategoryEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#513a7a] rounded-lg max-w-lg w-full max-h-[80vh] flex flex-col shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Category</h2>
                <button
                  onClick={() => {
                    setIsCategoryEditModalOpen(false);
                    setEditCategoryData(null);
                  }}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                {/* Category Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={editCategoryData?.name || ""}
                    onChange={(e) =>
                      setEditCategoryData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-[#513a7a] dark:text-white rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="Category name"
                  />
                </div>
                {/* Countries Tag Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Countries</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(Array.isArray(editCategoryData?.countries)
                      ? editCategoryData.countries
                      : editCategoryData?.countries
                        ? [editCategoryData.countries]
                        : ["global"]
                    ).map((key) => {
                      const c = countries.find(c => c.key === key);
                      return (
                        <span key={key} className="inline-flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
                          {c?.flag && <img src={c.flag} alt="" className="w-4 h-4 mr-1 inline" />} {c?.name || key}
                          <button 
                            onClick={() => setEditCategoryData(prev => ({
                              ...prev,
                              countries: prev.countries.filter(k => k !== key)
                            }))} 
                            className="ml-1 text-blue-500 hover:text-red-500"
                          >×</button>
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getCountryOptions().filter(c => !editCategoryData?.countries?.includes(c.key)).map((country) => (
                      <button
                        key={country.key}
                        type="button"
                        onClick={() => setEditCategoryData(prev => ({
                          ...prev,
                          countries: [...(prev.countries || ["global"]), country.key]
                        }))}
                        className="inline-flex items-center bg-gray-100 dark:bg-gray-700 hover:bg-blue-200 dark:hover:bg-blue-800 text-gray-700 dark:text-gray-200 px-2 py-1 rounded text-xs font-medium"
                      >
                        {country.flag && <img src={country.flag} alt="" className="w-4 h-4 mr-1 inline" />} {country.name}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Professions Tag Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Professions</label>
                  <div className="flex flex-wrap gap-2 mb-2 max-h-[100px] overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded">
                    {(Array.isArray(editCategoryData?.professions)
                      ? editCategoryData.professions
                      : editCategoryData?.professions
                        ? [editCategoryData.professions]
                        : ["all"]
                    ).map((id) => {
                      const p = professionOptions.find(p => p.id === id);
                      return (
                        <span key={id} className="inline-flex items-center bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded text-xs font-medium">
                          {p?.name || id}
                          <button 
                            onClick={() => setEditCategoryData(prev => ({
                              ...prev,
                              professions: prev.professions.filter(k => k !== id)
                            }))} 
                            className="ml-1 text-green-500 hover:text-red-500"
                          >×</button>
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded">
                    {professionOptions.filter(p => !editCategoryData?.professions?.includes(p.id)).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setEditCategoryData(prev => ({
                          ...prev,
                          professions: [...(prev.professions || ["all"]), p.id]
                        }))}
                        className="inline-flex items-center bg-gray-100 dark:bg-gray-700 hover:bg-green-200 dark:hover:bg-green-800 text-gray-700 dark:text-gray-200 px-2 py-1 rounded text-xs font-medium"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Interests Tag Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Interests</label>
                  <div className="flex flex-wrap gap-2 mb-2 max-h-[100px] overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded">
                    {(Array.isArray(editCategoryData?.interests)
                      ? editCategoryData.interests
                      : editCategoryData?.interests
                        ? [editCategoryData.interests]
                        : []
                    ).map((id) => {
                      const i = interestOptions.find(i => i.id === id);
                      return (
                        <span key={id} className="inline-flex items-center bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded text-xs font-medium">
                          {i?.icon} {i?.name || id}
                          <button 
                            onClick={() => setEditCategoryData(prev => ({
                              ...prev,
                              interests: prev.interests.filter(k => k !== id)
                            }))} 
                            className="ml-1 text-purple-500 hover:text-red-500"
                          >×</button>
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded">
                    {interestOptions.filter(i => !editCategoryData?.interests?.includes(i.id)).map((i) => (
                      <button
                        key={i.id}
                        type="button"
                        onClick={() => setEditCategoryData(prev => ({
                          ...prev,
                          interests: [...(prev.interests || []), i.id]
                        }))}
                        className="inline-flex items-center bg-gray-100 dark:bg-gray-700 hover:bg-purple-200 dark:hover:bg-purple-800 text-gray-700 dark:text-gray-200 px-2 py-1 rounded text-xs font-medium"
                      >
                        {i.icon} {i.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setIsCategoryEditModalOpen(false);
                      setEditCategoryData(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateCategory}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
                  >
                    Update Category
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddLinks;