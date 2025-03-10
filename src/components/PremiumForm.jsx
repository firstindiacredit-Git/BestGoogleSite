import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import { useTheme } from "../context/ThemeContext";

const PremiumForm = () => {
  const location = useLocation();
  const initialPlan = location.state?.selectedPlan || "Standard ";
  const { isDarkMode, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    selectedPlan: initialPlan,
  });

  const [errors, setErrors] = useState({});

  // Luhn algorithm to verify credit card number
  const isValidCardNumber = (number) => {
    let sum = 0;
    let shouldDouble = false;
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i]);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      const cardNumberRegex = /^\d{13,19}$/;
      if (!cardNumberRegex.test(value) || !isValidCardNumber(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          cardNumber: "Invalid card number.",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          cardNumber: "",
        }));
      }
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const validate = () => {
    let errors = {};
    if (!formData.fullName) errors.fullName = "Full Name is required";
    if (!formData.email) errors.email = "Email is required";
    if (!formData.cardNumber)
      errors.cardNumber = "Credit Card Number is required";
    if (!formData.expirationDate)
      errors.expirationDate = "Expiration Date is required";
    if (!formData.cvv) errors.cvv = "CVV is required";
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length === 0) {
      console.log("Form submitted successfully:", formData);
      alert("Thank you for signing up for the premium plan!");
    } else {
      setErrors(errors);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <div className="max-w-3xl mx-auto p-3 mt-10 bg-white dark:bg-[#28283A] border dark:text-white rounded-sm shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Premium Signup Form
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-2 dark:text-black border rounded"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm">{errors.fullName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border dark:text-black rounded"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border dark:text-black rounded"
              />
            </div>
          </div>
          <div className="mb-4  grid grid-cols-1x gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                className="w-full p-2 border dark:text-black rounded"
              />
              {errors.cardNumber && (
                <p className="text-red-500 text-sm">{errors.cardNumber}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Expiration Date
              </label>
              <input
                type="text"
                name="expirationDate"
                placeholder="MM/YY"
                value={formData.expirationDate}
                onChange={handleChange}
                className="w-full p-2 border dark:text-black rounded"
              />
              {errors.expirationDate && (
                <p className="text-red-500 text-sm">{errors.expirationDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CVV</label>
              <input
                type="text"
                name="cvv"
                placeholder="CVV"
                value={formData.cvv}
                onChange={handleChange}
                className="w-full p-2 border dark:text-black rounded"
              />
              {errors.cvv && (
                <p className="text-red-500 text-sm">{errors.cvv}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Plan
            </label>
            <select
              name="selectedPlan"
              value={formData.selectedPlan}
              onChange={handleChange}
              className="w-full p-2 border dark:text-black rounded"
            >
              <option value="Standard">Standard - $1/month</option>
              <option value="Free">Free - $0/month</option>
              <option value="Pro">Pro - $2/month</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 mt-5 rounded hover:bg-indigo-500 transition"
          >
            Complete Signup
          </button>
        </form>
      </div>
    </div>
  );
};

export default PremiumForm;
