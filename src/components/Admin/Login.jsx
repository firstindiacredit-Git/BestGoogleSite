import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, provider } from "../../firebase";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      navigate("/");
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/Admin/dashboard");
    } catch (error) {
      setError(error.message);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="max-w-md w-full mt-4 shadow-xl rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-neutral-50">
        <h2 className="font-bold text-xl text-neutral-800">Admin Sign In</h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2">
          Sign in to access BEST GOOGLE SITE
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
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <button
            className="border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white w-full border h-10 font-medium "
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
          <button
            className="text-white border shadow-sm dark:text-green-500 text-lg text-center px-4 w-full rounded-md h-10 font-medium border-green-500 hover:bg-green-500 hover:text-white"
            type="button"
            onClick={handleGoogleSignIn}
          >
            <div className="text-center justify-center gap-2 flex p-">
              <img
                src="../src/assets/google.png"
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

export default SignInPage;
