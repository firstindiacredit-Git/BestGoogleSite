// import React, { useState, useEffect } from 'react';
// import * as pdfjs from 'pdfjs-dist';

// const SearchPDF = () => {
//   const [pdfText, setPdfText] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     // Set up the worker source
//     const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
//     pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
//   }, []);

//   // Handle PDF upload
//   const handleFileUpload = async (event) => {
// const file = event.target.files[0];
// if (!file) return;

// setIsLoading(true);
// setError('');

// try {
//   const pdfData = await file.arrayBuffer();
//   const pdfDoc = await pdfjs.getDocument({ data: pdfData }).promise;

//   let textContent = '';
//   console.log(`PDF loaded with ${pdfDoc.numPages} pages`);

//   for (let i = 1; i <= pdfDoc.numPages; i++) {
//     const page = await pdfDoc.getPage(i);
//     const text = await page.getTextContent();
//     const pageText = text.items.map((item) => item.str).join(' ');

//     textContent += `\nPage ${i}:\n${pageText}\n`;
//   }

//   setPdfText(textContent);
// } catch (err) {
//   console.error('Error reading PDF:', err);
//   setError('Failed to read the PDF file. Please try again.');
// } finally {
//   setIsLoading(false);
// }
// };

//   // Handle keyword search
//   const handleSearch = () => {
//     if (!searchQuery) {
//       setError('Please enter a search query.');
//       return;
//     }

//     if (!pdfText) {
//       setError('Please upload a PDF file first.');
//       return;
//     }

//     try {
//       const results = pdfText
//         .split('\n')
//         .filter((line) =>
//           line.toLowerCase().includes(searchQuery.toLowerCase())
//         );

//       setSearchResults(results);
//       if (results.length === 0) {
//         setError('No results found.');
//       } else {
//         setError('');
//       }
//     } catch (err) {
//       console.error('Error during search:', err);
//       setError('An error occurred during the search. Please try again.');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
//       <h1 className="text-3xl font-bold mb-6">PDF Search Tool</h1>

//       {/* File Upload */}
//       <input
//         type="file"
//         accept="application/pdf"
//         onChange={handleFileUpload}
//         className="mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
//       />

//       {/* Search Input */}
//       <div className="flex gap-4 mb-6 w-full max-w-lg">
//         <input
//           type="text"
//           placeholder="Enter keyword to search"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="flex-grow p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
//         />
//         <button
//           onClick={handleSearch}
//           disabled={isLoading}
//           className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition disabled:opacity-50"
//         >
//           Search
//         </button>
//       </div>

//       {/* Loading Message */}
//       {isLoading && <p className="text-blue-500 mb-4">Loading PDF...</p>}

//       {/* Error Message */}
//       {error && <p className="text-red-500 mb-4">{error}</p>}

//       {/* Search Results */}
//       {/* Search Results Table */}
//       <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6 overflow-x-auto">
//         <h2 className="text-xl font-bold mb-4">Search Results:</h2>
//         {searchResults.length > 0 ? (
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-gray-200">
//                 <th className="border p-2 text-left">Page</th>
//                 <th className="border p-2 text-left">Content</th>
//               </tr>
//             </thead>
//             <tbody>
//               {searchResults.map((result, index) => {
//                 const pageMatch = result.match(/^Page (\d+):/);
//                 const pageNumber = pageMatch ? pageMatch[1] : 'N/A';
//                 const content = result.replace(/^Page \d+:/, '').trim();
//                 return (
//                   <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
//                     <td className="border p-2">{pageNumber}</td>
//                     <td className="border p-2">{content}</td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         ) : (
//           <p className="text-gray-500">No results found.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SearchPDF;

// import React, { useState, useEffect } from 'react';
// import * as pdfjs from 'pdfjs-dist';

// const SearchPDF = () => {
//   const [pdfText, setPdfText] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
//     pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
//   }, []);

//   const handleFileUpload = async (event) => {
//     // ... (keep the existing handleFileUpload function)
//     const file = event.target.files[0];
//     if (!file) return;

//     setIsLoading(true);
//     setError('');

//     try {
//       const pdfData = await file.arrayBuffer();
//       const pdfDoc = await pdfjs.getDocument({ data: pdfData }).promise;

//       let textContent = '';
//       console.log(`PDF loaded with ${pdfDoc.numPages} pages`);

//       for (let i = 1; i <= pdfDoc.numPages; i++) {
//         const page = await pdfDoc.getPage(i);
//         const text = await page.getTextContent();
//         const pageText = text.items.map((item) => item.str).join(' ');

//         textContent += `\nPage ${i}:\n${pageText}\n`;
//       }

