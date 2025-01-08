import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMenu, FiX, FiCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Chrome } from 'lucide-react';
import "./Landing.css";

const PricingCard = ({ plan, popular }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className={`p-8 rounded-2xl ${
      popular
        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white'
        : 'bg-white'
    } shadow-xl`}
  >
    <h3 className={`text-2xl font-bold mb-4 ${popular ? 'text-white' : 'text-gray-900'}`}>
      {plan.title}
    </h3>
    <div className="flex items-baseline mb-8">
      <span className={`text-4xl font-bold ${popular ? 'text-white' : 'text-indigo-600'}`}>
        ${plan.price}
      </span>
      <span className={popular ? 'text-white/80' : 'text-gray-600'}>
        {plan.popular ? "/Month" : "/Forever"}
      </span>
    </div>
    <ul className="space-y-4 mb-8">
      {plan.features.map((feature, i) => (
        <li key={i} className="flex items-center gap-3">
          <FiCheck className={`w-5 h-5 ${popular ? 'text-white' : 'text-indigo-600'}`} />
          <span className={popular ? 'text-white' : 'text-gray-600'}>{feature}</span>
        </li>
      ))}
    </ul>
    <button
      className={`w-full py-3 rounded-lg font-semibold transition-all ${
        popular
          ? 'bg-white text-indigo-600 hover:bg-indigo-50'
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
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
        "1 device"
      ]
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
        "AI-powered suggestions"
      ]
    },
    {
      title: "Enterprise",
      price: "49.99",
      features: [
        "All Pro features",
        "Team collaboration",
        "API access",
        "24/7 dedicated support",
        "Custom integration"
      ]
    }
  ];

  return (
    <div className="min-h-screen relative scroll-smooth bg-gradient-to-b from-indigo-50 via-white to-white">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50"
      >
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
                BGS
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors px-3 py-1 rounded-lg hover:bg-white/60">
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
              className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
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
              Simple,{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">
                Transparent
              </span>
              {' '}Pricing
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
            Frequently Asked{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">
              Questions
            </span>
          </h2>
          <div className="space-y-6">
            {[
              {
                question: "Can I change plans later?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
              },
              {
                question: "Is there a free trial?",
                answer: "Yes, all paid plans come with a 14-day free trial. No credit card required."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and cryptocurrency."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Get Started
            </span>
            ?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied users who have transformed their Google experience.
          </p>
          <a
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl"
          >
            Try For Free
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

export default PricingPage;
