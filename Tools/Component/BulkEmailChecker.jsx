import React, { useState } from 'react';
import axios from 'axios';
import { Back } from './back';

const BulkEmailChecker = () => {
  const [emails, setEmails] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (e) => {
    setEmails(e.target.value);
  };

  const checkEmails = async () => {
    // Clear previous results and error
    setResults([]);
    setError('');
    setIsLoading(true);

    // Split and trim emails
    const emailList = emails.split(',').map(email => email.trim());

    // Ensure emailList is not empty
    if (emailList.length === 0 || emailList[0] === '') {
      setError('Please enter at least one email.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/email', {
        emails: emailList
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error verifying emails:', error);
      setError('Failed to verify emails. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-2 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="relative p-4 sm:p-6">
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
              <Back />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-black">
              Bulk Email Checker
            </h1>
          </div>

          {/* Main Content */}
          <div className="p-4 sm:p-6 md:p-8">
            {/* Email Input */}
            <div className="mb-6">
              <textarea
                className="w-full px-4 sm:px-6 py-3 bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl border border-gray-100 shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                rows="5"
                placeholder="Enter emails separated by commas"
                value={emails}
                onChange={handleEmailChange}
              />
            </div>

            {/* Check Button */}
            <div className="flex justify-center">
              <button
                onClick={checkEmails}
                disabled={isLoading}
                className={`px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-3.5 rounded-xl text-base sm:text-lg font-medium transition-all duration-200 ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                } text-white`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking...
                  </div>
                ) : (
                  "Check Emails"
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-center">
                {error}
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Results:</h3>
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border ${
                        result.success
                          ? "bg-gradient-to-br from-green-50 to-green-100 border-green-100"
                          : "bg-gradient-to-br from-red-50 to-red-100 border-red-100"
                      } transition-all duration-200 hover:shadow-sm`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-6 h-6 ${
                          result.success ? "text-green-500" : "text-red-500"
                        }`}>
                          {result.success ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-grow">
                          <span className="font-medium">{result.email}</span>
                          <span className={`ml-2 text-sm ${
                            result.success ? "text-green-600" : "text-red-600"
                          }`}>
                            {result.success ? "Valid" : "Invalid"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEmailChecker;