//       setPdfText(textContent);
//     } catch (err) {
//       console.error('Error reading PDF:', err);
//       setError('Failed to read the PDF file. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSearch = () => {
//     if (!searchQuery) {
//       setError('Please enter a search query.');
//       return;
//     }

//     if (!pdfText) {
//       setError('Please upload a PDF file first.');
//       return;
//     }

//     try {
//       const lines = pdfText.split('\n');
//       const results = [];
//       let currentTransaction = {};

//       for (let i = 0; i < lines.length; i++) {
//         const line = lines[i].trim();
//         if (line.match(/^\d+$/)) {
//           // This is a new transaction number, start a new transaction object
//           if (Object.keys(currentTransaction).length > 0) {
//             results.push(currentTransaction);
//           }
//           currentTransaction = { number: line };
//         } else if (line.match(/^\d{2} [A-Za-z]{3} \d{4}$/)) {
//           // This is a date, could be transaction date or value date
//           if (!currentTransaction.transactionDate) {
//             currentTransaction.transactionDate = line;
//           } else if (!currentTransaction.valueDate) {
//             currentTransaction.valueDate = line;
//           }
//         } else if (line.match(/^[A-Z0-9]+$/)) {
//           // This looks like a CHQ/REF NO.
//           currentTransaction.chqRefNo = line;
//         } else if (line.match(/^[-+]?\d+(\.\d{2})?$/)) {
//           // This looks like a monetary value
//           if (!currentTransaction.debitCredit) {
//             currentTransaction.debitCredit = line;
//           } else {
//             currentTransaction.balance = line;
//           }
//         } else if (line.length > 0) {
//           // This is probably the transaction details
//           currentTransaction.transactionDetails = (currentTransaction.transactionDetails || '') + ' ' + line;
//         }
//       }

//       // Add the last transaction if it exists
//       if (Object.keys(currentTransaction).length > 0) {
//         results.push(currentTransaction);
//       }

//       // Filter results based on search query
//       const filteredResults = results.filter(transaction => 
//         Object.values(transaction).some(value => 
//           value.toLowerCase().includes(searchQuery.toLowerCase())
//         )
//       );

//       setSearchResults(filteredResults);
//       if (filteredResults.length === 0) {
//         setError('No results found.');
//       } else {
//         setError('');
//       }
//     } catch (err) {
//       console.error('Error during search:', err);
//       setError('An error occurred during the search. Please try again.');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
//       <h1 className="text-3xl font-bold mb-6">PDF Search Tool</h1>

//       {/* File Upload */}
//       <input
//         type="file"
//         accept="application/pdf"
//         onChange={handleFileUpload}
//         className="mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
//       />

//       {/* Search Input */}
//       <div className="flex gap-4 mb-6 w-full max-w-lg">
//         <input
//           type="text"
//           placeholder="Enter keyword to search"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="flex-grow p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
//         />
//         <button
//           onClick={handleSearch}
//           disabled={isLoading}
//           className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition disabled:opacity-50"
//         >
//           Search
//         </button>
//       </div>

//       {/* Loading Message */}
//       {isLoading && <p className="text-blue-500 mb-4">Loading PDF...</p>}

//       {/* Error Message */}
//       {error && <p className="text-red-500 mb-4">{error}</p>}

//       {/* Search Results Table */}
//       <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg p-6 overflow-x-auto">
//         <h2 className="text-xl font-bold mb-4">Search Results:</h2>
//         {searchResults.length > 0 ? (
//           <table className="w-full border-collapse text-sm">
//             <thead>
//               <tr className="bg-gray-200">
//                 <th className="border p-2 text-left">#</th>
//                 <th className="border p-2 text-left">TRANSACTION DATE</th>
//                 <th className="border p-2 text-left">VALUE DATE</th>
//                 <th className="border p-2 text-left">TRANSACTION DETAILS</th>
//                 <th className="border p-2 text-left">CHQ / REF NO.</th>
//                 <th className="border p-2 text-right">DEBIT/CREDIT( )</th>
//                 <th className="border p-2 text-right">BALANCE( )</th>
//               </tr>
//             </thead>
//             <tbody>
//               {searchResults.map((result, index) => (
//                 <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
//                   <td className="border p-2">{result.number}</td>
//                   <td className="border p-2">{result.transactionDate}</td>
//                   <td className="border p-2">{result.valueDate}</td>
//                   <td className="border p-2">{result.transactionDetails}</td>
//                   <td className="border p-2">{result.chqRefNo}</td>
//                   <td className="border p-2 text-right">{result.debitCredit}</td>
//                   <td className="border p-2 text-right">{result.balance}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p className="text-gray-500">No results found.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SearchPDF;

