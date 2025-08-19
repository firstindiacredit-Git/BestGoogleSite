import React, { useState, useEffect, useRef } from "react";
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
  const displayRef = useRef(null);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("calcHistory")) || [];
    setHistory(savedHistory);
  }, []);

  const isOperator = (value) => {
    return ["+", "-", "*", "/", "x", "%"].includes(value);
  };

  // Validate the entire input
  const validateInput = (input) => {
    // Check for sequential operators (excluding negative numbers like "5*-2")
    if (/[+*/x][+*/x%]/.test(input) || /\-[\+*/x%]/.test(input)) return false;

    // Check for NaN
    if (input.includes("NaN")) return false;

    // Check for proper operator placement
    if (input.length > 0 && isOperator(input[0]) && input[0] !== "-")
      return false;

    return true;
  };

  const handleCalcInput = (value) => {
    if (value === "=") {
      try {
        // Don't calculate if input is empty or ends with an operator
        if (calcInput === "" || isOperator(calcInput.slice(-1))) {
          return;
        }

        // Replace 'x' with '*' for evaluation
        const expression = calcInput.replace(/x/g, "*");
        const result = evaluate(expression);

        // Handle division by zero and invalid results
        if (!isFinite(result) || isNaN(result)) {
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
      // Check if input would exceed maximum length (15 characters)
      if (calcInput.length >= 25 && !isOperator(value)) {
        return;
      }

      let newInput = calcInput;

      // Handle percentage
      if (value === "%") {
        // Only apply percentage if there's a number to operate on
        if (calcInput !== "" && !isOperator(calcInput.slice(-1))) {
          try {
            // Extract the last number from the input
            const match = calcInput.match(/(-?\d*\.?\d+)$/);
            if (match) {
              const lastNumber = match[0];
              const percentValue = parseFloat(lastNumber) / 100;

              // Replace the last number with its percentage value
              newInput =
                calcInput.substring(0, calcInput.length - lastNumber.length) +
                percentValue.toString();
              setCalcInput(newInput);
            }
          } catch (error) {
            // If there's an error, don't change the input
            return;
          }
        }
        return;
      }

      // Handle operators - Critical fix for x/multiplication
      if (isOperator(value)) {
        // Special case for minus as first character (negative number)
        if (calcInput === "" && value === "-") {
          setCalcInput("-");
          return;
        }

        // Don't allow operator if input is empty
        if (calcInput === "") {
          return;
        }

        // Don't allow multiple operators in sequence
        if (isOperator(calcInput.slice(-1))) {
          // Replace the last operator with the new one
          newInput = calcInput.slice(0, -1) + (value === "*" ? "x" : value);
          if (!validateInput(newInput)) {
            return;
          }
          setCalcInput(newInput);
          return;
        }

        // Add the operator - THIS IS THE CRITICAL FIX
        newInput = calcInput + (value === "*" ? "x" : value);
        setLastOperation(false);
      } else {
        // For numbers and decimal point
        if (lastOperation) {
          // If last operation was equals, start new calculation
          if (value === ".") {
            newInput = "0.";
          } else {
            newInput = value;
          }
          setLastOperation(false);
        } else {
          // Handle decimal points
          if (value === ".") {
            // Don't allow multiple decimal points in the same number
            const parts = calcInput.split(/[\+\-\*\/x]/);
            const lastNumber = parts[parts.length - 1];
            if (lastNumber.includes(".")) {
              return;
            }
            // Add leading zero if decimal point is first character
            if (calcInput === "" || isOperator(calcInput.slice(-1))) {
              newInput = calcInput + "0.";
            } else {
              newInput = calcInput + value;
            }
          } else {
            // Regular number
            newInput = calcInput + value;
          }
        }
      }

      // Validate the new input before setting it
      if (validateInput(newInput)) {
        setCalcInput(newInput);
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

  const handleKeyPress = (e) => {
    e.preventDefault();
    
    // Handle number keys (0-9)
    if (/^[0-9]$/.test(e.key)) {
      handleCalcInput(e.key);
    }
    // Handle operators
    else if (e.key === "+") handleCalcInput("+");
    else if (e.key === "-") handleCalcInput("-");
    else if (e.key === "*") handleCalcInput("*");
    else if (e.key === "/") handleCalcInput("/");
    else if (e.key === "%") handleCalcInput("%");
    else if (e.key === ".") handleCalcInput(".");
    else if (e.key === "Enter" || e.key === "=") handleCalcInput("=");
    else if (e.key === "Backspace") handleCalcInput("backspace");
    else if (e.key === "Escape") handleCalcInput("C");
  };

  return (
    <div className="w-full backdrop-blur-sm h-full">
      {!collapsed && (
        <div className={` rounded-lg h-full w-full `}>
          {showHistory ? (
            <div className="dark:bg-[#28283A]/[var(--widget-opacity)] text-white w-full h-full p-6 flex flex-col justify-between" style={{height: '350px', maxHeight: '100%'}}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl dark:text-white text-black">
                  History
                </h3>
                <button
                  onClick={toggleHistory}
                  className="text-gray-700 hover:text-gray-600 dark:hover:text-gray-100 "
                >
                  <IoClose className="w-6 h-6" />
                </button>
              </div>
              {/* History List with fixed height and scroll */}
              <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#8163D3]/70 scrollbar-track-gray-200 dark:scrollbar-track-[#513a7a]/30" style={{height: '320px', maxHeight: '320px', overflowY: 'auto', scrollbarWidth: 'thin'}}>
                {history.length > 0 ? (
                  history.map((entry, index) => (
                    <div
                      key={index}
                      className={`text-sm mb-2 p-3 ${
                        index % 1 === 0
                          ? "bg-gray-200 rounded-lg text-gray-600 dark:text-gray-200 dark:bg-[#513a7a]"
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
                className="w-full mt-4 p-3 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600"
                onClick={clearHistory}
              >
                Clear History
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full p-3" style={{ height: '350px', minHeight: '350px' }}>
              {/* Display */}
              <div 
                ref={displayRef}
                tabIndex={0}
                onKeyDown={handleKeyPress}
                onClick={() => displayRef.current?.focus()}
                className="text-right text-gray-700 dark:text-white p-2 rounded-lg bg-gray-300/20 dark:bg-[#513a7a]/20 mb-3 cursor-text focus:outline-none focus:ring-2 focus:ring-[#8163D3]"
              >
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
                  className="p-4 rounded-lg text-base font-bold bg-gray-300/20 text-[#8163D3] dark:text-[#8163D3] dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 hover:text-gray-800 transition-all hover:bg-gray-200"
                  onClick={() => handleCalcInput("C")}
                >
                  C
                </button>

                <button
                  className="p-4 rounded-lg text-base font-bold bg-gray-300/20 text-[#8163D3] dark:text-[#8163D3] dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 hover:text-gray-800 transition-all hover:bg-gray-200"
                  onClick={() => handleCalcInput("backspace")}
                >
                  <FaBackspace className="mx-auto" />
                </button>
                <button
                  className="text-[#8163D3] rounded-lg p-4 dark:text-[#8163D3] font-black text-base hover:bg-gray-200 hover:text-gray-800 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 bg-gray-300/20"
                  onClick={() => handleCalcInput("%")}
                >
                  %
                </button>
                <button
                  className="text-[#8163D3] rounded-lg p-4 dark:text-[#8163D3] font-bold text-2xl hover:bg-gray-200 hover:text-gray-800 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 bg-gray-300/20"
                  onClick={() => handleCalcInput("/")}
                >
                  ÷
                </button>

                {/* Row 2 */}
                {["7", "8", "9", "*"].map((val, i) => (
                  <button
                    key={val}
                    className={`p-4 rounded-lg text-base font-bold ${
                      i === 3
                        ? "text-[#8163D3] text-2xl dark:text-[#8163D3] hover:bg-gray-200 hover:text-gray-800 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 bg-gray-300/20"
                        : "bg-gray-300/20 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 text-gray-800 hover:text-gray-800 transition-all dark:text-white hover:bg-gray-200"
                    }`}
                    onClick={() => handleCalcInput(val)}
                  >
                    {val === "*" ? "×" : val}
                  </button>
                ))}

                {/* Row 3 */}
                {["4", "5", "6", "-"].map((val, i) => (
                  <button
                    key={val}
                    className={`p-4 rounded-lg text-base font-bold ${
                      i === 3
                        ? "text-[#8163D3] text-2xl dark:text-[#8163D3] hover:bg-gray-200 hover:text-gray-800 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 bg-gray-300/20"
                        : "bg-gray-300/20 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 text-gray-800 hover:text-gray-800 transition-all dark:text-white hover:bg-gray-200"
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
                    className={`p-4 rounded-lg text-base font-bold ${
                      i === 3
                        ? "text-[#8163D3] text-2xl dark:text-[#8163D3] hover:bg-gray-200 hover:text-gray-800 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 bg-gray-300/20"
                        : "bg-gray-300/20 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 text-gray-800 hover:text-gray-800 transition-all dark:text-white hover:bg-gray-200"
                    }`}
                    onClick={() => handleCalcInput(val)}
                  >
                    {val}
                  </button>
                ))}

                {/* Row 5 */}
                <button
                  className="p-4 text-base rounded-lg font-bold flex justify-center bg-gray-300/20 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 text-gray-800 hover:text-gray-800 transition-all dark:text-white hover:bg-gray-200"
                  onClick={toggleHistory}
                >
                  <FaHistory className="mt-1 text-[#8163D3] dark:text-[#8163D3]" />
                </button>
                <button
                  className="p-4 text-base rounded-lg font-bold bg-gray-300/20 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 text-gray-800 hover:text-gray-800 transition-all dark:text-white hover:bg-gray-200"
                  onClick={() => handleCalcInput("0")}
                >
                  0
                </button>
                <button
                  className="p-4 text-base rounded-lg font-bold bg-gray-300/20 dark:bg-[#513a7a]/10 dark:hover:bg-gray-800 text-gray-800 hover:text-gray-800 transition-all dark:text-white hover:bg-gray-200"
                  onClick={() => handleCalcInput(".")}
                >
                  .
                </button>
                <button
                  className="bg-indigo-500 text-white p-4 text-base rounded-lg font-bold dark:bg-[#483072] hover:bg-indigo-600"
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
