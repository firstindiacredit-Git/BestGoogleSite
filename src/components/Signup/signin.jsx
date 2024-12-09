import React, { useState } from "react";
// import { useAuth } from "../../hooks/useAuth";
import { auth, provider } from "../../firebase";
import { useAuth } from "../../hooks/AuthContext";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Header from "../Header";
// import { auth, provider } from "../../firebase";
// import { useNavigate } from "react-router-dom";
// import { signInWithPopup } from "firebase/auth";

const SignIn = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      console.log("Sign-in successful!");
      navigate("/");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No user found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else {
        setError("Failed to sign in: " + err.message);
      }
      console.error(err);
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
      if (err.code === "auth/popup-closed-by-user") {
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

      <div className="max-w-md w-full mx-auto mt-8 rounded-none md:rounded-2xl p-4 md:p-8 border shadow-2xl bg-white dark:bg-gray-800">
        <h2 className="font-bold text-xl dark:text-white text-black">
          Welcome Back
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-400">
          Sign in to access your account
        </p>

        {error && (
          <p className="text-red-500 mt-4 text-sm text-center">{error}</p>
        )}

        <form className="my-8" onSubmit={handleEmailSignIn}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="font-medium dark:text-neutral-300"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="font-medium dark:text-neutral-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <button
            className={`border-blue-500 border text-blue-500 rounded hover:bg-blue-500 hover:text-white w-full h-10 font-medium ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-4 h-[1px] w-full" />
          <button
            className="border shadow-sm text-lg text-center px-4 w-full h-10 font-medium border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-white"
            type="button"
            onClick={handleGoogleSignIn}
          >
            <div className="flex items-center justify-center gap-2">
              <img src="/google.png" className="w-5 h-5" alt="Google logo" />
              Sign in with Google
            </div>
          </button>
          <div className="text-center flex justify-center gap-2 mt-4">
            <button
              className="text-blue-500 hover:text-blue-700 transition duration-200"
              onClick={() => navigate("/forgotpassword")}
            >
              Forgot Password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
