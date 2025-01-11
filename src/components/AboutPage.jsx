import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiLock, FiBook, FiEdit3, FiMenu, FiX, FiUserCheck, FiLink } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { FaChrome, FaClock, FaExclamationCircle, FaHandSparkles, FaPizzaSlice, FaSearch, FaShieldVirus } from 'react-icons/fa';
import { FlashlightOnOutlined } from '@mui/icons-material';
import { Chrome } from 'lucide-react';
import "./Landing.css";

const AboutPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen relative scroll-smooth bg-gradient-to-b from-indigo-50 via-white to-white">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/10"
      >
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/search" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
                BGS
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/search" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-lg hover:bg-white/60">
                Home
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-lg hover:bg-white/60">
                About
              </Link>
              <Link to="/pricing" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-lg hover:bg-white/60">
                Pricing
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <a 
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer" 
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 border border-indigo-500/50 flex items-center gap-2"
              >
                <Chrome />
                Add to Chrome
              </a>
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-200/10 transition-colors"
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
      </motion.header>

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
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-40 right-[20%] p-3 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl shadow-[0_0_15px_2px_rgba(99,102,241,0.2)] backdrop-blur-sm"
          >
            <FaSearch className="w-6 h-6 text-white" />
          </motion.div>

          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-8, 12, -8] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
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
              About{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">
                Best Google Site
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 mb-8"
            >
              Revolutionizing how Gen Z interacts with Google, one search at a time.
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
              Best Google Site emerged from a simple observation: the digital generation 
              needed a better way to interact with the world's most powerful search engine.
            </p>
            <p className="text-gray-600">
              We set out to create a Chrome extension that not only enhances the Google 
              experience but revolutionizes how Gen Z discovers and interacts with information online.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-indigo-50 rounded-2xl overflow-hidden shadow-lg"
          >
            <img 
              src="https://images.unsplash.com/photo-1522071820081-1dda9a6c1d86" 
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
            Our{' '}
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
              description: "Pushing the boundaries of search technology."
            },
            {
              icon: FiUserCheck,
              title: "User-Centric",
              description: "Every feature is designed with Gen Z in mind."
            },
            {
              icon: FaShieldVirus,
              title: "Security",
              description: "Your data privacy is our top priority."
            }
          ].map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-200/10"
            >
              <div className="bg-indigo-50 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                <value.icon className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Transform
            </span>
            {' '}Your Search?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of Gen Z users who have already enhanced their Google experience.
          </p>
          <a
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl"
          >
            Add to Chrome - It's Free!
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Best Google Site. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
