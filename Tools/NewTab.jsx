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
  FaTemperatureHigh,
  FaClock,
  FaMicrophone,
  FaStopwatch,
  FaRegCalendarAlt,
  FaKeyboard,
  FaImage,
  FaCamera,
  FaVolumeUp,
  FaExchangeAlt,
  FaPercent,
  FaBalanceScale,
  FaRuler,
  FaMoneyBillWave,
  FaDivide,
  FaEquals,
  FaSortNumericDown,
  FaBirthdayCake,
  FaCalendarAlt,
  FaChartLine,
  FaChartBar,
  FaTags,
  FaReceipt,
  FaBolt,
  FaClipboardCheck,
  FaHourglassHalf,
  FaRegClock,
  FaHourglassEnd,
  FaBell,
  FaShoppingCart,
  FaIdCard,
  FaKey,
} from "react-icons/fa";
import {
  AiFillFileText,
  AiOutlineMergeCells,
  AiOutlineNumber,
} from "react-icons/ai";
import { Input } from "antd";
import ButtonComponent from "./ButtonComponent";
import GridComponent from "./GridComponent";
import "./SearchTool.css";

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
  // {
  //   path: "/editpdf",
  //   name: "Edit PDF",
  //   icon: <FaEdit className="text-green-500" />,
  // },
  {
    path: "/extractpages",
    name: "Extract Page",
    icon: <FaStream className="text-blue-500" />,
  },
  {
    path: "/addpagenum",
    name: "Add Page No.",
    icon: <AiOutlineNumber className="text-blue-500" />,
  },
  // {
  //   path: "/protect",
  //   name: "Protect PDF",
  //   icon: <FaLock className="text-red-500" />,
  // },
  // {
  //   path: "/unlockpdf",
  //   name: "Unlock PDF",
  //   icon: <FaUnlockAlt className="text-green-500" />,
  // },
];

const todoTools = [
  {
    path: "/grocery",
    name: "Grocery List",
    icon: <FaShoppingCart className="text-yellow-500" />,
  },
  // {
  //   path: "/bulkemailchecker",
  //   name: "Email Checker",
  //   icon: <FaTasks className="text-yellow-500" />,
  // },
  // {
  //   path: "/bulkemailsender",
  //   name: "Email Sender",
  //   icon: <FaTasks className="text-yellow-500" />,
  // },
  // {
  //   path: "/googlemap",
  //   name: "Google Map Extractor",
  //   icon: <FaTasks className="text-yellow-500" />,
  // },
  {
    path: "/cardvalidation",
    name: "Card Validator",
    icon: <FaIdCard className="text-yellow-500" />,
  },
  // {
  //   path: "/cardgenerator",
  //   name: "Card Generator",
  //   icon: <FaTasks className="text-yellow-500" />,
  // },
  // {
  //   path: "/templategenerator",
  //   name: "HTML Template Generator",
  //   icon: <FaTasks className="text-yellow-500" />,
  // },
  // {
  //   path: "/phonenumberformat",
  //   name: "Phone Number Formatter",
  //   icon: <FaTasks className="text-yellow-500" />,
  // },
  {
    path: "/randompassword",
    name: "Random Password Gen.",
    icon: <FaKey className="text-yellow-500" />,
  },
  // {
  //   path: "/linkedinscraper",
  //   name: "LinkedIn Scraper",
  //   icon: <FaTasks className="text-yellow-500" />,
  // },
];

