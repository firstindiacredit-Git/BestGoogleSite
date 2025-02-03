import React, { useState, useEffect } from 'react';
import { Back } from './back';

const Calculator = () => {
    const [input, setInput] = useState("");
    const [result, setResult] = useState("");
    const [history, setHistory] = useState(() => {
        // Initialize history from localStorage on component mount
        try {
            const savedHistory = localStorage.getItem('calculatorHistory');
            return savedHistory ? JSON.parse(savedHistory) : [];
        } catch (error) {
            console.error("Failed to parse history:", error);
            return [];
        }
    });
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    // Save history to localStorage whenever it changes
    useEffect(() => {
        try {
            if (history.length === 0) {
                localStorage.removeItem('calculatorHistory');
            } else {
                localStorage.setItem('calculatorHistory', JSON.stringify(history));
            }
        } catch (error) {
            console.error("Failed to save history:", error);
        }
    }, [history]);

    const handleClick = (value) => {
        if (value === '=') {
            try {
                const evalResult = eval(input);
                const formattedResult = Number.isInteger(evalResult) ? evalResult : Number(evalResult.toFixed(8));
                setResult(formattedResult);
                setInput(formattedResult.toString());
                // Add to history
                if (input) {  // Only add to history if there was an input
                    setHistory(prev => {
                        const newHistory = [...prev, `${input} = ${formattedResult}`];
                        // Keep only last 10 calculations
                        return newHistory.slice(-10);
                    });
                }
            } catch (error) {
                setResult('Error');
            }
        } else if (value === 'C') {
            setInput("");
            setResult("");
        } else if (value === 'DE') {
            setInput(input.slice(0, -1));
        } else if (value === '%') {
            try {
                const match = input.match(/[0-9.]+$/);
                if (match) {
                    const lastNumber = parseFloat(match[0]);
                    const percentValue = lastNumber / 100;
                    setInput(input.slice(0, input.length - match[0].length) + percentValue);
                }
            } catch (error) {
                setResult('Error');
            }
        } else {
            setInput((prev) => prev + value);
        }
    };

    const clearHistory = () => {
        setHistory([]);
    };

    return (
        <div className="h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-start justify-center pt-8">
            <div className="flex gap-4 max-w-4xl w-full px-4">
                <div className="bg-white rounded-[40px] shadow-md w-full max-w-md overflow-hidden border-2 border-gray-100">
                    {/* Back Button */}
                    <div className="p-4">
                        <Back />
                    </div>
                    {/* Calculator Display */}
                    <div className="bg-gradient-to-r from-gray-50 to-white p-8 border-b border-gray-100">
                        <div className="text-right">
                            <div className="text-gray-500 text-2xl mb-2 h-8 overflow-hidden font-medium tracking-wide">
                                {input || "0"}
                            </div>
                            <div className="text-gray-800 text-6xl font-bold h-16 overflow-hidden tracking-tight">
                                {result || "0"}
                            </div>
                        </div>
                    </div>

                    {/* Calculator Buttons */}
                    <div className="grid grid-cols-4 gap-3 p-6 bg-white">
                        {/* First Row */}
                        <button onClick={() => handleClick('C')} 
                                className="btn-calc bg-gradient-to-br from-red-400 to-red-500 text-white hover:from-red-500 hover:to-red-600">
                            C
                        </button>
                        <button onClick={() => handleClick('DE')} 
                                className="btn-calc bg-gradient-to-br from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600">
                            DE
                        </button>
                        <button onClick={() => handleClick('%')} 
                                className="btn-calc bg-gradient-to-br from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600">
                            %
                        </button>
                        <button onClick={() => handleClick('/')} 
                                className="btn-calc bg-gradient-to-br from-indigo-400 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-600">
                            ÷
                        </button>

                        {/* Number Buttons */}
                        <button onClick={() => handleClick('7')} 
                                className="btn-calc bg-gray-50 hover:bg-gray-100">7</button>
                        <button onClick={() => handleClick('8')} 
                                className="btn-calc bg-gray-50 hover:bg-gray-100">8</button>
                        <button onClick={() => handleClick('9')} 
                                className="btn-calc bg-gray-50 hover:bg-gray-100">9</button>
                        <button onClick={() => handleClick('*')} 
                                className="btn-calc bg-gradient-to-br from-indigo-400 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-600">
                            ×
                        </button>

                        <button onClick={() => handleClick('4')} 
                                className="btn-calc bg-gray-50 hover:bg-gray-100">4</button>
                        <button onClick={() => handleClick('5')} 
                                className="btn-calc bg-gray-50 hover:bg-gray-100">5</button>
                        <button onClick={() => handleClick('6')} 
                                className="btn-calc bg-gray-50 hover:bg-gray-100">6</button>
                        <button onClick={() => handleClick('-')} 
                                className="btn-calc bg-gradient-to-br from-indigo-400 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-600">
                            −
                        </button>

                        <button onClick={() => handleClick('1')} 
                                className="btn-calc bg-gray-50 hover:bg-gray-100">1</button>
                        <button onClick={() => handleClick('2')} 
                                className="btn-calc bg-gray-50 hover:bg-gray-100">2</button>
                        <button onClick={() => handleClick('3')} 
                                className="btn-calc bg-gray-50 hover:bg-gray-100">3</button>
                        <button onClick={() => handleClick('+')} 
                                className="btn-calc bg-gradient-to-br from-indigo-400 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-600">
                            +
                        </button>

                        <button onClick={() => handleClick('0')} 
                                className="btn-calc col-span-2 bg-gray-50 hover:bg-gray-100">
                            0
                        </button>
                        <button onClick={() => handleClick('.')} 
                                className="btn-calc bg-gray-50 hover:bg-gray-100">.</button>
                        <button onClick={() => handleClick('=')} 
                                className="btn-calc bg-gradient-to-br from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700">
                            =
                        </button>
                    </div>

                    {/* History Toggle Button */}
                    <div className="p-4 bg-white">
                        <button 
                            onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                            className="w-full py-3 px-4 bg-gradient-to-r from-gray-100 to-gray-200 
                                    text-gray-700 rounded-xl font-medium text-lg hover:from-gray-200 
                                    hover:to-gray-300 transition-all duration-200 flex items-center 
                                    justify-center gap-2">
                            <span>{isHistoryVisible ? 'Hide History' : 'Show History'}</span>
                            <svg className={`w-5 h-5 transition-transform duration-200 ${isHistoryVisible ? 'rotate-180' : ''}`} 
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* History Panel */}
                {isHistoryVisible && (
                    <div className="hidden md:block bg-white rounded-[40px] shadow-md w-80 overflow-hidden border-2 border-gray-100 h-min">
                        <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-semibold text-gray-800">History</h2>
                                <button 
                                    onClick={clearHistory}
                                    className="text-base text-red-500 hover:text-red-600 font-medium">
                                    Clear All
                                </button>
                            </div>
                        </div>
                        <div className="p-6 max-h-[500px] overflow-y-auto">
                            {history.length === 0 ? (
                                <p className="text-gray-500 text-lg text-center">No calculations yet</p>
                            ) : (
                                <ul className="space-y-3">
                                    {history.map((item, index) => (
                                        <li key={index} 
                                            className="p-3 bg-gray-50 rounded-xl text-gray-700 text-lg
                                                    font-medium hover:bg-gray-100 transition-colors">
                                            {item}
                                        </li>
                                    )).reverse()}
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Add global styles */}
            <style jsx global>{`
                .btn-calc {
                    @apply p-5 text-3xl font-semibold text-gray-700
                    transition-all duration-200 rounded-2xl
                    focus:outline-none focus:ring-2 focus:ring-indigo-200
                    active:scale-95 shadow-sm hover:shadow
                    transform hover:-translate-y-0.5;
                }
            `}</style>
        </div>
    );
};

export default Calculator;
