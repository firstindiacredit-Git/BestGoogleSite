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

const CredentialManager = () => {
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
      alert("Incorrect Pin! Please try again.");
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
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
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
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(genPass).then(() => {
      alert("Password copied to clipboard!");
    });
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
    } catch (error) {
      console.error("Error deleting credential:", error);
    }
  };

  const saveCredentialToFirestore = async (credential) => {
    try {
      if (userId) {
        const docRef = await addDoc(
          collection(db, `users/${userId}/passwords`),
          credential
        );
        console.log("Document written with ID: ", docRef.id);
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
      if (user) {
        setUserId(user.uid);
        fetchPin(user.uid); // Fetch user's PIN from Firestore
      } else {
        setUserId(null);
        setCorrectPassword(""); // Clear the PIN if the user logs out
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this effect runs only once when the component mounts

  // Separate useEffect for loading credentials
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

    try {
      const newCredential = { website, url, username, password, notes };
      if (currentCredential) {
        const docRef = doc(db, `users/${userId}/passwords/${entryId}`);
        console.log(docRef.path);
        await updateDoc(docRef, {
          website: website,
          url: url,
          username: username,
          password: password,
          notes: notes,
        });
      } else {
        setCredentials([...credentials, newCredential]);
        await saveCredentialToFirestore(newCredential); // Save to Firestore
      }
      setIsModalVisible(false);
      setCurrentCredential(null);
    } catch (error) {
      console.error("Error saving credential:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  return (
    <>
      {isLocked ? (
        <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-[40vh] bg-opacity-50 py-[5vh] flex items-center justify-center">
          <div className="p-8  dark:bg-gray-800 border  border-gray-500/5 text-center rounded-lg shadow-lg w-fit">
            <div className="flex text-blue-500 text-6xl items-center justify-center">
              <FaLock />
            </div>
            <h2 className="text-2xl my-1 mt-4 font-semibold dark:text-gray-200">
              Enter PIN to Unlock
            </h2>
            <div className="flex justify-center mt-4 space-x-2 mb-4">
              {otp.map((value, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  value={value}
                  onChange={(e) => handleInputOTPChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg dark:text-white dark:bg-gray-700"
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
              className="bg-blue-500 w-full hover:bg-blue-600 transition-all text-white px-4 py-2 rounded-md"
            >
              Unlock
            </button>
            <div className="text-center flex justify-center gap-2 mt-3 -mb-3">
              <button
                className="text-blue-500 hover:text-blue-700 text-xs transition duration-200"
                onClick={() => navigate("/ProfilePage")}
              >
                Forgot Pin?
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto min-h-[20vh] p-12 pb-14 dark:bg-gray-900 bg-[#f8f9fa]">
          <div className="flex justify-between w-[68%] xl:w-[79.2%] items-center">
            <button
              className="transition-all bg-blue-500 text-white lg:text-lg text-sm lg:px-4 px-2 py-2 rounded-md mb-4"
              onClick={() => showModal()}
            >
              <FaPlus size={15} />
            </button>

            <div className="relative flex space-x-1 w-1/2 mb-4">
              <input
                type="text"
                placeholder="Search credentials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
              <button
                className={`px-2   py-1 rounded-lg border border-black/5 hover:border-white/20 ${
                  !isGridView
                    ? "bg-gray-400 dark:bg-gray-700 text-gray-100 dark:text-gray-400 hover:border-white/20"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
                onClick={() => setIsGridView(false)}
              >
                <IoList size={20} />
              </button>
              <button
                className={`px-3   py-1 rounded-lg border border-black/5 hover:border-white/20 ${
                  isGridView
                    ? "bg-gray-400 dark:bg-gray-700 text-gray-100 dark:text-gray-400 hover:border-white/20"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
                onClick={() => setIsGridView(true)}
              >
                <IoGrid />
              </button>
            </div>
            <div className="lg:space-x-2 w-fit flex justify-between  space-x-1">
              {filteredCredentials.length > 0 && (
                <button
                  className="transition-all w-fit text-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200  bg-gray-300 hover:bg-gray-600 hover:text-gray-100 text-gray-800 border border-black/5 px-4 py-2 rounded-md mb-4"
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
                className="transition-all bg-red-500 text-white px-4 py-2 rounded-md mb-4"
                onClick={() => {
                  setIsLocked(true);
                  setPassword("");
                }}
              >
                <IoLockClosed />
              </button>
            </div>
          </div>

          <div className="flex justify-between space-x-4 w-full">
            {isGridView ? (
              filteredCredentials.length > 0 ? (
                filteredCredentials.map((cred, index) => {
                  const { label, color, message } = calculatePasswordStrength(
                    cred.password
                  );

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 p-5 dark:bg-gray-950/10 bg-gray-100 border h-fit border-black/5 rounded-lg gap-4 w-[70%] xl:w-[80%]"
                    >
                      <div className="bg-white dark:bg-gray-800 dark:text-gray-400 overflow-auto p-4 h-fit rounded-lg border border-black/10 relative">
                        {/* Title and Logo */}
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="font-bold text-2xl uppercase">
                            {cred.website}
                          </h2>
                          <img
                            src={fetchFavicon(cred.url)}
                            alt="logo"
                            className="h-8"
                          />
                        </div>

                        {/* URL */}
                        <div className="text-gray-400 font-bold -mt-2 flex justify-between mb-3">
                          URL:{" "}
                          <a
                            href={cred.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate hover:underline transition-all text-xl text-blue-500"
                          >
                            {cred.url}
                          </a>
                        </div>

                        {/* Username */}
                        <div className="flex justify-between w-full items-center mb-3">
                          <span className="text-gray-600 w-[30%] font-bold dark:text-gray-400">
                            Username:
                          </span>
                          <div className="flex dark:bg-gray-900 w-[70%] rounded-md justify-between bg-gray-50 px-3 items-center space-x-2">
                            <span>{cred.username}</span>
                            <button
                              onClick={() => handleCopyText(cred.username)}
                              className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-500"
                            >
                              <FaCopy />
                            </button>
                          </div>
                        </div>

                        {/* Password */}
                        <div className="flex justify-between w-full items-center mb-4">
                          <span className="text-gray-600 w-[30%] font-bold dark:text-gray-400">
                            Password:
                          </span>
                          <div className="flex dark:bg-gray-900 w-[70%] rounded-md bg-gray-50 px-3 items-center justify-between space-x-2">
                            <span className="text-gray-800 dark:text-gray-400 overflow-hidden">
                              {showPasswords[cred.website]
                                ? cred.password
                                : "••••••••"}
                            </span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  togglePasswordVisibility(cred.website)
                                }
                                className="transition-all text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-500"
                              >
                                {showPasswords[cred.website] ? (
                                  <FaEye />
                                ) : (
                                  <FaEyeSlash />
                                )}
                              </button>
                              <button
                                onClick={() => handleCopyText(cred.password)}
                                className="transition-all text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-500"
                              >
                                <FaCopy />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Password Strength */}
                        <div className="mb-4">
                          <div className="flex items-center">
                            <div
                              className={`h-1 flex-grow rounded-full ${color}`}
                            />
                          </div>
                          <div
                            className={`text-sm mt-1 ${
                              label === "Strong"
                                ? "text-green-600"
                                : label === "Medium"
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            <span>Strength: {label}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between space-x-3 mt-2">
                          <div>
                            <div className="text-xs text-gray-500">
                              Time needed to crack the Password
                            </div>
                            <div className="font-semibold">{message}</div>
                          </div>
                          <div>
                            <button
                              className="text-blue-500 hover:bg-gray-100 p-[0.1rem] py-[0.12rem] transition-all rounded-sm -translate-x-1 -translate-y-[2px]"
                              onClick={() => showModal(cred)}
                            >
                              <MdEditSquare size={21} />
                            </button>
                            <button
                              className="text-red-500 hover:bg-gray-100 rounded-sm transition-all"
                              onClick={() => handleDelete(cred.id)}
                            >
                              <MdDelete size={25} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col w-[70%] xl:w-[80%] p-5 dark:bg-gray-800 bg-white rounded-lg border border-gray-800/10 min-h-72 justify-center items-center  text-gray-500">
                  <FiPlusCircle
                    size={80}
                    onClick={() => showModal()}
                    className="mb-4 text-blue-500 dark:text-gray-700 cursor-pointer transition-all hover:scale-105"
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
              <div className="overflow-x-auto w-[80%] min-h-72 dark:bg-gray-800 bg-white shadow-md rounded-lg">
                {filteredCredentials.length > 0 ? (
                  filteredCredentials.map((cred, index) => (
                    <table className="min-w-full border rounded-lg border-black/5 table-auto">
                      <thead className="dark:bg-gray-700 dark:text-gray-400 bg-gray-100 rounded-lg">
                        <tr className="rounded-lg">
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
                      <tbody className="rounded-lg">
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
                          <td className="py-2 px-4 max-w-[15ch] overflow-hidden text-blue-500 cursor-pointer hover:underline">
                            <a
                              href={cred.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {cred.url}
                            </a>
                          </td>
                          <td className="py-2 px-4 text-gray-700  max-w-12">
                            <div className="flex  px-1 min-w-fit  dark:bg-gray-900 dark:text-gray-400  bg-gray-50 border border-gray-200/20 rounded-md justify-between items-center space-x-2 whitespace-nowrap">
                              <span
                                className="overflow-hidden  lg:max-w-24 max-w-[14ch]"
                                title={cred.username}
                              >
                                {cred.username}
                              </span>
                              <button
                                onClick={() => handleCopyText(cred.username)}
                                className="text-gray-300 dark:hover:text-gray-500 dark:text-gray-600 hover:text-gray-400 transition-all"
                              >
                                <FaCopy />
                              </button>
                            </div>
                          </td>
                          <td className="py-2 text-gray-500 px-4  max-w-12">
                            <div className="flex dark:bg-gray-900 min-w-fit dark:text-gray-400 bg-gray-50 border border-gray-200/20 px-1 rounded-md justify-between items-center space-x-2 whitespace-nowrap">
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
                                  onClick={() => handleCopyText(cred.password)}
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
                                className="text-gray-300 dark:text-gray-600 dark:hover:text-blue-600 dark:hover:bg-gray-800 transition-all  hover:text-blue-500 hover:bg-white p-1 rounded-md "
                                onClick={() => {
                                  setSelectedCred(cred.id);
                                  showModal(cred);
                                }}
                              >
                                <MdEdit size={20} />
                              </button>
                              <button
                                className="text-gray-300  dark:text-gray-600 dark:hover:text-red-600 dark:hover:bg-gray-800 transition-all hover:text-red-500 hover:bg-white p-1 rounded-md "
                                onClick={() => handleDelete(cred.id)}
                              >
                                <MdDelete size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ))
                ) : (
                  <div className="flex flex-col justify-center items-center h-full w-full text-gray-500">
                    {/* Icon */}
                    <FiPlusCircle
                      size={80}
                      onClick={() => showModal()}
                      className="mb-4 dark:text-gray-700 cursor-pointer transition-all hover:scale-105 text-blue-200"
                    />

                    {/* Title */}
                    <h2 className="text-xl dark:text-gray-600  text-gray-400 font-semibold">
                      Create Your First Credential
                    </h2>

                    {/* Subtitle */}
                    <p className="  dark:text-gray-600 text-gray-300">
                      Start by adding your credentials securely.
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="w-[30%] xl:w-[20%] min-h-72">
              <h2
                className={`font-semibold ${
                  window.size < 1134 ? "-translate-y-8" : "-translate-y-14"
                } text-center dark:text-gray-100 text-lg lg:text-2xl`}
              >
                Generate Password
              </h2>
              <div
                className={`dark:bg-gray-800 bg-gray-100 ${
                  window.size < 1134 ? "-translate-y-8" : "-translate-y-16"
                } border border-black/5 flex flex-col justify-between -translate-y-8 text-center space-y-5  w-full h-full   text-gray-700 rounded-md p-6`}
              >
                <div className="text-gray-700 border border-black/10 dark:bg-gray-900 dark:text-gray-300 bg-white p-3 text-[1vw] font-mono rounded-md">
                  {genPass || "Generate hackproof password"}
                </div>

                <div className="mt-4 text-left flex flex-col  justify-between   space-y-2">
                  <label className="block text-sm">
                    <input
                      type="number"
                      min="8"
                      max="24"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="mr-2 text-gray-700 dark:text-gray-300 text-center dark:bg-gray-900 px-3 py-2 rounded-md"
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
                    className="bg-gray-300 dark:text-gray-400 dark:hover:bg-gray-900 dark:bg-gray-700 border  border-gray-500/5 text-gray-700 w-full xl:w-[60%] px-4 py-2 rounded-md hover:bg-gray-800 hover:text-gray-100 transition duration-300"
                  >
                    Generate
                  </button>
                  <button
                    onClick={handleCopyPassword}
                    className="bg-gray-300 border  dark:text-gray-400 dark:hover:bg-gray-900 dark:bg-gray-700 border-gray-500/5 text-gray-700 w-full xl:w-[40%] px-4 py-2 rounded-md hover:bg-gray-800 hover:text-gray-100  transition duration-300"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Component */}
          {isModalVisible && (
            <div className="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-50 flex items-center justify-center">
              <div className="dark:bg-gray-800 bg-white p-8 rounded-lg w-96">
                <h2 className="text-2xl mb-4 dark:text-gray-100">
                  {currentCredential ? "Edit Credential" : "Add Credential"}
                </h2>
                <form
                  onSubmit={(event) => {
                    handleSave(event, selectedCred);
                  }}
                >
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="website"
                      value={formValues.website}
                      onChange={handleInputChange}
                      placeholder="Website"
                      className="w-full p-2 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-600 border rounded"
                    />
                    <input
                      type="text"
                      name="url"
                      value={formValues.url}
                      onChange={handleInputChange}
                      placeholder="URL"
                      className="w-full p-2 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-600 border rounded"
                    />
                    <input
                      type="text"
                      name="username"
                      value={formValues.username}
                      onChange={handleInputChange}
                      placeholder="Username"
                      className="w-full p-2 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-600 border rounded"
                    />
                    <input
                      type="text"
                      name="password"
                      value={formValues.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      className="w-full p-2 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-600 border rounded"
                    />
                    <textarea
                      name="notes"
                      value={formValues.notes}
                      onChange={handleInputChange}
                      placeholder="Notes"
                      className="w-full p-2 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-600 border rounded"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalVisible(false)}
                      className="px-4 py-2 dark:bg-gray-700 transition-all dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-900 border rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 border dark:bg-blue-700 dark:border-blue-600 transition-all dark:text-gray-300 dark:hover:bg-blue-900 text-white rounded"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CredentialManager;
