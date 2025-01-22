import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Check your inbox!");
    } catch (err) {
      setError(
        err.message.includes("user-not-found")
          ? "No user found with this email."
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    navigate("/search");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <button
        onClick={goBack}
        className="absolute top-4 left-4 text-indigo-600 border border-blue-600 px-6 py-1 rounded hover:text-white hover:bg-indigo-600"
      >
        Back
      </button>
      <div className="relative bg-white p-6 rounded-sm shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Reset Password</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter your email address to receive a password reset link.
        </p>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-xs focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 px-4 text-white font-medium rounded-xs ${
              isSubmitting ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-sm text-center text-green-600">{message}</p>
        )}
        {error && (
          <p className="mt-4 text-sm text-center text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
