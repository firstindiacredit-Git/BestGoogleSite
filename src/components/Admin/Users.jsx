import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { CiGrid31, CiCircleList } from "react-icons/ci";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewType, setViewType] = useState("list"); // New state for view type
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

  // Create array of page numbers
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="p-6 flex-1 dark:bg-gray-900 dark:text-white">
          <h1 className="text-2xl font-bold mb-6 text-center">All Users</h1>

          {/* Toggle View Buttons */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setViewType("list")}
              className={`px-4 py-2 mr-2 ${
                viewType === "list"
                  ? "bg-blue-500  text-white"
                  : "bg-gray-200 dark:bg-gray-700 dark:text-white"
              } rounded`}
            >
              <CiCircleList />
            </button>
            <button
              onClick={() => setViewType("grid")}
              className={`px-4 py-2 ${
                viewType === "grid"
                  ? "bg-blue-500  text-white"
                  : "bg-gray-200 dark:bg-gray-700 dark:text-white text-black"
              } rounded`}
            >
              <CiGrid31 />
            </button>
          </div>

          {/* Users Display */}
          <div
            className={`grid ${viewType === "grid" ? "grid-cols-3 gap-4" : ""}`}
          >
            {currentUsers.map(({ id, photoURL, displayName, email, bio }) => (
              <div
                key={id}
                className={`${
                  viewType === "grid"
                    ? "flex flex-col items-center border p-4 bg-white dark:bg-gray-800  shadow-md rounded-lg"
                    : "flex items-center p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg mb-4"
                }`}
              >
                <img
                  src={photoURL || "/default-avatar.png"}
                  alt="User Avatar"
                  className={`${
                    viewType === "grid"
                      ? "h-[80px] w-[80px]"
                      : "h-[60px] w-[60px]"
                  } rounded-full border border-gray-300 dark:border-gray-600 mb-2`}
                />
                <div className="text-center flex-1">
                  <div className="text-xl font-semibold">
                    {displayName || "No Name"}
                  </div>
                  <p className="text-gray-500 dark:text-blue-600">{email}</p>
                  {bio && (
                    <p className="text-gray-600 dark:text-blue-400 italic">
                      {bio}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-4 space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded disabled:opacity-50"
            >
              Previous
            </button>
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`px-4 py-2 rounded ${
                  currentPage === number
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
