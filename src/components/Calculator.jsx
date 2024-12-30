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

  // // Handle keyboard input
  // useEffect(() => {
  //   const handleKeyPress = (event) => {
  //     if (
  //       document.activeElement.tagName !== "INPUT" &&
  //       document.activeElement.tagName !== "TEXTAREA"
  //     ) {
  //       if (/[\d+\-*/.=()]/.test(event.key)) {
  //         handleCalcInput(event.key === "Enter" ? "=" : event.key);
  //       }
  //     }
  //   };
  
  //   window.addEventListener("keydown", handleKeyPress);
  //   return () => window.removeEventListener("keydown", handleKeyPress);
  // }, [calcInput]);

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
    setCalcInput("");  
    localStorage.removeItem("calcHistory");
  };

  return (
  <div className="flex items-center w-full min-h-[30vh] justify-center">
  <div className="dark:bg-[#1f345f] bg-gray-200 h-full w-full p-[0.8vw]">
    {showHistory ? (
      <div className="dark:bg-[#1f345f] text-white w-full h-full p-[2vw]">
        <div className="flex justify-between items-center mb-[2vw]">
          <h3 className="font-bold text-[1.5vw]">History</h3>
          <button
            onClick={toggleHistory}
            className="text-gray-400 hover:text-white"
          >
            <IoClose size="2vw" />
          </button>
        </div>
        <div className="min-h-[30vh] w-full">
          {history.length > 0 ? (
            history.map((entry, index) => (
              <div
                key={index}
                className={`text-[1vw] mb-[0.5vw] ${
                  index % 2 === 0
                    ? "bg-gray-700 dark:bg-gray-700"
                    : "dark:bg-gray-800"
                }`}
              >
                {entry}
              </div>
            ))
          ) : (
            <div className="text-[1vw] text-gray-400">
              No history available
            </div>
          )}
        </div>
        <button
          className="w-full mt-[2vw] p-[1vw] rounded-lg bg-red-500 text-white font-bold hover:bg-red-600"
          onClick={clearHistory}
        >
          Clear History
        </button>
      </div>
    ) : (
      <>
        {/* Display */}
        <div className="text-right text-gray-700 dark:text-white p-[0.5vw] rounded-lg bg-white dark:bg-gray-800 mb-[0.8vw]">
          <div className="text-[1.4vw] opacity-70">
            {(history.length > 0 && history[0]) || "0"}
          </div>
          <div className="text-[1.6vw] font-bold">
            {calcInput || calcResult || "0"}
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-[0.2vw] ">
          {["C", "%", "(", ")"].map((val, i) => (
            <button
              key={val}
              className={`p-[1.4vw] rounded-md text-[1vw] font-bold bg-gray-300 dark:bg-[#4a5b8a] text-gray-500 hover:text-gray-100 transition-all dark:text-white hover:bg-gray-600`}
              onClick={() => handleCalcInput(val)}
            >
              {val}
            </button>
          ))}
          {["7", "8", "9", "/"].map((val, i) => (
            <button
              key={val}
              className={`p-[1.4vw] rounded-md text-[1vw] font-bold ${
                i === 3
                  ? "bg-gray-600 hover:bg-gray-800  dark:bg-[#ff9502] text-gray-100 hover:text-gray-100 transition-all dark:text-white"
                  : "bg-gray-300 dark:bg-[#4a5b8a] text-gray-500 hover:text-gray-100 transition-all dark:text-white hover:bg-gray-600"
              }`}
              onClick={() => handleCalcInput(val)}
            >
              {val}
            </button>
          ))}
          {["4", "5", "6", "*"].map((val, i) => (
            <button
              key={val}
              className={`p-[1.4vw] rounded-md text-[1vw] font-bold ${
                i === 3
                  ? "bg-gray-600 hover:bg-gray-800  dark:bg-[#ff9502] text-gray-100 hover:text-gray-100 transition-all dark:text-white"
                  : "bg-gray-300 dark:bg-[#4a5b8a] text-gray-500 hover:text-gray-100 transition-all dark:text-white hover:bg-gray-600"
              }`}
              onClick={() => handleCalcInput(val)}
            >
              {val}
            </button>
          ))}
          {["1", "2", "3", "-"].map((val, i) => (
            <button
              key={val}
              className={`p-[1.4vw] rounded-md text-[1vw] font-bold ${
                i === 3
                  ? "bg-gray-600 hover:bg-gray-800 dark:bg-[#ff9502] text-gray-100 hover:text-gray-100 transition-all dark:text-white"
                  : "bg-gray-300 dark:bg-[#4a5b8a] text-gray-500 hover:text-gray-100 transition-all dark:text-white hover:bg-gray-600"
              }`}
              onClick={() => handleCalcInput(val)}
            >
              {val}
            </button>
          ))}
          <button
            className="p-[1.4vw] rounded-md text-[1vw] font-bold flex justify-center bg-gray-300 dark:bg-[#4a5b8a] text-gray-500 hover:text-gray-100 transition-all dark:text-white hover:bg-gray-600"
            onClick={toggleHistory}
          >
            <FaHistory className="mt-[0.5vw]" />
          </button>
          <button
            className="p-[1vw] col-span-1 rounded-md text-[1.5vw] font-bold bg-gray-300 dark:bg-[#4a5b8a] text-gray-500 hover:text-gray-100 transition-all dark:text-white hover:bg-gray-600"
            onClick={() => handleCalcInput("0")}
          >
            0
          </button>
          <button
            className="p-[1.4vw] rounded-md text-[1vw] font-bold bg-gray-300 dark:bg-[#4a5b8a] text-gray-500 hover:text-gray-100 transition-all dark:text-white hover:bg-gray-600"
            onClick={() => handleCalcInput(".")}
          >
            .
          </button>
          <button
            className="p-[1.4vw] rounded-md text-[1vw] font-bold bg-gray-600 hover:bg-gray-800 dark:bg-[#ff9502] text-gray-100 hover:text-gray-100 transition-all dark:text-white"
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
