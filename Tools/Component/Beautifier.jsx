import React, { useState } from 'react';
import { html as beautifyHtmlFunc } from 'js-beautify';
import { Back } from './back';

function Beautifier() {
  const [htmlInput, setHtmlInput] = useState('');
  const [beautifiedHtml, setBeautifiedHtml] = useState('');

  const beautifyHtml = () => {
    const formattedHtml = beautifyHtmlFunc(htmlInput, { indent_size: 2, wrap_line_length: 80 });
    setBeautifiedHtml(formattedHtml);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(beautifiedHtml);
    alert('Beautified HTML copied to clipboard');
  };

  const clearInput = () => {
    setHtmlInput('');
    setBeautifiedHtml('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex justify-center pt-8">
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-[30px] shadow-lg overflow-hidden">
          <div className="p-4 relative">
            <div className="absolute top-6 left-4">
              <Back />
            </div>
            
            <h1 className="text-xl font-bold text-center text-gray-800 mb-4 pt-2">
              HTML Beautifier
            </h1>

            <div className="grid gap-3 max-w-xl mx-auto">
              {/* Input Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3">
                <label className="block text-gray-700 text-base font-semibold mb-1">
                  Input HTML
                </label>
                <textarea
                  value={htmlInput}
                  onChange={(e) => setHtmlInput(e.target.value)}
                  placeholder="Paste your HTML here..."
                  className="w-full h-28 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-3">
                <button
                  onClick={beautifyHtml}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Beautify
                </button>
                <button
                  onClick={clearInput}
                  className="px-4 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Clear
                </button>
              </div>

              {/* Output Section */}
              {beautifiedHtml && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3">
                  <label className="block text-gray-700 text-base font-semibold mb-1">
                    Beautified HTML
                  </label>
                  <textarea
                    readOnly
                    value={beautifiedHtml}
                    className="w-full h-28 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-base mb-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                  />
                  <div className="flex justify-center">
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors duration-200"
                    >
                      Copy HTML
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Beautifier;
