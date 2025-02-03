import React, { useState, useRef, useEffect } from 'react';
import { Back } from './back';

const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const speechSynthesis = window.speechSynthesis;
  const utteranceRef = useRef(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [rate, setRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const timeIntervalRef = useRef(null);

  // Sample text presets
  const textPresets = {
    'Greeting': 'Hello! How are you today?',
    'Weather': 'Today will be sunny with a high of 75°F.',
    'Quote': 'The only way to do great work is to love what you do.',
    'Story': 'Once upon a time in a land far away...',
  };

  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      setSelectedVoice(voices[0]);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSpeak = () => {
    if (text && selectedVoice) {
      utteranceRef.current = new SpeechSynthesisUtterance(text);
      utteranceRef.current.voice = selectedVoice;
      utteranceRef.current.rate = rate;

      const estimatedDuration = (text.length * 100) / (rate * 1000);
      setDuration(estimatedDuration);
      setCurrentTime(0);
      setIsPlaying(true);

      utteranceRef.current.onstart = () => {
        timeIntervalRef.current = setInterval(() => {
          if (speechSynthesis.speaking && !speechSynthesis.paused) {
            setCurrentTime(prev => Math.min(prev + 0.1, estimatedDuration));
          }
        }, 100);
      };

      utteranceRef.current.onend = () => {
        clearInterval(timeIntervalRef.current);
        setCurrentTime(0);
        setIsPlaying(false);
        setIsPaused(false);
      };

      utteranceRef.current.onpause = () => {
        clearInterval(timeIntervalRef.current);
      };

      utteranceRef.current.onresume = () => {
        timeIntervalRef.current = setInterval(() => {
          if (speechSynthesis.speaking && !speechSynthesis.paused) {
            setCurrentTime(prev => Math.min(prev + 0.1, estimatedDuration));
          }
        }, 100);
      };

      speechSynthesis.speak(utteranceRef.current);
    }
  };

  const handlePause = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleResume = () => {
    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsPaused(false);
    setIsPlaying(false);
    setCurrentTime(0);
    clearInterval(timeIntervalRef.current);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setText(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  };

  const handlePresetClick = (presetText) => {
    setText(presetText);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[30px] shadow-lg border-2 border-gray-100">
          <Back />
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Text to Speech Converter
            </h1>

            <div className="space-y-6">
              {/* File Upload */}
              <div className="relative">
                <input
                  type="file"
                  className="hidden"
                  accept=".txt"
                  onChange={handleFileUpload}
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 relative group"
                >
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Upload Text File (.txt)
                  </span>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Text File
                </label>
              </div>

              {/* Text Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Text
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type or paste your text here..."
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors h-40"
                />
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(textPresets).map(([name, value]) => (
                    <button
                      key={name}
                      onClick={() => handlePresetClick(value)}
                      className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors duration-200 relative group"
                    >
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Click to use this preset text
                      </span>
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Voice
                </label>
                <select
                  onChange={(e) => setSelectedVoice(availableVoices[e.target.value])}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                >
                  {availableVoices.map((voice, index) => (
                    <option key={index} value={index}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Speech Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speech Rate: {rate}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5x</span>
                  <span>1x</span>
                  <span>1.5x</span>
                  <span>2x</span>
                </div>
              </div>

              {/* Audio Controls */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {!isPlaying ? (
                      <button
                        onClick={isPaused ? handleResume : handleSpeak}
                        className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors relative group"
                        title={isPaused ? "Resume" : "Play"}
                      >
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {isPaused ? "Resume" : "Play"}
                        </span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={handlePause}
                        className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors relative group"
                        title="Pause"
                      >
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Pause
                        </span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={handleStop}
                      className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors relative group"
                      title="Stop"
                    >
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Stop
                      </span>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                    </button>
                    <button
                      onClick={handleCopyText}
                      className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors relative group"
                      title="Copy Text"
                    >
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Copy Text
                      </span>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      {copySuccess && (
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Copied!
                        </span>
                      )}
                    </button>
                  </div>
                  <div className="text-sm font-mono text-gray-500">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-100"
                    style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;
