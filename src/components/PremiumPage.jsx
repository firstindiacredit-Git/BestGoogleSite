import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { Link } from "react-router-dom";

const pricingData = [
  {
    tier: "Free",
    price: "$0",
    benefits: ["100 queries per day", "Basic support", "Access to public API"],
  },
  {
    tier: "Standard",
    price: "$5",
    benefits: [
      "Unlimited queries",
      "Priority support",
      "Access to premium features",
    ],
  },
  {
    tier: "Pro",
    price: "$10",
    benefits: ["Unlimited queries", "Dedicated support", "Custom integrations"],
  },
];

const PremiumPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      document.documentElement.classList.toggle("dark", newMode);
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <h1
        className={`text-2xl mt-5 font-semibold text-center mb-4  ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Premium Subscription
      </h1>
      <p
        className={`text-center mb-8 ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        Choose the plan that suits your needs
      </p>

      <div className="grid md:grid-cols-3 gap-6 px-6 md:px-20 relative">
        {pricingData.map((plan, index) => (
          <div
            key={index}
            className={`pricing-card relative transform transition-all duration-300 ease-in-out rounded-lg shadow-lg p-8 text-center ${
              plan.tier === "Standard"
                ? "bg-yellow-200 text-gray-900 border-4 border-yellow-500"
                : isDarkMode
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-900"
            }`}
          >
            {plan.tier === "Standard" && (
              <div className="absolute top-0 right-0 bg-yellow-500 text-white py-1 px-3 rounded-bl-lg font-bold">
                Popular
              </div>
            )}
            <h2 className="text-xl font-semibold mb-4">{plan.tier}</h2>
            <p className="text-3xl font-bold mb-4">
              {plan.price} <span className="text-sm font-normal">/ month</span>
            </p>
            <ul className="space-y-2 mb-6">
              {plan.benefits.map((benefit, i) => (
                <li
                  key={i}
                  className="flex items-center justify-center space-x-2"
                >
                  <span className="text-green-500">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <Link
              to={{
                pathname: "/PremiumForm",
                state: { selectedPlan: plan.tier },
              }}
            >
              <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition">
                Choose
              </button>
            </Link>
          </div>
        ))}
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
