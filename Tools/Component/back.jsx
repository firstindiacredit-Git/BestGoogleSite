import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeftLong } from "react-icons/fa6";

export function Back() {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-blue-600 
                transition-all duration-300 rounded-md hover:bg-blue-50/50 group"
        >
            <FaArrowLeftLong className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
        </button>
    );
}
