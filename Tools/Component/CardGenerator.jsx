import React from "react";
import { Back } from "./back";

const CardGenerator = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-2 sm:p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="relative p-4 sm:p-6">
            <div className="mb-8 sm:mb-0 sm:absolute sm:top-6 sm:left-6">
              <Back />
            </div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Credit Card Generator
            </h1>
          </div>

          {/* Main Content */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="aspect-[16/9] w-full rounded-xl overflow-hidden shadow-md">
              <iframe
                src="https://creadit-card-generator.vercel.app/"
                className="w-full h-full"
                style={{ border: "none" }}
                title="Credit Card Generator"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardGenerator;
