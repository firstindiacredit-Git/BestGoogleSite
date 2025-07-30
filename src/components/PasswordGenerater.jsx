import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  deleteDoc,
} from "firebase/firestore";
import { FaLock, FaEye, FaEyeSlash, FaCopy, FaPlus } from "react-icons/fa";
import { IoGrid, IoList, IoLockClosed } from "react-icons/io5";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { MdDelete, MdEdit, MdEditSquare } from "react-icons/md";
import { FiPlusCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { useTheme } from "../context/ThemeContext";

message.config({
  top: 60,
  duration: 2,
  maxCount: 3,
  className: "custom-message-class",
});

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .custom-message-class {
    background: rgba(0, 0, 0, 0.8) !important;
    border-radius: 8px !important;
    backdrop-filter: blur(8px) !important;
  }

  .custom-message-class .ant-message-notice-content {
    background: transparent !important;
    box-shadow: none !important;
  }

  .custom-message-class .anticon {
    color: #52c41a !important; /* Success icon color */
  }

  .custom-message-class .ant-message-success .ant-message-notice-content,
  .custom-message-class .ant-message-error .ant-message-notice-content,
  .custom-message-class .ant-message-warning .ant-message-notice-content {
    color: white !important;
  }

  .dark .custom-message-class {
    background: rgba(40, 40, 58, 0.95) !important;
  }

  .dark .custom-message-class .anticon-check-circle {
    color: #52c41a !important;
  }

  .dark .custom-message-class .anticon-close-circle {
    color: #ff4d4f !important;
  }

  .dark .custom-message-class .anticon-warning {
    color: #faad14 !important;
  }
`;

document.head.appendChild(styleSheet);

const CredentialManager = () => {
  const { isDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [isGridView, setIsGridView] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCred, setSelectedCred] = useState("");
  const [currentCredential, setCurrentCredential] = useState(null);
  const [correctPassword, setCorrectPassword] = useState("0000");

  const [formValues, setFormValues] = useState({
    website: "",
    url: "",
    username: "",
    password: "",
    notes: "",
  });

  const [length, setLength] = useState(12);
  const [genPass, setGenPass] = useState("");
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState("");
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeLetters, setIncludeLetters] = useState(true);
  const [includeSpecialChars, setIncludeSpecialChars] = useState(true);
  const [userId, setUserId] = useState(null);

  const [otp, setOtp] = useState(["", "", "", ""]);

  const handleInputOTPChange = (value, index) => {
    if (value.length > 1) value = value.slice(0, 1); // Ensure only one digit
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`).focus(); // Move to the next input
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus(); // Move to the previous input
    }
    if (e.key === "e") e.preventDefault(); // Prevent entering 'e' in number inputs
    if (e.key === "Enter") handleUnlock(); // Handle Enter key
  };

  const handleUnlock = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp === correctPassword) {
      setIsLocked(false);
      setOtp(["", "", "", ""]);
    } else {
      message.error("Incorrect Pin! Please try again.");
    }
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;

    // Add points for length
    if (password.length >= 8) score += 4; // Strong length
    else if (password.length >= 5) score += 2; // Medium length

    // Add points for diversity
    if (/[A-Z]/.test(password)) score += 2; // Uppercase
    if (/[a-z]/.test(password)) score += 2; // Lowercase
    if (/[0-9]/.test(password)) score += 2; // Digits
    if (/[^A-Za-z0-9]/.test(password)) score += 3; // Special characters

    // Add points for uniqueness
    const uniqueChars = new Set(password).size;
    if (uniqueChars > 5) score += 2;

    // Determine strength
    if (score < 6)
      return {
        label: "Weak",
        message: "10 Days",
        color: "bg-red-500",
      };
    else if (score < 10)
      return {
        label: "Medium",
        color: "bg-yellow-500",
        message: "500 Years",
      };
    else
      return {
        label: "Strong",
        color: "bg-green-500",
        message: "Age of Universe",
      };
  };

  const navigate = useNavigate();

  const togglePasswordVisibility = (website) => {
    setShowPasswords((prev) => ({
      ...prev,
      [website]: !prev[website],
    }));
  };
  const toggleAllPasswordVisibility = () => {
    const newShowPasswords = {};
    // If any password is currently visible, hide all. Otherwise, show all
    const shouldShow = !Object.values(showPasswords).some((value) => value);

    filteredCredentials.forEach((cred) => {
      newShowPasswords[cred.website] = shouldShow;
    });

    setShowPasswords(newShowPasswords);
  };
  const fetchFavicon = (url) =>
    `https://www.google.com/s2/favicons?sz=64&domain=${url}`;

  const handleCopyText = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        message.success("Copied to clipboard");
      })
      .catch(() => {
        message.error("Failed to copy to clipboard");
      });
  };

  // Add filter function for search
  const filteredCredentials = credentials.filter((cred) =>
    cred?.website?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // console.log(filteredCredentials);

  const generateRandomPassword = (length = 12) => {
    let characters = "";

    if (includeLetters) {
      characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    }
    if (includeNumbers) {
      characters += "0123456789";
    }
    if (includeSpecialChars) {
      characters += "!@#$%^&*()_-+=<>?";
    }

    if (characters === "") {
      characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    }

    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      password += characters.charAt(randomIndex);
    }

    setGenPass(password);
    message.success("Password generated successfully");
  };

  const handleCopyPassword = () => {
    if (!genPass) {
      message.warning("Please generate a password first");
      return;
    }
    handleCopyText(genPass);
  };

  const showModal = (credential = null) => {
    setIsModalVisible(true);
    setCurrentCredential(credential);
    if (credential) {
      setFormValues({
        website: credential.website,
        url: credential.url,
        username: credential.username,
        password: credential.password,
        notes: credential.notes || "",
      });
    } else {
      setFormValues({
        website: "",
        url: "",
        username: "",
        password: "",
        notes: "",
      });
    }
  };
  const deleteCredential = async (userId, entryId) => {
    try {
      const docRef = doc(db, `users/${userId}/passwords/${entryId}`);
      console.log(docRef.path);
      await deleteDoc(docRef);
      console.log("Credential deleted successfully");
    } catch (error) {
      console.error("Error deleting credential:", error);
    }
  };
  const handleDelete = async (credentialId) => {
    try {
      // Assuming you are passing the userId and the credentialId (id of the document you want to delete)
      await deleteCredential(userId, credentialId);

      // After deletion, update the UI or state to reflect the change
      setCredentials((prevCredentials) =>
        prevCredentials.filter((cred) => cred.id !== credentialId)
      );
      message.success("Credential deleted successfully");
    } catch (error) {
      console.error("Error deleting credential:", error);
      message.error("Failed to delete credential");
    }
  };

  const saveCredentialToFirestore = async (credential) => {
    try {
      if (userId) {
        const docRef = await addDoc(
          collection(db, `users/${userId}/passwords`),
          credential
        );
      }
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  // Handle auth state changes
  const fetchPin = async (userId) => {
    try {
      const docRef = doc(db, `users/${userId}`);
      const snap = await getDoc(docRef);

      if (!snap.exists()) throw new Error("User not found");

      setCorrectPassword(snap.data().pin || "0000"); // Set the user's PIN from Firestore or default to '0000'
      return snap.data();
    } catch (error) {
      console.log("Error fetching PIN:", error);
    }
  };

  // Handle auth state changes and fetch PIN once the user is authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        setUserId(user.uid);
        fetchPin(user.uid);
      } else {
        setUserId(null);
        setCorrectPassword("");
      }
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    let isMounted = true; // Add mounted check

    const loadAllCredentials = async () => {
      if (!userId || !isMounted) return;

      try {
        const userQuery = query(collection(db, `users/${userId}/passwords`));
        const userSnapshot = await getDocs(userQuery);
        const userCreds = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (!isMounted) return;
        // Combine both sets of credentials
        setCredentials([...userCreds]);
      } catch (error) {
        console.error("Error loading credentials:", error);
      }
    };

    loadAllCredentials();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [userId]); // Only depend on userId

  const handleSave = async (event, entryId) => {
    event.preventDefault();
    const { website, url, username, password, notes } = formValues;

    if (!website || !username || !password) {
      message.warning("Please fill in all required fields");
      return;
    }

    try {
      const newCredential = { website, url, username, password, notes };

      if (currentCredential) {
        // Update existing credential
        const docRef = doc(
          db,
          `users/${userId}/passwords/${currentCredential.id}`
        );
        await updateDoc(docRef, newCredential);

        // Update local state
        setCredentials((prevCreds) =>
          prevCreds.map((cred) =>
            cred.id === currentCredential.id
              ? { ...cred, ...newCredential }
              : cred
          )
        );

        message.success("Credential updated successfully");
      } else {
        // Add new credential
        const docRef = await addDoc(
          collection(db, `users/${userId}/passwords`),
          newCredential
        );

        // Update local state
        setCredentials((prevCreds) => [
          ...prevCreds,
          { id: docRef.id, ...newCredential },
        ]);
        message.success("Credential added successfully");
      }

      setIsModalVisible(false);
      setCurrentCredential(null);
      setFormValues({
        website: "",
        url: "",
        username: "",
        password: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error saving credential:", error);
      message.error("Failed to save credential");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  if (!user) {
    return (
      <div className="w-[90%] mx-auto rounded-lg relative">
        <div className="text-indigo-500 inset-0 flex justify-center items-center h-[60vh] z-50 absolute top-0 left-0 right-0 w-full backdrop-blur-md dark:text-white">
          <div className="text-xl -mt-24">Login to use this Feature</div>
        </div>
        <div className="flex justify-center opacity-50 -z-50 pt-24">
          {isDarkMode ? (
            <img src="./DOSB.png" className="h-96" alt="" />
          ) : (
            <img src="./DOSW.png" className="h-96" alt="" />
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {isLocked ? (
        <div className="flex justify-center  w-[90vw] mx-auto">
          <div className="w-full  rounded-t-sm  h-[40vh]   flex items-center justify-center">
            <div className="p-8 flex w-2/5 gap-6  items-center justify-between backdrop-blur-sm bg-white/[var(--widget-opacity)] dark:bg-[#28283a]/[var(--widget-opacity)]  text-center rounded-md ">
              <div className=" text-indigo-500 mr-10 text-6xl">
                <img src="/undraw_secure-login_m11a.svg" alt="locker" />
              </div>
              <div>
                <h2 className="text-2xl my-1 mt-4 font-semibold dark:text-gray-200">
                  Enter PIN to Unlock
                </h2>
                <div className="flex justify-center mt-4 space-x-2 mb-4">
                  {otp.map((value, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      value={value}
                      onChange={(e) =>
                        handleInputOTPChange(e.target.value, index)
                      }
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="w-12 h-12 border rounded-md border-gray-300 rounded-xs text-center text-lg dark:text-white dark:bg-[#28283a]"
                      style={{
                        appearance: "none", // Removes the arrows
                        MozAppearance: "textfield", // Firefox-specific
                        WebkitAppearance: "none", // Chrome/Safari-specific
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleUnlock}
                  className="rounded-md bg-indigo-500 dark:bg-[#513a7a] w-full hover:bg-indigo-600 transition-all text-white px-4 py-2 rounded-xs"
                >
                  Unlock
                </button>
                <div className="text-center flex justify-center gap-2 mt-3 -mb-3">
                  <button
                    className="text-indigo-500 hover:text-indigo-600 text-xs transition duration-200"
                    onClick={() => navigate("/Profile")}
                  >
                    Forgot Pin?
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white/[var(--widget-opacity)] mb-8  dark:bg-[#28283A]/[var(--widget-opacity)] mx-auto backdrop-blur-sm min-h-[60vh] max-w-[90vw] rounded-xl ">
          <div>
            <div className="flex justify-between w-[68%] xl:w-[79.2%]  items-center">
              <button
                className="transition-all rounded-md bg-indigo-500 dark:bg-[#513a7a] text-white lg:text-lg text-sm lg:px-4 px-2 py-2 rounded-xs mb-4"
                onClick={() => showModal()}
              >
                <FaPlus size={15} />
              </button>

              <div className="relative flex space-x-1 w-1/2  mb-4">
                <input
                  type="text"
                  placeholder="Search credentials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-md px-4 py-2 dark:bg-[#28283a]   dark:text-white  rounded-xs focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
                <div className="flex items-center rounded-md gap-2 bg-gray-200 dark:bg-[#28283a]   p-1 ">
                  <button
                    onClick={() => setIsGridView(true)}
                    className={`p-2 rounded ${
                      isGridView ? "bg-white dark:bg-[#513a7a] shadow-sm" : ""
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
                    onClick={() => setIsGridView(false)}
                    className={`p-2 rounded ${
                      !isGridView ? "bg-white dark:bg-gray-600 shadow-sm" : ""
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
              <div className="lg:space-x-2 w-fit flex justify-between  space-x-1">
                {filteredCredentials.length > 0 && (
                  <button
                    className="transition-all w-fit text-center rounded-md dark:bg-[#513a7a] dark:hover:bg-gray-600 dark:text-gray-200  bg-gray-300 hover:bg-gray-600 hover:text-gray-100 text-gray-800 border border-black/5 px-4 py-2 rounded-xs mb-4"
                    onClick={toggleAllPasswordVisibility}
                  >
                    {filteredCredentials.length > 0 &&
                    Object.values(showPasswords).some((value) => value) ? (
                      <AiFillEyeInvisible />
                    ) : (
                      <AiFillEye />
                    )}
                  </button>
                )}
                <button
                  className="transition-all rounded-md bg-red-500 text-white px-4 py-2 rounded-xs mb-4"
                  onClick={() => {
                    setIsLocked(true);
                    setPassword("");
                  }}
                >
                  <IoLockClosed />
                </button>
              </div>
            </div>

            <div className="flex justify-between  space-x-4 w-full ">
              {isGridView ? (
                filteredCredentials.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 h-fit gap-4 w-[70%] xl:w-[80%]">
                    {filteredCredentials.map((cred, index) => {
                      const { label, color, message } =
                        calculatePasswordStrength(cred.password);
                      return (
                        <div
                          key={cred.id || index}
                          className="bg-white dark:bg-[#28283A]   dark:text-gray-400 p-6 rounded-lg   relative"
                        >
                          {/* Title and Logo */}
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-xl dark:text-gray-200">
                              {cred.website}
                            </h2>
                            <img
                              src={fetchFavicon(cred.url)}
                              alt="logo"
                              className="h-8 w-8 object-contain"
                            />
                          </div>

                          {/* URL */}
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              URL:
                            </span>
                            <a
                              href={cred.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-indigo-500 hover:text-indigo-600 truncate transition-colors"
                            >
                              {cred.url}
                            </a>
                          </div>

                          {/* Credentials */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Username:
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium dark:text-gray-300">
                                  {cred.username}
                                </span>
                                <button
                                  onClick={() => handleCopyText(cred.username)}
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md transition-colors"
                                >
                                  <FaCopy className="w-4 h-4 text-gray-400 hover:text-indigo-500" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Password:
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium dark:text-gray-300">
                                  {showPasswords[cred.website]
                                    ? cred.password
                                    : "••••••••"}
                                </span>
                                <button
                                  onClick={() =>
                                    togglePasswordVisibility(cred.website)
                                  }
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md transition-colors"
                                >
                                  {showPasswords[cred.website] ? (
                                    <FaEyeSlash className="w-4 h-4 text-gray-400 hover:text-indigo-500" />
                                  ) : (
                                    <FaEye className="w-4 h-4 text-gray-400 hover:text-indigo-500" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleCopyText(cred.password)}
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md transition-colors"
                                >
                                  <FaCopy className="w-4 h-4 text-gray-400 hover:text-indigo-500" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-800/20">
                            <div>
                              <div className="text-xs text-gray-500">
                                Password Strength
                              </div>
                              <div className="text-sm font-medium dark:text-gray-300">
                                {message}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md transition-colors text-indigo-500"
                                onClick={() => showModal(cred)}
                              >
                                <MdEditSquare size={18} />
                              </button>
                              <button
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md transition-colors text-red-500"
                                onClick={() => handleDelete(cred.id)}
                              >
                                <MdDelete size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex  flex-col w-[70%] xl:w-[80%] p-5 dark:bg-[#513a7a] bg-white rounded-md  border border-gray-800/10 min-h-72 justify-center items-center  text-gray-500">
                    <FiPlusCircle
                      size={80}
                      onClick={() => showModal()}
                      className="mb-4 text-indigo-500 dark:text-gray-700 cursor-pointer transition-all hover:scale-105"
                    />
                    <h2 className="text-xl  text-gray-600 font-semibold">
                      Create Your First Credential
                    </h2>
                    <p className=" text-gray-600">
                      Start by adding your credentials securely.
                    </p>
                  </div>
                )
              ) : (
                <div className="overflow-x-auto w-[80%] min-h-72 dark:bg-[#28283A] bg-white border  border-black/10 rounded-sm">
                  {filteredCredentials.length > 0 ? (
                    <>
                      <table className="min-w-full  rounded-sm  table-auto">
                        <thead className="dark:bg-[#513a7a] dark:text-gray-400 bg-gray-100 rounded-sm">
                          <tr className="rounded-sm">
                            <th className="py-2 px-4 w-8 text-left">S.no</th>
                            <th className="py-2 px-4 text-left max-w-24  lg:max-w-32">
                              Website
                            </th>
                            <th className="py-2 px-4 none xl:block text-left">
                              URL
                            </th>
                            <th className="py-2 px-4 text-left">Username</th>
                            <th className="py-2 px-4 text-left">Password</th>
                            <th className="py-2 px-4 text-center max-w-24  lg:max-w-32">
                              Notes
                            </th>
                            <th className="py-2 px-4 text-center max-w-24  lg:max-w-32">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="rounded-sm">
                          {filteredCredentials.map((cred, index) => (
                            <tr
                              key={index}
                              className="border-b dark:border-gray-700 dark:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-900"
                            >
                              <td className="py-2 px-2 text-center   max-w-6 ">
                                {index + 1}
                              </td>
                              <td className="py-2 px-4 overflow-hidden max-w-14 ">
                                <div className=" flex  items-center justify-left">
                                  <img
                                    src={fetchFavicon(cred.url)}
                                    alt={cred.url}
                                    className="w-5 h-5 mx-2 items-center"
                                  />
                                  <span
                                    title={cred.website}
                                    className="dark:text-gray-400 text-gray-700 overflow-auto truncate max-w-24 lg:max-w-32 font-medium uppercase"
                                  >
                                    {cred.website}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2 px-4 max-w-[15ch] overflow-hidden text-indigo-500 cursor-pointer hover:underline">
                                <a
                                  href={cred.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {cred.url}
                                </a>
                              </td>
                              <td className="py-2 px-4 text-gray-700  max-w-12">
                                <div className="flex  px-1 min-w-fit  dark:bg-[#28283A] dark:text-gray-400  bg-gray-50 border border-gray-200/20 rounded-xs justify-between items-center space-x-2 whitespace-nowrap">
                                  <span
                                    className="overflow-hidden  lg:max-w-24 max-w-[14ch]"
                                    title={cred.username}
                                  >
                                    {cred.username}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleCopyText(cred.username)
                                    }
                                    className="text-gray-300 dark:hover:text-gray-500 dark:text-gray-600 hover:text-gray-400 transition-all"
                                  >
                                    <FaCopy />
                                  </button>
                                </div>
                              </td>
                              <td className="py-2 text-gray-500 px-4  max-w-12">
                                <div className="flex dark:bg-[#28283A] min-w-fit dark:text-gray-400 bg-gray-50 border border-gray-200/20 px-1 rounded-xs justify-between items-center space-x-2 whitespace-nowrap">
                                  <span
                                    className="overflow-hidden   lg:max-w-24 max-w-[14ch]"
                                    title={cred.password}
                                  >
                                    {showPasswords[cred.website]
                                      ? cred.password
                                      : "••••••••"}
                                  </span>
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() =>
                                        togglePasswordVisibility(cred.website)
                                      }
                                      className="text-gray-300 dark:hover:text-gray-500 dark:text-gray-600 hover:text-gray-400 transition-all"
                                    >
                                      {showPasswords[cred.website] ? (
                                        <FaEye />
                                      ) : (
                                        <FaEyeSlash />
                                      )}
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleCopyText(cred.password)
                                      }
                                      className="text-gray-300 dark:hover:text-gray-500 dark:text-gray-600 hover:text-gray-400 transition-all"
                                    >
                                      <FaCopy />
                                    </button>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2 dark:text-gray-500  text-center text-gray-600 overflow-hidden truncate max-w-[14ch] lg:max-w-24 px-6 lg:px-4">
                                {cred.notes}
                              </td>
                              <td className="py-2 px-4   max-w-14 lg:max-w-24">
                                <div className="flex justify-center gap-4">
                                  <button
                                    className="text-gray-300 dark:text-gray-600 dark:hover:text-indigo-600 dark:hover:bg-gray-800 transition-all  hover:text-indigo-500 hover:bg-white p-1 rounded-xs "
                                    onClick={() => {
                                      setSelectedCred(cred.id);
                                      showModal(cred);
                                    }}
                                  >
                                    <MdEdit size={20} />
                                  </button>
                                  <button
                                    className="text-gray-300  dark:text-gray-600 dark:hover:text-red-600 dark:hover:bg-gray-800 transition-all hover:text-red-500 hover:bg-white p-1 rounded-xs "
                                    onClick={() => handleDelete(cred.id)}
                                  >
                                    <MdDelete size={20} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  ) : (
                    <div className="flex flex-col justify-center items-center h-full w-full text-gray-500">
                      {/* Icon */}
                      <FiPlusCircle
                        size={80}
                        onClick={() => showModal()}
                        className="mb-4 dark:text-gray-700 cursor-pointer transition-all hover:scale-105 text-indigo-500"
                      />

                      {/* Title */}
                      <h2 className="text-xl dark:text-gray-600  text-gray-600 font-semibold">
                        Create Your First Credential
                      </h2>

                      {/* Subtitle */}
                      <p className="  dark:text-gray-600 text-gray-600">
                        Start by adding your credentials securely.
                      </p>
                    </div>
                  )}
                </div>
              )}
              <div className="w-[30%]   xl:w-[20%] ">
                <div>
                  <h2
                    className={`font-semibold dark:bg-[#28283A] rounded-md py-2 bg-white ${
                      window.size < 1134 ? "-translate-y-8" : "-translate-y-14"
                    } text-center dark:text-gray-100 text-lg lg:text-2xl `}
                  >
                    Generate Password
                  </h2>
                  <div
                    className={`dark:bg-[#513a7a] bg-gray-100 ${
                      window.size < 1134 ? "-translate-y-8" : "-translate-y-16"
                    } border border-black/5 flex flex-col rounded-md justify-between -translate-y-8 text-center space-y-5  w-full h-full   text-gray-700 rounded-xs p-6`}
                  >
                    <div className="text-gray-700 border rounded-md  border-black/10 dark:bg-[#28283A] dark:text-gray-300 bg-white p-3 text-[1vw] font-mono rounded-xs">
                      {genPass || "***********"}
                    </div>

                    <div className="mt-4 text-left flex flex-col   justify-between   space-y-2">
                      <label className="block text-sm">
                        <input
                          type="number"
                          min="8"
                          max="24"
                          value={length}
                          onChange={(e) => setLength(e.target.value)}
                          className="mr-2 rounded-md  text-gray-700 dark:text-gray-300 text-center dark:bg-[#28283A] px-3 py-2 rounded-xs"
                        />
                        <span className="dark:text-gray-300">Length</span>
                      </label>
                      <div className="flex  flex-col lg:flex-row justify-between">
                        <label className="block text-sm dark:text-gray-300">
                          <input
                            type="checkbox"
                            checked={includeNumbers}
                            onChange={() => setIncludeNumbers(!includeNumbers)}
                            className="mr-2"
                          />
                          Numbers
                        </label>
                        <label className="block text-sm dark:text-gray-300">
                          <input
                            type="checkbox"
                            checked={includeLetters}
                            onChange={() => setIncludeLetters(!includeLetters)}
                            className="mr-2"
                          />
                          Letters
                        </label>
                        <label className="block text-sm dark:text-gray-300">
                          <input
                            type="checkbox"
                            checked={includeSpecialChars}
                            onChange={() =>
                              setIncludeSpecialChars(!includeSpecialChars)
                            }
                            className="mr-2"
                          />
                          Specials
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-col xl:flex-row justify-center space-y-2 xl:space-y-0  w-full xl:space-x-3 mt-4">
                      <button
                        onClick={() => generateRandomPassword(length)}
                        className="bg-gray-300 rounded-md  dark:text-gray-400 dark:hover:bg-gray-900 dark:bg-[#28283A] border  border-gray-500/5 text-gray-700 w-full xl:w-[60%] px-4 py-2 rounded-xs hover:bg-gray-800 hover:text-gray-100 transition duration-300"
                      >
                        Generate
                      </button>
                      <button
                        onClick={handleCopyPassword}
                        className="bg-gray-300 rounded-md  dark:text-gray-400 dark:hover:bg-gray-900 dark:bg-[#28283A] border-gray-500/5 text-gray-700 w-full xl:w-[40%] px-4 py-2 rounded-xs hover:bg-gray-800 hover:text-gray-100  transition duration-300"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Component */}
            {isModalVisible && (
              <div className="fixed inset-0 z-[999]">
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setIsModalVisible(false)}
                />

                {/* Modal Content */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 max-w-[90vw]">
                  <div className="dark:bg-[#513a7a] bg-white p-8 rounded-lg shadow-xl">
                    <h2 className="text-2xl mb-4 dark:text-gray-100">
                      {currentCredential ? "Edit Credential" : "Add Credential"}
                    </h2>
                    <form onSubmit={(event) => handleSave(event, selectedCred)}>
                      <div className="space-y-4">
                        <input
                          type="text"
                          name="website"
                          value={formValues.website}
                          onChange={handleInputChange}
                          placeholder="Website"
                          className="w-full p-2 dark:bg-[#28283A] dark:text-gray-400 dark:border-gray-600 border rounded-md"
                        />
                        <input
                          type="text"
                          name="url"
                          value={formValues.url}
                          onChange={handleInputChange}
                          placeholder="URL"
                          className="w-full p-2 dark:bg-[#28283A] dark:text-gray-400 dark:border-gray-600 border rounded-md"
                        />
                        <input
                          type="text"
                          name="username"
                          value={formValues.username}
                          onChange={handleInputChange}
                          placeholder="Username"
                          className="w-full p-2 dark:bg-[#28283A] dark:text-gray-400 dark:border-gray-600 border rounded-md"
                        />
                        <input
                          type="text"
                          name="password"
                          value={formValues.password}
                          onChange={handleInputChange}
                          placeholder="Password"
                          className="w-full p-2 dark:bg-[#28283A] dark:text-gray-400 dark:border-gray-600 border rounded-md"
                        />
                        <textarea
                          name="notes"
                          value={formValues.notes}
                          onChange={handleInputChange}
                          placeholder="Notes"
                          className="w-full p-2 dark:bg-[#28283A] dark:text-gray-400 dark:border-gray-600 border rounded-md"
                        />
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <button
                          type="button"
                          onClick={() => setIsModalVisible(false)}
                          className="px-4 py-2 dark:bg-[#28283A] transition-all dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-900 border rounded-md"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-500 border dark:bg-indigo-700 dark:border-blue-600 transition-all dark:text-gray-300 dark:hover:bg-blue-900 text-white rounded-md"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CredentialManager;
