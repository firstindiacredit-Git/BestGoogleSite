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

const TestCalculator = () => {
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [result, setResult] = useState(null);

  // Chart options
  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Score Distribution",
        position: "bottom",
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Predefined test templates
  const testTemplates = {
    "Quiz (10 Questions)": 10,
    "Mid-term (50 Questions)": 50,
    "Final Exam (100 Questions)": 100,
    "IELTS (40 Questions)": 40,
    "TOEFL (120 Questions)": 120,
  };

  // Grade scale with colors
  const gradeScale = {
    "A+": { min: 95, color: "#22c55e" },
    "A": { min: 90, color: "#4ade80" },
    "A-": { min: 85, color: "#86efac" },
    "B+": { min: 80, color: "#60a5fa" },
    "B": { min: 75, color: "#93c5fd" },
    "B-": { min: 70, color: "#bfdbfe" },
    "C+": { min: 65, color: "#f59e0b" },
    "C": { min: 60, color: "#fbbf24" },
    "D": { min: 50, color: "#f87171" },
    "F": { min: 0, color: "#ef4444" },
  };

  const handleTemplateChange = (questions) => {
    setTotalQuestions(questions);
    setWrongAnswers(0);
    setResult(null);
  };

  // Function to handle wrong answer increment
  const addWrongAnswer = () => {
    if (wrongAnswers < totalQuestions) {
      const newWrongAnswers = wrongAnswers + 1;
      setWrongAnswers(newWrongAnswers);
      calculateResults(totalQuestions, newWrongAnswers);
    }
  };

  // Function to handle reset
  const resetCalculator = () => {
    setWrongAnswers(0);
    setTotalQuestions(10);
    setResult(null);
  };

  // Function to get letter grade and color
  const getLetterGrade = (percentage) => {
    for (const [grade, { min, color }] of Object.entries(gradeScale)) {
      if (percentage >= min) {
        return { grade, color };
      }
    }
    return { grade: "F", color: gradeScale["F"].color };
  };

  // Function to calculate the percentage and grades
  const calculateResults = (total = totalQuestions, wrong = wrongAnswers) => {
    const correctAnswers = total - wrong;
    const percentageValue = (correctAnswers / total) * 100;
    const { grade, color } = getLetterGrade(percentageValue);

    // Prepare chart data
    const chartData = {
      labels: ["Correct Answers", "Wrong Answers"],
      datasets: [
        {
          data: [correctAnswers, wrong],
          backgroundColor: [color, "#ef4444"],
          borderColor: ["#ffffff", "#ffffff"],
          borderWidth: 2,
        },
      ],
    };

    setResult({
      percentage: percentageValue.toFixed(2),
      letterGrade: grade,
      fractionGrade: `${correctAnswers}/${total}`,
      correctAnswers,
      wrongAnswers: wrong,
      total,
      chartData,
      gradeColor: color,
    });
  };

  return (
    <div className="min-h-screen bg-blue-100 dark:bg-[#513a7a] py-4 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-[#28283a] rounded-[20px] sm:rounded-[30px] shadow-md dark:border-none overflow-hidden">
          <Back />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-4 sm:mb-8 px-4">
            Test Score Calculator
          </h1>

          <div className="p-3 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column - Input Form */}
              <div className="space-y-4 sm:space-y-6">
                {/* Test Templates */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-200 mb-2">
                    Quick Templates
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(testTemplates).map(([name, questions]) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleTemplateChange(questions)}
                        className="px-3 py-2 rounded-lg font-medium text-sm transition-colors duration-200 bg-white dark:bg-gray-800 dark:text-white text-gray-700 border border-gray-200 dark:border-none hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total Questions Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-200 mb-2">
                    Total Questions
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={totalQuestions}
                    onChange={(e) => setTotalQuestions(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-none rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                  />
                </div>

                {/* Wrong Answers Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-200 mb-2">
                    Wrong Answers
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3">
                    <input
                      type="number"
                      min="0"
                      max={totalQuestions}
                      value={wrongAnswers}
                      onChange={(e) => setWrongAnswers(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-none rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                    />
                    <button
                      onClick={addWrongAnswer}
                      className="w-full sm:w-auto px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200"
                    >
                      + Wrong
                    </button>
                  </div>
                </div>

                {/* Grade Scale */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-200 mb-2">Grade Scale</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {Object.entries(gradeScale).map(([grade, { min, color }]) => (
                      <div
                        key={grade}
                        className="text-center p-2 rounded"
                        style={{ backgroundColor: color + "20", color: color }}
                      >
                        <div className="font-medium">{grade}</div>
                        <div className="text-xs">{min}%+</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 pt-2 gap-2">
                  <button
                    onClick={() => calculateResults()}
                    className="w-full sm:flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Calculate
                  </button>
                  <button
                    onClick={resetCalculator}
                    className="w-full sm:w-auto px-4 py-3 border border-gray-200 dark:border-none bg-white dark:bg-gray-800 dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Right Column - Results */}
              <div className="space-y-4 sm:space-y-6">
                {result ? (
                  <>
                    <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-none">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="p-3 sm:p-4 bg-indigo-50 dark:bg-[#3730a3] rounded-lg sm:h-32 flex flex-col justify-center">
                          <p className="text-sm text-gray-600">Total Questions</p>
                          <p className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-300 mt-2">
                            {result.total}
                          </p>
                        </div>
                        <div
                          className="p-3 sm:p-4 rounded-lg sm:h-32 flex flex-col justify-center"
                          style={{ backgroundColor: result.gradeColor + "20", color: result.gradeColor }}
                        >
                          <p className="text-sm text-gray-600 dark:text-gray-200">Letter Grade</p>
                          <p
                            className="text-xl sm:text-2xl font-bold mt-2"
                            style={{ color: result.gradeColor }}
                          >
                            {result.letterGrade}
                          </p>
                        </div>
                        <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900 rounded-lg sm:h-32 flex flex-col justify-center">
                          <p className="text-sm text-gray-600 dark:text-gray-200">Score</p>
                          <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-300 mt-2">
                            {result.percentage}%
                          </p>
                        </div>
                        <div className="p-3 sm:p-4 bg-orange-50 dark:bg-orange-900 rounded-lg sm:h-32 flex flex-col justify-center">
                          <p className="text-sm text-gray-600 dark:text-gray-200">Fraction</p>
                          <p className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-300 mt-2">
                            {result.fractionGrade}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-none">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Score Distribution
                      </h3>
                      <div className="h-48 sm:h-64">
                        <Pie data={result.chartData} options={chartOptions} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-none h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-300">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-base sm:text-lg text-center">
                      Enter values and calculate to see your test score
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

export default TestCalculator;