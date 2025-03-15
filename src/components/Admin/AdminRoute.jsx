import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AdminSkeleton = () => (
  <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="animate-pulse space-y-8">
        {/* Logo/Brand skeleton */}
        <div className="flex justify-center mb-12">
          <div className="w-40 h-8 bg-gray-200 rounded"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 p-6 rounded-sm">
              <div className="w-16 h-3 bg-gray-200 rounded mb-4"></div>
              <div className="w-24 h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="bg-gray-100 rounded-sm p-6">
          <div className="w-48 h-4 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-full h-4 bg-gray-200 rounded"></div>
                  <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bg-gray-100 rounded-sm p-6">
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="w-full h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user document from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Show skeleton only while checking auth
  if (isAdmin === null) {
    return <AdminSkeleton />;
  }

  // Redirect to login if not admin
  if (!isAdmin) {
    return <Navigate to="/search" />;
  }

  // Show actual admin content when authenticated
  return children;
};

export default AdminRoute;
