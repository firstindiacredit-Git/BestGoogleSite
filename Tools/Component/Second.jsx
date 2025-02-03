import React, { useState, useEffect } from 'react';
import { Back } from './back';

const Second = () => {
  const [secondsInput, setSecondsInput] = useState('');
  const [formattedTime, setFormattedTime] = useState(null);
  const [error, setError] = useState('');
  const [animationProgress, setAnimationProgress] = useState(0);

  // Common time presets
  const timePresets = {
    'One Minute': 60,
    'Five Minutes': 300,
    'Half Hour': 1800,
    'One Hour': 3600,
    'Two Hours': 7200,
    'One Day': 86400,
  };

  const convertToHHMMSS = (seconds) => {
    if (seconds < 0 || isNaN(seconds)) {
      setError('Please enter a valid number of seconds.');
      setFormattedTime(null);
      return;
    }

    setError('');
    let hrs = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds % 3600) / 60);
    let secs = seconds % 60;

    // Add leading zero if necessary
    let hoursStr = hrs.toString().padStart(2, '0');
    let minsStr = mins.toString().padStart(2, '0');
    let secsStr = secs.toString().padStart(2, '0');

    setFormattedTime({
      hours: hoursStr,
      minutes: minsStr,
      seconds: secsStr,
      totalSeconds: seconds,
      breakdown: {
        hours: hrs,
        minutes: mins,
        seconds: secs
      }
    });

    // Calculate animation progress (max 24 hours = 86400 seconds)
    const progress = Math.min((seconds / 86400) * 100, 100);
    setAnimationProgress(progress);
  };

  const handleConvert = () => {
    const seconds = parseInt(secondsInput, 10);
    convertToHHMMSS(seconds);
  };

  const handlePresetClick = (seconds) => {
    setSecondsInput(seconds.toString());
    convertToHHMMSS(seconds);
  };

  // Animation effect for the progress bar
  useEffect(() => {
    const progressBar = document.querySelector('.progress-bar-fill');
    if (progressBar) {
      progressBar.style.width = `${animationProgress}%`;
    }
  }, [animationProgress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[30px] shadow-lg border-2 border-gray-100">
          <Back />
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Time Converter
            </h1>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Input Form */}
              <div className="space-y-6">
                {/* Seconds Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Seconds
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      value={secondsInput}
                      onChange={(e) => setSecondsInput(e.target.value)}
                      placeholder="Enter seconds"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors peer"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 transition-opacity duration-200 group-hover:opacity-0 peer-focus:opacity-0">
                      sec
                    </span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Presets
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(timePresets).map(([name, seconds]) => (
                      <button
                        key={name}
                        onClick={() => handlePresetClick(seconds)}
                        className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Convert Button */}
                <button
                  onClick={handleConvert}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors duration-200"
                >
                  Convert
                </button>

                {error && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-xl">
                    {error}
                  </div>
                )}
              </div>

              {/* Right Column - Results and Visualization */}
              <div className="space-y-6">
                {formattedTime ? (
                  <>
                    {/* Time Display */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                      <div className="text-center mb-4">
                        <div className="text-4xl font-bold text-indigo-600 font-mono tracking-wider">
                          {formattedTime.hours}:{formattedTime.minutes}:{formattedTime.seconds}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Total: {formattedTime.totalSeconds.toLocaleString()} seconds
                        </p>
                      </div>

                      {/* Time Breakdown */}
                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="p-3 bg-indigo-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-indigo-600">
                            {formattedTime.breakdown.hours}
                          </p>
                          <p className="text-xs text-gray-600">Hours</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-purple-600">
                            {formattedTime.breakdown.minutes}
                          </p>
                          <p className="text-xs text-gray-600">Minutes</p>
                        </div>
                        <div className="p-3 bg-pink-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-pink-600">
                            {formattedTime.breakdown.seconds}
                          </p>
                          <p className="text-xs text-gray-600">Seconds</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">
                        Percentage of Day (24 hours)
                      </h3>
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="progress-bar-fill h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                          style={{ width: '0%' }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-right">
                        {animationProgress.toFixed(2)}%
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 h-full flex flex-col items-center justify-center text-gray-500">
                    <svg
                      className="w-16 h-16 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-lg">Enter seconds to see the conversion</p>
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

export default Second;
