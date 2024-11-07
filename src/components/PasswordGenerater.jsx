import React, { useState, useEffect } from "react";
import { FaTrash, FaCopy } from "react-icons/fa";
import { db } from "../firebase"; // Adjust the import path as needed
import {
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const PasswordGenerator = () => {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    url: "",
    email: "",
    phone: "",
  });
  const [submittedData, setSubmittedData] = useState([]);
  const [copyAlert, setCopyAlert] = useState("");

  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (currentUser) {
      const userDocRef = collection(
        db,
        "users",
        currentUser.uid,
        "passwords"
      );
      const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubmittedData(data);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  const generatePassword = async () => {
    if (
      !formData.name ||
      !formData.username ||
      !formData.email ||
      !formData.phone
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const characters =
      "abcdefghijklmnopqrstuvwxyz" +
      (includeUppercase ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "") +
      (includeNumbers ? "0123456789" : "") +
      (includeSymbols ? "!@#$%^&*()_+[]{}|;:,.<>?" : "");
    let generatedPassword = "";
    for (let i = 0; i < length; i++) {
      generatedPassword +=
        characters[Math.floor(Math.random() * characters.length)];
    }

    setPassword(generatedPassword);
    const newEntry = { ...formData, password: generatedPassword };

    try {
      await addDoc(
        collection(db, "users", currentUser.uid, "passwords"),
        newEntry
      );
      setFormData({ name: "", username: "", url: "", email: "", phone: "" });
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  const handleDelete = async (docId) => {
    try {
      await deleteDoc(
        doc(db, "users", currentUser.uid, "passwords", docId)
      );
      setSubmittedData(submittedData.filter((item) => item.id !== docId));
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopyAlert("Copied to clipboard!");
    setTimeout(() => setCopyAlert(""), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Password Generator
        </h2>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {["name", "username", "url", "email", "phone"].map((field) => (
            <div key={field}>
              <label htmlFor={field} className="block mb-2 capitalize">
                {field}
              </label>
              <input
                id={field}
                name={field}
                type={field === "email" ? "email" : "text"}
                value={formData[field]}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        {/* Password Length & Options */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label htmlFor="password-length" className="block mb-2">
              Password Length
            </label>
            <input
              id="password-length"
              type="number"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              min="4"
              max="20"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {[
            ["Include Uppercase", includeUppercase, setIncludeUppercase],
            ["Include Numbers", includeNumbers, setIncludeNumbers],
            ["Include Symbols", includeSymbols, setIncludeSymbols],
          ].map(([label, state, setter], i) => (
            <div key={i}>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={state}
                  onChange={() => setter(!state)}
                  className="mr-2"
                />
                {label}
              </label>
            </div>
          ))}
        </div>

        {/* Generate Password Button */}
        <button
          onClick={generatePassword}
          className="w-full py-3 bg-green-500 text-white rounded mt-4 hover:bg-green-600 focus:outline-none"
        >
          Generate Password
        </button>

        {/* Display Password and Copy Button */}
        <div className="mt-6 flex items-center space-x-2">
          <input
            type="text"
            value={password}
            readOnly
            className="w-full p-3 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => copyToClipboard(password)}
            className="p-3 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none"
          >
            <FaCopy />
          </button>
        </div>
        {copyAlert && (
          <div className="mt-2 text-green-500 text-center">{copyAlert}</div>
        )}

        {/* Display Submitted Data in Table */}
        {submittedData.length > 0 && (
          <div className="mt-6">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Username</th>
                  <th className="border px-4 py-2">URL</th>
                  <th className="border px-4 py-2">Generated Password</th>
                  <th className="border px-4 py-2">Email</th>
                  <th className="border px-4 py-2">Phone</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submittedData.map((data) => (
                  <tr key={data.id}>
                    <td className="border px-4 py-2">{data.name}</td>
                    <td className="border px-4 py-2">{data.username}</td>
                    <td className="border px-4 py-2">{data.url}</td>
                    <td className="border px-4 py-2">{data.password}</td>
                    <td className="border px-4 py-2">{data.email}</td>
                    <td className="border px-4 py-2">{data.phone}</td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => handleDelete(data.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordGenerator;
