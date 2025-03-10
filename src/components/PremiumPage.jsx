import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { motion } from "framer-motion";
import { Chrome } from "lucide-react";
import { FiCheck } from "react-icons/fi";
import PayPalSubscription from "./PayPalSubscription";
import { useTheme } from "../context/ThemeContext";

const PricingCard = ({ plan, popular }) => {
  const [showPayPal, setShowPayPal] = useState(false);

  return (
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
              className={`w-5 h-5 ${
                popular ? "text-white" : "text-indigo-600"
              }`}
            />
            <span className={popular ? "text-white" : "text-gray-600"}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
      {plan.title === "Pro" ? (
        <>
          {!showPayPal ? (
            <button
              onClick={() => setShowPayPal(true)}
              className={`w-full py-3 rounded-sm font-semibold transition-all bg-white text-indigo-600 hover:bg-indigo-50`}
            >
              Get Started
            </button>
          ) : (
            <PayPalSubscription
              onSuccess={() => {
                setShowPayPal(false);
                // You can add additional success handling here
              }}
            />
          )}
        </>
      ) : (
        <button
          className={`w-full py-3 rounded-sm font-semibold transition-all ${
            popular
              ? "bg-white text-indigo-600 hover:bg-indigo-50"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          Get Started
        </button>
      )}
    </motion.div>
  );
};

const PremiumPage = () => {
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
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
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
      <footer className="text-center mt-10 text-sm text-gray-500">
        <p>
          Designed by{" "}
          <a href="https://www.pizeonfly.com" className="underline">
            Pizeonfly.com
          </a>
        </p>
      </footer>
    </div>
  );
};

export default PremiumPage;
