import { useState, useEffect, useRef } from "react";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link } from "react-router-dom";
import { protectForm } from "../../utils/recaptcha";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import PropTypes from "prop-types";

const SignIn = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordFieldVisible, setIsPasswordFieldVisible] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const recaptchaContainer = useRef(null);
  
  const { googleLogin } = useAuth();
  const db = getFirestore();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    await protectForm(
      () => setIsPasswordFieldVisible(true),
      (error) => setError(error)
    );
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await protectForm(
      async () => {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          // No profession/interest check
          if (onSuccess) onSuccess();
        } catch (err) {
          if (err.code === "auth/user-not-found") {
            setError("No user found with this email.");
          } else if (err.code === "auth/wrong-password") {
            setError("Incorrect password. Please try again.");
          } else {
            setError("Failed to sign in: " + err.message);
          }
          console.error(err);
        }
      },
      (error) => setError(error)
    );

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    
    try {
      const result = await googleLogin();
      if (result.success && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let recaptchaId = null;

    const loadRecaptcha = () => {
      // Clean up any existing reCAPTCHA elements
      const existingScript = document.getElementById("recaptcha-script-signin");
      if (existingScript) {
        existingScript.remove();
      }

      // Create a unique ID for this instance
      recaptchaId = "recaptcha-signin-" + Date.now();
      if (recaptchaContainer.current) {
        recaptchaContainer.current.innerHTML = ""; // Clear any existing content
        recaptchaContainer.current.id = recaptchaId;
      }

      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
      script.id = "recaptcha-script-signin";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (window.grecaptcha && recaptchaContainer.current) {
          try {
            window.grecaptcha.ready(() => {
              window.grecaptcha.render(recaptchaId, {
                sitekey: "6LdL78EqAAAAADhSJys9dchITOCB3Q6lyriJOuYF",
                size: "normal",
                callback: () => {
                  setRecaptchaLoaded(true);
                },
              });
            });
          } catch (error) {
            console.error("reCAPTCHA render error:", error);
          }
        }
      };

      document.body.appendChild(script);
    };

    // Load reCAPTCHA with a small delay to ensure DOM is ready
    const timer = setTimeout(loadRecaptcha, 100);

    return () => {
      clearTimeout(timer);
      // Clean up reCAPTCHA
      const script = document.getElementById("recaptcha-script-signin");
      if (script) {
        script.remove();
      }
      if (window.grecaptcha && window.grecaptcha.reset) {
        try {
          window.grecaptcha.reset();
        } catch (error) {
          // Only log if it's not the "No reCAPTCHA clients exist" error
          if (!error.message.includes("No reCAPTCHA clients exist")) {
            console.error("reCAPTCHA reset error:", error);
          }
        }
      }
      // Clear the container
      if (recaptchaContainer.current) {
        recaptchaContainer.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div>
      <div className="bg-white relative overflow-clip  dark:bg-[#101020]    w-full max-w-lg p-6   ">
        <div className="flex justify-center  rounded-full p-4 w-fit mx-auto items-center my-2">
          <img src="/Favicon.svg" alt="logo" className="w-16" />
        </div>

        <h2 className="text-center text-2xl dark:text-gray-200 text-gray-800 font-medium">
          Welcome back
        </h2>
        <h3 className="text-center text-sm mb-6  text-gray-500 dark:text-gray-400">
          Please enter your details to sign in.
        </h3>
        {/* more things */}

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <button
          className="w-full flex items-center justify-center gap-2 p-3 border rounded-xs dark:bg-black dark:text-gray-200 dark:border-gray-800 bg-gray-50 rounded-xl hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <img src="/google.png" alt="Google" className="w-5 h-5" />
          <span className="font-medium">
            {loading ? "Signing in..." : "Continue with Google"}
          </span>
        </button>
        <div className="flex items-center justify-center my-6">
          <hr className="border-gray-300  dark:border-gray-400 flex-grow" />
          <span className="px-2 text-gray-500 dark:text-gray-400 font-bold">
            OR
          </span>
          <hr className="border-gray-300 dark:border-gray-400 flex-grow" />
        </div>

        {!isPasswordFieldVisible ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="flex justify-center">
              <div ref={recaptchaContainer} className="mt-4"></div>
            </div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg dark:bg-[#28283a] dark:text-gray-200 dark:border-gray-800 "
              required
            />

            <Link to="/forgot-password">
              <div className="underline text-gray-800 dark:text-gray-200 my-2 text-right">
                Forgot Password?
              </div>
            </Link>

            <button
              type="submit"
              className="w-full p-3 bg-indigo-500 dark:bg-black cursor-pointer text-gray-200 dark:border-gray-800 border rounded-xl hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg dark:bg-blue-950 dark:text-gray-200 dark:border-gray-800 "
              required
            />

            <div className="flex justify-center">
              <div ref={recaptchaContainer} className="mt-4"></div>
            </div>
            <Link to="/forgot-password">
              <div className="underline text-gray-800 dark:text-gray-200 my-2 text-right">
                Forgot Password?
              </div>
            </Link>
            <button
              type="submit"
              className={`w-full p-3 bg-indigo-600 text-white rounded-xs hover:bg-indigo-700 focus:ring-2 focus:ring-blue-500 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading || !recaptchaLoaded}
            >
              {loading ? (
                <span className="spinner border-t-2 border-blue-500 border-solid w-5 h-5 block mx-auto rounded-full animate-spin"></span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        )}
      </div>
      {/* Remove profession and interest modals */}
    </div>
  );
};

SignIn.propTypes = {
  onSuccess: PropTypes.func,
};

export default SignIn;