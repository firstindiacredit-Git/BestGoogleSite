import React, { useState } from "react";
import { auth, provider } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Header from "../Header";

const SignIn = () => {
  const { login } = useAuth();
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

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear any previous error

    try {
      await login(email, password);
      console.log("Sign-in successful!");
      navigate("/"); // Redirect to homepage
    } catch (err) {
      setError("Failed to sign in: " + err.message);
      console.error(err); // Log the error for debugging
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/"); // Redirect to homepage
    } catch (err) {
      setError("Google sign-in failed: " + err.message);
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

      <div className="max-w-md w-full mx-auto mt-8 rounded-none md:rounded-2xl p-4 md:p-8 border shadow-2xl shadow-input bg-white">
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
            className="border shadow-sm text-mt-1 dark:text-green-500 text-lg text-center px-4 w-full h-10 font-medium border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-white"
            type="button"
            onClick={handleGoogleSignIn}
          >
            <div className="text-center justify-center gap-2 flex">
              <img
                src="./src/assets/google.png"
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
