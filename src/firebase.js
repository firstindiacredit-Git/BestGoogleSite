import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Firebase Storage initialization

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase app and services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app); // Firebase Storage initialization

// User State Listener and Firestore Sync
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // Create a new Firestore document for the user
      try {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          subscriptionStatus: "free",
          createdAt: new Date(),
          lastLoginAt: new Date(),
          preferences: {
            theme: "light",
            notifications: true,
          },
          bookmarks: [],
          profile: {},
          role: "user",
        });
      } catch (error) {
        console.error("Error creating user document: ", error);
      }
    } else {
      // Update last login time and handle roles
      const userRole = userDocSnap.data().role;
      if (userRole === "admin") {
        console.log("Admin user logged in");
      } else {
        console.log("Non-admin user logged in");
      }
      try {
        await setDoc(
          userDocRef,
          {
            lastLoginAt: new Date(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Error updating last login time: ", error);
      }
    }
  }
});

// Export Firebase services
export { db, auth, provider, storage };
