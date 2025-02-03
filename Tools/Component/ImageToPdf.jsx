import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { Back } from "./back";
import { FaFileImage, FaTrash, FaArrowsAlt, FaFilePdf, FaDownload } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const DraggableImage = ({ image, index, moveImage, deleteImage, isDraggingDisabled, setIsDraggingDisabled }) => {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'image',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isDraggingDisabled,
  });

  const [, drop] = useDrop({
    accept: 'image',
    hover: (item) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveImage(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1, 
        scale: isDragging ? 1.05 : 1,
        boxShadow: isDragging ? '0 8px 20px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'
      }}
      className="group relative aspect-[3/4] rounded-lg overflow-hidden cursor-move"
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
            Page {index + 1}
          </div>
          <button
            onMouseEnter={() => setIsDraggingDisabled(true)}
            onMouseLeave={() => setIsDraggingDisabled(false)}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              deleteImage(index);
            }}
            className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors z-50"
          >
            <FaTrash size={12} />
          </button>
        </div>
        <div className="absolute bottom-2 left-2 right-2">
          <div className="text-white text-xs truncate px-2">{image.name}</div>
          <div className="text-white/80 text-xs px-2">
            {(image.size / 1024 / 1024).toFixed(2)} MB
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <FaArrowsAlt className="text-white/80 text-2xl" />
        </div>
      </div>
    </motion.div>
  );
};

const ImageToPdf = () => {
  const [images, setImages] = useState([]);
  const [orientation, setOrientation] = useState("portrait");
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isDraggingDisabled, setIsDraggingDisabled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file, index) => ({
      id: `image-${Date.now()}-${index}`,
      file: file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));
    setImages((prev) => [...prev, ...imageUrls]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    const imageUrls = files.map((file, index) => ({
      id: `image-${Date.now()}-${index}`,
      file: file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));
    setImages((prev) => [...prev, ...imageUrls]);
  };

  const deleteImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const generatePdf = async () => {
    if (images.length === 0) return;
    setLoading(true);

    try {
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
      });

      for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage();

        const img = images[i];
        const pageWidth = orientation === 'portrait' ? 210 : 297;
        const pageHeight = orientation === 'portrait' ? 297 : 210;
        
        const maxWidth = pageWidth - 20;
        const maxHeight = pageHeight - 20;

        const imgAspectRatio = await new Promise(resolve => {
          const image = new Image();
          image.onload = () => {
            resolve(image.width / image.height);
          };
          image.src = img.url;
        });

        let finalWidth = maxWidth;
        let finalHeight = finalWidth / imgAspectRatio;

        if (finalHeight > maxHeight) {
          finalHeight = maxHeight;
          finalWidth = finalHeight * imgAspectRatio;
        }

        const x = (pageWidth - finalWidth) / 2;
        const y = (pageHeight - finalHeight) / 2;

        pdf.addImage(img.url, 'JPEG', x, y, finalWidth, finalHeight);
      }

      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageStyle = () => {
    return orientation === "portrait" 
      ? "aspect-[3/4] object-cover" 
      : "aspect-[4/3] object-cover";
  };

  const getContainerStyle = () => {
    return orientation === "portrait"
      ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
      : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4";
  };

  const moveImage = (dragIndex, hoverIndex) => {
    setImages((prevImages) => {
      const newImages = [...prevImages];
      const draggedImage = newImages[dragIndex];
      newImages.splice(dragIndex, 1);
      newImages.splice(hoverIndex, 0, draggedImage);
      return newImages;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
          rounded-xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)]"
        >
          <div className="p-4 border-b border-gray-100">
            <Back />
          </div>

          <div className="p-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Image to PDF</h1>
              <p className="mt-2 text-sm text-gray-600">Convert your images to PDF in seconds</p>
            </div>

            {images.length === 0 ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-12 text-center 
                  ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer"
                >
                  <FaFileImage className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Drop your images here or
                      <span className="text-blue-500 hover:text-blue-600 ml-1">browse</span>
                    </span>
                    <p className="mt-1 text-xs text-gray-500">JPG, PNG or GIF files</p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setOrientation("portrait")}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                        orientation === "portrait"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="6" y="3" width="12" height="18" rx="2" strokeWidth="2"/>
                      </svg>
                      <span>Portrait</span>
                    </button>
                    <button
                      onClick={() => setOrientation("landscape")}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                        orientation === "landscape"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth="2"/>
                      </svg>
                      <span>Landscape</span>
                    </button>
                  </div>
                </div>
                <DndProvider backend={HTML5Backend}>
                  <div className={getContainerStyle()}>
                    {images.map((image, index) => (
                      <DraggableImage
                        key={image.id}
                        image={image}
                        index={index}
                        moveImage={moveImage}
                        deleteImage={deleteImage}
                        isDraggingDisabled={isDraggingDisabled}
                        setIsDraggingDisabled={setIsDraggingDisabled}
                      />
                    ))}
                  </div>
                </DndProvider>

                <div className="flex items-center gap-4 pt-4 border-t">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    multiple
                    className="hidden"
                    id="add-more"
                  />
                  <label
                    htmlFor="add-more"
                    className="flex-1 flex items-center justify-center gap-2 py-2 border-2 border-dashed 
                      border-gray-300 rounded-lg hover:border-blue-400 cursor-pointer"
                  >
                    <FaFileImage className="text-gray-400" />
                    <span className="text-sm text-gray-600">Add more images</span>
                  </label>
                  <button
                    onClick={generatePdf}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg 
                      hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Converting...</span>
                    ) : (
                      <>
                        <FaFilePdf />
                        <span>Convert to PDF</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  <p>• Images will be automatically fitted to {orientation} PDF pages</p>
                  <p>• Drag and drop to reorder images</p>
                  <p>• Each image will be placed on a separate page</p>
                  <p>• Original aspect ratio will be preserved</p>
                </div>

                <AnimatePresence>
                  {pdfUrl && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-green-50 rounded-lg p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-green-800">Conversion Complete!</h3>
                          <p className="text-xs text-green-600 mt-1">Your images have been converted to PDF</p>
                        </div>
                        <a
                          href={pdfUrl}
                          download="converted_images.pdf"
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg 
                            hover:bg-green-700 transition-colors"
                        >
                          <FaDownload size={16} />
                          Download PDF
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

export default ImageToPdf;
