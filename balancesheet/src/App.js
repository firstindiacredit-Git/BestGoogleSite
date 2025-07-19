import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'antd/dist/reset.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import BalanceSheet from './components/BalanceSheet';
import DataEntryGrid from './components/DataEntryGrid';
import Profile from './components/Profile';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/sheet/:id"
            element={
              <PrivateRoute>
                <BalanceSheet />
              </PrivateRoute>
            }
          />
          <Route
            path="/data-entry"
            element={
              <PrivateRoute>
                <DataEntryGrid />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 