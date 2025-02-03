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
  FaCompress,
  FaList,
  FaHandScissors,
} from "react-icons/fa";
import {
  AiFillFileText,
  AiOutlineMergeCells,
  AiOutlineNumber,
} from "react-icons/ai";
import { Input } from "antd";
import ButtonComponent from "./ButtonComponent";
import GridComponent from "./GridComponent";

const { Search } = Input;

// Tool data arrays
const pdfTools = [
  {
    path: "/imagetopdf",
    name: "Image To PDF",
    icon: <FaFilePdf className="text-red-500" />,
  },
  {
    path: "/splitpdf",
    name: "Split PDF",
    icon: <FaHandScissors className="text-blue-500" />,
  },
  {
    path: "/compress",
    name: "Compress PDF",
    icon: <FaCompress className="text-red-500" />,
  },
  {
    path: "/mergepdf",
    name: "Merge PDF",
    icon: <AiOutlineMergeCells className="text-blue-500" />,
  },
  {
    path: "/pdfconverter",
    name: "Word To PDF",
    icon: <AiFillFileText className="text-red-600" />,
  },
  {
    path: "/searchpdf",
    name: "Search Excel",
    icon: <FaFilePdf className="text-red-500" />,
  },
  {
    path: "/editpdf",
    name: "Edit PDF",
    icon: <FaEdit className="text-green-500" />,
  },
  {
    path: "/extractpages",
    name: "Extract Page",
    icon: <FaStream className="text-blue-800" />,
  },
  {
    path: "/pdfcropper",
    name: "PDF Cropper",
    icon: <FaCropAlt className="text-green-300" />,
  },
  {
    path: "/addpagenum",
    name: "Add Page No.",
    icon: <AiOutlineNumber className="text-green-300" />,
  },
  {
    path: "/protect",
    name: "Protect PDF",
    icon: <FaLock className="text-pink-700" />,
  },
  {
    path: "/unlockpdf",
    name: "Unlock PDF",
    icon: <FaUnlockAlt className="text-pink-500" />,
  },
  {
    path: "/pdftoimage",
    name: "PDF To Image",
    icon: <FaFileImage className="text-yellow-500" />,
  },
  {
    path: "/pdftoword",
    name: "PDF To Word",
    icon: <FaFilePdf className="text-red-500" />,
  },
];

const todoTools = [
  {
    path: "/grocery",
    name: "Grocery List",
    icon: <FaTasks className="text-purple-500" />,
  },
  {
    path: "/bulkemailchecker",
    name: "Email Checker",
    icon: <FaTasks className="text-purple-500" />,
  },
  {
    path: "/bulkemailsender",
    name: "Email Sender",
    icon: <FaTasks className="text-purple-500" />,
  },
  {
    path: "/googlemap",
    name: "Google Map Extractor",
    icon: <FaTasks className="text-purple-500" />,
  },
  {
    path: "/cardvalidation",
    name: "Card Validator",
    icon: <FaTasks className="text-purple-500" />,
  },
  {
    path: "/cardgenerator",
    name: "Card Generator",
    icon: <FaTasks className="text-purple-500" />,
  },
  {
    path: "/templategenerator",
    name: "HTML Template Generator",
    icon: <FaTasks className="text-purple-500" />,
  },
  {
    path: "/phonenumberformat",
    name: "Phone Number Formatter",
    icon: <FaTasks className="text-purple-500" />,
  },
  {
    path: "/randompassword",
    name: "Random Password Gen.",
    icon: <FaTasks className="text-purple-500" />,
  },
  {
    path: "/linkedinscraper",
    name: "LinkedIn Scraper",
    icon: <FaTasks className="text-purple-500" />,
  },
];

const calculatorTools = [
  {
    path: "/calculator",
    name: "Calculator",
    icon: <FaCalculator className="text-teal-500" />,
  },
  {
    path: "/percentage",
    name: "% Calculator",
    icon: <FaCalculator className="text-teal-500" />,
  },
  {
    path: "/bmi",
    name: "BMI Calculator",
    icon: <FaCalculator className="text-teal-500" />,
  },
  {
    path: "/scientific",
    name: "Scientific Calculator",
    icon: <FaCalculator className="text-teal-500" />,
  },
  {
    path: "/compareloan",
    name: "Compare Loan",
    icon: <FaCalculator className="text-teal-500" />,
  },
  {
    path: "/currencyconverter",
    name: "Currency Converter",
    icon: <FaCalculator className="text-teal-500" />,
  },
  {
    path: "/fractioncalculator",
    name: "Fraction Calculator",
    icon: <FaCalculator className="text-teal-500" />,
  },
  {
    path: "/averagecalculator",
    name: "Average Calculator",
    icon: <FaCalculator className="text-teal-500" />,
  },
  {
    path: "/lcm",
    name: "LCM Calculator",
    icon: <FaCalculator className="text-teal-500" />,
  },
  {
    path: "/agecalculator",
    name: "Age Calculator",
    icon: <FaCalculator className="text-teal-500" />,
  },
  {
    path: "/datediffcalculator",
    name: "Date Difference Calculator",
    icon: <FaCalculator className="text-teal-500" />,
  },
  {
    path: "/compoundintrest",
    name: "Compound Interest Calculator",
    icon: <FaCalculator className="text-teal-500" />,
  },
  {
    path: "/simpleinterest",
    name: "Simple Interest Calculator",
    icon: <FaCalculator className="text-teal-500" />,
  },
  {
    path: "/discountcalculator",
    name: "Discount Calculator",
    icon: <FaCalculator className="text-teal-500" />,
  },
  {
    path: "/gstcalculator",
    name: "GST Calculator",
    icon: <FaCalculator className="text-teal-500" />,
  },
  {
    path: "/vatcalculator",
    name: "VAT Calculator",
    icon: <FaCalculator className="text-teal-500" />,
  },
  {
    path: "/electricitybill",
    name: "Electricity Bill Calculator",
    icon: <FaCalculator className="text-teal-500" />,
  },
  {
    path: "/testscorecalculator",
    name: "Test Score Calculator",
    icon: <FaCalculator className="text-teal-500" />,
  },
];

