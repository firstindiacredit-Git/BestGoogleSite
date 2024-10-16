// SignIn.js
import React, { useState } from "react";
import { auth, provider } from "../../firebase"; // Import Firebase config
import { useAuth } from "../../hooks/useAuth"; // Custom hook for login
import { signInWithPopup } from "firebase/auth"; // Firebase sign-in method
import { useNavigate } from "react-router-dom"; // Navigation hook
import Header from "../Header"; // Assume this is your custom Header component

const SignIn = () => {
  const { login } = useAuth(); // Assuming you have a login function in the hook
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(false);

  // Function to toggle between dark and light mode
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Email and password sign-in
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear any previous error

    try {
      await login(email, password);
      console.log("Sign-in successful!");
      navigate("/"); // Redirect to homepage
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No user found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else {
        setError("Failed to sign in: " + err.message);
      }
      console.error(err); // Log the error for debugging
    } finally {
      setLoading(false);
    }
  };

  // Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/"); 
    } catch (err) {
      if (err.code === "User have already exist") {
        setError("Use another. Please try again.");
      } else if (err.code === "auth/popup-closed-by-user") {
        setError("The sign-in popup was closed before completing.");
      } else {
        setError("Google sign-in failed: " + err.message);
      }
      console.error(err);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <div className="max-w-md w-full mx-auto mt-8 rounded-none md:rounded-2xl p-4 md:p-8 border shadow-2xl bg-white">
        <h2 className="font-bold text-xl dark:text-neutral-800 text-black">
          Welcome Back
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-500">
          Sign in to access your account
        </p>

        {error && <p className="text-red-500">Error: {error}</p>}

        <form className="my-8" onSubmit={handleEmailSignIn}>
          <div className="mb-4">
            <label htmlFor="email" className="font-medium">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <button
            className="border-blue-500 text-blue-500 rounded hover:bg-blue-500 border hover:text-white w-full h-10 font-medium"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
          <button
            className="border shadow-sm dark:text-green-500 text-lg text-center px-4 w-full h-10 font-medium border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-white"
            type="button"
            onClick={handleGoogleSignIn}
          >
            <div className="text-center justify-center gap-2 flex">
              <img
                src="/google.png"
                className="w-5 h-5 mt-1"
                alt="Google logo"
              />
              Sign in with Google
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
