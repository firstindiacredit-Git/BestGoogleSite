import { useState, useEffect } from "react";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, provider } from "../../firebase"; // Firebase configuration import
import Header from "../Header";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationCode, setVerificationCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [user, setUser] = useState(null); // Track logged-in user
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle between dark and light mode
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Function to sign up with email
  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await sendEmailVerification(user);
      setIsOtpSent(true); // Indicate that OTP has been sent
      alert("Verification email sent. Please check your inbox.");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to verify OTP
  const handleOtpVerification = async () => {
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (user.emailVerified) {
        alert("Email verified. You are logged in.");
      } else {
        setError("Email not verified. Please check your inbox.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Sign in using Google
  const handleGoogleSignIn = async () => {
    setError("");

    try {
      await signInWithPopup(auth, provider);
      alert("Successfully signed in with Google.");
    } catch (error) {
      setError(error.message);
    }
  };

  // Track user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update user state when user signs in or out
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      {/* Pass the logged-in user and theme toggle function to the Header */}
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} user={user} />

      <div className="max-w-md w-full mx-auto mt-10 rounded-none md:rounded-2xl border shadow-2xl p-4 md:p-8 shadow-input bg-neutral-50 dark:bg-neutral-800">
        <h2 className="font-bold text-xl text-center text-neutral-800 dark:text-neutral-50">
          Welcome to BESTGOOGLESITES
        </h2>
        <p className="text-neutral-600 text-xl max-w-sm mt-4 font-semibold text-center dark:text-neutral-300 uppercase">
          Sign up
        </p>

        {/* Error message */}
        {error && (
          <p className="text-red-500">
            {error === "Firebase: Error (auth/email-already-in-use)."
              ? "Email already in use. Please try again."
              : "Something went wrong. Please try again."}
          </p>
        )}

        {/* Show the signup form if OTP has not been sent yet */}
        {!isOtpSent ? (
          <form className="my-8" onSubmit={handleEmailSignUp}>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
              <div className="flex flex-col space-y-2 w-[48.5%]">
                <label
                  htmlFor="firstname"
                  className="font-medium dark:text-neutral-50"
                >
                  First name
                </label>
                <input
                  id="firstname"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border p-2 rounded dark:bg-neutral-700 dark:text-neutral-50"
                  required
                />
              </div>
              <div className="flex flex-col space-y-2 w-[48.5%]">
                <label
                  htmlFor="lastname"
                  className="font-medium dark:text-neutral-50"
                >
                  Last name
                </label>
                <input
                  id="lastname"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="border p-2 rounded dark:bg-neutral-700 dark:text-neutral-50"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="font-medium dark:text-neutral-50"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded w-full dark:bg-neutral-700 dark:text-neutral-50"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="font-medium dark:text-neutral-50"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded w-full dark:bg-neutral-700 dark:text-neutral-50"
                required
              />
            </div>
            <button
              className="border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white w-full border h-10 font-medium dark:border-neutral-600 dark:hover:bg-neutral-600"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Sign Up"}
            </button>
            <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
            <button
              className="text-white border shadow-sm dark:text-green-500 text-lg text-center px-4 w-full rounded-md h-10 font-medium border-green-500 hover:bg-green-500 hover:text-white"
              type="button"
              onClick={handleGoogleSignIn}
            >
              <div className="text-center justify-center gap-2 flex p-1">
                <img
                  src="../src/assets/google.png"
                  className="w-5 h-5 mt-1"
                  alt="Google logo"
                />
                Sign up with Google
              </div>
            </button>
          </form>
        ) : (
          // OTP Verification section
          <div>
            <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
              Enter the OTP sent to your email.
            </p>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border p-2 rounded w-full mb-4 dark:bg-neutral-700 dark:text-neutral-50"
              required
            />
            <button
              className="bg-white w-full text-black rounded-md h-10 font-medium dark:bg-neutral-800 dark:text-neutral-50"
              type="button"
              onClick={handleOtpVerification}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
