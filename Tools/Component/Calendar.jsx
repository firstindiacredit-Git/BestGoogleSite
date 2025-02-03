import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Back } from './back';

const AllMonthsCalendar = () => {
  const [year, setYear] = useState(new Date().getFullYear()); // Default to the current year

  // Generate months for the selected year
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

  // Handlers for year navigation
  const handlePreviousYear = () => setYear((prevYear) => prevYear - 1);
  const handleNextYear = () => setYear((prevYear) => prevYear + 1);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-gray-100 to-gray-200">
      <Back/>
      {/* Header with Year Navigation */}
      <div className="flex items-center justify-center mb-8">
        <button
          onClick={handlePreviousYear}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition"
        >
          Previous Year
        </button>
        <h1 className="text-center text-3xl font-bold mx-8 text-gray-800">
          {year}
        </h1>
        <button
          onClick={handleNextYear}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition"
        >
          Next Year
        </button>
      </div>

      {/* Grid Layout for Monthly Calendars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {months.map((month, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition"
          >
            {/* Month Name */}
            <h2 className="text-center text-xl font-semibold text-gray-700 mb-4">
              {month.toLocaleString('default', { month: 'long' })}
            </h2>
            {/* Calendar Component */}
            <Calendar
              value={month}
              view="month"
              showNavigation={false} // Disable navigation since all months are shown
              className="mx-auto"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllMonthsCalendar;
