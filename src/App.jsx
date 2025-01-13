import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Dropdown, Menu, Button, Modal, message } from "antd";
import galleryupload from "../public/galleryupload.png";
import { AuthProvider } from "./hooks/AuthContext.jsx";
import SearchPage from "./components/SearchPage.jsx";
import AddList from "./components/Calculator.jsx";
import Signin from "./components/Signup/signin.jsx";
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
import PasswordGenerator from "./components/PasswordGenerater.jsx";
import PremiumForm from "./components/PremiumForm.jsx";
import Sidebar from "./components/Admin/Sidebar.jsx";
import LandingPage from "./components/LandingPage.jsx";
import AboutPage from "./components/AboutPage.jsx";
import PricingPage from "./components/PricingPage.jsx";
import FAQPage from "./components/FAQPage.jsx";

// Context Menu Items configuration
const menuItems = [
  {
    key: "group1",
    type: "group",
    children: [{ key: "refresh", label: "Refresh", shortcut: "Ctrl+R" }],
  },
  {
    key: "group2",
    type: "group",
    children: [
      { key: "chBG", label: "Change Background" },
      { key: "dlBG", label: "Delete Background" },
    ],
  },
  {
    key: "group4",
    type: "group",
    children: [
      { key: "deletePage", label: "Delete Page", shortcut: "Ctrl+Alt+D" },
      { key: "addPage", label: "New Page", shortcut: "Ctrl+Alt+N" },
    ],
  },
];

// Context Menu Component
const ContextMenuWrapper = ({ children }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
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

          const ctx = canvas.getContext('2d');
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, width, height);

          // Compress image to JPEG with quality 0.7
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
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
        window.location.reload();
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          message.error('Image is too large. Please try a smaller image.');
        } else {
          message.error('Failed to save image. Please try again.');
        }
      }
    } catch (error) {
      message.error('Failed to process image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const menu = (
    <Menu
    className="dark:text-white dark:bg-[#513a7a]"
      items={menuItems.flatMap((group) => [
        ...group.children.map((item) => ({
          key: item.key,
          label: (
            <div className="flex justify-between dark:text-white dark:bg-[#513a7a] items-center w-full">
              <span>{item.label}</span>
              {item.shortcut && (
                <span className="text-gray-500 dark:text-gray-100 ml-2">{item.shortcut}</span>
              )}
            </div>
          ),
        })),
        { type: "divider" },
      ])}

      onClick={({ key }) => {
        switch (key) {
          case "refresh":
            window.location.reload();
            break;
          case "chBG":
            openModal();
            break;
          case "dlBG":
            localStorage.removeItem("backgroundImage");
            window.location.reload();
            break;
          
          default:
            console.log(`Unhandled action: ${key}`);
        }
      }}
    />
  );

  return (
    <>

      <Modal
        title="Change Background"
        open={isModalVisible}
        onCancel={closeModal}
        footer={[
          <Button
            key="remove"
            danger
            onClick={() => {
              localStorage.removeItem("backgroundImage");
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
        <div className="flex flex-col items-center gap-4">
          <label
            className="cursor-pointer text-center"
            htmlFor="background-upload"
          >
            <div className="flex flex-col items-center gap-2">
              <img src={galleryupload} alt="Upload" className="h-16 w-16" />
              <span className="text-sm">Click to upload image</span>
              {isLoading && <span className="text-sm text-gray-500">Processing image...</span>}
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
      </Modal>
      <Dropdown  overlay={menu} trigger={["contextMenu"]}>
        <div className="w-full min-h-screen  ">{children}</div>
      </Dropdown>
    </>
  );
};

// App Component
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/search" element={<ContextMenuWrapper><SearchPage /></ContextMenuWrapper>} />
          <Route path="/calculator" element={<ContextMenuWrapper><AddList /></ContextMenuWrapper>} />
          <Route path="/newsearch" element={<ContextMenuWrapper><NewSearchPage /></ContextMenuWrapper>} />
          <Route path="/password-generator" element={<ContextMenuWrapper><PasswordGenerator /></ContextMenuWrapper>} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/forgot-password" element={<Forgotpassword />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/premium-form" element={<PremiumForm />} />

          {/* Admin Routes with Sidebar Layout */}
          <Route element={<Sidebar />}>
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/AddBookmark" element={<AddBookmark />} />
            <Route path="/admin/addlinks" element={<AddLinks />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
