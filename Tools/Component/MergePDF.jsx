// Merge.js
import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Back } from "./back";
import { FaFilePdf, FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaDownload } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const MergePDF = () => {
  const [files, setFiles] = useState([]);
  const [mergedPdf, setMergedPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addValidFiles(selectedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addValidFiles(droppedFiles);
  };

  const addValidFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => file.type === "application/pdf");
    if (validFiles.length !== newFiles.length) {
      setError("Some files were skipped. Only PDF files are allowed.");
    }
    setFiles(prev => [...prev, ...validFiles.map(file => ({
      file,
      name: file.name,
      size: formatFileSize(file.size)
    }))]);
    setMergedPdf(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setMergedPdf(null);
  };

  const moveFile = (index, direction) => {
    const newFiles = [...files];
    const temp = newFiles[index];
    newFiles[index] = newFiles[index + direction];
    newFiles[index + direction] = temp;
    setFiles(newFiles);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please select at least two PDF files to merge.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const mergedPdfDoc = await PDFDocument.create();

      for (const fileObj of files) {
        const fileData = await fileObj.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileData);
        const pages = await mergedPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach(page => mergedPdfDoc.addPage(page));
      }

      const mergedPdfBytes = await mergedPdfDoc.save();
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);

      setMergedPdf(downloadUrl);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      setError("An error occurred while merging PDFs.");
    }

    setLoading(false);
  };

  const processingAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
          rounded-xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)]"
        >
          <div className="p-4 border-b border-gray-100">
            <Back/>
          </div>

          <div className="p-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Merge PDF Files</h1>
              <p className="mt-2 text-sm text-gray-600">Combine multiple PDFs into one document</p>
            </div>

            {files.length === 0 ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-12 text-center 
                  ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                  id="initial-file-upload"
                />
                <label
                  htmlFor="initial-file-upload"
                  className="cursor-pointer"
                >
                  <FaFilePdf className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Drop PDF files here or
                      <span className="text-blue-500 hover:text-blue-600 ml-1">browse</span>
                    </span>
                    <p className="mt-1 text-xs text-gray-500">Select multiple files to merge</p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                {files.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-red-50 rounded-lg">
                        <FaFilePdf className="h-6 w-6 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {index > 0 && (
                        <button
                          onClick={() => moveFile(index, -1)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          title="Move Up"
                        >
                          <FaArrowUp size={14} />
                        </button>
                      )}
                      {index < files.length - 1 && (
                        <button
                          onClick={() => moveFile(index, 1)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          title="Move Down"
                        >
                          <FaArrowDown size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Remove"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                    id="add-more-files"
                  />
                  <label
                    htmlFor="add-more-files"
                    className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 
                      rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                  >
                    <FaPlus className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Add more files</span>
                  </label>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {loading ? (
                  <motion.div 
                    className="flex flex-col items-center justify-center p-8"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={processingAnimation}
                  >
                    <div className="relative w-64 h-32 mb-4">
                      <motion.div
                        className="absolute top-0 left-0 w-16 h-20 bg-red-500 rounded-lg transform -rotate-12"
                        animate={{
                          x: [0, 50, 50],
                          y: [0, 0, 0],
                          rotate: [-12, 0, 0],
                          scale: [1, 0.9, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <FaFilePdf className="w-8 h-8 text-white m-4" />
                      </motion.div>
                      <motion.div
                        className="absolute top-0 right-0 w-16 h-20 bg-red-500 rounded-lg transform rotate-12"
                        animate={{
                          x: [0, -50, -50],
                          y: [0, 0, 0],
                          rotate: [12, 0, 0],
                          scale: [1, 0.9, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <FaFilePdf className="w-8 h-8 text-white m-4" />
                      </motion.div>
                      <motion.div
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-24 bg-blue-500 rounded-lg"
                        animate={{
                          y: [20, 0],
                          scale: [0.9, 1],
                          opacity: [0.5, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <FaFilePdf className="w-10 h-10 text-white m-4" />
                      </motion.div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Merging PDFs...</h3>
                      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500"
                          animate={{
                            width: ["0%", "100%"],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Please wait while we combine your files</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={handleMerge}
                      disabled={files.length < 2}
                      className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg 
                        hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Merge PDFs
                    </button>
                  </div>
                )}

                <AnimatePresence>
                  {mergedPdf && (
                    <motion.div 
                      className="bg-green-50 rounded-lg p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-green-800">Merge Complete!</h3>
                          <p className="text-xs text-green-600 mt-1">Your PDFs have been successfully combined</p>
                        </div>
                        <a
                          href={mergedPdf}
                          download="merged.pdf"
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg 
                            hover:bg-green-700 transition-colors"
                        >
                          <FaDownload className="mr-2" />
                          Download
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <h3 className="text-sm font-medium text-gray-900">Drag & Drop</h3>
                <p className="mt-1 text-xs text-gray-500">Easy file selection</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <h3 className="text-sm font-medium text-gray-900">Reorder Files</h3>
                <p className="mt-1 text-xs text-gray-500">Arrange pages as needed</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <h3 className="text-sm font-medium text-gray-900">Fast Merging</h3>
                <p className="mt-1 text-xs text-gray-500">Quick PDF combination</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MergePDF;
