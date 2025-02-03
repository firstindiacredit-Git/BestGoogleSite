// import React, { useState, useEffect } from 'react';
// import * as XLSX from 'xlsx';
// import 'pdfjs-dist/build/pdf.worker.entry';

// const SearchExcelPdf = () => {
//   const [file, setFile] = useState(null);
//   const [excelData, setExcelData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filteredData, setFilteredData] = useState([]);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [selectedKeywords, setSelectedKeywords] = useState([]);

//   const keywords = ['NACH', 'SALARY', 'UPI', 'DIRECT DEBIT', 'BOUNCE', 'RETURN'];

//   useEffect(() => {
//     const pdfjsVersion = '3.11.174';
//     window.pdfjsLib.GlobalWorkerOptions.workerSrc =
//       `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
//   }, []);

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const convertPDFToExcel = async () => {
//     if (!file) return alert('Please upload a PDF!');
//     setIsProcessing(true);
//     setProgress(0);

//     try {
//       const arrayBuffer = await file.arrayBuffer();
//       const pdfDoc = await window.pdfjsLib.getDocument(arrayBuffer).promise;
//       const structuredData = [];

//       for (let i = 0; i < pdfDoc.numPages; i++) {
//         const page = await pdfDoc.getPage(i + 1);
//         const textContent = await page.getTextContent();
//         const pageData = groupTextByPosition(textContent.items);
//         structuredData.push(...pageData);
//         setProgress(Math.round(((i + 1) / pdfDoc.numPages) * 100));
//       }

//       setExcelData(structuredData);
//       setFilteredData(structuredData);
//       generateExcel(structuredData);
//     } catch (error) {
//       console.error('Error during conversion:', error);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const groupTextByPosition = (items) => {
//     const rows = [];
//     let currentRow = [];
//     let previousY = null;

//     items.sort((a, b) => a.transform[5] - b.transform[5]); // Sort by vertical position

//     items.forEach((item, index) => {
//       const { str, transform } = item;
//       const [x, y] = [transform[4], transform[5]]; // X and Y coordinates

//       if (previousY === null || Math.abs(y - previousY) < 8) {
//         currentRow.push({ text: str, x }); // Add to current row
//       } else {
//         rows.push(currentRow.sort((a, b) => a.x - b.x).map(cell => cell.text)); // New row
//         currentRow = [{ text: str, x }];
//       }
//       previousY = y;

//       if (index === items.length - 1) {
//         rows.push(currentRow.sort((a, b) => a.x - b.x).map(cell => cell.text)); // Final row
//       }
//     });

//     return rows;
//   };

//   const generateExcel = (data) => {
//     const worksheet = XLSX.utils.aoa_to_sheet(data);
//     const workbook = XLSX.utils.book_new();

//     worksheet['!cols'] = Array(data[0]?.length || 1).fill({ width: 20 });

//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
//     XLSX.writeFile(workbook, 'converted_excel.xlsx');
//   };

//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(value);
//     filterData(value, selectedKeywords);
//   };

//   const handleCheckboxChange = (keyword) => {
//     const updatedKeywords = selectedKeywords.includes(keyword)
//       ? selectedKeywords.filter(k => k !== keyword)
//       : [...selectedKeywords, keyword];
//     setSelectedKeywords(updatedKeywords);
//     filterData(searchTerm, updatedKeywords);
//   };

//   const filterData = (term, keywords) => {
//     const filtered = excelData.filter(row =>
//       row.some(cell => {
//         const cellValue = cell.toString().toLowerCase();
//         const matchesTerm = cellValue.includes(term);
//         const matchesKeywords =
//           keywords.length === 0 ||
//           keywords.some(keyword => cellValue.includes(keyword.toLowerCase()));
//         return matchesTerm && matchesKeywords;
//       })
//     );
//     setFilteredData(filtered);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
//       <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-7xl">
//         <h1 className="text-2xl font-bold mb-4 text-center">PDF to Excel & Search Tool</h1>

//         <input
//           type="file"
//           accept=".pdf"
//           onChange={handleFileChange}
//           className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//         />

//         <button
//           onClick={convertPDFToExcel}
//           className={`w-full bg-blue-500 text-white py-2 px-4 rounded ${
//             isProcessing ? 'opacity-50 cursor-not-allowed' : ''
//           }`}
//           disabled={isProcessing}
//         >
//           {isProcessing ? `Processing... ${progress}%` : 'Convert to Excel'}
//         </button>

//         <input
//           type="text"
//           value={searchTerm}
//           onChange={handleSearch}
//           placeholder="Search for data..."
//           className="w-full border rounded-lg p-4 mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />

//         <div className="flex justify-between mt-4">
//           {keywords.map(keyword => (
//             <label key={keyword} className="mr-4">
//               <input
//                 type="checkbox"
//                 checked={selectedKeywords.includes(keyword)}
//                 onChange={() => handleCheckboxChange(keyword)}
//                 className="mr-2"
//               />
//               {keyword}
//             </label>
//           ))}
//         </div>

//         {filteredData.length > 0 ? (
//           <table className="table-auto w-full mt-4 border-collapse border border-gray-300">
//             <tbody>
//               {filteredData.map((row, rowIndex) => (
//                 <tr key={rowIndex} className="border">
//                   {row.map((cell, cellIndex) => (
//                     <td key={cellIndex} className="border px-4 py-2 text-center">
//                       {cell}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p className="text-gray-500 mt-4 text-center">No matching data found.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SearchExcelPdf;






// import React, { useState, useEffect } from 'react';
// import * as XLSX from 'xlsx';
// //import 'pdfjs-dist/build/pdf.worker.entry';
// import * as pdfjsLib from "pdfjs-dist/build/pdf";  // Import core PDF library


// const SearchExcelPdf = () => {
//   const [file, setFile] = useState(null);
//   const [excelData, setExcelData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filteredData, setFilteredData] = useState([]);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [selectedKeywords, setSelectedKeywords] = useState([]);

//   const keywords = ['NACH', 'SALARY', 'UPI', 'DIRECT DEBIT', 'BOUNCE', 'RETURN'];

//   useEffect(() => {
//     // const pdfjsVersion = '3.11.174';
//     // window.pdfjsLib.GlobalWorkerOptions.workerSrc =
//     //   `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
//     pdfjsLib.GlobalWorkerOptions.workerSrc = 
//     `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

//   }, []);

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const convertPDFToExcel = async () => {
//     if (!file) return alert('Please upload a PDF!');
//     setIsProcessing(true);
//     setProgress(0);

//     try {
//       const arrayBuffer = await file.arrayBuffer();
//       const pdfDoc = await window.pdfjsLib.getDocument(arrayBuffer).promise;
//       const structuredData = [];

//       for (let i = 0; i < pdfDoc.numPages; i++) {
//         const page = await pdfDoc.getPage(i + 1);
//         const textContent = await page.getTextContent();
//         const pageData = groupTextByPosition(textContent.items);
//         structuredData.push(...pageData);
//         setProgress(Math.round(((i + 1) / pdfDoc.numPages) * 100));
//       }

//       setExcelData(structuredData);
//       setFilteredData(structuredData);
//       generateExcel(structuredData);
//     } catch (error) {
//       console.error('Error during conversion:', error);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const groupTextByPosition = (items) => {
//     const rows = [];
//     let currentRow = [];
//     let previousY = null;

//     items.sort((a, b) => a.transform[5] - b.transform[5]); // Sort by vertical position

//     items.forEach((item, index) => {
//       const { str, transform } = item;
//       const [x, y] = [transform[4], transform[5]]; // X and Y coordinates

//       // Check if we are still on the same line based on Y-coordinate (adjust tolerance if needed)
//       if (previousY === null || Math.abs(y - previousY) < 8) {
//         currentRow.push({ text: str, x }); // Add to current row
//       } else {
//         rows.push(currentRow.sort((a, b) => a.x - b.x).map(cell => cell.text)); // New row
//         currentRow = [{ text: str, x }];
//       }
//       previousY = y;

//       if (index === items.length - 1) {
//         rows.push(currentRow.sort((a, b) => a.x - b.x).map(cell => cell.text)); // Final row
//       }
//     });

//     return rows;
//   };

//   const generateExcel = (data) => {
//     const worksheet = XLSX.utils.aoa_to_sheet(data);
//     const workbook = XLSX.utils.book_new();

//     // Adjust column widths to fit content (20 characters by default)
//     worksheet['!cols'] = Array(data[0]?.length || 1).fill({ width: 20 });

//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
//     XLSX.writeFile(workbook, 'converted_excel.xlsx');
//   };

//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(value);
//     filterData(value, selectedKeywords);
//   };

//   const handleCheckboxChange = (keyword) => {
//     const updatedKeywords = selectedKeywords.includes(keyword)
//       ? selectedKeywords.filter(k => k !== keyword)
//       : [...selectedKeywords, keyword];
//     setSelectedKeywords(updatedKeywords);
//     filterData(searchTerm, updatedKeywords);
//   };

//   const filterData = (term, keywords) => {
//     const filtered = excelData.filter(row =>
//       row.some(cell => {
//         const cellValue = cell.toString().toLowerCase();
//         const matchesTerm = cellValue.includes(term);
//         const matchesKeywords =
//           keywords.length === 0 ||
//           keywords.some(keyword => cellValue.includes(keyword.toLowerCase()));
//         return matchesTerm && matchesKeywords;
//       })
//     );
//     setFilteredData(filtered);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
//       <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-7xl overflow-x-auto">
//         <h1 className="text-2xl font-bold mb-4 text-center">PDF to Excel & Search Tool</h1>

//         <input
//           type="file"
//           accept=".pdf"
//           onChange={handleFileChange}
//           className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//         />

//         <button
//           onClick={convertPDFToExcel}
//           className={`w-full bg-blue-500 text-white py-2 px-4 rounded ${
//             isProcessing ? 'opacity-50 cursor-not-allowed' : ''
//           }`}
//           disabled={isProcessing}
//         >
//           {isProcessing ? `Processing... ${progress}%` : 'Convert to Excel'}
//         </button>

//         <input
//           type="text"
//           value={searchTerm}
//           onChange={handleSearch}
//           placeholder="Search for data..."
//           className="w-full border rounded-lg p-4 mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />

//         <div className="flex justify-between mt-4">
//           {keywords.map(keyword => (
//             <label key={keyword} className="mr-4">
//               <input
//                 type="checkbox"
//                 checked={selectedKeywords.includes(keyword)}
//                 onChange={() => handleCheckboxChange(keyword)}
//                 className="mr-2"
//               />
//               {keyword}
//             </label>
//           ))}
//         </div>

//         {filteredData.length > 0 ? (
//           <table className="table-auto w-full mt-4 border-collapse border border-gray-300">
//             <tbody>
//               {filteredData.map((row, rowIndex) => (
//                 <tr key={rowIndex} className="border">
//                   {row.map((cell, cellIndex) => (
//                     <td key={cellIndex} className="border px-4 py-2 text-center">
//                       {cell}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p className="text-gray-500 mt-4 text-center">No matching data found.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SearchExcelPdf;


// import React, { useState } from 'react';
// import * as XLSX from 'xlsx';
// import * as pdfjsLib from 'pdfjs-dist/webpack';

// // Set the worker source to the path used by Vite
// pdfjsLib.GlobalWorkerOptions.workerSrc = `pdfjs-dist/build/pdf.worker.js`;

// const SearchExcelPdf = () => {
//   const [file, setFile] = useState(null);
//   const [excelData, setExcelData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filteredData, setFilteredData] = useState([]);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [selectedKeywords, setSelectedKeywords] = useState([]);

//   const keywords = ['NACH', 'SALARY', 'UPI', 'DIRECT DEBIT', 'BOUNCE', 'RETURN'];

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const convertPDFToExcel = async () => {
//     if (!file) return alert('Please upload a PDF!');
//     setIsProcessing(true);
//     setProgress(0);

//     try {
//       const arrayBuffer = await file.arrayBuffer();
//       const pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
//       const structuredData = [];

//       for (let i = 0; i < pdfDoc.numPages; i++) {
//         const page = await pdfDoc.getPage(i + 1);
//         const textContent = await page.getTextContent();
//         const pageData = groupTextByPosition(textContent.items);
//         structuredData.push(...pageData);
//         setProgress(Math.round(((i + 1) / pdfDoc.numPages) * 100));
//       }

//       setExcelData(structuredData);
//       setFilteredData(structuredData);
//       generateExcel(structuredData);
//     } catch (error) {
//       console.error('Error during conversion:', error);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const groupTextByPosition = (items) => {
//     const rows = [];
//     let currentRow = [];
//     let previousY = null;

//     items.sort((a, b) => a.transform[5] - b.transform[5]); // Sort by vertical position

//     items.forEach((item, index) => {
//       const { str, transform } = item;
//       const [x, y] = [transform[4], transform[5]];

//       if (previousY === null || Math.abs(y - previousY) < 8) {
//         currentRow.push({ text: str, x });
//       } else {
//         rows.push(currentRow.sort((a, b) => a.x - b.x).map(cell => cell.text));
//         currentRow = [{ text: str, x }];
//       }
//       previousY = y;

//       if (index === items.length - 1) {
//         rows.push(currentRow.sort((a, b) => a.x - b.x).map(cell => cell.text));
//       }
//     });

//     return rows;
//   };

//   const generateExcel = (data) => {
//     const worksheet = XLSX.utils.aoa_to_sheet(data);
//     const workbook = XLSX.utils.book_new();

//     worksheet['!cols'] = Array(data[0]?.length || 1).fill({ width: 20 });

//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
//     XLSX.writeFile(workbook, 'converted_excel.xlsx');
//   };

//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(value);
//     filterData(value, selectedKeywords);
//   };

//   const handleCheckboxChange = (keyword) => {
//     const updatedKeywords = selectedKeywords.includes(keyword)
//       ? selectedKeywords.filter(k => k !== keyword)
//       : [...selectedKeywords, keyword];
//     setSelectedKeywords(updatedKeywords);
//     filterData(searchTerm, updatedKeywords);
//   };

//   const filterData = (term, keywords) => {
//     const filtered = excelData.filter(row =>
//       row.some(cell => {
//         const cellValue = cell.toString().toLowerCase();
//         const matchesTerm = cellValue.includes(term);
//         const matchesKeywords =
//           keywords.length === 0 ||
//           keywords.some(keyword => cellValue.includes(keyword.toLowerCase()));
//         return matchesTerm && matchesKeywords;
//       })
//     );
//     setFilteredData(filtered);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
//       <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-7xl overflow-x-auto">
//         <h1 className="text-2xl font-bold mb-4 text-center">PDF to Excel & Search Tool</h1>

//         <input
//           type="file"
//           accept=".pdf"
//           onChange={handleFileChange}
//           className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//         />

//         <button
//           onClick={convertPDFToExcel}
//           className={`w-full bg-blue-500 text-white py-2 px-4 rounded ${
//             isProcessing ? 'opacity-50 cursor-not-allowed' : ''
//           }`}
//           disabled={isProcessing}
//         >
//           {isProcessing ? `Processing... ${progress}%` : 'Convert to Excel'}
//         </button>

//         <input
//           type="text"
//           value={searchTerm}
//           onChange={handleSearch}
//           placeholder="Search for data..."
//           className="w-full border rounded-lg p-4 mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />

//         <div className="flex justify-between mt-4">
//           {keywords.map(keyword => (
//             <label key={keyword} className="mr-4">
//               <input
//                 type="checkbox"
//                 checked={selectedKeywords.includes(keyword)}
//                 onChange={() => handleCheckboxChange(keyword)}
//                 className="mr-2"
//               />
//               {keyword}
//             </label>
//           ))}
//         </div>

//         {filteredData.length > 0 ? (
//           <table className="table-auto w-full mt-4 border-collapse border border-gray-300">
//             <tbody>
//               {filteredData.map((row, rowIndex) => (
//                 <tr key={rowIndex} className="border">
//                   {row.map((cell, cellIndex) => (
//                     <td key={cellIndex} className="border px-4 py-2 text-center">
//                       {cell}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p className="text-gray-500 mt-4 text-center">No matching data found.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SearchExcelPdf;
