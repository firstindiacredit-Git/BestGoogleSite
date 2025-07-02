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
    <div className="min-h-screen p-8 bg-blue-100 dark:bg-[#513a7a] to-gray-200">
      <Back/>
      {/* Header with Year Navigation */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <button
          onClick={handlePreviousYear}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-800 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 dark:hover:bg-blue-900 transition"
        >
          Previous Year
        </button>
        <h1 className="text-center text-3xl font-bold mx-8 text-gray-800 dark:text-white">
          {year}
        </h1>
        <button
          onClick={handleNextYear}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-800 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 dark:hover:bg-blue-900 transition"
        >
          Next Year
        </button>
      </div>

      {/* Grid Layout for Monthly Calendars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {months.map((month, index) => (
          <div
            key={index}
            className="bg-white dark:bg-[#28283a] p-4 rounded-lg shadow-lg hover:shadow-xl transition"
          >
            {/* Month Name */}
            <h2 className="text-center text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
              {month.toLocaleString('default', { month: 'long' })}
            </h2>
            {/* Calendar Component */}
            <div className="react-calendar-container dark:bg-[#28283a] dark:text-gray-200 rounded-lg">
              <style>{`
                .dark .react-calendar {
                  background-color: #28283a !important;
                  color: #e5e7eb !important;
                  border-radius: 0.5rem !important;
                }
                .dark .react-calendar__tile {
                  background: transparent !important;
                  color: #e5e7eb !important;
                }
                .dark .react-calendar__tile--active,
                .dark .react-calendar__tile--now {
                  background: #3730a3 !important;
                  color: #fff !important;
                }
                .dark .react-calendar__navigation button {
                  color: #e5e7eb !important;
                }
              `}</style>
              <Calendar
                value={month}
                view="month"
                showNavigation={false}
                className="mx-auto react-calendar"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllMonthsCalendar;