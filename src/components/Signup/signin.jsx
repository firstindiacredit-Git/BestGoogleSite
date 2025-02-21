import React, { useState, useEffect, useRef } from "react";
import { auth, provider } from "../../firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { protectForm } from "../../utils/recaptcha";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordFieldVisible, setIsPasswordFieldVisible] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const recaptchaContainer = useRef(null);
  const navigate = useNavigate();

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
      },
      (error) => setError(error)
    );
  };

  useEffect(() => {
    // Create a unique ID for the reCAPTCHA container
    const recaptchaId =
      "recaptcha-container-" + Math.random().toString(36).substring(7);
    if (recaptchaContainer.current) {
      recaptchaContainer.current.id = recaptchaId;
    }

    // Load reCAPTCHA script
    const loadRecaptcha = () => {
      if (!window.grecaptcha) {
        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
        script.async = true;
        script.defer = true;
        script.id = "recaptcha-script-signin";

        script.onload = () => {
          window.grecaptcha.ready(() => {
            try {
              window.grecaptcha.render(recaptchaId, {
                sitekey: "6LdL78EqAAAAADhSJys9dchITOCB3Q6lyriJOuYF",
                callback: () => {
                  setRecaptchaLoaded(true);
                  setRecaptchaReady(true);
                },
              });
            } catch (error) {
              console.error("reCAPTCHA render error:", error);
            }
          });
        };

        document.body.appendChild(script);
      } else {
        // If script already exists, just try to render
        window.grecaptcha.ready(() => {
          try {
            window.grecaptcha.render(recaptchaId, {
              sitekey: "6LdL78EqAAAAADhSJys9dchITOCB3Q6lyriJOuYF",
              callback: () => {
                setRecaptchaLoaded(true);
                setRecaptchaReady(true);
              },
            });
          } catch (error) {
            console.error("reCAPTCHA render error:", error);
          }
        });
      }
    };

    loadRecaptcha();

    return () => {
      // Cleanup
      const script = document.getElementById("recaptcha-script-signin");
      if (script) {
        document.body.removeChild(script);
      }
      if (window.grecaptcha && recaptchaReady) {
        try {
          window.grecaptcha.reset();
        } catch (error) {
          console.error("reCAPTCHA reset error:", error);
        }
      }
    };
  }, []);

  return (
    <div>
      <div className="bg-white relative overflow-clip  dark:bg-[#101020]  border dark:border-gray-700 border-gray-100 rounded-3xl w-full max-w-lg p-6  shadow-2xl shadow-gray-500/20 ">
        <div className="flex justify-center  rounded-full p-4 w-fit mx-auto items-center my-2">
          <img src="/Favicon.svg" alt="logo" className="w-16" />
        </div>
        <div className="absolute -top-20  left-10  ">
          <img src="/ShadowBlue.png" className=" opacity-45 w-80" alt="close" />
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
            <p className="text-center text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-indigo-500 dark:text-gray-200">
                Sign up
              </Link>
            </p>
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
    </div>
  );
};

export default SignIn;
