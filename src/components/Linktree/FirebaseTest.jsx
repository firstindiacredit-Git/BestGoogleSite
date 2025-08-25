import { useState } from 'react';
import { auth, provider } from '../../firebase';
import { signInWithPopup } from 'firebase/auth';

const FirebaseTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testFirebaseConfig = () => {
    setTestResult('Testing Firebase configuration...\n');
    
    const config = auth.config;
    if (config) {
      setTestResult(prev => prev + `✅ Firebase initialized successfully\n`);
      setTestResult(prev => prev + `Project ID: ${config.projectId}\n`);
      setTestResult(prev => prev + `Auth Domain: ${config.authDomain}\n`);
    } else {
      setTestResult(prev => prev + `❌ Firebase not initialized properly\n`);
    }
  };

  const testGoogleAuth = async () => {
    setLoading(true);
    setTestResult(prev => prev + '\nTesting Google OAuth...\n');
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      setTestResult(prev => prev + `✅ Google OAuth successful!\n`);
      setTestResult(prev => prev + `User: ${user.displayName}\n`);
      setTestResult(prev => prev + `Email: ${user.email}\n`);
      setTestResult(prev => prev + `UID: ${user.uid}\n`);
      
      // Test getting ID token
      const idToken = await user.getIdToken();
      setTestResult(prev => prev + `✅ ID Token obtained (${idToken.substring(0, 20)}...)\n`);
      
    } catch (error) {
      setTestResult(prev => prev + `❌ Google OAuth failed: ${error.message}\n`);
      console.error('Google OAuth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearTest = () => {
    setTestResult('');
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Firebase Configuration Test</h2>
      
      <div className="space-y-3 mb-4">
        <button
          onClick={testFirebaseConfig}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Test Firebase Config
        </button>
        
        <button
          onClick={testGoogleAuth}
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Google OAuth'}
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
        <p>This test will help verify that:</p>
        <ul className="list-disc list-inside mt-1">
          <li>Firebase is properly configured</li>
          <li>Environment variables are loaded</li>
          <li>Google OAuth is working</li>
          <li>ID tokens can be obtained</li>
        </ul>
      </div>
    </div>
  );
};

export default FirebaseTest;
