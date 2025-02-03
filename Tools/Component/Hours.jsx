import React, { useState, useEffect } from 'react';
import { Back } from './back';

const Hours = () => {
  const [time, setTime] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [animationProgress, setAnimationProgress] = useState(0);

  // Common time presets
  const timePresets = {
    'One Hour': '01:00:00',
    'Half Day': '12:00:00',
    'Full Day': '24:00:00',
    'Work Day': '08:00:00',
    'Break Time': '00:15:00',
    'Lunch Hour': '01:30:00',
  };

  const convertToSeconds = (timeStr) => {
    const regex = /^(\d{1,2}):([0-5]?\d):([0-5]?\d)$/;  // HH:MM:SS format validation
    const match = timeStr.match(regex);

    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const secs = parseInt(match[3], 10);

      const totalSeconds = hours * 3600 + minutes * 60 + secs;
      
      setResult({
        time: timeStr,
        seconds: totalSeconds,
        breakdown: {
          hours,
          minutes,
          seconds: secs
        }
      });

      // Calculate animation progress (max 24 hours = 86400 seconds)
      const progress = Math.min((totalSeconds / 86400) * 100, 100);
      setAnimationProgress(progress);
      setError('');
    } else {
      setError('Please enter a valid time in HH:MM:SS format');
      setResult(null);
    }
  };

  const handleChange = (e) => {
    setTime(e.target.value);
  };

  const handlePresetClick = (presetTime) => {
    setTime(presetTime);
    convertToSeconds(presetTime);
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
              Time to Seconds Converter
            </h1>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Input Form */}
              <div className="space-y-6">
                {/* Time Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Time (HH:MM:SS)
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={time}
                      onChange={handleChange}
                      placeholder="00:00:00"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors peer font-mono"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 transition-opacity duration-200 group-hover:opacity-0 peer-focus:opacity-0">
                      HH:MM:SS
                    </span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Presets
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(timePresets).map(([name, value]) => (
                      <button
                        key={name}
                        onClick={() => handlePresetClick(value)}
                        className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Convert Button */}
                <button
                  onClick={() => convertToSeconds(time)}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors duration-200"
                >
                  Convert to Seconds
                </button>

                {error && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-xl">
                    {error}
                  </div>
                )}
              </div>

              {/* Right Column - Results and Visualization */}
              <div className="space-y-6">
                {result ? (
                  <>
                    {/* Time Display */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                      <div className="text-center mb-4">
                        <div className="text-4xl font-bold text-indigo-600 font-mono tracking-wider">
                          {result.seconds.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Total Seconds
                        </p>
                      </div>

                      {/* Time Breakdown */}
                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="p-3 bg-indigo-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-indigo-600">
                            {result.breakdown.hours}
                          </p>
                          <p className="text-xs text-gray-600">Hours</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {result.breakdown.minutes}
                          </p>
                          <p className="text-xs text-gray-600">Minutes</p>
                        </div>
                        <div className="p-3 bg-cyan-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-cyan-600">
                            {result.breakdown.seconds}
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
                          className="progress-bar-fill h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500"
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
                    <p className="text-lg">Enter time to see the conversion</p>
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

export default Hours;
