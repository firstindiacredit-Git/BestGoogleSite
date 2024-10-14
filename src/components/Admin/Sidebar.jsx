import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdOutlineAddLink } from "react-icons/md";
import { LuUser2 } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Sidebar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dispName, setDispName] = useState("");
  const [link, setLink] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.role === "admin") {
            setIsAdmin(true);
            setLink(userData.photoURL || "/default-avatar.png");
            setDispName(userData.displayName);
          } else {
            navigate("../Admin/login");
          }
        }
      }
      setLoading(false); // Set loading to false if user is not logged in or data is fetched
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="w-64 h-auto bg-gray-800 text-white">
      <div className="p-4 text-2xl font-bold">Admin Panel</div>

      <div className="flex items-center mt-6 p-2 bg-gray-700 rounded">
        <img
          src={link}
          className="h-16 w-16 justify-center m-auto flex-shrink-0 rounded-full"
          alt="Avatar"
        />
      </div>
      <div className="flex items-center p-2 bg-gray-700 rounded">
        <span className=" m-auto justify-center w-auto flex">
          {dispName || "User"}
        </span>
      </div>
      <nav className="mt-4">
        <ul>
          <li className="p-4  mx-10">
            <Link
              to="/admin/dashboard"
              className="hover:bg-gray-700 p-2  flex rounded"
            >
              <LuLayoutDashboard className="mt-1 mr-1" />
              Dashboard
            </Link>
          </li>
          <li className="p-4 mx-10">
            <Link
              to="/admin/users"
              className="hover:bg-gray-700 p-2 flex rounded"
            >
              <LuUser2 className="mt-1 mr-1" />
              Users
            </Link>
          </li>
          <li className="p-4 mx-10">
            <Link
              to="/admin/AddLinks"
              className="hover:bg-gray-700 p-2 flex rounded"
            >
              <MdOutlineAddLink className="mt-1 mr-1" />
              Add Links
            </Link>
          </li>
          <li className="p-4 mx-10">
            <Link to="/settings" className="hover:bg-gray-700 p-2 flex rounded">
              <IoSettingsOutline className="mt-1 mr-1" />
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
