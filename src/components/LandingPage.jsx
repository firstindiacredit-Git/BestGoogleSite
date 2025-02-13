import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search,
  Chrome,
  Command,
  Sparkles,
  Zap,
  Shield,
  BookOpen,
  Settings,
  Layout,
  Compass,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Modal, Button, Image } from "antd";

const SetHomepageButton = () => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [browser, setBrowser] = useState("");

  useEffect(() => {
    // Detect browser
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Chrome")) setBrowser("chrome");
    else if (userAgent.includes("Firefox")) setBrowser("firefox");
    else if (userAgent.includes("Safari")) setBrowser("safari");
    else if (userAgent.includes("Edge")) setBrowser("edge");
    else setBrowser("other");
  }, []);

  const handleSetHomepage = () => {
    const url = "https://AllMyTab.vercel.app/search";

    try {
      // Try the old-school way (works in some browsers)
      if (window.external && "AddSearchProvider" in window.external) {
        window.external.SetHomePage(url);
        message.success("Homepage set successfully!");
      } else {
        // Show browser-specific instructions
        setShowInstructions(true);
      }
    } catch (e) {
      setShowInstructions(true);
    }
  };

  const getBrowserInstructions = () => {
    switch (browser) {
      case "chrome":
        return (
          <>
            <p className="mb-2">To set AllMyTab as your homepage in Chrome:</p>
            <ol className="list-decimal pl-5">
              <li>Click the three dots in the top-right corner</li>
              <Image height={150} src={"STEP 1.png"} alt="chrome" />
              <li>Go to Settings</li>
              <Image height={150} src={"STEP 2.png"} alt="chrome" />
              <li>Click on "On startup" in the left menu</li>
              <Image height={150} src={"STEP 3.png"} alt="chrome" />
              <li>Select "Open a specific page" and Click "Add a new page"</li>
              <Image height={150} src={"STEP 4.png"} alt="chrome" />
              <li>Enter: {window.location.origin}</li>
              <Image height={150} src={"STEP 5.png"} alt="chrome" />
            </ol>
          </>
        );
      case "firefox":
        return (
          <>
            <p className="mb-2">To set AllMyTab as your homepage in Firefox:</p>
            <ol className="list-decimal pl-5">
              <li>Click the menu button (three lines) in the top-right</li>
              <li>Click Settings</li>
              <li>In the Home panel, click "Homepage and new windows"</li>
              <li>Select "Custom URLs..."</li>
              <li>Enter: {window.location.origin}</li>
            </ol>
          </>
        );
      case "edge":
        return (
          <>
            <p className="mb-2">To set AllMyTab as your homepage in Edge:</p>
            <ol className="list-decimal pl-5">
              <li>Click the three dots in the top-right corner</li>
              <li>Go to Settings</li>
              <li>Click on "On startup" in the left menu</li>
              <li>Select "Open a specific page or pages"</li>
              <li>Click "Add a new page"</li>
              <li>Enter: {window.location.origin}</li>
            </ol>
          </>
        );
      case "safari":
        return (
          <>
            <p className="mb-2">To set AllMyTab as your homepage in Safari:</p>
            <ol className="list-decimal pl-5">
              <li>Click Safari in the top menu</li>
              <li>Select Preferences</li>
              <li>Click the General tab</li>
              <li>Next to "Homepage", enter: {window.location.origin}</li>
            </ol>
          </>
        );
      default:
        return (
          <p>
            To set AllMyTab as your homepage, please check your browser's
            settings for homepage configuration and enter:{" "}
            {window.location.origin}
          </p>
        );
    }
  };

  return (
    <>
      <button
        onClick={handleSetHomepage}
        className="group relative flex items-center justify-center gap-2 border border-indigo-400  px-8 py-4  bg-white text-indigo-500 font-medium rounded-xl  transition-all duration-300 transform hover:scale-105 focus:outline-none"
      >
        <span className="relative">
          <svg
            className="w-5 h-5 mr-2 inline-block"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          set as default
        </span>
      </button>

      {/* Instructions Modal */}
      <Modal
        title={`Set AllMyTab as Your Homepage`}
        open={showInstructions}
        onCancel={() => setShowInstructions(false)}
        footer={[
          <Button key="close" onClick={() => setShowInstructions(false)}>
            Close
          </Button>,
        ]}
      >
        <div className="p-4 h-[60vh] overflow-y-scroll">
          {getBrowserInstructions()}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600">
              💡 Tip: Bookmark AllMyTab for quick access! Press{" "}
              {navigator.platform.includes("Mac") ? "⌘+D" : "Ctrl+D"} to
              bookmark this page.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

const TestimonialCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const containerRef = useRef(null);

  const testimonials = [
    {
      name: "Sinod Kumar",
      role: "Digital Content Creator",
      image:
        "https://crm.pizeonfly.com/employee/employeeImage-1732530813797-sino.jpeg",
      quote:
        "AllMyTab has completely transformed how I manage my online research.",
      rating: 5,
      company: "YouTube",
      accent: "from-pink-500 to-rose-500",
    },
    {
      name: "Pranjal Tiwari",
      role: "Software Engineer",
      image:
        "https://crm.pizeonfly.com/employee/employeeImage-1728980580983-IMG20241007191701.jpg",
      quote: "The command center and keyboard shortcuts are a game-changer.",
      rating: 5,
      company: "Google",
      accent: "from-blue-500 to-indigo-500",
    },
    {
      name: "Baluga Sir",
      role: "Student",
      image:
        "https://crm.pizeonfly.com/employee/employeeImage-1729521659076-images.jpg",
      quote: "The reading mode and tab management features are incredible.",
      rating: 5,
      company: "Harvard University",
      accent: "from-green-500 to-emerald-500",
    },
    {
      name: "Mohd Sharik",
      role: "Software Engineer",
      image:
        "https://crm.pizeonfly.com/employee/employeeImage-1738233144046-135040117-min.png",
      quote: "The interface is beautifully designed and intuitive.",
      rating: 5,
      company: "Apple",
      accent: "from-purple-500 to-violet-500",
    },
    {
      name: "Amit Kumar",
      role: "Prompt Engineer",
      image:
        "https://crm.pizeonfly.com/employee/employeeImage-1733120594825-IMG_2025-1.jpg",
      quote: "Very Good Product.",
      rating: 5,
      company: "ChatGpt",
      accent: "from-amber-500 to-amber-500",
    },
  ];

  useEffect(() => {
    let interval;
    if (isAutoplay) {
      interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoplay]);

  return (
    <div className="relative h-[280px] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
        </div>
      </div>

      {/* Testimonial Cards Container */}
      <div
        ref={containerRef}
        className="relative mb-1 h-full max-w-6xl mx-auto"
      >
        {testimonials.map((testimonial, index) => {
          const isActive = index === activeIndex;
          const position = index - activeIndex;

          return (
            <motion.div
              key={index}
              animate={{
                scale: isActive ? 1 : 0.8,
                opacity: isActive ? 1 : 0.5,
                x: `${position * 120}%`,
                zIndex: isActive ? 10 : 0,
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute  left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl"
              onClick={() => setActiveIndex(index)}
            >
              <div
                className={`
                relative p-1 rounded-2xl cursor-pointer
                bg-gradient-to-br ${testimonial.accent}
                transform transition-all duration-500
                ${isActive ? "hover:scale-95" : "hover:scale-95"}
              `}
              >
                <div className="relative bg-white p-6 rounded-xl">
                  {/* Profile Section */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-100">
                        <motion.img
                          whileHover={{ scale: 1.1 }}
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {testimonial.role}
                      </p>
                      <div className="flex items-center mt-1">
                        <span
                          className={`
                          text-xs px-2 py-1 rounded-full font-medium
                          bg-gradient-to-r ${testimonial.accent} text-white
                        `}
                        >
                          {testimonial.company}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="relative text-gray-700 text-lg italic">
                    <span className="absolute -top-2 -left-2 text-xl text-gray-200">
                      "
                    </span>
                    <p className="relative -mt-2 z-10 pl-1">
                      {testimonial.quote}
                    </p>
                    <span className="absolute -bottom-4 right-0 text-xl text-gray-200">
                      "
                    </span>
                  </blockquote>

                  {/* Rating */}
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`text-2xl bg-gradient-to-r ${testimonial.accent} bg-clip-text text-transparent`}
                      >
                        ★
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => setActiveIndex(index)}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${
                  index === activeIndex
                    ? "w-8 bg-indigo-600"
                    : "bg-gray-300 hover:bg-indigo-400"
                }
              `}
            />
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAutoplay(!isAutoplay)}
          className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors"
        >
          {isAutoplay ? (
            <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24">
              <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24">
              <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
            </svg>
          )}
        </motion.button>
      </div>
    </div>
  );
};

const CompanyLogos = () => (
  <div className="mt-16 text-center">
    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      className="text-gray-600 mb-8"
    >
      Trusted by users from leading companies
    </motion.p>
    <div className="flex flex-wrap justify-center items-center gap-8">
      {/* Google */}
      <svg
        className="h-8 text-gray-400"
        viewBox="0 0 272 92"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
        />
        <path
          fill="currentColor"
          d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
        />
        <path
          fill="currentColor"
          d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"
        />
        <path fill="currentColor" d="M225 3v65h-9.5V3h9.5z" />
        <path
          fill="currentColor"
          d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"
        />
        <path
          fill="currentColor"
          d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"
        />
      </svg>

      {/* Microsoft */}
      <svg
        className="h-8 text-gray-400"
        viewBox="0 0 23 23"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fill="currentColor" d="M0 0h11v11H0z" />
        <path fill="currentColor" d="M12 0h11v11H12z" />
        <path fill="currentColor" d="M0 12h11v11H0z" />
        <path fill="currentColor" d="M12 12h11v11H12z" />
      </svg>

      {/* Apple */}
      <svg
        className="h-8 text-gray-400"
        viewBox="0 0 16 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M13.623 7.816c-.062-5.516 4.495-8.163 4.7-8.293C16.59-1.304 14.22.02 13.86.077c-1.926.3-3.682 1.508-4.23 1.508-.587 0-2.156-1.44-4.018-1.399-1.862.04-3.724 1.235-4.644 2.91C-1.2 6.588.345 12.423 2.243 15.533c.947 1.508 2.156 3.257 3.804 3.177 1.508-.08 2.116-1.057 3.884-1.057 1.728 0 2.276 1.057 3.844 1.017 1.648-.04 2.656-1.607 3.684-3.095 1.188-1.827 1.648-3.614 1.688-3.694-.04-.02-3.242-1.368-3.282-5.317l-.242.252z"
        />
      </svg>

      {/* Meta */}
      <svg
        className="h-8 text-gray-400"
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm0 7.5c4.142 0 7.5 3.358 7.5 7.5v5h-5v-5c0-1.38-1.12-2.5-2.5-2.5s-2.5 1.12-2.5 2.5v5h-5v-5c0-4.142 3.358-7.5 7.5-7.5zm-7.5 15h15v10h-15v-10z"
        />
      </svg>

      {/* Amazon */}
      <svg
        className="h-8 text-gray-400"
        viewBox="0 0 448 512"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M257.2 162.7c-48.7 1.8-169.5 15.5-169.5 117.5 0 109.5 138.3 114 183.5 43.2 6.5 10.2 35.4 37.5 45.3 46.8l56.8-56S341 288.9 341 261.4V114.3C341 89 316.5 32 228.7 32 140.7 32 94 87 94 136.3l73.5 6.8c16.3-49.5 54.2-49.5 54.2-49.5 40.7-.1 35.5 29.8 35.5 69.1zm0 86.8c0 80-84.2 68-84.2 17.2 0-47.2 50.5-56.7 84.2-57.8v40.6zm136 163.5c-7.7 10-70 67-174.5 67S34.2 408.5 9.7 379c-6.8-7.7 1-11.3 5.5-8.3C88.5 415.2 203 488.5 387.7 401c7.5-3.7 13.3 2 5.5 12zm39.8 2.2c-6.5 15.8-16 26.8-21.2 31-5.5 4.5-9.5 2.7-6.5-3.8s19.3-46.5 12.7-55c-6.5-8.3-37-4.3-48-3.2-10.8 1-13 2-14-.3-2.3-5.7 21.7-15.5 37.5-17.5 15.7-1.8 41-.8 46 5.7 3.7 5.1 0 27.1-6.5 43.1z"
        />
      </svg>
    </div>
  </div>
);

const BrowserPreview = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [timer, setTimer] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);

  const previewImages = [
    "/prev (4).png",
    "/prev (1).png",
    "/prev (2).png",
    "/prev (3).png",
  ];

  const changeImage = (nextIndex) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(
        typeof nextIndex === "function"
          ? nextIndex(currentImageIndex)
          : nextIndex
      );
      setIsTransitioning(false);
      setProgress(0); // Reset progress when image changes
    }, 700);
  };

  useEffect(() => {
    let progressInterval;
    if (!isHovered) {
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            changeImage((prev) => (prev + 1) % previewImages.length);
            return 0;
          }
          return prev + 0.9; // Increment by 0.4 to complete in ~12 seconds
        });
      }, 50); // Update every 50ms for smooth animation
    }
    return () => clearInterval(progressInterval);
  }, [isHovered, currentImageIndex]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 }}
      className="mt-16 relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-2xl">
        {/* Browser Chrome UI */}
        <div className="h-10 bg-gray-100 flex items-center px-4 gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 ml-4">
            <div className="h-6 w-full max-w-md mx-auto bg-white rounded-md flex items-center px-3 text-sm text-gray-400">
              {window.location.origin}/search
            </div>
          </div>
        </div>

        {/* Images Container */}
        <div className="relative h-[490px]">
          {previewImages.map((img, index) => (
            <motion.div
              key={index}
              className="absolute inset-0 w-full h-[675px]"
              initial={{ opacity: 0 }}
              animate={{
                opacity: currentImageIndex === index ? 1 : 0,
                zIndex: currentImageIndex === index ? 1 : 0,
              }}
              transition={{
                duration: 1.2,
                ease: "easeInOut",
              }}
            >
              <motion.img
                src={img}
                alt={`AllMyTab Interface ${index + 1}`}
                className="w-full h-full object-scale-down object-top"
                animate={{
                  scale: 1,
                  filter:
                    currentImageIndex === index ? "blur(0px)" : "blur(2px)",
                }}
                transition={{ duration: 0.03, ease: "easeOut" }}
              />
            </motion.div>
          ))}

          {/* Custom Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200/50 z-10">
            <motion.div
              className="h-full bg-indigo-600"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.03 }}
            />
          </div>

          {/* Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
            {previewImages.map((_, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => !isTransitioning && changeImage(index)}
                className={`
                  w-2 h-2 rounded-full transition-all duration-500
                  ${
                    currentImageIndex === index
                      ? "w-8 bg-indigo-600"
                      : "bg-gray-300/50 hover:bg-indigo-400"
                  }
                  ${isTransitioning ? "cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {currentImageIndex === index && (
                  <motion.div
                    layoutId="activeDot"
                    className="w-full h-full bg-indigo-600 rounded-full"
                    transition={{ duration: 0.03 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Hover Overlay */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center z-30"
            >
              <div className="text-white text-center"></div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const grainStyle = {
  position: "fixed",
  top: "-50%",
  left: "-50%",
  right: "-50%",
  bottom: "-50%",
  width: "200%",
  height: "200vh",
  background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
  opacity: "0.15",
  pointerEvents: "none",
  zIndex: 1,
};

const LandingPage = () => {
  const FeatureCard = ({ icon: Icon, title, description }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
    >
      <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-indigo-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Grainy overlay */}
      <div style={grainStyle} />

      {/* Background gradient with blur */}
      <div className="fixed inset-0 bg-gradient-to-b from-indigo-50/50 via-white/80 to-purple-50/50 backdrop-blur-3xl -z-10" />

      {/* Content */}
      <div className="relative z-10">
        {/* Navbar with glass effect */}
        <nav className="fixed top-0 left-0 right-0 bg-white/60 backdrop-blur-lg border-b border-gray-200/20 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link
                  to="/"
                  className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  <img src="/LOGO.svg" alt="AllMyTab" className="w-28 h-28" />
                </Link>
              </div>

              <div className="hidden md:flex items-center space-x-8">
                <Link
                  to="/pricing"
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  About
                </Link>
                <Link
                  to="/search"
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Launch App
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section with modern gradient text */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 tracking-tight"
              >
                Your Browser, Elevated
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-600/90 mb-8 max-w-2xl mx-auto"
              >
                Experience the future of browsing with AllMyTab's powerful suite
                of tools
              </motion.p>

              {/* Modern call-to-action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center gap-4"
              >
                <Link
                  to="/search"
                  className="px-8 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  <Search className="w-5 h-5" />
                  Try Now
                </Link>
                <Link
                  to="/about"
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-900 rounded-xl hover:bg-white/90 transition-all border border-gray-200/50 shadow-lg shadow-purple-500/10"
                >
                  Learn More
                </Link>
              </motion.div>
            </div>

            {/* Add floating elements */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-yellow-300/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
            <div className="absolute bottom-1/2 left-1/2 w-64 h-64 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />

            {/* Browser Preview with glass effect */}
            <div className="mt-20 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl backdrop-blur-3xl" />
              <BrowserPreview />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything You Need
              </h2>
              <p className="text-xl text-gray-600">
                Powerful features to enhance your browsing experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={Command}
                title="Command Center"
                description="Access all tools and features with quick keyboard shortcuts"
              />
              <FeatureCard
                icon={Sparkles}
                title="Smart Search"
                description="Find anything instantly with our intelligent search engine"
              />
              <FeatureCard
                icon={Layout}
                title="Tab Management"
                description="Organize and manage your tabs efficiently"
              />
              <FeatureCard
                icon={BookOpen}
                title="Reading Mode"
                description="Distraction-free reading experience"
              />
              <FeatureCard
                icon={Shield}
                title="Privacy Focus"
                description="Your data stays private and secure"
              />
              <FeatureCard
                icon={Settings}
                title="Customizable"
                description="Personalize your browsing experience"
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600">
                Get started in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  icon: Chrome,
                  title: "1. Add to Chrome",
                  description: "Install AllMyTab from the Chrome Web Store",
                },
                {
                  icon: Compass,
                  title: "2. Set as Homepage",
                  description: "Make AllMyTab your default new tab page",
                },
                {
                  icon: Zap,
                  title: "3. Start Browsing",
                  description: "Enjoy a more productive browsing experience",
                },
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <step.icon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Client Testimonials */}
        <section className="py-20 ">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-indigo-600 font-semibold text-sm uppercase tracking-wider"
              >
                Testimonials
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-gray-900 mt-2 mb-4"
              >
                What Our Users Say
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-600"
              >
                Don't just take our word for it - hear from some of our
                satisfied users
              </motion.p>
            </div>

            <TestimonialCarousel />
            <CompanyLogos />
          </div>
        </section>

        {/* CTA Section */}
        {/* <section className="py-20 bg-indigo-600">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Browsing?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have already enhanced their Chrome
              experience
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white text-indigo-600 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <Chrome className="w-5 h-5" />
                Add to Chrome - It's Free
              </a>
              <Link
                to="/search"
                className="px-8 py-4 bg-indigo-500 text-white rounded-xl hover:bg-indigo-400 transition-all"
              >
                Try Demo
              </Link>
            </div>
          </div>
        </section> */}

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-12">
          <div className="max-w-7xl mx-auto justify-center text-center px-4">
            <p className="text-3xl mb-10 font-bold">AllMyTab</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 ">
              {/* Product Links */}
              <div>
                <h3 className="text-white font-semibold mb-4">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/features" className="hover:text-white">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link to="/pricing" className="hover:text-white">
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h3 className="text-white font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/about" className="hover:text-white">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link to="/blog" className="hover:text-white">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal Links */}
              <div>
                <h3 className="text-white font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/privacy" className="hover:text-white">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="hover:text-white">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-gray-800 mt-12 pt-8 flex justify-between items-center">
              <p>© 2024 AllMyTab. All rights reserved.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white">
                  Twitter
                </a>
                <a href="#" className="hover:text-white">
                  GitHub
                </a>
                <a href="#" className="hover:text-white">
                  Discord
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
