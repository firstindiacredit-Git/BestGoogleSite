import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import Landing from './Landing';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Profile from './Profile';
import NotFound from './NotFound';

const LinktreeApp = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const { user, loading } = useAuth();

  useEffect(() => {
    // If user is logged in, go to dashboard
    if (user && currentPage === 'login') {
      setCurrentPage('dashboard');
    }
  }, [user, currentPage]);

  const handleLogin = () => {
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentPage('login');
  };

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  // Render the appropriate page based on current state
  switch (currentPage) {
    case 'landing':
      return (
        <Landing 
          onLoginClick={() => setCurrentPage('login')}
          onRegisterClick={() => setCurrentPage('register')}
        />
      );
    
    case 'login':
      return (
        <Login 
          onLoginSuccess={handleLogin}
          onRegisterClick={() => setCurrentPage('register')}
        />
      );
    
    case 'register':
      return (
        <Register 
          onRegisterSuccess={handleLogin}
          onLoginClick={() => setCurrentPage('login')}
        />
      );
    
    case 'dashboard':
      if (!user) {
        setCurrentPage('login');
        return null;
      }
      return (
        <Dashboard 
          user={user}
          onLogout={handleLogout}
          onViewProfile={() => setCurrentPage('profile')}
        />
      );
    
    case 'profile':
      // Debug: log the user object to see its structure
      console.log('User object in profile case:', user);
      return (
        <Profile 
          username={user?.username || user?.email?.split('@')[0] || 'unknown'}
          onBackToDashboard={() => setCurrentPage('dashboard')}
        />
      );
    
    default:
      return <NotFound onBackToLanding={() => setCurrentPage('login')} />;
  }
};

const LinktreeMain = () => {
  return (
    <AuthProvider>
      <LinktreeApp />
    </AuthProvider>
  );
};

export default LinktreeMain;
