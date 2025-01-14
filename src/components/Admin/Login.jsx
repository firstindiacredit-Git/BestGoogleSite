import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithPopup,
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
      navigate("/Admin/dashboard");
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
    <div className="flex items-center justify-center h-screen">
      <div className="max-w-md w-full mt-4 shadow-xl rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-neutral-50">
        <h2 className="font-bold text-xl text-neutral-800">Admin Sign In</h2>
        <p className="text-neutral-600 text-sm max-w-xl mt-2">
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
            className="border-blue-500 text-indigo-500 rounded hover:bg-indigo-500 hover:text-white w-full border h-10 font-medium "
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
          <button
            className="text-green-500 border shadow-sm hover:text-white text-lg text-center px-4 w-full rounded-xs h-10 font-medium border-green-600 hover:bg-green-500"
            type="button"
            onClick={handleGoogleSignIn}
          >
            <div className="text-center justify-center gap-2 flex p-">
              <div className="rounded-full p-1 bg-white">
              <img
                src="/google.png"
                className="w-5 h-5"
                alt="Google logo"
              />
              </div>
              Sign in with Google
            </div>

          </button>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
