import React, { useState, useEffect } from "react";
import { FaHistory } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { evaluate } from "mathjs";

function Calculator() {
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("calcHistory")) || [];
    setHistory(savedHistory);

    // Set the last input from history if no input is provided
    if (savedHistory.length > 0 && !calcInput) {
      const lastEntry = savedHistory[0]; // Use the latest history entry
      setCalcInput(); // Display in the input
    }
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (/[\d+\-*/.=()]/.test(event.key)) {
        handleCalcInput(event.key === "Enter" ? "=" : event.key);
      } else if (event.key === "Backspace") {
        setCalcInput((prev) => prev.slice(0, -1));
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handleCalcInput = (value) => {
    if (value === "=") {
      try {
        const result = evaluate(calcInput); // Safe evaluation
        setCalcResult(result);

        // Save to history
        const newEntry = `${calcInput} = ${result}`;
        const updatedHistory = [newEntry, ...history].slice(0, 10); // Keep only the latest 10 entries
        setHistory(updatedHistory);
        localStorage.setItem("calcHistory", JSON.stringify(updatedHistory));

        setCalcInput(result.toString());
      } catch (error) {
        setCalcResult("Error");
        setCalcInput("");
      }
    } else if (value === "C") {
      setCalcInput("");
      setCalcResult("");
    } else {
      if (calcResult && !calcInput) {
        setCalcInput(calcResult.toString() + value);
        setCalcResult("");
      } else {
        setCalcInput(calcInput + value);
      }
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const clearHistory = () => {
    setHistory([]);
    setCalcInput(""); // Clear input when clearing history
    localStorage.removeItem("calcHistory");
  };

  return (
    <div className="flex items-center mt-5 rounded-lg mb-5 h-[80vh] justify-center">
      <div className="bg-[#1f345f] h-[30rem] rounded-lg shadow-lg p-4 w-80">
        {showHistory ? (
          /* History View */
          <div className="bg-[#1f345f] text-white p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">History</h3>
              <button
                onClick={toggleHistory}
                className="text-gray-400 hover:text-white"
              >
                <IoClose size={24} />
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {history.length > 0 ? (
                history.map((entry, index) => (
                  <div
                    key={index}
                    className={`text-sm mb-1 p-1 ${
                      index % 2 === 0 ? "bg-gray-700" : "bg-gray-800"
                    }`}
                  >
                    {entry}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400">
                  No history available
                </div>
              )}
            </div>
            <button
              className="w-full mt-4 p-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600"
              onClick={clearHistory}
            >
              Clear History
            </button>
          </div>
        ) : (
          /* Calculator View */
          <>
            {/* Display */}
            <div className="text-right text-white p-4 rounded-lg bg-gray-800 mb-4">
              <div className="text-lg opacity-70">
                {(history.length > 0 && history[0]) || "0"}
              </div>
              <div className="text-3xl font-bold">
                {calcInput || calcResult || "0"}
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {["C", "+/-", "(", ")"].map((val, i) => (
                <button
                  key={val}
                  className={`p-4 rounded-full text-lg font-bold bg-[#4a5b8a] text-white hover:bg-gray-600`}
                  onClick={() => handleCalcInput(val)}
                >
                  {val}
                </button>
              ))}
              {["7", "8", "9", "/"].map((val, i) => (
                <button
                  key={val}
                  className={`p-4 rounded-full text-lg font-bold ${
                    i === 3
                      ? "bg-[#ff9502] text-white"
                      : "bg-[#4a5b8a] text-white hover:bg-gray-600"
                  }`}
                  onClick={() => handleCalcInput(val)}
                >
                  {val}
                </button>
              ))}
              {["4", "5", "6", "*"].map((val, i) => (
                <button
                  key={val}
                  className={`p-4 rounded-full text-lg font-bold ${
                    i === 3
                      ? "bg-[#ff9502] text-white"
                      : "bg-[#4a5b8a] text-white hover:bg-gray-600"
                  }`}
                  onClick={() => handleCalcInput(val)}
                >
                  {val}
                </button>
              ))}
              {["1", "2", "3", "-"].map((val, i) => (
                <button
                  key={val}
                  className={`p-4 rounded-full text-lg font-bold ${
                    i === 3
                      ? "bg-[#ff9502] text-white"
                      : "bg-[#4a5b8a] text-white hover:bg-gray-600"
                  }`}
                  onClick={() => handleCalcInput(val)}
                >
                  {val}
                </button>
              ))}
              <button
                className="p-6 rounded-full m-auto text-lg font-bold bg-[#4a5b8a] text-white hover:bg-gray-600"
                onClick={toggleHistory}
              >
                <FaHistory />
              </button>
              <button
                className="col-span-1 p-2 rounded-full text-lg font-bold bg-[#4a5b8a] text-white hover:bg-gray-600"
                onClick={() => handleCalcInput("0")}
              >
                0
              </button>
              <button
                className="p-4 rounded-full text-lg font-bold bg-[#4a5b8a] text-white hover:bg-gray-600"
                onClick={() => handleCalcInput(".")}
              >
                .
              </button>
              <button
                className="p-4 rounded-full text-lg font-bold bg-[#ff9502] text-white"
                onClick={() => handleCalcInput("=")}
              >
                =
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Calculator;
