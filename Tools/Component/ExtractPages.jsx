import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FaTrash, FaSearchPlus, FaRedo, FaClone, FaDownload, FaFileUpload, FaUndo, FaRedo as FaRotateRight, FaCheck, FaFilePdf } from 'react-icons/fa';
import { Back } from './back';
import { motion, AnimatePresence } from 'framer-motion';

const ExtractPages = () => {
  const [file, setFile] = useState(null);
  const [splitPages, setSplitPages] = useState([]);
  const [pdfInstances, setPdfInstances] = useState([]);
  const [rotations, setRotations] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fileName, setFileName] = useState('');
  const [selectedPages, setSelectedPages] = useState({}); // Store selected pages
  const [isZoomedPopup, setIsZoomedPopup] = useState(false);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
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
    const totalPages = pdfDoc.getPageCount();
    const newDocuments = [];
    const pdfData = [];

    for (let i = 0; i < totalPages; i++) {
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
    // Remove selection if the page is deleted
    setSelectedPages((prev) => {
      const newSelected = { ...prev };
      delete newSelected[index];
      return newSelected;
    });
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

  const handlePageSelection = (index) => {
    setSelectedPages((prev) => ({
      ...prev,
      [index]: !prev[index], // Toggle selection
    }));
  };

  const mergeAndDownload = async () => {
    const mergedPdf = await PDFDocument.create();

    // Loop through selected pages
    for (let i = 0; i < pdfInstances.length; i++) {
      if (selectedPages[i]) { // Only include selected pages
        const pdf = await PDFDocument.load(pdfInstances[i]);
        const [page] = await mergedPdf.copyPages(pdf, [0]);
        mergedPdf.addPage(page);
      }
    }

    const mergedPdfBytes = await mergedPdf.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}(pizeonfly)` || 'merged(pizeonfly).pdf';
    link.click();
    setFileName('');
    setSelectedPages({}); // Reset selections
    setFile('');
  };

  const openZoomPopup = (index) => {
    setCurrentPage(splitPages[index]);
    setShowPopup(true);
    setZoomLevel(1);
    setIsZoomedPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setIsZoomedPopup(false);
  };

  const zoomIn = () => setZoomLevel((prev) => prev * 1.2);
  const zoomOut = () => setZoomLevel((prev) => prev / 1.2);

  return (
    <div className="min-h-screen bg-blue-100 dark:bg-[#513a7a] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div
          className="bg-white dark:bg-[#28283a] 
          rounded-xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)]"
        >
          <div className="p-4  border-b dark:border-gray-700 border-gray-100">
            <Back />
          </div>

          <div className="p-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Extract PDF Pages
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-white">
                Select and extract pages from your PDF document
              </p>
            </div>

            {!file ? (
              <div className="relative">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="relative border-2 border-dashed rounded-lg p-12 text-center block cursor-pointer
                    border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                >
                  <FaFileUpload className="mx-auto h-12 w-12 text-gray-400 mt-4" />
                  <p className="mt-1 text-xs text-gray-500 dark:text-white">
                    PDF files up to 50MB
                  </p>
                  <p className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-300 mb-4">
                    Drop your PDF here or click to browse
                  </p>
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-50 rounded-lg mt-4">
                      <FaFilePdf className="h-8 w-8 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium dark:text-gray-200 text-gray-900">
                        {file.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Select pages to extract
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => rotateAllPages("left")}
                      className="px-3 py-1.5 text-blue-600 dark:text-blue-300 dark:hover:bg-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm"
                    >
                      Rotate Left
                    </button>
                    <button
                      onClick={() => rotateAllPages("right")}
                      className="px-3 py-1.5 text-blue-600 dark:text-blue-300 dark:hover:bg-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm"
                    >
                      Rotate Right
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                  {splitPages.map(
                    (pageUrl, index) =>
                      pageUrl && (
                        <div
                          key={index}
                          className="relative bg-gray-50 dark:bg-gray-600 rounded-lg p-3 hover:shadow-lg transition-all duration-300 group overflow-hidden border border-gray-200"
                        >
                          <div className="aspect-[2/3] relative overflow-hidden" style={{ width: '150px', margin: '0 auto' }}>
                            {/* Icon row overlays the top of the image */}
                            <div
                              className="absolute top-2 left-1/2 transform -translate-x-1/2 flex gap-1 items-center z-20 bg-white rounded-lg shadow p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              style={{ minWidth: '120px' }}
                            >

                              {/* Checkbox always visible */}
                              <button
                                onClick={() => handlePageSelection(index)}
                                className={`p-1 rounded-md transition-colors border ${selectedPages[index] ? "bg-blue-50 text-blue-500 border-blue-300" : "bg-white text-gray-700 border-gray-300"}`}
                                title={selectedPages[index] ? "Selected" : "Select"}
                                style={{ minWidth: 24, minHeight: 24 }}
                              >
                                {selectedPages[index] ? (
                                  <FaCheck size={12} />
                                ) : (
                                  <div className="w-3 h-3 border-2 border-gray-400 rounded-sm" />
                                )}
                              </button>
                              {/* Other icons: always visible, white background */}
                              <button
                                onClick={() => openZoomPopup(index)}
                                className="p-1 rounded-md transition-colors bg-white text-blue-500 border border-gray-300 hover:bg-blue-50"
                                title="Zoom"
                                style={{ minWidth: 24, minHeight: 24 }}
                              >
                                <FaSearchPlus size={12} />
                              </button>
                              <button
                                onClick={() => rotatePage(index)}
                                className="p-1 rounded-md transition-colors bg-white text-yellow-500 border border-gray-300 hover:bg-yellow-50"
                                title="Rotate"
                                style={{ minWidth: 24, minHeight: 24 }}
                              >
                                <FaRedo size={12} />
                              </button>
                              <button
                                onClick={() => duplicatePage(index)}
                                className="p-1 rounded-md transition-colors bg-white text-green-500 border border-gray-300 hover:bg-green-50"
                                title="Duplicate"
                                style={{ minWidth: 24, minHeight: 24 }}
                              >
                                <FaClone size={12} />
                              </button>
                              <button
                                onClick={() => deletePage(index)}
                                className="p-1 rounded-md transition-colors bg-white text-red-500 border border-gray-300 hover:bg-red-50"
                                title="Delete"
                                style={{ minWidth: 24, minHeight: 24 }}
                              >
                                <FaTrash size={12} />
                              </button>
                            </div>
                            <iframe
                              src={pageUrl}
                              title={`Page ${index + 1}`}
                              className="w-full h-full rounded-md border border-gray-300"
                              style={{
                                transform: `rotate(${rotations[index] || 0}deg)`,
                                transformOrigin: "center",
                                transition: "transform 0.3s ease",
                                pointerEvents: "none",
                                width: '100%',
                                height: '100%',
                                background: 'white',
                              }}
                              frameBorder="0"
                              scrolling="no"
                            />
                            {rotations[index] !== 0 && (
                              <div className="absolute inset-0 -z-10 bg-gray-100 rounded-md" />
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2 px-1">
                            <span className="text-sm font-medium dark:text-gray-200">
                              Page {index + 1}
                            </span>
                            <span className="text-xs text-gray-400">
                              {rotations[index] || 0}°
                            </span>
                          </div>
                        </div>
                      )
                  )}
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <input
                    type="text"
                    placeholder="Enter output filename"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="flex-1 px-4 py-2 dark:bg-gray-600  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={mergeAndDownload}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg 
                      hover:bg-blue-600 transition-colors"
                  >
                    <FaDownload size={16} />
                    Download Selected
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center"
              style={{
                width: 'auto',
                maxWidth: '90vw',
                height: 'auto',
                maxHeight: '98vh',
                padding: '2rem'
              }}
            >
              <button
                onClick={closePopup}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors z-10"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div
                className="overflow-auto flex items-center justify-center"
                style={{
                  width: '100%',
                  height: '80vh',
                  background: 'white',
                  borderRadius: '1rem'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <iframe
                    src={currentPage}
                    style={{
                      width: '800px',
                      height: '1131px',
                      border: 'none',
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: "center center",
                      background: "white",
                      pointerEvents: "none",
                      display: 'block',
                      margin: 'auto'
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={zoomOut}
                  className="px-6 py-2 bg-white hover:bg-gray-100 rounded-lg shadow-md transition-colors"
                >
                  Zoom Out
                </button>
                <button
                  onClick={zoomIn}
                  className="px-6 py-2 bg-white hover:bg-gray-100 rounded-lg shadow-md transition-colors"
                >
                  Zoom In
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExtractPages;