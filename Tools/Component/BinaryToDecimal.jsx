import React, { useState } from 'react';
import { Back } from './back';

const BinaryToDecimal = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isBinaryToDecimal, setIsBinaryToDecimal] = useState(true);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    
    // Clear previous results
    setResult('');
    setError('');

    if (value === '') return;

    if (isBinaryToDecimal) {
      // Binary to Decimal conversion
      if (!/^[0-1]+$/.test(value)) {
        setError('Please enter only 0s and 1s');
        return;
      }
      const decimalValue = parseInt(value, 2);
      setResult(decimalValue.toString());
    } else {
      // Decimal to Binary conversion
      if (!/^\d+$/.test(value)) {
        setError('Please enter a valid decimal number');
        return;
      }
      const binaryValue = parseInt(value).toString(2);
      setResult(binaryValue);
    }
  };

  const handleClear = () => {
    setInput('');
    setResult('');
    setError('');
  };

  const handleSwap = () => {
    setIsBinaryToDecimal(!isBinaryToDecimal);
    setInput('');
    setResult('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[30px] shadow-lg border-2 border-gray-100">
          <Back />
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
              {isBinaryToDecimal ? 'Binary to Decimal' : 'Decimal to Binary'} Converter
            </h1>

            <div className="space-y-6">
              {/* Input Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter {isBinaryToDecimal ? 'Binary' : 'Decimal'} Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder={isBinaryToDecimal ? 'Enter 0s and 1s...' : 'Enter decimal number...'}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition-colors"
                  />
                  {error && (
                    <p className="absolute -bottom-6 left-0 text-red-500 text-sm">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              {/* Result Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
                  {isBinaryToDecimal ? 'Decimal' : 'Binary'} Result
                </h2>
                <div className="bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl p-6 text-center">
                  <span className="text-4xl font-mono font-bold text-gray-800">
                    {result || '0'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleClear}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
                <button
                  onClick={handleSwap}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  Swap
                </button>
              </div>

              {/* How it Works Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
                  How it Works
                </h2>
                <div className="bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      {isBinaryToDecimal ? (
                        <>
                          <p className="text-gray-600 mb-2">
                            Binary numbers use only 0s and 1s. Each position represents a power of 2.
                          </p>
                          <div className="inline-block bg-white rounded-lg px-4 py-2 shadow-sm">
                            <p className="font-mono text-gray-800">1010 (binary) = 10 (decimal)</p>
                          </div>
                          <div className="text-sm text-gray-500 mt-2">
                            <p>1×2³ + 0×2² + 1×2¹ + 0×2⁰</p>
                            <p>= 8 + 0 + 2 + 0 = 10</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-600 mb-2">
                            Decimal numbers are converted to binary by dividing by 2 and tracking remainders.
                          </p>
                          <div className="inline-block bg-white rounded-lg px-4 py-2 shadow-sm">
                            <p className="font-mono text-gray-800">10 (decimal) = 1010 (binary)</p>
                          </div>
                          <div className="text-sm text-gray-500 mt-2">
                            <p>10 ÷ 2 = 5 remainder 0</p>
                            <p>5 ÷ 2 = 2 remainder 1</p>
                            <p>2 ÷ 2 = 1 remainder 0</p>
                            <p>1 ÷ 2 = 0 remainder 1</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinaryToDecimal;
