import React, { useState } from "react";
import { Back } from './back';
import { FaFilePdf, FaFileUpload, FaLock, FaDownload } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';

const ProtectAnimation = () => (
  <div className="flex flex-col items-center justify-center py-8">
    <div className="relative w-24 h-24">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 0, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <FaFilePdf className="w-24 h-24 text-red-500/20" />
      </motion.div>
      
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{
          scale: [0.5, 1, 0.8],
          opacity: [0, 1, 0.8],
          y: [0, -10, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <FaLock className="w-12 h-12 text-blue-500" />
      </motion.div>
    </div>
    <div className="mt-6 space-y-3">
      <h3 className="text-lg font-medium text-gray-900">Protecting your PDF</h3>
      <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      <p className="text-sm text-gray-500">Please wait while we secure your document</p>
    </div>
  </div>
);

const Protect = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [password, setPassword] = useState("");
  const [protectedPdf, setProtectedPdf] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file?.type === "application/pdf") {
      setPdfFile(file);
      setProtectedPdf(null);
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
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      setPdfFile(file);
      setProtectedPdf(null);
    }
  };

  const protectPdf = async () => {
    if (!pdfFile || !password) {
      alert("Please upload a PDF and enter a password.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("pdfFile", pdfFile);
    formData.append("password", password);

    try {
      const response = await fetch("https://saasbackend.pizeonfly.com/protect", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        setProtectedPdf(downloadUrl);
      } else {
        alert("Failed to protect PDF");
      }
    } catch (error) {
      console.error("Error protecting PDF:", error);
    } finally {
      setLoading(false);
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Protect PDF</h1>
              <p className="mt-2 text-sm text-gray-600">Add password protection to your PDF document</p>
            </div>

            {!pdfFile ? (
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
                  <FaFileUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Drop your PDF here or
                      <span className="text-blue-500 hover:text-blue-600 ml-1">browse</span>
                    </span>
                    <p className="mt-1 text-xs text-gray-500">PDF files only</p>
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
                      <h3 className="text-sm font-medium text-gray-900">{pdfFile.name}</h3>
                      <p className="text-xs text-gray-500">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPdfFile(null);
                      setProtectedPdf(null);
                      setPassword("");
                    }}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="Enter password to protect PDF"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                      focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {!protectedPdf ? (
                  <button
                    onClick={protectPdf}
                    disabled={loading || !password}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-500 
                      text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {!loading ? (
                      <>
                        <FaLock size={16} />
                        <span>Protect PDF</span>
                      </>
                    ) : (
                      <span>Starting protection...</span>
                    )}
                  </button>
                ) : null}

                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-6"
                    >
                      <ProtectAnimation />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {protectedPdf && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-green-50 rounded-lg p-6 mt-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-green-800">Protection Complete!</h3>
                          <p className="text-xs text-green-600 mt-1">Your PDF has been successfully protected</p>
                        </div>
                        <a
                          href={protectedPdf}
                          download={`${pdfFile.name.replace('.pdf', '')}_protected.pdf`}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg 
                            hover:bg-green-700 transition-colors"
                        >
                          <FaDownload size={16} />
                          Download
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Protect;
