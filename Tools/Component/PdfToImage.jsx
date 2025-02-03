import React, { useState, useEffect } from "react";
import { Back } from "./back";
import { FaFilePdf, FaDownload, FaImage, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import * as pdfjsLib from 'pdfjs-dist';

// Create a Blob URL for the PDF worker
const pdfWorkerBlob = new Blob(
  [
    `importScripts('https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.min.js');`
  ],
  { type: "application/javascript" }
);

pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(pdfWorkerBlob);

const PdfToImage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFormat, setImageFormat] = useState("jpeg"); // jpeg or png
  const [imageQuality, setImageQuality] = useState(1.5); // scale factor

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      await convertPdfToImages(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      await convertPdfToImages(file);
    }
  };

  const convertPdfToImages = async (file) => {
    setLoading(true);
    try {
      const pdfData = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      const pages = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: imageQuality });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
        
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context, viewport }).promise;
        
        const imageUrl = canvas.toDataURL(`image/${imageFormat}`);
        pages.push({
          id: `page-${Date.now()}-${pageNum}`,
          url: imageUrl,
          name: `Page ${pageNum}`,
          pageNumber: pageNum
        });
      }
      setImages(pages);
    } catch (error) {
      console.error('Error converting PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const downloadImage = (imageUrl, fileName) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
          rounded-xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)]">
          <div className="p-4 border-b border-gray-100">
      <Back />
          </div>

          <div className="p-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">PDF to Image</h1>
              <p className="mt-2 text-sm text-gray-600">Convert your PDF to images in seconds</p>
            </div>

            {!pdfFile ? (
              <div className="relative border-2 border-dashed rounded-lg p-12 text-center border-gray-300 hover:border-gray-400">
      <input
        type="file"
        accept="application/pdf"
                  onChange={handlePdfUpload}
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
                      <span className="text-blue-500 hover:text-blue-600 ml-1">browse</span>
                    </span>
                    <p className="mt-1 text-xs text-gray-500">PDF files only</p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative aspect-[3/4] rounded-lg overflow-hidden shadow-md"
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
                          <div className="bg-black/50 text-white text-sm px-2 py-1 rounded">
                            Page {image.pageNumber}
                          </div>
                          <button
                            onClick={() => deleteImage(index)}
                            className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full text-white"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                          <button
                            onClick={() => downloadImage(image.url, `page-${image.pageNumber}.${imageFormat}`)}
                            className="flex-1 flex items-center justify-center gap-1 bg-blue-500/80 hover:bg-blue-500 text-white text-sm py-1 px-2 rounded"
                          >
                            <FaDownload size={12} />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                    id="add-more"
                  />
                  <label
                    htmlFor="add-more"
                    className="flex-1 flex items-center justify-center gap-2 py-2 border-2 border-dashed 
                      border-gray-300 rounded-lg hover:border-blue-400 cursor-pointer"
                  >
                    <FaFilePdf className="text-gray-400" />
                    <span className="text-sm text-gray-600">Upload another PDF</span>
                  </label>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  <p>• Images will be saved in {imageFormat.toUpperCase()} format</p>
                  <p>• Click the download button on each image to save it</p>
                  <p>• Original PDF quality will be preserved</p>
                  <p>• Each page will be converted to a separate image</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfToImage;