const calculatorTools = [
  // {
  //   path: "/calculator",
  //   name: "Calculator",
  //   icon: <FaCalculator className="text-indigo-500" />,
  // },
  {
    path: "/percentage",
    name: "Percentage Calculator",
    icon: <FaPercent className="text-indigo-500" />,
  },
  {
    path: "/bmi",
    name: "BMI Calculator",
    icon: <FaRuler className="text-indigo-500" />,
  },
  {
    path: "/compareloan",
    name: "Compare Loan",
    icon: <FaBalanceScale className="text-indigo-500" />,
  },
  {
    path: "/currencyconverter",
    name: "Currency Converter",
    icon: <FaMoneyBillWave className="text-indigo-500" />,
  },
  {
    path: "/fractioncalculator",
    name: "Fraction Calculator",
    icon: <FaDivide className="text-indigo-500" />,
  },
  {
    path: "/averagecalculator",
    name: "Average Calculator",
    icon: <FaEquals className="text-indigo-500" />,
  },
  {
    path: "/lcm",
    name: "LCM Calculator",
    icon: <FaSortNumericDown className="text-indigo-500" />,
  },
  {
    path: "/agecalculator",
    name: "Age Calculator",
    icon: <FaBirthdayCake className="text-indigo-500" />,
  },
  {
    path: "/datediffcalculator",
    name: "Date Difference Calculator",
    icon: <FaCalendarAlt className="text-indigo-500" />,
  },
  {
    path: "/compoundintrest",
    name: "Compound Interest Calculator",
    icon: <FaChartLine className="text-indigo-500" />,
  },
  {
    path: "/simpleinterest",
    name: "Simple Interest Calculator",
    icon: <FaChartBar className="text-indigo-500" />,
  },
  {
    path: "/discountcalculator",
    name: "Discount Calculator",
    icon: <FaTags className="text-indigo-500" />,
  },
  {
    path: "/gstcalculator",
    name: "GST Calculator",
    icon: <FaReceipt className="text-indigo-500" />,
  },
  {
    path: "/vatcalculator",
    name: "VAT Calculator",
    icon: <FaReceipt className="text-indigo-500" />,
  },
  {
    path: "/electricitybill",
    name: "Electricity Bill Calculator",
    icon: <FaBolt className="text-indigo-500" />,
  },
  {
    path: "/testscorecalculator",
    name: "Test Score Calculator",
    icon: <FaClipboardCheck className="text-indigo-500" />,
  },
];

const converterTools = [
  {
    path: "/faren-to-celcius",
    name: "Fahrenheit to Celsius",
    icon: <FaTemperatureHigh className="text-blue-500" />,
  },
  {
    path: "/second",
    name: "Second to Hour",
    icon: <FaHourglassHalf className="text-blue-500" />,
  },
  {
    path: "/hours",
    name: "Hour to Second",
    icon: <FaRegClock className="text-blue-500" />,
  },
  {
    path: "/texttospeech",
    name: "Text To Speech",
    icon: <FaVolumeUp className="text-blue-500" />,
  },
  {
    path: "/speechtotext",
    name: "Speech To Text",
    icon: <FaKeyboard className="text-blue-500" />,
  },
  {
    path: "/onlinevoiceRecorder",
    name: "Online Voice Recorder",
    icon: <FaMicrophone className="text-blue-500" />,
  },
  {
    path: "/onlinescreenRecorder",
    name: "Online Screen Recorder",
    icon: <FaCamera className="text-blue-500" />,
  },
  {
    path: "/onlinescreenshot",
    name: "Online Screenshot",
    icon: <FaImage className="text-blue-500" />,
  },
  {
    path: "/onlinewebcamtest",
    name: "Online Webcam Test",
    icon: <FaCamera className="text-blue-500" />,
  },
  {
    path: "/calendar",
    name: "Calendar",
    icon: <FaRegCalendarAlt className="text-blue-500" />,
  },
  {
    path: "/clock",
    name: "Clock",
    icon: <FaClock className="text-blue-500" />,
  },
  {
    path: "/stopwatch",
    name: "Stopwatch",
    icon: <FaStopwatch className="text-blue-500" />,
  },
  {
    path: "/timer",
    name: "Countdown Timer",
    icon: <FaHourglassEnd className="text-blue-500" />,
  },
  {
    path: "/alarm",
    name: "Alarm Clock",
    icon: <FaBell className="text-blue-500" />,
  },
  {
    path: "/binarytodecimal",
    name: "Binary To Decimal",
    icon: <FaExchangeAlt className="text-blue-500" />,
  },
];

