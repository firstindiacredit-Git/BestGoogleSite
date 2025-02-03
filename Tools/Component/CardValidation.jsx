import React, { useState } from "react";
import valid from "card-validator";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Back } from "./back";

const CardValidation = () => {
  const [cardNumbers, setCardNumbers] = useState("");
  const [validationResults, setValidationResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const itemsPerPage = 100;

  const luhnCheck = (cardNumber) => {
    let sum = 0;
    let shouldDouble = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const validateInChunks = async (numbers) => {
    const chunkSize = 10000;
    const chunks = [];
    for (let i = 0; i < numbers.length; i += chunkSize) {
      const chunk = numbers.slice(i, i + chunkSize);
      const results = chunk.map((cardNumber) => {
        const numberValidation = valid.number(cardNumber);
        if (!numberValidation.isPotentiallyValid || !luhnCheck(cardNumber)) {
          return { cardNumber, status: "Invalid", cardType: "N/A" };
        } else if (numberValidation.card) {
          return {
            cardNumber,
            status: "Valid",
            cardType: numberValidation.card.type,
          };
        } else {
          return { cardNumber, status: "Unknown", cardType: "N/A" };
        }
      });
      chunks.push(...results);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    setValidationResults(chunks);
  };

  const validateCardNumbers = async () => {
    if (!cardNumbers.trim()) {
      setError("Please enter card details");
      setValidationResults([]);
      return;
    }
    setError("");
    setIsValidating(true);
    const numbers = cardNumbers.split(",").map((num) => num.trim());
    await validateInChunks(numbers);
    setCurrentPage(1);
    setIsValidating(false);
  };

  const downloadCSV = (status) => {
    const filteredData = validationResults.filter((result) => result.status === status);
    const csvRows = [
      ["Card Number", "Status", "Card Type"],
      ...filteredData.map((result) => [result.cardNumber, result.status, result.cardType]),
    ];
    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${status}_cards.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadXLSX = (status) => {
    const filteredData = validationResults.filter((result) => result.status === status);
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cards");
    XLSX.writeFile(workbook, `${status}_cards.xlsx`);
  };

  const downloadPDF = (status) => {
    const filteredData = validationResults.filter((result) => result.status === status);
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(`Card Validation Results - ${status}`, 14, 16);
    const headers = [["Card Number", "Status", "Card Type"]];
    const rows = filteredData.map((result) => [result.cardNumber, result.status, result.cardType]);
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 20,
      theme: "grid",
    });
    doc.save(`${status}_cards.pdf`);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentResults = validationResults.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => {
    if (currentPage < Math.ceil(validationResults.length / itemsPerPage)) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-2 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="relative p-4 sm:p-6">
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
              <Back />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Card Validator
            </h1>
          </div>

          {/* Main Content */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="space-y-6">
              {/* Card Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Numbers
                </label>
                <textarea
                  placeholder="Enter card numbers, separated by commas"
                  value={cardNumbers}
                  onChange={(e) => setCardNumbers(e.target.value)}
                  className="w-full px-4 sm:px-6 py-3 bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl border border-gray-100 shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all h-32 resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              {/* Validate Button */}
              <div className="flex justify-center">
                <button
                  onClick={validateCardNumbers}
                  disabled={isValidating || !cardNumbers.trim()}
                  className={`px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-3.5 rounded-xl text-base sm:text-lg font-medium transition-all duration-200 ${
                    isValidating || !cardNumbers.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                  } text-white min-w-[200px]`}
                >
                  {isValidating ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Validating...
                    </div>
                  ) : (
                    "Validate Cards"
                  )}
                </button>
              </div>

              {/* Results Table */}
              {currentResults.length > 0 && (
                <div className="mt-8 space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Card Number</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Card Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {currentResults.map((result, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-800">{result.cardNumber}</td>
                            <td className={`px-4 py-3 text-sm font-medium ${
                              result.status === "Valid" ? "text-green-600" : 
                              result.status === "Invalid" ? "text-red-600" : 
                              "text-yellow-600"
                            }`}>
                              {result.status}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-800">{result.cardType}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {Math.ceil(validationResults.length / itemsPerPage)}
                    </span>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === Math.ceil(validationResults.length / itemsPerPage)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentPage === Math.ceil(validationResults.length / itemsPerPage)
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      Next
                    </button>
                  </div>

                  {/* Download Buttons */}
                  <div className="space-y-4">
                    {/* Valid Cards Downloads */}
                    <div className="flex flex-wrap gap-3 justify-center">
                      <button
                        onClick={() => downloadCSV("Valid")}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-all"
                      >
                        Download Valid (CSV)
                      </button>
                      <button
                        onClick={() => downloadXLSX("Valid")}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-all"
                      >
                        Download Valid (XLSX)
                      </button>
                      <button
                        onClick={() => downloadPDF("Valid")}
                        className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-all"
                      >
                        Download Valid (PDF)
                      </button>
                    </div>

                    {/* Invalid Cards Downloads */}
                    <div className="flex flex-wrap gap-3 justify-center">
                      <button
                        onClick={() => downloadCSV("Invalid")}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all"
                      >
                        Download Invalid (CSV)
                      </button>
                      <button
                        onClick={() => downloadXLSX("Invalid")}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-all"
                      >
                        Download Invalid (XLSX)
                      </button>
                      <button
                        onClick={() => downloadPDF("Invalid")}
                        className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-all"
                      >
                        Download Invalid (PDF)
                      </button>
                    </div>
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

export default CardValidation;