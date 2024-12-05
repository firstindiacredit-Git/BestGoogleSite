import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, getDocs, query } from "firebase/firestore";
import { FaLock, FaEye, FaEyeSlash, FaCopy } from "react-icons/fa";

const CredentialManager = () => {
  const userId = auth.currentUser?.uid;
  const [showPasswords, setShowPasswords] = useState({});
  const [isGridView, setIsGridView] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentCredential, setCurrentCredential] = useState(null);
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
  const correctPassword = "0000";
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeLetters, setIncludeLetters] = useState(true);
  const [includeSpecialChars, setIncludeSpecialChars] = useState(true);
  const placeholderCredentials = [
    {
      website: "Google",
      url: "https://www.google.com",
      username: "your username",
      password: "your password",
    },
    {
      website: "Facebook",
      url: "https://www.facebook.com",
      username: "your username",
      password: "your password",
    },
    {
      website: "Twitter",
      url: "https://www.twitter.com",
      username: "your username",
      password: "your password",
    },
    {
      website: "Instagram",
      url: "https://www.instagram.com",
      username: "your username",
      password: "your password",
    },
    {
      website: "LinkedIn",
      url: "https://www.linkedin.com",
      username: "your username",
      password: "your password",
    },
    {
      website: "YouTube",
      url: "https://www.youtube.com",
      username: "your username",
      password: "your password",
    },
    {
      website: "GitHub",
      url: "https://www.github.com",
      username: "your username",
      password: "your password",
    },
    {
      website: "Amazon",
      url: "https://www.amazon.com",
      username: "your username",
      password: "your password",
    },
    {
      website: "Netflix",
      url: "https://www.netflix.com",
      username: "your username",
      password: "your password",
    },
    {
      website: "Spotify",
      url: "https://www.spotify.com",
      username: "your username",
      password: "your password",
    },
  ];

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

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  // Add filter function for search
  const filteredCredentials = credentials.filter((cred) =>
    cred.website.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Function to load credentials from Firestore
  const loadCredentialsFromFirestore = async () => {
    try {
      if (userId) {
        const q = query(collection(db, `users/${userId}/passwords`));
        const querySnapshot = await getDocs(q);
        const loadedCredentials = querySnapshot.docs.map((doc) => doc.data());
        setCredentials(loadedCredentials);
      }
    } catch (error) {
      console.error("Error loading documents: ", error);
    }
  };

  useEffect(() => {
    loadCredentialsFromFirestore();
  }, [userId]);

  const handleSave = async (event) => {
    event.preventDefault();
    const { website, url, username, password, notes } = formValues;

    try {
      const newCredential = { website, url, username, password, notes };
      if (currentCredential) {
        // Update logic if needed
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

  const handleDelete = (website) => {
    setCredentials(credentials.filter((cred) => cred.website !== website));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleUnlock = () => {
    if (password === correctPassword) {
      setIsLocked(false);
    } else {
      alert("Incorrect password!");
    }
  };

  return (
    <>
      {isLocked ? (
        <div className="fixed w-full bg-opacity-50 py-[5vh] flex items-center justify-center">
          <div className="bg-gray-50 p-8 text-center rounded-lg shadow-lg w-96">
            <div className="flex justify-center">
              <FaLock color="#3B82F6" size={50} />
            </div>
            <h2 className="text-2xl my-1 font-bold">Credential Locker</h2>
            <div className="mb-4 text-gray-600">
              Enter PIN to access credentials
            </div>
            <div className="w-full px-4 space-x-4">
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-32 px-4 py-2 border border-gray-300 rounded-md mb-4"
                placeholder="Enter PIN"
              />
              <button
                onClick={handleUnlock}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Unlock
              </button>
            </div>
            <div className="text-sm text-gray-600 relative group">
              PIN?
              <span className="absolute w-fit left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg cursor-default opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Current PIN: 0000
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto p-12 pb-14 bg-[#f8f9fa]">
          <div className="flex justify-between w-[79.2%] items-center">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4"
              onClick={() => showModal()}
            >
              Add Credential
            </button>

            <div className="relative flex space-x-3 w-1/3 mb-4">
              <input
                type="text"
                placeholder="Search websites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                className={`px-3 py-1 rounded-lg border border-black/5 hover:border-white/20 ${
                  !isGridView
                    ? "bg-gray-400 text-white hover:border-white/20"
                    : "bg-gray-200"
                }`}
                onClick={() => setIsGridView(false)}
              >
                list
              </button>
              <button
                className={`px-3 py-1 rounded-lg border border-black/5 hover:border-white/20 ${
                  isGridView
                    ? "bg-gray-400 text-white hover:border-white/20"
                    : "bg-gray-200"
                }`}
                onClick={() => setIsGridView(true)}
              >
                grid
              </button>
            </div>
            <div className="space-x-2">
              <button
                className="transition-all w-24 bg-gray-300 hover:bg-gray-600 hover:text-gray-100 text-gray-800 border border-black/5 px-4 py-2 rounded-md mb-4"
                onClick={toggleAllPasswordVisibility}
              >
                {Object.values(showPasswords).some((value) => value)
                  ? "Hide All"
                  : "Show All"}
              </button>
              <button
                className="transition-all bg-red-500 text-white px-4 py-2 rounded-md mb-4"
                onClick={() => {
                  setIsLocked(true);
                  setPassword("");
                }}
              >
                Lock Credential
              </button>
            </div>
          </div>

          <div className="flex justify-between space-x-4 w-full">
            {isGridView ? (
              <div className="grid grid-cols-3 gap-4 w-[80%]">
                {filteredCredentials.map((cred, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-md"
                  >
                    <div className="font-semibold text-lg mb-2">
                      {cred.website}
                    </div>
                    <div className="text-blue-500 hover:underline mb-2">
                      <a
                        href={cred.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {cred.url}
                      </a>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Username:</span>
                      <div className="flex items-center space-x-1">
                        <span>{cred.username}</span>
                        <button
                          onClick={() => handleCopyText(cred.username)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FaCopy />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Password:</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-800">
                          {showPasswords[cred.website]
                            ? cred.password
                            : "••••••••"}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(cred.website)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords[cred.website] ? (
                            <FaEye />
                          ) : (
                            <FaEyeSlash />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopyText(cred.password)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FaCopy />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        className="text-blue-500 hover:underline"
                        onClick={() => showModal(cred)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-500 hover:underline"
                        onClick={() => handleDelete(cred.website)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto w-[80%] bg-white shadow-md rounded-lg">
                <table className="min-w-full border rounded-lg border-black/5 table-auto">
                  <thead className="bg-gray-100 rounded-lg">
                    <tr className="rounded-lg">
                      <th className="py-2 px-4 w-8 text-left">S.no</th>
                      <th className="py-2 px-4 text-left">Website</th>
                      <th className="py-2 px-4  text-left">URL</th>
                      <th className="py-2 px-4 text-left">Username</th>
                      <th className="py-2 px-4 text-left">Password</th>
                      <th className="py-2 px-4 text-left">Notes</th>
                      <th className="py-2 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="rounded-lg">
                    {filteredCredentials.map((cred, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4 w-8">{index + 1}</td>
                        <td className="py-2 px-4">{cred.website}</td>
                        <td className="py-2 px-4 max-w-[15ch] overflow-hidden text-blue-500 cursor-pointer hover:underline">
                          <a
                            href={cred.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {cred.url}
                          </a>
                        </td>
                        <td className="py-2 px-4 text-gray-700 max-w-12">
                          <div className="flex  px-1   bg-gray-50 border border-gray-200/20 rounded-md justify-between items-center space-x-2 whitespace-nowrap">
                            <span
                              className="overflow-hidden min-w-[10ch]"
                              title={cred.username}
                            >
                              {cred.username}
                            </span>
                            <button
                              onClick={() => handleCopyText(cred.username)}
                              className="text-gray-200 hover:text-gray-400 transition-all"
                            >
                              <FaCopy />
                            </button>
                          </div>
                        </td>
                        <td className="py-2 text-gray-500 px-4 max-w-12">
                          <div className="flex bg-gray-50 border border-gray-200/20 px-1 rounded-md justify-between items-center space-x-2 whitespace-nowrap">
                            <span
                              className="overflow-hidden min-w-[10ch]"
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
                                className="text-gray-300 hover:text-gray-400 transition-all"
                              >
                                {showPasswords[cred.website] ? (
                                  <FaEye />
                                ) : (
                                  <FaEyeSlash />
                                )}
                              </button>
                              <button
                                onClick={() => handleCopyText(cred.password)}
                                className="text-gray-300 hover:text-gray-400 transition-all"
                              >
                                <FaCopy />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-4">{cred.notes}</td>
                        <td className="py-2 px-4">
                          <div className="flex justify-center space-x-2">
                            <button
                              className="text-blue-500 hover:underline"
                              onClick={() => showModal(cred)}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-500 hover:underline"
                              onClick={() => handleDelete(cred.website)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="w-[20%]">
              <h2 className="font-semibold -translate-y-14 text-center text-2xl">
                Generate Password
              </h2>
              <div className="bg-gray-100 border border-black/5 -translate-y-8 text-center space-y-5 shadow-xl w-full min-h-24 text-gray-700 rounded-md p-6">
                <div className="text-gray-700 border border-black/10 bg-white p-3 text-lg font-mono rounded-md">
                  {genPass || "Generate Hackproof Password"}
                </div>

                <div className="mt-4 text-left space-y-2">
                  <label className="block text-sm">
                    <input
                      type="number"
                      min="8"
                      max="24"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="mr-2 text-gray-700 px-3 py-2 rounded-md"
                    />
                    <span>Length</span>
                  </label>
                  <label className="block text-sm">
                    <input
                      type="checkbox"
                      checked={includeNumbers}
                      onChange={() => setIncludeNumbers(!includeNumbers)}
                      className="mr-2"
                    />
                    Numbers (0-9)
                  </label>
                  <label className="block text-sm">
                    <input
                      type="checkbox"
                      checked={includeLetters}
                      onChange={() => setIncludeLetters(!includeLetters)}
                      className="mr-2"
                    />
                    Letters (a-z, A-Z)
                  </label>
                  <label className="block text-sm">
                    <input
                      type="checkbox"
                      checked={includeSpecialChars}
                      onChange={() =>
                        setIncludeSpecialChars(!includeSpecialChars)
                      }
                      className="mr-2"
                    />
                    Special Characters (!@#$%^&*)
                  </label>
                </div>
                <div className="flex justify-center w-full space-x-3 mt-4">
                  <button
                    onClick={() => generateRandomPassword(length)}
                    className="bg-gray-300 border border-gray-500/5 text-gray-700 w-[70%] px-4 py-2 rounded-md hover:bg-gray-800 hover:text-gray-100 transition duration-300"
                  >
                    Generate
                  </button>
                  <button
                    onClick={handleCopyPassword}
                    className="bg-gray-300 border border-gray-500/5 text-gray-700 w-[30%] px-4 py-2 rounded-md hover:bg-gray-800 hover:text-gray-100  transition duration-300"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Component */}
          {isModalVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-8 rounded-lg w-96">
                <h2 className="text-2xl mb-4">
                  {currentCredential ? "Edit Credential" : "Add Credential"}
                </h2>
                <form onSubmit={handleSave}>
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="website"
                      value={formValues.website}
                      onChange={handleInputChange}
                      placeholder="Website"
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      name="url"
                      value={formValues.url}
                      onChange={handleInputChange}
                      placeholder="URL"
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      name="username"
                      value={formValues.username}
                      onChange={handleInputChange}
                      placeholder="Username"
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      name="password"
                      value={formValues.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      className="w-full p-2 border rounded"
                    />
                    <textarea
                      name="notes"
                      value={formValues.notes}
                      onChange={handleInputChange}
                      placeholder="Notes"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalVisible(false)}
                      className="px-4 py-2 border rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded"
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