const converterTools = [
  {
    path: "/faren-to-celcius",
    name: "Fahrenheit to Celsius",
    icon: <FaFilePdf className="text-blue-500" />,
  },
  {
    path: "/second",
    name: "Second to Hour",
    icon: <FaFilePdf className="text-blue-500" />,
  },
  {
    path: "/hours",
    name: "Hour to Second",
    icon: <FaFilePdf className="text-blue-500" />,
  },
  {
    path: "/texttospeech",
    name: "Text To Speech",
    icon: <FaFilePdf className="text-blue-500" />,
  },
  {
    path: "/speechtotext",
    name: "Speech To Text",
    icon: <FaFilePdf className="text-blue-500" />,
  },
  {
    path: "/onlinevoiceRecorder",
    name: "Online Voice Recorder",
    icon: <FaFilePdf className="text-blue-500" />,
  },
  {
    path: "/onlinescreenRecorder",
    name: "Online Screen Recorder",
    icon: <FaFilePdf className="text-blue-500" />,
  },
  {
    path: "/onlinescreenshot",
    name: "Online Screenshot",
    icon: <FaFilePdf className="text-blue-500" />,
  },
  {
    path: "/onlinewebcamtest",
    name: "Online Webcam Test",
    icon: <FaFilePdf className="text-blue-500" />,
  },
  {
    path: "/calendar",
    name: "Calendar",
    icon: <FaFilePdf className="text-blue-500" />,
  },
  {
    path: "/clock",
    name: "Clock",
    icon: <FaFilePdf className="text-blue-500" />,
  },
  {
    path: "/stopwatch",
    name: "Stopwatch",
    icon: <FaFilePdf className="text-blue-500" />,
  },
  {
    path: "/timer",
    name: "Countdown Timer",
    icon: <FaFilePdf className="text-blue-500" />,
  },
  {
    path: "/alarm",
    name: "Alarm Clock",
    icon: <FaFilePdf className="text-blue-500" />,
  },
  {
    path: "/binarytodecimal",
    name: "Binary To Decimal",
    icon: <FaFilePdf className="text-blue-500" />,
  },
];

const miscTools = [
  {
    path: "/paypal",
    name: "Paypal Link Gen.",
    icon: <FaFilePdf className="text-pink-500" />,
  },
  {
    path: "/beautifier",
    name: "HTML Beautifier",
    icon: <FaFilePdf className="text-pink-500" />,
  },
  {
    path: "/resumebuild",
    name: "Resume Builder",
    icon: <FaFilePdf className="text-pink-500" />,
  },
  {
    path: "/linkchecker",
    name: "Website Link Checker",
    icon: <FaFilePdf className="text-pink-500" />,
  },
  {
    path: "/wordcounter",
    name: "Word Counter",
    icon: <FaFilePdf className="text-pink-500" />,
  },
  {
    path: "/trafficchecker",
    name: "Traffic Checker",
    icon: <FaFilePdf className="text-pink-500" />,
  },
];

const toolCategories = [
  { title: "PDF", tools: pdfTools },
  { title: "TODO", tools: todoTools },
  { title: "Calculator", tools: calculatorTools },
  { title: "Converter", tools: converterTools },
  { title: "Misc", tools: miscTools },
];

const NewTab = () => {
  const [viewType, setViewType] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [toolsUsed, setToolsUsed] = useState(0);

  useEffect(() => {
    const usedTools = JSON.parse(localStorage.getItem("usedTools") || "[]");
    setToolsUsed(usedTools.length);
  }, []);

  const handleToolUse = () => {
    setToolsUsed((prev) => prev + 1);
  };

  const filterTools = (tool) => {
    if (!searchTerm) return true;
    return tool.name.toLowerCase().includes(searchTerm.toLowerCase());
  };

  const renderListView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
      {toolCategories.map((category) => (
        <div key={category.title}>
          <h3 className="font-semibold text-lg text-neutral-600 text-left mb-4">
            {category.title.toUpperCase()}
          </h3>
          {category.tools.filter(filterTools).map((tool) => (
            <ButtonComponent
              key={tool.path}
              path={tool.path}
              name={tool.name}
              icon={tool.icon}
              onToolUse={handleToolUse}
            />
          ))}
        </div>
      ))}
    </div>
  );

  const renderGridView = () => (
    <div className="space-y-12">
      {toolCategories.map((category) => (
        <div key={category.title}>
          <h3 className="font-semibold text-xl text-gray-900 mb-6 pb-2 border-b">
            {category.title} Tools
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {category.tools.filter(filterTools).map((tool) => (
              <GridComponent
                key={tool.path}
                path={tool.path}
                name={tool.name}
                icon={tool.icon}
                onToolUse={handleToolUse}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white/[var(--widget-opacity)] w-[90vw] mx-auto rounded-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <Search
            placeholder="Search tools..."
            allowClear
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
            className="mr-4"
          />

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

        <div className="bg-white rounded-xl shadow-sm border p-6">
          {viewType === "list" ? renderListView() : renderGridView()}
        </div>
      </div>
    </div>
  );
};

export default NewTab;
