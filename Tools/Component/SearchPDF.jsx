import React, { useState } from 'react';
import * as XLSX from 'xlsx'; // Import XLSX library
import { Back } from './back';

const ExcelSearch = () => {
  const [excelData, setExcelData] = useState([]); // Store parsed Excel data
  const [searchTerm, setSearchTerm] = useState(''); // Track search input
  const [filteredData, setFilteredData] = useState([]); // Store search results
  const [selectedKeywords, setSelectedKeywords] = useState([]); // Store selected checkboxes

  const keywords = ['NACH', 'SALARY', 'UPI', 'DIRECT DEBIT', 'BOUNCE', 'RETURN']; // Define keyword checkboxes

  // Handle file upload and parse the Excel file
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      let combinedData = [];

      // Iterate through all sheets in the workbook
      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Parse each sheet

        combinedData = [...combinedData, ...sheetData]; // Merge sheet data
      });

      setExcelData(combinedData); // Store all sheet data
      setFilteredData(combinedData); // Initialize search results
    };

    reader.readAsArrayBuffer(file); // Read the file as ArrayBuffer
  };

  // Handle search input change
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    filterData(value, selectedKeywords);
  };

  // Handle checkbox change
  const handleCheckboxChange = (keyword) => {
    let updatedKeywords = [...selectedKeywords];
    if (updatedKeywords.includes(keyword)) {
      updatedKeywords = updatedKeywords.filter((k) => k !== keyword); // Remove keyword
    } else {
      updatedKeywords.push(keyword); // Add keyword
    }
    setSelectedKeywords(updatedKeywords);
    filterData(searchTerm, updatedKeywords);
  };

  // Filter the Excel data based on search term and selected checkboxes
  const filterData = (term, keywords) => {
    const filtered = excelData.filter((row) =>
      row.some((cell) => {
        const cellValue = cell?.toString().toLowerCase();
        const matchesTerm = cellValue.includes(term);
        const matchesKeywords =
          keywords.length === 0 ||
          keywords.some((keyword) => cellValue.includes(keyword.toLowerCase()));
        return matchesTerm && matchesKeywords;
      })
    );

    setFilteredData(filtered);
  };

  // Select all checkboxes
  const handleSelectAll = () => {
    setSelectedKeywords(keywords); // Select all keywords
    filterData(searchTerm, keywords);
  };

  // Clear all checkboxes
  const handleClearAll = () => {
    setSelectedKeywords([]); // Clear all keywords
    filterData(searchTerm, []);
  };

  return (
    <div className="min-h-screen bg-blue-100 dark:bg-[#513a7a] flex flex-col items-center justify-start p-6">
      <div className="bg-white dark:bg-[#28283a] shadow-md rounded-lg p-8 w-full max-w-7xl">
        <Back/>
         <div>
             
            <button className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'><a href='https://www.ilovepdf.com/pdf_to_excel' target='_blank'>Click And Convert Pdf To Excel</a></button>
         </div>
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Excel Search Tools</h1>

        {/* Upload Excel File */}
        <h1 className='font-semibold dark:text-white px-2 py-2'>upload excel file</h1>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="mb-4 block w-full text-sm text-gray-500 dark:text-white
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />

        {/* Search Input */}
        
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search for data..."
          className="w-full border rounded-lg p-4 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white   "
        />

        {/* Keyword Checkboxes */}
        <div className="flex justify-between mb-4">
          <div>
            {keywords.map((keyword) => (
              <label key={keyword} className="mr-4">
                <input
                  type="checkbox"
                  checked={selectedKeywords.includes(keyword)}
                  onChange={() => handleCheckboxChange(keyword)}
                  className="mr-2"
                />
                {keyword}
              </label>
            ))}
          </div>

          {/* Select All and Clear All Buttons */}
          <div className="space-x-4">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Display Results */}
        {filteredData.length > 0 ? (
          <div className="overflow-auto max-h-screen">
            <table className="table-auto w-full border-collapse border border-gray-300">
              <tbody>
                {filteredData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border px-4  text-gray-800 dark:text-white py-2 text-center"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-white text-center">
            No matching data found.
          </p>
        )}
      </div>
    </div>
  );
};

export default ExcelSearch;