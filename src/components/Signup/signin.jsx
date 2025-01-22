import React, { useState } from "react";
import { auth, provider } from "../../firebase";
import { useAuth } from "../../hooks/AuthContext";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const { login } = useAuth();

  const defaultLogin = async (email, password) => {
    console.log(`Attempting to log in with email: ${email} and password.`);
    return Promise.resolve();
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isPasswordFieldVisible, setIsPasswordFieldVisible] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (validateEmail(email)) {
      setIsPasswordFieldVisible(true);
    } else {
      setError("Please enter a valid email address.");
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("imageTrue", true);
      navigate("/search");
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

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      localStorage.setItem("imageTrue", true);
      navigate("/search");
    } catch (err) {
      if (err.code === "auth/network-request-failed") {
        setError(
          "Network error occurred. Please check your connection and try again."
        );
      } else if (err.code === "auth/popup-blocked") {
        setError(
          "The popup was blocked by your browser. Please allow popups and try again."
        );
      } else {
        setError("Google sign-in failed: " + err.message);
      }
      console.error(err);
    }
  };

  return (
    isModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-sm w-full max-w-md p-6 relative shadow-xl transform transition-all duration-300 scale-100 hover:scale-105">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            onClick={() => navigate(-1)}
          >
            &times;
          </button>

          <h2 className="text-center text-2xl font-extrabold mb-6 text-gray-800">
            Welcome Back
          </h2>

          <button
            className="w-full flex items-center justify-center gap-2 p-3 border rounded-xs bg-gray-100 hover:bg-gray-200 focus:ring-2 focus:ring-gray-300"
            onClick={handleGoogleSignIn}
          >
            <img src="/google.png" alt="Google" className="w-5 h-5" />
            <span className="font-medium">Continue with Google</span>
          </button>

          <div className="flex items-center justify-center my-6">
            <hr className="border-gray-300 flex-grow" />
            <span className="px-2 text-gray-500">OR</span>
            <hr className="border-gray-300 flex-grow" />
          </div>

          {!isPasswordFieldVisible ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-xs focus:ring-2 focus:ring-blue-500"
                required
              />

              <button
                type="submit"
                className="w-full p-3 bg-indigo-600 text-white rounded-xs hover:bg-indigo-700 focus:ring-2 focus:ring-blue-500"
              >
                Continue
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-xs focus:ring-2 focus:ring-blue-500"
                required
              />

              <button
                type="submit"
                className={`w-full p-3 bg-indigo-600 text-white rounded-xs hover:bg-indigo-700 focus:ring-2 focus:ring-blue-500 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner border-t-2 border-blue-500 border-solid w-5 h-5 block mx-auto rounded-full animate-spin"></span>
                ) : (
                  "Sign In"
                )}
              </button>
              <div className="text-center flex justify-center gap-2 mt-4">
                <button
                  className="text-indigo-500 hover:text-indigo-700 transition duration-200"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          )}

          {error && (
            <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
          )}

          <p className="text-xs text-gray-500 text-center mt-6">
            By continuing, you agree to our
            <a href="/terms" className="text-indigo-500 underline mx-1">
              Terms & Conditions
            </a>
            and
            <a href="/privacy" className="text-indigo-500 underline mx-1">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    )
  );
};

export default SignIn;
