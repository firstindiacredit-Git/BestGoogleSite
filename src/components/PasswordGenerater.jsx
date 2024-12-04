import React, { useState, useEffect } from "react";
import { db } from "../../src/firebase"; // Import Firebase config
import { FaLock } from "react-icons/fa";

const CredentialManager = () => {
  // Initial placeholder credentials
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

  const [credentials, setCredentials] = useState(placeholderCredentials);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentCredential, setCurrentCredential] = useState(null);
  const [formValues, setFormValues] = useState({
    website: "",
    url: "",
    username: "",
    password: "",
    notes: "",
  });
  const [length, setLength] = useState(6);
  const [genPass, setGenPass] = useState("");

  // Locker screen state
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState("");
  const correctPassword = "0000"; // Set the correct password here
  const [includeNumbers, setIncludeNumbers] = useState(true);
const [includeLetters, setIncludeLetters] = useState(true);
const [includeSpecialChars, setIncludeSpecialChars] = useState(true);

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
  
    // If no character types are selected, default to letters
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
  
  // Handle password copy
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(genPass).then(() => {
      alert("Password copied to clipboard!");
    });
  };

  // Show modal for add/edit
  const showModal = (credential = null) => {
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
    setIsModalVisible(true);
  };

  // Handle saving credentials (add or edit)
  const handleSave = async (event) => {
    event.preventDefault();
    const { website, url, username, password, notes } = formValues;

    try {
      if (currentCredential) {
        // Edit existing credential
        setCredentials(
          credentials.map((cred) =>
            cred.website === currentCredential.website
              ? { ...cred, website, url, username, password, notes }
              : cred
          )
        );
      } else {
        // Add new credential
        setCredentials([
          ...credentials,
          { website, url, username, password, notes },
        ]);
      }
      setIsModalVisible(false);
      setCurrentCredential(null);
    } catch (error) {
      console.error("Error saving credential:", error);
    }
  };

  // Handle delete action
  const handleDelete = (website) => {
    setCredentials(credentials.filter((cred) => cred.website !== website));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Handle password verification
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
         <div className="mb-4 text-gray-600">Enter PIN to access credentials</div>
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
        <div className=" mx-auto p-12 pb-14 bg-[#f8f9fa]">
          <div className="flex justify-between w-full">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4"
              onClick={() => showModal()}
            >
              Add Credential
            </button>
            <button
              className="transition-all border-red-500 border text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-md mb-4"
              onClick={() => {setIsLocked(true); setPassword("") }}
            >
              Lock Credential
            </button>
          </div>

          <div className="flex justify-between space-x-4 w-full">
            <div className="overflow-x-auto w-[80%] bg-white shadow-md rounded-lg">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 w-8 text-left">S.no</th>
                    <th className="py-2 px-4 text-left">Website</th>
                    <th className="py-2 px-4 text-left">URL</th>
                    <th className="py-2 px-4 text-left">Username</th>
                    <th className="py-2 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {credentials.map((cred, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 w-8">{index + 1}</td>
                      <td className="py-2 px-4">{cred.website}</td>
                      <td className="py-2 px-4">{cred.url}</td>
                      <td className="py-2 px-4">{cred.username}</td>
                      <td className="py-2 px-4 flex space-x-2">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="w-[20%]">
              <div className="bg-gray-700 text-center space-y-5 shadow-xl w-full min-h-24 text-white rounded-md p-6">
                <h2 className="text-2xl font-semibold">Generate Password</h2>
                <div className="text-black bg-gray-100 p-3 text-xl font-mono rounded-md">
                  {genPass || "Your password will appear here"}
                </div>
              
                  
                <div className="mt-4 text-left space-y-2">
                  <label className="block text-sm ">
                    <input
                      type="number"
                      min="6"
                      max="20"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="mr-2 text-black px-3 py-2 rounded-md"
                    />
                    <span className="">Length</span>
                  </label>
                  <label className="block text-sm ">
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
                    className="bg-black text-white  w-full px-4 py-2 rounded-md hover:bg-gray-800 transition duration-300"
                  >
                    Generate
                  </button>
                  <button
                    onClick={handleCopyPassword}
                    className="bg-blue-500 text-white w-full  px-4 py-2 rounded-md hover:bg-blue-400 transition duration-300"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CredentialManager;
