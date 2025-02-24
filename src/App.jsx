import React, { useState, createContext, useMemo, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Dropdown, Button, Modal, message } from "antd";
import {
  ReloadOutlined,
  DeleteOutlined,
  PlusOutlined,
  BgColorsOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import NotFound from "./components/NotFound.jsx";
import galleryupload from "../public/galleryupload.png";
import { AuthProvider } from "./hooks/AuthContext.jsx";
import Tool from "../Tools/Tool.jsx";
import SearchPage from "./components/SearchPage.jsx";
import Signin from "./components/Signup/signin.jsx";
import Privacy from "./components/Privacy.jsx";
import Terms from "./components/Terms.jsx";
import Second from "../Tools/Component/Second.jsx";
import ContactUs from "./components/ContactUs.jsx";

import Signup from "./components/Signup.jsx";
import NewSearchPage from "./components/NewSearchPage.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import Forgotpassword from "./components/Signup/Forgotpassword.jsx";
import AddLinks from "./components/Admin/AddLinks.jsx";
import Dashboard from "./components/Admin/Dashboard.jsx";
import AddBookmark from "./components/Admin/AddBookmark.jsx";
import Login from "./components/Admin/Login.jsx";
import Users from "./components/Admin/Users.jsx";
import PremiumPage from "./components/PremiumPage.jsx";
import PremiumForm from "./components/PremiumForm.jsx";
import Sidebar from "./components/Admin/Sidebar.jsx";
import LandingPage from "./components/LandingPage.jsx";
import AboutPage from "./components/AboutPage.jsx";
import PricingPage from "./components/PricingPage.jsx";
import FAQPage from "./components/FAQPage.jsx";
import AddBlog from "./components/Admin/AddBlog.jsx";
import Blog from "./components/Blog.jsx";
import BlogList from "./components/Admin/BlogList.jsx";
import BlogDetail from "./components/BlogDetail.jsx";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { auth } from "./firebase";
import Transactions from "./components/Admin/Transactions";

/*Tools */

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
import NetworkStatus from "./components/NetworkStatus";
import ToolOutlet from "./components/ToolOutlet";

// Context Menu Items configuratio
const menuItems = [
  {
    key: "group1",
    type: "group",
    label: "Page Actions",
    children: [
      {
        key: "refresh",
        label: "Refresh Page",
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
    label: "Background",
    children: [
      {
        key: "chBG",
        label: "Change Background",
        icon: <BgColorsOutlined />,
      },
      {
        key: "dlBG",
        label: "Remove Background",
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
    label: "Page Management",
    children: [
      {
        key: "addPage",
        label: "New Page",
        icon: <PlusOutlined />,
      },
      {
        key: "deletePage",
        label: "Delete Page",
        icon: <DeleteOutlined />,
        danger: true,
      },
    ],
  },
];

// Add these background collections at the top of the file
const backgroundCollections = {
  gradients: [
    {
      id: "g1",
      value: "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
      name: "Blue Ocean",
    },
    {
      id: "g2",
      value: "linear-gradient(to right, #43e97b 0%, #38f9d7 100%)",
      name: "Green Beach",
    },
    {
      id: "g3",
      value: "linear-gradient(to right, #fa709a 0%, #fee140 100%)",
      name: "Sunset Vibes",
    },
    {
      id: "g4",
      value: "linear-gradient(45deg, #85FFBD 0%, #FFFB7D 100%)",
      name: "Fresh Lime",
    },
    {
      id: "g5",
      value: "linear-gradient(to right, #8f41e9, #578aef)",
      name: "Purple Haze",
    },
  ],
  solidColors: [
    { id: "s1", value: "#1a1a2e", name: "Deep Dark" },
    { id: "s2", value: "#513a7a", name: "Royal Purple" },
    { id: "s3", value: "#2d3436", name: "Charcoal" },
    { id: "s4", value: "#2c3e50", name: "Midnight Blue" },
    { id: "s5", value: "#2f3640", name: "Dark Grey" },
  ],
  glassEffects: [
    { id: "gl1", value: "rgba(255, 255, 255, 0.1)", name: "Light Glass" },
    { id: "gl2", value: "rgba(81, 58, 122, 0.2)", name: "Purple Glass" },
    { id: "gl3", value: "rgba(0, 0, 0, 0.15)", name: "Dark Glass" },
    { id: "gl4", value: "rgba(72, 126, 176, 0.2)", name: "Blue Glass" },
    { id: "gl5", value: "rgba(46, 204, 113, 0.2)", name: "Green Glass" },
  ],
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
        url: "https://images.pexels.com/photos/1563256/pexels-photo-1563256.jpeg?auto=compress&cs=tinysrgb&w=1600",
        thumbnail:
          "https://images.pexels.com/photos/1563256/pexels-photo-1563256.jpeg?auto=compress&cs=tinysrgb&w=300",
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

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const createNewPage = () => {
    const pages = JSON.parse(localStorage.getItem("customPages") || "[]");
    const newPageNumber = pages.length + 1;
    const newPage = {
      id: Date.now(),
      name: `Page ${newPageNumber}`,
      widgets: [],
    };

    const updatedPages = [...pages, newPage];
    localStorage.setItem("customPages", JSON.stringify(updatedPages));
    navigate(`/NewSearchPage?pageId=${newPage.id}`);
  };

  const deletePage = () => {
    const urlParams = new URLSearchParams(location.search);
    const currentPageId = urlParams.get("pageId");

    if (!currentPageId) {
      message.error("Cannot delete the home page");
      return;
    }

    Modal.confirm({
      title: "Delete Page",
      content: "Are you sure you want to delete this page?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        const pages = JSON.parse(localStorage.getItem("customPages") || "[]");
        const updatedPages = pages.filter(
          (page) => page.id.toString() !== currentPageId
        );
        localStorage.setItem("customPages", JSON.stringify(updatedPages));
        navigate("/search");
      },
    });
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

  const menu = {
    items: menuItems,
    onClick: handleMenuClick,
    style: {
      width: "200px",
      padding: "4px 0",
    },
  };

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
              type={activeSection === "gradients" ? "primary" : "default"}
              onClick={() => setActiveSection("gradients")}
            >
              Gradients
            </Button>
            <Button
              type={activeSection === "solid" ? "primary" : "default"}
              onClick={() => setActiveSection("solid")}
            >
              Solid Colors
            </Button>
            <Button
              type={activeSection === "glass" ? "primary" : "default"}
              onClick={() => setActiveSection("glass")}
            >
              Glass Effects
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
        overlayStyle={{
          boxShadow:
            "0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)",
        }}
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

export const WidgetTransparencyContext = React.createContext();

// Add theme context and optimized theme handling
export const ThemeContext = createContext();

const SearchPageWrapper = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(false);
    };

    checkDefaultPage();
  }, [navigate]);

  return (
    <ContextMenuWrapper>
      <SearchPage />
    </ContextMenuWrapper>
  );
};

// App Component
const App = () => {
  const [widgetTransparent, setWidgetTransparent] = useState(() =>
    parseInt(localStorage.getItem("widgetTransparency") || "100")
  );

  // Initialize theme state from localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  // Memoize theme context value to prevent unnecessary re-renders
  const themeContextValue = useMemo(
    () => ({
      isDarkMode,
      toggleTheme: () => {
        setIsDarkMode((prev) => {
          const newMode = !prev;
          localStorage.setItem("theme", newMode ? "dark" : "light");
          return newMode;
        });
      },
    }),
    [isDarkMode]
  );

  // Apply theme changes with optimized performance
  useEffect(() => {
    // Use requestAnimationFrame to batch DOM updates
    requestAnimationFrame(() => {
      document.documentElement.classList.toggle("dark", isDarkMode);
      document.documentElement.classList.toggle("theme-transition", true);
      document.documentElement.classList.toggle("hardware-accelerated", true);
    });
  }, [isDarkMode]);

  // Memoize the context value
  const contextValue = useMemo(
    () => ({
      widgetTransparent,
      setWidgetTransparent,
    }),
    [widgetTransparent]
  );
  return (
    // <PayPalProvider>
    <ThemeContext.Provider value={themeContextValue}>
      <WidgetTransparencyContext.Provider value={contextValue}>
        <AuthProvider>
          {/* <SubscriptionProvider> */}
          <Router>
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
                <Route path="/bulkemailsender" element={<BulkEmailSender />} />
                <Route path="/googlemap" element={<GoogleMap />} />
                <Route path="/cardvalidation" element={<CardValidation />} />
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
                <Route path="/randompassword" element={<RandomPassword />} />
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
                <Route path="/linkedinscraper" element={<LinkedinScraper />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/clock" element={<Clock />} />
                <Route path="/stopwatch" element={<Stopwatch />} />
                <Route path="/timer" element={<Timer />} />
                <Route path="/alarm" element={<Alarm />} />
                <Route path="/binarytodecimal" element={<BinaryToDecimal />} />
                <Route path="/wordcounter" element={<WordCounter />} />
                <Route path="/compoundintrest" element={<CompoundIntrest />} />
                <Route path="/simpleinterest" element={<SimpleInterest />} />
                <Route
                  path="/discountcalculator"
                  element={<DiscountCalculator />}
                />
                <Route path="/gstcalculator" element={<GSTCalculator />} />
                <Route path="/vatcalculator" element={<VATCalculator />} />
                <Route path="/electricitybill" element={<ElectricityBill />} />
                <Route
                  path="/testscorecalculator"
                  element={<TestScoreCalculator />}
                />
                <Route path="/trafficchecker" element={<TrafficChecker />} />
                {/* <Route path="/signin" element={<Signin />} /> */}
                {/* <Route path="/signup" element={<Signup />} /> */}

                <Route
                  path="/profile"
                  element={
                    <ContextMenuWrapper>
                      <ProfilePage />
                    </ContextMenuWrapper>
                  }
                />

                <Route path="/tools" element={<Tool />} />
                <Route path="/second" element={<Second />} />
                <Route path="/forgot-password" element={<Forgotpassword />} />
                <Route path="/premium" element={<PremiumPage />} />
                <Route path="/premium-form" element={<PremiumForm />} />
              </Route>

              {/* Admin Routes with Sidebar Layout */}
              <Route path="/admin/login" element={<Login />} />
              <Route element={<Sidebar />}>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/transactions" element={<Transactions />} />
                <Route path="/admin/addblog" element={<AddBlog />} />
                <Route path="/admin/bloglist" element={<BlogList />} />
                <Route path="/admin/users" element={<Users />} />
                <Route path="/admin/AddBookmark" element={<AddBookmark />} />
                <Route path="/admin/addlinks" element={<AddLinks />} />
              </Route>
            </Routes>
          </Router>
          {/* </SubscriptionProvider> */}
        </AuthProvider>
        <NetworkStatus />
      </WidgetTransparencyContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;
