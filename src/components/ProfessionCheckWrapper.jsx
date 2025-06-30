import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ProfessionalSelection from "./ProfessionalSelection";

const ProfessionCheckWrapper = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfession, setUserProfession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserProfession(userData.profession);
          }
        } catch (error) {
          console.error("Error fetching user profession:", error);
        }
      } else {
        setUserProfession(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is not logged in, show the children (normal page)
  if (!user) {
    return children;
  }

  // If user is logged in but hasn't selected profession, show profession selection
  if (!userProfession) {
    return <ProfessionalSelection />;
  }

  // If user is logged in and has selected profession, show the normal page
  return children;
};

export default ProfessionCheckWrapper; 