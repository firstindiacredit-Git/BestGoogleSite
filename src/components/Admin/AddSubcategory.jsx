// src/components/Admin/AddSubcategory.jsx
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs, addDoc, doc, updateDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import { defaultBookmarks } from "../../firebase/widgetLayouts";
import { Folder, Plus, Pencil, Trash2, X } from "lucide-react";

const getFaviconUrl = (url) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  } catch {
    return `https://www.google.com/s2/favicons?sz=64&domain=google.com`;
  }
};

const AddSubcategory = () => {
  const [subcategoriesMap, setSubcategoriesMap] = useState({});
  const [subcatForms, setSubcatForms] = useState({});
  const [subcatMessages, setSubcatMessages] = useState({});
  const [subcatLoading, setSubcatLoading] = useState({});
  const [bookmarkForms, setBookmarkForms] = useState({});
  const [bookmarkMessages, setBookmarkMessages] = useState({});
  const [bookmarkLoading, setBookmarkLoading] = useState({});
  const [showBookmarkModal, setShowBookmarkModal] = useState({}); // { category: { subcat: bool } }
  const [showSubcatModal, setShowSubcatModal] = useState({});
  const [editSubcatModal, setEditSubcatModal] = useState({}); // { category, subcat, value }
  const [editBookmarkModal, setEditBookmarkModal] = useState({}); // { category, subcat, bookmark }
  const [deleteConfirm, setDeleteConfirm] = useState({}); // { type: 'subcat'|'bookmark', category, subcat, bookmark }
  // Update subcategory data model to { name, iconUrl }
  // Add 'iconUrl' input to add/edit forms, and render icon in UI
  const [subcatIconForms, setSubcatIconForms] = useState({}); // { category: iconUrl }
  // Add a new state to store bookmarks per subcategory for admin view
  const [adminBookmarksMap, setAdminBookmarksMap] = useState({}); // { category: { subcat: [bookmarks] } }
  const [openSubcats, setOpenSubcats] = useState({}); // { category: { subcat: true/false } }
  const [selectedProfessions, setSelectedProfessions] = useState({});
  const [selectedInterests, setSelectedInterests] = useState({});
  const [activeTab, setActiveTab] = useState("categories"); // 'categories' or 'interests'

  // NEW: State for new category input
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [newCategoryLoading, setNewCategoryLoading] = useState(false);
  const [newCategoryMessage, setNewCategoryMessage] = useState("");

  // NEW: State for all categories (hardcoded + admin-added)
  const [allCategories, setAllCategories] = useState([]);

  // NEW: Track which category is being deleted
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState(null); // { name, id }
  // NEW: State for category edit modal
  const [editCategoryModal, setEditCategoryModal] = useState(null); // { oldName, newName }

  // Delete admin-added category and its bookmarks
  const handleDeleteCategory = async (category) => {
    // Find the category doc
    const q = query(collection(db, "category"), where("newCategory", "==", category), where("addedByAdmin", "==", true));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;
    const categoryId = snapshot.docs[0].id;
    // Delete all links for this category
    const linksQ = query(collection(db, "links"), where("category", "==", categoryId));
    const linksSnap = await getDocs(linksQ);
    for (const docSnap of linksSnap.docs) {
      await deleteDoc(doc(db, "links", docSnap.id));
    }
    // Delete the category doc
    await deleteDoc(doc(db, "category", categoryId));
    setDeleteCategoryConfirm(null);
  };

  // NEW: Save edited category name
  const handleEditCategorySave = async () => {
    const { oldName, newName } = editCategoryModal;
    if (!newName || oldName === newName) {
      setEditCategoryModal(null);
      return;
    }

    // Check if new name already exists
    if (allCategories.some(c => c.toLowerCase() === newName.toLowerCase())) {
      alert("A category with this name already exists.");
      return;
    }

    // Find the category doc
    const q = query(collection(db, "category"), where("newCategory", "==", oldName), where("addedByAdmin", "==", true));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      alert("Could not find the category to update.");
      return;
    }
    const categoryId = snapshot.docs[0].id;
    const categoryDocRef = doc(db, "category", categoryId);

    // Update the category name
    await updateDoc(categoryDocRef, { newCategory: newName });

    setEditCategoryModal(null);
  };

  const professionOptions = [
    { id: "developer", name: "Developer / Programmer", icon: "💻", desc: "Software development and programming" },
    { id: "designer", name: "Designer (UI/UX, Graphic, Web)", icon: "🎨", desc: "Creative design and user experience" },
    { id: "digital_marketer", name: "Digital Marketer", icon: "📱", desc: "Digital marketing and online promotion" },
    { id: "student", name: "Student", icon: "🎓", desc: "Currently studying or pursuing education" },
    { id: "teacher", name: "Teacher / Educator", icon: "👩‍🏫", desc: "Teaching in a school, college, or university" },
    { id: "entrepreneur", name: "Entrepreneur / Founder", icon: "🚀", desc: "Running your own business or startup" },
    { id: "freelancer", name: "Freelancer (Creative or Technical)", icon: "🆓", desc: "Working independently on projects" },
    { id: "consultant", name: "Consultant / Advisor", icon: "💡", desc: "Providing expert advice and consultation" },
    { id: "working_professional", name: "Working Professional", icon: "💼", desc: "Working in a professional field" },
    { id: "researcher", name: "Researcher / Academic", icon: "🔬", desc: "Research and academic work" },
    { id: "it_support", name: "IT / Tech Support", icon: "🛠️", desc: "IT support and technical assistance" },
    { id: "medical", name: "Medical Professional", icon: "⚕️", desc: "Healthcare and medical services" },
    { id: "retired", name: "Retired", icon: "🌅", desc: "Retired from active work" },
    { id: "other", name: "Other", icon: "✨", desc: "Other profession or occupation" },
  ];
  const interestOptions = [
    { id: "productivity_seeker", name: "Productivity Seeker", icon: "⚡" },
    { id: "lifelong_learner", name: "Lifelong Learner", icon: "🧠" },
    { id: "self_improvement", name: "Self-Improvement / Mindfulness", icon: "🧘" },
    { id: "traveller", name: "Traveller / Explorer", icon: "✈️" },
    { id: "content_creator", name: "Content Creator / YouTuber", icon: "📹" },
    { id: "gamer", name: "Gamer", icon: "🎮" },
    { id: "music_lover", name: "Music Lover / Podcaster", icon: "🎵" },
    { id: "cooking", name: "Cooking & Foodie", icon: "🍳" },
    { id: "photographer", name: "Photographer", icon: "📸" },
    { id: "artist", name: "Artist / Creative", icon: "🎨" },
    { id: "reader", name: "Reader / Bookworm", icon: "📚" },
    { id: "investor", name: "Investor / Trader", icon: "📈" },
    { id: "smart_shopper", name: "Smart Shopper / Deal Hunter", icon: "🛒" },
    
  ];
  // Fetch subcategories for all categories from Firestore
  useEffect(() => {
    const q = query(collection(db, "category"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hardcodedCatNames = Object.keys(defaultBookmarks);

      // Filter Firestore docs. A doc is relevant if it's admin-added OR corresponds to a hardcoded category.
      const relevantDocsData = snapshot.docs
        .map(doc => doc.data())
        .filter(data => data.addedByAdmin === true || hardcodedCatNames.includes(data.newCategory));
      
      const newSubcategoriesMap = {};
      const foundInFirestore = [];

      relevantDocsData.forEach(data => {
        newSubcategoriesMap[data.newCategory] = Array.isArray(data.subcategories) ? data.subcategories : [];
        foundInFirestore.push(data.newCategory);
      });

      // Handle pure hardcoded categories that do NOT have a Firestore entry.
      hardcodedCatNames.forEach(catName => {
        if (!foundInFirestore.includes(catName)) {
          const imported = defaultBookmarks[catName];
          newSubcategoriesMap[catName] = (imported && typeof imported === 'object' && !Array.isArray(imported)) 
                                        ? Object.keys(imported) 
                                        : [];
        }
      });
      
      setSubcategoriesMap(newSubcategoriesMap);
      setAllCategories(Object.keys(newSubcategoriesMap).sort()); // sort for consistent order
    });
    return () => unsubscribe();
  }, []);

  // Fetch bookmarks for each subcategory for admin view
  useEffect(() => {
    const unsubscribes = [];
    allCategories.forEach(category => {
      (subcategoriesMap[category] || []).forEach(subcatObj => {
        const subcat = typeof subcatObj === 'string' ? subcatObj : subcatObj.name;
        // Find category doc id
        const fetchAndListen = async () => {
          const q = query(collection(db, "category"), where("newCategory", "==", category));
          const snapshot = await getDocs(q);
          if (snapshot.empty) return;
          const categoryId = snapshot.docs[0].id;
          const linksQuery = query(collection(db, "links"), where("category", "==", categoryId), where("subcategory", "==", subcat));
          const unsubscribe = onSnapshot(linksQuery, (linksSnap) => {
            setAdminBookmarksMap(prev => ({
              ...prev,
              [category]: {
                ...(prev[category] || {}),
                [subcat]: linksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
              },
            }));
          });
          unsubscribes.push(unsubscribe);
        };
        fetchAndListen();
      });
    });
    return () => unsubscribes.forEach(unsub => unsub());
  }, [allCategories, subcategoriesMap]);

  // Subcategory add form handlers (unchanged)
  const handleSubcatInputChange = (category, value) => {
    setSubcatForms(prev => ({ ...prev, [category]: value }));
  };
  // In handleAddSubcategory, use { name, iconUrl } object
  const handleAddSubcategory = async (e, category) => {
    e.preventDefault();
    setSubcatMessages(prev => ({ ...prev, [category]: "" }));
    setSubcatLoading(prev => ({ ...prev, [category]: true }));
    const subcategory = subcatForms[category]?.trim();
    const iconUrl = subcatIconForms[category]?.trim();
    if (!subcategory) {
      setSubcatMessages(prev => ({ ...prev, [category]: "Please enter subcategory name." }));
      setSubcatLoading(prev => ({ ...prev, [category]: false }));
      return;
    }
    try {
      const q = query(collection(db, "category"), where("newCategory", "==", category));
      const snapshot = await getDocs(q);

      const newSubcategoryData = {
        name: subcategory,
        iconUrl: iconUrl || "",
        professions: selectedProfessions[category] || [],
        interests: selectedInterests[category] || [],
      };

      if (snapshot.empty) {
        // If category doesn't exist in Firestore, create it if it's a valid hardcoded category.
        const hardcodedCatNames = Object.keys(defaultBookmarks);
        if (hardcodedCatNames.includes(category)) {
          await addDoc(collection(db, "category"), {
            newCategory: category,
            subcategories: [newSubcategoryData],
          });
          // Force a state update to trigger UI refresh
          setTimeout(() => {
            setSubcategoriesMap(prev => ({ ...prev }));
          }, 300);
        } else {
          // This should not happen with the current UI logic
          throw new Error("Attempted to add subcategory to an unknown category.");
        }
      } else {
        // If category exists, update its subcategories array.
        const categoryId = snapshot.docs[0].id;
        const categoryDocRef = doc(db, "category", categoryId);
        const prevSubcats = snapshot.docs[0].data().subcategories || [];
        const newSubcats = [...prevSubcats, newSubcategoryData];
        await updateDoc(categoryDocRef, {
          subcategories: newSubcats,
        });
        // Manually update local state for immediate UI refresh
        setSubcategoriesMap(prev => ({
          ...prev,
          [category]: newSubcats
        }));
      }

      setSubcatMessages(prev => ({ ...prev, [category]: "✅ Subcategory added!" }));
      setSubcatForms(prev => ({ ...prev, [category]: "" }));
      setSubcatIconForms(prev => ({ ...prev, [category]: "" }));
      setSelectedProfessions(prev => ({ ...prev, [category]: [] }));
      setSelectedInterests(prev => ({ ...prev, [category]: [] }));
    } catch (err) {
      console.error("Error adding subcategory", err);
      setSubcatMessages(prev => ({ ...prev, [category]: "❌ Error adding subcategory." }));
    }
    setSubcatLoading(prev => ({ ...prev, [category]: false }));
  };

  // Bookmark add popup handlers
  const openBookmarkModal = (category, subcat) => {
    setShowBookmarkModal(prev => ({
      ...prev,
      [category]: { ...(prev[category] || {}), [subcat]: true },
    }));
  };
  const closeBookmarkModal = (category, subcat) => {
    setShowBookmarkModal(prev => ({
      ...prev,
      [category]: { ...(prev[category] || {}), [subcat]: false },
    }));
    setBookmarkMessages(prev => ({
      ...prev,
      [category]: { ...(prev[category] || {}), [subcat]: "" },
    }));
  };

  // Bookmark add form handlers
  const handleBookmarkInputChange = (category, subcat, field, value) => {
    setBookmarkForms(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subcat]: {
          ...((prev[category] && prev[category][subcat]) || {}),
          [field]: value,
        },
      },
    }));
  };
  const handleAddBookmark = async (e, category, subcat) => {
    e.preventDefault();
    setBookmarkMessages(prev => ({
      ...prev,
      [category]: { ...(prev[category] || {}), [subcat]: "" },
    }));
    setBookmarkLoading(prev => ({
      ...prev,
      [category]: { ...(prev[category] || {}), [subcat]: true },
    }));
    const form = (bookmarkForms[category] && bookmarkForms[category][subcat]) || {};
    if (!form.name || !form.link) {
      setBookmarkMessages(prev => ({
        ...prev,
        [category]: { ...(prev[category] || {}), [subcat]: "Please fill all fields." },
      }));
      setBookmarkLoading(prev => ({
        ...prev,
        [category]: { ...(prev[category] || {}), [subcat]: false },
      }));
      return;
    }
    try {
      const q = query(collection(db, "category"), where("newCategory", "==", category));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setBookmarkMessages(prev => ({
          ...prev,
          [category]: { ...(prev[category] || {}), [subcat]: "Category not found." },
        }));
        setBookmarkLoading(prev => ({
          ...prev,
          [category]: { ...(prev[category] || {}), [subcat]: false },
        }));
        return;
      }
      const categoryId = snapshot.docs[0].id;
      await addDoc(collection(db, "links"), {
        category: categoryId,
        subcategory: subcat,
        name: form.name,
        link: form.link,
        addedByAdmin: true,
      });
      setBookmarkMessages(prev => ({
        ...prev,
        [category]: { ...(prev[category] || {}), [subcat]: "✅ Bookmark added!" },
      }));
      setBookmarkForms(prev => ({
        ...prev,
        [category]: { ...(prev[category] || {}), [subcat]: { name: "", link: "" } },
      }));
      closeBookmarkModal(category, subcat);
    } catch (err) {
      console.error("Error adding bookmark", err);
      setBookmarkMessages(prev => ({
        ...prev,
        [category]: { ...(prev[category] || {}), [subcat]: "❌ Error adding bookmark." },
      }));
    }
    setBookmarkLoading(prev => ({
      ...prev,
      [category]: { ...(prev[category] || {}), [subcat]: false },
    }));
  };

  const openSubcatModal = (category) => {
    setShowSubcatModal(prev => ({ ...prev, [category]: true }));
  };
  const closeSubcatModal = (category) => {
    setShowSubcatModal(prev => ({ ...prev, [category]: false }));
  };
  // Edit subcategory handlers
  const openEditSubcatModal = (category, subcatData) => {
    const subcatName = typeof subcatData === 'string' ? subcatData : subcatData.name;
    const iconUrl = typeof subcatData === 'object' ? subcatData.iconUrl : '';
    const professions = typeof subcatData === 'object' ? subcatData.professions : [];
    const interests = typeof subcatData === 'object' ? subcatData.interests : [];
    setEditSubcatModal({ category, subcat: subcatName, value: subcatName, iconUrl, professions, interests });
  };
  const closeEditSubcatModal = () => setEditSubcatModal({});
  const handleEditSubcatChange = (value) => setEditSubcatModal((prev) => ({ ...prev, value }));
  // In edit subcategory modal, add icon URL input and preview
  const handleEditSubcatChangeIcon = (value) => setEditSubcatModal((prev) => ({ ...prev, iconUrl: value }));
  const handleEditSubcatSave = async () => {
    const { category, subcat, value, iconUrl } = editSubcatModal;
    if (!value.trim()) return;
    const q = query(collection(db, "category"), where("newCategory", "==", category));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;
    const categoryId = snapshot.docs[0].id;
    const categoryDocRef = doc(db, "category", categoryId);
    // Update subcategory object in array (handle both string and object)
    const prevSubcats = snapshot.docs[0].data().subcategories || [];
    const updatedSubcats = prevSubcats.map(s => {
      if ((typeof s === 'string' ? s : s.name) === subcat) {
        return { name: value.trim(), iconUrl: iconUrl || '' , professions: editSubcatModal.professions || [], interests: editSubcatModal.interests || []};
      }
      return s;
    });
    await updateDoc(categoryDocRef, { subcategories: updatedSubcats });
    // If subcategory name changed, update all links with old subcat to new subcat name
    if (value.trim() !== subcat) {
      const linksQ = query(collection(db, "links"), where("category", "==", categoryId), where("subcategory", "==", subcat));
      const linksSnap = await getDocs(linksQ);
      for (const docSnap of linksSnap.docs) {
        await updateDoc(doc(db, "links", docSnap.id), { subcategory: value.trim() });
      }
    }
    closeEditSubcatModal();
  };

  // Delete subcategory
  const handleDeleteSubcat = async ({ category, subcat }) => {
    // Remove subcat from category doc
    const q = query(collection(db, "category"), where("newCategory", "==", category));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;
    const categoryId = snapshot.docs[0].id;
    const categoryDocRef = doc(db, "category", categoryId);
    await updateDoc(categoryDocRef, {
      subcategories: (snapshot.docs[0].data().subcategories || []).filter(
        (s) => (typeof s === "string" ? s !== subcat : s.name !== subcat)
      )
    });
    // Delete all links in this subcat
    const linksQ = query(collection(db, "links"), where("category", "==", categoryId), where("subcategory", "==", subcat));
    const linksSnap = await getDocs(linksQ);
    for (const docSnap of linksSnap.docs) {
      await deleteDoc(doc(db, "links", docSnap.id));
    }
    setDeleteConfirm({});
  };

  // Edit bookmark handlers
  const closeEditBookmarkModal = () => setEditBookmarkModal({});
  const handleEditBookmarkChange = (field, value) => setEditBookmarkModal((prev) => ({ ...prev, bookmark: { ...prev.bookmark, [field]: value } }));
  const handleEditBookmarkSave = async () => {
    const { bookmark } = editBookmarkModal;
    if (!bookmark.name.trim() || !bookmark.link.trim()) return;
    await updateDoc(doc(db, "links", bookmark.id), { name: bookmark.name.trim(), link: bookmark.link.trim() });
    closeEditBookmarkModal();
  };

  // Delete bookmark
  const handleDeleteBookmark = async ({ bookmark }) => {
    await deleteDoc(doc(db, "links", bookmark.id));
    setDeleteConfirm({});
  };

  const toggleSubcat = (category, subcat) => {
    setOpenSubcats(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [subcat]: !(prev[category]?.[subcat])
      }
    }));
  };

  // --- STATE AND LOGIC FOR INTEREST CATEGORY MANAGEMENT ---
  // Place these at the top level of the component, after other useState/useEffect hooks
  const [interestCategoryInput, setInterestCategoryInput] = useState("");
  const [interestCategoryLoading, setInterestCategoryLoading] = useState(false);
  const [interestCategoryMessage, setInterestCategoryMessage] = useState("");
  const [interestCategories, setInterestCategories] = useState([]); // [{id, name, subcategories: [{name}]}]
  const [editInterestId, setEditInterestId] = useState(null);
  const [editInterestValue, setEditInterestValue] = useState("");
  const [interestSubcatInput, setInterestSubcatInput] = useState({}); // {interestId: value}
  const [interestSubcatLoading, setInterestSubcatLoading] = useState({});
  const [interestSubcatMessage, setInterestSubcatMessage] = useState({});
  const [editInterestSubcatId, setEditInterestSubcatId] = useState(null); // `${interestId}_${idx}`
  const [editInterestSubcatValue, setEditInterestSubcatValue] = useState("");

  // Fetch all interest categories from Firestore
  useEffect(() => {
    const q = query(collection(db, "interests"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInterestCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Add subcategory to interest
  const handleAddInterestSubcat = async (e, interestId) => {
    e.preventDefault();
    const value = (interestSubcatInput[interestId] || "").trim();
    if (!value) return;
    setInterestSubcatLoading(prev => ({ ...prev, [interestId]: true }));
    setInterestSubcatMessage(prev => ({ ...prev, [interestId]: "" }));
    try {
      const docRef = doc(db, "interests", interestId);
      const docSnap = await getDocs(query(collection(db, "interests"), where("__name__", "==", interestId)));
      if (docSnap.empty) throw new Error();
      const prevSubcats = docSnap.docs[0].data().subcategories || [];
      await updateDoc(docRef, { subcategories: [...prevSubcats, { name: value }] });
      setInterestSubcatMessage(prev => ({ ...prev, [interestId]: "✅ Subcategory added!" }));
      setInterestSubcatInput(prev => ({ ...prev, [interestId]: "" }));
    } catch (err) {
      console.error("Error adding interest subcategory", err);
      setInterestSubcatMessage(prev => ({ ...prev, [interestId]: "❌ Error adding subcategory." }));
    }
    setInterestSubcatLoading(prev => ({ ...prev, [interestId]: false }));
  };

  // Edit/delete interest category
  const handleSaveEditInterest = async (interestId) => {
    if (!editInterestValue.trim()) return;
    try {
      await updateDoc(doc(db, "interests", interestId), { name: editInterestValue.trim() });
      setEditInterestId(null);
    } catch (err) {
      console.error("Error updating interest name", err);
    }
  };
  const handleDeleteInterest = async (interestId) => {
    try {
      await deleteDoc(doc(db, "interests", interestId));
    } catch (err) {
      console.error("Error deleting interest", err);
    }
  };
  // Edit/delete interest subcategory
  const handleSaveEditInterestSubcat = async (interestId, idx) => {
    if (!editInterestSubcatValue.trim()) return;
    try {
      const docRef = doc(db, "interests", interestId);
      const docSnap = await getDocs(query(collection(db, "interests"), where("__name__", "==", interestId)));
      if (docSnap.empty) throw new Error();
      const prevSubcats = docSnap.docs[0].data().subcategories || [];
      prevSubcats[idx].name = editInterestSubcatValue.trim();
      await updateDoc(docRef, { subcategories: prevSubcats });
      setEditInterestSubcatId(null);
    } catch (err) {
      console.error("Error editing interest subcategory", err);
    }
  };
  const handleDeleteInterestSubcat = async (interestId, idx) => {
    try {
      const docRef = doc(db, "interests", interestId);
      const docSnap = await getDocs(query(collection(db, "interests"), where("__name__", "==", interestId)));
      if (docSnap.empty) throw new Error();
      const prevSubcats = docSnap.docs[0].data().subcategories || [];
      prevSubcats.splice(idx, 1);
      await updateDoc(docRef, { subcategories: prevSubcats });
    } catch (err) {
      console.error("Error deleting interest subcategory", err);
    }
  };

  // --- STATE AND LOGIC FOR INTEREST BOOKMARKS ---
  const [interestBookmarksMap, setInterestBookmarksMap] = useState({}); // { interestId: { subcat: [bookmarks] } }
  const [showInterestBookmarkModal, setShowInterestBookmarkModal] = useState({}); // { interestId: { subcat: bool } }
  const [interestBookmarkForms, setInterestBookmarkForms] = useState({}); // { interestId: { subcat: { name, link } } }
  const [interestBookmarkMessages, setInterestBookmarkMessages] = useState({}); // { interestId: { subcat: msg } }
  const [interestBookmarkLoading, setInterestBookmarkLoading] = useState({}); // { interestId: { subcat: bool } }
  const [editInterestBookmarkModal, setEditInterestBookmarkModal] = useState({}); // { interestId, subcat, bookmark }
  const [deleteInterestBookmarkConfirm, setDeleteInterestBookmarkConfirm] = useState({}); // { interestId, subcat, bookmark }

  // Fetch bookmarks for each interest subcategory
  useEffect(() => {
    const unsubscribes = [];
    interestCategories.forEach(interest => {
      (interest.subcategories || []).forEach(subcatObj => {
        const subcat = typeof subcatObj === 'string' ? subcatObj : subcatObj.name;
        const q = query(collection(db, "links"), where("interestId", "==", interest.id), where("subcategory", "==", subcat));
        const unsubscribe = onSnapshot(q, (snap) => {
          setInterestBookmarksMap(prev => ({
            ...prev,
            [interest.id]: {
              ...(prev[interest.id] || {}),
              [subcat]: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            },
          }));
        });
        unsubscribes.push(unsubscribe);
      });
    });
    return () => unsubscribes.forEach(unsub => unsub());
  }, [interestCategories]);

  const openInterestBookmarkModal = (interestId, subcat) => {
    setShowInterestBookmarkModal(prev => ({ ...prev, [interestId]: { ...(prev[interestId] || {}), [subcat]: true } }));
  };
  const closeInterestBookmarkModal = (interestId, subcat) => {
    setShowInterestBookmarkModal(prev => ({ ...prev, [interestId]: { ...(prev[interestId] || {}), [subcat]: false } }));
    setInterestBookmarkMessages(prev => ({ ...prev, [interestId]: { ...(prev[interestId] || {}), [subcat]: "" } }));
  };
  const handleInterestBookmarkInputChange = (interestId, subcat, field, value) => {
    setInterestBookmarkForms(prev => ({
      ...prev,
      [interestId]: {
        ...prev[interestId],
        [subcat]: {
          ...((prev[interestId] && prev[interestId][subcat]) || {}),
          [field]: value,
        },
      },
    }));
  };
  const handleAddInterestBookmark = async (e, interestId, subcat) => {
    e.preventDefault();
    setInterestBookmarkMessages(prev => ({ ...prev, [interestId]: { ...(prev[interestId] || {}), [subcat]: "" } }));
    setInterestBookmarkLoading(prev => ({ ...prev, [interestId]: { ...(prev[interestId] || {}), [subcat]: true } }));
    const form = (interestBookmarkForms[interestId] && interestBookmarkForms[interestId][subcat]) || {};
    if (!form.name || !form.link) {
      setInterestBookmarkMessages(prev => ({ ...prev, [interestId]: { ...(prev[interestId] || {}), [subcat]: "Please fill all fields." } }));
      setInterestBookmarkLoading(prev => ({ ...prev, [interestId]: { ...(prev[interestId] || {}), [subcat]: false } }));
      return;
    }
    try {
      await addDoc(collection(db, "links"), {
        interestId,
        subcategory: subcat,
        name: form.name,
        link: form.link,
        addedByAdmin: true,
      });
      setInterestBookmarkMessages(prev => ({ ...prev, [interestId]: { ...(prev[interestId] || {}), [subcat]: "✅ Bookmark added!" } }));
      setInterestBookmarkForms(prev => ({ ...prev, [interestId]: { ...(prev[interestId] || {}), [subcat]: { name: "", link: "" } } }));
      closeInterestBookmarkModal(interestId, subcat);
    } catch (err) {
      console.error("Error adding interest bookmark", err);
      setInterestBookmarkMessages(prev => ({ ...prev, [interestId]: { ...(prev[interestId] || {}), [subcat]: "❌ Error adding bookmark." } }));
    }
    setInterestBookmarkLoading(prev => ({ ...prev, [interestId]: { ...(prev[interestId] || {}), [subcat]: false } }));
  };
  const openEditInterestBookmarkModal = (interestId, subcat, bookmark) => {
    setEditInterestBookmarkModal({ interestId, subcat, bookmark: { ...bookmark } });
  };
  const closeEditInterestBookmarkModal = () => setEditInterestBookmarkModal({});
  const handleEditInterestBookmarkChange = (field, value) => setEditInterestBookmarkModal((prev) => ({ ...prev, bookmark: { ...prev.bookmark, [field]: value } }));
  const handleEditInterestBookmarkSave = async () => {
    const { bookmark } = editInterestBookmarkModal;
    if (!bookmark.name.trim() || !bookmark.link.trim()) return;
    await updateDoc(doc(db, "links", bookmark.id), { name: bookmark.name.trim(), link: bookmark.link.trim() });
    closeEditInterestBookmarkModal();
  };
  const handleDeleteInterestBookmark = async ({ bookmark }) => {
    await deleteDoc(doc(db, "links", bookmark.id));
    setDeleteInterestBookmarkConfirm({});
  };

  // --- STATE FOR OPEN INTEREST SUBCATS ---
  const [openInterestSubcats, setOpenInterestSubcats] = useState({}); // { interestId: { subcat: true/false } }
  const toggleInterestSubcat = (interestId, subcat) => {
    setOpenInterestSubcats(prev => ({
      ...prev,
      [interestId]: {
        ...(prev[interestId] || {}),
        [subcat]: !(prev[interestId]?.[subcat])
      }
    }));
  };

  // Add new category handler
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setNewCategoryMessage("");
    setNewCategoryLoading(true);
    const catName = newCategoryInput.trim();
    if (!catName) {
      setNewCategoryMessage("Please enter a category name.");
      setNewCategoryLoading(false);
      return;
    }
    try {
      // Check if already exists (Firestore or hardcoded)
      if (allCategories.some(c => c.toLowerCase() === catName.toLowerCase())) {
        setNewCategoryMessage("Category already exists.");
        setNewCategoryLoading(false);
        return;
      }
      await addDoc(collection(db, "category"), { newCategory: catName, subcategories: [], addedByAdmin: true });
      setNewCategoryMessage("✅ Category added!");
      setNewCategoryInput("");
    } catch {
      setNewCategoryMessage("❌ Error adding category.");
    }
    setNewCategoryLoading(false);
  };

  // Helper to check if a category is admin-added
  const isAdminCategory = async (category) => {
    // Find the category doc
    const q = query(collection(db, "category"), where("newCategory", "==", category), where("addedByAdmin", "==", true));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return false;
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white dark:bg-gray-900 py-8">
      {/* Tab Switcher */}
      <div className="flex gap-4 mb-8">
        <button
          className={`px-6 py-2 rounded-t-lg font-semibold transition-colors border-b-2 ${activeTab === "categories" ? "border-blue-600 text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-900" : "border-transparent text-gray-500 bg-gray-100 dark:bg-gray-800"}`}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>
        <button
          className={`px-6 py-2 rounded-t-lg font-semibold transition-colors border-b-2 ${activeTab === "interests" ? "border-purple-600 text-purple-700 dark:text-purple-300 bg-white dark:bg-gray-900" : "border-transparent text-gray-500 bg-gray-100 dark:bg-gray-800"}`}
          onClick={() => setActiveTab("interests")}
        >
          Interests
        </button>
      </div>
      {/* Categories Section */}
      {activeTab === "categories" && (
        <>
          <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-100">Manage Categories, Subcategories & Bookmarks</h2>
          {/* NEW: Add Category Form */}
          <form className="flex gap-2 mb-8" onSubmit={handleAddCategory}>
            <input
              type="text"
              placeholder="New Category"
              className="border rounded px-3 py-2 flex-1 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              value={newCategoryInput}
              onChange={e => setNewCategoryInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 font-semibold disabled:opacity-60"
              disabled={newCategoryLoading}
            >
              {newCategoryLoading ? "Adding..." : "Add Category"}
            </button>
          </form>
          {newCategoryMessage && (
            <div className={`mb-4 text-center ${newCategoryMessage.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{newCategoryMessage}</div>
          )}
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allCategories.map(category => {
              // Check if this is an admin-added category (not hardcoded)
              const hardcodedCatNames = Object.keys(defaultBookmarks);
              const isHardcoded = hardcodedCatNames.includes(category);
              return (
                <div key={category} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300">{category}</h3>
                    {/* Show delete button only for admin-added categories */}
                    {!isHardcoded && (
                      <div className="flex gap-2">
                         <button
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Edit Category"
                          onClick={() => setEditCategoryModal({ oldName: category, newName: category })}
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                          title="Delete Category"
                          onClick={() => setDeleteCategoryConfirm({ name: category })}
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Subcategory add form */}
                  <button
                    onClick={() => openSubcatModal(category)}
                    className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold shadow transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Add Subcategory
                  </button>
                  {subcatMessages[category] && (
                    <div className={`mt-2 text-center ${subcatMessages[category].startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{subcatMessages[category]}</div>
                  )}
                  {/* Subcategory list */}
                  {subcategoriesMap[category] && subcategoriesMap[category].length > 0 ? (
                    <div className="flex flex-col gap-4 mt-4">
                      {subcategoriesMap[category].map(subcatObj => {
                        const subcat = typeof subcatObj === 'string' ? subcatObj : subcatObj.name;
                        const iconUrl = typeof subcatObj === 'object' ? subcatObj.iconUrl : '';
                        const professions = typeof subcatObj === 'object' ? subcatObj.professions : [];
                        const interests = typeof subcatObj === 'object' ? subcatObj.interests : [];
                        return (
                          <div key={subcat} className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
                            <div
                              className="flex items-center gap-3 mb-2 justify-between cursor-pointer"
                              onClick={() => toggleSubcat(category, subcat)}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {/* Chevron icon for expand/collapse */}
                                <span className={`transition-transform ${openSubcats[category]?.[subcat] ? "rotate-90" : ""}`}>
                                  ▶
                                </span>
                                {iconUrl ? (
                                  <img src={iconUrl} alt="icon" className="w-7 h-7 rounded object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0" />
                                ) : (
                                  <Folder className="w-5 h-5 text-blue-400 dark:text-blue-300 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <span className="truncate font-medium text-gray-800 dark:text-gray-100">{subcat}</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {(professions || []).map(profId => {
                                      const profession = professionOptions.find(p => p.id === profId);
                                      return profession ? (
                                        <span key={profId} title={profession.name} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-200">
                                          {profession.name}
                                        </span>
                                      ) : null;
                                    })}
                                    {(interests || []).map(intId => {
                                      const interest = interestOptions.find(i => i.id === intId);
                                      return interest ? (
                                        <span key={intId} title={interest.name} className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-200">
                                          {interest.name}
                                        </span>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button type="button" className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" onClick={(e) => { e.stopPropagation(); openEditSubcatModal(category, subcatObj); }} title="Edit Subcategory"><Pencil className="w-4 h-4" /></button>
                                <button type="button" className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900" onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'subcat', category, subcat }); }} title="Delete Subcategory"><Trash2 className="w-4 h-4 text-red-600" /></button>
                              </div>
                            </div>
                            {/* Bookmarks list - only show if open */}
                            {openSubcats[category]?.[subcat] && (
                              <div>
                                {(adminBookmarksMap[category]?.[subcat] || []).filter(b => b.name !== "[Empty]").length > 0 ? (
                                  <div className="flex flex-col gap-3 mb-2 mt-2">
                                    {(adminBookmarksMap[category]?.[subcat] || [])
                                      .filter(b => b.name !== "[Empty]")
                                      .map(b => (
                                        <div
                                          key={b.id}
                                          className="group flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 shadow-sm hover:shadow transition w-full"
                                        >
                                          <a
                                            href={b.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 flex-1 min-w-0"
                                            title={b.name}
                                          >
                                            <img
                                              src={getFaviconUrl(b.link)}
                                              alt=""
                                              className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 bg-white"
                                              onError={e => { e.target.onerror = null; e.target.src = "https://www.google.com/favicon.ico"; }}
                                            />
                                            <span className="truncate font-medium text-gray-800 dark:text-gray-100">{b.name}</span>
                                          </a>
                                          <div className="flex gap-1 opacity-70 group-hover:opacity-100 transition">
                                            <button
                                              type="button"
                                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
                                              onClick={() => setEditBookmarkModal({ category, subcat, bookmark: { ...b } })}
                                              title="Edit Bookmark"
                                            >
                                              <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                              type="button"
                                              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                                              onClick={() => setDeleteConfirm({ type: 'bookmark', category, subcat, bookmark: b })}
                                              title="Delete Bookmark"
                                            >
                                              <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                ) : (
                                  <div className="text-gray-400 italic text-sm py-2 text-center">No bookmarks yet.</div>
                                )}
                              </div>
                            )}
                            {/* Add Bookmark button - only show if open */}
                            {openSubcats[category]?.[subcat] && (
                              <button
                                type="button"
                                className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold shadow transition flex items-center justify-center gap-2"
                                onClick={() => openBookmarkModal(category, subcat)}
                              >
                                <Plus className="w-5 h-5" /> Add Bookmark
                              </button>
                            )}
                            {/* Bookmark add modal */}
                            {showBookmarkModal[category]?.[subcat] && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 w-full max-w-xl relative">
                                  <button
                                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                    onClick={() => closeBookmarkModal(category, subcat)}
                                    aria-label="Close"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                  <div className="mb-4 font-semibold text-gray-800 dark:text-gray-100 text-lg text-center">
                                    Add Bookmark to <span className="text-blue-600 dark:text-blue-300">{subcat}</span>
                                  </div>
                                  <form className="flex flex-col gap-4" onSubmit={e => handleAddBookmark(e, category, subcat)}>
                                    <input
                                      type="text"
                                      placeholder="Bookmark name"
                                      className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                                      value={bookmarkForms[category]?.[subcat]?.name || ""}
                                      onChange={e => handleBookmarkInputChange(category, subcat, "name", e.target.value)}
                                    />
                                    <input
                                      type="url"
                                      placeholder="https://example.com"
                                      className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                                      value={bookmarkForms[category]?.[subcat]?.link || ""}
                                      onChange={e => handleBookmarkInputChange(category, subcat, "link", e.target.value)}
                                    />
                                    <button
                                      type="submit"
                                      className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 font-semibold disabled:opacity-60"
                                      disabled={bookmarkLoading[category]?.[subcat]}
                                    >
                                      {bookmarkLoading[category]?.[subcat] ? "Adding..." : "Add Bookmark"}
                                    </button>
                                    {bookmarkMessages[category]?.[subcat] && (
                                      <div className={`text-sm mt-1 text-center ${bookmarkMessages[category][subcat].startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
                                        {bookmarkMessages[category][subcat]}
                                      </div>
                                    )}
                                  </form>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                    })}
                    </div>
                  ) : (
                    <div className="text-gray-400">No subcategories found.</div>
                  )}
                </div>
              )
            })}
          </div>
          {showSubcatModal[Object.keys(showSubcatModal).find(c => showSubcatModal[c])] && (() => {
            const category = Object.keys(showSubcatModal).find(c => showSubcatModal[c]);
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 w-full max-w-2xl relative max-h-[90vh] flex flex-col">
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={() => closeSubcatModal(category)}
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-300">Add Subcategory to {category}</h3>
                  <form className="flex flex-col gap-4 overflow-y-auto" onSubmit={e => handleAddSubcategory(e, category)}>
                    <input
                      type="text"
                      placeholder="Subcategory name"
                      className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                      value={subcatForms[category] || ""}
                      onChange={e => handleSubcatInputChange(category, e.target.value)}
                    />
                    <input
                      type="url"
                      placeholder="Icon URL (optional)"
                      className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                      value={subcatIconForms[category] || ""}
                      onChange={e => setSubcatIconForms(prev => ({ ...prev, [category]: e.target.value }))}
                    />
                     <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Professions (optional)</label>
                      <div className="flex flex-wrap gap-2 p-2 border rounded-md max-h-32 overflow-y-auto">
                        {professionOptions.map(p => (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => {
                              const current = selectedProfessions[category] || [];
                              const newSelection = current.includes(p.id) ? current.filter(id => id !== p.id) : [...current, p.id];
                              setSelectedProfessions(prev => ({ ...prev, [category]: newSelection }));
                            }}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${(selectedProfessions[category] || []).includes(p.id)
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300"
                              }`}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interests (optional)</label>
                      <div className="flex flex-wrap gap-2 p-2 border rounded-md max-h-32 overflow-y-auto">
                        {interestOptions.map(i => (
                          <button
                            type="button"
                            key={i.id}
                            onClick={() => {
                              const current = selectedInterests[category] || [];
                              const newSelection = current.includes(i.id) ? current.filter(id => id !== i.id) : [...current, i.id];
                              setSelectedInterests(prev => ({ ...prev, [category]: newSelection }));
                            }}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${(selectedInterests[category] || []).includes(i.id)
                              ? "bg-purple-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300"
                              }`}
                          >
                            {i.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 font-semibold disabled:opacity-60 mt-2"
                      disabled={subcatLoading[category]}
                    >
                      {subcatLoading[category] ? "Adding..." : "Add Subcategory"}
                    </button>
                  </form>
                </div>
              </div>
            )
          })()}
          {editSubcatModal.category && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 w-full max-w-xs relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" onClick={closeEditSubcatModal} aria-label="Close"><X /></button>
                <div className="mb-3 font-semibold text-gray-800 dark:text-gray-100 text-lg text-center">Edit Subcategory</div>
                <input type="text" className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:text-white mb-2" value={editSubcatModal.value} onChange={e => handleEditSubcatChange(e.target.value)} />
                <input type="url" className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:text-white mb-2" placeholder="Icon URL (optional)" value={editSubcatModal.iconUrl || ''} onChange={e => handleEditSubcatChangeIcon(e.target.value)} />
                <select
                    multiple
                    value={editSubcatModal.professions || []}
                    onChange={e => setEditSubcatModal(prev => ({ ...prev, professions: Array.from(e.target.selectedOptions, option => option.value) }))}
                    className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:text-white mb-2"
                  >
                    {professionOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select
                    multiple
                    value={editSubcatModal.interests || []}
                    onChange={e => setEditSubcatModal(prev => ({ ...prev, interests: Array.from(e.target.selectedOptions, option => option.value) }))}
                    className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:text-white mb-2"
                  >
                    {interestOptions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                {editSubcatModal.iconUrl && (
                  <img src={editSubcatModal.iconUrl} alt="icon" className="w-12 h-12 rounded object-cover border mx-auto mb-2" />
                )}
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1 font-semibold" onClick={handleEditSubcatSave}>Save</button>
              </div>
            </div>
          )}
          {editBookmarkModal.category && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 w-full max-w-xs relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" onClick={closeEditBookmarkModal} aria-label="Close"><X /></button>
                <div className="mb-3 font-semibold text-gray-800 dark:text-gray-100 text-lg text-center">Edit Bookmark</div>
                <input type="text" className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:text-white mb-2" value={editBookmarkModal.bookmark?.name || ''} onChange={e => handleEditBookmarkChange('name', e.target.value)} />
                <input type="url" className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:text-white mb-3" value={editBookmarkModal.bookmark?.link || ''} onChange={e => handleEditBookmarkChange('link', e.target.value)} />
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1 font-semibold" onClick={handleEditBookmarkSave}>Save</button>
              </div>
            </div>
          )}
          {deleteConfirm.type && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 w-full max-w-xs relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" onClick={() => setDeleteConfirm({})} aria-label="Close"><X /></button>
                <div className="mb-3 font-semibold text-gray-800 dark:text-gray-100 text-lg text-center">Confirm Delete</div>
                <div className="mb-4 text-center text-gray-700 dark:text-gray-200">
                  {deleteConfirm.type === 'subcat' ? `Delete subcategory "${deleteConfirm.subcat}" and all its bookmarks?` : `Delete bookmark "${deleteConfirm.bookmark?.name}"?`}
                </div>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white rounded px-3 py-1 font-semibold mb-2" onClick={() => deleteConfirm.type === 'subcat' ? handleDeleteSubcat(deleteConfirm) : handleDeleteBookmark(deleteConfirm)}>Delete</button>
                <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 rounded px-3 py-1 font-semibold" onClick={() => setDeleteConfirm({})}>Cancel</button>
              </div>
            </div>
          )}
          {/* NEW: Edit Category Modal */}
          {editCategoryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 w-full max-w-xs relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" onClick={() => setEditCategoryModal(null)} aria-label="Close"><X /></button>
                <div className="mb-3 font-semibold text-gray-800 dark:text-gray-100 text-lg text-center">Edit Category</div>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:text-white mb-3"
                  value={editCategoryModal.newName}
                  onChange={e => setEditCategoryModal(prev => ({ ...prev, newName: e.target.value }))}
                />
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1 font-semibold" onClick={handleEditCategorySave}>Save</button>
              </div>
            </div>
          )}
        </>
      )}
      {/* Interests Section */}
      {activeTab === "interests" && (
        <div className="w-full max-w-6xl mt-0">
          <h2 className="text-2xl font-bold mb-6 text-purple-700 dark:text-purple-300">Manage Interest Categories & Subcategories</h2>
          {/* Add Interest Category Form */}
          <form
            className="flex gap-2 mb-6"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!interestCategoryInput.trim()) return;
              setInterestCategoryLoading(true);
              setInterestCategoryMessage("");
              try {
                // Check if already exists
                const q = query(collection(db, "interests"), where("name", "==", interestCategoryInput.trim()));
                const snap = await getDocs(q);
                if (!snap.empty) {
                  setInterestCategoryMessage("Interest category already exists.");
                  setInterestCategoryLoading(false);
                  return;
                }
                await addDoc(collection(db, "interests"), { name: interestCategoryInput.trim(), subcategories: [] });
                setInterestCategoryMessage("✅ Interest category added!");
                setInterestCategoryInput("");
              } catch (err) {
                console.error("Error adding interest category", err);
                setInterestCategoryMessage("❌ Error adding interest category.");
              }
              setInterestCategoryLoading(false);
            }}
          >
            <input
              type="text"
              placeholder="New Interest Category"
              className="border rounded px-3 py-2 flex-1 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
              value={interestCategoryInput}
              onChange={e => setInterestCategoryInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white rounded px-4 py-2 font-semibold disabled:opacity-60"
              disabled={interestCategoryLoading}
            >
              {interestCategoryLoading ? "Adding..." : "Add Interest"}
            </button>
          </form>
          {interestCategoryMessage && (
            <div className={`mb-4 text-center ${interestCategoryMessage.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{interestCategoryMessage}</div>
          )}
          {/* List Interest Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {interestCategories.map(interest => (
              <div key={interest.id} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300">{editInterestId === interest.id ? (
                    <input
                      type="text"
                      className="border rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
                      value={editInterestValue}
                      onChange={e => setEditInterestValue(e.target.value)}
                    />
                  ) : (
                    interest.name
                  )}</h3>
                  <div className="flex gap-2">
                    {editInterestId === interest.id ? (
                      <>
                        <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => handleSaveEditInterest(interest.id)} title="Save"><Pencil className="w-4 h-4" /></button>
                        <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => setEditInterestId(null)} title="Cancel"><X className="w-4 h-4" /></button>
                      </>
                    ) : (
                      <>
                        <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => { setEditInterestId(interest.id); setEditInterestValue(interest.name); }} title="Edit"><Pencil className="w-4 h-4" /></button>
                        <button className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900" onClick={() => handleDeleteInterest(interest.id)} title="Delete"><Trash2 className="w-4 h-4 text-red-600" /></button>
                      </>
                    )}
                  </div>
                </div>
                {/* Add Subcategory to Interest */}
                <form
                  className="flex gap-2 mb-4"
                  onSubmit={e => handleAddInterestSubcat(e, interest.id)}
                >
                  <input
                    type="text"
                    placeholder="New Subcategory"
                    className="border rounded px-3 py-2 flex-1 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                    value={interestSubcatInput[interest.id] || ""}
                    onChange={e => setInterestSubcatInput(prev => ({ ...prev, [interest.id]: e.target.value }))}
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded px-4 py-2 font-semibold disabled:opacity-60"
                    disabled={interestSubcatLoading[interest.id]}
                  >
                    {interestSubcatLoading[interest.id] ? "Adding..." : "Add Subcat"}
                  </button>
                </form>
                {interestSubcatMessage[interest.id] && (
                  <div className={`mb-2 text-center ${interestSubcatMessage[interest.id].startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{interestSubcatMessage[interest.id]}</div>
                )}
                {/* List Subcategories */}
                <div className="flex flex-col gap-2">
                  {(interest.subcategories || []).length > 0 ? (
                    interest.subcategories.map((subcat, idx) => (
                      <div key={idx} className="mb-2">
                        <div
                          className="flex items-center gap-3 mb-2 justify-between cursor-pointer bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2"
                          onClick={() => toggleInterestSubcat(interest.id, subcat.name)}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className={`transition-transform ${openInterestSubcats[interest.id]?.[subcat.name] ? "rotate-90" : ""}`}>▶</span>
                            <span className="truncate font-medium text-gray-800 dark:text-gray-100">{subcat.name}</span>
                          </div>
                          <div className="flex gap-1">
                            {editInterestSubcatId === `${interest.id}_${idx}` ? (
                              <>
                                <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" onClick={e => { e.stopPropagation(); handleSaveEditInterestSubcat(interest.id, idx); }} title="Save"><Pencil className="w-4 h-4" /></button>
                                <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" onClick={e => { e.stopPropagation(); setEditInterestSubcatId(null); }} title="Cancel"><X className="w-4 h-4" /></button>
                              </>
                            ) : (
                              <>
                                <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" onClick={e => { e.stopPropagation(); setEditInterestSubcatId(`${interest.id}_${idx}`); setEditInterestSubcatValue(subcat.name); }} title="Edit"><Pencil className="w-4 h-4" /></button>
                                <button className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900" onClick={e => { e.stopPropagation(); handleDeleteInterestSubcat(interest.id, idx); }} title="Delete"><Trash2 className="w-4 h-4 text-red-600" /></button>
                              </>
                            )}
                          </div>
                        </div>
                        {/* Bookmarks list and Add button - only show if open */}
                        {openInterestSubcats[interest.id]?.[subcat.name] && (
                          <>
                            {(interestBookmarksMap[interest.id]?.[subcat.name] || []).length > 0 ? (
                              <div className="flex flex-col gap-1 mt-1">
                                {(interestBookmarksMap[interest.id]?.[subcat.name] || []).map(b => (
                                  <div key={b.id} className="group flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 shadow-sm hover:shadow transition w-full">
                                    <a href={b.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-1 min-w-0" title={b.name}>
                                      <img src={getFaviconUrl(b.link)} alt="" className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 bg-white" onError={e => { e.target.onerror = null; e.target.src = "https://www.google.com/favicon.ico"; }} />
                                      <span className="truncate font-medium text-gray-800 dark:text-gray-100">{b.name}</span>
                                    </a>
                                    <div className="flex gap-1 opacity-70 group-hover:opacity-100 transition">
                                      <button type="button" className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800" onClick={() => openEditInterestBookmarkModal(interest.id, subcat.name, b)} title="Edit Bookmark"><Pencil className="w-4 h-4" /></button>
                                      <button type="button" className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900" onClick={() => setDeleteInterestBookmarkConfirm({ interestId: interest.id, subcat: subcat.name, bookmark: b })} title="Delete Bookmark"><Trash2 className="w-4 h-4 text-red-600" /></button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-gray-400 italic text-sm py-1 text-center">No bookmarks yet.</div>
                            )}
                            {/* Add Bookmark button */}
                            <button type="button" className="w-full mt-2 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold shadow transition flex items-center justify-center gap-2" onClick={e => { e.stopPropagation(); openInterestBookmarkModal(interest.id, subcat.name); }}>
                              <Plus className="w-5 h-5" /> Add Bookmark
                            </button>
                            {/* Bookmark add modal */}
                            {showInterestBookmarkModal[interest.id]?.[subcat.name] && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 w-full max-w-xl relative">
                                  <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" onClick={() => closeInterestBookmarkModal(interest.id, subcat.name)} aria-label="Close"><X className="w-5 h-5" /></button>
                                  <div className="mb-4 font-semibold text-gray-800 dark:text-gray-100 text-lg text-center">Add Bookmark to <span className="text-purple-600 dark:text-purple-300">{subcat.name}</span></div>
                                  <form className="flex flex-col gap-4" onSubmit={e => handleAddInterestBookmark(e, interest.id, subcat.name)}>
                                    <input type="text" placeholder="Bookmark name" className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500" value={interestBookmarkForms[interest.id]?.[subcat.name]?.name || ""} onChange={e => handleInterestBookmarkInputChange(interest.id, subcat.name, "name", e.target.value)} />
                                    <input type="url" placeholder="https://example.com" className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500" value={interestBookmarkForms[interest.id]?.[subcat.name]?.link || ""} onChange={e => handleInterestBookmarkInputChange(interest.id, subcat.name, "link", e.target.value)} />
                                    <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white rounded px-4 py-2 font-semibold disabled:opacity-60" disabled={interestBookmarkLoading[interest.id]?.[subcat.name]}>{interestBookmarkLoading[interest.id]?.[subcat.name] ? "Adding..." : "Add Bookmark"}</button>
                                    {interestBookmarkMessages[interest.id]?.[subcat.name] && (
                                      <div className={`text-sm mt-1 text-center ${interestBookmarkMessages[interest.id][subcat.name].startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{interestBookmarkMessages[interest.id][subcat.name]}</div>
                                    )}
                                  </form>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 italic text-sm py-2 text-center">No subcategories yet.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Edit Bookmark Modal for Interest Bookmarks */}
      {activeTab === "interests" && editInterestBookmarkModal.interestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 w-full max-w-xs relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" onClick={closeEditInterestBookmarkModal} aria-label="Close"><X /></button>
            <div className="mb-3 font-semibold text-gray-800 dark:text-gray-100 text-lg text-center">Edit Bookmark</div>
            <input type="text" className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:text-white mb-2" value={editInterestBookmarkModal.bookmark?.name || ''} onChange={e => handleEditInterestBookmarkChange('name', e.target.value)} />
            <input type="url" className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:text-white mb-3" value={editInterestBookmarkModal.bookmark?.link || ''} onChange={e => handleEditInterestBookmarkChange('link', e.target.value)} />
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded px-3 py-1 font-semibold" onClick={handleEditInterestBookmarkSave}>Save</button>
          </div>
        </div>
      )}
      {/* Delete Bookmark Confirm Modal for Interest Bookmarks */}
      {activeTab === "interests" && deleteInterestBookmarkConfirm.interestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 w-full max-w-xs relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" onClick={() => setDeleteInterestBookmarkConfirm({})} aria-label="Close"><X /></button>
            <div className="mb-3 font-semibold text-gray-800 dark:text-gray-100 text-lg text-center">Confirm Delete</div>
            <div className="mb-4 text-center text-gray-700 dark:text-gray-200">Delete bookmark &quot;{deleteInterestBookmarkConfirm.bookmark?.name}&quot;?</div>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white rounded px-3 py-1 font-semibold mb-2" onClick={() => handleDeleteInterestBookmark(deleteInterestBookmarkConfirm)}>Delete</button>
            <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 rounded px-3 py-1 font-semibold" onClick={() => setDeleteInterestBookmarkConfirm({})}>Cancel</button>
          </div>
        </div>
      )}
      {/* Delete Category Confirm Modal */}
      {deleteCategoryConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 w-full max-w-xs relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" onClick={() => setDeleteCategoryConfirm(null)} aria-label="Close"><X /></button>
            <div className="mb-3 font-semibold text-gray-800 dark:text-gray-100 text-lg text-center">Confirm Delete</div>
            <div className="mb-4 text-center text-gray-700 dark:text-gray-200">
              Delete category &quot;{deleteCategoryConfirm.name}&quot; and all its subcategories &amp; bookmarks?
            </div>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white rounded px-3 py-1 font-semibold mb-2" onClick={() => handleDeleteCategory(deleteCategoryConfirm.name)}>Delete</button>
            <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 rounded px-3 py-1 font-semibold" onClick={() => setDeleteCategoryConfirm(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSubcategory;
