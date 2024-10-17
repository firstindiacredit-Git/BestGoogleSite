import { useState, useEffect } from "react";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom"; 
import Header from "./Header";
  

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate(); 

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

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
      setIsOtpSent(true);
      alert("Verification email sent. Please check your inbox.");
    } catch (error) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      const currentUser = auth.currentUser;
      if (currentUser.emailVerified) {
        alert("Email verified. You are logged in.");
        navigate("/"); 
      } else {
        setError("Email not verified. Please check your inbox.");
      }
    } catch (error) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");

    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      alert("Successfully signed in with Google.");
      navigate("/");  
    } catch (error) {
      setError(getErrorMessage(error.code));
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.setItem("loggedOut", "true"); 
    window.location.reload();  
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        navigate("/"); 
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "Email already in use. Please try another.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/invalid-email":
        return "Invalid email address. Please check and try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-transparent text-black"
      }`}
    >
      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        user={user}
        onLogout={handleLogout}
      />
      
      <div className="max-w-md w-full mx-auto mt-10 rounded-none md:rounded-2xl border shadow-2xl p-4 md:p-8 shadow-input bg-transparent ">
        <h2 className="font-bold text-xl text-center ">
          Welcome to BESTGOOGLESITES
        </h2>
        <p className=" text-xl max-w-sm mt-4 font-semibold text-center  uppercase">
          Sign up
        </p>

        {error && (
          <div role="alert" aria-live="assertive">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Show the signup form if OTP has not been sent yet */}
        {!isOtpSent ? (
          <form className="my-8" onSubmit={handleEmailSignUp}>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
              <div className="flex flex-col space-y-2 w-[48.5%]">
                <label htmlFor="firstname" className="font-medium ">
                  First name
                </label>
                <input
                  id="firstname"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border p-2 rounded  "
                  required
                />
              </div>
              <div className="flex flex-col space-y-2 w-[48.5%]">
                <label htmlFor="lastname" className="font-medium">
                  Last name
                </label>
                <input
                  id="lastname"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="border p-2 rounded "
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="font-medium ">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded w-full "
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="font-medium ">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <button
              className="border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white w-full border h-10 font-medium  dark:hover:bg-blue-600"
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
              disabled={loading}
            >
              <div className="text-center justify-center gap-2 flex p-1">
                <img
                  src="/google.png"
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
            <p className="text-green-500 mb-2 text-sm max-w-sm mt-2 ">
              Verification Link and OTP sent to your email.
            </p>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border p-2 rounded w-full mb-4  "
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
};

export default Signup;
