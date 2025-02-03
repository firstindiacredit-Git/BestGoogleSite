import React, { useState } from 'react';
import { Back } from './back';

function Percentage() {
  // States for "What is X% of Y"
  const [percentage, setPercentage] = useState('');
  const [value, setValue] = useState('');
  const [result, setResult] = useState('');
  const [out, setOut] = useState('');

  // States for "Percentage Change"
  const [initialValue, setInitialValue] = useState('');
  const [finalValue, setFinalValue] = useState('');
  const [percentageChange, setPercentageChange] = useState('');

  // States for "X is what percent of Y"
  const [partValue, setPartValue] = useState('');
  const [wholeValue, setWholeValue] = useState('');
  const [whatPercentResult, setWhatPercentResult] = useState('');

  // States for "X is Y% of what?"
  const [part, setPart] = useState('');
  const [percentOfWhat, setPercentOfWhat] = useState('');
  const [wholeFromPercent, setWholeFromPercent] = useState('');

  // Calculation functions remain the same
  const calculatePercentage = (e) => {
    e.preventDefault();
    if (percentage && value) {
      const calcResult = (percentage / 100) * value;
      setResult(calcResult);
      setOut(`${percentage}% of ${value} is ${calcResult}`);
    }
  };

  const calculatePercentageChange = (e) => {
    e.preventDefault();
    if (initialValue && finalValue) {
      const change = ((finalValue - initialValue) / initialValue) * 100;
      setPercentageChange(change.toFixed(2));
    }
  };

  const calculateWhatPercent = (e) => {
    e.preventDefault();
    if (partValue && wholeValue) {
      const calcResult = (partValue / wholeValue) * 100;
      setWhatPercentResult(calcResult.toFixed(2));
    }
  };

  const calculateWholeFromPercent = (e) => {
    e.preventDefault();
    if (part && percentOfWhat) {
      const calcWhole = (part / percentOfWhat) * 100;
      setWholeFromPercent(calcWhole.toFixed(2));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-start justify-center pt-4">
      <div className="max-w-2xl w-full px-2">
        <div className="bg-white rounded-[30px] shadow-md overflow-hidden border-2 border-gray-100">
          {/* Back Button */}
          <div className="p-1">
            <Back />
          </div>

          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 to-white p-2 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800 text-center">
              Percentage Calculator
            </h1>
          </div>

          <div className="p-2 space-y-2">
            {/* Calculator Cards Container */}
            <div className="grid grid-cols-1 gap-2">
              {/* What is X% of Y */}
              <div className="bg-gray-50 rounded-2xl p-2 min-h-[160px]">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">What is X% of Y?</h2>
                <form onSubmit={calculatePercentage} className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Percentage (X)
                      </label>
                      <input
                        type="number"
                        value={percentage}
                        onChange={(e) => setPercentage(e.target.value)}
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                        placeholder="Enter percentage"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Value (Y)
                      </label>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                        placeholder="Enter value"
                      />
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      Calculate
                    </button>
                  </div>
                  {result && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xl font-bold text-indigo-600 text-center">{result}</p>
                      <p className="text-sm text-gray-600 text-center mt-1">{out}</p>
                    </div>
                  )}
                </form>
              </div>

              {/* Percentage Change */}
              <div className="bg-gray-50 rounded-2xl p-2 min-h-[160px]">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Percentage Change</h2>
                <form onSubmit={calculatePercentageChange} className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Initial Value
                      </label>
                      <input
                        type="number"
                        value={initialValue}
                        onChange={(e) => setInitialValue(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                        placeholder="Enter initial value"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Final Value
                      </label>
                      <input
                        type="number"
                        value={finalValue}
                        onChange={(e) => setFinalValue(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                        placeholder="Enter final value"
                      />
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      Calculate Change
                    </button>
                  </div>
                  {percentageChange && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xl font-bold text-indigo-600 text-center">{percentageChange}%</p>
                      <p className="text-sm text-gray-600 text-center mt-1">
                        Change from {initialValue} to {finalValue}
                      </p>
                    </div>
                  )}
                </form>
              </div>

              {/* X is what percent of Y */}
              <div className="bg-gray-50 rounded-2xl p-2 min-h-[160px]">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">X is what percent of Y?</h2>
                <form onSubmit={calculateWhatPercent} className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Part Value (X)
                      </label>
                      <input
                        type="number"
                        value={partValue}
                        onChange={(e) => setPartValue(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                        placeholder="Enter part value"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Whole Value (Y)
                      </label>
                      <input
                        type="number"
                        value={wholeValue}
                        onChange={(e) => setWholeValue(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                        placeholder="Enter whole value"
                      />
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      Calculate Percentage
                    </button>
                  </div>
                  {whatPercentResult && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xl font-bold text-indigo-600 text-center">{whatPercentResult}%</p>
                      <p className="text-sm text-gray-600 text-center mt-1">
                        {partValue} is {whatPercentResult}% of {wholeValue}
                      </p>
                    </div>
                  )}
                </form>
              </div>

              {/* X is Y% of what */}
              <div className="bg-gray-50 rounded-2xl p-2 min-h-[160px]">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">X is Y% of what?</h2>
                <form onSubmit={calculateWholeFromPercent} className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Part Value (X)
                      </label>
                      <input
                        type="number"
                        value={part}
                        onChange={(e) => setPart(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                        placeholder="Enter part value"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Percentage (Y)
                      </label>
                      <input
                        type="number"
                        value={percentOfWhat}
                        onChange={(e) => setPercentOfWhat(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                        placeholder="Enter percentage"
                      />
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      Calculate Whole
                    </button>
                  </div>
                  {wholeFromPercent && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xl font-bold text-indigo-600 text-center">{wholeFromPercent}</p>
                      <p className="text-sm text-gray-600 text-center mt-1">
                        {part} is {percentOfWhat}% of {wholeFromPercent}
                      </p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Percentage;
