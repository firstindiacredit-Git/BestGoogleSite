import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
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
      const userRole = userDocSnap.data().role;
      if (userRole === "admin") {
        // Admin specific logic
        console.log("Admin user logged in");
      } else {
        // Non-admin users can be redirected or given limited access
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

export { db, auth, provider };