// import React, { useState, useEffect } from 'react';
// import * as pdfjs from 'pdfjs-dist';

// const SearchPDF = () => {
//   const [pdfText, setPdfText] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   // Set up the PDF.js worker
//   useEffect(() => {
//     const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
//     pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
//   }, []);

//   // Handle PDF file upload and extract text content
//   const handleFileUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     setIsLoading(true);
//     setError('');

//     try {
//       const pdfData = await file.arrayBuffer();
//       const pdfDoc = await pdfjs.getDocument({ data: pdfData }).promise;

//       let textContent = '';
//       console.log(`PDF loaded with ${pdfDoc.numPages} pages`);

//       // Loop through all pages to extract text
//       for (let i = 1; i <= pdfDoc.numPages; i++) {
//         const page = await pdfDoc.getPage(i);
//         const text = await page.getTextContent();
//         const pageText = text.items.map((item) => item.str).join(' ');

//         textContent += `\nPage ${i}:\n${pageText}\n`;
//       }

//       setPdfText(textContent);
//     } catch (err) {
//       console.error('Error reading PDF:', err);
//       setError('Failed to read the PDF file. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle search logic and filter transactions
//   const handleSearch = () => {
//     if (!searchQuery) {
//       setError('Please enter a search query.');
//       return;
//     }

//     if (!pdfText) {
//       setError('Please upload a PDF file first.');
//       return;
//     }

//     try {
//       const lines = pdfText.split('\n');
//       const results = [];
//       let currentTransaction = {};

//       // Iterate through the extracted lines and identify transaction fields
//       for (let i = 0; i < lines.length; i++) {
//         const line = lines[i].trim();

//         if (line.match(/^\d+$/)) {
//           // This indicates a new transaction number
//           if (Object.keys(currentTransaction).length > 0) {
//             results.push(currentTransaction);
//           }
//           currentTransaction = { number: line };
//         } else if (line.match(/^\d{2} [A-Za-z]{3} \d{4}$/)) {
//           // Match a date (e.g., "02 Apr 2024")
//           if (!currentTransaction.transactionDate) {
//             currentTransaction.transactionDate = line;
//           } else if (!currentTransaction.valueDate) {
//             currentTransaction.valueDate = line;
//           }
//         } else if (line.match(/^[A-Z0-9]+$/)) {
//           // Match CHQ/REF NO.
//           currentTransaction.chqRefNo = line;
//         } else if (line.match(/^[-+]?\d+(\.\d{2})?$/)) {
//           // Match debit/credit amounts and balance
//           if (!currentTransaction.debitCredit) {
//             currentTransaction.debitCredit = line;
//           } else {
//             currentTransaction.balance = line;
//           }
//         } else if (line.length > 0) {
//           // Add transaction details
//           currentTransaction.transactionDetails = (currentTransaction.transactionDetails || '') + ' ' + line;
//         }
//       }

//       // Add the last transaction if it exists
//       if (Object.keys(currentTransaction).length > 0) {
//         results.push(currentTransaction);
//       }

//       // Filter results based on the search query
//       const filteredResults = results.filter((transaction) =>
//         Object.values(transaction).some((value) =>
//           value.toLowerCase().includes(searchQuery.toLowerCase())
//         )
//       );

//       setSearchResults(filteredResults);
//       console.log(searchResults.transaction)
//       setError(filteredResults.length === 0 ? 'No results found.' : '');
//     } catch (err) {
//       console.error('Error during search:', err);
//       setError('An error occurred during the search. Please try again.');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
//       <h1 className="text-3xl font-bold mb-6">PDF Search Tool</h1>

//       {/* File Upload */}
//       <input
//         type="file"
//         accept="application/pdf"
//         onChange={handleFileUpload}
//         className="mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
//       />

//       {/* Search Input */}
//       <div className="flex gap-4 mb-6 w-full max-w-lg">
//         <input
//           type="text"
//           placeholder="Enter keyword to search"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="flex-grow p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
//         />
//         <button
//           onClick={handleSearch}
//           disabled={isLoading}
//           className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition disabled:opacity-50"
//         >
//           Search
//         </button>
//       </div>

//       {/* Loading Message */}
//       {isLoading && <p className="text-blue-500 mb-4">Loading PDF...</p>}

//       {/* Error Message */}
//       {error && <p className="text-red-500 mb-4">{error}</p>}

