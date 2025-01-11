import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import Header from "./Header";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewType, setViewType] = useState("list");
  const usersPerPage = 15;

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        fetchUsers();
      }
    });

    return () => unsubscribe();
  }, []);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="p-6 bg-gray-100 dark:bg-[#080318] min-h-screen">
      <Header />
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <>
          {/* View Type Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setViewType("grid")}
              className={`p-2 rounded ${
                viewType === "grid" ? "bg-white dark:bg-gray-600 shadow-sm" : ""
              }`}
            >
              <svg
                className="w-5 h-5 dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewType("list")}
              className={`p-2 rounded ${
                viewType === "list" ? "bg-white dark:bg-gray-600 shadow-sm" : ""
              }`}
            >
              <svg
                className="w-5 h-5 dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Users Display */}
          <div
            className={`grid ${viewType === "grid" ? "grid-cols-3 gap-4" : ""}`}
          >
            {currentUsers.map(
              ({ id, photoURL, displayName, email, bio, role }) => (
                <div
                  key={id}
                  className={`${
                    viewType === "grid"
                      ? "flex flex-col items-center border p-4 bg-white dark:bg-indigo-800 shadow-md rounded-lg"
                      : "flex items-center p-4 bg-white dark:bg-indigo-800 shadow-md rounded-lg mb-4"
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
                    <p className="text-gray-500 dark:text-indigo-600">{email}</p>
                    {bio && (
                      <p className="text-gray-600 dark:text-blue-400 italic">
                        {bio}
                      </p>
                    )}
                    <p className="text-sm mt-2">
                      <span className="font-semibold">Role:</span>{" "}
                      <span
                        className={`${
                          role === "admin"
                            ? "text-red-500"
                            : "text-black dark:text-gray-300"
                        }`}
                      >
                        {role || "User"}
                      </span>
                    </p>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-4 space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 dark:bg-indigo-800 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 dark:bg-indigo-800 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