const miscTools = [
  {
    path: "/paypal",
    name: "Paypal Link Gen.",
    icon: <img src="https://cdn-icons-png.flaticon.com/512/888/888870.png" alt="PayPal" style={{ width: 24, height: 24 }} />,
  },
  {
    path: "/beautifier",
    name: "HTML Beautifier",
    icon: <img src="https://icones.pro/wp-content/uploads/2021/05/icone-html-orange.png" alt="HTML Beautifier" style={{ width: 24, height: 24 }} />,
  },
  {
    path: "/resumebuild",
    name: "Resume Builder",
    icon: <img src="https://play-lh.googleusercontent.com/PtlEBHwhkBI_9wKu-PEtp0YRdalrzv0hz7TiZh7EC1V6r2TfyTt5NorliKbs133lIRA" alt="Resume Builder" style={{ width: 24, height: 24 }} />,
  },
  // {
  //   path: "/linkchecker",
  //   name: "Website Link Checker",
  //   icon: <FaFilePdf className="text-green-500" />,
  // },
  {
    path: "/wordcounter",
    name: "Word Counter",
    icon: <img src="https://play-lh.googleusercontent.com/DD8dMz1T78pg3qIVaaqY7E49unW3ko3hjEud1ialTRqp96TyC7D41oK0C-JACEdp3YoG" alt="Word Counter" style={{ width: 24, height: 24 }} />,
  },
  {
    path: "/trafficchecker",
    name: "Traffic Checker",
    icon: <img src="https://png.pngtree.com/png-vector/20220910/ourmid/pngtree-traffic-icon-flat-design-best-social-report-vector-png-image_22781930.png" alt="Traffic Checker" style={{ width: 26, height: 26 }} />,
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
  const [viewType, setViewType] = useState(() => {
    // Initialize from localStorage or default to "grid"
    return localStorage.getItem('viewType') || "list";
  });

  // Save viewType to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('viewType', viewType);
  }, [viewType]);

  const [searchTerm, setSearchTerm] = useState("");
  // State to track expanded categories for list view
  const [showAll, setShowAll] = useState(false);

  const filterTools = (tool) => {
    if (!searchTerm) return true;
    return tool.name.toLowerCase().includes(searchTerm.toLowerCase());
  };

  const handleSeeMore = () => {
    setShowAll((prev) => !prev);
  };

  const renderListView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 xl:grid-cols-5 gap-8">
      {toolCategories.map((category) => {
        const filteredTools = category.tools.filter(filterTools);
        const showTools = showAll ? filteredTools : filteredTools.slice(0, 5);
        return (
          <div key={category.title}>
            <h3 className="font-semibold text-lg dark:text-white text-neutral-600 text-left mb-4">
              {category.title.toUpperCase()}
            </h3>
            {showTools.map((tool) => (
              <ButtonComponent
                key={tool.path}
                path={tool.path}
                name={tool.name}
                icon={tool.icon}
              />
            ))}
          </div>
        );
      })}
      {/* Single See More/See Less button centered below all categories */}
      {toolCategories.some(category => category.tools.filter(filterTools).length > 5) && (
        <div className="col-span-full flex justify-center mt-4">
          <button
            className="px-6 py-2 bg-white text-black rounded-lg shadow hover:text-blue-500 focus:outline-none dark:bg-[#513a7a] dark:hover:bg-[#3a2656] dark:text-white transition-colors"
            onClick={handleSeeMore}
          >
            {showAll ? 'Show Less' : 'Show More'}
          </button>
        </div>
      )}
    </div>
  );

  const renderGridView = () => (
    <div className="space-y-8">
      {toolCategories.map((category) => (
        <div key={category.title}>
          <h3 className=" bg-white/[var(--widget-opacity)] backdrop-blur-sm dark:bg-[#513a7a]/[var(--widget-opacity)] p-4 font-semibold text-center dark:text-white text-2xl text-gray-900 mb-6 rounded-lg">
            {category.title} Tools
          </h3>
          <div className="grid grid-cols-5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {category.tools.filter(filterTools).map((tool) => (
              <GridComponent
                key={tool.path}
                path={tool.path}
                name={tool.name}
                icon={tool.icon}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen w-[90vw] mx-auto">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <Search
            placeholder="Search tools..."
            allowClear
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
            className="mr-4"
            id="Toolsearch"
          />

          <div className="bg-white dark:bg-[#513a7a] rounded-lg shadow-sm p-1 inline-flex">
            <button
              onClick={() => setViewType("grid")}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewType === "grid"
                  ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
              title="Grid View"
            >
              <FaTh size={15} />
            </button>
            <button
              onClick={() => setViewType("list")}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewType === "list"
                  ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
              title="List View"
            >
              <FaList size={15} />
            </button>
          </div>
        </div>

        <div>{viewType === "list" ? renderListView() : renderGridView()}</div>
      </div>
    </div>
  );
};

export default NewTab;