//       {/* Search Results Table */}
//       <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg p-6 overflow-x-auto">
//         <h2 className="text-xl font-bold mb-4">Search Results:</h2>
//         {searchResults.length > 0 ? (
//           <table className="w-full border-collapse text-sm">
//             <thead>
//               <tr className="bg-gray-200">
//                 <th className="border p-2 text-left">#</th>
//                 <th className="border p-2 text-left">TRANSACTION DATE</th>
//                 <th className="border p-2 text-left">VALUE DATE</th>
//                 <th className="border p-2 text-left">TRANSACTION DETAILS</th>
//                 <th className="border p-2 text-left">CHQ / REF NO.</th>
//                 <th className="border p-2 text-right">DEBIT/CREDIT( )</th>
//                 <th className="border p-2 text-right">BALANCE( )</th>
//               </tr>
//             </thead>
//             <tbody>
//               {searchResults.map((result, index) => (
//                 <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-yellow-500'}>
//                   <td className="border p-2">{result.number}</td>
//                   <td className="border p-2">{result.transactionDate}</td>
//                   <td className="border p-2">{result.valueDate}</td>
//                   <td className="border p-2">{result.transactionDetails}</td>
//                   <td className="border p-2">{result.chqRefNo}</td>
//                   <td className="border p-2 text-right">{result.debitCredit}</td>
//                   <td className="border p-2 text-right">{result.balance}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p className="text-gray-500">No results found.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SearchPDF;

// import React, { useState, useEffect } from 'react';
// import * as pdfjs from 'pdfjs-dist';

// const SearchPDF = () => {
//     const [pdfText, setPdfText] = useState('');
//     const [allResults, setAllResults] = useState([]);
//     const [error, setError] = useState('');
//     const [isLoading, setIsLoading] = useState(false);

//     // Set up the PDF.js worker
//     useEffect(() => {
//         const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
//         pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
//     }, []);

//     // Handle PDF file upload and extract text content
//     const handleFileUpload = async (event) => {
//         const file = event.target.files[0];
//         if (!file) return;

//         setIsLoading(true);
//         setError('');

//         try {
//             const pdfData = await file.arrayBuffer();
//             const pdfDoc = await pdfjs.getDocument({ data: pdfData }).promise;

//             let extractedData = [];
//             console.log(`PDF loaded with ${pdfDoc.numPages} pages`);

//             // Loop through all pages to extract text
//             for (let i = 1; i <= pdfDoc.numPages; i++) {
//                 const page = await pdfDoc.getPage(i);
//                 const textContent = await page.getTextContent();

//                 // Create a temporary array to hold the rows for this page
//                 let pageData = [];
//                 textContent.items.forEach((item) => {
//                     pageData.push(item.str); // Collect text items for the page
//                 });

//                 // Add the page data to the extractedData array
//                 extractedData = [...extractedData, ...pageData];
//             }

//             // Process the extracted data to create structured results
//             const processedResults = processExtractedData(extractedData);
//             setAllResults(processedResults);
//         } catch (err) {
//             console.error('Error reading PDF:', err);
//             setError('Failed to read the PDF file. Please try again.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Function to process the extracted text data
//     // Function to process the extracted text data
//     // Function to process the extracted text data
//     const processExtractedData = (data) => {
//         const results = [];
//         let currentTransaction = null;
    
//         data.forEach((line) => {
//             const trimmedLine = line.trim();
    
//             // Detect transaction number
//             if (trimmedLine.match(/^\d{10}$/) && !currentTransaction) { // Assuming transaction number is 10 digits
//                 currentTransaction = {
//                     number: trimmedLine,
//                     transactionDetails: '',
//                     transactionDate: '',
//                     valueDate: '',
//                     chqRefNo: '',
//                     debitCredit: '',
//                     balance: ''
//                 };
//             }
//             // Match transaction date
//             else if (trimmedLine.match(/^\d{2} [A-Za-z]{3} \d{4}$/)) {
//                 if (currentTransaction) {
//                     if (!currentTransaction.transactionDate) {
//                         currentTransaction.transactionDate = trimmedLine;
//                     } else if (!currentTransaction.valueDate) {
//                         currentTransaction.valueDate = trimmedLine;
//                     }
//                 }
//             }
//             // Match CHQ/REF NO. (allow for alphanumeric and possibly mixed formats)
//             else if (trimmedLine.match(/^[A-Z0-9 ]+$/)) { // Adjusted regex
//                 if (currentTransaction) {
//                     if (!currentTransaction.chqRefNo) {
//                         currentTransaction.chqRefNo = trimmedLine;
//                     } else {
//                         currentTransaction.transactionDetails += ` ${trimmedLine}`;
//                     }
//                 }
//             }
//             // Match Debit/Credit amounts (consider both formats)
//             else if (trimmedLine.match(/^[-+]?\d+(,\d{3})*(\.\d{2})?$/)) { // Handles commas and decimals
//                 if (currentTransaction) {
//                     if (!currentTransaction.debitCredit) {
//                         currentTransaction.debitCredit = trimmedLine;
//                     } else {
//                         currentTransaction.balance = trimmedLine;
//                     }
//                 }
//             }
//             // Collect any other transaction details
//             else if (trimmedLine.length > 0) {
//                 if (currentTransaction) {
//                     currentTransaction.transactionDetails += ` ${trimmedLine}`;
//                 }
//             }
    
