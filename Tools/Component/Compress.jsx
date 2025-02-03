import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Back } from './back';
import { FaFilePdf, FaDownload, FaSpinner } from 'react-icons/fa';

const Compress = () => {
  const [file, setFile] = useState(null);
  const [compressedPdf, setCompressedPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
      setCompressedPdf(null);
    }
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
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      setOriginalSize(droppedFile.size);
      setCompressedPdf(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCompress = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const fileData = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileData);

      pdfDoc.setTitle("Compressed PDF");
      pdfDoc.setCreator("PDF Compressor");

      const compressedPdfBytes = await pdfDoc.save();
      const blob = new Blob([compressedPdfBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);

      setCompressedSize(blob.size);
      setCompressedPdf(downloadUrl);
    } catch (error) {
      console.error("Error compressing PDF:", error);
      alert("Failed to compress PDF.");
    }

    setLoading(false);
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
              <h1 className="text-3xl font-bold text-gray-900">PDF Compressor</h1>
              <p className="mt-2 text-sm text-gray-600">Reduce your PDF file size without losing quality</p>
            </div>

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
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer"
                >
                  <FaFilePdf className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
   Drop your PDF here or
                      <span className="text-blue-500 hover:text-blue-600 ml-1">
                        browse
                      </span>
                    </span>
                    <p className="mt-1 text-xs text-gray-500">
                      Maximum file size: 10MB
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <FaFilePdf className="h-8 w-8 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{file.name}</h3>
                      <p className="text-xs text-gray-500">Original size: {formatFileSize(originalSize)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      setCompressedPdf(null);
                    }}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>

                {!compressedPdf ? (
                  <button
                    onClick={handleCompress}
                    disabled={loading}
                    className="w-full flex items-center justify-center py-3 px-4 rounded-lg 
                      bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Compressing...
                      </>
                    ) : (
                      'Compress PDF'
                    )}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-green-800">Compression Complete!</h3>
                          <p className="text-xs text-green-600 mt-1">
                            Reduced from {formatFileSize(originalSize)} to {formatFileSize(compressedSize)}
                            {' '}({Math.round((1 - compressedSize/originalSize) * 100)}% smaller)
                          </p>
                        </div>
                        <a
                          href={compressedPdf}
                          download={`compressed_${file.name}`}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg 
                            hover:bg-green-700 transition-colors"
                        >
                          <FaDownload className="mr-2" />
                          Download
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFile(null);
                        setCompressedPdf(null);
                      }}
                      className="w-full py-2 text-sm text-blue-500 hover:text-blue-600"
                    >
                      Compress another PDF
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h3 className="text-sm font-medium text-gray-900">Fast Processing</h3>
                    <p className="mt-1 text-xs text-gray-500">Compress your PDFs in seconds</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h3 className="text-sm font-medium text-gray-900">Quality Maintained</h3>
                    <p className="mt-1 text-xs text-gray-500">No visible loss in quality</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h3 className="text-sm font-medium text-gray-900">100% Secure</h3>
                    <p className="mt-1 text-xs text-gray-500">Files are processed locally</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compress;

