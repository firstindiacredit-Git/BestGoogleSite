import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Chrome } from "lucide-react";
import "./Landing.css";

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="border-b border-gray-200 last:border-0"
    >
      <button
        className="w-full py-6 flex items-center justify-between text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-xl font-semibold text-gray-900">{question}</h3>
        {isOpen ? (
          <FiChevronUp className="w-6 h-6 text-indigo-600" />
        ) : (
          <FiChevronDown className="w-6 h-6 text-gray-400" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-600">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const faqs = [
    {
      category: "General",
      questions: [
        {
          question: "What is Best Google Site (BGS)?",
          answer:
            "BGS is a Chrome extension designed specifically for Gen Z users to enhance their Google search experience with modern features, AI-powered suggestions, and a sleek interface.",
        },
        {
          question: "How do I install BGS?",
          answer:
            "Simply click the 'Add to Chrome' button at the top of the page, and follow the Chrome Web Store installation prompts. The extension will be ready to use immediately after installation.",
        },
        {
          question: "Is BGS free to use?",
          answer:
            "Yes! BGS offers a free tier with essential features. We also offer Pro and Enterprise plans for users who want access to advanced features and capabilities.",
        },
      ],
    },
    {
      category: "Features",
      questions: [
        {
          question: "What makes BGS different from regular Google?",
          answer:
            "BGS enhances Google with Gen Z-focused features like AI-powered suggestions, custom themes, advanced filters, and a modern interface designed for today's digital natives.",
        },
        {
          question: "Can I use BGS on multiple devices?",
          answer:
            "Yes! Pro and Enterprise users can sync their BGS settings and preferences across multiple devices. Free users are limited to one device.",
        },
        {
          question: "Does BGS work with other search engines?",
          answer:
            "Currently, BGS is designed specifically to enhance Google Search. We're exploring possibilities to support other search engines in the future.",
        },
      ],
    },
    {
      category: "Privacy & Security",
      questions: [
        {
          question: "Is my search data secure with BGS?",
          answer:
            "Absolutely! We take privacy seriously. BGS doesn't store your search history or personal data. All features work locally on your device or through secure, encrypted connections.",
        },
        {
          question: "Does BGS collect any user data?",
          answer:
            "We collect minimal anonymous usage data to improve our service. This never includes personal information or search queries. You can opt out of analytics in settings.",
        },
        {
          question: "How does BGS handle my privacy?",
          answer:
            "BGS follows strict privacy guidelines. We don't sell user data, don't track individual users, and all features are designed with privacy-first principles.",
        },
      ],
    },
    {
      category: "Account & Billing",
      questions: [
        {
          question: "How do I upgrade to Pro?",
          answer:
            "Visit our pricing page, select the Pro plan, and follow the simple checkout process. Your account will be upgraded instantly after payment.",
        },
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept all major credit cards, PayPal, and various cryptocurrency options for maximum flexibility.",
        },
        {
          question: "Can I cancel my subscription anytime?",
          answer:
            "Yes! You can cancel your subscription at any time. Your Pro features will remain active until the end of your billing period.",
        },
      ],
    },
    {
      category: "Support",
      questions: [
        {
          question: "How can I get help with BGS?",
          answer:
            "We offer multiple support channels: in-app help center, email support, and community forums. Pro users get priority support with faster response times.",
        },
        {
          question: "Do you offer refunds?",
          answer:
            "Yes, we offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team for a full refund.",
        },
        {
          question: "Is there a community forum?",
          answer:
            "Yes! We have an active community forum where users can share tips, ask questions, and connect with other BGS users.",
        },
      ],
    },
  ];

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
                AllMyTab
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-sm hover:bg-white/60"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-sm hover:bg-white/60"
              >
                About
              </Link>
              <Link
                to="/pricing"
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-sm hover:bg-white/60"
              >
                Pricing
              </Link>
            </div>

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

            <button
              className="md:hidden p-2 rounded-sm hover:bg-gray-200/10 transition-colors"
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
        <div className="container mx-auto px-4 pt-20 pb-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center z-20 mb-20">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-gray-900 mb-6"
            >
              Frequently Asked{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">
                Questions
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 mb-8"
            >
              Find answers to common questions about Best Google Site
            </motion.p>
          </div>
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="container mx-auto px-4 py-16">
        {faqs.map((category, index) => (
          <div key={index} className="mb-16 last:mb-0">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-gray-900 mb-8"
            >
              {category.category}
            </motion.h2>
            <div className="bg-white rounded-2xl shadow-lg border p-4 border-gray-200/10 divide-y divide-gray-200">
              {category.questions.map((faq, faqIndex) => (
                <FAQItem
                  key={faqIndex}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Still Have Questions Section */}
      <div className="bg-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Still Have{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Questions
            </span>
            ?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to
            help.
          </p>
          <a
            href="mailto:support@bestgooglesite.com"
            className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-sm hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
          >
            Contact Support
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 AllMyTab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default FAQPage;