//             // Check if we reached a new transaction block
//             if (currentTransaction && currentTransaction.transactionDate && currentTransaction.valueDate) {
//                 results.push(currentTransaction);
//                 currentTransaction = null; // Reset for the next transaction
//             }
//         });
    
//         // Handle any remaining currentTransaction
//         if (currentTransaction) {
//             results.push(currentTransaction);
//         }
    
//         // Trim transaction details
//         results.forEach(result => {
//             if (result) {
//                 result.transactionDetails = result.transactionDetails.trim();
//                 // Default to empty strings for missing fields
//                 result.transactionDate = result.transactionDate || 'N/A';
//                 result.valueDate = result.valueDate || 'N/A';
//                 result.chqRefNo = result.chqRefNo || 'N/A';
//                 result.debitCredit = result.debitCredit || 'N/A';
//                 result.balance = result.balance || 'N/A';
//             }
//         });
    
//         return results;
//     };
    

//     return (
//         <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
//             <h1 className="text-3xl font-bold mb-6">PDF Table Data Viewer</h1>

//             {/* File Upload */}
//             <input
//                 type="file"
//                 accept="application/pdf"
//                 onChange={handleFileUpload}
//                 className="mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />

//             {/* Loading Message */}
//             {isLoading && <p className="text-blue-500 mb-4">Loading PDF...</p>}

//             {/* Error Message */}
//             {error && <p className="text-red-500 mb-4">{error}</p>}

//             {/* Display All Results in a Table */}
//             <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg p-6 overflow-x-auto">
//                 <h2 className="text-xl font-bold mb-4">Extracted Data:</h2>
//                 {allResults.length > 0 ? (
//                     <table className="w-full border-collapse text-sm">
//                         <thead>
//                             <tr className="bg-gray-200">
//                                 <th className="border p-2 text-left">#</th>
//                                 <th className="border p-2 text-left">TRANSACTION DATE</th>
//                                 <th className="border p-2 text-left">VALUE DATE</th>
//                                 <th className="border p-2 text-left">TRANSACTION DETAILS</th>
//                                 <th className="border p-2 text-left">CHQ / REF NO.</th>
//                                 <th className="border p-2 text-right">DEBIT/CREDIT( )</th>
//                                 <th className="border p-2 text-right">BALANCE( )</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {allResults.map((result, index) => (
//                                 <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
//                                     <td className="border p-2">{result.number}</td>
//                                     <td className="border p-2">{result.transactionDate}</td>
//                                     <td className="border p-2">{result.valueDate}</td>
//                                     <td className="border p-2">{result.transactionDetails}</td>
//                                     <td className="border p-2">{result.chqRefNo}</td>
//                                     <td className="border p-2 text-right">{result.debitCredit}</td>
//                                     <td className="border p-2 text-right">{result.balance}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 ) : (
//                     <p className="text-gray-500">No data extracted.</p>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default SearchPDF;


// ExcelSearch.js
// import React, { useState } from 'react';
// import * as XLSX from 'xlsx'; // Import XLSX library

// const ExcelSearch = () => {
//   const [excelData, setExcelData] = useState([]); // Store parsed Excel data
//   const [searchTerm, setSearchTerm] = useState(''); // Track search input
//   const [filteredData, setFilteredData] = useState([]); // Store search results

//   // Handle file upload and parse the Excel file
//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     const reader = new FileReader();

//     reader.onload = (e) => {
//       const data = new Uint8Array(e.target.result);
//       const workbook = XLSX.read(data, { type: 'array' });

//       const sheetName = workbook.SheetNames[0]; // Get the first sheet
//       const sheet = workbook.Sheets[sheetName];
//       const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Convert sheet to JSON

//       setExcelData(parsedData); // Store parsed data
//       setFilteredData(parsedData); // Initialize search results
//     };

//     reader.readAsArrayBuffer(file); // Read the file as ArrayBuffer
//   };

//   // Handle search input change
//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(value);

