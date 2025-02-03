import React, { useState } from 'react';
import { Back } from './back';

function App() {
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [generatedLink, setGeneratedLink] = useState('');

  // Function to generate the PayPal link
  const generateLink = () => {
    // Base PayPal URL
    const baseLink = `https://www.paypal.com/cgi-bin/webscr?business=${email}&cmd=_xclick&currency_code=${currency}&amount=${amount}&item_name=${description}`;
    setGeneratedLink(baseLink);
  };

  // Function to copy the link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('Link copied to clipboard');
  };

  // Function to clear inputs and the link
  const clearInputs = () => {
    setEmail('');
    setDescription('');
    setAmount('');
    setCurrency('USD');
    setGeneratedLink('');
  };

  // Function to open the generated link
  const openLink = () => {
    if (generatedLink) {
      window.open(generatedLink, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center py-8">
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-[30px] shadow-lg overflow-hidden">
          <div className="p-5 relative">
            <div className="absolute top-8 left-5">
              <Back />
            </div>
            
            <h1 className="text-xl font-bold text-center text-gray-800 mb-6 pt-3">
              PayPal Link Generator
            </h1>

            <div className="grid gap-4 max-w-xl mx-auto">
              {/* Input Fields Section */}
              <div className="space-y-4">
                {/* Email Input */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <label className="block text-gray-700 text-base font-semibold mb-2">PayPal Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                    placeholder="Enter PayPal email"
                  />
                </div>

                {/* Description Input */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <label className="block text-gray-700 text-base font-semibold mb-2">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                    placeholder="Enter item description"
                  />
                </div>

                {/* Amount Input */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <label className="block text-gray-700 text-base font-semibold mb-2">Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                {/* Currency Selection */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <label className="block text-gray-700 text-base font-semibold mb-2">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                  >
                    <option value="USD">U.S. Dollar ($)</option>
                    <option value="NZD">New Zealand Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                    <option value="INR">Indian Rupee ( )</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-3 mt-2">
                <button
                  onClick={generateLink}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Generate Link
                </button>
                <button
                  onClick={clearInputs}
                  className="px-4 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Clear
                </button>
              </div>

              {/* Generated Link Section */}
              {generatedLink && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mt-2">
                  <h2 className="text-base font-semibold text-gray-700 mb-2">Generated PayPal Link</h2>
                  <textarea
                    readOnly
                    value={generatedLink}
                    className="w-full p-2 bg-white border-2 border-gray-200 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    rows="2"
                  />
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors duration-200"
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={openLink}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      Open Link
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

export default App;
