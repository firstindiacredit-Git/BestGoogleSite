import React, { useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";
import { Back } from "./back";
import { FaFilePdf, FaDownload, FaFileUpload } from "react-icons/fa";

const AddPageNum = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file?.type === "application/pdf") {
      setPdfFile(file);
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
    }
  };

  const addPageNumbers = async () => {
    if (!pdfFile) return;

    const fileData = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileData);
    const font = await pdfDoc.embedStandardFont("Helvetica");
    const totalPages = pdfDoc.getPageCount();

    for (let i = 0; i < totalPages; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();

      page.drawText(`Page ${i + 1}`, {
        x: width / 2 - 20,
        y: 20,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
    }

    const modifiedPdf = await pdfDoc.save();
    const blob = new Blob([modifiedPdf], { type: "application/pdf" });
    saveAs(blob, `${pdfFile.name.replace('.pdf', '')}_numbered.pdf`);
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
              <h1 className="text-3xl font-bold text-gray-900">Add Page Numbers</h1>
              <p className="mt-2 text-sm text-gray-600">Automatically add page numbers to your PDF document</p>
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
                    onClick={() => setPdfFile(null)}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>

                <button
                  onClick={addPageNumbers}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-500 
                    text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <FaDownload size={16} />
                  Add Page Numbers & Download
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPageNum;
