import React, { useState } from "react";
import { Back } from "./back";

const WordCounter = () => {
  const [text, setText] = useState("");

  const countWords = (text) => {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  };

  const countCharacters = (text) => {
    return text.length;
  };

  const countLines = (text) => {
    return text.split("\n").length;
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
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
              Word Counter
            </h1>

            <div className="grid gap-3 max-w-xl mx-auto">
              {/* Input Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3">
                <label className="block text-gray-700 text-base font-semibold mb-1">
                  Enter Text
                </label>
                <textarea
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Type or paste your text here..."
                  className="w-full h-28 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                ></textarea>
              </div>

              {/* Statistics Section */}
              <div className="grid grid-cols-3 gap-2">
                {/* Words Count */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 text-center">
                  <h2 className="text-sm font-semibold text-gray-700 mb-1">Words</h2>
                  <p className="text-xl font-bold text-gray-800">{countWords(text)}</p>
                </div>

                {/* Characters Count */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 text-center">
                  <h2 className="text-sm font-semibold text-gray-700 mb-1">Characters</h2>
                  <p className="text-xl font-bold text-gray-800">{countCharacters(text)}</p>
                </div>

                {/* Lines Count */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 text-center">
                  <h2 className="text-sm font-semibold text-gray-700 mb-1">Lines</h2>
                  <p className="text-xl font-bold text-gray-800">{countLines(text)}</p>
                </div>
              </div>

              {/* Clear Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => setText("")}
                  className="px-4 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Clear Text
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordCounter;
