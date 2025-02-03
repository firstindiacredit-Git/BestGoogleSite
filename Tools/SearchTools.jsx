import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaBook, FaTools, FaUser } from "react-icons/fa";
import { useBooksContext } from "../context/BooksContext";
import axios from "axios";

// Tool categories and their items
export const toolsList = {
  PDF: [
    { name: "Image To PDF", path: "/imagetopdf" },
    { name: "Split PDF", path: "/splitpdf" },
    { name: "Compress PDF", path: "/compress" },
    { name: "Merge PDF", path: "/mergepdf" },
    { name: "Word To PDF", path: "/pdfconverter" },
    { name: "Search Excel", path: "/searchpdf" },
    { name: "Edit PDF", path: "/editpdf" },
    { name: "Extract Page", path: "/extractpages" },
    { name: "PDF Cropper", path: "/pdfcropper" },
    { name: "Add Page Number", path: "/addpagenum" },
    { name: "Protect PDF", path: "/protect" },
    { name: "Unlock PDF", path: "/unlockpdf" },
    { name: "PDF To Image", path: "/pdftoimage" },
    { name: "PDF To Word", path: "/pdftoword" },
  ],
  "Task Management": [
    { name: "Grocery List", path: "/grocery" },
    { name: "Email Checker", path: "/bulkemailchecker" },
    { name: "Email Sender", path: "/bulkemailsender" },
    { name: "Google Map Extractor", path: "/googlemap" },
    { name: "Card Validator", path: "/cardvalidation" },
    { name: "Card Generator", path: "/cardgenerator" },
    { name: "HTML Template Generator", path: "/templategenerator" },
    { name: "Phone Number Formatter", path: "/phonenumberformat" },
    { name: "Random Password Generator", path: "/randompassword" },
    { name: "LinkedIn Scraper", path: "/linkedinscraper" },
  ],
  Calculators: [
    { name: "Calculator", path: "/calculator" },
    { name: "Percentage Calculator", path: "/percentage" },
    { name: "BMI Calculator", path: "/bmi" },
    { name: "Scientific Calculator", path: "/scientific" },
    { name: "Compare Loan", path: "/compareloan" },
    { name: "Currency Converter", path: "/currencyconverter" },
    { name: "Fraction Calculator", path: "/fractioncalculator" },
    { name: "Average Calculator", path: "/averagecalculator" },
    { name: "LCM Calculator", path: "/lcm" },
    { name: "Age Calculator", path: "/agecalculator" },
    { name: "Date Difference Calculator", path: "/datediffcalculator" },
    { name: "Compound Interest Calculator", path: "/compoundintrest" },
    { name: "Simple Interest Calculator", path: "/simpleinterest" },
    { name: "Discount Calculator", path: "/discountcalculator" },
    { name: "GST Calculator", path: "/gstcalculator" },
    { name: "VAT Calculator", path: "/vatcalculator" },
    { name: "Electricity Bill Calculator", path: "/electricitybill" },
    { name: "Test Score Calculator", path: "/testscorecalculator" },
  ],
  Converters: [
    { name: "Fahrenheit to Celsius", path: "/faren-to-celcius" },
    { name: "Second to Hour", path: "/second" },
    { name: "Hour to Second", path: "/hours" },
    { name: "Text To Speech", path: "/texttospeech" },
    { name: "Speech To Text", path: "/speechtotext" },
    { name: "Online Voice Recorder", path: "/onlinevoiceRecorder" },
    { name: "Online Screen Recorder", path: "/onlinescreenRecorder" },
    { name: "Online Screenshot", path: "/onlinescreenshot" },
    { name: "Online Webcam Test", path: "/onlinewebcamtest" },
    { name: "Calendar", path: "/calendar" },
    { name: "Clock", path: "/clock" },
    { name: "Stopwatch", path: "/stopwatch" },
    { name: "Countdown Timer", path: "/timer" },
    { name: "Alarm Clock", path: "/alarm" },
    { name: "Binary To Decimal", path: "/binarytodecimal" },
  ],
  Miscellaneous: [
    { name: "PayPal Link Generator", path: "/paypal" },
    { name: "HTML Beautifier", path: "/beautifier" },
    { name: "Resume Builder", path: "/resumebuild" },
    { name: "Website Link Checker", path: "/linkchecker" },
    { name: "Word Counter", path: "/wordcounter" },
    { name: "Traffic Checker", path: "/trafficchecker" },
  ],
};

