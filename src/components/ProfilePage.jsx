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
  FaCog,
  FaRegListAlt,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import imageCompression from "browser-image-compression";
import { useSubscription } from "../hooks/useSubscription";
import { Modal, message, Tabs, Spin, Button, Tooltip, Image } from "antd";
import Header from "./Header";
import { useTheme } from "../context/ThemeContext";
// https://cdn.dribbble.com/userupload/14883451/file/original-761915986636e2ae85fee541c6b9c051.jpg?resize=1200x900&vertical=center

const ProfilePage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
  const [loading, setLoading] = useState(true);

  const { isPro } = useSubscription();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [backgroundUrl, setBackgroundUrl] = useState(null);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const backgroundInputRef = useRef(null);
  const [previewBackgroundUrl, setPreviewBackgroundUrl] = useState(null);

  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [activeSection, setActiveSection] = useState("profile");
  const [userProfession, setUserProfession] = useState("");
  const [isEditingProfession, setIsEditingProfession] = useState(false);
  const [userInterest, setUserInterest] = useState('');
  const [interestOptions, setInterestOptions] = useState([]);
  const [interestLoading, setInterestLoading] = useState(true);

  const professions = [
    {
      id: "not_selected",
      name: "Not Selected",
      icon: "❓",
      description: "No specific profession selected"
    },
    {
      id: "developer",
      name: "Developer / Programmer",
      icon: "💻",
      description: "Software development and programming"
    },
    {
      id: "designer",
      name: "Designer (UI/UX, Graphic, Web)",
      icon: "🎨",
      description: "Creative design and user experience"
    },
    {
      id: "digital_marketer",
      name: "Digital Marketer",
      icon: "📱",
      description: "Digital marketing and online promotion"
    },
    {
      id: "student",
      name: "Student",
      icon: "🎓",
      description: "Currently studying or pursuing education"
    },
    {
      id: "teacher",
      name: "Teacher / Educator",
      icon: "👩‍🏫",
      description: "Teaching in a school, college, or university"
    },
    {
      id: "entrepreneur",
      name: "Entrepreneur / Founder",
      icon: "🚀",
      description: "Running your own business or startup"
    },
    {
      id: "freelancer",
      name: "Freelancer (Creative or Technical)",
      icon: "🆓",
      description: "Working independently on projects"
    },
    {
      id: "consultant",
      name: "Consultant / Advisor",
      icon: "💡",
      description: "Providing expert advice and consultation"
    },
    {
      id: "working_professional",
      name: "Working Professional",
      icon: "💼",
      description: "Working in a professional field"
    },
    {
      id: "researcher",
      name: "Researcher / Academic",
      icon: "🔬",
      description: "Research and academic work"
    },
    {
      id: "it_support",
      name: "IT / Tech Support",
      icon: "🛠️",
      description: "IT support and technical assistance"
    },
    {
      id: "medical",
      name: "Medical Professional",
      icon: "⚕️",
      description: "Healthcare and medical services"
    },
    {
      id: "retired",
      name: "Retired",
      icon: "🌅",
      description: "Retired from active work"
    },
    {
      id: "other",
      name: "Other",
      icon: "✨",
      description: "Other profession or occupation"
    }
  ];

  const getProfessionDisplayName = (professionId) => {
    const profession = professions.find(p => p.id === professionId);
    return profession ? profession.name : "Not selected";
  };

  const handleProfessionUpdate = async (professionId) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          profession: professionId,
          professionSelectedAt: new Date()
        });
        setUserProfession(professionId);
        setIsEditingProfession(false);
        message.success("Profession updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profession:", error);
      message.error("Failed to update profession. Please try again.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsername(user.displayName || "");
        setEmail(user.email || "");
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

        // Set user profession
        setUserProfession(userData?.profession || "");

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
        setLoading(false);
      } else {
        // Redirect if not logged in
        navigate("/");
        message.warning("You need to be logged in to view your profile");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    async function fetchInterests() {
      try {
        const snap = await getDoc(doc(db, "users", userId));
        const userData = snap.exists() ? snap.data() : {};
        setUserInterest(userData.selectedInterest || 'not_select');
      } catch {
        setUserInterest('not_select');
      }
      setInterestLoading(false);
    }
    if (userId) fetchInterests();
  }, [userId]);

  useEffect(() => {
    async function fetchInterestOptions() {
      try {
        const { getDocs, collection } = await import('firebase/firestore');
        const snap = await getDocs(collection(db, 'interests'));
        const options = [];
        snap.forEach(doc => {
          options.push({ id: doc.id, name: doc.data().name });
        });
        setInterestOptions(options);
      } catch {
        setInterestOptions([]);
      }
    }
    fetchInterestOptions();
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleBackgroundClick = () => {
    backgroundInputRef.current?.click();
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

  const handleBackgroundChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      message.error("Please upload an image file");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      message.error("File size should not exceed 8MB");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewBackgroundUrl(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      setIsUploadingBackground(true);
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user logged in");

      const compressedImage = await compressImage(file);

      const formData = new FormData();
      formData.append("file", compressedImage);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_BACKGROUND_PRESET ||
          "browsey_backgrounds"
      );
      formData.append("folder", "browsey/backgrounds");
      formData.append("public_id", `bg_${currentUser.uid}_${Date.now()}`);
      formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

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
        throw new Error(errorData.error?.message || "Upload failed");
      }

      const data = await response.json();
      const imageUrl = data.secure_url;

      // Update Firestore document
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        backgroundUrl: imageUrl,
        lastUpdated: new Date().toISOString(),
      });

      setBackgroundUrl(imageUrl);
      localStorage.setItem("backgroundImage", imageUrl);
      message.success("Background updated successfully!");
    } catch (error) {
      console.error("Error uploading background:", error);
      setPreviewBackgroundUrl(backgroundUrl); // Revert preview on error
      message.error("Failed to update background. Please try again.");
    } finally {
      setIsUploadingBackground(false);
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
      message.success("PIN updated successfully!");
      setIsEditingPin(false);
    } catch (error) {
      console.error("Error saving new pin:", error);
      message.error("Failed to update PIN. Please try again.");
    }
  };

  const handleChangePin = () => {
    const newPinValue = newPin.join("");
    if (newPinValue.length === 4) {
      saveNewPin(newPinValue);
    } else {
      message.warning("PIN should be 4 digits.");
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
      message.error("Name cannot be empty");
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, { displayName: username });
        const userDoc = doc(db, "users", currentUser.uid);
        await setDoc(userDoc, { username }, { merge: true });
        setIsEditingName(false);
        message.success("Name updated successfully!");
      }
    } catch (error) {
      console.error("Error saving name:", error);
      message.error("Failed to update name. Please try again.");
    }
  };

  const handleSavePassword = async () => {
    if (password.length < 6) {
      message.error("Password must be at least 6 characters long");
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updatePassword(currentUser, password);
        setIsEditingPassword(false);
        setPassword("");
        message.success("Password updated successfully!");
      }
    } catch (error) {
      console.error("Error saving password:", error);
      message.error(
        "Failed to update password. Please try again later or reauthenticate."
      );
    }
  };

  const handleUpgrade = () => {
    navigate("/premium");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Loading profile..." />
      </div>
    );
  }

  return (
    <div
      className={`${
        isDarkMode
          ? "bg-gradient-to-r from-[#1a1a2e] via-[#2a243f] to-[#1a1a2e]"
          : "bg-gradient-to-r from-indigo-200 via-blue-100 to-indigo-200"
      } min-h-screen transition-colors duration-300`}
    >
      <Header goBack={true} />

      {/* Main Content */}
      <div className="relative py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header Card */}
          <div className="relative bg-white dark:bg-[#28283a] backdrop-blur-md rounded-xl shadow-xl p-6 mb-8 overflow-hidden">
            {/* Change background button */}

            <input
              type="file"
              ref={backgroundInputRef}
              onChange={handleBackgroundChange}
              accept="image/*"
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden shadow-lg">
                  <Image
                    src={previewUrl || avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Tooltip title="Change Profile Picture">
                  <button
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 text-white hover:bg-indigo-700 shadow-lg transition-all"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaCamera size={14} />
                    )}
                  </button>
                </Tooltip>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-3xl font-bold dark:text-white mb-1">
                  {username}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-3">{email}</p>
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <span
                    className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${
                      isPro
                        ? "bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {isPro ? <FaCrown className="mr-2" /> : null}
                    {isPro ? "Pro Account" : "Free Account"}
                  </span>

                  {!isPro && (
                    <button
                      onClick={handleUpgrade}
                      className="px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                      Upgrade
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Settings Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {/* Main Settings Panel */}
              <div className="bg-white dark:bg-[#28283a] backdrop-blur-md rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <FaCog className="text-gray-400" />
                    <h3 className="font-semibold text-lg dark:text-white">
                      Account Settings
                    </h3>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Name Setting */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium dark:text-white">
                        Display Name
                      </h4>
                      <button
                        onClick={() => setIsEditingName(!isEditingName)}
                        className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        {isEditingName ? "Cancel" : "Edit"}
                      </button>
                    </div>

                    {isEditingName ? (
                      <div className="flex items-center mt-2 space-x-2">
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="flex-1 border dark:border-gray-600 dark:bg-[#3a2c58] dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                          placeholder="Enter your name"
                        />
                        <Button
                          type="primary"
                          onClick={handleSaveName}
                          icon={<FaSave />}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300">
                        {username}
                      </p>
                    )}
                  </div>

                  {/* Password Setting */}
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium dark:text-white">Password</h4>
                      <button
                        onClick={() => setIsEditingPassword(!isEditingPassword)}
                        className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        {isEditingPassword ? "Cancel" : "Change Password"}
                      </button>
                    </div>

                    {isEditingPassword && (
                      <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border dark:border-gray-600 dark:bg-[#3a2c58] dark:text-white rounded-lg p-2 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            placeholder="Enter new password"
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            type="button"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        <Button
                          type="primary"
                          onClick={handleSavePassword}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          Update
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* PIN Setting */}
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium dark:text-white">
                        Security PIN
                      </h4>
                      <button
                        onClick={() => setIsEditingPin(!isEditingPin)}
                        className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        {isEditingPin ? "Cancel" : "Change PIN"}
                      </button>
                    </div>

                    {isEditingPin ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex gap-2">
                            {newPin.map((digit, index) => (
                              <input
                                key={index}
                                id={`pin-input-${index}`}
                                type={showPin ? "text" : "password"}
                                value={digit}
                                maxLength="1"
                                onChange={(e) => handleInputChange(e, index)}
                                className="w-14 h-14 text-center text-xl border dark:border-gray-600 dark:bg-[#3a2c58] dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                              />
                            ))}
                          </div>
                          <button
                            onClick={() => setShowPin(!showPin)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2"
                            type="button"
                          >
                            {showPin ? (
                              <FaEyeSlash size={18} />
                            ) : (
                              <FaEye size={18} />
                            )}
                          </button>
                        </div>
                        <Button
                          type="primary"
                          onClick={handleChangePin}
                          icon={<FaSave />}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          Update PIN
                        </Button>
                      </div>
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300">••••</p>
                    )}
                  </div>

                  {/* Profession Setting */}
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium dark:text-white">
                        Profession
                      </h4>
                      <button
                        onClick={() => setIsEditingProfession(!isEditingProfession)}
                        className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        {isEditingProfession ? "Cancel" : "Change Profession"}
                      </button>
                    </div>

                    {isEditingProfession ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                          {professions.map((profession) => (
                            <button
                              key={profession.id}
                              onClick={() => handleProfessionUpdate(profession.id)}
                              className="px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 flex items-center justify-center text-center"
                            >
                              <span className="mr-1">{profession.icon}</span>
                              <span className="text-xs">{profession.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300">
                        {getProfessionDisplayName(userProfession)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Account Info */}
              <div className="bg-white dark:bg-[#28283a] backdrop-blur-md rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <FaUser className="text-gray-400" />
                    <h3 className="font-semibold text-lg dark:text-white">
                      Account Info
                    </h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Email
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">{email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Account Type
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 flex items-center">
                      {isPro ? (
                        <>
                          <FaCrown className="text-yellow-500 mr-2" /> Pro
                          Account
                        </>
                      ) : (
                        "Free Account"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Profession
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {getProfessionDisplayName(userProfession)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Interest
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {interestLoading ? 'Loading...' : (interestOptions.find(i => i.id === userInterest)?.name || 'Not selected')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pro Features */}
              {!isPro && (
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6 text-white">
                    <h3 className="font-bold text-xl mb-3 flex items-center">
                      <FaCrown className="mr-2" /> Upgrade to Pro
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> Unlimited pages
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> Ad-free experience
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> Priority support
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> Premium widgets
                      </li>
                    </ul>
                    <button
                      onClick={handleUpgrade}
                      className="mt-4 w-full px-4 py-2 bg-white text-indigo-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;