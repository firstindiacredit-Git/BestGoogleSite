import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updatePassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { FaEye, FaEyeSlash, FaPen } from "react-icons/fa";

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

  // PIN Change State
  const [userId, setUserId] = useState(null);
  const [userPin, setUserPin] = useState("");
  const [newPin, setNewPin] = useState(["", "", "", ""]);
  const [showPin, setShowPin] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || "Alexis Hill");
        setEmail(user.email || "example@mail.com");
        setAvatarUrl(user.photoURL || "/path/to/default-avatar.jpg");
        setUserId(user.uid);
        fetchUserPin(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

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

  const handleSaveName = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, { displayName: username });
        const userDoc = doc(db, "users", currentUser.uid);
        await setDoc(userDoc, { username }, { merge: true });
      }
      setIsEditingName(false);
    } catch (error) {
      console.error("Error saving name:", error);
    }
  };

  const handleSavePassword = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser && password.length >= 6) {
        await updatePassword(currentUser, password);
      }
      setIsEditingPassword(false);
    } catch (error) {
      console.error("Error saving password:", error);
    }
  };

  const handleUpgrade = () => {
    navigate("/premiumPage");
  };

   const goBack = () => {
     navigate(-1); 
   };

  return (
    <div className="min-h-screen bg-gray-50  dark:bg-gray-900 p-6">
      <button
        onClick={goBack}
        className="absolute top-4 left-4 text-blue-600 border border-blue-600 px-6 py-1 rounded hover:text-white hover:bg-blue-600"
      >
        Back
      </button>
      <h1 className="text-2xl m-auto text-center font-semibold mb-6">
        USER ACCOUNT
      </h1>

      {/* Account Details Section */}
      <div className="bg-white dark:bg-gray-800 w-[60%] m-auto rounded-lg shadow-lg p-6 space-y-4">
        {/* Avatar Section */}
        <div className="flex items-center space-x-4">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-700"
          />
          <div>
            <h2 className="font-semibold">{username}</h2>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
        </div>

        {/* Username */}
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h2 className="font-semibold">Name</h2>
            {isEditingName && (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border rounded p-2 w-full"
                />
                <button
                  onClick={handleSaveName}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            )}
          </div>
          <button onClick={() => setIsEditingName(!isEditingName)}>
            <FaPen className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Password */}
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h2 className="font-semibold">Password</h2>
            {isEditingPassword && (
              <div className="flex items-center space-x-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border rounded p-2 w-full"
                />
                <button onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                <button
                  onClick={handleSavePassword}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            )}
          </div>
          <button onClick={() => setIsEditingPassword(!isEditingPassword)}>
            <FaPen className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Account Type */}
        <div className="flex justify-between border-b items-center">
          <div>
            <h2 className="font-semibold">Account</h2>
            <p className="text-green-500">{accountType}</p>
          </div>
          <button
            onClick={handleUpgrade}
            className="bg-yellow-400 text-black px-4 py-2 rounded font-bold flex items-center space-x-2 hover:bg-yellow-500"
          >
            <span>⚡</span>
            <span>Get Pro</span>
          </button>
        </div>

        {/* Change PIN Section */}
        {userId && (
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold ">Change PIN</h2>
              {isEditingPin && (
                <div className="relative mb-2 flex items-center space-x-2">
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
                    className="flex items-center text-gray-500 dark:text-gray-400"
                  >
                    {showPin ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  <button
                    onClick={handleChangePin}
                    className="bg-blue-600 text-white py-1 px-10 rounded"
                  >
                    Update PIN
                  </button>
                </div>
              )}
            </div>
            <button onClick={() => setIsEditingPin(!isEditingPin)}>
              <FaPen className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
