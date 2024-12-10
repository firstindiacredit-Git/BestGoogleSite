import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const CredentialManager = () => {
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

  return (
    <div>
      {/* Password Section (for changing PIN) */}
      {userId && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Change PIN</h2>
          <div className="mb-4 flex space-x-2">
            {newPin.map((digit, index) => (
              <input
                key={index}
                id={`pin-input-${index}`}
                type="text"
                value={digit}
                maxLength="1"
                onChange={(e) => handleInputChange(e, index)}
                className="w-12 h-12 text-center text-2xl border p-2 rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>
          <button
            onClick={handleChangePin}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            Update PIN
          </button>
        </div>
      )}
    </div>
  );
};

export default CredentialManager;
