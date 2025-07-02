import React, { useState, useRef } from 'react';
import { Back } from './back';

const AgeCalculator = () => {
  const [birthDate, setBirthDate] = useState('');
  const [ageDetails, setAgeDetails] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const calculateAge = () => {
    if (!birthDate) {
      setError('Please select your birth date');
      setAgeDetails(null);
      return;
    }

    const today = new Date();
    const birthDateObj = new Date(birthDate);

    if (birthDateObj > today) {
      setError('Birth date cannot be in the future');
      setAgeDetails(null);
      return;
    }

    const diffInMilliseconds = today.getTime() - birthDateObj.getTime();
    const totalDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

    const years = Math.floor(totalDays / 365.25);
    const remainingDays = totalDays - (years * 365.25);
    const months = Math.floor(remainingDays / 30.44);
    const days = Math.floor(remainingDays % 30.44);

    // Calculate additional details
    const weeks = Math.floor(totalDays / 7);
    const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor(diffInMilliseconds / (1000 * 60));

    setAgeDetails({
      years,
      months,
      days,
      totalDays,
      weeks,
      hours,
      minutes
    });
    setError('');
  };

  const handleReset = () => {
    setBirthDate('');
    setAgeDetails(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-blue-100 dark:bg-[#513a7a]  py-4">
      <div className="max-w-2xl  mx-auto px-4">
        <div className="bg-white dark:bg-[#28283a] rounded-[30px] shadow-md dark:border-none">
          <div className="p-1">
            <Back />
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-white dark:from-[#28283a] dark:to-[#28283a] p-2 border-b border-gray-100 dark:border-none">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center">
              Age Calculator
            </h1>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl border border-red-200 dark:border-none text-sm">
                {error}
              </div>
            )}

            <div className="bg-gray-50 dark:bg-[#28283a] rounded-2xl p-6 space-y-6">
              {/* Input Section */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-200 mb-2">
                  Select Your Birth Date
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="date"
                    value={birthDate}
                    onChange={(e) => {
                      setBirthDate(e.target.value);
                      setError('');
                    }}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 pr-10 bg-gray-100 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-none rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    tabIndex={-1}
                    onClick={() => inputRef.current && inputRef.current.showPicker && inputRef.current.showPicker()}
                    aria-label="Open calendar"
                    style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 dark:text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" fill="none" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  </button>
                  <style>
                    {`
                      input[type="date"]::-webkit-calendar-picker-indicator {
                        opacity: 0;
                        display: none;
                      }
                    `}
                  </style>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={calculateAge}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors duration-200"
                >
                  Calculate Age
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-200 dark:border-none rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Reset
                </button>
              </div>

              {/* Results */}
              {ageDetails && (
                <div className="space-y-4">
                  {/* Main Age Display */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-none">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3">
                        <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-300">{ageDetails.years}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-200">Years</p>
                      </div>
                      <div className="p-3">
                        <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-300">{ageDetails.months}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-200">Months</p>
                      </div>
                      <div className="p-3">
                        <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-300">{ageDetails.days}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-200">Days</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-none">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-200 mb-3">Additional Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 dark:bg-[#28283a] rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-200">Total Days</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          {ageDetails.totalDays.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-[#28283a] rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-200">Total Weeks</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          {ageDetails.weeks.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-[#28283a] rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-200">Total Hours</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          {ageDetails.hours.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-[#28283a] rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-200">Total Minutes</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          {ageDetails.minutes.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeCalculator;