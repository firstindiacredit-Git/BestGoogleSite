import React, { useState, useEffect } from 'react';
import { Back } from './back';

const TemperatureConverter = () => {
  const [temperature, setTemperature] = useState('');
  const [result, setResult] = useState(null);
  const [unit, setUnit] = useState('C');
  const [animationValue, setAnimationValue] = useState(0);

  // Common temperature presets
  const temperaturePresets = {
    'Room Temperature': { C: 20, F: 68 },
    'Body Temperature': { C: 37, F: 98.6 },
    'Freezing Point': { C: 0, F: 32 },
    'Boiling Point': { C: 100, F: 212 },
  };

  // Temperature ranges for the thermometer
  const ranges = {
    cold: { min: -20, max: 0 },
    cool: { min: 0, max: 15 },
    moderate: { min: 15, max: 25 },
    warm: { min: 25, max: 35 },
    hot: { min: 35, max: 100 },
  };

  const getTemperatureColor = (temp, isC) => {
    const celsiusTemp = isC ? temp : ((temp - 32) * 5) / 9;
    if (celsiusTemp <= ranges.cold.max) return '#00ffff';
    if (celsiusTemp <= ranges.cool.max) return '#00bfff';
    if (celsiusTemp <= ranges.moderate.max) return '#32cd32';
    if (celsiusTemp <= ranges.warm.max) return '#ffa500';
    return '#ff4500';
  };

  const handleTemperatureChange = (e) => {
    setTemperature(e.target.value);
  };

  const handleUnitChange = (e) => {
    setUnit(e.target.value);
    setTemperature('');
    setResult(null);
  };

  const handlePresetClick = (preset) => {
    const value = temperaturePresets[preset][unit];
    setTemperature(value);
    convertTemperature(value);
  };

  const convertTemperature = (temp = temperature) => {
    let tempValue = parseFloat(temp);
    if (isNaN(tempValue)) {
      setResult({ error: 'Please enter a valid number' });
      return;
    }

    let convertedTemp, originalUnit, convertedUnit;
    if (unit === 'C') {
      convertedTemp = (tempValue * 9) / 5 + 32;
      originalUnit = '°C';
      convertedUnit = '°F';
    } else {
      convertedTemp = ((tempValue - 32) * 5) / 9;
      originalUnit = '°F';
      convertedUnit = '°C';
    }

    setResult({
      original: {
        value: tempValue,
        unit: originalUnit,
        color: getTemperatureColor(tempValue, unit === 'C'),
      },
      converted: {
        value: convertedTemp.toFixed(2),
        unit: convertedUnit,
        color: getTemperatureColor(convertedTemp, unit !== 'C'),
      },
    });

    // Update thermometer animation
    setAnimationValue(unit === 'C' ? tempValue : convertedTemp);
  };

  // Thermometer fill animation
  useEffect(() => {
    const thermometerFill = document.querySelector('.thermometer-fill');
    if (thermometerFill && !isNaN(animationValue)) {
      const percentage = Math.min(Math.max(((animationValue + 20) / 120) * 100, 0), 100);
      thermometerFill.style.height = `${percentage}%`;
      thermometerFill.style.backgroundColor = getTemperatureColor(animationValue, true);
    }
  }, [animationValue]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-2000 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[30px] shadow-lg border-2 border-gray-100">
          <Back />
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Temperature Converter
            </h1>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Input Form */}
              <div className="space-y-6">
                {/* Temperature Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Temperature
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      value={temperature}
                      onChange={handleTemperatureChange}
                      placeholder="Enter value"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors peer"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 transition-opacity duration-200 group-hover:opacity-0 peer-focus:opacity-0">
                      °{unit}
                    </span>
                  </div>
                </div>

                {/* Unit Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Convert From
                  </label>
                  <select
                    value={unit}
                    onChange={handleUnitChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                  >
                    <option value="C">Celsius to Fahrenheit</option>
                    <option value="F">Fahrenheit to Celsius</option>
                  </select>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Presets
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(temperaturePresets).map(([name]) => (
                      <button
                        key={name}
                        onClick={() => handlePresetClick(name)}
                        className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Convert Button */}
                <button
                  onClick={() => convertTemperature()}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors duration-200"
                >
                  Convert
                </button>
              </div>

              {/* Right Column - Results and Visualization */}
              <div className="space-y-6">
                {/* Thermometer Visualization */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-center">
                    <div className="relative w-8 h-64 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="thermometer-fill absolute bottom-0 left-0 w-full bg-red-500 transition-all duration-500"
                        style={{ height: '0%' }}
                      ></div>
                      <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                    </div>
                    <div className="ml-4 h-64 flex flex-col justify-between text-sm text-gray-500">
                      <span>100°C</span>
                      <span>75°C</span>
                      <span>50°C</span>
                      <span>25°C</span>
                      <span>0°C</span>
                      <span>-20°C</span>
                    </div>
                  </div>
                </div>

                {/* Results Display */}
                {result && (
                  <div className="space-y-4">
                    {result.error ? (
                      <div className="p-4 bg-red-50 text-red-700 rounded-xl">
                        {result.error}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl text-center"
                             style={{ backgroundColor: `${result.original.color}20` }}>
                          <p className="text-sm text-gray-600">Original</p>
                          <p className="text-2xl font-bold mt-2" style={{ color: result.original.color }}>
                            {result.original.value}{result.original.unit}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl text-center"
                             style={{ backgroundColor: `${result.converted.color}20` }}>
                          <p className="text-sm text-gray-600">Converted</p>
                          <p className="text-2xl font-bold mt-2" style={{ color: result.converted.color }}>
                            {result.converted.value}{result.converted.unit}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemperatureConverter;
