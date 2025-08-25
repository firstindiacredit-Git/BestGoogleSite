import React, { useState, useEffect } from 'react';
import Main from './Main';
import Login from './Login';
import Signup from './Signup';

const RemoteAppWrapper = () => {
  // Set default user to bypass login
  const [currentPage, setCurrentPage] = useState('main');
  const [user, setUser] = useState({
    username: 'Remote User',
    email: 'remote@example.com'
  });
  const [loading, setLoading] = useState(false);

  // Skip authentication check and directly show main page
  useEffect(() => {
    // Set loading to false immediately since we're bypassing auth
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('main');
  };

  const handleLogout = () => {
    // Instead of going to login, just reset user but stay on main page
    setUser({
      username: 'Remote User',
      email: 'remote@example.com'
    });
    setCurrentPage('main');
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="remote-app-container">
        <div className="min-h-screen flex items-center justify-center bg-transparent">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // Always render the main page, bypassing login/signup
  return (
    <div className="remote-app-container">
      <Main 
        user={user}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default RemoteAppWrapper;
