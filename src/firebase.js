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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app); // Firebase Storage initialization

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // Create a new Firestore document for the user with trial info
      try {
        const trialStartDate = new Date();
        const trialEndDate = new Date(trialStartDate);
        trialEndDate.setDate(trialEndDate.getDate() + 30); // 30 days trial

        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          subscriptionStatus: "free",
          trialStartDate: trialStartDate,
          trialEndDate: trialEndDate,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          preferences: {
            theme: "light",
            notifications: true,
          },
          savedTimezones: ["Asia/Kolkata"],
          bookmarks: [],
          profile: {},
          role: "user",
          isTrialExpired: false,
          subscriptionEndDate: null,
          profession: null,
          professionSelectedAt: null,
        });
      } catch (error) {
        console.error("Error creating user document: ", error);
      }
    } else {
      const userData = userDocSnap.data();
      const userRole = userData.role;
      if (userRole !== "admin") {
        const now = new Date();
        const trialEndDate = userData.trialEndDate?.toDate();
        const isTrialExpired = trialEndDate && now > trialEndDate;
        if (isTrialExpired && userData.subscriptionStatus === "trial") {
          await setDoc(
            userDocRef,
            {
              subscriptionStatus: "expired",
              isTrialExpired: true,
              lastLoginAt: now,
            },
            { merge: true }
          );
        } else {
          await setDoc(
            userDocRef,
            {
              lastLoginAt: now,
            },
            { merge: true }
          );
        }
      }
    }
  }
});

export { db, auth, provider, storage };
