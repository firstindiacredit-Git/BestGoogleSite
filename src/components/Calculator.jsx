import React, { useState, useEffect } from "react";
import { FaHistory } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { FaBackspace } from "react-icons/fa";
import { evaluate } from "mathjs";

function Calculator() {
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("calcHistory")) || [];
    setHistory(savedHistory);
  }, []);

  const handleCalcInput = (value) => {
    if (value === "=") {
      try {
        const expression = calcInput.replace(/x/g, '*');
        const result = evaluate(expression);
        setCalcResult(result);

        const newEntry = `${calcInput} = ${result}`;
        const updatedHistory = [newEntry, ...history].slice(0, 10);
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
    } else if (value === "backspace") {
      setCalcInput(calcInput.slice(0, -1));
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
    localStorage.removeItem("calcHistory");
  };

  return (
    <div className="flex items-center w-full min-h-[30vh] justify-center">
      <div className="dark:bg-gray-900 rounded-lg bg-white h-full w-full p-[0.8vw]">
        {showHistory ? (
          <div className="dark:bg-gray-900 text-white w-full h-full p-[2vw]">
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
                    className={`text-[1vw] mb-[0.5vw] p-[1vw] ${
                      index % 2 === 0
                        ? "bg-gray-700 dark:bg-gray-700"
                        : "dark:bg-gray-800"
                    }`}
                  >
                    {entry}
                  </div>
                ))
              ) : (
                <div className="text-[1vw] text-gray-400">No history available</div>
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
            <div className="text-right text-gray-700 dark:text-white p-[0.5vw] rounded-lg bg-gray-100 dark:bg-gray-800 mb-[0.8vw]">
              <div className="text-[1.4vw] opacity-70">
                {(history.length > 0 && history[0]) || "0"}
              </div>
              <div className="text-[1.6vw] font-bold">
                {calcInput || calcResult || "0"}
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-4 gap-[0.2vw]">
              {/* Row 1 */}
              <button
                className="p-[1.4vw] rounded-lg  text-[1vw] font-bold bg-gray-100 text-blue-500 dark:text-blue-500 dark:bg-gray-800/50 dark:hover:bg-gray-800 hover:text-gray-800 transition-all hover:bg-gray-50"
                onClick={() => handleCalcInput("C")}
              >
                C
              </button>
              
              <button
                className="p-[1.4vw] rounded-lg  text-[1vw] font-bold bg-gray-100 text-blue-500 dark:text-blue-500 dark:bg-gray-800/50 dark:hover:bg-gray-800 hover:text-gray-800 transition-all hover:bg-gray-50"
                onClick={() => handleCalcInput("backspace")}
              >
                <FaBackspace className="mx-auto" />
              </button>
              <button
                className="text-blue-500 rounded-lg  p-[0.6vw] dark:text-blue-500 font-black text-[1vw] hover:bg-gray-50 hover:text-gray-800 dark:bg-gray-800/50 dark:hover:bg-gray-800 bg-gray-100"
                onClick={() => handleCalcInput("%")}
              >
                %
              </button>
              <button
                className="text-blue-500 rounded-lg  p-[0.6vw] dark:text-blue-500 font-bold text-[1.7vw] hover:bg-gray-50 hover:text-gray-800 dark:bg-gray-800/50 dark:hover:bg-gray-800 bg-gray-100"
                onClick={() => handleCalcInput("/")}
              >
                ÷
              </button>

              {/* Row 2 */}
              {["7", "8", "9", "*"].map((val, i) => (
                <button
                  key={val}
                  className={`p-[1.4vw]  rounded-lg text-[1vw] font-bold ${
                    i === 3
                      ? "text-blue-500 p-[0.6vw] text-[1.7vw] dark:text-blue-500 hover:bg-gray-50 hover:text-gray-800 dark:bg-gray-800/50 dark:hover:bg-gray-800 bg-gray-100"
                      : "bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 text-gray-800 hover:text-gray-800 transition-all dark:text-white hover:bg-gray-50"
                  }`}
                  onClick={() => handleCalcInput(val === "*" ? "x" : val)}
                >
                  {val === "*" ? "×" : val}
                </button>
              ))}

              {/* Row 3 */}
              {["4", "5", "6", "-"].map((val, i) => (
                <button
                  key={val}
                  className={`p-[1.4vw] rounded-lg text-[1vw] font-bold ${
                    i === 3
                      ? "text-blue-500 p-[0.6vw] text-[1.7vw] dark:text-blue-500 hover:bg-gray-50 hover:text-gray-800 dark:bg-gray-800/50 dark:hover:bg-gray-800 bg-gray-100"
                      : "bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 text-gray-800 hover:text-gray-800 transition-all dark:text-white hover:bg-gray-50"
                  }`}
                  onClick={() => handleCalcInput(val)}
                >
                  {val}
                </button>
              ))}

              {/* Row 4 */}
              {["1", "2", "3", "+"].map((val, i) => (
                <button
                  key={val}
                  className={`p-[1.4vw] rounded-lg text-[1vw] font-bold ${
                    i === 3
                      ? "text-blue-500 p-[0.6vw] text-[1.7vw] dark:text-blue-500 hover:bg-gray-50 hover:text-gray-800 dark:bg-gray-800/50 dark:hover:bg-gray-800 bg-gray-100"
                      : "bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 text-gray-800 hover:text-gray-800 transition-all dark:text-white hover:bg-gray-50"
                  }`}
                  onClick={() => handleCalcInput(val)}
                >
                  {val}
                </button>
              ))}

              {/* Row 5 */}
              <button
                className="p-[1.4vw] text-[1vw] rounded-lg font-bold flex justify-center bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 text-gray-800 hover:text-gray-800 transition-all dark:text-white hover:bg-gray-50"
                onClick={toggleHistory}
              >
                <FaHistory className="mt-[0.3vw] text-blue-500 dark:text-blue-500" />
              </button>
              <button
                className="p-[1vw] text-[1vw] rounded-lg font-bold bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 text-gray-800 hover:text-gray-800 transition-all dark:text-white hover:bg-gray-50"
                onClick={() => handleCalcInput("0")}
              >
                0
              </button>
              <button
                className="p-[1.4vw] text-[1vw] rounded-lg font-black bg-gray-100 text-gray-800 dark:text-blue-500 dark:bg-gray-800/50 dark:hover:bg-gray-800 hover:text-gray-800 transition-all hover:bg-gray-50"
                onClick={() => handleCalcInput(".")}
              >
                •
              </button>
              <button
                className="p-[1.4vw] text-[1vw] rounded-lg font-bold  bg-blue-500 hover:bg-blue-400 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-800 text-white "
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
