import React, { useState } from "react";
import { Back } from "./back";

const Bmi = () => {
  const [gender, setGender] = useState("Male");
  const [age, setAge] = useState(25);
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("Pounds");
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState("");
  const [healthRisk, setHealthRisk] = useState("");
  const [normalWeightRange, setNormalWeightRange] = useState("");
  const [displayWeight, setDisplayWeight] = useState("");

  const calculateBMI = (e) => {
    e.preventDefault();

    const heightInMeters =
      (parseInt(heightFeet) * 12 + parseInt(heightInches)) * 0.0254;
    let weightInKg;

    // Convert the weight to kg based on the selected unit
    if (weightUnit === "Pounds") {
      weightInKg = parseFloat(weight) * 0.453592; // Convert pounds to kg
    } else {
      weightInKg = parseFloat(weight); // Already in kg
    }

    const calculatedBmi = weightInKg / (heightInMeters * heightInMeters);
    setBmi(calculatedBmi.toFixed(2));

    // Determine the category and health risk based on BMI
    if (calculatedBmi < 18.5) {
      setCategory("Underweight");
      setHealthRisk("Malnutrition risk");
    } else if (calculatedBmi >= 18.5 && calculatedBmi <= 24.9) {
      setCategory("Normal weight");
      setHealthRisk("Low risk");
    } else if (calculatedBmi >= 25 && calculatedBmi <= 29.9) {
      setCategory("Overweight");
      setHealthRisk("Enhanced risk");
    } else if (calculatedBmi >= 30 && calculatedBmi <= 34.9) {
      setCategory("Moderately obese");
      setHealthRisk("Medium risk");
    } else if (calculatedBmi >= 35 && calculatedBmi <= 39.9) {
      setCategory("Severely obese");
      setHealthRisk("High risk");
    } else {
      setCategory("Very severely obese");
      setHealthRisk("Very high risk");
    }

    // Calculate normal weight range
    const minNormalWeightKg = 18.5 * heightInMeters * heightInMeters; // in kg
    const maxNormalWeightKg = 24.9 * heightInMeters * heightInMeters; // in kg

    // Convert the normal weight range to the selected unit
    if (weightUnit === "Pounds") {
      const minNormalWeight = minNormalWeightKg / 0.453592; // Convert kg to pounds
      const maxNormalWeight = maxNormalWeightKg / 0.453592; // Convert kg to pounds
      setNormalWeightRange(
        `${minNormalWeight.toFixed(2)} - ${maxNormalWeight.toFixed(2)} lbs`
      );
      setDisplayWeight(`${weight} lbs`); // Display weight in pounds
    } else {
      setNormalWeightRange(
        `${minNormalWeightKg.toFixed(2)} - ${maxNormalWeightKg.toFixed(2)} kg`
      );
      setDisplayWeight(`${weight} kg`); // Display weight in kg
    }
  };

  return (
    <div className="min-h-screen bg-blue-100 dark:bg-[#513a7a]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white dark:bg-[#28283a] rounded-lg shadow-md p-6 dark:text-gray-200">
          <Back />
          <h2 className="text-2xl font-bold mb-6 text-center">
            BMI Calculator
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                value={heightFeet}
                onChange={(e) => setHeightFeet(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-[#513a7a] dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Feet"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Height (Inches)
              </label>
              <input
                type="number"
                value={heightInches}
                onChange={(e) => setHeightInches(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-[#513a7a] dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Inches"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-[#513a7a] dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter weight in kg"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Weight Unit
              </label>
              <select
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-[#513a7a] dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="Pounds">Pounds</option>
                <option value="Kilograms">Kilograms</option>
              </select>
            </div>

            <button
              onClick={calculateBMI}
              className="w-full bg-indigo-500 dark:bg-[#513a7a] hover:bg-indigo-700 dark:hover:bg-[#614a8a] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
            >
              Calculate BMI
            </button>

            {bmi && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-[#513a7a]/50 rounded">
                <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Your BMI: {bmi}
                </p>
                <p className="text-md text-gray-600 dark:text-gray-300">
                  Category: {category}
                </p>
              </div>
            )}

            {bmi && (
              <div className="mt-4 bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  BMI Results
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">BMI</p>
                    <p className="text-lg font-bold text-indigo-600">{bmi}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">
                      Category
                    </p>
                    <p className="text-lg font-bold text-indigo-600">
                      {category}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">
                      Health Risk
                    </p>
                    <p className="text-lg font-bold text-indigo-600">
                      {healthRisk}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">
                      Normal BMI Range
                    </p>
                    <p className="text-lg font-bold text-indigo-600">
                      18.5 - 24.9
                    </p>
                  </div>
                  <div className="col-span-2 bg-white p-3 rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">
                      Your Weight
                    </p>
                    <p className="text-lg font-bold text-indigo-600">
                      {displayWeight}
                    </p>
                  </div>
                  <div className="col-span-2 bg-white p-3 rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">
                      Your Normal Weight Range
                    </p>
                    <p className="text-lg font-bold text-indigo-600">
                      {normalWeightRange}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bmi;