//     // Filter rows that contain the search term
//     const filtered = excelData.filter((row) =>
//       row.some((cell) =>
//         cell?.toString().toLowerCase().includes(value)
//       )
//     );

//     setFilteredData(filtered);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
//       <div className="bg-white shadow-md rounded-lg p-8 max-w-3xl w-full">
//         <h1 className="text-2xl font-bold mb-6 text-center">Excel Search Tool</h1>

//         {/* Upload Excel File */}
//         <input
//           type="file"
//           accept=".xlsx, .xls"
//           onChange={handleFileUpload}
//           className="mb-4 block w-full text-sm text-gray-500
//             file:mr-4 file:py-2 file:px-4
//             file:rounded-full file:border-0
//             file:text-sm file:font-semibold
//             file:bg-blue-50 file:text-blue-700
//             hover:file:bg-blue-100"
//         />

//         {/* Search Input */}
//         <input
//           type="text"
//           value={searchTerm}
//           onChange={handleSearch}
//           placeholder="Search for data..."
//           className="w-full border rounded-lg p-4 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />

//         {/* Display Results */}
//         {filteredData.length > 0 ? (
//           <div className="overflow-x-auto">
//             <table className="table-auto w-full border-collapse border border-gray-300">
//               <tbody>
//                 {filteredData.map((row, rowIndex) => (
//                   <tr key={rowIndex} className="border">
//                     {row.map((cell, cellIndex) => (
//                       <td
//                         key={cellIndex}
//                         className="border px-4 py-2 text-center"
//                       >
//                         {cell}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <p className="text-gray-500 text-center">No matching data found.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ExcelSearch;


// import React, { useState } from 'react';
// import * as XLSX from 'xlsx'; // Import XLSX library

// const ExcelSearch = () => {
//   const [excelData, setExcelData] = useState([]); // Store parsed Excel data
//   const [searchTerm, setSearchTerm] = useState(''); // Track search input
//   const [filteredData, setFilteredData] = useState([]); // Store search results

//   // Handle file upload and parse the Excel file
//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     const reader = new FileReader();

//     reader.onload = (e) => {
//       const data = new Uint8Array(e.target.result);
//       const workbook = XLSX.read(data, { type: 'array' });

//       const sheetName = workbook.SheetNames[0]; // Get the first sheet
//       const sheet = workbook.Sheets[sheetName];
//       const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Convert sheet to JSON

//       setExcelData(parsedData); // Store parsed data
//       setFilteredData(parsedData); // Initialize search results
//     };

//     reader.readAsArrayBuffer(file); // Read the file as ArrayBuffer
//   };

//   // Handle search input change
//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(value);

//     // Filter rows that contain the search term
//     const filtered = excelData.filter((row) =>
//       row.some((cell) =>
//         cell?.toString().toLowerCase().includes(value)
//       )
//     );

//     setFilteredData(filtered);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
//       <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-full lg:max-w-8xl">
//         <h1 className="text-2xl font-bold mb-6 text-center">Excel Search Tool</h1>

//         {/* Upload Excel File */}
//         <input
//           type="file"
//           accept=".xlsx, .xls"
//           onChange={handleFileUpload}
//           className="mb-4 block w-full text-sm text-gray-500
//             file:mr-4 file:py-2 file:px-4
//             file:rounded-full file:border-0
//             file:text-sm file:font-semibold
//             file:bg-blue-50 file:text-blue-700
//             hover:file:bg-blue-100"
//         />

//         {/* Search Input */}
//         <input
//           type="text"
//           value={searchTerm}
//           onChange={handleSearch}
//           placeholder="Search for data..."
//           className="w-full border rounded-lg p-4 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />

//         {/* Display Results */}
//         {filteredData.length > 0 ? (
//           <div className="overflow-auto max-h-screen"> {/* Enables scrolling */}
//             <table className="table-auto w-full border-collapse border border-gray-300">
//               <tbody>
//                 {filteredData.map((row, rowIndex) => (
//                   <tr key={rowIndex} className="border">
//                     {row.map((cell, cellIndex) => (
//                       <td
//                         key={cellIndex}
//                         className="border px-4 py-2 text-center"
//                       >
//                         {cell}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <p className="text-gray-500 text-center">No matching data found.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ExcelSearch;

// import React, { useState } from 'react';
// import * as XLSX from 'xlsx'; // Import XLSX library

// const ExcelSearch = () => {
//   const [excelData, setExcelData] = useState([]); // Store parsed Excel data
//   const [searchTerm, setSearchTerm] = useState(''); // Track search input
//   const [filteredData, setFilteredData] = useState([]); // Store search results
//   const [selectedKeywords, setSelectedKeywords] = useState([]); // Store selected checkboxes

