import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import  "../External";
import {
  FiSearch,
  FiLock,
  FiBook,
  FiEdit3,
  FiCheck,
  FiPlus,
  FiMinus,
  FiGithub,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiMenu,
  FiX,
  FiUserCheck,
  FiLink,
  FiBookmark,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import {
  FaChrome,
  FaChromecast,
  FaClock,
  FaExclamationCircle,
  FaHandSparkles,
  FaPizzaSlice,
  FaSearch,
  FaShieldVirus,
  FaUserLock,
} from "react-icons/fa";
import { FlashlightOnOutlined, Web, WebStories } from "@mui/icons-material";
import { Chrome, ChromeIcon } from "lucide-react";
import "./Landing.css";

const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 1 }}
      whileTap={{ scale: 0.98 }}
      className="p-4 rounded-2xl bg-white cursor-pointer backdrop-blur-lg border border-gray-200  transition-all group feature-card"
    >
      {/* Icon Container */}
      <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-50 to-gray-100 mb-4 group-hover:from-indigo-100 group-hover:to-indigo-50 transition-all">
        <Icon className="w-8 h-8 text-indigo-600 group-hover:text-indigo-700 transition-all" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-white transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 group-hover:text-white transition-colors">
        {description}
      </p>
    </motion.div>
  );
};

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const CountingNumber = ({ value, duration, suffix }) => {
    const [count, setCount] = useState(0);
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });

    useEffect(() => {
      if (inView) {
        let startTime;
        let animationFrame;

        const animate = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const progress = (timestamp - startTime) / (duration * 1000);

          if (progress < 1) {
            setCount(Math.floor(value * progress));
            animationFrame = requestAnimationFrame(animate);
          } else {
            setCount(value);
          }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
          if (animationFrame) {
            cancelAnimationFrame(animationFrame);
          }
        };
      }
    }, [inView, value, duration]);

    const formatNumber = (num) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
      }
      return num.toString();
    };

    return (
      <span ref={ref} className="tabular-nums">
        {formatNumber(count)}
        {suffix}
      </span>
    );
  };

  const StatCard = ({ stat, index }) => {
    const controls = useAnimation();
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });

    useEffect(() => {
      if (inView) {
        controls.start("visible");
      }
    }, [controls, inView]);

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={controls}
        variants={{
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.5,
              delay: index * 0.1,
            },
          },
        }}
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-100 rounded-sm group-hover:bg-indigo-200 transition-colors duration-300">
              {stat.icon}
            </div>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              className="absolute top-4 right-4 h-2 w-2 rounded-full "
            />
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
          >
            <p className="text-3xl font-bold text-gray-900 mb-2">
              <CountingNumber
                value={stat.value}
                duration={stat.duration}
                suffix={stat.suffix}
              />
            </p>
            <p className="text-sm text-gray-500">{stat.name}</p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </motion.div>
    );
  };

  const stats = [
    {
      id: 1,
      name: "Active Users",
      value: 10000,
      suffix: "+",
      duration: 2,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      id: 2,
      name: "Requests",
      value: 1000000,
      suffix: "+",
      duration: 2.5,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    {
      id: 3,
      name: "Data Processed",
      value: 500,
      suffix: "GB+",
      duration: 1.5,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
          />
        </svg>
      ),
    },
    {
      id: 4,
      name: "Customer Satisfaction",
      value: 99,
      suffix: "%",
      duration: 1,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-[200vh] relative">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 bg-white/20 backdrop-blur-md  border-b border-gray-200/50`}
      >
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between   h-16">
            {/* Logo */}
            <Link to="/" className="flex px-6 w-44 items-center space-x-2">
          
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="4rem"
                  fill="#6366f1"
                  viewBox="0 0 412.4 95.9"
                >
                  <defs> </defs>
                  <g id="Layer_2" data-name="Layer 2">
                    <g id="Layer_1-2" data-name="Layer 1">
                      <g id="Layer_2-2" data-name="Layer 2">
                        <g id="Layer_1-2-2" data-name="Layer 1-2">
                          <path
                            class="cls-1"
                            d="M40.8,9.3c-3.8,0-9-.8-12.9-4.9A48.89,48.89,0,0,1,47.8,0,47.39,47.39,0,0,1,66.1,3.6c-4.5.8-9,2-13.3,3.2-1.3.4-2.6.7-3.9,1.1a22.66,22.66,0,0,1-8.1,1.4Z"
                          />
                          <path
                            class="cls-1"
                            d="M47.9,0V.2A47.44,47.44,0,0,1,65.7,3.7c-4.4.8-8.7,2-12.9,3.2-1.3.4-2.6.7-3.9,1.1a28.91,28.91,0,0,1-8.1,1.2c-3.7,0-8.8-.8-12.6-4.7A47.52,47.52,0,0,1,47.9.2V0m0,0h0A48.33,48.33,0,0,0,27.7,4.4c3.3,3.5,8.1,5,13.1,5A29.07,29.07,0,0,0,49,8.2c5.8-1.6,11.7-3.5,17.7-4.4A48.58,48.58,0,0,0,47.9,0Z"
                          />
                          <path
                            class="cls-1"
                            d="M28.5,29.2c-8.8,0-15.5-2.4-20.7-7.3a48.68,48.68,0,0,1,11.1-12c6,5.3,13.9,7.7,24.9,7.7a168.12,168.12,0,0,0,18.5-1.4A169.86,169.86,0,0,1,81,14.8h1.6A48.67,48.67,0,0,1,86.1,19h-3c-7.4.3-15.8,2.5-24.7,4.8-10.1,2.7-20.5,5.4-29.9,5.4Z"
                          />
                          <path
                            class="cls-1"
                            d="M18.8,10.1c6,5.2,14,7.7,24.9,7.7a168.12,168.12,0,0,0,18.5-1.4A169.86,169.86,0,0,1,80.9,15h1.5c1.2,1.3,2.3,2.6,3.4,4H83c-7.4.3-15.8,2.5-24.7,4.8-10,2.6-20.4,5.3-29.8,5.3-8.7,0-15.4-2.3-20.6-7.2A51,51,0,0,1,18.8,10.1m.1-.3A48.21,48.21,0,0,0,7.7,22c5.8,5.5,13,7.4,20.9,7.4,17.6,0,38.6-9.4,54.5-10.1h3.3a53.25,53.25,0,0,0-3.8-4.5H81c-12.1,0-25.2,2.8-37.2,2.8-9.4-.1-18.1-1.8-24.9-7.8Z"
                          />
                          <path
                            class="cls-1"
                            d="M16.8,48.6A50,50,0,0,1,.1,45.8,46.76,46.76,0,0,1,2.3,33.5C6.6,37.8,13.2,40,22.5,40a129.51,129.51,0,0,0,17-1.5l.5-.1a137.92,137.92,0,0,0,21.1-6.1c9.4-3.2,19.1-6.5,28.9-6.8a16.27,16.27,0,0,1,1.1,2.3c-11.3,1.6-21.8,5.9-32,10a173.17,173.17,0,0,1-24.2,8.4,72.7,72.7,0,0,1-18.1,2.4Z"
                          />
                          <path
                            class="cls-1"
                            d="M90,25.6a20,20,0,0,1,1,2.1c-11.3,1.6-21.7,5.9-31.9,10C51.3,40.8,43.2,44,34.9,46a69.69,69.69,0,0,1-18.1,2.5A47,47,0,0,1,.2,45.7a48.71,48.71,0,0,1,2.1-12C6.7,38,13.3,40,22.5,40a129.51,129.51,0,0,0,17-1.5l.5-.1c7.2-1.3,14.3-3.7,21.2-6.1,9.3-3.1,19-6.3,28.8-6.7m.2-.3c-17.1.6-33,9.8-50.2,12.9a137,137,0,0,1-17.5,1.6c-7.8,0-15.3-1.5-20.2-6.6A45.88,45.88,0,0,0,0,45.9a48.3,48.3,0,0,0,16.8,2.9A71.26,71.26,0,0,0,35,46.3c19-4.5,36.3-15.5,56.4-18.4-.4-.9-.8-1.8-1.2-2.6Z"
                          />
                          <path
                            class="cls-1"
                            d="M17.2,66.1A46.12,46.12,0,0,1,2.8,63.9a56.07,56.07,0,0,1-2.4-10A65.88,65.88,0,0,0,21,57.3c23.8,0,46.5-12.9,66-25a16.18,16.18,0,0,1,5-2.7,53.44,53.44,0,0,1,1.8,5.2,72.53,72.53,0,0,0-11,3.2c-2,1.2-4,2.5-6,3.7C58.7,53.2,37.9,66.1,17.2,66.1Z"
                          />
                          <path
                            class="cls-1"
                            d="M92,29.8a42,42,0,0,1,1.7,5A71.35,71.35,0,0,0,82.8,38c-2,1.2-4,2.5-6,3.7C58.6,53.1,37.9,66,17.2,66A46,46,0,0,1,2.9,63.8,45.69,45.69,0,0,1,.6,54.1a64.7,64.7,0,0,0,20.5,3.3c23.8,0,46.6-12.9,66.1-25A17.16,17.16,0,0,1,92,29.8m.2-.3A17.19,17.19,0,0,0,87,32.2c-20.9,13-42.9,24.9-65.9,24.9A66.56,66.56,0,0,1,.3,53.7,46.65,46.65,0,0,0,2.7,64a45.19,45.19,0,0,0,14.5,2.2c23.1,0,45.9-15.8,65.8-28A61.24,61.24,0,0,1,94.1,35c-.6-1.9-1.2-3.7-1.9-5.5Z"
                          />
                          <path
                            class="cls-1"
                            d="M47.9,95.8a48.45,48.45,0,0,1-12.6-1.7c9.6-.2,17.3-3.5,22.8-9.8,2.8-3.3,5.7-6.9,8.4-10.3,8.8-11,17.9-22.3,29.1-29,.1,1.1.1,2.1.1,2.9a44.53,44.53,0,0,1-1.3,10.9C87,63,82.7,70.8,78,79.1c-1.9,3.4-3.9,7-6.1,10.2a47.73,47.73,0,0,1-24,6.5Z"
                          />
                          <path
                            class="cls-1"
                            d="M95.5,45.3a26.23,26.23,0,0,1,.1,2.7,43.73,43.73,0,0,1-1.3,10.8c-7.5,4.1-12,12.3-16.4,20.3-1.9,3.4-3.8,6.9-6,10.1a48.28,48.28,0,0,1-24,6.5,45.78,45.78,0,0,1-11.7-1.5c9.3-.4,16.7-3.7,22-9.8,2.8-3.3,5.7-6.9,8.4-10.3,8.7-10.9,17.8-22.2,28.9-28.8m.3-.5c-15,8.8-26,25.6-37.8,39.4C51.8,91.3,43.4,94,34.5,94A47.35,47.35,0,0,0,48,95.9h0a47.46,47.46,0,0,0,24.1-6.6C79.4,78.6,83.9,64.8,94.6,59a45.33,45.33,0,0,0,1.3-11c0-1.1-.1-2.1-.1-3.2Z"
                          />
                          <path
                            class="cls-1"
                            d="M25.3,90.1A47.84,47.84,0,0,1,6.6,72a66.26,66.26,0,0,0,15.7,2,53.25,53.25,0,0,0,27.8-7.6c3.4-2.4,6.7-4.8,10-7.2,11.4-8.4,22.2-16.4,34.7-20.6.2,1.2.4,2.5.6,4C78.7,51.7,62.5,63.7,45.9,79.2A41.71,41.71,0,0,1,25.3,90.1Z"
                          />
                          <path
                            class="cls-1"
                            d="M94.7,38.6c.2,1.1.4,2.4.6,3.8C78.6,51.5,62.4,63.5,45.8,79A40.22,40.22,0,0,1,25.3,89.9,47.26,47.26,0,0,1,6.8,72.1,63.63,63.63,0,0,0,22.2,74a52.76,52.76,0,0,0,27.9-7.7c3.4-2.4,6.7-4.8,10-7.2,11.4-8.3,22.1-16.2,34.6-20.5m.2-.3C78.6,43.8,64.9,55.9,50,66.2a52,52,0,0,1-27.7,7.6,66,66,0,0,1-15.9-2,48,48,0,0,0,19,18.4,41.39,41.39,0,0,0,20.7-11C61.4,64.8,77.6,52.3,95.6,42.5c-.2-1.4-.4-2.8-.7-4.2Z"
                          />
                          <path
                            class="cls-1"
                            d="M113.5,66.1V15.4h22.6c12.1,0,18.3,4.3,18.3,12.9a9.94,9.94,0,0,1-2.2,6.6,11.74,11.74,0,0,1-5.8,4l-.5.1.5.1a12.78,12.78,0,0,1,7.2,4.3,11.77,11.77,0,0,1,2.6,7.9c0,5-1.8,8.9-5.5,11.5-3.1,2.2-7.4,3.3-12.7,3.3ZM126.7,56h10.4a6.56,6.56,0,0,0,4.4-1.7,6.19,6.19,0,0,0,1.9-4.6,4.92,4.92,0,0,0-2.1-4.3,9,9,0,0,0-4.5-1.3h-10L126.7,56Zm-.1-20.3h9.5c4.1,0,6.1-1.8,6.1-5.2,0-3.1-2.1-4.7-6.1-4.7h-9.5Z"
                          />
                          <path
                            class="cls-1"
                            d="M136.2,15.6c12.1,0,18.2,4.3,18.2,12.8a9.51,9.51,0,0,1-2.2,6.5,11.56,11.56,0,0,1-5.8,3.9l-.9.3,1,.2a12.53,12.53,0,0,1,7.1,4.3,11.68,11.68,0,0,1,2.6,7.8c0,5-1.8,8.8-5.4,11.3-3.1,2.2-7.4,3.3-12.6,3.3H113.7V15.6h22.5m-9.7,20.2h9.6c4.1,0,6.2-1.8,6.2-5.4,0-3.2-2.1-4.9-6.2-4.9h-9.6V35.8m0,20.4H137a6.62,6.62,0,0,0,4.5-1.7,5.91,5.91,0,0,0,1.9-4.7,4.84,4.84,0,0,0-2.2-4.4,8.21,8.21,0,0,0-4.6-1.3H126.5V56.2m9.7-40.9H113.4V66.2h24.7c5.3,0,9.6-1.1,12.7-3.4,3.7-2.6,5.5-6.5,5.5-11.5a12.3,12.3,0,0,0-2.7-8,13,13,0,0,0-7.3-4.3,12,12,0,0,0,5.9-4,10.2,10.2,0,0,0,2.2-6.7c.2-8.6-6-13-18.2-13Zm-9.5,20.2V25.8h9.4c4,0,6,1.5,6,4.6q0,5.1-6,5.1Zm.1,20.4V44.3h9.9a7.58,7.58,0,0,1,4.4,1.3,4.64,4.64,0,0,1,2.1,4.2,5.88,5.88,0,0,1-1.8,4.5,6.46,6.46,0,0,1-4.4,1.6H126.8Z"
                          />
                          <path
                            class="cls-1"
                            d="M159.7,66.1V28.2h12.1v6.4l.2-.8a9.18,9.18,0,0,1,3.5-4.7,9.45,9.45,0,0,1,5.6-1.9h0a7.51,7.51,0,0,1,2.6.5V38.4a11.27,11.27,0,0,0-3.2-.5h-.3a7.56,7.56,0,0,0-6.3,3.3,12.59,12.59,0,0,0-2,7.3V66.2l-12.2-.1Z"
                          />
                          <path
                            class="cls-1"
                            d="M181.2,27.1v.2a6.37,6.37,0,0,1,2.4.4V38.2a15.67,15.67,0,0,0-3-.5h-.3a7.87,7.87,0,0,0-6.4,3.3,12.59,12.59,0,0,0-2,7.3V66h-12V28.3h11.8v7.1l.5-1.5a9,9,0,0,1,3.5-4.7,9.16,9.16,0,0,1,5.5-1.9v-.2m0,0h0a10.07,10.07,0,0,0-9.3,6.7V28.1H159.6V66.3h12.5V48.4a12.08,12.08,0,0,1,2-7.2,7.54,7.54,0,0,1,6.2-3.2h.3a12.76,12.76,0,0,1,3.3.6v-11a6.46,6.46,0,0,0-2.7-.5Z"
                          />
                          <path
                            class="cls-1"
                            d="M207.9,67.4h-.7c-5.9,0-10.8-1.9-14.5-5.6s-5.5-8.6-5.5-14.7,1.9-10.9,5.6-14.6,8.6-5.6,14.6-5.6,10.8,1.9,14.4,5.8,5.4,8.8,5.4,14.8a19.15,19.15,0,0,1-19.3,19.9ZM207,36.2a7.31,7.31,0,0,0-6.2,3.6,14.74,14.74,0,0,0-1.8,7.4,14.74,14.74,0,0,0,1.8,7.4,6.92,6.92,0,0,0,6.1,3.7h.1a7.46,7.46,0,0,0,5.8-2.7,9.09,9.09,0,0,0,2.3-6.3V45.2a9.33,9.33,0,0,0-2.3-6.2,7.26,7.26,0,0,0-5.7-2.7Z"
                          />
                          <path
                            class="cls-1"
                            d="M207.5,26.8v.3c5.9,0,10.7,1.9,14.2,5.7s5.4,8.8,5.4,14.7a19.37,19.37,0,0,1-5.6,14.2,19.13,19.13,0,0,1-13.6,5.5h-.7c-5.9,0-10.7-1.9-14.4-5.6S187.3,53,187.3,47s1.9-10.8,5.5-14.5,8.5-5.5,14.5-5.5l.2-.2M207,58.3h.2a7.25,7.25,0,0,0,5.8-2.8,9.43,9.43,0,0,0,2.4-6.4V45a9.59,9.59,0,0,0-2.3-6.3,7.25,7.25,0,0,0-5.8-2.8h-.4a7.35,7.35,0,0,0-6.3,3.6,14.12,14.12,0,0,0-1.8,7.5,14.49,14.49,0,0,0,1.8,7.4,7.3,7.3,0,0,0,6.4,3.9m.5-31.5c-6.1,0-11,1.9-14.7,5.6s-5.6,8.6-5.6,14.7,1.8,11,5.5,14.7,8.6,5.6,14.6,5.6h.7a19.31,19.31,0,0,0,19.5-20c0-6.1-1.8-11-5.4-14.9-3.8-3.8-8.6-5.7-14.6-5.7ZM207,58.1a6.87,6.87,0,0,1-6-3.6,15.47,15.47,0,0,1-1.8-7.3,13.78,13.78,0,0,1,1.8-7.4,7.05,7.05,0,0,1,6.1-3.5h.3A7.21,7.21,0,0,1,213,39a9.26,9.26,0,0,1,2.3,6.1v4.1a9.33,9.33,0,0,1-2.3,6.2,7.41,7.41,0,0,1-5.7,2.7H207Z"
                          />
                          <path
                            class="cls-1"
                            d="M239.7,66.1,228.5,28.2h12.7c1.1,4.4,2.2,8.9,3.4,13.3a64,64,0,0,1,2.1,13.7h.2a87.78,87.78,0,0,1,2.3-13.6c1.1-4.5,2.3-9,3.4-13.3H267l3.5,13.3a89.85,89.85,0,0,1,2.3,13.6h.2a70.77,70.77,0,0,1,2-13.7c1.2-4.4,2.3-8.8,3.4-13.3h12.8L280,66.1H265.8c-1.2-4.4-2.4-8.8-3.5-13.1a76.33,76.33,0,0,1-2.4-13.5l-.1-1.2-.1,1.2a102,102,0,0,1-2.5,13.4c-1.1,4.4-2.3,8.9-3.4,13.2Z"
                          />
                          <path
                            class="cls-1"
                            d="M241.1,28.3c1.1,4.4,2.2,8.8,3.4,13.2a64,64,0,0,1,2.1,13.7h.5a87.78,87.78,0,0,1,2.3-13.6c1.1-4.4,2.2-8.9,3.4-13.3h14.1l1.9,7.4,1.5,5.8a89.85,89.85,0,0,1,2.3,13.6h.5a70.77,70.77,0,0,1,2-13.7c1.2-4.4,2.3-8.8,3.4-13.2H291L280,66H266c-1.2-4.3-2.3-8.7-3.4-13a76.33,76.33,0,0,1-2.4-13.5L260,37l-.3,2.4a102,102,0,0,1-2.5,13.4c-1.1,4.4-2.2,8.8-3.4,13.1h-14L228.7,28.2l12.4.1m50.3-.2H278.3c-1.1,4.5-2.3,8.9-3.4,13.4a70.77,70.77,0,0,0-2,13.7,91.13,91.13,0,0,0-2.3-13.7c-1.2-4.5-2.3-9-3.5-13.4H252.6c-1.2,4.5-2.3,9-3.4,13.4a89.05,89.05,0,0,0-2.3,13.7,64,64,0,0,0-2.1-13.7c-1.2-4.4-2.3-8.9-3.4-13.4h-13l11.3,38.2H254c1.2-4.4,2.3-8.9,3.4-13.3a102,102,0,0,0,2.5-13.4,76.33,76.33,0,0,0,2.4,13.5c1.1,4.4,2.3,8.8,3.5,13.2h14.4l11.2-38.2Z"
                          />
                          <path
                            class="cls-1"
                            d="M310.9,67.5c-11.5,0-17.5-4.8-17.8-14.2h11.6a5.49,5.49,0,0,0,1.4,4.3c1.2,1.3,3.2,1.9,6,1.9,3.6,0,5.4-1.3,5.4-3.8,0-1.5-2-2.7-6.1-3.8-5.8-1.5-9.5-2.7-11-3.5-3.9-2-5.9-4.9-5.9-8.6,0-4.6,1.9-8,5.6-10.1,3-1.8,7.1-2.6,12-2.6,4.7,0,8.6,1,11.5,3.1a11.73,11.73,0,0,1,5.2,10H317.5v-.7a3.38,3.38,0,0,0-2.2-3.6,9.78,9.78,0,0,0-4.1-.9h-.5a8,8,0,0,0-3,.6,2.82,2.82,0,0,0-1.8,2.5c0,1.5,2,2.8,6.3,3.8,5.8,1.4,9.6,2.6,11.3,3.5,4,2.1,6.1,5.2,6.1,9.3a11.09,11.09,0,0,1-6.1,10.4,30.07,30.07,0,0,1-12.6,2.4Z"
                          />
                          <path
                            class="cls-1"
                            d="M312,27.1q7,0,11.4,3a11.3,11.3,0,0,1,5.1,9.8h-11v-.6a3.63,3.63,0,0,0-2.2-3.8,9.9,9.9,0,0,0-4.2-.9h-.4a7.31,7.31,0,0,0-3,.6,2.94,2.94,0,0,0-1.9,2.6c0,1.6,2.1,2.9,6.3,4,5.8,1.4,9.6,2.6,11.3,3.5,4,2.1,6,5.2,6,9.2a10.72,10.72,0,0,1-6,10.2c-3.2,1.7-7.3,2.6-12.4,2.6h-.1c-11.5,0-17.3-4.6-17.7-14h11.3a5.63,5.63,0,0,0,1.4,4.2c1.2,1.3,3.3,1.9,6.1,1.9,3.6,0,5.5-1.3,5.5-3.9,0-1.5-2-2.8-6.2-4-5.8-1.5-9.5-2.7-11-3.5-3.9-1.9-5.9-4.8-5.9-8.5a10.87,10.87,0,0,1,5.5-10A28,28,0,0,1,312,27.1m0-.3c-5,0-9.1.9-12.1,2.7-3.8,2.1-5.7,5.6-5.7,10.2q0,5.7,6,8.7c1.5.8,5.2,2,11.1,3.5,4,1.1,6,2.3,6,3.7,0,2.4-1.8,3.6-5.2,3.6-5,0-7.4-2.1-7.2-6.2H293c.3,9.7,6.3,14.5,17.9,14.5h.1c5.1,0,9.3-.9,12.5-2.6a11.06,11.06,0,0,0,6.2-10.5c0-4.1-2-7.2-6.1-9.4-1.7-.9-5.5-2-11.3-3.5-4.1-1-6.2-2.3-6.2-3.7a2.59,2.59,0,0,1,1.7-2.4,7.17,7.17,0,0,1,2.9-.6h.4a9.78,9.78,0,0,1,4.1.9,3.3,3.3,0,0,1,2.1,3.5V40h11.5a12.08,12.08,0,0,0-5.2-10.2,21.2,21.2,0,0,0-11.6-3Z"
                          />
                          <path
                            class="cls-1"
                            d="M351.4,67.2a19.14,19.14,0,0,1-14.1-5.5c-3.6-3.7-5.4-8.5-5.4-14.3a21.16,21.16,0,0,1,5.5-14.8c3.7-3.9,8.5-5.8,14.3-5.8h.7a17.11,17.11,0,0,1,13.4,6.4,22.32,22.32,0,0,1,4.9,14.9l-.1,2H343.7v.1a11.3,11.3,0,0,0,2.3,5.9,6.82,6.82,0,0,0,5.4,2.7h.3a7.71,7.71,0,0,0,4.2-1.3,5.54,5.54,0,0,0,2.4-3.4H370a16.68,16.68,0,0,1-6.8,9.8,20.78,20.78,0,0,1-11.4,3.3Zm-.1-31.9a6.61,6.61,0,0,0-5.1,2.3,8.51,8.51,0,0,0-2.3,5.4v.1h14.9V43a7.64,7.64,0,0,0-2.1-5.4,7.14,7.14,0,0,0-5.1-2.3Z"
                          />
                          <path
                            class="cls-1"
                            d="M352.4,26.9h0a16.92,16.92,0,0,1,13.3,6.4,22.06,22.06,0,0,1,4.9,14.8l-.1,1.9H343.6v.3a11.64,11.64,0,0,0,2.3,6,7.11,7.11,0,0,0,5.5,2.8h.3a8.32,8.32,0,0,0,4.3-1.3,6.12,6.12,0,0,0,2.5-3.4H370a16.29,16.29,0,0,1-6.7,9.5A20.69,20.69,0,0,1,352,67.2h-.6c-5.7,0-10.5-1.8-14-5.5S332,53.3,332,47.5a20.74,20.74,0,0,1,5.5-14.7A18.83,18.83,0,0,1,351.7,27h.1a1.27,1.27,0,0,1,.6-.1m-1.1,8.5v-.3a6.82,6.82,0,0,0-5.2,2.3,8.06,8.06,0,0,0-2.3,5.5v.3h15.1V43a7.88,7.88,0,0,0-2.1-5.5,6.82,6.82,0,0,0-5.2-2.3h-.2l-.1.2m1.1-8.8h-.7a19,19,0,0,0-14.4,5.9,20.87,20.87,0,0,0-5.6,14.9c0,5.9,1.8,10.7,5.5,14.4s8.4,5.6,14.2,5.6h.6A21.12,21.12,0,0,0,363.4,64a16.55,16.55,0,0,0,6.9-10h-12a6,6,0,0,1-2.4,3.4,7.65,7.65,0,0,1-4.1,1.3h-.3a6.49,6.49,0,0,1-5.3-2.7,10.42,10.42,0,0,1-2.2-5.9h26.9l.1-2.2A22.32,22.32,0,0,0,366.1,33a18.36,18.36,0,0,0-13.7-6.4Zm-1.1,8.8h.2a6.82,6.82,0,0,1,5,2.2,7.57,7.57,0,0,1,2.1,5.3H344a8,8,0,0,1,2.3-5.3,7,7,0,0,1,5-2.2Z"
                          />
                          <path
                            class="cls-1"
                            d="M375.8,79.5V69.8c3.5,0,5.5,0,6.2-.1,2.9-.5,4.3-1.7,4.3-3.7a6.47,6.47,0,0,0-.4-2L372.8,28.3h13c1.3,4.5,2.7,8.9,4,13.4a78.37,78.37,0,0,1,2.9,13.6h.2a64.72,64.72,0,0,1,2.5-13.7c1.3-4.4,2.7-8.9,4-13.3h12.8l-14,40.6c-1.7,4.8-3.7,7.9-6,9.2-1.8,1-5.6,1.5-11.2,1.5h-5.2Z"
                          />
                          <path
                            class="cls-1"
                            d="M385.7,28.3c1.3,4.4,2.7,8.9,4,13.3a78.37,78.37,0,0,1,2.9,13.6h.5a64.72,64.72,0,0,1,2.5-13.7c1.3-4.4,2.7-8.8,4-13.2h12.5l-14,40.4c-1.7,4.8-3.7,7.9-6,9.1-1.8,1-5.6,1.5-11.1,1.5h-5V69.9c3.5,0,5.4,0,6.1-.1,2.9-.5,4.4-1.8,4.4-3.8a7.79,7.79,0,0,0-.4-2.1l-13-35.5h12.6m26.7-.3h-13c-1.4,4.4-2.7,8.9-4.1,13.4a64.72,64.72,0,0,0-2.5,13.7,72.7,72.7,0,0,0-2.9-13.7c-1.4-4.5-2.7-9-4.1-13.4H372.6L385.8,64a4.48,4.48,0,0,1,.4,2q0,2.85-4.2,3.6c-.6.1-2.8.1-6.3.1v9.9h5.2c5.6,0,9.4-.5,11.3-1.5,2.4-1.3,4.4-4.3,6.1-9.2l14.1-40.8Z"
                          />
                        </g>
                      </g>
                    </g>
                  </g>
                </svg>
            
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {/* <Link to="#features" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-sm hover:bg-white/60">
                Features
              </Link> */}
              <Link
                to="/pricing"
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-sm hover:bg-white/60 link-hover"
              >
                Pricing
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-sm hover:bg-white/60"
              >
                About
              </Link>
              <Link
                to="/faq"
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-sm hover:bg-white/60"
              >
                FAQ
              </Link>
              {/* <Link to="#contact" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-sm hover:bg-white/60">
                Contact
              </Link> */}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 border border-indigo-500/50 flex items-center gap-2"
              >
                <Chrome />
                Add to Chrome
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-sm hover:bg-white/50 transition-colors shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transform hover:-translate-y-0.5"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <FiX className="w-6 h-6 text-gray-600" />
              ) : (
                <FiMenu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden backdrop-blur-lg bg-white/70 border-b border-indigo-500/50 shadow-lg shadow-indigo-500/10"
            >
              <div className="container mx-auto px-4 py-4 space-y-4">
                <Link
                  to="#features"
                  className="block text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Features
                </Link>
                <Link
                  to="#pricing"
                  className="block text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  to="#about"
                  className="block text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  About
                </Link>
                <Link
                  to="#contact"
                  className="block text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Contact
                </Link>
                <div className="pt-4 space-y-2">
                  <a
                    href="https://chrome.google.com/webstore"
                    target="_blank"
                    rel="noopener noref errer"
                    className="block w-full px-4 py-2 text-center bg-indigo-600 text-white font-medium rounded-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 border border-indigo-500 border-indigo-500/50 flex items-center justify-center gap-2"
                  >
                    <Chrome />
                    Add to Chrome
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white pt-20 pb-16 sm:pb-24">
        <div className="absolute inset-y-0 w-full h-full">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        </div>

        {/* Floating Icons */}
        <div className="absolute xl:block hidden inset-0 overflow-hidden">
          {/* Google Icon */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-28 left-[28%]  p-3 bg-white rounded-xl shadow-[0_0_15px_2px_rgba(99,102,241,0.2)] backdrop-blur-sm"
          >
            <ChromeIcon className="w-6 h-6 text-indigo-600" />
          </motion.div>

          {/* Search Icon */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-15, 5, -15] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute top-40 right-[20%] p-3 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl shadow-[0_0_15px_2px_rgba(99,102,241,0.2)] backdrop-blur-sm"
          >
            <FaSearch className="w-6 h-6 text-white" />
          </motion.div>

          {/* Search Icon */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-12, 8, -12] }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
            className="absolute top-72 left-[25%] p-3 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl shadow-[0_0_15px_2px_rgba(99,102,241,0.2)] backdrop-blur-sm"
            // className="absolute top-24 right-[15%] p-3 bg-white rounded-xl shadow-[0_0_15px_2px_rgba(99,102,241,0.2)] backdrop-blur-sm"
          >
            <FiLink className="w-6 h-6 text-white" />
          </motion.div>

          {/* Lock Icon */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-12, 8, -12] }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
            className="absolute top-72 right-[25%] p-3 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl shadow-[0_0_15px_2px_rgba(99,102,241,0.2)] backdrop-blur-sm"
            // className="absolute top-24 right-[15%] p-3 bg-white rounded-xl shadow-[0_0_15px_2px_rgba(99,102,241,0.2)] backdrop-blur-sm"
          >
            <FiUserCheck className="w-6 h-6 text-white" />
          </motion.div>
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-12, 8, -12] }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
            className="absolute top-48 left-[18%] p-3 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl shadow-[0_0_15px_2px_rgba(99,102,241,0.2)] backdrop-blur-sm"
            // className="absolute top-24 right-[15%] p-3 bg-white rounded-xl shadow-[0_0_15px_2px_rgba(99,102,241,0.2)] backdrop-blur-sm"
          >
            <FiBookmark className="w-6 h-6 text-white" />
          </motion.div>

          {/* Note Icon */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-10, 10, -10] }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute top-32 right-[30%] p-3 bg-white rounded-xl shadow-[0_0_15px_2px_rgba(99,102,241,0.2)] backdrop-blur-sm"
          >
            <FiBook className="w-6 h-6 text-indigo-600" />
          </motion.div>
        </div>

        <div className="container mx-auto px-4 pt-20  pb-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center z-20 mb-20">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tight"
            >
              Your Ultimate
              <br />
              <span className="wavy-underline mt-3 text-indigo-600  px-2 pb-2 rounded-sm">
                Browser Toolkit
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto"
            >
              All your digital needs in one place. Search, organize, and create
              with ease.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-4 mb-20"
            >
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 border border-indigo-500/50 flex items-center gap-3 button-hover gradient-hover"
              >
                <Chrome />
                Add to Chrome - It's Free
              </a>
              <button className="px-8 py-4 rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 font-semibold hover:bg-white/60 transition-all shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transform hover:-translate-y-0.5 border hover:border-indigo-500 border-indigo-500/20 button-hover">
                Learn More
              </button>
            </motion.div>

            {/* SearchPage Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative mx-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white/40 backdrop-blur-sm rounded-2xl transform hover:-skew-y-1" />

              <img
                src={"/DashBoardPreview.png"}
                style={{ borderRadius: "32px" }}
                className="block  border-indigo-500/50 relative  shadow-2xl overflow-hidden border  hover:-translate-y-1 scale-100 hover:scale-105 transition-all ring-1 ring-indigo-500/10"
                alt="Search Page"
              />

              <div className="absolute -top-8 -left-8 w-16 h-16 bg-indigo-500/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-purple-500/10 rounded-full blur-2xl" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-200/20 to-transparent" />

      {/* Features Grid */}
      <div id="features" className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={FiSearch}
            title="Smart Search"
            description="Advanced search capabilities powered by cutting-edge algorithms"
          />
          <FeatureCard
            icon={FiLock}
            title="Password Generator"
            description="Create unbreakable passwords with our secure generator"
          />
          <FeatureCard
            icon={FiBook}
            title="Digital Notebook"
            description="Organize your thoughts with our intuitive note-taking system"
          />
          <FeatureCard
            icon={FiEdit3}
            title="Spreadsheet Tools"
            description="Powerful spreadsheet features for data management"
          />
        </div>
      </div>

      {/* Divider Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-200/20 to-transparent" />

      {/* Problem Section */}
      <div className="  w-full mx-auto  px-4 py-20 bg-gradient-to-b from-transparent to-indigo-50/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-4xl  mx-auto text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            The Challenge Today's{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">
              Digital Generation
            </span>{" "}
            Faces
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            In today's fast-paced digital world, Gen Z struggles with
            information overload, scattered resources, and complex digital
            tools.
          </p>
        </motion.div>

        <div className=" container w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-white backdrop-blur-lg border border-gray-200/50 shadow-[0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all hover-card"
          >
            <div className="bg-gray-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <FaExclamationCircle className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              Information Overload
            </h3>
            <p className="text-gray-600">
              Overwhelmed by the sheer volume of digital content and tools
              available online.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-white backdrop-blur-lg border border-gray-200/50 shadow-[0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all hover-card"
          >
            <div className="bg-gray-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <FaClock className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              Time Wastage
            </h3>
            <p className="text-gray-600">
              Hours lost switching between different apps and platforms to
              accomplish tasks.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-white backdrop-blur-lg border border-gray-200/50 shadow-[0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all hover-card"
          >
            <div className="bg-gray-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <FaPizzaSlice className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              Fragmented Experience
            </h3>
            <p className="text-gray-600">
              Disconnected tools and platforms creating a disjointed digital
              experience.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Divider Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-200/20 to-transparent" />

      {/* Solution Section */}
      <div className="w-full mx-auto px-4 py-20 bg-gradient-to-b from-indigo-50/30 to-transparent">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Introducing Your{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">
              All-in-One Solution
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Best Google Site brings together everything you need in one seamless
            platform, designed specifically for the digital generation.
          </p>
        </motion.div>

        <div className="max-w-8xl container mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className=" w-full flex justify-between"
          >
            <div className="flex  max-w-xs flex-col items-start gap-4">
              <div className="p-2 bg-indigo-100 rounded-sm">
                <FaHandSparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Smart Integration
                </h3>
                <p className="text-gray-600">
                  All your favorite tools and services, unified in one
                  intelligent platform.
                </p>
              </div>
            </div>

            <div className="flex max-w-xs  flex-col items-start gap-4">
              <div className="p-2 bg-purple-100 rounded-sm">
                <FlashlightOnOutlined className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Lightning Fast
                </h3>
                <p className="text-gray-600">
                  Get things done quickly with our intuitive interface and
                  powerful features.
                </p>
              </div>
            </div>

            <div className="flex max-w-xs flex-col  items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-sm">
                <FaShieldVirus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Secure & Private
                </h3>
                <p className="text-gray-600">
                  Your data is protected with enterprise-grade security
                  measures.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="backdrop-blur-lg bg-white/30 border-y border-indigo-500/50">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <StatCard key={stat.id} stat={stat} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="backdrop-blur-lg bg-gradient-to-b from-indigo-200/30 to-transparent  border-y border-indigo-500/50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-md">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works best for you
            </p>
          </motion.div>
          <div className="flex justify-center gap-10">
            {[
              {
                title: "Free",
                price: "0",
                features: [
                  "Basic search features",
                  "Limited storage",
                  "Community support",
                  "Basic tools access",
                ],
                popular: false,
              },
              {
                title: "Pro",
                price: "04.99",
                features: [
                  "Advanced search",
                  "Unlimited storage",
                  "Priority support",
                  "All tools access",
                ],
                popular: true,
              },
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`backdrop-blur-lg pricing-card-hover ${
                  plan.popular
                    ? "bg-indigo-600/90 border-indigo-800/50 hover:border-indigo-800 border "
                    : "bg-white/30 border-indigo-500/50 hover:border-indigo-500 border"
                } rounded-2xl p-8 border ${
                  plan.popular
                    ? " border-indigo-500/50 hover:border-indigo-500 border"
                    : " border-indigo-500/50"
                } relative shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    plan.popular ? "text-white" : "text-gray-900"
                  }`}
                >
                  {plan.title}
                </h3>
                <div className="mb-6">
                  <span
                    className={`text-4xl font-bold ${
                      plan.popular ? "text-white" : "text-indigo-600"
                    }`}
                  >
                    ${plan.price}
                  </span>
                  <span
                    className={plan.popular ? "text-white/80" : "text-gray-600"}
                  >
                    {plan.popular ? "/Month" : "/Forever"}
                  </span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <FiCheck
                        className={
                          plan.popular ? "text-white" : "text-indigo-600"
                        }
                      />
                      <span
                        className={
                          plan.popular ? "text-white/80" : "text-gray-600"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                    plan.popular
                      ? "bg-white text-indigo-600 hover:bg-gray-100"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  } shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform  border border-indigo-500/50`}
                >
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-200/20 to-transparent" />

      {/* Testimonials Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-md">
            What Our Users Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real feedback from real users
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Chen",
              role: "Digital Creator",
              image: "https://i.pravatar.cc/150?img=5",
              content:
                "This platform has completely transformed how I manage my online presence. The tools are intuitive and powerful!",
            },
            {
              name: "Alex Johnson",
              role: "Entrepreneur",
              image: "https://i.pravatar.cc/150?img=8",
              content:
                "The all-in-one solution I've been looking for. Saves me hours every week and keeps everything organized.",
            },
            {
              name: "Maria Garcia",
              role: "Student",
              image: "https://i.pravatar.cc/150?img=3",
              content:
                "As a student, the free tier gives me all the tools I need. The password generator is a game-changer!",
            },
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="backdrop-blur-lg bg-white/30 p-6 rounded-2xl border border-indigo-500/50 shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transition-all"
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-600 italic">{testimonial.content}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Divider Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-200/20 to-transparent" />

      {/* FAQ Accordion */}
      <div className="backdrop-blur-lg bg-white/30 border-y border-indigo-500/50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-md">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our platform
            </p>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: "What makes your platform different?",
                answer:
                  "Our platform combines multiple essential tools in one place, offering a seamless experience for managing your digital life. With advanced features and regular updates, we ensure you have the best tools at your disposal.",
              },
              {
                question: "Is my data secure?",
                answer:
                  "Yes, we take security seriously. All data is encrypted and stored securely. We use industry-standard security protocols and regularly update our security measures.",
              },
              {
                question: "Can I upgrade or downgrade my plan?",
                answer:
                  "Absolutely! You can change your plan at any time. Changes will be reflected in your next billing cycle.",
              },
              {
                question: "Do you offer a free trial?",
                answer:
                  "Yes, you can try our platform for free with our Basic plan. No credit card required!",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="backdrop-blur-lg bg-white/50 rounded-xl border border-indigo-500/50 overflow-hidden shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center"
                >
                  <span className="font-semibold text-gray-900">
                    {faq.question}
                  </span>
                  {openFaq === index ? (
                    <FiMinus className="text-indigo-600" />
                  ) : (
                    <FiPlus className="text-indigo-600" />
                  )}
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-4"
                    >
                      <p className="text-gray-600">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-200/20 to-transparent" />

      {/* CTA Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-8"
            >
              Ready to Transform Your{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">
                Digital Experience?
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 mb-12"
            >
              Join thousands of users who have already enhanced their browsing
              experience with Best Google Site
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-6"
            >
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 border border-indigo-500/50 flex items-center gap-3 button-hover gradient-hover"
              >
                <Chrome />
                Add to Chrome - It's Free
              </a>
              <span className="text-sm text-gray-500">
                Works with all Chromium-based browsers
              </span>
            </motion.div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/30 to-transparent -z-10" />
          <div className="absolute -top-8 -right-8 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Footer */}
      <footer className="backdrop-blur-lg bg-gray-900/95 border-t border-white/10">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-">
              <h2 className="text-2xl font-bold text-white">BGS</h2>
              <p className="text-gray-400">
                Your ultimate Chrome extension for a more productive online
                experience.
              </p>
              <div className="flex gap-4 mt-3">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiTwitter className="w-6 h-6" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiGithub className="w-6 h-6" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiLinkedin className="w-6 h-6" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiInstagram className="w-6 h-6" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Product</h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                               
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">
                Resources
              </h3>
              <ul className="space-y-4">
                
                
                <li>
                  <a
                    href="/blog"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Blog
                  </a>
                </li>
               
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Company</h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About
                  </a>
                </li>
                
                <li>
                  <a
                    href="/contact"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
                
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400"> 2025 BGS. All rights reserved.</p>
              <div className="flex gap-8">
                <a
                  href="/Privacy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="/Terms"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
