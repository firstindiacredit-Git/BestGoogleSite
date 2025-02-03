import React, { useState, useEffect } from "react";
import {
  FaFilePdf,
  FaTasks,
  FaCalculator,
  FaTh,
  FaFileImage,
  FaEdit,
  FaUnlockAlt,
  FaLock,
  FaStream,
  FaCropAlt,
} from "react-icons/fa";
import {
  AiFillFileText,
  AiOutlineMergeCells,
  AiOutlineNumber,
} from "react-icons/ai";

import ButtonComponent from "./ButtonComponent";
import { FaCompress, FaList, FaScissors } from "react-icons/fa6";
import GridComponent from "./GridComponent";

const NewTab = () => {
  const [viewType, setViewType] = useState("grid");
  const [toolsUsed, setToolsUsed] = useState(0);
  const totalTools = 60;

  // Initialize tools used from localStorage
    useEffect(() => {
    const usedTools = JSON.parse(localStorage.getItem("usedTools") || "[]");
    setToolsUsed(usedTools.length);
    }, []);

  const handleToolUse = () => {
    setToolsUsed((prev) => prev + 1);
  };

    return (
        <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Tools & Utilities
            </h1>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                  <span className="text-lg font-bold">
                    {Math.round((toolsUsed / totalTools) * 100)}%
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Tool Progress
                  </h2>
                  <p className="text-sm text-gray-500">
                    {toolsUsed} of {totalTools} tools explored
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`px-3 py-1 rounded-full ${
                    toolsUsed === 0
                      ? "bg-gray-100 text-gray-600"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  <span className="text-sm font-medium">
                    {toolsUsed === 0
                      ? "Get Started!"
                      : `${toolsUsed} Tools Used`}
                  </span>
                </div>
              </div>
            </div>

                    <div className="relative">
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-in-out transform hover:scale-y-110"
                  style={{
                    width: `${(toolsUsed / totalTools) * 100}%`,
                    boxShadow: "0 1px 2px rgba(30, 58, 138, 0.3)",
                  }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>Just getting started</span>
              <span>Halfway there</span>
              <span>Tool master</span>
            </div>

            {toolsUsed === 0 && (
              <div className="mt-4 bg-blue-50 rounded-lg p-4 flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-xl">💡</span>
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">
                    Ready to explore?
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Try out any tool to start tracking your progress
                  </p>
                </div>
              </div>
            )}
                    </div>
                </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* View Toggle */}
          <div className="flex justify-end mb-6">
            <div className="bg-white rounded-lg shadow-sm border p-1 inline-flex">
                    <button
                onClick={() => setViewType("grid")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewType === "grid"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                title="Grid View"
                    >
                        <FaTh size={20} />
                    </button>
                    <button
                onClick={() => setViewType("list")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewType === "list"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                title="List View"
                    >
                        <FaList size={20} />
                    </button>
                </div>
                                        </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            {viewType === "list" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                <div>
                  <h3 className="font-semibold text-lg text-neutral-600 text-left mb-4">
                    PDF
                  </h3>
                  <ButtonComponent
                    path="/imagetopdf"
                    name="Image To Pdf"
                    icon={<FaFilePdf className="mr-3 text-red-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/splitpdf"
                    name="Split Pdf"
                    icon={<FaScissors className="mr-3 text-blue-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/compress"
                    name="Compress Pdf"
                    icon={<FaCompress className="mr-3 text-red-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/mergepdf"
                    name="Merge Pdf"
                    icon={
                      <AiOutlineMergeCells className="mr-3 text-blue-500" />
                    }
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/pdfconverter"
                    name="Word To Pdf"
                    icon={<AiFillFileText className="mr-3 text-red-600" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/searchpdf"
                    name="Search Excel"
                    icon={<FaFilePdf className="mr-3 text-red-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/editpdf"
                    name="Edit Pdf"
                    icon={<FaEdit className="mr-3 text-green-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/extractpages"
                    name="Extract Page"
                    icon={<FaStream className="mr-3 text-blue-800" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/pdfcropper"
                    name="Pdf Cropper"
                    icon={<FaCropAlt className="mr-3 text-green-300" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/addpagenum"
                    name="Add page No."
                    icon={<AiOutlineNumber className="mr-3 text-green-300" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/protect"
                    name="Protect Pdf"
                    icon={<FaLock className="mr-3 text-pink-700" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/unlockpdf"
                    name="Unlock Pdf"
                    icon={<FaUnlockAlt className="mr-3 text-pink-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/pdftoimage"
                    name="Pdf To Image"
                    icon={<FaFileImage className="mr-3 text-yellow-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/pdftoword"
                    name="Pdf To Word"
                    icon={<FaFilePdf className="mr-3 text-red-500" />}
                    onToolUse={handleToolUse}
                  />
                                </div>
                                <div>
                  <h3 className="font-semibold text-lg text-neutral-600 text-left mb-4">
                    TODO
                  </h3>
                  <ButtonComponent
                    path="/grocery"
                    name="Grocery List"
                    icon={<FaTasks className="mr-3 text-purple-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/bulkemailchecker"
                    name="Email Checker"
                    icon={<FaTasks className="mr-3 text-purple-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/bulkemailsender"
                    name="Email Sender"
                    icon={<FaTasks className="mr-3 text-purple-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/googlemap"
                    name="Google Map Extractor"
                    icon={<FaTasks className="mr-3 text-purple-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/cardvalidation"
                    name="Card Validator"
                    icon={<FaTasks className="mr-3 text-purple-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/cardgenerator"
                    name="Card Generator"
                    icon={<FaTasks className="mr-3 text-purple-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/templategenerator"
                    name="Html Template Generator"
                    icon={<FaTasks className="mr-3 text-purple-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/phonenumberformat"
                    name="phone Number Formatter"
                    icon={<FaTasks className="mr-3 text-purple-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/randompassword"
                    name="Random Password Generator"
                    icon={<FaTasks className="mr-3 text-purple-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/Linkedinscraper"
                    name="Linkedin Scrapper"
                    icon={<FaTasks className="mr-3 text-purple-500" />}
                    onToolUse={handleToolUse}
                  />
                                </div>
                                <div>
                  <h3 className="font-semibold text-lg text-neutral-600 text-left mb-4 pl-4">
                    CALCULATOR
                  </h3>
                  <ButtonComponent
                    path="/calculator"
                    name="Calculator"
                    icon={<FaCalculator className="mr-3 text-teal-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/percentage"
                    name="% Calculator"
                    icon={<FaCalculator className="mr-3 text-teal-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/bmi"
                    name="BMI Calculator"
                    icon={<FaCalculator className="mr-3 text-teal-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/scientific"
                    name="Scientific Calculator"
                    icon={<FaCalculator className="mr-3 text-teal-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/compareloan"
                    name="Compare Loan"
                    icon={<FaCalculator className="mr-3 text-teal-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/currencyconverter"
                    name="Currency Converter"
                    icon={<FaCalculator className="mr-3 text-teal-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/fractioncalculator"
                    name="Fraction Calculator"
                    icon={<FaCalculator className="mr-3 text-teal-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/averagecalculator"
                    name="Average Calculator"
                    icon={<FaCalculator className="mr-3 text-teal-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/lcm"
                    name="LCM Calculator"
                    icon={<FaCalculator className="mr-3 text-teal-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/agecalculator"
                    name="Age Calculator"
                    icon={<FaCalculator className="mr-3 text-teal-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/datediffcalculator"
                    name="Date Difference Calculator"
                    icon={<FaCalculator className="mr-3 text-teal-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/compoundintrest"
                    name="Compound Interest Calculator"
                    icon={<FaCalculator className="mr-3 text-teal-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/simpleinterest"
                    name="Simple Interest Calculator"
                    icon={<FaCalculator className="mr-3 text-teal-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/discountcalculator"
                    name="Discount Calculator"
                    icon={<FaCalculator className="mr-3 text-teal-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/gstcalculator"
                    name="GST Calculator"
                    icon={<FaCalculator className="mr-3 text-teal-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/vatcalculator"
                    name="VAT Calculator"
                    icon={<FaCalculator className="mr-3 text-teal-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/electricitybill"
                    name="Electricity bill Calculator"
                    icon={<FaCalculator className="mr-3 text-teal-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/testscorecalculator"
                    name="Test Score Calculator"
                    icon={<FaCalculator className="mr-3 text-teal-500" />}
                    onToolUse={handleToolUse}
                  />
                                </div>
                                <div>
                  <h3 className="font-semibold text-lg text-neutral-600 text-left mb-4 pl-4">
                    CONVERTER
                  </h3>
                  <ButtonComponent
                    path="/faren-to-celcius"
                    name="Fahrenheit to Celsius"
                    icon={<FaFilePdf className="mr-3 text-blue-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/second"
                    name="Second to Hour"
                    icon={<FaFilePdf className="mr-3 text-blue-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/hours"
                    name="Hour to Second"
                    icon={<FaFilePdf className="mr-3 text-blue-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/texttospeech"
                    name="Text To Speech"
                    icon={<FaFilePdf className="mr-3 text-blue-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/speechtotext"
                    name="Speech To Text"
                    icon={<FaFilePdf className="mr-3 text-blue-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/onlinevoiceRecorder"
                    name="Online Voice Recorder"
                    icon={<FaFilePdf className="mr-3 text-blue-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/onlinescreenRecorder"
                    name="Online Screen Recorder"
                    icon={<FaFilePdf className="mr-3 text-blue-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/onlinescreenshot"
                    name="Online ScreenShot"
                    icon={<FaFilePdf className="mr-3 text-blue-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/onlinewebcamtest"
                    name="Online Webcam Test"
                    icon={<FaFilePdf className="mr-3 text-blue-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/calendar"
                    name="Calendar"
                    icon={<FaFilePdf className="mr-3 text-blue-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/clock"
                    name="Clock"
                    icon={<FaFilePdf className="mr-3 text-blue-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/stopwatch"
                    name="Stop Watch"
                    icon={<FaFilePdf className="mr-3 text-blue-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/timer"
                    name="Countdown Timer"
                    icon={<FaFilePdf className="mr-3 text-blue-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/alarm"
                    name="Alarm Clock"
                    icon={<FaFilePdf className="mr-3 text-blue-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/binarytodecimal"
                    name="Binary To Decimal"
                    icon={<FaFilePdf className="mr-3 text-blue-500" />}
                    onToolUse={handleToolUse}
                  />
                                </div>
                                <div>
                  <h3 className="font-semibold text-lg text-neutral-600 text-left mb-4 pl-4">
                    MISC
                  </h3>
                  <ButtonComponent
                    path="/paypal"
                    name="Paypal Link Gen."
                    icon={<FaFilePdf className="mr-3 text-pink-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/beautifier"
                    name="HTML Beautifier"
                    icon={<FaFilePdf className="mr-3 text-pink-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/resumebuild"
                    name="Resume Builder"
                    icon={<FaFilePdf className="mr-3 text-pink-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/linkchecker"
                    name="Website Link Checker"
                    icon={<FaFilePdf className="mr-3 text-pink-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/wordcounter"
                    name="Word Counter"
                    icon={<FaFilePdf className="mr-3 text-pink-500" />}
                    onToolUse={handleToolUse}
                  />
                  <ButtonComponent
                    path="/trafficchecker"
                    name="Traffic Checker"
                    icon={<FaFilePdf className="mr-3 text-pink-500" />}
                    onToolUse={handleToolUse}
                  />
                                </div>
                            </div>
                        ) : (
              <div className="space-y-12">
                {/* PDF Section */}
                <div>
                  <h3 className="font-semibold text-xl text-gray-900 mb-6 pb-2 border-b">
                    PDF Tools
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <GridComponent
                      path="/imagetopdf"
                      name="Image To PDF"
                      icon={<FaFilePdf className="text-red-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/splitpdf"
                      name="Split Pdf"
                      icon={<FaScissors className="text-blue-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/compress"
                      name="Compress Pdf"
                      icon={<FaCompress className="text-red-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/mergepdf"
                      name="Merge Pdf"
                      icon={<AiOutlineMergeCells className="text-blue-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/pdfconverter"
                      name="Word To Pdf"
                      icon={<AiFillFileText className="text-red-600" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/searchpdf"
                      name="Search Excel"
                      icon={<FaFilePdf className="text-red-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/editpdf"
                      name="Edit Pdf"
                      icon={<FaEdit className="text-green-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/extractpages"
                      name="Extract page"
                      icon={<FaStream className="text-blue-800" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/pdfcropper"
                      name="Pdf Cropper"
                      icon={<FaCropAlt className="text-green-300" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/addpagenum"
                      name="Add page No."
                      icon={<AiOutlineNumber className="text-green-300" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/protect"
                      name="Protect Pdf"
                      icon={<FaLock className="text-pink-700" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/unlockpdf"
                      name="Unlock Pdf"
                      icon={<FaUnlockAlt className="text-pink-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/pdftoimage"
                      name="Pdf To Image"
                      icon={<FaFileImage className="text-yellow-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/pdftoword"
                      name="Pdf To Word"
                      icon={<FaFilePdf className="text-red-500" />}
                      onToolUse={handleToolUse}
                    />
                  </div>
                                </div>

                                {/* TODO Section */}
                <div>
                  <h3 className="font-semibold text-xl text-gray-900 mb-6 pb-2 border-b">
                    Task Management
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <GridComponent
                      path="/grocery"
                      name="Grocery List"
                      icon={<FaTasks className="text-purple-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/bulkemailchecker"
                      name="Email Checker"
                      icon={<FaTasks className="text-purple-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/bulkemailsender"
                      name="Email Sender"
                      icon={<FaTasks className="text-purple-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/googlemap"
                      name="Google Map Extractor"
                      icon={<FaTasks className="text-purple-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/cardvalidation"
                      name="Card Validator"
                      icon={<FaTasks className="text-purple-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/cardgenerator"
                      name="Card Generator"
                      icon={<FaTasks className="text-purple-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/templategenerator"
                      name="Html Template Generator"
                      icon={<FaTasks className="text-purple-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/phoneNumberFormat"
                      name="Phone number Formatter"
                      icon={<FaTasks className="text-purple-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/randompassword"
                      name="Random Password Gen."
                      icon={<FaTasks className="text-purple-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/linkedinscraper"
                      name="Linkedin Scraper"
                      icon={<FaTasks className="text-purple-500" />}
                      onToolUse={handleToolUse}
                    />
                  </div>
                                </div>

                                {/* Calculator Section */}
                <div>
                  <h3 className="font-semibold text-xl text-gray-900 mb-6 pb-2 border-b">
                    Calculators
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <GridComponent
                      path="/calculator"
                      name="Calculator"
                      icon={<FaCalculator className="text-teal-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/percentage"
                      name="% Calculator"
                      icon={<FaCalculator className="text-teal-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/bmi"
                      name="BMI Calculator"
                      icon={<FaCalculator className="text-teal-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/scientific"
                      name="Scientific Calculator"
                      icon={<FaCalculator className="text-teal-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/compareloan"
                      name="Compare Loan"
                      icon={<FaCalculator className="text-teal-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/currencyconverter"
                      name="Currency Converter"
                      icon={<FaCalculator className="text-teal-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/fractioncalculator"
                      name="Fraction calculator"
                      icon={<FaCalculator className="text-teal-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/averagecalculator"
                      name="Average calculator"
                      icon={<FaCalculator className="text-teal-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/lcm"
                      name="LCM calculator"
                      icon={<FaCalculator className="text-teal-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/agecalculator"
                      name="Age calculator"
                      icon={<FaCalculator className="text-teal-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/datediffcalculator"
                      name="Date Difference calculator"
                      icon={<FaCalculator className="text-teal-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/compoundintrest"
                      name="Compound Interest Calcu."
                      icon={<FaCalculator className="text-teal-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/simpleinterest"
                      name="Simple Interest Calculator"
                      icon={<FaCalculator className="text-teal-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/discountcalculator"
                      name="Discount Calculator"
                      icon={<FaCalculator className="text-teal-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/gstcalculator"
                      name="GST Calculator"
                      icon={<FaCalculator className="text-teal-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/vatcalculator"
                      name="VAT Calculator"
                      icon={<FaCalculator className="text-teal-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/electricitybill"
                      name="Electricity bill Calculator"
                      icon={<FaCalculator className="text-teal-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/testscorecalculator"
                      name="Test Score Calculator"
                      icon={<FaCalculator className="text-teal-500" />}
                      onToolUse={handleToolUse}
                    />
                  </div>
                                </div>

                                {/* Converter Section */}
                <div>
                  <h3 className="font-semibold text-xl text-gray-900 mb-6 pb-2 border-b">
                    Converters
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <GridComponent
                      path="/faren-to-celcius"
                      name="Fahren to Celsius"
                      icon={<FaFilePdf className="text-blue-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/second"
                      name="Seconds to Hour"
                      icon={<FaFilePdf className="text-blue-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/hours"
                      name="Hour to Second"
                      icon={<FaFilePdf className="text-blue-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/texttospeech"
                      name="Text To Speech"
                      icon={<FaFilePdf className="text-blue-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/speechtotext"
                      name="Speech To Text"
                      icon={<FaFilePdf className="text-blue-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/onlinevoiceRecorder"
                      name="Online Voice Recorder"
                      icon={<FaFilePdf className="text-blue-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/onlinescreenRecorder"
                      name="Online Screen Recorder"
                      icon={<FaFilePdf className="text-blue-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/onlinescreenshot"
                      name="Online ScreenShot"
                      icon={<FaFilePdf className="text-blue-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/onlinewebcamtest"
                      name="Online Webcam Test"
                      icon={<FaFilePdf className="text-blue-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/calendar"
                      name="Calendar"
                      icon={<FaFilePdf className="text-blue-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/clock"
                      name="Clock"
                      icon={<FaFilePdf className="text-blue-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/stopwatch"
                      name="StopWatch"
                      icon={<FaFilePdf className="text-blue-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/timer"
                      name="Countdown Timer"
                      icon={<FaFilePdf className="text-blue-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/alarm"
                      name="Alarm Clock"
                      icon={<FaFilePdf className="text-blue-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/binarytodecimal"
                      name="Binary To Decimal"
                      icon={<FaFilePdf className="text-blue-500" />}
                      onToolUse={handleToolUse}
                    />
                  </div>
                                </div>

                                {/* Misc Section */}
                <div>
                  <h3 className="font-semibold text-xl text-gray-900 mb-6 pb-2 border-b">
                    Miscellaneous
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <GridComponent
                      path="/paypal"
                      name="Paypal Link Gen."
                      icon={<FaFilePdf className="text-pink-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/beautifier"
                      name="HTML Beautifier"
                      icon={<FaFilePdf className="text-pink-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/resumebuild"
                      name="Resume Builder"
                      icon={<FaFilePdf className="text-pink-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/linkchecker"
                      name="Link Checker"
                      icon={<FaFilePdf className="text-pink-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/wordcounter"
                      name="Word Counter"
                      icon={<FaFilePdf className="text-pink-500" />}
                      onToolUse={handleToolUse}
                    />
                    <GridComponent
                      path="/trafficchecker"
                      name="Traffic Checker"
                      icon={<FaFilePdf className="text-pink-500" />}
                      onToolUse={handleToolUse}
                    />
                  </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default NewTab;
