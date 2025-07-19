import { useState, useEffect, useRef } from "react";
import { auth, provider } from "../../firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { Link } from "react-router-dom";
import { protectForm } from "../../utils/recaptcha";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import PropTypes from "prop-types";

const SignIn = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordFieldVisible, setIsPasswordFieldVisible] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const recaptchaContainer = useRef(null);
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
  const [profession, setProfession] = useState("");
  const [showProfessionModal, setShowProfessionModal] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interests, setInterests] = useState([]);
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
          const user = userCredential.user;
          // Check if user has profession and interests
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();
          
          if (!userSnap.exists() || !userData?.profession) {
            setShowProfessionModal(true);
          } else if (!userData?.interests || userData.interests.length === 0) {
            // User has profession but no interests - show interest modal
            setProfession(userData.profession);
            setShowInterestModal(true);
          } else {
            if (onSuccess) onSuccess();
            // Navigation will be handled by ProfessionCheckWrapper
          }
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
    await protectForm(
      async () => {
        try {
          const userCredential = await signInWithPopup(auth, provider);
          const user = userCredential.user;
          // Check if user has profession and interests
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();
          
          if (!userSnap.exists() || !userData?.profession) {
            setShowProfessionModal(true);
          } else if (!userData?.interests || userData.interests.length === 0) {
            // User has profession but no interests - show interest modal
            setProfession(userData.profession);
            setShowInterestModal(true);
          } else {
            if (onSuccess) onSuccess();
            // Navigation will be handled by ProfessionCheckWrapper
          }
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
      },
      (error) => setError(error)
    );
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
          className="w-full flex items-center justify-center gap-2 p-3 border rounded-xs dark:bg-black dark:text-gray-200 dark:border-gray-800 bg-gray-50 rounded-xl hover:bg-gray-200 focus:ring-2 focus:ring-gray-300"
          onClick={handleGoogleSignIn}
        >
          <img src="/google.png" alt="Google" className="w-5 h-5" />
          <span className="font-medium">Continue with Google</span>
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
              className="w-full p-3 bg-indigo-500 dark:bg-black cursor-pointer text-gray-200 dark:border-gray-800 border rounded-xl hover:bg-indigo-600   "
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
      {showProfessionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-90 z-[9999]">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-blue-100 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in flex flex-col items-center">
            <div className="mb-1 text-xs text-blue-500 font-semibold tracking-widest uppercase">Step 1 of 2</div>
            <h2 className="text-2xl font-extrabold mb-1 text-center text-blue-900 font-sans">Select Your Profession</h2>
            <div className="text-gray-500 text-sm mb-6 text-center">This helps us personalize your experience.</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 w-full max-h-[50vh] overflow-y-auto">
              {professionOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={`relative flex flex-col items-center p-7 w-full max-w-[340px] mx-auto border-2 rounded-2xl shadow-lg transition-all text-center bg-gradient-to-br from-white to-blue-50 hover:from-blue-50 hover:to-white focus:outline-none group
                    ${profession === option.id ? "border-blue-600 ring-2 ring-blue-200 scale-105" : "border-gray-200"}`}
                  onClick={() => setProfession(option.id)}
                >
                  <span className="text-5xl mb-2 drop-shadow-sm">{option.icon}</span>
                  <span className="font-bold text-lg mb-1 text-blue-900 font-sans">{option.name}</span>
                  <span className="text-xs text-gray-500 mb-2">{option.desc}</span>
                  {profession === option.id && (
                    <span className="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-1 shadow-lg">
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M9.5 16.5l-4-4 1.41-1.41L9.5 13.67l7.09-7.09L18 7l-8.5 8.5z"/></svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:from-blue-600 hover:to-purple-600 transition-all"
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
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 bg-opacity-90 z-[9999]">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-blue-100 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in flex flex-col items-center">
            <div className="mb-2 text-xs text-blue-500 font-semibold tracking-widest uppercase">
              {showProfessionModal ? "Step 2 of 2" : "Select Interests"}
            </div>
            <h2 className="text-2xl font-extrabold mb-1 text-center text-blue-900 font-sans">Select Your Interests</h2>
            <div className="text-gray-500 text-sm mb-6 text-center">
              Choose your interests to help us recommend the best content for you. You can skip this step if you prefer.
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6 w-full max-h-[50vh] overflow-y-auto">
              {interestOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={`relative flex flex-col items-center p-6 w-full max-w-[180px] mx-auto border-2 rounded-2xl shadow-md transition-all text-center bg-gradient-to-br from-white to-purple-50 hover:from-purple-50 hover:to-white focus:outline-none group
                    ${interests.includes(option.id) ? "border-purple-600 ring-2 ring-purple-200 scale-105" : "border-gray-200"}`}
                  onClick={() => setInterests((prev) => prev.includes(option.id) ? prev.filter(i => i !== option.id) : [...prev, option.id])}
                >
                  <span className="text-4xl mb-2 drop-shadow-sm">{option.icon}</span>
                  <span className="font-semibold text-base text-purple-900 font-sans">{option.name}</span>
                  {interests.includes(option.id) && (
                    <span className="absolute top-3 right-3 bg-purple-600 text-white rounded-full p-1 shadow-lg">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M9.5 16.5l-4-4 1.41-1.41L9.5 13.67l7.09-7.09L18 7l-8.5 8.5z"/></svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-3 w-full">
              {/* Always show skip button */}
              <button
                type="button"
                className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:bg-gray-600 transition-all"
                onClick={async () => {
                  setLoading(true);
                  const user = auth.currentUser;
                  await updateDoc(doc(db, "users", user.uid), {
                    profession: profession,
                    interests: [], // Empty array for interests
                    professionSelectedAt: new Date(),
                  });
                  setShowInterestModal(false);
                  if (onSuccess) onSuccess();
                  setLoading(false);
                }}
                disabled={loading}
              >
                {loading ? "Saving..." : "Skip"}
              </button>
              <button
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:from-purple-600 hover:to-blue-600 transition-all"
                onClick={async () => {
                  if (interests.length === 0) {
                    setError("Please select at least one interest or click Skip to continue without interests.");
                    return;
                  }
                  setLoading(true);
                  const user = auth.currentUser;
                  await updateDoc(doc(db, "users", user.uid), {
                    profession: profession,
                    interests: interests,
                    professionSelectedAt: new Date(),
                  });
                  setShowInterestModal(false);
                  if (onSuccess) onSuccess();
                  setLoading(false);
                }}
                disabled={loading}
              >
                {loading ? "Saving..." : "Continue with Interests"}
              </button>
            </div>
            {error && <div className="text-red-500 mt-2 text-center">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

SignIn.propTypes = {
  onSuccess: PropTypes.func,
};

export default SignIn;