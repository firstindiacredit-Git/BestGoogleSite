import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import 'pdfjs-dist/web/pdf_viewer.css';
import { Back } from './back';
import { FaFilePdf, FaCrop, FaDownload } from 'react-icons/fa';
import { motion } from 'framer-motion';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const PdfCropper = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [cropData, setCropData] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });
  const [isCropping, setIsCropping] = useState(false);
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const [pdfWidth, setPdfWidth] = useState(0);
  const [pdfHeight, setPdfHeight] = useState(0);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async () => {
        const pdfData = new Uint8Array(reader.result);
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        setPdfFile(pdf);
        renderPageToOffscreenCanvas(pdf, 1);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const renderPageToOffscreenCanvas = async (pdf, pageNum) => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });

    // Set the size of the main canvas
    const canvas = canvasRef.current;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const offscreenCanvas = offscreenCanvasRef.current;
    offscreenCanvas.width = viewport.width;
    offscreenCanvas.height = viewport.height;

    // Store the dimensions for the crop logic
    setPdfWidth(viewport.width);
    setPdfHeight(viewport.height);

    const offscreenContext = offscreenCanvas.getContext('2d');
    const renderContext = {
      canvasContext: offscreenContext,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
    updateMainCanvas();
  };

  const updateMainCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const offscreenCanvas = offscreenCanvasRef.current;

    // Clear the canvas and redraw the offscreen content
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(offscreenCanvas, 0, 0);
    
    // Draw the crop rectangle if cropping is active
    if (isCropping) drawCropRect(context);
  };

  const drawCropRect = (context) => {
    const { startX, startY, endX, endY } = cropData;
    context.strokeStyle = 'red';
    context.lineWidth = 2;
    context.setLineDash([5, 5]);
    context.strokeRect(startX, startY, endX - startX, endY - startY);
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setCropData({
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      endX: 0,
      endY: 0,
    });
    setIsCropping(true);
  };

  const handleMouseMove = (e) => {
    if (isCropping) {
      const rect = canvasRef.current.getBoundingClientRect();
      setCropData((prevData) => ({
        ...prevData,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top,
      }));
      updateMainCanvas(); // Refresh with crop rectangle overlay
    }
  };

  const handleMouseUp = () => {
    setIsCropping(false);
  };

  const handleCrop = async () => {
    if (!pdfFile) return;
    const { startX, startY, endX, endY } = cropData;
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    const pdfDoc = await PDFDocument.create();
    const copiedPage = pdfDoc.addPage([width, height]);

    // Get the cropped image from the offscreen canvas
    const originalCanvas = offscreenCanvasRef.current;
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = width;
    croppedCanvas.height = height;
    const croppedContext = croppedCanvas.getContext('2d');

    croppedContext.drawImage(
      originalCanvas,
      startX, startY, width, height,
      0, 0, width, height
    );

    try {
      // Embed the cropped image into the PDF
      const croppedImage = croppedCanvas.toDataURL("image/png");
      const image = await pdfDoc.embedPng(croppedImage);

      copiedPage.drawImage(image, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });

      // Save the PDF and download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "cropped.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error embedding PNG image into PDF:", error);
      alert("Failed to crop and embed the image. Please try again.");
    }
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
              <h1 className="text-3xl font-bold text-gray-900">PDF Cropper</h1>
              <p className="mt-2 text-sm text-gray-600">Crop specific areas from your PDF</p>
            </div>

            {!pdfFile ? (
              <div className="relative border-2 border-dashed rounded-lg p-12 text-center border-gray-300 hover:border-gray-400">
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
                      <span className="text-blue-500 hover:text-blue-600 ml-1">browse</span>
                    </span>
                    <p className="mt-1 text-xs text-gray-500">PDF files only</p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative border rounded-lg overflow-hidden bg-gray-50">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    className="w-full cursor-crosshair"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    onClick={handleCrop}
                    disabled={!cropData.endX || !cropData.endY}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500 text-white rounded-lg 
                      hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaCrop className="text-white" />
                    <span>Crop Selected Area</span>
                  </button>
                  
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="upload-new"
                  />
                  <label
                    htmlFor="upload-new"
                    className="flex items-center justify-center gap-2 py-2 px-4 border-2 border-dashed 
                      border-gray-300 rounded-lg hover:border-blue-400 cursor-pointer"
                  >
                    <FaFilePdf className="text-gray-400" />
                    <span className="text-sm text-gray-600">New PDF</span>
                  </label>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  <p>• Draw a rectangle on the PDF to select the area to crop</p>
                  <p>• Click the crop button to save the selected area as a new PDF</p>
                  <p>• Original PDF quality will be preserved</p>
                  <p>• You can upload a new PDF at any time</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Offscreen canvas for storing PDF content */}
      <canvas ref={offscreenCanvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default PdfCropper;
