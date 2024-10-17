// src/PremiumPage.js

import React from "react";

const pricingData = [
  {
    tier: "Basic",
    price: "$9/month",
    benefits: ["Access to basic features", "Email support", "Community access"],
  },
  {
    tier: "Standard",
    price: "$19/month",
    benefits: [
      "Everything in Basic",
      "Priority email support",
      "Exclusive content",
      "Monthly webinars",
    ],
  },
  {
    tier: "Premium",
    price: "$29/month",
    benefits: [
      "Everything in Standard",
      "Personalized support",
      "Access to beta features",
      "One-on-one consultations",
    ],
  },
];

const PremiumPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        Premium Pricing Plans
      </h1>
      <div className="grid md:grid-cols-3 gap-6">
        {pricingData.map((plan, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-lg p-6 text-center transition-transform transform hover:scale-105"
          >
            <h2 className="text-xl font-semibold mb-4">{plan.tier}</h2>
            <p className="text-2xl font-bold mb-4">{plan.price}</p>
            <h3 className="text-lg font-semibold mb-2">Benefits:</h3>
            <ul className="list-disc list-inside mb-4">
              {plan.benefits.map((benefit, i) => (
                <li key={i} className="text-left">
                  {benefit}
                </li>
              ))}
            </ul>
            <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500 transition">
              Choose Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PremiumPage;
