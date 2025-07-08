import React, { useState, useEffect, useRef } from "react";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, provider } from "../firebase";
import { getFirestore, setDoc, doc, getDoc } from "firebase/firestore";
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

  // Form validation states
  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    profession: "",
  });
  const [formTouched, setFormTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    profession: false,
  });

  const navigate = useNavigate();
  const db = getFirestore();

  const professionOptions = [
    { id: "developer", name: "Developer / Programmer", icon: "💻", desc: "Software development and programming" },
    { id: "designer", name: "Designer (UI/UX, Graphic, Web)", icon: "🎨", desc: "Creative design and user experience" },
    { id: "digital_marketer", name: "Digital Marketer", icon: "📱", desc: "Digital marketing and online promotion" },
    { id: "student", name: "Student", icon: "🎓", desc: "Currently studying or pursuing education" },
    { id: "teacher", name: "Teacher / Educator", icon: "👩‍🏫", desc: "Teaching in a school, college, or university" },
    { id: "entrepreneur", name: "Entrepreneur / Founder", icon: "🚀", desc: "Running your own business or startup" },
    { id: "freelancer", name: "Freelancer (Creative or Technical)", icon: "🆓", desc: "Working independently on projects" },
    { id: "consultant", name: "Consultant / Advisor", icon: "💡", desc: "Providing expert advice and consultation" },
    { id: "working_professional", name: "Working Professional", icon: "💼", desc: "Working in a professional field" },
    { id: "researcher", name: "Researcher / Academic", icon: "🔬", desc: "Research and academic work" },
    { id: "it_support", name: "IT / Tech Support", icon: "🛠️", desc: "IT support and technical assistance" },
    { id: "medical", name: "Medical Professional", icon: "⚕️", desc: "Healthcare and medical services" },
    { id: "retired", name: "Retired", icon: "🌅", desc: "Retired from active work" },
    { id: "other", name: "Other", icon: "✨", desc: "Other profession or occupation" },
  ];

  const [profession, setProfession] = useState("");
  const [showProfessionModal, setShowProfessionModal] = useState(false);

  const interestOptions = [
    { id: "productivity_seeker", name: "Productivity Seeker", icon: "⚡" },
    { id: "lifelong_learner", name: "Lifelong Learner", icon: "🧠" },
    { id: "self_improvement", name: "Self-Improvement / Mindfulness", icon: "🧘" },
    { id: "traveller", name: "Traveller / Explorer", icon: "✈️" },
    { id: "content_creator", name: "Content Creator / YouTuber", icon: "📹" },
    { id: "gamer", name: "Gamer", icon: "🎮" },
    { id: "music_lover", name: "Music Lover / Podcaster", icon: "🎵" },
    { id: "cooking", name: "Cooking & Foodie", icon: "🍳" },
    { id: "photographer", name: "Photographer", icon: "📸" },
    { id: "artist", name: "Artist / Creative", icon: "🎨" },
    { id: "reader", name: "Reader / Bookworm", icon: "📚" },
    { id: "investor", name: "Investor / Trader", icon: "📈" },
    { id: "smart_shopper", name: "Smart Shopper / Deal Hunter", icon: "🛒" },
    
  ];

  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interests, setInterests] = useState([]);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password))
      return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(password))
      return "Password must contain at least one number";
    return "";
  };

  const validateName = (name, fieldName) => {
    if (!name) return `${fieldName} is required`;
    if (name.length < 2) return `${fieldName} must be at least 2 characters`;
    return "";
  };

  // Handle field changes with validation
  const handleFieldChange = (field, value) => {
    // Update the field value
    switch (field) {
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "profession":
        setProfession(value);
        break;
      default:
        break;
    }

    // Mark field as touched
    setFormTouched({
      ...formTouched,
      [field]: true,
    });

    // Validate the field
    let errorMessage = "";
    if (field === "firstName" || field === "lastName") {
      errorMessage = validateName(
        value,
        field === "firstName" ? "First name" : "Last name"
      );
    } else if (field === "email") {
      errorMessage = validateEmail(value);
    } else if (field === "password") {
      errorMessage = validatePassword(value);
    } else if (field === "profession") {
      errorMessage = profession ? "" : "Profession is required";
    }

    // Update the error state
    setFormErrors({
      ...formErrors,
      [field]: errorMessage,
    });
  };

  // Validate the entire form
  const validateForm = () => {
    const newErrors = {
      firstName: validateName(firstName, "First name"),
      lastName: validateName(lastName, "Last name"),
      email: validateEmail(email),
      password: validatePassword(password),
      profession: profession ? "" : "Profession is required",
    };

    setFormErrors(newErrors);
    setFormTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      profession: true,
    });

    // Return true if there are no errors
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const registerUserInFirestore = async (user, prof, userInterests) => {
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
        profession: prof || profession,
        interests: userInterests || interests,
        professionSelectedAt: new Date(),
        subscriptionStatus: "free",
        createdAt: new Date(),
      });
    } catch (error) {
      setError("Failed to save user data. Please try again.");
      console.error("Firestore error:", error);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

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

          // Navigation will be handled by ProfessionCheckWrapper
        } catch (error) {
          console.error("Signup error:", error);

          // Handle specific Firebase auth errors
          switch (error.code) {
            case "auth/email-already-in-use":
              setError(
                "This email is already in use. Please try logging in instead."
              );
              break;
            case "auth/invalid-email":
              setError("Invalid email address format.");
              break;
            case "auth/weak-password":
              setError(
                "Password is too weak. Please choose a stronger password."
              );
              break;
            case "auth/network-request-failed":
              setError(
                "Network error. Please check your internet connection and try again."
              );
              break;
            default:
              setError("Something went wrong. Please try again later.");
          }
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
          const userCredential = await signInWithPopup(auth, provider);
          const user = userCredential.user;
          // Check if user already has profession
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists() || !userSnap.data().profession) {
            setShowProfessionModal(true);
          } else {
            // Navigation will be handled by ProfessionCheckWrapper
          }
        } catch (error) {
          console.error("Google sign-in error:", error);
          setError("Failed to sign in with Google. Please try again.");
        }
      },
      (error) => setError(error)
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Navigation will be handled by ProfessionCheckWrapper
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
    <div className="bg-white relative overflow-clip dark:bg-[#101020] rounded-3xl w-full max-w-lg p-4">
      <div className="flex justify-center rounded-full p-4 w-fit mx-auto items-center my-2">
        <img src="/Favicon.svg" alt="logo" className="w-16" />
      </div>

      <h2 className="text-center text-2xl dark:text-gray-200 text-gray-800 font-medium">
        Create an account
      </h2>
      <h3 className="text-center text-sm mb-6 text-gray-500 dark:text-gray-400">
        Please enter your details to create an account.
      </h3>

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
        <hr className="border-gray-300 dark:border-gray-400 flex-grow" />
        <span className="px-2 text-gray-500 dark:text-gray-400 font-bold">
          OR
        </span>
        <hr className="border-gray-300 dark:border-gray-400 flex-grow" />
      </div>

      <form onSubmit={handleEmailSignUp}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => handleFieldChange("firstName", e.target.value)}
              onBlur={() => setFormTouched({ ...formTouched, firstName: true })}
              className={`w-full border ${
                formTouched.firstName && formErrors.firstName
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-lg p-2 focus:ring focus:ring-blue-200`}
              required
            />
            {formTouched.firstName && formErrors.firstName && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.firstName}
              </p>
            )}
          </div>
          <div>
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => handleFieldChange("lastName", e.target.value)}
              onBlur={() => setFormTouched({ ...formTouched, lastName: true })}
              className={`w-full border ${
                formTouched.lastName && formErrors.lastName
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-lg p-2 focus:ring focus:ring-blue-200`}
              required
            />
            {formTouched.lastName && formErrors.lastName && (
              <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
            )}
          </div>
        </div>
        <div className="mb-4">
          <input
            type="email"
            placeholder="Work Email"
            value={email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            onBlur={() => setFormTouched({ ...formTouched, email: true })}
            className={`w-full border ${
              formTouched.email && formErrors.email
                ? "border-red-500"
                : "border-gray-300"
            } rounded-lg p-2 focus:ring focus:ring-blue-200`}
            required
          />
          {formTouched.email && formErrors.email && (
            <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
          )}
        </div>
        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => handleFieldChange("password", e.target.value)}
            onBlur={() => setFormTouched({ ...formTouched, password: true })}
            className={`w-full border ${
              formTouched.password && formErrors.password
                ? "border-red-500"
                : "border-gray-300"
            } rounded-lg p-2 focus:ring focus:ring-blue-200`}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? <IoEye /> : <IoEyeOff />}
          </button>
          {formTouched.password && formErrors.password && (
            <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
          )}
          {password && !formErrors.password && (
            <p className="text-green-500 text-xs mt-1">Password is strong</p>
          )}
        </div>
        <div className="mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {professionOptions.map((option) => (
              <button
                type="button"
                key={option.id}
                className={`relative flex flex-col items-center p-5 w-full max-w-[340px] mx-auto border rounded-2xl shadow-md transition-all text-center bg-white dark:bg-gray-800 hover:shadow-xl focus:outline-none group
                  ${profession === option.id ? "border-blue-600 ring-2 ring-blue-200" : "border-gray-200"}`}
                onClick={() => setProfession(option.id)}
              >
                <span className="text-4xl mb-2">{option.icon}</span>
                <span className="font-bold text-lg mb-1 text-gray-900 dark:text-gray-100">{option.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-2">{option.desc}</span>
                {profession === option.id && (
                  <span className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M9.5 16.5l-4-4 1.41-1.41L9.5 13.67l7.09-7.09L18 7l-8.5 8.5z"/></svg>
                  </span>
                )}
              </button>
            ))}
          </div>
          {formTouched.profession && formErrors.profession && (
            <p className="text-red-500 text-xs mt-1">{formErrors.profession}</p>
          )}
        </div>
        <div className="flex justify-center mb-4">
          <div ref={recaptchaContainer}></div>
        </div>
        <button
          type="submit"
          disabled={loading || !recaptchaLoaded}
          className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 focus:outline-none disabled:bg-indigo-300"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      {showProfessionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-center">Select Your Profession</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 max-h-[50vh] overflow-y-auto">
              {professionOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={`relative flex flex-col items-center p-5 w-full max-w-[340px] mx-auto border rounded-2xl shadow-md transition-all text-center bg-white dark:bg-gray-800 hover:shadow-xl focus:outline-none group
                    ${profession === option.id ? "border-blue-600 ring-2 ring-blue-200" : "border-gray-200"}`}
                  onClick={() => setProfession(option.id)}
                >
                  <span className="text-4xl mb-2">{option.icon}</span>
                  <span className="font-bold text-lg mb-1 text-gray-900 dark:text-gray-100">{option.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-2">{option.desc}</span>
                  {profession === option.id && (
                    <span className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M9.5 16.5l-4-4 1.41-1.41L9.5 13.67l7.09-7.09L18 7l-8.5 8.5z"/></svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              onClick={() => {
                if (!profession) return setError("Please select a profession.");
                setShowProfessionModal(false);
                setShowInterestModal(true);
              }}
              disabled={loading}
            >
              Continue
            </button>
            {error && <div className="text-red-500 mt-2 text-center">{error}</div>}
          </div>
        </div>
      )}

      {showInterestModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-center">Select Your Interests</h2>
            <div className="grid grid-cols-2 gap-3 mb-4 max-h-[50vh] overflow-y-auto">
              {interestOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={`relative flex flex-col items-center p-4 w-full max-w-[150px] mx-auto border rounded-xl shadow-sm transition-all text-center bg-white dark:bg-gray-800 hover:shadow-lg focus:outline-none group
                    ${interests.includes(option.id) ? "border-blue-600 ring-2 ring-blue-200" : "border-gray-200"}`}
                  onClick={() => setInterests((prev) => prev.includes(option.id) ? prev.filter(i => i !== option.id) : [...prev, option.id])}
                >
                  <span className="text-2xl mb-1">{option.icon}</span>
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{option.name}</span>
                  {interests.includes(option.id) && (
                    <span className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M9.5 16.5l-4-4 1.41-1.41L9.5 13.67l7.09-7.09L18 7l-8.5 8.5z"/></svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              onClick={async () => {
                if (interests.length === 0) return setError("Please select at least one interest.");
                setLoading(true);
                const user = auth.currentUser;
                await registerUserInFirestore(user, profession, interests);
                setShowInterestModal(false);
                setLoading(false);
              }}
              disabled={loading}
            >
              {loading ? "Saving..." : "Continue"}
            </button>
            {error && <div className="text-red-500 mt-2 text-center">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;