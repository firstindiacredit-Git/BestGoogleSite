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
    <div className="min-h-screen bg-blue-100 dark:bg-[#513a7a] py-8">
      <div className="max-w-4xl  mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#28283a] rounded-[30px] shadow-lg dark:border-none">
          <Back />
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
              Time Converter
            </h1>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Input Form */}
              <div className="space-y-6">
                {/* Seconds Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Enter Seconds
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      value={secondsInput}
                      onChange={(e) => setSecondsInput(e.target.value)}
                      placeholder="Enter seconds"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors peer"
                    />
                    {/* <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300 transition-opacity duration-200 group-hover:opacity-0 peer-focus:opacity-0">
                      sec
                    </span> */}
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Quick Presets
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(timePresets).map(([name, seconds]) => (
                      <button
                        key={name}
                        onClick={() => handlePresetClick(seconds)}
                        className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Convert Button */}
                <button
                  onClick={handleConvert}
                  className="w-full bg-indigo-600 dark:bg-indigo-700 text-white py-3 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors duration-200"
                >
                  Convert
                </button>

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-xl">
                    {error}
                  </div>
                )}
              </div>

              {/* Right Column - Results and Visualization */}
              <div className="space-y-6">
                {formattedTime ? (
                  <>
                    {/* Time Display */}
                    <div className="bg-white dark:bg-[#28283a] p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="text-center mb-4">
                        <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-300 font-mono tracking-wider">
                          {formattedTime.hours}:{formattedTime.minutes}:{formattedTime.seconds}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
                          Total: {formattedTime.totalSeconds.toLocaleString()} seconds
                        </p>
                      </div>

                      {/* Time Breakdown */}
                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900 rounded-lg text-center">
                          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                            {formattedTime.breakdown.hours}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-200">Hours</p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900 rounded-lg text-center">
                          <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                            {formattedTime.breakdown.minutes}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-200">Minutes</p>
                        </div>
                        <div className="p-3 bg-pink-50 dark:bg-pink-900 rounded-lg text-center">
                          <p className="text-2xl font-bold text-pink-600 dark:text-gray-300">
                            {formattedTime.breakdown.seconds}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-200">Seconds</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-white dark:bg-[#28283a] p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-200 mb-2">
                        Percentage of Day (24 hours)
                      </h3>
                      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="progress-bar-fill h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                          style={{ width: '0%' }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-300 mt-2 text-right">
                        {animationProgress.toFixed(2)}%
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-white dark:bg-[#28283a] p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-300">
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