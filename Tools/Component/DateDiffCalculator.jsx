import React, { useState } from "react";
import { Back } from "./back";

const calculateDateDiff = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end - start;

  if (diff < 0) return null;

  // Calculate time units
  const totalMilliseconds = diff;
  const totalSeconds = Math.floor(diff / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  const totalWeeks = Math.floor(totalDays / 7);
  
  // Calculate years, months, and remaining days
  const millisecondsPerYear = 1000 * 60 * 60 * 24 * 365.25; // Account for leap years
  const years = Math.floor(diff / millisecondsPerYear);
  const remainingMilliseconds = diff % millisecondsPerYear;
  const months = Math.floor((remainingMilliseconds / millisecondsPerYear) * 12);
  const days = Math.floor(totalDays % 30.44); // Average days per month

  return {
    years,
    months,
    days,
    totalWeeks,
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
    totalMilliseconds
  };
};

const DateDiffCalculator = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateDiff, setDateDiff] = useState(null);
  const [error, setError] = useState("");

  const handleCalculate = () => {
    if (!startDate || !endDate) {
      setError("Please select both dates");
      setDateDiff(null);
      return;
    }

    const diff = calculateDateDiff(startDate, endDate);
    if (!diff) {
      setError("End date must be after start date");
      setDateDiff(null);
      return;
    }

    setError("");
    setDateDiff(diff);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setDateDiff(null);
    setError("");
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
              Date Difference Calculator
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setError("");
                    }}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setError("");
                    }}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleCalculate}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors duration-200"
                >
                  Calculate Difference
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Reset
                </button>
              </div>

              {/* Results */}
              {dateDiff && (
                <div className="space-y-4">
                  {/* Main Display */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3">
                        <p className="text-3xl font-bold text-indigo-600">{dateDiff.years}</p>
                        <p className="text-sm text-gray-600">Years</p>
                      </div>
                      <div className="p-3">
                        <p className="text-3xl font-bold text-indigo-600">{dateDiff.months}</p>
                        <p className="text-sm text-gray-600">Months</p>
                      </div>
                      <div className="p-3">
                        <p className="text-3xl font-bold text-indigo-600">{dateDiff.days}</p>
                        <p className="text-sm text-gray-600">Days</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-600 mb-3">Time Units</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Weeks</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {dateDiff.totalWeeks.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Days</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {dateDiff.totalDays.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Hours</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {dateDiff.totalHours.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Minutes</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {dateDiff.totalMinutes.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Seconds</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {dateDiff.totalSeconds.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Milliseconds</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {dateDiff.totalMilliseconds.toLocaleString()}
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

export default DateDiffCalculator;
