import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import Landing from './Landing';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Profile from './Profile';
import NotFound from './NotFound';

const LinktreeApp = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const { user, firebaseUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, go to dashboard
    if (user && !loading && currentPage === 'login') {
      message.success("Welcome back! You're already logged in.");
      setCurrentPage('dashboard');
    }
  }, [user, loading, currentPage]);

  const handleLogin = () => {
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    // Redirect to main search page instead of login
    navigate('/search');
  };

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  // If user is not authenticated, show login page
  if (!user) {
    return (
      <Login 
        onLoginSuccess={handleLogin}
        onRegisterClick={() => setCurrentPage('register')}
      />
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
      return (
        <Dashboard 
          user={user}
          onLogout={handleLogout}
          onViewProfile={() => setCurrentPage('profile')}
        />
      );
    
    case 'profile': {
      const profileUsername = firebaseUser?.uid || user?.displayName || user?.username || user?.email?.split('@')[0] || 'unknown';
     
      return (
        <Profile 
          username={profileUsername}
          onBackToDashboard={() => setCurrentPage('dashboard')}
        />
      );
    }
    
    default:
      return <NotFound onBackToLanding={() => setCurrentPage('login')} />;
  }
};

const LinktreeMain = () => {
  return <LinktreeApp />;
};

export default LinktreeMain;
