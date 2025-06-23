import React, { useState } from "react";
import { Back } from "./back";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const ElectricityBillCalculator = () => {
  const [units, setUnits] = useState("");
  const [ratePerUnit, setRatePerUnit] = useState("");
  const [fixedCharges, setFixedCharges] = useState("0");
  const [result, setResult] = useState(null);

  // Chart options
  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Bill Breakdown",
        position: "bottom",
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Predefined rates for different states
  const stateRates = {
    Maharashtra: { rate: 7.5, fixed: 100 },
    Delhi: { rate: 6.5, fixed: 80 },
    Karnataka: { rate: 7.0, fixed: 90 },
    "Tamil Nadu": { rate: 6.8, fixed: 85 },
    Gujarat: { rate: 7.2, fixed: 95 },
  };

  const handleStateChange = (state) => {
    setRatePerUnit(stateRates[state].rate.toString());
    setFixedCharges(stateRates[state].fixed.toString());
  };

  // Calculate the electricity bill
  const calculateBill = (e) => {
    e.preventDefault();
    let unitsConsumed = parseFloat(units);
    let rate = parseFloat(ratePerUnit);
    let fixed = parseFloat(fixedCharges);

    // Check if the values are valid
    if (isNaN(unitsConsumed) || unitsConsumed < 0 || isNaN(rate) || rate < 0) {
      alert("Please enter valid units and rate per unit.");
      setResult(null);
      return;
    }

    // Calculate the components
    const energyCharges = unitsConsumed * rate;
    const totalBill = energyCharges + fixed;

    // Prepare chart data
    const chartData = {
      labels: ["Energy Charges", "Fixed Charges"],
      datasets: [
        {
          data: [energyCharges, fixed],
          backgroundColor: ["#818cf8", "#4ade80"],
          borderColor: ["#6366f1", "#22c55e"],
          borderWidth: 1,
        },
      ],
    };

    setResult({
      unitsConsumed,
      ratePerUnit: rate,
      energyCharges,
      fixedCharges: fixed,
      totalBill,
      chartData,
    });
  };

  const handleReset = () => {
    setUnits("");
    setRatePerUnit("");
    setFixedCharges("0");
    setResult(null);
  };

  const formatCurrency = (value) => {
    return ` ${value.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-4 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[20px] sm:rounded-[30px] shadow-md border-2 border-gray-100 overflow-hidden">
          <Back />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4 sm:mb-8 px-4">
            Electricity Bill Calculator
          </h1>

          <div className="p-3 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column - Input Form */}
              <div className="space-y-4 sm:space-y-6">
                <form onSubmit={calculateBill} className="space-y-4">
                  {/* Quick Rate Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Quick Rate Selection
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(stateRates).map(([state, rates]) => (
                        <button
                          key={state}
                          type="button"
                          onClick={() => handleStateChange(state)}
                          className="px-3 py-2 rounded-lg font-medium text-sm transition-colors duration-200 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Units Consumed
                    </label>
                    <input
                      type="text"
                      value={units}
                      onChange={(e) => setUnits(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                      placeholder="Enter units consumed"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Rate per Unit ( )
                    </label>
                    <input
                      type="text"
                      value={ratePerUnit}
                      onChange={(e) => setRatePerUnit(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                      placeholder="Enter rate per unit"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Fixed Charges ( )
                    </label>
                    <input
                      type="text"
                      value={fixedCharges}
                      onChange={(e) => setFixedCharges(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                      placeholder="Enter fixed charges"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 pt-2">
                    <button
                      type="submit"
                      className="w-full sm:flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 transition-colors duration-200"
                    >
                      Calculate Bill
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full sm:w-auto px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column - Results */}
              <div className="space-y-4 sm:space-y-6">
                {result ? (
                  <>
                    <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="p-3 sm:p-4 bg-indigo-50 rounded-lg sm:h-32 flex flex-col justify-center">
                          <p className="text-sm text-gray-600">Units Consumed</p>
                          <p className="text-xl sm:text-2xl font-bold text-indigo-600 mt-2">
                            {result.unitsConsumed}
                          </p>
                        </div>
                        <div className="p-3 sm:p-4 bg-blue-50 rounded-lg sm:h-32 flex flex-col justify-center">
                          <p className="text-sm text-gray-600">Rate per Unit</p>
                          <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-2">
                            {formatCurrency(result.ratePerUnit)}
                          </p>
                        </div>
                        <div className="p-3 sm:p-4 bg-green-50 rounded-lg sm:h-32 flex flex-col justify-center">
                          <p className="text-sm text-gray-600">Energy Charges</p>
                          <p className="text-xl sm:text-2xl font-bold text-green-600 mt-2">
                            {formatCurrency(result.energyCharges)}
                          </p>
                        </div>
                        <div className="p-3 sm:p-4 bg-orange-50 rounded-lg sm:h-32 flex flex-col justify-center">
                          <p className="text-sm text-gray-600">Fixed Charges</p>
                          <p className="text-xl sm:text-2xl font-bold text-orange-600 mt-2">
                            {formatCurrency(result.fixedCharges)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 p-3 sm:p-4 bg-purple-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-1">Total Bill</p>
                        <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                          {formatCurrency(result.totalBill)}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Bill Breakdown
                      </h3>
                      <div className="h-48 sm:h-64">
                        <Pie data={result.chartData} options={chartOptions} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 h-full flex flex-col items-center justify-center text-gray-500">
                    <svg
                      className="w-12 h-12 sm:w-16 sm:h-16 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <p className="text-base sm:text-lg text-center">
                      Enter consumption details to calculate your bill
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricityBillCalculator;
