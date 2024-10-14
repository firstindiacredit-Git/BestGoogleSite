import React, { useEffect, useState } from "react";

function Calculator() {
  // State for Calculator
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState("");

  // Handle calculator input
  const handleCalcInput = (value) => {
    if (value === "=") {
      try {
        setCalcResult(eval(calcInput)); // Consider using a safer method to evaluate expressions.
        setCalcInput("");
      } catch (error) {
        setCalcResult("Error");
      }
    } else if (value === "C") {
      setCalcInput("");
      setCalcResult("");
    } else {
      setCalcInput(calcInput + value);
    }
  };

  // Handle dropdown selection
  const handleDropdownChange = (e) => {
    setSelectedLink(e.target.value);
  };

  return (
    <div className="min-h-[77vh] bg-transparent p-8">
      {/* Calculator */}
      <div className="mb-2">
        <h2 className="text-xl font-semibold mb-2">Calculator</h2>
        <div className="bg-white/10 backdrop-blur-lg border shadow-xl my-4 rounded-lg p-6 w-[35%] ml-[10px] h-[8%] dark:text-white">
          <div className="mb-4 text-right text-gray-700 dark:text-gray-300">
            <div className="text-xl">{calcInput || "0"}</div>
            <div className="text-3xl font-bold">{calcResult || "0"}</div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {["7", "8", "9", "/"].map((val) => (
              <button
                key={val}
                className="bg-gray-200 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-600 text-lg p-4 rounded-md"
                onClick={() => handleCalcInput(val)}
              >
                {val}
              </button>
            ))}
            {["4", "5", "6", "*"].map((val) => (
              <button
                key={val}
                className="bg-gray-200 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-600 text-lg p-4 rounded-md"
                onClick={() => handleCalcInput(val)}
              >
                {val}
              </button>
            ))}
            {["1", "2", "3", "-"].map((val) => (
              <button
                key={val}
                className="bg-gray-200 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-600 text-lg p-4 rounded-md"
                onClick={() => handleCalcInput(val)}
              >
                {val}
              </button>
            ))}
            <button
              className="col-span-1 bg-gray-200 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-600 text-lg p-4 rounded-md"
              onClick={() => handleCalcInput("0")}
            >
              0
            </button>
            <button
              className="bg-gray-200 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-600 text-lg p-4 rounded-md"
              onClick={() => handleCalcInput(".")}
            >
              .
            </button>
            <button
              className="bg-gray-200 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-600 text-lg p-4 rounded-md"
              onClick={() => handleCalcInput("+")}
            >
              +
            </button>

            <button
              className="col-span-1 bg-blue-500 flex justify-center items-center dark:bg-blue-600 hover:bg-yellow-400 dark:hover:bg-yellow-700 rounded-md"
              onClick={() => handleCalcInput("C")}
            >
              <img
                width="24"
                height="24"
                src="https://img.icons8.com/ios-glyphs/30/ffffff/clear-symbol.png"
                alt="clear-symbol"
              />
            </button>
            <button
              className="col-span-2 bg-red-400 dark:bg-red-600 hover:bg-red-500 dark:hover:bg-red-700 text-white text-lg p-4 rounded-md"
              onClick={() => {
                setCalcInput("");
                setCalcResult("");
              }}
            >
              AC
            </button>
            <button
              className="col-span-2 bg-blue-400 dark:bg-blue-500 hover:bg-blue-500 dark:hover:bg-blue-700 text-white text-lg p-4 rounded-md"
              onClick={() => handleCalcInput("=")}
            >
              =
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calculator;
