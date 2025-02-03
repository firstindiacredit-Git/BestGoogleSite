import React from "react";
import { Back } from "./back";

const Scientific = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-start justify-center pt-4">
            <div className="max-w-2xl w-full px-2">
                <div className="bg-white rounded-[30px] shadow-md overflow-hidden border-2 border-gray-100">
                    {/* Back Button */}
                    <div className="p-1">
                        <Back />
                    </div>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-white p-2 border-b border-gray-100">
                        <h1 className="text-2xl font-bold text-gray-800 text-center">
                            Scientific Calculator
                        </h1>
                    </div>

                    {/* Calculator iframe */}
                    <div className="p-2">
                        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50" style={{ height: "600px" }}>
                            <iframe
                                src="https://scientific-calculator-weld-omega.vercel.app/"
                                width="100%"
                                height="100%"
                                style={{ border: "none" }}
                                title="Scientific Calculator"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scientific;
