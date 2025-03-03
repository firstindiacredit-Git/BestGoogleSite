import React, { useState, useEffect, useRef } from "react";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, provider } from "../firebase";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { IoEyeOff, IoEye } from "react-icons/io5";
import { protectForm } from "../utils/recaptcha";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const recaptchaContainer = useRef(null);

  const navigate = useNavigate();
  const db = getFirestore();

  const registerUserInFirestore = async (user) => {
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
        subscriptionStatus: "free",
        createdAt: new Date(),
      });
    } catch (error) {
      setError("Failed to save user data. Please try again.");
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await protectForm(
      async () => {
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          const user = userCredential.user;
          await registerUserInFirestore(user);
          navigate("/search");
        } catch (error) {
          setError("Something went wrong. Please try again.");
        }
      },
      (error) => setError(error)
    );

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");

    await protectForm(
      async () => {
        try {
          await signInWithPopup(auth, provider);
          navigate("/search");
        } catch (error) {
          setError("Something went wrong. Please try again.");
        }
      },
      (error) => setError(error)
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        navigate("/search");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    let recaptchaId = null;

    const loadRecaptcha = () => {
      // Clean up any existing reCAPTCHA elements
      const existingScript = document.getElementById("recaptcha-script-signup");
      if (existingScript) {
        existingScript.remove();
      }

      // Create a unique ID for this instance
      recaptchaId = "recaptcha-signup-" + Date.now();
      if (recaptchaContainer.current) {
        recaptchaContainer.current.innerHTML = ""; // Clear any existing content
        recaptchaContainer.current.id = recaptchaId;
      }

      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
      script.id = "recaptcha-script-signup";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (window.grecaptcha && recaptchaContainer.current) {
          try {
            window.grecaptcha.ready(() => {
              window.grecaptcha.render(recaptchaId, {
                sitekey: "6LdL78EqAAAAADhSJys9dchITOCB3Q6lyriJOuYF",
                size: "normal",
                callback: () => setRecaptchaLoaded(true),
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
      const script = document.getElementById("recaptcha-script-signup");
      if (script) {
        script.remove();
      }
      if (window.grecaptcha) {
        try {
          window.grecaptcha.reset();
        } catch (error) {
          console.error("reCAPTCHA reset error:", error);
        }
      }
      // Clear the container
      if (recaptchaContainer.current) {
        recaptchaContainer.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="bg-white relative overflow-clip  dark:bg-[#101020]  rounded-3xl  w-full max-w-lg p-4   ">
      <div className="flex justify-center  rounded-full p-4 w-fit mx-auto items-center my-2">
        <img src="/Favicon.svg" alt="logo" className="w-16" />
      </div>

      <h2 className="text-center text-2xl dark:text-gray-200 text-gray-800 font-medium">
        Create an account
      </h2>
      <h3 className="text-center text-sm mb-6  text-gray-500 dark:text-gray-400">
        Please enter your details to create an account.
      </h3>
      {/* more things */}

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="flex flex-col space-y-2">
        <button
          onClick={handleGoogleSignIn}
          disabled={loading || !recaptchaLoaded}
          className="w-full flex items-center cursor-pointer justify-center gap-2 p-3 border rounded-xs dark:bg-black dark:text-gray-200 dark:border-gray-800 bg-gray-50 rounded-xl hover:bg-gray-200 focus:ring-2 focus:ring-gray-300"
        >
          <img src="/google.png" alt="Google" className="w-5 h-5 mr-2" />
          Sign up with Google
        </button>
      </div>
      <div className="flex items-center justify-center my-6">
        <hr className="border-gray-300  dark:border-gray-400 flex-grow" />
        <span className="px-2 text-gray-500 dark:text-gray-400 font-bold">
          OR
        </span>
        <hr className="border-gray-300 dark:border-gray-400 flex-grow" />
      </div>

      <form onSubmit={handleEmailSignUp}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200"
            required
          />
          <input
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200"
            required
          />
        </div>
        <input
          type="email"
          placeholder="Work Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:ring focus:ring-blue-200"
          required
        />
        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? <IoEye /> : <IoEyeOff />}
          </button>
        </div>
        <div className="flex justify-center mb-4">
          <div ref={recaptchaContainer}></div>
        </div>
        <button
          type="submit"
          disabled={loading || !recaptchaLoaded}
          className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 focus:outline-none"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
};

export default Signup;
