import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, deleteField } from "firebase/firestore";
import { initializeUserLayout } from "./widgetLayouts";

// Get custom pages for a user
export const getCustomPages = async (userId) => {
  try {
    if (!userId) {
      console.error("userId is required");
      return [];
    }
    
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.customPages || [];
    }
    return [];
  } catch (error) {
    console.error("Error getting custom pages:", error);
    return [];
  }
};

// Create a new custom page
export const createCustomPage = async (userId, pageData) => {
  try {
    if (!userId) {
      throw new Error("userId is required");
    }
    
    if (!pageData || typeof pageData !== 'object') {
      throw new Error("pageData must be an object");
    }
    
    if (!pageData.name || typeof pageData.name !== 'string') {
      throw new Error("pageData.name must be a string");
    }
    
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    let currentPages = [];
    if (userDoc.exists()) {
      const userData = userDoc.data();
      currentPages = userData.customPages || [];
    }
    
    const newPage = {
      id: Date.now(),
      name: pageData.name,
      widgets: pageData.widgets || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedPages = [...currentPages, newPage];
    
    await setDoc(userDocRef, {
      customPages: updatedPages
    }, { merge: true });
    
    // Initialize layout for the new custom page
    try {
      const userLayoutRef = doc(db, "users", userId, "layouts", "widgets");
      const layoutDoc = await getDoc(userLayoutRef);
      
      let currentLayouts = {};
      if (layoutDoc.exists()) {
        currentLayouts = layoutDoc.data();
      }
      
      // Add layout for the new custom page
      currentLayouts[newPage.id.toString()] = {
        widgets: [],
        columns: 4
      };
      
      await setDoc(userLayoutRef, currentLayouts, { merge: true });
    } catch (layoutError) {
      console.error("Error initializing layout for custom page:", layoutError);
      // Don't fail the page creation if layout initialization fails
    }
    
    return newPage;
  } catch (error) {
    console.error("Error creating custom page:", error);
    throw error;
  }
};

// Update a custom page
export const updateCustomPage = async (userId, pageId, updates) => {
  try {
    if (!userId) {
      throw new Error("userId is required");
    }
    
    if (!pageId) {
      throw new Error("pageId is required");
    }
    
    if (!updates || typeof updates !== 'object') {
      throw new Error("updates must be an object");
    }
    
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document not found");
    }
    
    const currentPages = userDoc.data().customPages || [];
    const updatedPages = currentPages.map(page => 
      page.id === pageId 
        ? { ...page, ...updates, updatedAt: new Date().toISOString() }
        : page
    );
    
    await setDoc(userDocRef, {
      customPages: updatedPages
    }, { merge: true });
    
    return updatedPages.find(page => page.id === pageId);
  } catch (error) {
    console.error("Error updating custom page:", error);
    throw error;
  }
};

// Delete a custom page
export const deleteCustomPage = async (userId, pageId) => {
  try {
    if (!userId) {
      throw new Error("userId is required");
    }
    
    if (!pageId) {
      throw new Error("pageId is required");
    }
    
    console.log(`Deleting custom page: ${pageId} for user: ${userId}`);
    
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document not found");
    }
    
    const currentPages = userDoc.data().customPages || [];
    console.log(`Current pages before deletion:`, currentPages.length);
    
    const updatedPages = currentPages.filter(page => page.id !== pageId);
    console.log(`Pages after deletion:`, updatedPages.length);
    
    await setDoc(userDocRef, {
      customPages: updatedPages
    }, { merge: true });
    
    console.log(`Page ${pageId} deleted from customPages array`);
    
    // Clean up layout for the deleted custom page
    try {
      const userLayoutRef = doc(db, "users", userId, "layouts", "widgets");
      await setDoc(userLayoutRef, {
        [pageId.toString()]: deleteField()
      }, { merge: true });
      console.log(`Layout for page ${pageId} deleted from Firestore`);
    } catch (layoutError) {
      console.error("Error cleaning up layout for deleted page:", layoutError);
      // Don't fail the page deletion if layout cleanup fails
    }
    
    console.log(`Page ${pageId} deleted successfully from Firebase`);
    return true;
  } catch (error) {
    console.error("Error deleting custom page:", error);
    throw error;
  }
};

// Get a specific custom page by ID
export const getCustomPageById = async (userId, pageId) => {
  try {
    if (!userId || !pageId) {
      return null;
    }
    
    const pages = await getCustomPages(userId);
    return pages.find(page => page.id === pageId);
  } catch (error) {
    console.error("Error getting custom page by ID:", error);
    return null;
  }
};

// Sync localStorage pages to Firebase (for migration)
export const syncLocalPagesToFirebase = async (userId) => {
  try {
    if (!userId) {
      return false;
    }
    
    const localPages = JSON.parse(localStorage.getItem("customPages") || "[]");
    if (localPages.length > 0) {
      const userDocRef = doc(db, "users", userId);
      await setDoc(userDocRef, {
        customPages: localPages
      }, { merge: true });
      
      // Clear localStorage after successful sync
      localStorage.removeItem("customPages");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error syncing local pages to Firebase:", error);
    return false;
  }
}; 