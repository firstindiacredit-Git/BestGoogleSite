import React, { useState } from 'react';
import { Back } from './back';
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const DiscountCalculator = () => {
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
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

  const calculateDiscount = (e) => {
    e.preventDefault();
    const price = parseFloat(originalPrice);
    const discount = parseFloat(discountPercentage);

    if (isNaN(price) || isNaN(discount)) {
      setError('Please enter valid numbers for all fields');
      setResult(null);
      return;
    }

    if (price <= 0) {
      setError('Price must be greater than zero');
      setResult(null);
      return;
    }

    if (discount < 0 || discount > 100) {
      setError('Discount percentage must be between 0 and 100');
      setResult(null);
      return;
    }

    const discountAmount = (price * discount) / 100;
    const finalPrice = price - discountAmount;
    const savings = ((discountAmount / price) * 100).toFixed(1);

    setResult({
      originalPrice: price,
      discountPercentage: discount,
      discountAmount: discountAmount,
      finalPrice: finalPrice,
      savings: savings,
      breakdown: [
        {
          label: 'Original Price',
          amount: price,
          color: 'text-blue-600'
        },
        {
          label: 'Discount Amount',
          amount: discountAmount,
          color: 'text-green-600'
        },
        {
          label: 'Final Price',
          amount: finalPrice,
          color: 'text-indigo-600'
        }
      ]
    });
    setError('');
  };

  const handleReset = () => {
    setOriginalPrice('');
    setDiscountPercentage('');
    setResult(null);
    setError('');
  };

  const chartData = result ? {
    labels: ['Final Price', 'Discount Amount'],
    datasets: [
      {
        data: [result.finalPrice, result.discountAmount],
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
    <div className="min-h-screen bg-blue-100 dark:bg-[#513a7a] py-4">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-[#28283a] rounded-[30px] shadow-md dark:border-none">
          <div className="p-1">
            <Back />
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-white dark:from-[#28283a] dark:to-[#28283a] p-2 border-b border-gray-100 dark:border-none">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center">
              Discount Calculator
            </h1>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl border border-red-200 dark:border-none text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <div className="bg-gray-50 dark:bg-[#28283a] rounded-2xl p-6">
                <form onSubmit={calculateDiscount} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-200 mb-2">
                      Original Price ( )
                    </label>
                    <input
                      type="text"
                      value={originalPrice}
                      onChange={(e) => handleNumberInput(e.target.value, setOriginalPrice)}
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-none rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                      placeholder="Enter original price"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-200 mb-2">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="text"
                      value={discountPercentage}
                      onChange={(e) => handleNumberInput(e.target.value, setDiscountPercentage)}
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-none rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                      placeholder="Enter discount percentage"
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
                      className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-200 dark:border-none rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      Reset
                    </button>
                  </div>
                </form>

                {/* Quick Discount Buttons
                <div className="pt-4">
                  <p className="text-sm text-gray-600 mb-2">Quick Discounts</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 20, 25, 50].map((discount) => (
                      <button
                        key={discount}
                        type="button"
                        onClick={() => setDiscountPercentage(discount.toString())}
                        className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {discount}%
                      </button>
                    ))}
                  </div>
                </div> */}
              </div>

              {/* Results Section */}
              <div className="space-y-6">
                {result ? (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-none">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-indigo-50 dark:bg-[#3730a3] rounded-lg h-32 flex flex-col justify-center">
                        <p className="text-sm text-gray-600">Original Price</p>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 mt-2">
                          {formatCurrency(result.originalPrice)}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg h-32 flex flex-col justify-center">
                        <p className="text-sm text-gray-600 dark:text-gray-200">You Save</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-300 mt-2">
                          {formatCurrency(result.discountAmount)}
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg h-32 flex flex-col justify-center">
                        <p className="text-sm text-gray-600 dark:text-gray-200">Final Price</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-300 mt-2">
                          {formatCurrency(result.finalPrice)}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg h-32 flex flex-col justify-center">
                        <p className="text-sm text-gray-600 dark:text-gray-200">Savings</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-300 mt-2">
                          {result.savings}%
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-none flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-300 text-center">
                      Enter price and discount percentage to see the results
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Distribution and Breakdown Section */}
            <div className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-none">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-200 mb-4">Price Distribution</h3>
                  {result ? (
                    <div className="w-full h-64">
                      <Pie data={chartData} options={chartOptions} />
                    </div>
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-gray-400 dark:text-gray-500 mb-2">
                          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-300 text-sm">
                          Chart will appear here after calculation
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Detailed Breakdown */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-none">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-200 mb-4">Price Breakdown</h3>
                  {result ? (
                    <div className="space-y-3">
                      {result.breakdown.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
                          <span className={`text-sm font-medium ${item.color}`}>
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-gray-400 dark:text-gray-500 mb-2">
                          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-300 text-sm">
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

export default DiscountCalculator;