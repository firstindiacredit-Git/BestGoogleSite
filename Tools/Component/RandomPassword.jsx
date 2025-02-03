import React, { useState } from 'react';
import { Back } from './back';

const generatePassword = (length) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>?';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

function RandomPassword() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [copySuccess, setCopySuccess] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setCopySuccess('');
    
    // Simulate a slight delay for better UX
    setTimeout(() => {
      setPassword(generatePassword(length));
      setIsGenerating(false);
    }, 500);
  };

  const handleCopy = () => {
    if (password) {
      navigator.clipboard.writeText(password)
        .then(() => {
          setCopySuccess('Password copied to clipboard!');
          setTimeout(() => setCopySuccess(''), 2000);
        })
        .catch((err) => {
          setCopySuccess('Failed to copy password');
          console.error('Error copying text: ', err);
        });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-2 sm:p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="relative p-4 sm:p-6">
            <div className="mb-8 sm:mb-0 sm:absolute sm:top-6 sm:left-6">
              <Back />
            </div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Random Password Generator
            </h1>
          </div>

          {/* Main Content */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="space-y-6">
              {/* Password Length Control */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <label className="text-gray-700 font-medium">Password Length</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))}
                      min="6" 
                      max="32"
                      className="w-48 accent-blue-600"
                    />
                    <input 
                      type="number" 
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))}
                      min="6" 
                      max="32"
                      className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Password Output */}
              <div className="relative">
                <div className="flex items-center">
                  <input 
                    type="text" 
                    value={password} 
                    readOnly
                    placeholder="Your generated password will appear here"
                    className="w-full px-4 sm:px-6 py-3 bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl border border-gray-100 shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                  />
                  {password && (
                    <button 
                      onClick={handleCopy}
                      className="absolute right-2 px-4 py-1.5 bg-white/80 hover:bg-white text-blue-600 rounded-lg transition-all duration-200 text-sm font-medium border border-blue-100 hover:border-blue-200 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                      </svg>
                      Copy
                    </button>
                  )}
                </div>
                {copySuccess && (
                  <div className="absolute -bottom-6 left-0 right-0 text-center text-sm font-medium text-green-600">
                    {copySuccess}
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`w-full px-6 sm:px-8 py-3 rounded-xl text-white font-medium transition-all duration-200 flex items-center justify-center gap-2
                  ${isGenerating 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
                  }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    Generate Password
                  </>
                )}
              </button>

              {/* Password Strength Indicator */}
              {password && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Password Strength</span>
                    <span className="font-medium text-green-600">Strong</span>
                  </div>
                  <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RandomPassword;
