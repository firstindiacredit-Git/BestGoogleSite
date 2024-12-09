import React, { useState } from "react";
import { updatePassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";

const ProfilePage = () => {
  const [username, setUsername] = useState(auth.currentUser?.displayName || "");
  const [email, setEmail] = useState(auth.currentUser?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [photoURL, setPhotoURL] = useState(auth.currentUser?.photoURL || "");

  const handleUpdateUsername = async () => {
    setError("");
    setSuccess("");
    if (!username) {
      setError("Username cannot be empty.");
      return;
    }
    try {
      await updateProfile(auth.currentUser, { displayName: username });
      setSuccess("Username updated successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    try {
      await updatePassword(auth.currentUser, newPassword);
      setSuccess("Password updated successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        {/* Avatar Section */}
        <div className="flex items-center justify-center mb-6">
          <img
            src={photoURL || "https://via.placeholder.com/150"}
            alt="User Avatar"
            className="w-24 h-24 rounded-full object-cover shadow"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="username" className="block font-medium mb-2">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleUpdateUsername}
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Update Username
          </button>
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            disabled
            className="w-full border p-2 rounded bg-gray-200 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="newPassword" className="block font-medium mb-2">
            Change Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleChangePassword}
            className="mt-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
