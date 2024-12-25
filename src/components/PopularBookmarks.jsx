import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Spin } from "antd";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

function PopularBookmarks() {
  const [categories, setCategories] = useState([]);
  const [links, setLinks] = useState([]);
  const [user, setUser] = useState(null);
  const [hiddenBookmarkIds, setHiddenBookmarkIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGridView, setIsGridView] = useState(true);

  // Track auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch categories, links and hidden bookmarks
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch hidden bookmarks
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const hiddenIds = userDocSnap.exists()
          ? userDocSnap.data().hiddenBookmarkIds || []
          : [];
        setHiddenBookmarkIds(hiddenIds);

        // Fetch categories
        const categorySnapshot = await getDocs(collection(db, "category"));
        const categoryList = categorySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoryList);

        // Fetch links
        const linksSnapshot = await getDocs(collection(db, "links"));
        const linksList = linksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isHidden: hiddenIds.includes(doc.id),
        }));
        setLinks(linksList);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const toggleBookmarkVisibility = async (bookmarkId) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      let updatedHiddenIds = [...hiddenBookmarkIds];

      if (hiddenBookmarkIds.includes(bookmarkId)) {
        updatedHiddenIds = updatedHiddenIds.filter((id) => id !== bookmarkId);
      } else {
        updatedHiddenIds.push(bookmarkId);
      }

      await setDoc(userDocRef, { hiddenBookmarkIds: updatedHiddenIds }, { merge: true });
      setHiddenBookmarkIds(updatedHiddenIds);

      // Update links state
      setLinks(prevLinks =>
        prevLinks.map(link =>
          link.id === bookmarkId
            ? { ...link, isHidden: !link.isHidden }
            : link
        )
      );
    } catch (error) {
      console.error("Error toggling bookmark visibility:", error);
    }
  };

  const getFavicon = (url) => {
    try {
      return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=64`;
    } catch (error) {
      return "https://www.freeiconspng.com/uploads/web-icon-black-png-planet-web-world-icon-17.png";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Popular Bookmarks</h1>
        <button
          onClick={() => setIsGridView(!isGridView)}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {isGridView ? "List View" : "Grid View"}
        </button>
      </div>

      {isGridView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto items-start">
          {categories.map((category) => {
            const categoryLinks = links.filter(link => link.category === category.id);
            if (categoryLinks.length === 0) return null;

            return (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-fit"
                style={{ borderColor: category.color || '#ffffff' }}
              >
                <div className="flex flex-col h-full">
                  <div 
                    className="p-4 flex justify-between font-medium text-gray-800 dark:text-white"
                    style={{ backgroundColor: category.color || '#ffffff', color: category.color ? '#ffffff' : '#000000' }}
                  >
                    <div>{category.newCategory}</div>
                    <div>{categoryLinks.length}</div>
                  </div>
                  <div className="max-h-[20rem] overflow-y-auto">
                    {categoryLinks.map((link) => (
                      <div
                        key={link.id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          link.isHidden ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <a
                            href={link.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 flex-1"
                          >
                            <img
                              src={getFavicon(link.link)}
                              alt=""
                              className="w-5 h-5"
                              onError={(e) => {
                                e.target.src = "https://www.freeiconspng.com/uploads/web-icon-black-png-planet-web-world-icon-17.png";
                              }}
                            />
                            <span className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                              {link.name}
                            </span>
                          </a>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleBookmarkVisibility(link.id);
                            }}
                            className="ml-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                          >
                            {link.isHidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => {
            const categoryLinks = links.filter(link => link.category === category.id);
            if (categoryLinks.length === 0) return null;

            return (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                style={{ borderColor: category.color || '#ffffff' }}
              >
                <div 
                  className="p-4 flex justify-between font-medium text-gray-800 dark:text-white"
                  style={{ backgroundColor: category.color || '#ffffff', color: category.color ? '#ffffff' : '#000000' }}
                >
                  <div>{category.newCategory}</div>
                  <div>{categoryLinks.length}</div>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {categoryLinks.map((link) => (
                    <div
                      key={link.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        link.isHidden ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <a
                          href={link.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 flex-1"
                        >
                          <img
                            src={getFavicon(link.link)}
                            alt=""
                            className="w-5 h-5"
                            onError={(e) => {
                              e.target.src = "https://www.freeiconspng.com/uploads/web-icon-black-png-planet-web-world-icon-17.png";
                            }}
                          />
                          <span className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                            {link.name}
                          </span>
                        </a>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleBookmarkVisibility(link.id);
                          }}
                          className="ml-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                          {link.isHidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PopularBookmarks;
