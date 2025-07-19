import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const ProfessionCheckWrapper = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAllowed(false);
        setLoading(false);
        navigate("/", { replace: true });
        return;
      }
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      
      // Check if user has profession (required)
      if (!userData?.profession) {
        setAllowed(false);
        setLoading(false);
        navigate("/professional-selection", { replace: true });
        return;
      }
      
      // User has profession - allow access
      setAllowed(true);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (!allowed) return null;
  return <>{children}</>;
};

export default ProfessionCheckWrapper;