//   const keywords = ['NACH', 'SALARY', 'UPI' ,'DIRECT DEBIT','BOUNCE','RETURN']; // Define keyword checkboxes

//   // Handle file upload and parse the Excel file
//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     const reader = new FileReader();

//     reader.onload = (e) => {
//       const data = new Uint8Array(e.target.result);
//       const workbook = XLSX.read(data, { type: 'array' });

//       const sheetName = workbook.SheetNames[0]; // Get the first sheet
//       const sheet = workbook.Sheets[sheetName];
//       const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Convert sheet to JSON

//       setExcelData(parsedData); // Store parsed data
//       setFilteredData(parsedData); // Initialize search results
//     };

//     reader.readAsArrayBuffer(file); // Read the file as ArrayBuffer
//   };

//   // Handle search input change
//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(value);
//     filterData(value, selectedKeywords);
//   };

//   // Handle checkbox change
//   const handleCheckboxChange = (keyword) => {
//     let updatedKeywords = [...selectedKeywords];
//     if (updatedKeywords.includes(keyword)) {
//       updatedKeywords = updatedKeywords.filter((k) => k !== keyword); // Remove keyword
//     } else {
//       updatedKeywords.push(keyword); // Add keyword
//     }
//     setSelectedKeywords(updatedKeywords);
//     filterData(searchTerm, updatedKeywords);
//   };

//   // Filter the Excel data based on search term and selected checkboxes
//   const filterData = (term, keywords) => {
//     const filtered = excelData.filter((row) =>
//       row.some((cell) => {
//         const cellValue = cell?.toString().toLowerCase();
//         const matchesTerm = cellValue.includes(term); // Matches search input
//         const matchesKeywords = keywords.length === 0 || keywords.some((keyword) =>
//           cellValue.includes(keyword.toLowerCase())
//         ); // Matches any selected keyword
//         return matchesTerm && matchesKeywords;
//       })
//     );

//     setFilteredData(filtered);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
//       <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-full lg:max-w-8xl">
//         <h1 className="text-2xl font-bold mb-6 text-center">Excel Search Tool</h1>

//         {/* Upload Excel File */}
//         <input
//           type="file"
//           accept=".xlsx, .xls"
//           onChange={handleFileUpload}
//           className="mb-4 block w-full text-sm text-gray-500
//             file:mr-4 file:py-2 file:px-4
//             file:rounded-full file:border-0
//             file:text-sm file:font-semibold
//             file:bg-blue-50 file:text-blue-700
//             hover:file:bg-blue-100"
//         />

//         {/* Search Input */}
//         <input
//           type="text"
//           value={searchTerm}
//           onChange={handleSearch}
//           placeholder="Search for data..."
//           className="w-full border rounded-lg p-4 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />

//         {/* Keyword Checkboxes */}
//         <div className="mb-6">
//           {keywords.map((keyword) => (
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

//         {/* Display Results */}
//         {filteredData.length > 0 ? (
//           <div className="overflow-auto max-h-screen"> {/* Enables scrolling */}
//             <table className="table-auto w-full border-collapse border border-gray-300">
//               <tbody>
//                 {filteredData.map((row, rowIndex) => (
//                   <tr key={rowIndex} className="border">
//                     {row.map((cell, cellIndex) => (
//                       <td
//                         key={cellIndex}
//                         className="border px-4 py-2 text-center"
//                       >
//                         {cell}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <p className="text-gray-500 text-center">No matching data found.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ExcelSearch;

// import React, { useState } from 'react';
// import * as XLSX from 'xlsx'; // Import XLSX library

// const ExcelSearch = () => {
//   const [excelData, setExcelData] = useState([]); // Store parsed Excel data
//   const [searchTerm, setSearchTerm] = useState(''); // Track search input
//   const [filteredData, setFilteredData] = useState([]); // Store search results
//   const [selectedKeywords, setSelectedKeywords] = useState([]); // Store selected checkboxes

//   const keywords = ['NACH', 'SALARY', 'UPI', 'DIRECT DEBIT', 'BOUNCE', 'RETURN']; // Define keyword checkboxes

//   // Handle file upload and parse the Excel file
//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     const reader = new FileReader();

//     reader.onload = (e) => {
//       const data = new Uint8Array(e.target.result);
//       const workbook = XLSX.read(data, { type: 'array' });

//       const sheetName = workbook.SheetNames[0]; // Get the first sheet
//       const sheet = workbook.Sheets[sheetName];
//       const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Convert sheet to JSON

