import React, { useState } from 'react';
import { Back } from './back';

const LcmCalculator = () => {
  const [numbers, setNumbers] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [steps, setSteps] = useState([]);

  // Calculate GCD of two numbers
  const calculateGCD = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  };

  // Calculate LCM of two numbers
  const calculateLCMOfTwo = (a, b) => {
    return Math.abs(a * b) / calculateGCD(a, b);
  };

  // Calculate LCM of multiple numbers
  const calculateLCM = () => {
    if (!numbers.trim()) {
      setError('Please enter numbers');
      setResult(null);
      setSteps([]);
      return;
    }

    const numArray = numbers
      .trim()
      .split(/\s+/)
      .map(num => parseInt(num))
      .filter(num => !isNaN(num));

    if (numArray.length === 0) {
      setError('Please enter valid numbers');
      setResult(null);
      setSteps([]);
      return;
    }

    if (numArray.some(num => num <= 0)) {
      setError('Please enter positive numbers only');
      setResult(null);
      setSteps([]);
      return;
    }

    const calculationSteps = [];
    let currentLCM = numArray[0];
    
    calculationSteps.push({
      type: 'start',
      numbers: numArray.join(', ')
    });

    for (let i = 1; i < numArray.length; i++) {
      const prevLCM = currentLCM;
      const currentNum = numArray[i];
      const gcd = calculateGCD(currentLCM, currentNum);
      currentLCM = calculateLCMOfTwo(currentLCM, currentNum);
      
      calculationSteps.push({
        type: 'step',
        numbers: [prevLCM, currentNum],
        gcd: gcd,
        lcm: currentLCM
      });
    }

    calculationSteps.push({
      type: 'result',
      lcm: currentLCM
    });

    setError('');
    setResult(currentLCM);
    setSteps(calculationSteps);
  };

  const reset = () => {
    setNumbers('');
    setResult(null);
    setError('');
    setSteps([]);
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
              LCM Calculator
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
                      setError('');
                    }}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                    placeholder="e.g., 12 18 24"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Enter positive integers separated by spaces
                </p>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={calculateLCM}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors duration-200"
                >
                  Calculate LCM
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Reset
                </button>
              </div>

              {/* Results and Steps */}
              {steps.length > 0 && (
                <div className="space-y-4">
                  {/* Main Result */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">LCM</p>
                      <p className="text-3xl font-bold text-indigo-600">
                        {result}
                      </p>
                    </div>
                  </div>

                  {/* Calculation Steps */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-600 mb-3">Calculation Steps</h3>
                    <div className="space-y-2">
                      {steps.map((step, index) => (
                        <div key={index} className="text-sm">
                          {step.type === 'start' && (
                            <p className="text-gray-600">
                              Numbers: {step.numbers}
                            </p>
                          )}
                          {step.type === 'step' && (
                            <p className="text-gray-600">
                              LCM({step.numbers[0]}, {step.numbers[1]}) = {step.lcm}
                              <br />
                              <span className="text-gray-500 text-xs">
                                GCD: {step.gcd}
                              </span>
                            </p>
                          )}
                          {step.type === 'result' && (
                            <p className="text-gray-800 font-medium">
                              Final LCM: {step.lcm}
                            </p>
                          )}
                        </div>
                      ))}
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

export default LcmCalculator;