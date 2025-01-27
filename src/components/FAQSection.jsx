import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMinus } from "react-icons/fi";

const faqs = [
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
  {
    question: "What browsers are supported?",
    answer:
      "Our platform works with all Chromium-based browsers including Google Chrome, Microsoft Edge, Brave, and Opera.",
  },
  {
    question: "What kind of support do you offer?",
    answer:
      "We provide 24/7 customer support through multiple channels including email and chat. Our dedicated support team is always ready to help you with any questions or issues you might have.",
  },
];

const FAQItem = ({ faq, index, isOpen, toggleAccordion }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="backdrop-blur-lg bg-white/50 rounded-xl border border-indigo-500/50 overflow-hidden shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transition-all mb-4"
    >
      <button
        onClick={() => toggleAccordion(index)}
        className="w-full px-6 py-4 text-left flex justify-between items-center"
      >
        <span className="font-semibold text-gray-900">{faq.question}</span>
        {isOpen ? (
          <FiMinus className="text-indigo-600" />
        ) : (
          <FiPlus className="text-indigo-600" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
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
  );
};

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      className="py-24 bg-gradient-to-b from-indigo-50/30 to-transparent backdrop-blur-lg"
      id="faq"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
            FAQ
          </h2>
          <p className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
            Frequently Asked Questions
          </p>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Everything you need to know about our platform and how it can
            enhance your browsing experience.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              index={index}
              isOpen={openIndex === index}
              toggleAccordion={toggleAccordion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
