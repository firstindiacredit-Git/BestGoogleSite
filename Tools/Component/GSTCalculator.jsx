import React, { useState } from "react";
import { Pie } from "react-chartjs-2";
import { Back } from "./back";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const GSTCalculator = () => {
  const [amount, setAmount] = useState("");
  const [gstRate, setGstRate] = useState("");
  const [customRate, setCustomRate] = useState("");
  const [isCustomRate, setIsCustomRate] = useState(false);
  const [calculationType, setCalculationType] = useState("exclusive");
  const [result, setResult] = useState(null);
  const [showTooltip, setShowTooltip] = useState({ exclusive: false, inclusive: false });

  // Chart options
  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom",
      },
    },
    maintainAspectRatio: false,
  };

  // Function to handle number input
  const handleNumberInput = (value, setter) => {
    // Remove any non-digit characters except decimal point
    const sanitizedValue = value.replace(/[^\d.]/g, "");
    // Ensure only one decimal point
    const decimalCount = (sanitizedValue.match(/\./g) || []).length;
    if (decimalCount > 1) return;
    // Update state
    setter(sanitizedValue);
  };

  // Function to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Calculate GST
  const calculateGST = (e) => {
    e.preventDefault();
    const inputAmount = parseFloat(amount);
    const gst = parseFloat(gstRate);

    if (isNaN(inputAmount) || isNaN(gst)) return;

    let baseAmount, gstAmount, totalAmount;

    if (calculationType === "exclusive") {
      // GST Exclusive (Add GST to base amount)
      baseAmount = inputAmount;
      gstAmount = (baseAmount * gst) / 100;
      totalAmount = baseAmount + gstAmount;
    } else {
      // GST Inclusive (Extract GST from total amount)
      totalAmount = inputAmount;
      baseAmount = (totalAmount * 100) / (100 + gst);
      gstAmount = totalAmount - baseAmount;
    }

    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;

    // Prepare chart data
    const chartData = {
      labels: ["Base Amount", "CGST", "SGST"],
      datasets: [
        {
          data: [baseAmount, cgst, sgst],
          backgroundColor: ["#818cf8", "#4ade80", "#fb923c"],
          borderColor: ["#6366f1", "#22c55e", "#f97316"],
          borderWidth: 1,
        },
      ],
    };

    setResult({
      baseAmount,
      gstAmount,
      totalAmount,
      cgst,
      sgst,
      gstRate: gst,
      chartData,
      calculationType,
    });
  };

  // Reset calculator
  const handleReset = () => {
    setAmount("");
    setGstRate("");
    setCustomRate("");
    setIsCustomRate(false);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[30px] shadow-md border-2 border-gray-100">
          <Back />
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            GST Calculator
          </h1>

          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <form onSubmit={calculateGST} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Calculation Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setCalculationType("exclusive")}
                          onMouseEnter={() => setShowTooltip({ ...showTooltip, exclusive: true })}
                          onMouseLeave={() => setShowTooltip({ ...showTooltip, exclusive: false })}
                          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                            calculationType === "exclusive"
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          GST Exclusive
                        </button>
                        {showTooltip.exclusive && (
                          <div className="absolute z-10 w-64 p-2 mt-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg">
                            When GST is exclusive, the tax is added to the base amount. 
                            Example: Base  100 + 18% GST = Total  118
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setCalculationType("inclusive")}
                          onMouseEnter={() => setShowTooltip({ ...showTooltip, inclusive: true })}
                          onMouseLeave={() => setShowTooltip({ ...showTooltip, inclusive: false })}
                          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                            calculationType === "inclusive"
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          GST Inclusive
                        </button>
                        {showTooltip.inclusive && (
                          <div className="absolute z-10 w-64 p-2 mt-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg">
                            When GST is inclusive, the tax is already included in the total amount. 
                            Example: Total  118 includes 18% GST (Base  100)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      {calculationType === "exclusive" ? "Base Amount ( )" : "Total Amount ( )"}
                    </label>
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => handleNumberInput(e.target.value, setAmount)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                      placeholder={calculationType === "exclusive" ? "Enter amount before GST" : "Enter amount including GST"}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      GST Rate (%)
                    </label>
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-2">
                        {[0, 5, 12, 18, 28].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => {
                              setGstRate(rate.toString());
                              setIsCustomRate(false);
                            }}
                            className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
                              gstRate === rate.toString() && !isCustomRate
                                ? "bg-indigo-600 text-white"
                                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {rate}%
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomRate(true);
                            setGstRate(customRate);
                          }}
                          className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
                            isCustomRate
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          Custom
                        </button>
                      </div>
                      {isCustomRate && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={customRate}
                            onChange={(e) => {
                              const value = e.target.value;
                              setCustomRate(value);
                              setGstRate(value);
                            }}
                            className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                            placeholder="Enter %"
                          />
                          <span className="text-sm text-gray-600">%</span>
                        </div>
                      )}
                    </div>
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
                        <p className="text-sm text-gray-600">Base Amount</p>
                        <p className="text-2xl font-bold text-indigo-600 mt-2">
                          {formatCurrency(result.baseAmount)}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg h-32 flex flex-col justify-center">
                        <p className="text-sm text-gray-600">Total GST</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">
                          {formatCurrency(result.gstAmount)}
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg h-32 flex flex-col justify-center">
                        <p className="text-sm text-gray-600">Final Amount</p>
                        <p className="text-2xl font-bold text-orange-600 mt-2">
                          {formatCurrency(result.totalAmount)}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg h-32 flex flex-col justify-center">
                        <p className="text-sm text-gray-600">GST Rate</p>
                        <p className="text-2xl font-bold text-purple-600 mt-2">
                          {result.gstRate}%
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center justify-center">
                    <p className="text-gray-500 text-center">
                      Enter amount and select GST rate to see the results
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
                  <h3 className="text-sm font-medium text-gray-600 mb-4">Amount Distribution</h3>
                  {result ? (
                    <div className="w-full h-64">
                      <Pie data={result.chartData} options={chartOptions} />
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

                {/* GST Breakdown */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-4">GST Breakdown</h3>
                  {result ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600">CGST</p>
                          <p className="text-lg font-semibold text-green-600 mt-1">
                            {formatCurrency(result.cgst)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(result.gstRate / 2)}% of base amount
                          </p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg">
                          <p className="text-sm text-gray-600">SGST</p>
                          <p className="text-lg font-semibold text-orange-600 mt-1">
                            {formatCurrency(result.sgst)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(result.gstRate / 2)}% of base amount
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Base Amount</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(result.baseAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600">Total GST</span>
                          <span className="text-sm font-medium text-green-600">
                            +{formatCurrency(result.gstAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                          <span className="text-sm font-medium text-gray-900">Final Amount</span>
                          <span className="text-sm font-medium text-indigo-600">
                            {formatCurrency(result.totalAmount)}
                          </span>
                        </div>
                      </div>
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

export default GSTCalculator;
