import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { updatePassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  FaEye,
  FaEyeSlash,
  FaPen,
  FaCamera,
  FaUser,
  FaLock,
  FaShieldAlt,
  FaCrown,
  FaArrowLeft,
} from "react-icons/fa";
import imageCompression from "browser-image-compression";
import { useSubscription } from "../hooks/useSubscription";
import { Modal, message, Tabs } from "antd";
import Header from "./Header";
import { useTheme } from "../context/ThemeContext";
// https://cdn.dribbble.com/userupload/14883451/file/original-761915986636e2ae85fee541c6b9c051.jpg?resize=1200x900&vertical=center

const ProfilePage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("Free");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [userId, setUserId] = useState(null);
  const [userPin, setUserPin] = useState("");
  const [newPin, setNewPin] = useState(["", "", "", ""]);
  const [showPin, setShowPin] = useState(false);

  // const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { isPro } = useSubscription();

  const [previewUrl, setPreviewUrl] = useState(null);

  const [activeTab, setActiveTab] = useState("profile");
  const [backgroundUrl, setBackgroundUrl] = useState(null);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const backgroundInputRef = useRef(null);
  const [previewBackgroundUrl, setPreviewBackgroundUrl] = useState(null);

  const navigate = useNavigate();

  const { isDarkMode, toggleTheme } = useTheme();

  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsername(user.displayName || "Alexis Hill");
        setEmail(user.email || "example@mail.com");
        setAvatarUrl(
          user.photoURL ||
            "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
        );
        setPreviewUrl(
          user.photoURL ||
            "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
        );

        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();

        // Set background from Firestore or localStorage or default
        const savedBackground = localStorage.getItem("backgroundImage");
        const backgroundFromDB = userData?.backgroundUrl;
        const finalBackground =
          savedBackground ||
          backgroundFromDB ||
          "https://images.unsplash.com/photo-1557683316-973673baf926";

        setBackgroundUrl(finalBackground);
        setPreviewBackgroundUrl(finalBackground);

        // Store in localStorage if not already there
        if (!savedBackground && backgroundFromDB) {
          localStorage.setItem("backgroundImage", backgroundFromDB);
        }

        setUserId(user.uid);
        fetchUserPin(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true,
      fileType: file.type,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      throw error;
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      message.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error("File size should not exceed 5MB");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      setIsUploading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user logged in");

      // Compress image before upload
      const compressedImage = await compressImage(file);

      // Prepare form data for Cloudinary upload
      const formData = new FormData();
      formData.append("file", compressedImage);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_AVATAR_PRESET
      );
      formData.append("folder", "browsey/avatars");
      formData.append("public_id", `user_${currentUser.uid}_${Date.now()}`);
      formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Cloudinary Error:", errorData);
        throw new Error(
          errorData.error?.message || "Failed to upload image to Cloudinary"
        );
      }

      const data = await response.json();
      const imageUrl = data.secure_url;

      // Update user profile with new image URL
      await updateProfile(currentUser, {
        photoURL: imageUrl,
      });

      // Update Firestore document
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        avatarUrl: imageUrl,
        lastUpdated: new Date().toISOString(),
      });

      setAvatarUrl(imageUrl);
      message.success("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setPreviewUrl(avatarUrl); // Revert preview on error

      if (error.message.includes("Cloudinary")) {
        message.error("Failed to upload image. Please try again later.");
      } else if (error.message === "No user logged in") {
        message.error("Please log in to upload an image.");
      } else {
        message.error("An error occurred while updating your profile picture.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const fetchUserPin = async (userId) => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserPin(docSnap.data().pin || "0000");
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
      setIsEditingPin(false);
    } catch (error) {
      console.error("Error saving new pin:", error);
      alert("Failed to update PIN. Please try again.");
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
    if (!/^\d*$/.test(value)) return; // Only allow digits
    if (value.length > 1) return;

    const updatedPin = [...newPin];
    updatedPin[index] = value;
    setNewPin(updatedPin);

    if (value && index < 3) {
      document.getElementById(`pin-input-${index + 1}`).focus();
    }
  };

  const handleSaveName = async () => {
    if (!username.trim()) {
      alert("Name cannot be empty");
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, { displayName: username });
        const userDoc = doc(db, "users", currentUser.uid);
        await setDoc(userDoc, { username }, { merge: true });
        setIsEditingName(false);
        alert("Name updated successfully!");
      }
    } catch (error) {
      console.error("Error saving name:", error);
      alert("Failed to update name. Please try again.");
    }
  };

  const handleSavePassword = async () => {
    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updatePassword(currentUser, password);
        setIsEditingPassword(false);
        setPassword("");
        alert("Password updated successfully!");
      }
    } catch (error) {
      console.error("Error saving password:", error);
      alert("Failed to update password. Please try again.");
    }
  };

  const handleUpgrade = () => {
    navigate("/premium");
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="min-h-screen relative">
      {/* Full-screen background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${previewBackgroundUrl || backgroundUrl})`,
          zIndex: -2,
        }}
      />
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        style={{ zIndex: -1 }}
      />

      {/* Header */}
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} goBack={true} />

      {/* Main Content */}
      <div className="relative pt-8 px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header Card */}
          <div className="bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)] backdrop-blur-md rounded-lg shadow-xl p-6 mb-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={previewUrl || avatarUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-lg"
                />
                <button
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 text-white hover:bg-indigo-700 shadow-lg"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaCamera size={14} />
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold dark:text-white">
                  {username}
                </h2>
                <p className="text-black dark:text-gray-300">{email}</p>
                <div className="mt-3">
                  <span
                    className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${
                      isPro
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {isPro ? <FaCrown className="mr-2" /> : null}
                    {isPro ? "Pro Account" : "Free Account"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible Sections */}
          <div className="space-y-4">
            {/* Profile Section */}
            <div className="bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)] backdrop-blur-md rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={() => toggleSection("profile")}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-black/5"
              >
                <div className="flex items-center gap-3">
                  <FaUser className="text-gray-400" />
                  <span className="font-semibold dark:text-white">
                    Profile Information
                  </span>
                </div>
                <div
                  className={`transform transition-transform ${
                    activeSection === "profile" ? "rotate-180" : ""
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              {activeSection === "profile" && (
                <div className="p-6 border-t border-gray-800 ">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold dark:text-white">Name</h3>
                      {isEditingName ? (
                        <div className="flex items-center mt-2 space-x-2">
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="border dark:border-gray-600 dark:bg-[#513a7a] rounded p-2"
                          />
                          <button
                            onClick={handleSaveName}
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <p className=" text-black dark:text-gray-300 mt-1">
                          {username}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setIsEditingName(!isEditingName)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <FaPen />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Password Section */}
            <div className="bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)] backdrop-blur-md rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={() => toggleSection("password")}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-black/5"
              >
                <div className="flex items-center gap-3">
                  <FaLock className="text-gray-400" />
                  <span className="font-semibold dark:text-white">
                    Password Settings
                  </span>
                </div>
                <div
                  className={`transform transition-transform ${
                    activeSection === "password" ? "rotate-180" : ""
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              {activeSection === "password" && (
                <div className="p-6 border-t border-gray-700">
                  {isEditingPassword ? (
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full border dark:border-gray-600 dark:bg-[#513a7a] rounded p-2 pr-10"
                          placeholder="Enter new password"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      <button
                        onClick={handleSavePassword}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                      >
                        Update Password
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingPassword(true)}
                      className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Click to change password
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* PIN Section */}
            {userId && (
              <div className="bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)] backdrop-blur-md rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => toggleSection("pin")}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-black/5"
                >
                  <div className="flex items-center gap-3">
                    <FaShieldAlt className="text-gray-400" />
                    <span className="font-semibold dark:text-white">
                      Security PIN
                    </span>
                  </div>
                  <div
                    className={`transform transition-transform ${
                      activeSection === "pin" ? "rotate-180" : ""
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>
                {activeSection === "pin" && (
                  <div className="p-6 border-t dark:border-gray-700">
                    {isEditingPin ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex gap-2">
                          {newPin.map((digit, index) => (
                            <input
                              key={index}
                              id={`pin-input-${index}`}
                              type={showPin ? "text" : "password"}
                              value={digit}
                              maxLength="1"
                              onChange={(e) => handleInputChange(e, index)}
                              className="w-12 h-12 text-center text-xl border dark:border-gray-600 dark:bg-[#513a7a] rounded"
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => setShowPin(!showPin)}
                          className="text-gray-400"
                        >
                          {showPin ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        <button
                          onClick={handleChangePin}
                          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                        >
                          Update PIN
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditingPin(true)}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Click to change PIN
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Subscription Section */}
            <div className="bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)] backdrop-blur-md rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={() => toggleSection("subscription")}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-black/5"
              >
                <div className="flex items-center gap-3">
                  <FaCrown className="text-gray-400" />
                  <span className="font-semibold dark:text-white">
                    Subscription
                  </span>
                </div>
                <div
                  className={`transform transition-transform ${
                    activeSection === "subscription" ? "rotate-180" : ""
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              {activeSection === "subscription" && (
                <div className="p-6 border-t dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600 dark:text-gray-300">
                      {isPro ? "Pro Account" : "Free Account"}
                    </p>
                    {!isPro && (
                      <button
                        onClick={handleUpgrade}
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-2 rounded-full hover:from-yellow-500 hover:to-yellow-700"
                      >
                        Upgrade to Pro
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Background Image Upload Button */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
