import React, { useState } from 'react';
import { Back } from './back';
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const SimpleInterestCalculator = () => {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleNumberInput = (value, setter) => {
    const sanitizedValue = value.replace(/[eE]/g, '');
    if (sanitizedValue === '' || /^\d*\.?\d*$/.test(sanitizedValue)) {
      setter(sanitizedValue);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateInterest = (e) => {
    e.preventDefault();
    const P = parseFloat(principal);
    const R = parseFloat(rate);
    const T = parseFloat(time);

    if (isNaN(P) || isNaN(R) || isNaN(T)) {
      setError('Please enter valid numbers for all fields');
      setResult(null);
      return;
    }

    if (P <= 0 || R <= 0 || T <= 0) {
      setError('All values must be greater than zero');
      setResult(null);
      return;
    }

    const interest = (P * R * T) / 100;
    const totalAmount = P + interest;

    setResult({
      principal: P,
      interest: interest,
      totalAmount: totalAmount,
      rate: R,
      time: T,
      yearlyBreakdown: Array.from({ length: Math.ceil(T) }, (_, i) => {
        const years = i + 1;
        const yearlyInterest = (P * R * Math.min(years, T)) / 100;
        return {
          year: years,
          interest: yearlyInterest,
          total: P + yearlyInterest
        };
      })
    });
    setError('');
  };

  const handleReset = () => {
    setPrincipal('');
    setRate('');
    setTime('');
    setResult(null);
    setError('');
  };

  const chartData = result ? {
    labels: ['Principal Amount', 'Interest'],
    datasets: [
      {
        data: [result.principal, result.interest],
        backgroundColor: ['#818cf8', '#4f46e5'],
        borderColor: ['#ffffff', '#ffffff'],
        borderWidth: 2,
      },
    ],
  } : null;

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#6b7280',
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          },
          padding: 20
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-4">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-[30px] shadow-md border-2 border-gray-100">
          <div className="p-1">
            <Back />
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-white p-2 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800 text-center">
              Simple Interest Calculator
            </h1>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <form onSubmit={calculateInterest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Principal Amount ( )
                    </label>
                    <input
                      type="text"
                      value={principal}
                      onChange={(e) => handleNumberInput(e.target.value, setPrincipal)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                      placeholder="Enter initial amount"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Interest Rate (% per year)
                    </label>
                    <input
                      type="text"
                      value={rate}
                      onChange={(e) => handleNumberInput(e.target.value, setRate)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                      placeholder="Enter interest rate"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Time Period (years)
                    </label>
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => handleNumberInput(e.target.value, setTime)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                      placeholder="Enter time in years"
                      required
                    />
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors duration-200"
                    >
                      Calculate
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>

              {/* Results Section */}
              <div className="space-y-6">
                {result ? (
                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-indigo-50 rounded-lg h-32 flex flex-col justify-center">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-indigo-600 mt-2">
                          {formatCurrency(result.totalAmount)}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg h-32 flex flex-col justify-center">
                        <p className="text-sm text-gray-600">Interest Earned</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">
                          {formatCurrency(result.interest)}
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg h-32 flex flex-col justify-center">
                        <p className="text-sm text-gray-600">Principal Amount</p>
                        <p className="text-2xl font-bold text-blue-600 mt-2">
                          {formatCurrency(result.principal)}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg h-32 flex flex-col justify-center">
                        <p className="text-sm text-gray-600">Interest Rate</p>
                        <p className="text-2xl font-bold text-purple-600 mt-2">
                          {result.rate.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center justify-center">
                    <p className="text-gray-500 text-center">
                      Enter principal, rate and time to see the results
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Distribution and Breakdown Section */}
            <div className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-4">Interest Distribution</h3>
                  {result ? (
                    <div className="w-full h-64">
                      <Pie data={chartData} options={chartOptions} />
                    </div>
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-gray-400 mb-2">
                          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-sm">
                          Chart will appear here after calculation
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Yearly Breakdown */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-4">Yearly Breakdown</h3>
                  {result ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {result.yearlyBreakdown.map((year) => (
                        <div
                          key={year.year}
                          className="grid grid-cols-3 gap-2 text-sm p-2 hover:bg-gray-50 rounded-lg"
                        >
                          <div>Year {year.year}</div>
                          <div className="text-right text-gray-600">
                            {formatCurrency(year.total)}
                          </div>
                          <div className="text-right text-green-600">
                            +{formatCurrency(year.interest)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-gray-400 mb-2">
                          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-sm">
                          Breakdown will appear here after calculation
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleInterestCalculator;
