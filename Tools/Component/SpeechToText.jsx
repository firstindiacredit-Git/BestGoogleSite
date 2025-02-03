import React, { useState, useRef, useEffect } from 'react';
import { Back } from './back';

const SpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const recognitionRef = useRef(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const animationFrameRef = useRef();

  // Define supported languages with categories
  const languageCategories = {
    'Popular': ['en-IN', 'hi-IN', 'bn-IN', 'ta-IN'],
    'North Indian': ['hi-IN', 'pa-IN', 'ur-IN', 'ks-IN'],
    'South Indian': ['ta-IN', 'te-IN', 'ml-IN', 'kn-IN'],
    'East Indian': ['bn-IN', 'as-IN', 'or-IN', 'mni-IN'],
    'West Indian': ['gu-IN', 'mr-IN', 'sd-IN', 'gom-IN'],
    'Classical': ['sa-IN'],
    'Other': ['brx-IN', 'sat-IN', 'mai-IN', 'doi-IN', 'ne-IN']
  };

  const languages = {
    'en-IN': 'English',
    'as-IN': 'Assamese',
    'bn-IN': 'Bengali',
    'gu-IN': 'Gujarati',
    'hi-IN': 'Hindi',
    'kn-IN': 'Kannada',
    'ks-IN': 'Kashmiri',
    'gom-IN': 'Konkani',
    'ml-IN': 'Malayalam',
    'mni-IN': 'Manipuri',
    'mr-IN': 'Marathi',
    'ne-IN': 'Nepali',
    'or-IN': 'Oriya',
    'pa-IN': 'Punjabi',
    'sa-IN': 'Sanskrit',
    'sd-IN': 'Sindhi',
    'ta-IN': 'Tamil',
    'te-IN': 'Telugu',
    'ur-IN': 'Urdu',
    'brx-IN': 'Bodo',
    'sat-IN': 'Santhali',
    'mai-IN': 'Maithili',
    'doi-IN': 'Dogri'
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = selectedLanguage;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        simulateAudioLevel();
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setText(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error(event.error);
        setIsListening(false);
        cancelAnimationFrame(animationFrameRef.current);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        cancelAnimationFrame(animationFrameRef.current);
      };

      recognitionRef.current.start();
    } else {
      alert('Speech Recognition is not supported in your browser');
    }
  };

  const simulateAudioLevel = () => {
    const updateLevel = () => {
      setAudioLevel(Math.random());
      if (isListening) {
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      }
    };
    updateLevel();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => console.error('Failed to copy text:', err));
  };

  const downloadText = () => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'speech-to-text.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const shareText = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Speech to Text Content',
          text: text
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      alert('Web Share API is not supported in your browser');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-4 sm:py-6 md:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="bg-white rounded-[30px] shadow-lg border-2 border-gray-100">
          <div className="p-3 sm:p-4 md:p-6">
            <div className="mb-4">
              <Back />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-6 sm:mb-8">
              Speech to Text Converter
            </h1>

            <div className="space-y-4 sm:space-y-6">
              {/* Language Selection */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Select Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  disabled={isListening}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition-colors text-sm sm:text-base"
                >
                  {Object.entries(languageCategories).map(([category, codes]) => (
                    <optgroup key={category} label={category}>
                      {codes.map(code => (
                        <option key={code} value={code}>
                          {languages[code]}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Microphone Button and Visualization */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`p-4 sm:p-6 rounded-full transition-all duration-200 relative group ${
                      isListening
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-teal-500 hover:bg-teal-600'
                    }`}
                  >
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {isListening ? 'Stop Recording' : 'Start Recording'}
                    </span>
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  </button>
                  {isListening && (
                    <div className="absolute -top-2 -right-2 w-3 h-3 sm:w-4 sm:h-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-red-500"></span>
                    </div>
                  )}
                </div>
                {isListening && (
                  <div className="flex space-x-1">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-teal-500 rounded-full transition-all duration-200"
                        style={{
                          height: `${Math.max(12, audioLevel * 48)}px`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>

              {/* Text Display */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Converted Text
                </label>
                <div className="relative">
                  <textarea
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition-colors h-32 sm:h-40 md:h-48 text-sm sm:text-base"
                    value={text}
                    readOnly
                    placeholder="Your speech will appear here..."
                  />
                </div>
                
                <div className="flex flex-wrap justify-end gap-2 sm:gap-4 mt-4">
                  <div className="relative">
                    <button
                      onClick={copyToClipboard}
                      disabled={!text}
                      className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative group text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy Text
                    </button>
                    {copySuccess && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Copied!
                      </div>
                    )}
                  </div>

                  <button
                    onClick={downloadText}
                    disabled={!text}
                    className="inline-flex items-center px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>

                  <button
                    onClick={shareText}
                    disabled={!text}
                    className="inline-flex items-center px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechToText;
