import React, { useState } from "react";
import { Back } from "./back";

const AverageCalculator = () => {
  const [numbers, setNumbers] = useState("");
  const [average, setAverage] = useState(null);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  const calculateStats = (numArray) => {
    const total = numArray.reduce((acc, curr) => acc + curr, 0);
    const avg = total / numArray.length;
    const min = Math.min(...numArray);
    const max = Math.max(...numArray);
    const sorted = [...numArray].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    return {
      average: avg.toFixed(2),
      min: min.toFixed(2),
      max: max.toFixed(2),
      median: median.toFixed(2),
      count: numArray.length
    };
  };

  const calculateAverage = () => {
    if (!numbers.trim()) {
      setError("Please enter some numbers");
      setAverage(null);
      setStats(null);
      return;
    }

    const numArray = numbers
      .trim()
      .split(/\s+/)  // Split by one or more spaces
      .map((num) => parseFloat(num))
      .filter((num) => !isNaN(num));

    if (numArray.length === 0) {
      setError("Please enter valid numbers");
      setAverage(null);
      setStats(null);
      return;
    }

    setError("");
    const calculatedStats = calculateStats(numArray);
    setAverage(calculatedStats.average);
    setStats(calculatedStats);
  };

  const reset = () => {
    setNumbers("");
    setAverage(null);
    setError("");
    setStats(null);
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
              Average Calculator
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
                  Enter Numbers (space-separated)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={numbers}
                    onChange={(e) => {
                      setNumbers(e.target.value);
                      setError("");
                    }}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                    placeholder="e.g., 10 20 30 40"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Separate numbers with spaces
                </p>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={calculateAverage}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors duration-200"
                >
                  Calculate
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Reset
                </button>
              </div>

              {/* Results */}
              {stats && (
                <div className="space-y-4">
                  {/* Main Result */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Average</p>
                      <p className="text-3xl font-bold text-indigo-600">
                        {stats.average}
                      </p>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Min</p>
                      <p className="text-lg font-semibold text-gray-800">{stats.min}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Max</p>
                      <p className="text-lg font-semibold text-gray-800">{stats.max}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Median</p>
                      <p className="text-lg font-semibold text-gray-800">{stats.median}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Count</p>
                      <p className="text-lg font-semibold text-gray-800">{stats.count}</p>
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

export default AverageCalculator;
