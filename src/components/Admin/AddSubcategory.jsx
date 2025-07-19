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
  const [categories] = useState(Object.keys(defaultBookmarks));
  const [subcategoriesMap, setSubcategoriesMap] = useState({});
  const [subcatForms, setSubcatForms] = useState({});
  const [subcatMessages, setSubcatMessages] = useState({});
  const [subcatLoading, setSubcatLoading] = useState({});
  const [bookmarkForms, setBookmarkForms] = useState({});
  const [bookmarkMessages, setBookmarkMessages] = useState({});
  const [bookmarkLoading, setBookmarkLoading] = useState({});
  const [showBookmarkModal, setShowBookmarkModal] = useState({}); // { category: { subcat: bool } }
  const [editSubcatModal, setEditSubcatModal] = useState({}); // { category, subcat, value }
  const [editBookmarkModal, setEditBookmarkModal] = useState({}); // { category, subcat, bookmark }
  const [deleteConfirm, setDeleteConfirm] = useState({}); // { type: 'subcat'|'bookmark', category, subcat, bookmark }
  // Update subcategory data model to { name, iconUrl }
  // Add 'iconUrl' input to add/edit forms, and render icon in UI
  const [subcatIconForms, setSubcatIconForms] = useState({}); // { category: iconUrl }
  // Add a new state to store bookmarks per subcategory for admin view
  const [adminBookmarksMap, setAdminBookmarksMap] = useState({}); // { category: { subcat: [bookmarks] } }
  const [openSubcats, setOpenSubcats] = useState({}); // { category: { subcat: true/false } }

  // Fetch subcategories for all categories from Firestore
  useEffect(() => {
    const unsubscribes = [];
    categories.forEach(category => {
      const categoryQuery = query(collection(db, "category"), where("newCategory", "==", category));
      const unsubscribe = onSnapshot(categoryQuery, (snapshot) => {
        setSubcategoriesMap(prev => {
          if (!snapshot.empty) {
            const docData = snapshot.docs[0].data();
            return { ...prev, [category]: Array.isArray(docData.subcategories) ? docData.subcategories : [] };
          } else {
            const imported = defaultBookmarks[category];
            if (imported && typeof imported === 'object' && !Array.isArray(imported)) {
              return { ...prev, [category]: Object.keys(imported) };
            }
            return { ...prev, [category]: [] };
          }
        });
      });
      unsubscribes.push(unsubscribe);
    });
    return () => unsubscribes.forEach(unsub => unsub());
  }, [categories]);

  // Fetch bookmarks for each subcategory for admin view
  useEffect(() => {
    const unsubscribes = [];
    categories.forEach(category => {
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
  }, [categories, subcategoriesMap]);

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
      if (snapshot.empty) {
        setSubcatMessages(prev => ({ ...prev, [category]: "Category not found." }));
        setSubcatLoading(prev => ({ ...prev, [category]: false }));
        return;
      }
      const categoryId = snapshot.docs[0].id;
      const categoryDocRef = doc(db, "category", categoryId);
      // Add subcategory as object
      const prevSubcats = snapshot.docs[0].data().subcategories || [];
      await updateDoc(categoryDocRef, {
        subcategories: [...prevSubcats, { name: subcategory, iconUrl: iconUrl || "" }]
      });
      await addDoc(collection(db, "links"), {
        category: categoryId,
        subcategory,
        name: "[Empty]",
        link: "#",
        addedByAdmin: true,
      });
      setSubcatMessages(prev => ({ ...prev, [category]: "✅ Subcategory added!" }));
      setSubcatForms(prev => ({ ...prev, [category]: "" }));
      setSubcatIconForms(prev => ({ ...prev, [category]: "" }));
    } catch {
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
    } catch {
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

  // Edit subcategory handlers
  const openEditSubcatModal = (category, subcat) => setEditSubcatModal({ category, subcat, value: subcat });
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
        return { name: value.trim(), iconUrl: iconUrl || '' };
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
  const openEditBookmarkModal = (category, subcat, bookmark) => setEditBookmarkModal({ category, subcat, bookmark: { ...bookmark } });
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

  return (
    <div className="min-h-screen flex flex-col items-center bg-white dark:bg-gray-900 py-8">
      <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-100">Manage Categories, Subcategories & Bookmarks</h2>
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map(category => (
          <div key={category} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6 flex flex-col">
            <h3 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-300">{category}</h3>
            {/* Subcategory add form */}
            <form className="flex gap-2 mb-4 flex-wrap" onSubmit={e => handleAddSubcategory(e, category)}>
              <input
                type="text"
                placeholder="Add subcategory"
                className="border rounded px-3 py-1 flex-1 dark:bg-gray-800 dark:text-white"
                value={subcatForms[category] || ""}
                onChange={e => handleSubcatInputChange(category, e.target.value)}
              />
              <input
                type="url"
                placeholder="Icon URL (optional)"
                className="border rounded px-3 py-1 flex-1 dark:bg-gray-800 dark:text-white"
                value={subcatIconForms[category] || ""}
                onChange={e => setSubcatIconForms(prev => ({ ...prev, [category]: e.target.value }))}
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-1 font-semibold disabled:opacity-60"
                disabled={subcatLoading[category]}
              >
                {subcatLoading[category] ? "Adding..." : "Add"}
              </button>
            </form>
            {subcatMessages[category] && (
              <div className={`mb-2 text-center ${subcatMessages[category].startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{subcatMessages[category]}</div>
            )}
            {/* Subcategory list */}
            {subcategoriesMap[category] && subcategoriesMap[category].length > 0 ? (
              <div className="flex flex-col gap-4">
                {subcategoriesMap[category].map(subcatObj => {
                  const subcat = typeof subcatObj === 'string' ? subcatObj : subcatObj.name;
                  const iconUrl = typeof subcatObj === 'object' ? subcatObj.iconUrl : '';
                  return (
                    <div key={subcat} className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
                      <div
                        className="flex items-center gap-3 mb-2 justify-between cursor-pointer"
                        onClick={() => toggleSubcat(category, subcat)}
                      >
                        <div className="flex items-center gap-3">
                          {/* Chevron icon for expand/collapse */}
                          <span className={`transition-transform ${openSubcats[category]?.[subcat] ? "rotate-90" : ""}`}>
                            ▶
                          </span>
                          {iconUrl ? (
                            <img src={iconUrl} alt="icon" className="w-7 h-7 rounded object-cover border border-gray-200 dark:border-gray-700" />
                          ) : (
                            <Folder className="w-5 h-5 text-blue-400 dark:text-blue-300" />
                          )}
                          <span className="truncate font-medium text-gray-800 dark:text-gray-100">{subcat}</span>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => openEditSubcatModal(category, subcat)} title="Edit Subcategory"><Pencil className="w-4 h-4" /></button>
                          <button type="button" className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900" onClick={() => setDeleteConfirm({ type: 'subcat', category, subcat })} title="Delete Subcategory"><Trash2 className="w-4 h-4 text-red-600" /></button>
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
                              className="absolute top-2 w-4 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                              onClick={() => closeBookmarkModal(category, subcat)}
                              aria-label="Close"
                            >
                              ×
                            </button>
                            <div className="mb-3 font-semibold text-gray-800 dark:text-gray-100 text-lg text-center">
                              Add Bookmark to <span className="text-blue-600 dark:text-blue-300">{subcat}</span>
        </div>
                            <form className="flex flex-col gap-2" onSubmit={e => handleAddBookmark(e, category, subcat)}>
          <input
            type="text"
                              placeholder="Bookmark name"
                              className="border rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
                              value={bookmarkForms[category]?.[subcat]?.name || ""}
                              onChange={e => handleBookmarkInputChange(category, subcat, "name", e.target.value)}
                            />
                            <input
                              type="url"
                              placeholder="https://example.com"
                              className="border rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
                              value={bookmarkForms[category]?.[subcat]?.link || ""}
                              onChange={e => handleBookmarkInputChange(category, subcat, "link", e.target.value)}
                            />
        <button
          type="submit"
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1 font-semibold disabled:opacity-60"
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
        ))}
      </div>
      {editSubcatModal.category && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 w-full max-w-xs relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" onClick={closeEditSubcatModal} aria-label="Close"><X /></button>
            <div className="mb-3 font-semibold text-gray-800 dark:text-gray-100 text-lg text-center">Edit Subcategory</div>
            <input type="text" className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:text-white mb-2" value={editSubcatModal.value} onChange={e => handleEditSubcatChange(e.target.value)} />
            <input type="url" className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:text-white mb-2" placeholder="Icon URL (optional)" value={editSubcatModal.iconUrl || ''} onChange={e => handleEditSubcatChangeIcon(e.target.value)} />
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
    </div>
  );
};

export default AddSubcategory;
