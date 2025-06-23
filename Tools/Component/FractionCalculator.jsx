import React, { useState } from "react";
import { Back } from "./back";

// Fraction utility functions
const addFractions = (num1, den1, num2, den2) => {
  const commonDenominator = den1 * den2;
  const numerator = num1 * den2 + num2 * den1;
  return simplifyFraction(numerator, commonDenominator);
};

const subtractFractions = (num1, den1, num2, den2) => {
  const commonDenominator = den1 * den2;
  const numerator = num1 * den2 - num2 * den1;
  return simplifyFraction(numerator, commonDenominator);
};

const multiplyFractions = (num1, den1, num2, den2) => {
  const numerator = num1 * num2;
  const denominator = den1 * den2;
  return simplifyFraction(numerator, denominator);
};

const divideFractions = (num1, den1, num2, den2) => {
  const numerator = num1 * den2;
  const denominator = den1 * num2;
  return simplifyFraction(numerator, denominator);
};

const simplifyFraction = (num, den) => {
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.abs(num), Math.abs(den));
  return { 
    numerator: den < 0 ? -num / divisor : num / divisor, 
    denominator: Math.abs(den) / divisor 
  };
};

// Input Component
const Input = ({ label, name, value, onChange }) => (
  <div className="flex flex-col w-full">
    <label className="text-sm font-medium text-gray-600 mb-1">{label}</label>
    <input
      type="number"
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
      placeholder="0"
    />
  </div>
);

// Operation Button Component
const OperationButton = ({ operation, onClick, isActive }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
    }`}
  >
    {operation}
  </button>
);

// Main Component
const FractionCalculator = () => {
  const [fraction1, setFraction1] = useState({ num: "", den: "" });
  const [fraction2, setFraction2] = useState({ num: "", den: "" });
  const [result, setResult] = useState({ numerator: 0, denominator: 1 });
  const [activeOperation, setActiveOperation] = useState(null);
  const [error, setError] = useState("");

  const validateInputs = () => {
    if (!fraction1.num || !fraction1.den || !fraction2.num || !fraction2.den) {
      setError("Please fill in all fields");
      return false;
    }
    if (fraction1.den === "0" || fraction2.den === "0") {
      setError("Denominator cannot be zero");
      return false;
    }
    setError("");
    return true;
  };

  const handleOperation = (operation) => {
    if (!validateInputs()) return;

    setActiveOperation(operation);
    const num1 = parseInt(fraction1.num);
    const den1 = parseInt(fraction1.den);
    const num2 = parseInt(fraction2.num);
    const den2 = parseInt(fraction2.den);

    let res;
    switch (operation) {
      case "add":
        res = addFractions(num1, den1, num2, den2);
        break;
      case "subtract":
        res = subtractFractions(num1, den1, num2, den2);
        break;
      case "multiply":
        res = multiplyFractions(num1, den1, num2, den2);
        break;
      case "divide":
        if (num2 === 0) {
          setError("Cannot divide by zero");
          return;
        }
        res = divideFractions(num1, den1, num2, den2);
        break;
      default:
        res = { numerator: 0, denominator: 1 };
    }
    setResult(res);
  };

  const handleInputChange = (fraction, field, value) => {
    if (fraction === 1) {
      setFraction1(prev => ({ ...prev, [field]: value }));
    } else {
      setFraction2(prev => ({ ...prev, [field]: value }));
    }
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-4">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-[30px] shadow-md border-2 border-gray-100">
          <div className="p-1">
            <Back />
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-white p-2 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800 text-center">
              Fraction Calculator
            </h1>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
              {/* First Fraction */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Numerator 1"
                  name="numerator1"
                  value={fraction1.num}
                  onChange={(e) => handleInputChange(1, "num", e.target.value)}
                />
                <Input
                  label="Denominator 1"
                  name="denominator1"
                  value={fraction1.den}
                  onChange={(e) => handleInputChange(1, "den", e.target.value)}
                />
              </div>

              {/* Second Fraction */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Numerator 2"
                  name="numerator2"
                  value={fraction2.num}
                  onChange={(e) => handleInputChange(2, "num", e.target.value)}
                />
                <Input
                  label="Denominator 2"
                  name="denominator2"
                  value={fraction2.den}
                  onChange={(e) => handleInputChange(2, "den", e.target.value)}
                />
              </div>

              {/* Operation Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "add", label: "Add" },
                  { key: "subtract", label: "Subtract" },
                  { key: "multiply", label: "Multiply" },
                  { key: "divide", label: "Divide" }
                ].map((op) => (
                  <OperationButton
                    key={op.key}
                    operation={op.label}
                    onClick={() => handleOperation(op.key)}
                    isActive={activeOperation === op.key}
                  />
                ))}
              </div>

              {/* Result */}
              {(result.numerator !== 0 || activeOperation) && (
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Result</p>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-2xl font-bold text-indigo-600">
                        {result.numerator}
                      </span>
                      <div className="h-0.5 w-6 bg-indigo-600"></div>
                      <span className="text-2xl font-bold text-indigo-600">
                        {result.denominator}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      = {(result.numerator / result.denominator).toFixed(3)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FractionCalculator;
