import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { Back } from './back';

const currencyNames = {
  USD: 'United States Dollar',
  EUR: 'Euro',
  GBP: 'British Pound Sterling',
  JPY: 'Japanese Yen',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  INR: 'Indian Rupee',
  CNY: 'Chinese Yuan',
  CHF: 'Swiss Franc',
  NZD: 'New Zealand Dollar',
  SGD: 'Singapore Dollar',
  HKD: 'Hong Kong Dollar',
  SEK: 'Swedish Krona',
  KRW: 'South Korean Won',
  MXN: 'Mexican Peso',
  ZAR: 'South African Rand'
};

const CustomSelect = ({ value, onChange, options, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <div 
        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value} - {currencyNames[value] || value}</span>
        <svg className={`w-4 h-4 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {options.map(option => (
            <div
              key={option}
              className="px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => {
                onChange({ target: { value: option } });
                setIsOpen(false);
              }}
            >
              {option} - {currencyNames[option] || option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CurrencyConverter = () => {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [allRates, setAllRates] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCurrencies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        setCurrencies([res.data.base, ...Object.keys(res.data.rates)]);
        setAllRates(res.data.rates);
        setExchangeRate(res.data.rates[toCurrency]);
      } catch (error) {
        console.error("Error fetching currencies: ", error);
        setError("Failed to fetch currencies. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    getCurrencies();
  }, [toCurrency]);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (fromCurrency === toCurrency) {
        setExchangeRate(1);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
        setExchangeRate(res.data.rates[toCurrency]);
      } catch (error) {
        console.error("Error fetching exchange rate: ", error);
        setError("Failed to fetch exchange rate. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchExchangeRate();
  }, [fromCurrency, toCurrency]);

  const handleAmountChange = (e) => setAmount(e.target.value);
  const handleFromCurrencyChange = (e) => setFromCurrency(e.target.value);
  const handleToCurrencyChange = (e) => setToCurrency(e.target.value);

  const convertedAmount = (amount * exchangeRate).toFixed(8);

  const chartData = {
    labels: Object.keys(allRates).slice(0, 10),
    datasets: [
      {
        label: `1 ${fromCurrency} in other currencies`,
        data: Object.values(allRates).slice(0, 10),
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-4">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-[30px] shadow-md border-2 border-gray-100">
          {/* Back Button */}
          <div className="p-1">
            <Back />
          </div>

          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 to-white p-2 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800 text-center">
              Currency Converter
            </h1>
          </div>

          <div className="p-4 overflow-visible">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <div className="bg-gray-50 rounded-2xl p-4 space-y-4 overflow-visible">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                />
              </div>

              {/* Currency Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-visible">
                <CustomSelect
                  value={fromCurrency}
                  onChange={handleFromCurrencyChange}
                  options={currencies}
                  label="From Currency"
                />
                
                <CustomSelect
                  value={toCurrency}
                  onChange={handleToCurrencyChange}
                  options={currencies}
                  label="To Currency"
                />
              </div>

              {/* Result */}
              {exchangeRate && !isLoading && (
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Converted Amount</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {amount} {fromCurrency} = {convertedAmount} {toCurrency}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      1 {fromCurrency} = {exchangeRate.toFixed(8)} {toCurrency}
                    </p>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="text-center py-4 text-gray-600">
                  Loading exchange rates...
                </div>
              )}
            </div>

            {/* Chart Section */}
            {!isLoading && (
              <div className="mt-6 bg-gray-50 rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 10 Exchange Rates</h3>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <Bar data={chartData} options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                  }} />
                </div>
              </div>
            )}

            {/* Exchange Rates Table */}
            {!isLoading && (
              <div className="mt-6 bg-gray-50 rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">All Exchange Rates</h3>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Currency</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Name</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(allRates).map(([currency, rate]) => (
                          <tr key={currency} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm font-medium text-gray-700">{currency}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{currencyNames[currency] || currency}</td>
                            <td className="px-4 py-2 text-sm text-right font-medium text-gray-700">{rate.toFixed(8)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;