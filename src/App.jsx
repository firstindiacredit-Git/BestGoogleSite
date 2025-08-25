import {
  useState,
  createContext,
  useEffect,
  lazy,
  Suspense,
  useRef,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Dropdown, Button, Modal, message, Input, notification } from "antd";
import {
  ReloadOutlined,
  DeleteOutlined,
  BgColorsOutlined,
  ClearOutlined,
  MessageOutlined,
  CloseOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { AuthProvider } from "./context/AuthContext.jsx";
import { DesignContextProvider } from "./context/DesignContext.jsx";
import AdminRoute from "./components/Admin/AdminRoute.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { CountryProvider } from "./context/CountryContext.jsx";
const galleryupload = "/galleryupload.png";
import { auth, db } from "./firebase";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import SearchPage from "./components/SearchPage.jsx";
import NewSearchPage from "./components/NewSearchPage.jsx";
import NetworkStatus from "./components/NetworkStatus";
import ToolOutlet from "./components/ToolOutlet";
import Login from "./components/Admin/Login.jsx";
import Sidebar from "./components/Admin/Sidebar.jsx";
import ShortcutTest from "./components/ShortcutTest";
import ChatbotAI from "./components/ChatbotAi";
import Userreview from "./components/Admin/Userreview.jsx";
import BalancesheetLogin from "./components/balancesheet/BalancesheetLogin.jsx"
import BalancesheetDashboard from "./components/balancesheet/BalancesheetDashboard.jsx";
import BalanceSheet from './components/balancesheet/BalanceSheet';
import ProfessionalSelection from "./components/ProfessionalSelection.jsx";
import { 
  getCustomPages, 
  createCustomPage, 
} from "./firebase/customPages";

// Lazy load non-critical components
const NotFound = lazy(() => import("./components/NotFound.jsx"));
const Tool = lazy(() => import("../Tools/Tool.jsx"));
const Privacy = lazy(() => import("./components/Privacy.jsx"));
const Terms = lazy(() => import("./components/Terms.jsx"));
const Second = lazy(() => import("../Tools/Component/Second.jsx"));
const ContactUs = lazy(() => import("./components/ContactUs.jsx"));
const ProfilePage = lazy(() => import("./components/ProfilePage.jsx"));
const Forgotpassword = lazy(() =>
  import("./components/Signup/Forgotpassword.jsx")
);
const AddLinks = lazy(() => import("./components/Admin/AddLinks.jsx"));
const Dashboard = lazy(() => import("./components/Admin/Dashboard.jsx"));
const AddBookmark = lazy(() => import("./components/Admin/AddBookmark.jsx"));
const AddSubcategory =lazy(() => import("./components/Admin/AddSubcategory.jsx"))
const Users = lazy(() => import("./components/Admin/Users.jsx"));
const AdminImages = lazy(() => import("./components/Admin/ImageAdminUpload.jsx"));
const BookmarkAnalytics = lazy(() => import("./components/Admin/BookmarkAnalytics.jsx"));  
const PremiumPage = lazy(() => import("./components/PremiumPage.jsx"));
const PremiumForm = lazy(() => import("./components/PremiumForm.jsx"));
const LandingPage = lazy(() => import("./components/LandingPage.jsx"));
const AboutPage = lazy(() => import("./components/AboutPage.jsx"));
const PricingPage = lazy(() => import("./components/PricingPage.jsx"));
const FAQPage = lazy(() => import("./components/FAQPage.jsx"));
const AddBlog = lazy(() => import("./components/Admin/AddBlog.jsx"));
const Blog = lazy(() => import("./components/Blog.jsx"));
const BlogList = lazy(() => import("./components/Admin/BlogList.jsx"));
const BlogDetail = lazy(() => import("./components/BlogDetail.jsx"));
const Transactions = lazy(() => import("./components/Admin/Transactions"));
const LinktreeProfile = lazy(() => import("./components/Linktree/LinktreeProfile"));

// Lazy load all Tool components
import Calculator from "../Tools/Component/Calculator.jsx";
import FarenToCelciusAndCelciusToFaren from "../Tools/Component/FarenToCelciusAndCelciusToFaren.jsx";
import Paypal from "../Tools/Component/Paypal.jsx";
import Beautifier from "../Tools/Component/Beautifier.jsx";

import ResumeBuild from "../Tools/Component/ResumeBuild.jsx";
import Grocery from "../Tools/Component/Grocery.jsx";
import Bmi from "../Tools/Component/Bmi.jsx";
import LinkChecker from "../Tools/Component/LinkChecker.jsx";
import Percentage from "../Tools/Component/Percentage.jsx";
import ImageToPdf from "../Tools/Component/ImageToPdf.jsx";
import SplitPdf from "../Tools/Component/SplitPdf.jsx";
import Hours from "../Tools/Component/Hours.jsx";
import Compress from "../Tools/Component/Compress.jsx";
import MergePDF from "../Tools/Component/MergePDF.jsx";
import PdfConverter from "../Tools/Component/PdfConverter.jsx";
import SearchPDF from "../Tools/Component/SearchPDF.jsx";
//import SearchExcelPdf from '../Tools/Component/SearchExcelPdf.jsx';
import Upload from "../Tools/Component/EditableImage/Upload.jsx";
import EditPdf from "../Tools/Component/EditPdf.jsx";
import ExtractPages from "../Tools/Component/ExtractPages.jsx";
import PdfCropper from "../Tools/Component/PdfCropper.jsx";
import AddPageNum from "../Tools/Component/AddPageNum.jsx";
import Protect from "../Tools/Component/Protect.jsx";
import UnlockPdf from "../Tools/Component/UnlockPdf.jsx";
import PdfToWord from "../Tools/Component/PdfToWord.jsx";
import Scientific from "../Tools/Component/Scientific.jsx";
import BulkEmailChecker from "../Tools/Component/BulkEmailChecker.jsx";
import BulkEmailSender from "../Tools/Component/BulkEmailSender.jsx";
import GoogleMap from "../Tools/Component/GoogleMap.jsx";
import CardValidation from "../Tools/Component/CardValidation.jsx";
import CardGenerator from "../Tools/Component/CardGenerator.jsx";
import TemplateGenerator from "../Tools/Component/TemplateGenerator.jsx";
import CompareLoan from "../Tools/Component/CompareLoan.jsx";
import CurrencyConverter from "../Tools/Component/CurrencyConverter.jsx";
import TextToSpeech from "../Tools/Component/TextToSpeech.jsx";
import SpeechToText from "../Tools/Component/SpeechToText.jsx";
import OnlineVoiceRecorder from "../Tools/Component/OnlineVoiceRecorder.jsx";
import OnlineScreenrecoder from "../Tools/Component/OnlineScreenrecoder.jsx";
import OnlineScreenshot from "../Tools/Component/OnlineScreenshot.jsx";
import OnlineWebcamTest from "../Tools/Component/OnlineWebcamTest.jsx";
import PhoneNumberFormat from "../Tools/Component/PhoneNumberFormat.jsx";
import RandomPassword from "../Tools/Component/RandomPassword.jsx";
import FractionCalculator from "../Tools/Component/FractionCalculator.jsx";
import AverageCalculator from "../Tools/Component/AverageCalculator.jsx";
import Lcm from "../Tools/Component/Lcm.jsx";
import AgeCalculator from "../Tools/Component/AgeCalculator.jsx";
import DateDiffCalculator from "../Tools/Component/DateDiffCalculator.jsx";
import LinkedinScraper from "../Tools/Component/LinkedinScraper.jsx";
import Calendar from "../Tools/Component/Calendar.jsx";
import Clock from "../Tools/Component/Clock.jsx";
import Stopwatch from "../Tools/Component/StopWatch.jsx";
import Timer from "../Tools/Component/Timer.jsx";
import Alarm from "../Tools/Component/Alarm.jsx";
import BinaryToDecimal from "../Tools/Component/BinaryToDecimal.jsx";
import WordCounter from "../Tools/Component/WordCounter.jsx";
import CompoundIntrest from "../Tools/Component/CompoundIntrest.jsx";
import SimpleInterest from "../Tools/Component/SimpleInterest.jsx";
import DiscountCalculator from "../Tools/Component/DiscountCalculator.jsx";
import GSTCalculator from "../Tools/Component/GSTCalculator.jsx";
import VATCalculator from "../Tools/Component/VATCalculator.jsx";
import ElectricityBill from "../Tools/Component/ElectricityBill.jsx";
import TestScoreCalculator from "../Tools/Component/TestScoreCalculator.jsx";
import TrafficChecker from "../Tools/Component/TrafficChecker.jsx";


// ... add lazy loading for the rest of the tool components ...

// Context Menu Items configuration (static part)
const menuItems = [
  {
    key: "group1",
    type: "group",
    label: <div className="dark:text-white/40">Page Actions</div>,
    children: [
      {
        key: "refresh",
        label: <div className="dark:text-white">Refresh Page</div>,
        icon: <ReloadOutlined />,
        shortcut: "Ctrl+R",
      },
    ],
  },
  {
    type: "divider",
  },
  {
    key: "group2",
    type: "group",
    label: <div className="dark:text-white/40">Background</div>,
    children: [
      {
        key: "chBG",
        label: <div className="dark:text-white">Change Background</div>,
        icon: <BgColorsOutlined />,
      },
      {
        key: "dlBG",
        label: <div className="dark:text-white">Remove Background</div>,
        icon: <ClearOutlined />,
      },
    ],
  },
  {
    type: "divider",
  },
  {
    key: "group4",
    type: "group",
    label: <div className="dark:text-white/40">Page Management</div>,
    children: [
      {
        key: "deletePage",
        label: <div className="dark:text-white ">Delete Page</div>,
        icon: <DeleteOutlined />,
        danger: true,
      },
    ],
  },
];

// Add these background collections at the top of the file
const backgroundCollections = {
  images: {
    nature: [
      {
        id: "n1",
        url: "https://images.pexels.com/photos/913215/pexels-photo-913215.jpeg",
        thumbnail:
          "https://images.pexels.com/photos/913215/pexels-photo-913215.jpeg?auto=compress&cs=tinysrgb&w=300",
        name: "Mountain Green",
      },
      {
        id: "n2",
        url: "https://images.pexels.com/photos/691668/pexels-photo-691668.jpeg?",
        thumbnail:
          "https://images.pexels.com/photos/691668/pexels-photo-691668.jpeg?auto=compress&cs=tinysrgb&w=300",
        name: "Cool Moutain",
      },
      {
        id: "n3",
        url: "https://images.pexels.com/photos/933054/pexels-photo-933054.jpeg",
        thumbnail:
          "https://images.pexels.com/photos/933054/pexels-photo-933054.jpeg?auto=compress&cs=tinysrgb&w=300",
        name: "Moody Range",
      },
      {
        id: "n4",
        url: "https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1600",
        thumbnail:
          "https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=300",
        name: "Mountain Peak",
      },
    ],
    abstract: [
      {
        id: "a1",
        url: "https://images.pexels.com/photos/2110951/pexels-photo-2110951.jpeg?auto=compress&cs=tinysrgb&w=1600",
        thumbnail:
          "https://images.pexels.com/photos/2110951/pexels-photo-2110951.jpeg?auto=compress&cs=tinysrgb&w=300",
        name: "Colorful Abstract",
      },
      {
        id: "a2",
        url: "https://images.pexels.com/photos/1484759/pexels-photo-1484759.jpeg?auto=compress&cs=tinysrgb&w=1600",
        thumbnail:
          "https://images.pexels.com/photos/1484759/pexels-photo-1484759.jpeg?auto=compress&cs=tinysrgb&w=300",
        name: "Geometric Pattern",
      },

      {
        id: "a4",
        url: "https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg?auto=compress&cs=tinysrgb&w=1600",
        thumbnail:
          "https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg?auto=compress&cs=tinysrgb&w=300",
        name: "Abstract Lights",
      },
    ],
    city: [
      {
        id: "c1",
        url: "https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=1600",
        thumbnail:
          "https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=300",
        name: "City Night",
      },
      {
        id: "c2",
        url: "https://images.pexels.com/photos/1434580/pexels-photo-1434580.jpeg?auto=compress&cs=tinysrgb&w=1600",
        thumbnail:
          "https://images.pexels.com/photos/1434580/pexels-photo-1434580.jpeg?auto=compress&cs=tinysrgb&w=300",
        name: "Urban Sunset",
      },
      {
        id: "c3",
        url: "https://s1.best-wallpaper.net/wallpaper/m/1201/Iron-Bridge-under-the-sun_m.webp?auto=compress&cs=tinysrgb&w=1600",
        thumbnail:
          "https://s1.best-wallpaper.net/wallpaper/m/1201/Iron-Bridge-under-the-sun_m.webp?auto=compress&cs=tinysrgb&w=1600",
        name: "City Lights",
      },
      {
        id: "c4",
        url: "https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=1600",
        thumbnail:
          "https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=300",
        name: "City Architecture",
      },
    ],
    space: [
      {
        id: "s1",
        url: "https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=1600",
        thumbnail:
          "https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=300",
        name: "Galaxy",
      },
      {
        id: "s2",
        url: "https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=1600",
        thumbnail:
          "https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=300",
        name: "Night Sky",
      },
      {
        id: "s3",
        url: "https://images.pexels.com/photos/1274260/pexels-photo-1274260.jpeg?auto=compress&cs=tinysrgb&w=1600",
        thumbnail:
          "https://images.pexels.com/photos/1274260/pexels-photo-1274260.jpeg?auto=compress&cs=tinysrgb&w=300",
        name: "Milky Way",
      },
      {
        id: "s4",
        url: "https://images.pexels.com/photos/816608/pexels-photo-816608.jpeg?auto=compress&cs=tinysrgb&w=1600",
        thumbnail:
          "https://images.pexels.com/photos/816608/pexels-photo-816608.jpeg?auto=compress&cs=tinysrgb&w=300",
        name: "Northern Lights",
      },
    ],
  },
};

// Context Menu Component
const ContextMenuWrapper = ({ children }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("images");
  const [selectedCategory, setSelectedCategory] = useState("nature");
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedText, setSelectedText] = useState("");

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const deletePage = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      message.error("Please sign in to delete pages");
      return;
    }

    Modal.confirm({
      title: "Delete Page",
      content: "Are you sure you want to delete this page?",
      onOk() {
        // Delete page logic here
      },
    });
  };

  const createNewPage = async () => {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      message.error("Please sign in to create pages");
      return;
    }

    try {
      const pages = await getCustomPages(currentUser.uid);
      const newPageNumber = pages.length + 1;
      const pageData = {
        name: `Page ${newPageNumber}`,
        widgets: [],
      };

      const newPage = await createCustomPage(currentUser.uid, pageData);
      navigate(`/NewSearchPage?pageId=${newPage.id}`);
    } catch (error) {
      console.error("Error creating page:", error);
      message.error("Failed to create page. Please try again.");
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          const maxDimension = 1920;
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, width, height);

          // Compress image to JPEG with quality 0.7
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(compressedDataUrl);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const compressedImage = await compressImage(file);

      try {
        localStorage.setItem("backgroundImage", compressedImage);
        localStorage.setItem("bgTransparency", "50");
        window.location.reload();
      } catch (error) {
        if (error.name === "QuotaExceededError") {
          message.error("Image is too large. Please try a smaller image.");
        } else {
          message.error("Failed to save image. Please try again.");
        }
      }
    } catch (error) {
      message.error("Failed to process image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuClick = ({ key }) => {
    if (key.startsWith("searchGoogle:")) {
      const query = key.replace("searchGoogle:", "");
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
      return;
    }
    switch (key) {
      case "refresh":
        window.location.reload();
        break;
      case "chBG":
        openModal();
        break;
      case "dlBG":
        localStorage.removeItem("backgroundImage");
        localStorage.setItem("bgTransparency", "100");
        window.location.reload();
        break;
      case "deletePage":
        deletePage();
        break;
      case "addPage":
        createNewPage();
        break;
      default:
        console.log(`Unhandled action: ${key}`);
    }
  };

  // Build menu items dynamically
  const dynamicMenuItems = [];
  if (selectedText) {
    dynamicMenuItems.push({
      key: `searchGoogle:${selectedText}`,
      label: (
        <div className="dark:text-white">
          Search Google for "{selectedText.length > 30 ? selectedText.slice(0, 30) + '...' : selectedText}"
        </div>
      ),
    });
    dynamicMenuItems.push({ type: "divider" });
  }
  // Merge dynamic and static menu items
  const menu = {
    items: [...dynamicMenuItems, ...menuItems],
    onClick: handleMenuClick,
    style: {
      width: "200px",
      padding: "1rem 4px",
    },
  };

  useEffect(() => {
    const handleContextMenu = () => {
      const text = window.getSelection ? window.getSelection().toString().trim() : "";
      setSelectedText(text);
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  return (
    <>
      <Modal
        title="Change Background"
        open={isModalVisible}
        onCancel={closeModal}
        width={800}
        footer={[
          <Button
            key="remove"
            onClick={() => {
              localStorage.removeItem("backgroundImage");
              localStorage.removeItem("backgroundType");
              localStorage.removeItem("backgroundColor");
              localStorage.setItem("bgTransparency", "100");
              closeModal();
              window.location.reload();
            }}
          >
            Remove Background
          </Button>,
          <Button key="cancel" onClick={closeModal}>
            Cancel
          </Button>,
        ]}
      >
        <div className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
          {/* Section Selector */}
          <div className="flex gap-2 border-b pb-4">
            <Button
              type={activeSection === "images" ? "primary" : "default"}
              onClick={() => setActiveSection("images")}
            >
              Image Gallery
            </Button>

            <Button
              type={activeSection === "custom" ? "primary" : "default"}
              onClick={() => setActiveSection("custom")}
            >
              Custom Upload
            </Button>
          </div>

          {/* Custom Upload Section */}
          {activeSection === "custom" && (
            <div className="pb-4">
              <h3 className="text-lg font-semibold mb-4">
                Custom Image Upload
              </h3>
              <div className="flex justify-center">
                <label
                  className="cursor-pointer text-center hover:opacity-80 transition-opacity"
                  htmlFor="background-upload"
                >
                  <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-lg">
                    <img
                      src={galleryupload}
                      alt="Upload"
                      className="h-16 w-16"
                    />
                    <span className="text-sm">Click to upload image</span>
                    {isLoading && (
                      <span className="text-sm text-gray-500">
                        Processing image...
                      </span>
                    )}
                  </div>
                </label>
                <input
                  id="background-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Image Gallery Section */}
          {activeSection === "images" && (
            <div className="pb-4">
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {Object.keys(backgroundCollections.images).map((category) => (
                  <Button
                    key={category}
                    type={selectedCategory === category ? "primary" : "default"}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {backgroundCollections.images[selectedCategory].map((image) => (
                  <div
                    key={image.id}
                    className="relative group cursor-pointer rounded-lg overflow-hidden"
                    onClick={() => {
                      localStorage.setItem("backgroundType", "image");
                      localStorage.setItem("backgroundImage", image.url);
                      window.location.reload();
                    }}
                  >
                    <img
                      src={image.thumbnail}
                      alt={image.name}
                      className="w-full h-40 object-cover transition-transform group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-end">
                      <div className="p-2 w-full bg-black bg-opacity-50 text-white text-sm">
                        {image.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gradients Section */}
          {activeSection === "gradients" && (
            <div className="pb-4">
              <h3 className="text-lg font-semibold mb-4">Gradients</h3>
              <div className="grid grid-cols-5 gap-3">
                {backgroundCollections.gradients.map((gradient) => (
                  <div
                    key={gradient.id}
                    onClick={() => {
                      localStorage.setItem("backgroundType", "gradient");
                      localStorage.setItem("backgroundColor", gradient.value);
                      window.location.reload();
                    }}
                    className="cursor-pointer rounded-lg h-20 transition-transform hover:scale-105"
                    style={{ background: gradient.value }}
                    title={gradient.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Solid Colors Section */}
          {activeSection === "solid" && (
            <div className="pb-4">
              <h3 className="text-lg font-semibold mb-4">Solid Colors</h3>
              <div className="grid grid-cols-5 gap-3">
                {backgroundCollections.solidColors.map((color) => (
                  <div
                    key={color.id}
                    onClick={() => {
                      localStorage.setItem("backgroundType", "solid");
                      localStorage.setItem("backgroundColor", color.value);
                      window.location.reload();
                    }}
                    className="cursor-pointer rounded-lg h-20 transition-transform hover:scale-105"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Glass Effects Section */}
          {activeSection === "glass" && (
            <div className="pb-4">
              <h3 className="text-lg font-semibold mb-4">Glass Effects</h3>
              <div className="grid grid-cols-5 gap-3">
                {backgroundCollections.glassEffects.map((effect) => (
                  <div
                    key={effect.id}
                    onClick={() => {
                      localStorage.setItem("backgroundType", "glass");
                      localStorage.setItem("backgroundColor", effect.value);
                      window.location.reload();
                    }}
                    className="cursor-pointer rounded-lg h-20 transition-transform hover:scale-105 backdrop-blur-md"
                    style={{
                      backgroundColor: effect.value,
                      backgroundImage:
                        'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M0 0h20L0 20z"/%3E%3C/g%3E%3C/svg%3E")',
                    }}
                    title={effect.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
      <Dropdown
        menu={menu}
        trigger={["contextMenu"]}
        overlayClassName="mt-1 [&_.ant-dropdown-menu]:p-0 [&_.ant-dropdown-menu-item]:p-0 [&_ul]:dark:bg-[#28283a]"
        // overlayStyle={{
        //   boxShadow:
        //     "0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)",
        // }}
      >
        <div
          className="w-full min-h-screen"
          style={{
            background:
              localStorage.getItem("backgroundType") === "gradient" ||
              localStorage.getItem("backgroundType") === "solid"
                ? localStorage.getItem("backgroundColor")
                : localStorage.getItem("backgroundType") === "glass"
                ? `${localStorage.getItem(
                    "backgroundColor"
                  )} url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M0 0h20L0 20z'/%3E%3C/g%3E%3C/svg%3E")`
                : `url(${localStorage.getItem("backgroundImage")})`,
            backgroundSize:
              localStorage.getItem("backgroundType") === "gradient" ||
              localStorage.getItem("backgroundType") === "solid" ||
              localStorage.getItem("backgroundType") === "glass"
                ? "cover"
                : "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backdropFilter:
              localStorage.getItem("backgroundType") === "glass"
                ? "blur(8px)"
                : "none",
          }}
        >
          {children}
        </div>
      </Dropdown>
    </>
  );
};

// Create context for widget transparency
export const WidgetTransparencyContext = createContext();

// SearchPageWrapper component
const SearchPageWrapper = () => {
  const navigate = useNavigate();
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    const checkDefaultPage = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().defaultPageId) {
            navigate(`/NewSearchPage?pageId=${userDoc.data().defaultPageId}`);
          }
        } catch (error) {
          console.error("Error checking default page:", error);
        }
      }
    };

    checkDefaultPage();
  }, [navigate]);
  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  return (
    <ContextMenuWrapper>
      {/* Floating Chatbot Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <div
          onClick={toggleChatbot}
          className="w-14 h-14 rounded-full bg-indigo-500 dark:bg-[#28283a] text-white flex items-center justify-center shadow-lg hover:bg-blue-600 cursor-pointer font-semibold transition-all duration-300 hover:scale-110 hover:-translate-y-2 active:scale-95"
          title="Chat with AI Assistant"
        >
          AI
        </div>
      </div>
      {/* Chatbot Modal */}
      {showChatbot && (
        <div className="fixed bottom-0 left-0 md:bottom-24 md:left-6 w-full md:w-[30vw] h-[80vh] md:h-[80vh] z-50 rounded-t-lg md:rounded-lg shadow-2xl overflow-hidden bg-white dark:bg-gray-800">
          {/* Chat header */}
          <div className="bg-indigo-500 dark:bg-[#28283a] text-white p-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-white rounded-full h-6 w-6 flex items-center justify-center mr-2">
                <MessageOutlined
                  style={{ fontSize: "16px", color: "#1890ff" }}
                />
              </div>
              <span className="font-medium">Grobo AI</span>
            </div>
            <div
              onClick={toggleChatbot}
              className="w-6 h-6 flex items-center justify-center hover:bg-blue-600 cursor-pointer"
            >
              <CloseOutlined style={{ fontSize: "14px" }} />
            </div>
          </div>

          {/* Chat content */}
          <div className="h-[calc(100%-48px)] bg-white dark:bg-gray-800">
            <ChatbotAI />
          </div>
        </div>
      )}
      <SearchPage />
    </ContextMenuWrapper>
  );
};

// App Component
const App = () => {
  const [widgetTransparent, setWidgetTransparent] = useState(100);

  // Floating Review Button State (global)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", gmail: "", description: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Handler for review form input changes
  const handleReviewInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for review form submission
  const handleReviewSubmit = async () => {
    setReviewSubmitting(true);
    try {
      // Save review to Firestore
      await addDoc(collection(db, "userReviews"), {
        ...reviewForm,
        submittedAt: new Date().toISOString(),
      });
    } catch (e) {
      // Optionally, show error notification
      notification.error({
        message: "Failed to submit review",
        description: "Please try again later.",
        placement: "topRight",
        duration: 3,
      });
      setReviewSubmitting(false);
      return;
    }
    setTimeout(() => {
      setReviewSubmitting(false);
      setIsReviewModalOpen(false);
      setReviewForm({ name: "", gmail: "", description: "" });
      notification.success({
        message: "Thank you for your review!",
        description: "Your feedback has been submitted.",
        placement: "topRight",
        duration: 3,
        icon: <SmileOutlined style={{ color: '#52c41a' }} />,
      });
    }, 800);
  };

  return (
    <>
      <WidgetTransparencyContext.Provider value={{ widgetTransparent, setWidgetTransparent }}>
        <CountryProvider>
          <ThemeProvider>
            <DesignContextProvider>
              <AuthProvider>
                <Router>
                  <Suspense>
                    {/* Chatbot Modal */}
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route path="/faq" element={<FAQPage />} />
                      <Route path="*" element={<NotFound />} />
                      <Route path="/search" element={<SearchPageWrapper />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/contact" element={<ContactUs />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:id" element={<BlogDetail />} />
                      <Route path="/linktree/:username" element={<LinktreeProfile />} />
                      <Route path="/admin/adminImages" element={<AdminImages />} />
                      <Route
                        path="/profile"
                        element={
                          <ContextMenuWrapper>
                            <ProfilePage />
                          </ContextMenuWrapper>
                        }
                      />

                      <Route path="/forgot-password" element={<Forgotpassword />} />
                      <Route path="/premium" element={<PremiumPage />} />
                      <Route path="/premium-form" element={<PremiumForm />} />
                      <Route path="/professional-selection" element={<ProfessionalSelection />} />

                      <Route
                        path="/NewSearchPage"
                        element={
                          <ContextMenuWrapper>
                            <NewSearchPage />
                          </ContextMenuWrapper>
                        }
                      />
                      <Route element={<ToolOutlet />}>
                        <Route path="/calculator" element={<Calculator />} />
                        <Route
                          path="/faren-to-celcius"
                          element={<FarenToCelciusAndCelciusToFaren />}
                        />
                        <Route path="/second" element={<Second />} />
                        <Route path="/hours" element={<Hours />} />
                        <Route path="/paypal" element={<Paypal />} />
                        <Route path="/beautifier" element={<Beautifier />} />
                        <Route path="/resumebuild" element={<ResumeBuild />} />
                        <Route path="/grocery" element={<Grocery />} />
                        <Route path="/bmi" element={<Bmi />} />
                        <Route path="/linkchecker" element={<LinkChecker />} />
                        <Route path="/percentage" element={<Percentage />} />
                        <Route path="/imagetopdf" element={<ImageToPdf />} />
                        <Route path="/splitpdf" element={<SplitPdf />} />
                        <Route path="/compress" element={<Compress />} />
                        <Route path="/mergepdf" element={<MergePDF />} />
                        <Route path="/pdfconverter" element={<PdfConverter />} />
                        <Route path="/searchpdf" element={<SearchPDF />} />
                        {/* <Route path="/searchexcelpdf" element={<SearchExcelPdf />} /> */}
                        <Route path="/upload" element={<Upload />} />
                        <Route path="/editpdf" element={<EditPdf />} />
                        <Route path="/extractpages" element={<ExtractPages />} />
                        <Route path="/pdfcropper" element={<PdfCropper />} />
                        <Route path="/addpagenum" element={<AddPageNum />} />
                        <Route path="/protect" element={<Protect />} />
                        <Route path="/unlockpdf" element={<UnlockPdf />} />
                        <Route path="/pdftoword" element={<PdfToWord />} />
                        <Route path="/scientific" element={<Scientific />} />
                        <Route
                          path="/bulkemailchecker"
                          element={<BulkEmailChecker />}
                        />
                        <Route
                          path="/bulkemailsender"
                          element={<BulkEmailSender />}
                        />
                        <Route path="/googlemap" element={<GoogleMap />} />
                        <Route
                          path="/cardvalidation"
                          element={<CardValidation />}
                        />
                        <Route path="/cardgenerator" element={<CardGenerator />} />
                        <Route
                          path="/templategenerator"
                          element={<TemplateGenerator />}
                        />
                        <Route path="/compareloan" element={<CompareLoan />} />
                        <Route
                          path="/currencyconverter"
                          element={<CurrencyConverter />}
                        />
                        <Route path="/texttospeech" element={<TextToSpeech />} />
                        <Route path="/speechtotext" element={<SpeechToText />} />
                        <Route
                          path="/onlinevoiceRecorder"
                          element={<OnlineVoiceRecorder />}
                        />
                        <Route
                          path="/onlinescreenRecorder"
                          element={<OnlineScreenrecoder />}
                        />
                        <Route
                          path="/onlinescreenshot"
                          element={<OnlineScreenshot />}
                        />
                        <Route
                          path="/onlinewebcamtest"
                          element={<OnlineWebcamTest />}
                        />
                        <Route
                          path="/phonenumberformat"
                          element={<PhoneNumberFormat />}
                        />
                        <Route
                          path="/randompassword"
                          element={<RandomPassword />}
                        />
                        <Route
                          path="/fractioncalculator"
                          element={<FractionCalculator />}
                        />
                        <Route
                          path="/averagecalculator"
                          element={<AverageCalculator />}
                        />
                        <Route path="/lcm" element={<Lcm />} />
                        <Route path="/agecalculator" element={<AgeCalculator />} />
                        <Route
                          path="/datediffcalculator"
                          element={<DateDiffCalculator />}
                        />
                        <Route
                          path="/linkedinscraper"
                          element={<LinkedinScraper />}
                        />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/clock" element={<Clock />} />
                        <Route path="/stopwatch" element={<Stopwatch />} />
                        <Route path="/timer" element={<Timer />} />
                        <Route path="/alarm" element={<Alarm />} />
                        <Route
                          path="/binarytodecimal"
                          element={<BinaryToDecimal />}
                        />
                        <Route path="/wordcounter" element={<WordCounter />} />
                        <Route
                          path="/compoundintrest"
                          element={<CompoundIntrest />}
                        />
                        <Route
                          path="/simpleinterest"
                          element={<SimpleInterest />}
                        />
                        <Route
                          path="/discountcalculator"
                          element={<DiscountCalculator />}
                        />
                        <Route path="/gstcalculator" element={<GSTCalculator />} />
                        <Route path="/vatcalculator" element={<VATCalculator />} />
                        <Route
                          path="/electricitybill"
                          element={<ElectricityBill />}
                        />
                        <Route path="/tools" element={<Tool />} />
                        <Route path="/second" element={<Second />} />
                        <Route
                          path="/testscorecalculator"
                          element={<TestScoreCalculator />}
                        />
                        <Route
                          path="/trafficchecker"
                          element={<TrafficChecker />}
                        />
                         <Route
                          path="/balancesheetlogin"
                          element={<BalancesheetLogin />}
                        />
                         <Route
                          path="/balancesheetdashboard"
                          element={<BalancesheetDashboard />}
                        />
                        <Route
                              path="/sheet/:id"
                              element={
              
                <BalanceSheet />
              
            }
          />
                      </Route>

                      {/* Admin Routes with Sidebar Layout */}
                      <Route
                        path="/admin/login"
                        element={<AdminRoute children={<Login />} />}
                      />

                      <Route element={<Sidebar />}>
                        <Route
                          path="/admin/dashboard"
                          element={<AdminRoute children={<Dashboard />} />}
                        />
                        <Route
                          path="/admin/transactions"
                          element={<AdminRoute children={<Transactions />} />}
                        />
                        <Route
                          path="/admin/addblog"
                          element={<AdminRoute children={<AddBlog />} />}
                        />
                        <Route
                          path="/admin/bloglist"
                          element={<AdminRoute children={<BlogList />} />}
                        />
                        <Route
                          path="/admin/users"
                          element={<AdminRoute children={<Users />} />}
                        />
                        <Route
                          path="/admin/AddBookmark"
                          element={<AdminRoute children={<AddBookmark />} />}
                        />
                        <Route
                          path="/admin/bookmark-analytics"
                          element={<AdminRoute children={<BookmarkAnalytics />} />}
                        />
                        <Route
                          path="/admin/addlinks"
                          element={<AdminRoute children={<AddLinks />} />}
                        />
                        <Route
                          path="/admin/Review"
                          element={<AdminRoute children={<Userreview />} />}
                        />
                         <Route
                        path="/admin/addsubcatbookmark"
                        element={<AdminRoute children={<AddSubcategory />} />}
                      />

                      </Route>

                      <Route path="/shortcut-test" element={<ShortcutTest />} />
                    </Routes>
                  </Suspense>
                  {/* Floating Review Button (global) */}
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    style={{
                      position: "fixed",
                      bottom: 90,
                      right: 20,
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: "#6366f1",
                      color: "#fff",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                      zIndex: 1100,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                      cursor: "pointer",
                    }}
                    title="Leave a Review"
                  >
                    <SmileOutlined />
                  </button>
                  <Modal
                    title={<div className="text-lg font-semibold">Leave a Review</div>}
                    open={isReviewModalOpen}
                    onCancel={() => setIsReviewModalOpen(false)}
                    onOk={handleReviewSubmit}
                    okText={reviewSubmitting ? "Submitting..." : "Submit"}
                    okButtonProps={{ loading: reviewSubmitting, disabled: reviewSubmitting }}
                    cancelButtonProps={{ disabled: reviewSubmitting }}
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                        <Input
                          name="name"
                          value={reviewForm.name}
                          onChange={handleReviewInputChange}
                          placeholder="Enter your name"
                          disabled={reviewSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gmail</label>
                        <Input
                          name="gmail"
                          value={reviewForm.gmail}
                          onChange={handleReviewInputChange}
                          placeholder="Enter your Gmail address"
                          type="email"
                          disabled={reviewSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <Input.TextArea
                          name="description"
                          value={reviewForm.description}
                          onChange={handleReviewInputChange}
                          placeholder="Write your review..."
                          rows={4}
                          disabled={reviewSubmitting}
                        />
                      </div>
                    </div>
                  </Modal>
                </Router>
                <NetworkStatus />
              </AuthProvider>
            </DesignContextProvider>
          </ThemeProvider>
        </CountryProvider>
      </WidgetTransparencyContext.Provider>
    </>
  );
};

export default App;