//       setExcelData(parsedData); // Store parsed data
//       setFilteredData(parsedData); // Initialize search results
//     };

//     reader.readAsArrayBuffer(file); // Read the file as ArrayBuffer
//   };

//   // Handle search input change
//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(value);
//     filterData(value, selectedKeywords);
//   };

//   // Handle checkbox change
//   const handleCheckboxChange = (keyword) => {
//     let updatedKeywords = [...selectedKeywords];
//     if (updatedKeywords.includes(keyword)) {
//       updatedKeywords = updatedKeywords.filter((k) => k !== keyword); // Remove keyword
//     } else {
//       updatedKeywords.push(keyword); // Add keyword
//     }
//     setSelectedKeywords(updatedKeywords);
//     filterData(searchTerm, updatedKeywords);
//   };

//   // Filter the Excel data based on search term and selected checkboxes
//   const filterData = (term, keywords) => {
//     const filtered = excelData.filter((row) =>
//       row.some((cell) => {
//         const cellValue = cell?.toString().toLowerCase();
//         const matchesTerm = cellValue.includes(term); // Matches search input
//         const matchesKeywords =
//           keywords.length === 0 ||
//           keywords.some((keyword) => cellValue.includes(keyword.toLowerCase())); // Matches any selected keyword
//         return matchesTerm && matchesKeywords;
//       })
//     );

//     setFilteredData(filtered);
//   };

//   // Select all checkboxes
//   const handleSelectAll = () => {
//     setSelectedKeywords(keywords); // Select all keywords
//     filterData(searchTerm, keywords);
//   };

//   // Clear all checkboxes
//   const handleClearAll = () => {
//     setSelectedKeywords([]); // Clear all keywords
//     filterData(searchTerm, []);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
//       <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-full lg:max-w-8xl">
//         <h1 className="text-2xl font-bold mb-6 text-center">Excel Search Tool</h1>

//         {/* Upload Excel File */}
//         <input
//           type="file"
//           accept=".xlsx, .xls"
//           onChange={handleFileUpload}
//           className="mb-4 block w-full text-sm text-gray-500
//             file:mr-4 file:py-2 file:px-4
//             file:rounded-full file:border-0
//             file:text-sm file:font-semibold
//             file:bg-blue-50 file:text-blue-700
//             hover:file:bg-blue-100"
//         />

//         {/* Search Input */}
//         <input
//           type="text"
//           value={searchTerm}
//           onChange={handleSearch}
//           placeholder="Search for data..."
//           className="w-full border rounded-lg p-4 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />

//         {/* Keyword Checkboxes */}
//         <div className="flex justify-between mb-4">
//           <div>
//             {keywords.map((keyword) => (
//               <label key={keyword} className="mr-4">
//                 <input
//                   type="checkbox"
//                   checked={selectedKeywords.includes(keyword)}
//                   onChange={() => handleCheckboxChange(keyword)}
//                   className="mr-2"
//                 />
//                 {keyword}
//               </label>
//             ))}
//           </div>

//           {/* Select All and Clear All Buttons */}
//           <div className="space-x-4">
//             <button
//               onClick={handleSelectAll}
//               className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//             >
//               Select All
//             </button>
//             <button
//               onClick={handleClearAll}
//               className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
//             >
//               Clear All
//             </button>
//           </div>
//         </div>

//         {/* Display Results */}
//         {filteredData.length > 0 ? (
//           <div className="overflow-auto max-h-screen">
//             <table className="table-auto w-full border-collapse border border-gray-300">
//               <tbody>
//                 {filteredData.map((row, rowIndex) => (
//                   <tr key={rowIndex} className="border">
//                     {row.map((cell, cellIndex) => (
//                       <td
//                         key={cellIndex}
//                         className="border px-4 py-2 text-center"
//                       >
//                         {cell}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <p className="text-gray-500 text-center">No matching data found.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ExcelSearch;

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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 -mt-16">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-full lg:max-w-8xl">
        <Back/>
         <div>
             
            <button className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'><a href='https://www.ilovepdf.com/pdf_to_excel' target='_blank'>Click And Convert Pdf To Excel</a></button>
         </div>
        <h1 className="text-2xl font-bold mb-6 text-center">Excel Search Tools</h1>

        {/* Upload Excel File */}
        <h1 className='font-semibold px-2 py-2'>upload excel file</h1>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="mb-4 block w-full text-sm text-gray-500
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
          className="w-full border rounded-lg p-4 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="border px-4 py-2 text-center"
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
          <p className="text-gray-500 text-center">No matching data found.</p>
        )}
      </div>
    </div>
  );
};

export default ExcelSearch;
