import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { renderAsync } from 'docx-preview';
import html2canvas from 'html2canvas';
import { Back } from './back';
import { FaFileWord, FaFilePdf, FaArrowRight, FaCloudUploadAlt, FaDownload } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const PdfConverter = () => {
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

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
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.docx')) {
      setFile(droppedFile);
      setPdfUrl(null);
      setError(null);
    } else {
      setError('Please drop a valid Word document (.docx)');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.docx')) {
      setFile(selectedFile);
      setPdfUrl(null);
      setError(null);
    } else {
      setError('Please select a valid Word document (.docx)');
    }
  };

  const convertWordToPdf = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target.result;

        // Create a temporary container for rendering
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.width = '800px'; // Ensure wide enough container
        container.style.fontFamily = 'Arial, sans-serif';
        document.body.appendChild(container);

        // Render the Word document into the container
        await renderAsync(arrayBuffer, container);

        const scaleFactor = 2; // Zoom factor for better rendering
        const pageWidth = 595.276 * scaleFactor; // A4 width scaled
        const pageHeight = 841.890 * scaleFactor; // A4 height scaled
        const pageMargin = 20 * scaleFactor;

        const pdfDoc = await PDFDocument.create();
        const contentHeight = container.scrollHeight;

        let yOffset = 0;
        while (yOffset < contentHeight) {
          // Calculate visible height to avoid repetition
          const visibleHeight = Math.min(pageHeight - pageMargin * 2, contentHeight - yOffset);

          // Render content into a canvas
          const canvas = await html2canvas(container, {
            useCORS: true,
            x: 0,
            y: yOffset,
            width: container.offsetWidth,
            height: visibleHeight,
            scale: scaleFactor,
          });

          // Embed the canvas into the PDF
          const imgData = canvas.toDataURL('image/png');
          const img = await pdfDoc.embedPng(imgData);

          const page = pdfDoc.addPage([pageWidth / scaleFactor, pageHeight / scaleFactor]);
          page.drawImage(img, {
            x: pageMargin / scaleFactor,
            y: pageMargin / scaleFactor,
            width: (pageWidth - pageMargin * 2) / scaleFactor,
            height: visibleHeight / scaleFactor,
          });

          yOffset += visibleHeight; // Increment yOffset by the visible height
        }

        // Clean up the temporary container
        document.body.removeChild(container);

        // Save the PDF and create a download URL
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('Error during conversion:', err);
      setError('Failed to convert the document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ConversionAnimation = () => (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );

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
              <h1 className="text-3xl font-bold text-gray-900">Word to PDF Converter</h1>
              <p className="mt-2 text-sm text-gray-600">Convert Word documents to PDF with formatting preserved</p>
            </div>

            {/* <div className="flex items-center justify-center space-x-8 mb-8">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <FaFileWord className="h-10 w-10 text-blue-500 mx-auto" />
                <p className="text-xs mt-2 text-gray-600">WORD</p>
              </div>
              <FaArrowRight className="text-gray-400" />
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <FaFilePdf className="h-10 w-10 text-red-500 mx-auto" />
                <p className="text-xs mt-2 text-gray-600">PDF</p>
              </div>
            </div> */}

            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-12 text-center 
                  ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer"
                >
                  <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Drop your Word file here or
                      <span className="text-blue-500 hover:text-blue-600 ml-1">browse</span>
                    </span>
                    <p className="mt-1 text-xs text-gray-500">Only .docx files are supported</p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <FaFileWord className="h-8 w-8 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{file.name}</h3>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      setPdfUrl(null);
                    }}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center p-8">
                    <ConversionAnimation />
                    <p className="mt-4 text-sm text-gray-600">Converting your document...</p>
                  </div>
                ) : (
                  <button
                    onClick={convertWordToPdf}
                    disabled={loading}
                    className="w-full flex items-center justify-center py-3 px-4 rounded-lg 
                      bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
                  >
                    Convert to PDF
                  </button>
                )}

                <AnimatePresence>
                  {pdfUrl && (
                    <motion.div 
                      className="bg-green-50 rounded-lg p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-green-800">Conversion Complete!</h3>
                          <p className="text-xs text-green-600 mt-1">Your document has been converted successfully</p>
                        </div>
                        <a
                          href={pdfUrl}
                          download={`${file.name.replace('.docx', '')}.pdf`}
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

            {error && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfConverter;

