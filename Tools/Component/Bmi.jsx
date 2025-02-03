import React, { useState } from 'react';
import { Back } from './back';

const Bmi = () => {
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState(25);
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('Pounds');
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState('');
  const [healthRisk, setHealthRisk] = useState('');
  const [normalWeightRange, setNormalWeightRange] = useState('');
  const [displayWeight, setDisplayWeight] = useState('');

  const calculateBMI = (e) => {
    e.preventDefault();

    const heightInMeters = ((parseInt(heightFeet) * 12) + parseInt(heightInches)) * 0.0254;
    let weightInKg;

    // Convert the weight to kg based on the selected unit
    if (weightUnit === 'Pounds') {
      weightInKg = parseFloat(weight) * 0.453592; // Convert pounds to kg
    } else {
      weightInKg = parseFloat(weight); // Already in kg
    }

    const calculatedBmi = weightInKg / (heightInMeters * heightInMeters);
    setBmi(calculatedBmi.toFixed(2));

    // Determine the category and health risk based on BMI
    if (calculatedBmi < 18.5) {
      setCategory('Underweight');
      setHealthRisk('Malnutrition risk');
    } else if (calculatedBmi >= 18.5 && calculatedBmi <= 24.9) {
      setCategory('Normal weight');
      setHealthRisk('Low risk');
    } else if (calculatedBmi >= 25 && calculatedBmi <= 29.9) {
      setCategory('Overweight');
      setHealthRisk('Enhanced risk');
    } else if (calculatedBmi >= 30 && calculatedBmi <= 34.9) {
      setCategory('Moderately obese');
      setHealthRisk('Medium risk');
    } else if (calculatedBmi >= 35 && calculatedBmi <= 39.9) {
      setCategory('Severely obese');
      setHealthRisk('High risk');
    } else {
      setCategory('Very severely obese');
      setHealthRisk('Very high risk');
    }

    // Calculate normal weight range
    const minNormalWeightKg = 18.5 * heightInMeters * heightInMeters; // in kg
    const maxNormalWeightKg = 24.9 * heightInMeters * heightInMeters; // in kg

    // Convert the normal weight range to the selected unit
    if (weightUnit === 'Pounds') {
      const minNormalWeight = minNormalWeightKg / 0.453592; // Convert kg to pounds
      const maxNormalWeight = maxNormalWeightKg / 0.453592; // Convert kg to pounds
      setNormalWeightRange(`${minNormalWeight.toFixed(2)} - ${maxNormalWeight.toFixed(2)} lbs`);
      setDisplayWeight(`${weight} lbs`); // Display weight in pounds
    } else {
      setNormalWeightRange(`${minNormalWeightKg.toFixed(2)} - ${maxNormalWeightKg.toFixed(2)} kg`);
      setDisplayWeight(`${weight} kg`); // Display weight in kg
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-start justify-center pt-4">
      <div className="max-w-2xl w-full px-2">
        <div className="bg-white rounded-[30px] shadow-md overflow-hidden border-2 border-gray-100">
          {/* Back Button */}
          <div className="p-1">
            <Back />
          </div>

          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 to-white p-2 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800 text-center">
              BMI Calculator
            </h1>
          </div>

          <form onSubmit={calculateBMI} className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Gender */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Age */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                  min="2"
                  max="120"
                />
              </div>

              {/* Height */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Height (Feet & Inches)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    placeholder="Feet"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                  />
                  <input
                    type="number"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    placeholder="Inches"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                  />
                </div>
              </div>

              {/* Weight */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Weight</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder={`Weight in ${weightUnit}`}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                  />
                  <select
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                  >
                    <option value="Pounds">Pounds</option>
                    <option value="Kilograms">Kilograms</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Calculate BMI
              </button>
            </div>

            {/* Results */}
            {bmi && (
              <div className="mt-4 bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">BMI Results</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">BMI</p>
                    <p className="text-lg font-bold text-indigo-600">{bmi}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">Category</p>
                    <p className="text-lg font-bold text-indigo-600">{category}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">Health Risk</p>
                    <p className="text-lg font-bold text-indigo-600">{healthRisk}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">Normal BMI Range</p>
                    <p className="text-lg font-bold text-indigo-600">18.5 - 24.9</p>
                  </div>
                  <div className="col-span-2 bg-white p-3 rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">Your Weight</p>
                    <p className="text-lg font-bold text-indigo-600">{displayWeight}</p>
                  </div>
                  <div className="col-span-2 bg-white p-3 rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">Your Normal Weight Range</p>
                    <p className="text-lg font-bold text-indigo-600">{normalWeightRange}</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Bmi;