const SearchTools = ({ placeholder }) => {
  const navigate = useNavigate();
  const { books } = useBooksContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [users, setUsers] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch users for search
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `${process.env.REACT_APP_URL}/api/v3/client/getAll-clients`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if Ctrl+K or Cmd+K (for Mac) is pressed
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault(); // Prevent default browser behavior
        inputRef.current?.focus();
      }
      // Close search on Escape
      if (e.key === "Escape") {
        setShowSearchResults(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter tools, books, and users based on search query
  const getFilteredResults = () => {
    if (searchQuery.trim() === "") return [];

    // Filter tools
    const filteredTools = Object.entries(toolsList).flatMap(
      ([category, tools]) =>
        tools
          .filter(
            (tool) =>
              tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              category.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((tool) => ({
            ...tool,
            category,
            type: "tool",
            icon: <FaTools className="text-blue-500" />,
          }))
    );

    // Filter books
    const filteredBooks = books
      .filter((book) =>
        book.bookname.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((book) => ({
        name: book.bookname,
        path: "/book",
        category: "Books",
        type: "book",
        icon: <FaBook className="text-indigo-500" />,
        bookId: book._id,
      }));

    // Filter users
    const filteredUsers = users
      .filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((user) => ({
        name: user.name,
        path: "/users",
        category: "Users",
        type: "user",
        icon: <FaUser className="text-green-500" />,
        userId: user._id,
        email: user.email,
      }));

    // Combine and limit results
    return [...filteredUsers, ...filteredBooks, ...filteredTools].slice(0, 8);
  };

  const filteredResults = getFilteredResults();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSearchResults(true);
  };

  const handleResultSelect = (result) => {
    if (result.type === "user") {
      navigate("/users", { state: { searchQuery: result.name } });
    } else if (result.type === "book") {
      navigate("/book");
    } else {
      navigate(result.path);
    }
    setSearchQuery("");
    setShowSearchResults(false);
  };

  return (
    <div className="flex-1 max-w-3xl" ref={searchRef}>
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl blur-md opacity-0 group-hover:opacity-70 transition-all duration-300"></div>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowSearchResults(true)}
            placeholder={`${placeholder}`}
            className="w-full pl-12 pr-24 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm 
                     focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 
                     shadow-sm hover:shadow-md transition-all duration-300"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 flex items-center gap-2">
            <FaSearch className="w-4 h-4" />
          </div>

          {/* Enhanced Keyboard shortcut indicator */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5">
            
            <kbd
              className="hidden sm:inline-flex items-center justify-center h-6 min-w-[1.5rem] px-1.5
                         text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 
                         rounded shadow-sm"
            >
              Ctrl
            </kbd>
            <span className="hidden sm:inline text-gray-300">+</span>
            <kbd
              className="hidden sm:inline-flex items-center justify-center h-6 min-w-[1.5rem] px-1.5
                         text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 
                         rounded shadow-sm"
            >
              K
            </kbd>
          </div>
        </div>

        {/* Enhanced Search Results Dropdown */}
        {showSearchResults && filteredResults.length > 0 && (
          <div
            className="absolute mt-2 w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 
                        overflow-hidden z-50 transition-all duration-200 animate-slideDown"
          >
            <div className="max-h-[70vh] overflow-y-auto">
              {filteredResults.map((result, index) => (
                <button
                  key={result.path + (result.bookId || result.userId || "")}
                  onClick={() => handleResultSelect(result)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50/80 flex items-center gap-4 
                           transition-colors duration-150 ${
                             index !== filteredResults.length - 1
                               ? "border-b border-gray-100"
                               : ""
                           }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50">
                    {result.icon}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {result.name}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {result.category} {result.email && `• ${result.email}`}
                    </span>
                  </div>
                  <div className="ml-auto flex items-center">
                    <kbd
                      className="hidden sm:inline-flex items-center justify-center h-6 px-2 
                                text-xs font-medium text-gray-400 bg-gray-50 border border-gray-200 
                                rounded"
                    >
                      ↵
                    </kbd>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add this at the end of your CSS or in your global styles
const style = document.createElement("style");
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-slideDown {
    animation: slideDown 0.2s ease-out;
  }
`;
document.head.appendChild(style);

export default SearchTools;
