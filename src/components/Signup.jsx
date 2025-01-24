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
    // Load reCAPTCHA when component mounts
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          window.grecaptcha.render(recaptchaContainer.current, {
            sitekey: "6LdL78EqAAAAADhSJys9dchITOCB3Q6lyriJOuYF",
            callback: () => setRecaptchaLoaded(true),
          });
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      // Reset reCAPTCHA state when component unmounts
      if (window.grecaptcha) {
        window.grecaptcha.reset();
      }
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-sm shadow-md p-8 w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={() => navigate(-1)}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-center mb-6">Sign up</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleEmailSignUp}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-gray-300 rounded-xs p-2 focus:ring focus:ring-blue-200"
              required
            />
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-gray-300 rounded-xs p-2 focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <input
            type="email"
            placeholder="Work Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-xs p-2 mb-4 focus:ring focus:ring-blue-200"
            required
          />
          <div className="mb-4 relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xs p-2 focus:ring focus:ring-blue-200"
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
            className="w-full bg-indigo-500 text-white py-2 rounded-xs hover:bg-indigo-600 focus:outline-none"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="flex items-center justify-between my-4">
          <div className="w-1/2 h-px bg-gray-300"></div>
          <span className="text-sm text-gray-500 px-4">OR</span>
          <div className="w-1/2 h-px bg-gray-300"></div>
        </div>

        <div className="flex flex-col space-y-2">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading || !recaptchaLoaded}
            className="flex items-center justify-center w-full border border-gray-300 py-2 rounded-xs hover:bg-gray-100 focus:outline-none"
          >
            <img src="/google.png" alt="Google" className="w-5 h-5 mr-2" />
            Sign up with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
