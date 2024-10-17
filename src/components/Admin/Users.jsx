import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 15;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (err) {
        console.error("Error fetching users: ", err);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        fetchUsers();
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="p-6 flex-1">
          <h1 className="text-2xl font-bold mb-6 text-center">All Users</h1>
          <div className="flex flex-col">
            {currentUsers.map(({ id, photoURL, displayName, email, bio }) => (
              <div
                key={id}
                className="flex items-center p-4 bg-white shadow-md rounded-lg mb-4"
              >
                <img
                  src={photoURL || "/default-avatar.png"}
                  alt="User Avatar"
                  className="h-[60px] w-[60px] rounded-full border border-gray-300 dark:border-gray-600 mr-4"
                />
                <div className="flex-1">
                  <div className="text-xl font-semibold">
                    {displayName || "No Name"}
                  </div>
                  <p className="text-gray-500">{email}</p>
                  {bio && <p className="text-gray-600 italic">{bio}</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
