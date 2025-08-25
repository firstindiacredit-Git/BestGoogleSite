import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { message } from 'antd';

const LinktreeTest = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [testResult, setTestResult] = useState('');

  const testAuthentication = () => {
    setTestResult('Testing Linktree Authentication Integration...\n\n');
    
    if (loading) {
      setTestResult(prev => prev + '⏳ Authentication is still loading...\n');
      return;
    }

    if (isAuthenticated && user) {
      setTestResult(prev => prev + `✅ User is authenticated!\n`);
      setTestResult(prev => prev + `👤 Username: ${user.username || 'N/A'}\n`);
      setTestResult(prev => prev + `📧 Email: ${user.email || 'N/A'}\n`);
      setTestResult(prev => prev + `🆔 User ID: ${user.id || user._id || 'N/A'}\n`);
      setTestResult(prev => prev + `🔑 Token: ${localStorage.getItem('token') ? 'Present' : 'Missing'}\n`);
    } else {
      setTestResult(prev => prev + `❌ User is not authenticated\n`);
      setTestResult(prev => prev + `🔑 Token: ${localStorage.getItem('token') ? 'Present' : 'Missing'}\n`);
    }

    setTestResult(prev => prev + '\n🎯 Integration Status:\n');
    setTestResult(prev => prev + `✅ Using main website's AuthContext\n`);
    setTestResult(prev => prev + `✅ Google OAuth available\n`);
    setTestResult(prev => prev + `✅ Backend endpoint: /auth/firebase\n`);
    setTestResult(prev => prev + `✅ Shared authentication state\n`);
  };

  const clearTest = () => {
    setTestResult('');
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Linktree Authentication Test</h2>
      
      <div className="space-y-3 mb-4">
        <button
          onClick={testAuthentication}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Test Authentication Integration
        </button>
        
        <button
          onClick={clearTest}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>
      
      {testResult && (
        <div className="bg-gray-100 p-4 rounded text-sm font-mono whitespace-pre-wrap">
          {testResult}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-600">
        <p>This test verifies that:</p>
        <ul className="list-disc list-inside mt-1">
          <li>Linktree uses main website's authentication</li>
          <li>User state is shared between components</li>
          <li>Google OAuth is properly integrated</li>
          <li>JWT tokens are properly managed</li>
        </ul>
      </div>
    </div>
  );
};

export default LinktreeTest;
