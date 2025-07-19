import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const AuthContext = createContext(null);

// Configure axios defaults
// axios.defaults.baseURL = 'http://localhost:5173/api';
axios.defaults.baseURL = 'https://balance-sheet-backend-three.vercel.app/api';
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Set up axios interceptor for authentication
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }

        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401) {
                    setUser(null);
                    localStorage.removeItem('token');
                    localStorage.removeItem('userEmail');
                    delete axios.defaults.headers.common['Authorization'];
                    message.error('Session expired. Please login again.');
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
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('/users/profile');
                    setUser(response.data.user);
                } catch (err) {
                    console.error('Error loading user:', err);
                    setUser(null);
                    localStorage.removeItem('token');
                    localStorage.removeItem('userEmail');
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const register = async (username, email, password) => {
        try {
            setError(null);
            
            console.log('AuthContext register called with:', { email, username });
            
            // Validate input
            if (!email || !password) {
                const errorMessage = 'Please provide both email and password';
                setError(errorMessage);
                message.error(errorMessage);
                return { 
                    success: false, 
                    error: errorMessage,
                    fields: { email: !email, password: !password }
                };
            }

            const registerData = {
                username,
                email: email.toLowerCase().trim(),
                password
            };

            console.log('Sending registration request with data:', registerData);

            const response = await axios.post('/register', registerData);
            console.log('Registration response:', response.data);
            
            const { user, token } = response.data;
            
            // Store user data and credentials
            setUser(user);
            localStorage.setItem('token', token);
            localStorage.setItem('userEmail', registerData.email);
            localStorage.setItem('userCredentials', JSON.stringify({
                email: registerData.email,
                password: password // Note: This is for auto-fill purposes only
            }));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            message.success('Registration successful! You can now login with your email and password.');
            return { success: true };
        } catch (error) {
            console.error('Registration error in AuthContext:', error.response?.data || error);
            
            let errorMessage = 'Registration failed. Please try again.';
            
            if (error.response?.data?.code === 11000) {
                if (error.response.data.keyPattern.username) {
                    errorMessage = 'This username is already taken. Please choose another one.';
                } else if (error.response.data.keyPattern.email) {
                    errorMessage = 'This email is already registered. Please use another email.';
                }
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            setError(errorMessage);
            message.error(errorMessage);
            return { 
                success: false, 
                error: errorMessage,
                fields: error.response?.data?.fields
            };
        }
    };

    const balancesheetlogin = async (username, password) => {
        try {
            setError(null);
            
            console.log('AuthContext login called with:', { username });
            
            // Validate input
            if (!username || !password) {
                const errorMessage = 'Please provide both username and password';
                setError(errorMessage);
                message.error(errorMessage);
                return { 
                    success: false, 
                    error: errorMessage,
                    fields: { username: !username, password: !password }
                };
            }

            const loginData = {
                username: username.toLowerCase().trim(),
                password
            };

            console.log('Sending login request with data:', loginData);

            const response = await axios.post('/login', loginData);
            console.log('Login response:', response.data);
            
            const { user, token } = response.data;
            
            // Store user data and credentials
            setUser(user);
            localStorage.setItem('token', token);
            localStorage.setItem('username', loginData.username);
            localStorage.setItem('userCredentials', JSON.stringify({
                username: loginData.username,
                password: password // Note: This is for auto-fill purposes only
            }));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            message.success('Login successful!');
            return { success: true };
        } catch (error) {
            console.error('Login error in AuthContext:', error.response?.data || error);
            
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.response?.status === 401) {
                errorMessage = 'Invalid username or password';
            } else if (error.response?.status === 400) {
                errorMessage = error.response.data?.error || 'Please check your credentials';
            } else if (error.response?.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            }

            setError(errorMessage);
            message.error(errorMessage);
            return { 
                success: false, 
                error: errorMessage,
                fields: error.response?.data?.fields
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userCredentials');
        delete axios.defaults.headers.common['Authorization'];
        message.success('Logged out successfully');
    };

    const updateProfile = async (userData) => {
        try {
            setError(null);
            const response = await axios.patch('/users/profile', userData);
            setUser(response.data.user);
            message.success('Profile updated successfully');
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to update profile';
            setError(errorMessage);
            message.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const loginWithGoogle = async () => {
        try {
            setError(null);
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;
            // Get Firebase ID token
            const token = await firebaseUser.getIdToken();
            // Optionally: send token to backend for JWT/session
            // For now, just set user and token in localStorage
            setUser({
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                uid: firebaseUser.uid,
            });
            localStorage.setItem('token', token);
            localStorage.setItem('userEmail', firebaseUser.email);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            message.success('Google sign-in successful!');
            return { success: true };
        } catch (error) {
            setError(error.message);
            message.error(error.message || 'Google sign-in failed');
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        register,
        balancesheetlogin,
        logout,
        updateProfile,
        loginWithGoogle
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 