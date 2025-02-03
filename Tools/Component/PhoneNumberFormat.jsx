import { useState } from "react";
import axios from "axios";
import { Back } from "./back";

function PhoneNumberFormat() {
  const [numbers, setNumbers] = useState("");
  const [results, setResults] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!numbers.trim()) {
      setError("Please enter phone numbers");
      return;
    }
    setError("");
    setIsValidating(true);
    try {
      const response = await axios.post("http://localhost:4000/api/validate", {
        numbers: numbers,
      });
      setResults(response.data.results);
    } catch (error) {
      console.error("Error validating numbers", error);
      setError("Failed to validate numbers. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const validResults = results.filter((result) => result.isValid);
  const invalidResults = results.filter((result) => !result.isValid);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-2 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="relative p-4 sm:p-6">
            <div className="mb-8 sm:mb-0 sm:absolute sm:top-6 sm:left-6">
              <Back />
            </div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Phone Number Validator
            </h1>
          </div>

          {/* Main Content */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="space-y-6">
              {/* Input Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Numbers
                </label>
                <textarea
                  value={numbers}
                  onChange={(e) => setNumbers(e.target.value)}
                  placeholder="Enter phone numbers separated by commas or new lines"
                  className="w-full px-4 sm:px-6 py-3 bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl border border-gray-100 shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all h-32 resize-none"
                  rows={6}
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
                  onClick={handleSubmit}
                  disabled={isValidating || !numbers.trim()}
                  className={`px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-3.5 rounded-xl text-base sm:text-lg font-medium transition-all duration-200 ${
                    isValidating || !numbers.trim()
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
                    "Validate Numbers"
                  )}
                </button>
              </div>

              {/* Results Section */}
              {(validResults.length > 0 || invalidResults.length > 0) && (
                <div className="space-y-6 mt-8">
                  {/* Valid Numbers */}
                  <div className="bg-green-50 rounded-xl p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Valid Numbers
                    </h2>
                    <div className="space-y-2">
                      {validResults.length > 0 ? (
                        validResults.map((result, index) => (
                          <div
                            key={index}
                            className="bg-white/50 border border-green-100 rounded-lg p-3 text-green-700 flex items-center justify-between"
                          >
                            <span>{result.formattedNumber}</span>
                            <span className="text-sm text-green-600">
                              {result.countryCode ? `+${result.countryCode}` : "Unknown"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-green-600 text-sm">No valid numbers found</p>
                      )}
                    </div>
                  </div>

                  {/* Invalid Numbers */}
                  <div className="bg-red-50 rounded-xl p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      Invalid Numbers
                    </h2>
                    <div className="space-y-2">
                      {invalidResults.length > 0 ? (
                        invalidResults.map((result, index) => (
                          <div
                            key={index}
                            className="bg-white/50 border border-red-100 rounded-lg p-3 text-red-700 flex items-center justify-between"
                          >
                            <span>{result.formattedNumber}</span>
                            <span className="text-sm text-red-600">
                              {result.countryCode ? `+${result.countryCode}` : "Unknown"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-red-600 text-sm">No invalid numbers found</p>
                      )}
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
}

export default PhoneNumberFormat;
