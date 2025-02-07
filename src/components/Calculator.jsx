import React, { useState, useEffect } from "react";
import { FaHistory } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { FaBackspace } from "react-icons/fa";
import { evaluate } from "mathjs";

function Calculator() {
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [lastOperation, setLastOperation] = useState(false);
  const collapse = () => {
    setCollapsed(!collapsed);
  };
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("calcHistory")) || [];
    setHistory(savedHistory);
  }, []);

  const isOperator = (value) => {
    return ["+", "-", "*", "/", "%"].includes(value);
  };

  const handleCalcInput = (value) => {
    if (value === "=") {
      try {
        // Don't calculate if input ends with an operator
        if (isOperator(calcInput.slice(-1))) {
          return;
        }

        const expression = calcInput.replace(/x/g, "*");
        const result = evaluate(expression);

        // Handle division by zero and invalid results
        if (!isFinite(result)) {
          setCalcResult("Error");
          setCalcInput("");
          return;
        }

        // Format the result to avoid long decimals
        const formattedResult = Number.isInteger(result)
          ? result.toString()
          : parseFloat(result.toFixed(8)).toString();

        setCalcResult(formattedResult);
        const newEntry = `${calcInput} = ${formattedResult}`;
        const updatedHistory = [newEntry, ...history].slice(0, 10);
        setHistory(updatedHistory);
        localStorage.setItem("calcHistory", JSON.stringify(updatedHistory));

        setCalcInput(formattedResult);
        setLastOperation(true);
      } catch (error) {
        setCalcResult("Error");
        setCalcInput("");
      }
    } else if (value === "C") {
      setCalcInput("");
      setCalcResult("");
      setLastOperation(false);
    } else if (value === "backspace") {
      setCalcInput(calcInput.slice(0, -1));
      setLastOperation(false);
    } else {
      // Handle operators
      if (isOperator(value)) {
        // Don't allow operator if input is empty
        if (calcInput === "") {
          if (value === "-") {
            setCalcInput("-");
          }
          return;
        }

        // Don't allow multiple operators in sequence
        if (isOperator(calcInput.slice(-1))) {
          // Replace the last operator with the new one
          setCalcInput(calcInput.slice(0, -1) + value);
          return;
        }

        setLastOperation(false);
      } else {
        // For numbers and decimal point
        if (lastOperation) {
          // If last operation was equals, start new calculation
          if (value === ".") {
            setCalcInput("0.");
          } else {
            setCalcInput(value);
          }
          setLastOperation(false);
          return;
        }

        // Handle decimal points
        if (value === ".") {
          // Don't allow multiple decimal points in the same number
          const parts = calcInput.split(/[\+\-\*\/]/);
          const lastNumber = parts[parts.length - 1];
          if (lastNumber.includes(".")) {
            return;
          }
          // Add leading zero if decimal point is first character
          if (calcInput === "" || isOperator(calcInput.slice(-1))) {
            setCalcInput(calcInput + "0.");
            return;
          }
        }
      }

      setCalcInput(calcInput + value);
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
    <div className="w-full  backdrop-blur-sm h-full">
     

      {!collapsed && (
        <div className={` rounded-sm  h-full w-full p-3`}>
          {showHistory ? (
            <div className="dark:bg-[#28283A] text-white w-full h-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl">History</h3>
                <button
                  onClick={toggleHistory}
                  className="text-gray-400 hover:text-white"
                >
                  <IoClose className="w-6 h-6" />
                </button>
              </div>
              <div className="h-[calc(100%-6rem)] overflow-auto">
                {history.length > 0 ? (
                  history.map((entry, index) => (
                    <div
                      key={index}
                      className={`text-sm mb-2 p-3 ${
                        index % 2 === 0
                          ? "bg-gray-700 dark:bg-[#513a7a]"
                          : "dark:bg-[#513a7a]"
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
                className="w-full mt-4 p-3 rounded-sm bg-red-500 text-white font-bold hover:bg-red-600"
                onClick={clearHistory}
              >
                Clear History
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Display */}
              <div className="text-right text-gray-700 dark:text-white p-2 rounded-sm bg-gray-100 dark:bg-[#513a7a]/20 mb-3">
                <div className="text-lg opacity-70">
                  {(history.length > 0 && history[0]) || "0"}
                </div>
                <div className="text-xl font-bold">
                  {calcInput || calcResult || "0"}
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-4 gap-1 flex-1">
                {/* Row 1 */}
                <button
                  className="p-4 rounded-sm text-base font-bold bg-gray-100 text-[#8163D3] dark:text-[#8163D3] dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 hover:text-gray-800 transition-all hover:bg-gray-50"
                  onClick={() => handleCalcInput("C")}
                >
                  C
                </button>

                <button
                  className="p-4 rounded-sm text-base font-bold bg-gray-100 text-[#8163D3] dark:text-[#8163D3] dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 hover:text-gray-800 transition-all hover:bg-gray-50"
                  onClick={() => handleCalcInput("backspace")}
                >
                  <FaBackspace className="mx-auto" />
                </button>
                <button
                  className="text-[#8163D3] rounded-sm p-4 dark:text-[#8163D3] font-black text-base hover:bg-gray-50 hover:text-gray-800 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 bg-gray-100"
                  onClick={() => handleCalcInput("%")}
                >
                  %
                </button>
                <button
                  className="text-[#8163D3] rounded-sm p-4 dark:text-[#8163D3] font-bold text-2xl hover:bg-gray-50 hover:text-gray-800 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 bg-gray-100"
                  onClick={() => handleCalcInput("/")}
                >
                  ÷
                </button>

                {/* Row 2 */}
                {["7", "8", "9", "*"].map((val, i) => (
                  <button
                    key={val}
                    className={`p-4 rounded-sm text-base font-bold ${
                      i === 3
                        ? "text-[#8163D3] text-2xl dark:text-[#8163D3] hover:bg-gray-50 hover:text-gray-800 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 bg-gray-100"
                        : "bg-gray-100 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 text-gray-800 hover:text-gray-800 transition-all dark:text-white hover:bg-gray-50"
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
                    className={`p-4 rounded-sm text-base font-bold ${
                      i === 3
                        ? "text-[#8163D3] text-2xl dark:text-[#8163D3] hover:bg-gray-50 hover:text-gray-800 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 bg-gray-100"
                        : "bg-gray-100 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 text-gray-800 hover:text-gray-800 transition-all dark:text-white hover:bg-gray-50"
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
                    className={`p-4 rounded-sm text-base font-bold ${
                      i === 3
                        ? "text-[#8163D3] text-2xl dark:text-[#8163D3] hover:bg-gray-50 hover:text-gray-800 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 bg-gray-100"
                        : "bg-gray-100 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 text-gray-800 hover:text-gray-800 transition-all dark:text-white hover:bg-gray-50"
                    }`}
                    onClick={() => handleCalcInput(val)}
                  >
                    {val}
                  </button>
                ))}

                {/* Row 5 */}
                <button
                  className="p-4 text-base rounded-sm font-bold flex justify-center bg-gray-100 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 text-gray-800 hover:text-gray-800 transition-all dark:text-white hover:bg-gray-50"
                  onClick={toggleHistory}
                >
                  <FaHistory className="mt-1 text-[#8163D3] dark:text-[#8163D3]" />
                </button>
                <button
                  className="p-4 text-base rounded-sm font-bold bg-gray-100 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 text-gray-800 hover:text-gray-800 transition-all dark:text-white hover:bg-gray-50"
                  onClick={() => handleCalcInput("0")}
                >
                  0
                </button>
                <button
                  className="p-4 text-base rounded-sm font-bold bg-gray-100 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 text-gray-800 hover:text-gray-800 transition-all dark:text-white hover:bg-gray-50"
                  onClick={() => handleCalcInput(".")}
                >
                  .
                </button>
                <button
                  className="bg-indigo-500 text-white p-4 text-base rounded-sm font-bold dark:bg-[#483072] hover:bg-indigo-600"
                  onClick={() => handleCalcInput("=")}
                >
                  =
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Calculator;
