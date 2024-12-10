import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updatePassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const ProfilePage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

    const navigate = useNavigate();

 const [userId, setUserId] = useState(null);
 const [userPin, setUserPin] = useState("");
 const [newPin, setNewPin] = useState(["", "", "", ""]);

 const fetchUserPin = async (userId) => {
   try {
     const docRef = doc(db, "users", userId);
     const docSnap = await getDoc(docRef);
     if (docSnap.exists()) {
       setUserPin(docSnap.data().pin || "0000"); // Default pin if not set
     } else {
       console.log("No user data found!");
     }
   } catch (error) {
     console.error("Error fetching user pin:", error);
   }
 };

 const saveNewPin = async (newPin) => {
   try {
     const userRef = doc(db, "users", userId);
     await updateDoc(userRef, {
       pin: newPin,
     });
     setUserPin(newPin);
     alert("PIN updated successfully!");
   } catch (error) {
     console.error("Error saving new pin:", error);
   }
 };

 const handleChangePin = () => {
   const newPinValue = newPin.join("");
   if (newPinValue.length === 4) {
     saveNewPin(newPinValue);
   } else {
     alert("PIN should be 4 digits.");
   }
 };

 const handleInputChange = (e, index) => {
   const value = e.target.value;
   if (value.length > 1) return;

   const updatedPin = [...newPin];
   updatedPin[index] = value;
   setNewPin(updatedPin);

   if (value && index < 3) {
     document.getElementById(`pin-input-${index + 1}`).focus();
   }
 };

 useEffect(() => {
   const unsubscribe = auth.onAuthStateChanged((user) => {
     if (user) {
       setUserId(user.uid);
       fetchUserPin(user.uid);
     } else {
       setUserId(null);
       setUserPin("");
     }
   });

   return () => unsubscribe();
 }, []);

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
      const currentUser = auth.currentUser;

      if (currentUser) {
        await updateProfile(currentUser, { displayName: username });

        const userDoc = doc(db, "users", currentUser.uid);
        await setDoc(userDoc, { username }, { merge: true });

        setSuccess("Username updated successfully!");
        setDisplayName(username);
      }
    } catch (err) {
      setError("Failed to update username.");
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
      setNewPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); 
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setError("Please select an avatar to upload.");
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
   
        if (photoURL) {
          const oldAvatarRef = ref(storage, `avatars/${photoURL}`);
          await deleteObject(oldAvatarRef); 
        }

       
        const avatarRef = ref(storage, `avatars/${avatarFile.name}`);
        await uploadBytes(avatarRef, avatarFile);

        const avatarURL = await getDownloadURL(avatarRef);
        await updateProfile(currentUser, { photoURL: avatarURL });

        const userDoc = doc(db, "users", currentUser.uid);
        await setDoc(userDoc, { photoURL: avatarURL }, { merge: true });

        setPhotoURL(avatarURL);
        setSuccess("Avatar uploaded successfully!");
      }
    } catch (err) {
      console.error("Error uploading avatar:", err.message);
      setError("Failed to upload avatar.");
    }
  };
  const goBack = () => {
    navigate(-1); 
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>

          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}

          <div className="flex items-center justify-center mb-6">
            <img
              src={
                avatarPreview || photoURL || "https://via.placeholder.com/150"
              }
                           className="w-24 h-24 rounded-full object-cover shadow"
              placeholder="Loading..."
            />
          </div>

          <div className="mb-2">
            <label htmlFor="username" className="block font-medium mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
                           className="w-full border p-1 rounded dark:bg-gray-700 dark:text-white"
              placeholder="Loading..."
            />
            <button
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
              disabled
              placeholder="Loading..."
              className="w-full border p-1 rounded bg-gray-200 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
            />
          </div>

          <div className="mb-2">
            <label htmlFor="newPassword" className="block font-medium mb-2">
              Change Password
            </label>
            <div className="relative">
              <input
                              className="w-full border p-1 rounded dark:bg-gray-700 dark:text-white"
                placeholder="Loading..."
              />
              <button
                               className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            <button
                           className="mt-2 bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white flex items-center justify-center">
      <button
        onClick={goBack}
        className="absolute top-4 left-4 text-blue-600 border border-blue-600 px-6 py-1 rounded hover:text-white hover:bg-blue-600"
      >
        Back
      </button>
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-1">Profile</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <div className="flex items-center justify-center mb-1">
          <img
            src={avatarPreview || photoURL || "https://via.placeholder.com/150"}
            alt="User Avatar"
            className="w-24 h-24 rounded-full object-cover shadow"
          />
        </div>

        <div className="mb-2">
          <label htmlFor="username" className="block font-medium">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
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
          <label htmlFor="email" className="block font-medium">
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
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          <button
            onClick={handleChangePassword}
            className="mt-2 bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded"
          >
            Update Password
          </button>
        </div>
        <div>
          <div>
            {/* Password Section (for changing PIN) */}
            {userId && (
              <div>
                <h2 className="text-xl font-semibold mb-1">Change PIN</h2>
                <div className="relative mb-2 flex space-x-2">
                  {newPin.map((digit, index) => (
                    <input
                      key={index}
                      id={`pin-input-${index}`}
                      type={showPin ? "text" : "password"}
                      value={digit}
                      maxLength="1"
                      onChange={(e) => handleInputChange(e, index)}
                      className="w-10 h-10 text-center text-2xl border p-1 rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="inset-y-0 right-5 flex items-center text-gray-500 dark:text-gray-400"
                  >
                    {showPin ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>

                <button
                  onClick={handleChangePin}
                  className="mt-1 bg-green-500 hover:bg-green-600 text-white py-1 px-10 rounded"
                >
                  Update PIN
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
