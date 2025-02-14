import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiMenu, FiX, FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Chrome } from "lucide-react";
import { FiTwitter, FiInstagram, FiLinkedin, FiGithub } from "react-icons/fi";
import "./Landing.css";

const PricingCard = ({ plan, popular }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className={`p-8 rounded-2xl ${
      popular
        ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white"
        : "bg-white"
    } shadow-xl`}
  >
    <h3
      className={`text-2xl font-bold mb-4 ${
        popular ? "text-white" : "text-gray-900"
      }`}
    >
      {plan.title}
    </h3>
    <div className="flex items-baseline mb-8">
      <span
        className={`text-4xl font-bold ${
          popular ? "text-white" : "text-indigo-600"
        }`}
      >
        ${plan.price}
      </span>
      <span className={popular ? "text-white/80" : "text-gray-600"}>
        {plan.popular ? "/Month" : "/Forever"}
      </span>
    </div>
    <ul className="space-y-4 mb-8">
      {plan.features.map((feature, i) => (
        <li key={i} className="flex items-center gap-3">
          <FiCheck
            className={`w-5 h-5 ${popular ? "text-white" : "text-indigo-600"}`}
          />
          <span className={popular ? "text-white" : "text-gray-600"}>
            {feature}
          </span>
        </li>
      ))}
    </ul>
    <button
      className={`w-full py-3 rounded-sm font-semibold transition-all ${
        popular
          ? "bg-white text-indigo-600 hover:bg-indigo-50"
          : "bg-indigo-600 text-white hover:bg-indigo-700"
      }`}
    >
      Get Started
    </button>
  </motion.div>
);

const PricingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const plans = [
    {
      title: "Free",
      price: "0",
      features: [
        "Basic search functionality",
        "Chrome extension access",
        "Standard support",
        "1 device",
      ],
    },
    {
      title: "Pro",
      price: "9.99",
      popular: true,
      features: [
        "Advanced search algorithms",
        "Priority support",
        "Multiple devices",
        "Custom themes",
        "AI-powered suggestions",
      ],
    },
    {
      title: "Enterprise",
      price: "49.99",
      features: [
        "All Pro features",
        "Team collaboration",
        "API access",
        "24/7 dedicated support",
        "Custom integration",
      ],
    },
  ];

  return (
    <div className="min-h-screen relative scroll-smooth bg-white">
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
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white pt-14 pb-1 sm:pb-2">
        <div className="container mx-auto px-4 pt-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center z-20 mb-2">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-gray-900 mb-6"
            >
              Simple,{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">
                Transparent
              </span>{" "}
              Pricing
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 mb-8"
            >
              Choose the plan that works best for you. No hidden fees.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <PricingCard plan={plan} popular={plan.popular} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">
              Questions
            </span>
          </h2>
          <div className="space-y-6">
            {[
              {
                question: "Can I change plans later?",
                answer:
                  "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
              },
              {
                question: "Is there a free trial?",
                answer:
                  "Yes, all paid plans come with a 14-day free trial. No credit card required.",
              },
              {
                question: "What payment methods do you accept?",
                answer:
                  "We accept all major credit cards, PayPal, and cryptocurrency.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

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
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">BGS</h2>
              <p className="text-gray-400">
                Your ultimate Chrome extension for a more productive online
                experience.
              </p>
              <div className="flex gap-4">
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
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Security
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Enterprise
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
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    API Reference
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Community
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
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Partners
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
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
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

export default PricingPage;
