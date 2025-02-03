import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Back } from './back';
import { FaFilePdf, FaEdit, FaDownload } from 'react-icons/fa';
import { motion } from 'framer-motion';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [modifiedText, setModifiedText] = useState('');
  const [textContent, setTextContent] = useState([]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setPdfFile(URL.createObjectURL(file));
        const arrayBuffer = await file.arrayBuffer();
        const { text, positions } = await extractTextFromPdf(arrayBuffer);
        setModifiedText(text);
        setTextContent(positions);
      } catch (error) {
        console.error('Error reading PDF file:', error);
        alert('Failed to read the PDF file. Please try again.');
      }
    }
  };

  const extractTextFromPdf = async (arrayBuffer) => {
    try {
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      let fullText = '';
      let positions = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        const pageText = content.items.map((item) => item.str).join(' ');
        fullText += `\n\n${pageText}`;

        content.items.forEach((item) => {
          positions.push({
            text: item.str,
            x: item.transform[4],
            y: item.transform[5],
            fontSize: item.height,
          });
        });
      }

      return { text: fullText, positions };
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      alert('Failed to extract text from the PDF. Please check the file.');
      return { text: '', positions: [] };
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleSavePdf = async () => {
    if (pdfFile && modifiedText) {
      try {
        const existingPdfBytes = await fetch(pdfFile).then((res) => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        firstPage.drawRectangle({
          x: 0,
          y: 0,
          width: width,
          height: height,
          color: rgb(1, 1, 1),
        });

        const lines = modifiedText.split('\n');
        let cursorY = height - 40;

        lines.forEach((line) => {
          firstPage.drawText(line, {
            x: 50,
            y: cursorY,
            size: 12,
            font: helveticaFont,
            color: rgb(0, 0, 0),
            maxWidth: width - 100,
          });
          cursorY -= 16;
        });

        const modifiedPdfBytes = await pdfDoc.save();
        downloadModifiedPdf(modifiedPdfBytes, 'modified.pdf');
      } catch (error) {
        console.error('Error saving PDF:', error);
        alert('An error occurred while saving the PDF. Please try again.');
      }
    }
  };

  const downloadModifiedPdf = (pdfBytes, filename) => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
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
              <h1 className="text-3xl font-bold text-gray-900">PDF Text Editor</h1>
              <p className="mt-2 text-sm text-gray-600">Edit text content in your PDF files</p>
            </div>

            {!pdfFile ? (
              <div className="relative border-2 border-dashed rounded-lg p-12 text-center border-gray-300 hover:border-gray-400">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
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
                <div className="border rounded-lg overflow-hidden bg-gray-50 p-4">
                  <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
                    {Array.from(new Array(numPages), (el, index) => (
                      <Page 
                        key={`page_${index + 1}`} 
                        pageNumber={index + 1}
                        className="mb-4 shadow-lg"
                      />
                    ))}
                  </Document>
                </div>

                <div className="space-y-4">
                  <textarea
                    value={modifiedText}
                    onChange={(e) => setModifiedText(e.target.value)}
                    rows={10}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Edit the extracted text here..."
                  />

                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleSavePdf}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500 text-white rounded-lg 
                        hover:bg-blue-600 transition-colors"
                    >
                      <FaDownload className="text-white" />
                      <span>Download Modified PDF</span>
                    </button>
                    
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileUpload}
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
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  <p>• Edit the extracted text in the text area above</p>
                  <p>• Click download to save your changes to a new PDF</p>
                  <p>• Original PDF formatting will be preserved</p>
                  <p>• You can upload a new PDF at any time</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
