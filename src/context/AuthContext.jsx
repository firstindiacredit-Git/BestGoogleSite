import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import { auth, provider as googleProvider } from "../firebase";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { API_URL } from "../config/balancesheet.config";

const AuthContext = createContext(null);

// Configure axios defaults
axios.defaults.baseURL = `${API_URL}/api`;
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Set up axios interceptor for authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("userEmail");
          message.error("Session expired. Please login again.");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Load user data on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get("/users/profile");
          setUser(response.data.user);
        } catch (err) {
          console.error("Error loading user:", err);
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("userEmail");
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // If Firebase user exists but no backend user, try to sync
        const token = localStorage.getItem("token");
        if (!token) {
          try {
            // Get Firebase ID token
            const idToken = await firebaseUser.getIdToken();

            // Send to backend for authentication
            const response = await axios.post("/auth/firebase", {
              idToken: idToken,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              picture: firebaseUser.photoURL,
            });

            const { user, token } = response.data;
            setUser(user);
            localStorage.setItem("token", token);
            localStorage.setItem("userEmail", user.email);
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          } catch (error) {
            console.error("Error syncing Firebase user:", error);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const register = async (username, email, password) => {
    try {
      setError(null);

      console.log("AuthContext register called with:", { email, username });

      // Validate input
      if (!email || !password) {
        const errorMessage = "Please provide both email and password";
        setError(errorMessage);
        message.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
          fields: { email: !email, password: !password },
        };
      }

      const registerData = {
        username,
        email: email.toLowerCase().trim(),
        password,
      };

      console.log("Sending registration request with data:", registerData);

      const response = await axios.post("/register", registerData);
      console.log("Registration response:", response.data);

      const { user, token } = response.data;

      // Store user data and credentials
      setUser(user);
      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", registerData.email);
      localStorage.setItem(
        "userCredentials",
        JSON.stringify({
          email: registerData.email,
          password: password, // Note: This is for auto-fill purposes only
        })
      );
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      message.success(
        "Registration successful! You can now login with your email and password."
      );
      return { success: true };
    } catch (error) {
      console.error(
        "Registration error in AuthContext:",
        error.response?.data || error
      );

      let errorMessage = "Registration failed. Please try again.";

      if (error.response?.data?.code === 11000) {
        if (error.response.data.keyPattern.username) {
          errorMessage =
            "This username is already taken. Please choose another one.";
        } else if (error.response.data.keyPattern.email) {
          errorMessage =
            "This email is already registered. Please use another email.";
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setError(errorMessage);
      message.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
        fields: error.response?.data?.fields,
      };
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);

      console.log("AuthContext login called with:", { username });
      console.log("Axios baseURL:", axios.defaults.baseURL);

      // Validate input
      if (!username || !password) {
        const errorMessage = "Please provide both username and password";
        setError(errorMessage);
        message.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
          fields: { username: !username, password: !password },
        };
      }

      const loginData = {
        username: username.toLowerCase().trim(),
        password,
      };

      console.log("Sending login request with data:", loginData);
      console.log("Full URL:", `${axios.defaults.baseURL}/login`);

      const response = await axios.post("/login", loginData);
      console.log("Login response:", response.data);

      const { user, token } = response.data;

      // Store user data and credentials
      setUser(user);
      localStorage.setItem("token", token);
      localStorage.setItem("username", loginData.username);
      localStorage.setItem(
        "userCredentials",
        JSON.stringify({
          username: loginData.username,
          password: password, // Note: This is for auto-fill purposes only
        })
      );
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      message.success("Login successful!");
      return { success: true };
    } catch (error) {
      console.error(
        "Login error in AuthContext:",
        error.response?.data || error
      );
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        response: error.response,
        request: error.request,
      });

      let errorMessage = "Login failed. Please try again.";

      if (error.code === "ERR_NETWORK") {
        errorMessage =
          "Network error. Please check your connection and ensure the server is running.";
      } else if (error.response?.status === 401) {
        errorMessage = "Invalid username or password";
      } else if (error.response?.status === 400) {
        errorMessage =
          error.response.data?.error || "Please check your credentials";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      }

      setError(errorMessage);
      message.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
        fields: error.response?.data?.fields,
      };
    }
  };

  const logout = async () => {
    try {
      // Sign out from Firebase
      if (auth.currentUser) {
        await auth.signOut();
      }

      setUser(null);
      setFirebaseUser(null);
      
      // Clear all authentication tokens and user data
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userCredentials");
      localStorage.removeItem("username");
      
      // Clear axios authorization header
      delete axios.defaults.headers.common["Authorization"];
      
      // Force redirect to main app search page if on balance sheet pages
      const currentPath = window.location.pathname;
      if (currentPath.includes('/balancesheet') || currentPath.includes('/sheet/')) {
        window.location.href = '/search';
      }
      
      message.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      message.error("Error during logout");
    }
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await axios.put("/users/profile", userData);
      setUser(response.data.user);
      message.success("Profile updated successfully");
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to update profile";
      setError(errorMessage);
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const googleLogin = async () => {
    try {
      setError(null);

      console.log("Starting Google login...");
      console.log("Firebase config:", {
        authDomain: auth.config.authDomain,
        projectId: auth.config.projectId,
      });

      // Sign in with Firebase Google provider
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      // Send to backend for authentication
      const response = await axios.post("/auth/firebase", {
        idToken: idToken,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        picture: firebaseUser.photoURL,
      });

      const { user, token } = response.data;

      // Store user data and credentials
      setUser(user);
      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", user.email);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      message.success("Google login successful!");
      return { success: true };
    } catch (error) {
      console.error("Google login error in AuthContext:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        response: error.response?.data,
      });

      let errorMessage = "Google login failed. Please try again.";

      if (error.code === "auth/unauthorized-domain") {
        errorMessage =
          "This domain is not authorized for Google login. Please contact support.";
      } else if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Login cancelled by user";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage =
          "Popup blocked by browser. Please allow popups and try again.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.response?.status === 401) {
        errorMessage = "Google authentication failed";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || "Please try again";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      }

      setError(errorMessage);
      message.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
    googleLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
