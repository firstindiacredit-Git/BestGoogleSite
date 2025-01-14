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
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const usersPerPage = 15;

  const getInitialAvatar = (name) => {
    if (!name)
      return <img src="/unnamed.png" alt="user" className=" rounded-full" />;
    const initial = name.charAt(0).toUpperCase();
    const colors = [
      "bg-blue-500",
      "bg-red-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const colorIndex = name.length % colors.length;
    return (
      <div
        className={`${colors[colorIndex]} w-full h-full rounded-full flex items-center justify-center`}
      >
        <span className="text-white text-2xl font-semibold">{initial}</span>
      </div>
    );
  };

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort users by role (admins first) and then by displayName
      usersList.sort((a, b) => {
        if ((a.role === "admin") === (b.role === "admin")) {
          return (a.displayName || "").localeCompare(b.displayName || "");
        }
        return a.role === "admin" ? -1 : 1;
      });
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

  // Filter users based on search term and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (roleFilter === "all") return matchesSearch;
    if (roleFilter === "admin") return matchesSearch && user.role === "admin";
    if (roleFilter === "user") return matchesSearch && user.role !== "admin";

    return matchesSearch;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Group users by role
  const groupedUsers = currentUsers.reduce((groups, user) => {
    const role = user.role === "admin" ? "admin" : "user";
    if (!groups[role]) {
      groups[role] = [];
    }
    groups[role].push(user);
    return groups;
  }, {});

  return (
    <div className="bg-gray-100 dark:bg-[#28283A] min-h-screen">
      <div className="sticky top-0 z-10 bg-white dark:bg-[#37375d] shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex items-center w-full justify-between space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Users
              </h1>
              {/* Search Bar */}
              <div className="flex-1 max-w-lg">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#513a7a] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Role Filter Buttons */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#513a7a] p-1 rounded-sm">
                <button
                  onClick={() => setRoleFilter("all")}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    roleFilter === "all"
                      ? "bg-white dark:bg-[#614a8a] text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  All Users
                </button>
                <button
                  onClick={() => setRoleFilter("admin")}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    roleFilter === "admin"
                      ? "bg-white dark:bg-[#614a8a] text-red-500 shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  Admins
                </button>
                <button
                  onClick={() => setRoleFilter("user")}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    roleFilter === "user"
                      ? "bg-white dark:bg-[#614a8a] text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  Users
                </button>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-600 p-1 rounded-sm">
                <button
                  onClick={() => setViewType("grid")}
                  className={`p-2 rounded ${
                    viewType === "grid"
                      ? "bg-white dark:bg-[#513a7a] shadow-sm"
                      : "hover:bg-gray-200/10 dark:hover:bg-gray-700/50"
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
                    viewType === "list"
                      ? "bg-white dark:bg-[#513a7a] shadow-sm"
                      : "hover:bg-gray-200/10 dark:hover:bg-gray-700/50"
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
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center mt-8 bg-red-100 dark:bg-red-900/20 p-4 rounded-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Users Display */}
          <div className="p-5 space-y-8">
            {/* Only show sections based on role filter */}
            {(roleFilter === "all" || roleFilter === "admin") &&
              groupedUsers.admin &&
              groupedUsers.admin.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 px-2">
                    Administrators ({groupedUsers.admin.length})
                  </h2>
                  <div
                    className={`grid ${
                      viewType === "grid"
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                        : "grid-cols-1 gap-4"
                    }`}
                  >
                    {groupedUsers.admin.map(
                      ({ id, photoURL, displayName, email, bio, role }) => (
                        <div
                          key={id}
                          className={`${
                            viewType === "grid"
                              ? "flex flex-col items-center"
                              : "flex items-center justify-between"
                          } p-2 bg-white dark:bg-[#513a7a] shadow-md rounded-sm ${
                            role === "admin" ? "border-l-4 border-red-500" : ""
                          } relative`}
                        >
                          {viewType === "grid" ? (
                            <>
                              <div className="flex flex-col items-center">
                                <div className="relative">
                                  {photoURL ? (
                                    <img
                                      src={photoURL}
                                      alt={`${displayName || "User"}'s avatar`}
                                      className="h-16 w-16 rounded-full border border-gray-300 dark:border-gray-600 object-cover"
                                    />
                                  ) : (
                                    <div className="h-16 w-16 rounded-full border border-gray-300 dark:border-gray-600">
                                      {getInitialAvatar(displayName)}
                                    </div>
                                  )}
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {displayName || "No Name"}
                                  </div>
                                  <p className="text-gray-500 dark:text-indigo-400">
                                    {email}
                                  </p>
                                  {bio && (
                                    <p className="text-gray-600 dark:text-blue-300 italic">
                                      {bio}
                                    </p>
                                  )}
                                  <div className="">
                                    <p className="text-sm ">
                                      <span className="   font-semibold">
                                        Role:
                                      </span>{" "}
                                      <span
                                        className={
                                          role === "admin"
                                            ? "text-red-500"
                                            : "text-gray-600 dark:text-gray-300"
                                        }
                                      >
                                        {role ||
                                          (role === "admin" ? "Admin" : "User")}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center">
                                <div className="relative">
                                  {photoURL ? (
                                    <img
                                      src={photoURL}
                                      alt={`${displayName || "User"}'s avatar`}
                                      className="h-10 w-10 rounded-full border border-gray-300 dark:border-gray-600 object-cover"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full border border-gray-300 dark:border-gray-600">
                                      {getInitialAvatar(displayName)}
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {displayName || "No Name"}
                                  </div>
                                </div>
                              </div>

                              <div className="flex-1 text-center mx-4">
                                <p className="text-gray-500 dark:text-indigo-400">
                                  {email}
                                </p>
                                {bio && (
                                  <p className="text-gray-600 dark:text-blue-300 italic">
                                    {bio}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center">
                                <p className="text-sm whitespace-nowrap">
                                  <span className="font-semibold">Role:</span>{" "}
                                  <span
                                    className={
                                      role === "admin"
                                        ? "text-red-500"
                                        : "text-gray-600 dark:text-gray-300"
                                    }
                                  >
                                    {role ||
                                      (role === "admin" ? "Admin" : "User")}
                                  </span>
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {(roleFilter === "all" || roleFilter === "user") &&
              groupedUsers.user &&
              groupedUsers.user.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 px-2">
                    Users ({groupedUsers.user.length})
                  </h2>
                  <div
                    className={`grid ${
                      viewType === "grid"
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                        : "grid-cols-1 gap-4"
                    }`}
                  >
                    {groupedUsers.user.map(
                      ({ id, photoURL, displayName, email, bio, role }) => (
                        <div
                          key={id}
                          className={`${
                            viewType === "grid"
                              ? "flex flex-col items-center"
                              : "flex items-center justify-between"
                          } p-2 bg-white dark:bg-[#513a7a] shadow-md rounded-sm ${
                            role === "admin" ? "border-l-4 border-red-500" : ""
                          } relative`}
                        >
                          {viewType === "grid" ? (
                            <>
                              <div className="flex flex-col items-center">
                                <div className="relative">
                                  {photoURL ? (
                                    <img
                                      src={photoURL}
                                      alt={`${displayName || "User"}'s avatar`}
                                      className="h-16 w-16 rounded-full border border-gray-300 dark:border-gray-600 object-cover"
                                    />
                                  ) : (
                                    <div className="h-16 w-16 rounded-full border border-gray-300 dark:border-gray-600">
                                      {getInitialAvatar(displayName)}
                                    </div>
                                  )}
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {displayName || "No Name"}
                                  </div>
                                  <p className="text-gray-500 dark:text-indigo-400">
                                    {email}
                                  </p>
                                  {bio && (
                                    <p className="text-gray-600 dark:text-blue-300 italic mt-2">
                                      {bio}
                                    </p>
                                  )}
                                  <div className="mt-2">
                                    <p className="text-sm">
                                      <span className="font-semibold">
                                        Role:
                                      </span>{" "}
                                      <span
                                        className={
                                          role === "admin"
                                            ? "text-red-500"
                                            : "text-gray-600 dark:text-gray-300"
                                        }
                                      >
                                        {role ||
                                          (role === "admin" ? "Admin" : "User")}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center">
                                <div className="relative">
                                  {photoURL ? (
                                    <img
                                      src={photoURL}
                                      alt={`${displayName || "User"}'s avatar`}
                                      className="h-10 w-10 rounded-full border border-gray-300 dark:border-gray-600 object-cover"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full border border-gray-300 dark:border-gray-600">
                                      {getInitialAvatar(displayName)}
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {displayName || "No Name"}
                                  </div>
                                </div>
                              </div>

                              <div className="flex-1 text-center mx-4">
                                <p className="text-gray-500 dark:text-indigo-400">
                                  {email}
                                </p>
                                {bio && (
                                  <p className="text-gray-600 dark:text-blue-300 italic">
                                    {bio}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center">
                                <p className="text-sm whitespace-nowrap">
                                  <span className="font-semibold">Role:</span>{" "}
                                  <span
                                    className={
                                      role === "admin"
                                        ? "text-red-500"
                                        : "text-gray-600 dark:text-gray-300"
                                    }
                                  >
                                    {role ||
                                      (role === "admin" ? "Admin" : "User")}
                                  </span>
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2 pb-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 dark:bg-[#513a7a] rounded disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-[#614a8a] transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 dark:bg-[#513a7a] rounded disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-[#614a8a] transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
