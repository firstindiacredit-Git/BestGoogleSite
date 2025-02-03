import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FaTrash, FaSearchPlus, FaRedo, FaClone, FaDownload } from 'react-icons/fa';
import { Back } from './back';

const SplitPdf = () => {
  const [file, setFile] = useState(null);
  const [splitPages, setSplitPages] = useState([]);
  const [pdfInstances, setPdfInstances] = useState([]);
  const [rotations, setRotations] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fileName, setFileName] = useState('');
  const [range, setRange] = useState({ start: '', end: '' });
  const [totalPages, setTotalPages] = useState(0);
  const [pageNumbers, setPageNumbers] = useState('');

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      const originalName = uploadedFile.name.replace(/\.[^/.]+$/, ''); // Remove file extension
      setFileName(originalName);
      setFile(uploadedFile);
    }
  };

  useEffect(() => {
    if (file) {
      splitPdf();
    }
  }, [file]);

  const splitPdf = async () => {
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const numPages = pdfDoc.getPageCount();
    setTotalPages(numPages);
    const newDocuments = [];
    const pdfData = [];

    for (let i = 0; i < numPages; i++) {
      const newPdfDoc = await PDFDocument.create();
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
      newPdfDoc.addPage(copiedPage);
      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      newDocuments.push(URL.createObjectURL(blob));
      pdfData.push(pdfBytes);
    }

    setSplitPages(newDocuments);
    setPdfInstances(pdfData);
  };

  const deletePage = (index) => {
    const updatedPages = [...splitPages];
    updatedPages[index] = null;
    setSplitPages(updatedPages);
  };

  const rotatePage = (index) => {
    setRotations((prev) => ({
      ...prev,
      [index]: (prev[index] || 0) + 90,
    }));
  };

  const rotateAllPages = (direction) => {
    setRotations((prev) => {
      const newRotations = { ...prev };
      splitPages.forEach((_, index) => {
        newRotations[index] = (newRotations[index] || 0) + (direction === 'left' ? -90 : 90);
      });
      return newRotations;
    });
  };

  const duplicatePage = (index) => {
    const duplicatedPage = splitPages[index];
    const duplicatedPdf = pdfInstances[index];
    const newSplitPages = [...splitPages];
    const newPdfInstances = [...pdfInstances];

    newSplitPages.splice(index + 1, 0, duplicatedPage);
    newPdfInstances.splice(index + 1, 0, duplicatedPdf);

    setSplitPages(newSplitPages);
    setPdfInstances(newPdfInstances);
  };

  const handleRangeChange = (e) => {
    const { name, value } = e.target;
    setRange((prev) => ({ ...prev, [name]: value }));
  };

  const validatePageRange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value);
    
    if (numValue < 1) return;
    if (numValue > totalPages) return;
    
    if (name === 'start') {
      if (range.end && numValue > parseInt(range.end)) return;
    } else if (name === 'end') {
      if (range.start && numValue < parseInt(range.start)) return;
    }
    
    setRange(prev => ({ ...prev, [name]: value }));
  };

  const validatePageNumbers = (input) => {
    if (!input) return [];
    
    try {
      return input.split(',')
        .map(num => num.trim())
        .map(num => parseInt(num))
        .filter(num => !isNaN(num) && num > 0 && num <= totalPages);
    } catch (error) {
      return [];
    }
  };

  const mergeAndDownload = async () => {
    const mergedPdf = await PDFDocument.create();
    const [start, end] = pageNumbers.split(',').map(num => parseInt(num));
    
    if (!start || !end || start > end) {
      // If invalid range, merge all pages
      for (let i = 0; i < pdfInstances.length; i++) {
        if (splitPages[i] !== null) {
          const pdf = await PDFDocument.load(pdfInstances[i]);
          const [page] = await mergedPdf.copyPages(pdf, [0]);
          mergedPdf.addPage(page);
        }
      }
    } else {
      // Merge pages in range
      for (let i = start - 1; i < end; i++) {
        if (splitPages[i] !== null) {
          const pdf = await PDFDocument.load(pdfInstances[i]);
          const [page] = await mergedPdf.copyPages(pdf, [0]);
          mergedPdf.addPage(page);
        }
      }
    }

    const mergedPdfBytes = await mergedPdf.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // Add range to filename
    const rangeText = start && end ? `_pages_${start}-${end}` : '';
    const downloadFileName = `${fileName}${rangeText}(pizeonfly).pdf`;

    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFileName;
    link.click();

    setFileName('');
    setPageNumbers('');
    setFile(null);
  };

  const openZoomPopup = (index) => {
    setCurrentPage(splitPages[index]);
    setShowPopup(true);
    setZoomLevel(1);
  };

  const closePopup = () => setShowPopup(false);

  const zoomIn = () => setZoomLevel((prev) => prev * 1.2);
  const zoomOut = () => setZoomLevel((prev) => prev / 1.2);

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
              Split PDF
            </h1>
            <p className="mt-2 text-sm text-center text-gray-600">Split, merge and organize your PDF pages</p>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {!file ? (
              <div className="relative border-2 border-dashed rounded-xl p-6 sm:p-12 text-center border-gray-300 hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileInput"
                />
                <label 
                  htmlFor="fileInput" 
                  className="cursor-pointer block"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm sm:text-base font-medium text-gray-900">
                      Choose PDF file or <span className="text-blue-500 hover:text-blue-600">browse</span>
                    </span>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                      PDF files only
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                {/* File Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                  <div className="flex items-center">
                    <span className="text-base sm:text-lg font-semibold text-gray-700 break-all">{file.name}</span>
                    <button 
                      onClick={() => {
                        setFile(null);
                        setSplitPages([]);
                        setPdfInstances([]);
                      }}
                      className="ml-4 text-red-500 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => rotateAllPages('left')}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base"
                    >
                      Rotate Left
                    </button>
                    <button
                      onClick={() => rotateAllPages('right')}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base"
                    >
                      Rotate Right
                    </button>
                  </div>
                </div>

                {/* Controls Section */}
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Page Selection */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Selection (Total: {totalPages} pages)
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Start Page</label>
                          <input
                            type="number"
                            value={pageNumbers.split(',')[0] || ''}
                            onChange={(e) => {
                              const start = e.target.value;
                              const end = pageNumbers.split(',')[1] || '';
                              if (parseInt(start) > 0 && parseInt(start) <= totalPages) {
                                setPageNumbers(`${start}${end ? ',' + end : ''}`);
                              }
                            }}
                            placeholder="1"
                            min="1"
                            max={totalPages}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          />
                        </div>
                        <span className="text-gray-500 mt-6">to</span>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">End Page</label>
                          <input
                            type="number"
                            value={pageNumbers.split(',')[1] || ''}
                            onChange={(e) => {
                              const start = pageNumbers.split(',')[0] || '';
                              const end = e.target.value;
                              if (parseInt(end) > 0 && parseInt(end) <= totalPages) {
                                setPageNumbers(`${start ? start + ',' : ''}${end}`);
                              }
                            }}
                            placeholder={totalPages.toString()}
                            min="1"
                            max={totalPages}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setPageNumbers(`1,${totalPages}`)}
                          className="text-blue-500 hover:text-blue-600 text-sm"
                        >
                          All Pages
                        </button>
                        <button
                          onClick={() => {
                            const evenPages = Array.from({length: Math.floor(totalPages/2)}, (_, i) => (i + 1) * 2);
                            setPageNumbers(`${evenPages[0]},${evenPages[evenPages.length-1]}`);
                          }}
                          className="text-blue-500 hover:text-blue-600 text-sm"
                        >
                          Even Pages
                        </button>
                        <button
                          onClick={() => {
                            const oddPages = Array.from({length: Math.ceil(totalPages/2)}, (_, i) => i * 2 + 1);
                            setPageNumbers(`${oddPages[0]},${oddPages[oddPages.length-1]}`);
                          }}
                          className="text-blue-500 hover:text-blue-600 text-sm"
                        >
                          Odd Pages
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Filename Input */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Output Filename
                    </label>
                    <input
                      type="text"
                      placeholder="Enter file name"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  {/* Download Button */}
                  <div className="flex-1 flex items-end">
                    <button
                      onClick={mergeAndDownload}
                      className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <FaDownload size={16} />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>

                {/* PDF Pages Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {splitPages.map((pageUrl, index) =>
                    pageUrl && (
                      <div
                        key={index}
                        className="relative bg-gray-50 rounded-xl p-3 hover:shadow-lg transition-all duration-300 group"
                      >
                        <div className="aspect-[2/3] relative overflow-hidden rounded-lg">
                          <iframe
                            src={pageUrl}
                            title={`Page ${index + 1}`}
                            className="w-full h-full"
                            style={{
                              transform: `rotate(${rotations[index] || 0}deg)`,
                              transformOrigin: 'center',
                              transition: 'transform 0.3s ease',
                              pointerEvents: 'none',
                            }}
                            frameBorder="0"
                            scrolling="no"
                          />
                          {rotations[index] !== 0 && (
                            <div className="absolute inset-0 -z-10 bg-gray-100 rounded-lg" />
                          )}
                          
                          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent transition-all duration-300 opacity-0 group-hover:opacity-100">
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white/90 rounded-lg shadow-lg p-1.5 transition-all duration-300 scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100">
                              <button 
                                onClick={() => openZoomPopup(index)} 
                                className="p-1.5 hover:bg-blue-50 rounded-md transition-colors"
                                title="Zoom"
                              >
                                <FaSearchPlus size={14} className="text-blue-500" />
                              </button>
                              <button 
                                onClick={() => rotatePage(index)} 
                                className="p-1.5 hover:bg-yellow-50 rounded-md transition-colors"
                                title="Rotate"
                              >
                                <FaRedo size={14} className="text-yellow-500" />
                              </button>
                              <button 
                                onClick={() => duplicatePage(index)} 
                                className="p-1.5 hover:bg-green-50 rounded-md transition-colors"
                                title="Duplicate"
                              >
                                <FaClone size={14} className="text-green-500" />
                              </button>
                              <button 
                                onClick={() => deletePage(index)} 
                                className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete"
                              >
                                <FaTrash size={14} className="text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 px-1">
                          <span className="text-sm font-medium text-gray-600">Page {index + 1}</span>
                          <span className="text-xs text-gray-400">{(rotations[index] || 0)}°</span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zoom Popup */}
      {showPopup && currentPage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl mx-auto my-8 w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Page Preview</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={zoomOut}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Zoom Out"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-sm text-gray-600">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={zoomIn}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Zoom In"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={closePopup}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="relative p-4 overflow-auto max-h-[calc(90vh-8rem)]">
              <div className="w-full flex items-center justify-center">
                <div 
                  className="relative transition-transform duration-200 ease-in-out"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  <iframe
                    src={currentPage}
                    className="w-[600px] h-[800px] border-0 rounded-xl shadow-lg"
                    title="PDF Preview"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SplitPdf;
