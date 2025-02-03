import React, { useState } from 'react';
import { Back } from './back';

const AgeCalculator = () => {
  const [birthDate, setBirthDate] = useState('');
  const [ageDetails, setAgeDetails] = useState(null);
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-4">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-[30px] shadow-md border-2 border-gray-100">
          <div className="p-1">
            <Back />
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-white p-2 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800 text-center">
              Age Calculator
            </h1>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
              {/* Input Section */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Select Your Birth Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => {
                      setBirthDate(e.target.value);
                      setError('');
                    }}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                  />
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
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Reset
                </button>
              </div>

              {/* Results */}
              {ageDetails && (
                <div className="space-y-4">
                  {/* Main Age Display */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3">
                        <p className="text-4xl font-bold text-indigo-600">{ageDetails.years}</p>
                        <p className="text-sm text-gray-600">Years</p>
                      </div>
                      <div className="p-3">
                        <p className="text-4xl font-bold text-indigo-600">{ageDetails.months}</p>
                        <p className="text-sm text-gray-600">Months</p>
                      </div>
                      <div className="p-3">
                        <p className="text-4xl font-bold text-indigo-600">{ageDetails.days}</p>
                        <p className="text-sm text-gray-600">Days</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-600 mb-3">Additional Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Days</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {ageDetails.totalDays.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Weeks</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {ageDetails.weeks.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Hours</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {ageDetails.hours.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Minutes</p>
                        <p className="text-lg font-semibold text-gray-800">
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
