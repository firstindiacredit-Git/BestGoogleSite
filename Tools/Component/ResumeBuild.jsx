import React, { useState } from 'react';
import ResumeForm from './resume/ResumeForm';
import ResumePreview from './resume/ResumePreview';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Back } from './back';

const ResumeBuild = () => {
  const [resumeData, setResumeData] = useState(null);
  const [themeColor, setThemeColor] = useState('#2563eb'); // Default blue theme
  const [selectedFormat, setSelectedFormat] = useState('modern');

  const handleDownload = () => {
    const resume = document.getElementById('resume-preview');
    html2canvas(resume).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('resume.pdf');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-4">
      <div className="max-w-7xl mx-auto relative">
        <div className="absolute top-0 left-4">
          <Back />
        </div>
        
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 pt-2">
          Resume Builder
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Form */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-[30px] shadow-lg p-6">
              <ResumeForm 
                onSubmit={setResumeData} 
                themeColor={themeColor}
                setThemeColor={setThemeColor}
                selectedFormat={selectedFormat}
                setSelectedFormat={setSelectedFormat}
              />
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="lg:w-1/2">
            {resumeData && (
              <div className="sticky top-8">
                <div id="resume-preview" className="bg-white rounded-[30px] shadow-lg overflow-hidden">
                  <ResumePreview 
                    data={resumeData} 
                    themeColor={themeColor}
                    selectedFormat={selectedFormat}
                  />
                </div>
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Download Resume as PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuild;
