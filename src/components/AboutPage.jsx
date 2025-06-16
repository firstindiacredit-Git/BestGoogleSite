import React from "react";
import { motion } from "framer-motion";
import { FiUserCheck, FiLink, FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import { FaChrome, FaSearch, FaShieldVirus } from "react-icons/fa";
import "./Landing.css";

const AboutPage = () => {
  return (
    <div className="min-h-screen relative scroll-smooth bg-gradient-to-b from-indigo-50 via-white to-white">
      {/* Header */}
      <nav className="fixed w-[55%] px-10 rounded-full left-0 right-0 top-5 mx-auto bg-white/60 backdrop-blur-lg border-b border-gray-200/20 z-50">
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
              className="px-4 py-2 bg-[#3C5DFF] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white pt-20 pb-16 sm:pb-24">
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Icons */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 left-[20%] p-3 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl shadow-[0_0_15px_2px_rgba(99,102,241,0.2)] backdrop-blur-sm"
          >
            <FaChrome className="w-6 h-6 text-white" />
          </motion.div>

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

          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-8, 12, -8] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute top-64 left-[25%] p-3 bg-white rounded-xl shadow-[0_0_15px_2px_rgba(99,102,241,0.2)] backdrop-blur-sm"
          >
            <FiLink className="w-6 h-6 text-indigo-600" />
          </motion.div>
        </div>

        <div className="container mx-auto px-4 pt-20 pb-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center z-20 mb-20">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-gray-900 mb-6"
            >
              About{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">
                AllMyTab
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 mb-8"
            >
              Revolutionizing how Gen Z interacts with Google, one search at a
              time.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-600 mb-4">
              AllMyTab emerged from a simple observation: the digital generation
              needed a better way to interact with the world's most powerful
              search engine.
            </p>
            <p className="text-gray-600">
              We set out to create a Chrome extension that not only enhances the
              Google experience but revolutionizes how Gen Z discovers and
              interacts with information online.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-indigo-50 rounded-2xl overflow-hidden shadow-lg"
          >
            <img
              src="/Company.jpg"
              alt="Team Working"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </div>

      {/* Values Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">
              Core Values
            </span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: FiSearch,
              title: "Innovation",
              description: "Pushing the boundaries of search technology.",
            },
            {
              icon: FiUserCheck,
              title: "User-Centric",
              description: "Every feature is designed with Gen Z in mind.",
            },
            {
              icon: FaShieldVirus,
              title: "Security",
              description: "Your data privacy is our top priority.",
            },
          ].map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white p-6 rounded-2xl hover:scale-105 transition-all border border-gray-200/50"
            >
              <div className="bg-indigo-50 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                <value.icon className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {value.title}
              </h3>
              <p className="text-gray-600">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Transform
            </span>{" "}
            Your Search?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of Gen Z users who have already enhanced their Google
            experience.
          </p>
          <a
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-sm hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl"
          >
            Add to Chrome - It's Free!
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-50/50">
        <div className="mx-auto w-full max-w-7xl p-4 lg:py-12">
          <div className="md:flex md:justify-between">
            <div className="mb-6 md:mb-0">
              <a href="https://allmytab.com/" className="flex items-center">
                <img src="/LOGO.svg" className="h-12 me-3" alt="AllMyTab Logo" />
              </a>
            </div>
            <div className="flex justify-between gap-10">
            <div>
                <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase">
                  Resources
                </h2>
                <ul className="text-gray-500 font-medium">
                  <li className="mb-4">
                    <a href="https://allmytab.com/blog" className="hover:underline">
                      Blog
                    </a>
                </li>
                <li>
                    <a href="https://allmytab.com/pricing" className="hover:underline">
                      Pricing
                    </a>
                </li>
              </ul>
            </div>
            <div>
                <h2 className="mb-6 text-sm font-semibold text-gray-900 text-center uppercase">
                  Legal
                </h2>
                <ul className="text-gray-500 font-medium">
                  <li className="mb-4">
                    <a href="#" className="hover:underline">
                      Privacy Policy
                    </a>
                </li>
                <li>
                    <a href="#" className="hover:underline">
                      Terms &amp; Conditions
                    </a>
                </li>
              </ul>
              </div>
            </div>
          </div>
          <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8" />
          <div className="sm:flex sm:items-center sm:justify-between">
            <span className="text-sm text-gray-500 sm:text-center">
              © {new Date().getFullYear()}{" "}
              <a href="https://allmytab.com/" className="hover:underline">
                ALLMYTAB
              </a>
              . All Rights Reserved.
            </span>
            <div className="flex mt-4 sm:justify-center sm:mt-0">
              <a href="#" className="text-gray-500 hover:text-gray-900">
                <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 8 19">
                  <path fillRule="evenodd" d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z" clipRule="evenodd" />
                </svg>
                <span className="sr-only">Facebook page</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 ms-5">
                <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 17">
                  <path fillRule="evenodd" d="M20 1.892a8.178 8.178 0 0 1-2.355.635 4.074 4.074 0 0 0 1.8-2.235 8.344 8.344 0 0 1-2.605.98A4.13 4.13 0 0 0 13.85 0a4.068 4.068 0 0 0-4.1 4.038 4 4 0 0 0 .105.919A11.705 11.705 0 0 1 1.4.734a4.006 4.006 0 0 0 1.268 5.392 4.165 4.165 0 0 1-1.859-.5v.05A4.057 4.057 0 0 0 4.1 9.635a4.19 4.19 0 0 1-1.856.07 4.108 4.108 0 0 0 3.831 2.807A8.36 8.36 0 0 1 0 14.184 11.732 11.732 0 0 0 6.291 16 11.502 11.502 0 0 0 17.964 4.5c0-.177 0-.35-.012-.523A8.143 8.143 0 0 0 20 1.892Z" clipRule="evenodd" />
                </svg>
                <span className="sr-only">Twitter page</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 ms-5">
                <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0a10 10 0 1 0 10 10A10.009 10.009 0 0 0 10 0Zm6.613 4.614a8.523 8.523 0 0 1 1.93 5.32 20.094 20.094 0 0 0-5.949-.274c-.059-.149-.122-.292-.184-.441a23.879 23.879 0 0 0-.566-1.239 11.41 11.41 0 0 0 4.769-3.366ZM8 1.707a8.821 8.821 0 0 1 2-.238 8.5 8.5 0 0 1 5.664 2.152 9.608 9.608 0 0 1-4.476 3.087A45.758 45.758 0 0 0 8 1.707ZM1.642 8.262a8.57 8.57 0 0 1 4.73-5.981A53.998 53.998 0 0 1 9.54 7.222a32.078 32.078 0 0 1-7.9 1.04h.002Zm2.01 7.46a8.51 8.51 0 0 1-2.2-5.707v-.262a31.64 31.64 0 0 0 8.777-1.219c.243.477.477.964.692 1.449-.114.032-.227.067-.336.1a13.569 13.569 0 0 0-6.942 5.636l.009.003ZM10 18.556a8.508 8.508 0 0 1-5.243-1.8 11.717 11.717 0 0 1 6.7-5.332.509.509 0 0 1 .055-.02 35.65 35.65 0 0 1 1.819 6.476 8.476 8.476 0 0 1-3.331.676Zm4.772-1.462A37.232 37.232 0 0 0 13.113 11a12.513 12.513 0 0 1 5.321.364 8.56 8.56 0 0 1-3.66 5.73h-.002Z" clipRule="evenodd" />
                </svg>
                <span className="sr-only">Dribbble account</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;