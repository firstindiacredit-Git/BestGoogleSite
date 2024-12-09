import React, { useState, useEffect } from "react";
import { updatePassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const ProfilePage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid) => {
    try {
      const userDoc = doc(db, "users", uid);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setUsername(userData.username || "");
      }
    } catch (err) {
      console.error("Error fetching user data:", err.message);
      setError("Failed to load user data.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email || "");
        setPhotoURL(user.photoURL || "");
        setDisplayName(user.displayName || "");
        fetchUserData(user.uid);
      } else {
        setEmail("");
        setPhotoURL("");
        setUsername("");
        setDisplayName("");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateUsername = async () => {
    setError("");
    setSuccess("");

    if (!username) {
      setError("Username cannot be empty.");
      return;
    }

    try {
      const userDoc = doc(db, "users", auth.currentUser.uid);
      await setDoc(userDoc, { username }, { merge: true });

      if (!displayName) {
        await updateProfile(auth.currentUser, { displayName: username });
      }

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
      setNewPassword(""); // Clear password field
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <div className="flex items-center justify-center mb-6">
          <img
            src={photoURL || "https://via.placeholder.com/150"}
            alt="User Avatar"
            className="w-24 h-24 rounded-full object-cover shadow"
          />
        </div>

        <div className="mb-2">
          <label htmlFor="username" className="block font-medium mb-2">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username || displayName}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border p-1 rounded dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleUpdateUsername}
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded"
          >
            Update Username
          </button>
        </div>

        <div className="mb-2">
          <label htmlFor="email" className="block font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            disabled
            className="w-full border p-1 rounded bg-gray-200 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
          />
        </div>

        <div className="mb-2">
          <label htmlFor="newPassword" className="block font-medium mb-2">
            Change Password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border p-1 rounded dark:bg-gray-700 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
            >
              {showPassword ? "👁" : "👁‍🗨"}
            </button>
          </div>
          <button
            onClick={handleChangePassword}
            className="mt-2 bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
