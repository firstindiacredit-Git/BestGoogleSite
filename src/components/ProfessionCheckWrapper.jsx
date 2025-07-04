import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ProfessionalSelection from "./ProfessionalSelection";
import { Routes } from "react-router-dom";

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
          } else {
            setUserProfession(null);
          }
        } catch (error) {
          setUserProfession(null);
        }
      } else {
        setUserProfession(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Jab tak profession nahi mile, tab tak ProfessionalSelection dikhao
  if (!userProfession) {
    return <ProfessionalSelection />;
  }

  // Profession mil gaya toh main app dikhao
  return children;
};

export default ProfessionCheckWrapper; 