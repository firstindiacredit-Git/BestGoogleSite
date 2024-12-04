import React, { useState, useEffect } from "react";
import holidays from "./holidays"; // Import the holidays array

const getDaysInMonth = (year, month) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const FullCalendar = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [holidaysList, setHolidaysList] = useState([]);
  const [goToDate, setGoToDate] = useState("");

  // Generate years and months
  const years = Array.from({ length: 177 }, (_, i) => currentYear - 100 + i);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Generate the days for the selected month
  const days = getDaysInMonth(selectedYear, selectedMonth);

  // Get the first day of the week for alignment
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();

  useEffect(() => {
    // Filter holidays that fall in the selected year and month
    const filteredHolidays = holidays.filter((holiday) => {
      const holidayDate = new Date(holiday.date.iso);
      return (
        holidayDate.getFullYear() === selectedYear &&
        holidayDate.getMonth() === selectedMonth
      );
    });
    setHolidaysList(filteredHolidays);
  }, [selectedYear, selectedMonth]);

  // Check if a given day is a holiday
  const isHoliday = (date) => {
    return holidaysList.some((holiday) => {
      const holidayDate = new Date(holiday.date.iso);
      return holidayDate.getDate() === date.getDate();
    });
  };

  // Get the holiday details for a specific day
  const getHolidayDetails = (date) => {
    return holidaysList.find((holiday) => {
      const holidayDate = new Date(holiday.date.iso);
      return holidayDate.getDate() === date.getDate();
    });
  };

  // Navigate to the previous month
  const goToPreviousMonth = () => {
    setSelectedMonth((prevMonth) => {
      if (prevMonth === 0) {
        setSelectedYear((prevYear) => prevYear - 1);
        return 11; // December
      }
      return prevMonth - 1;
    });
  };

  // Navigate to the next month
  const goToNextMonth = () => {
    setSelectedMonth((prevMonth) => {
      if (prevMonth === 11) {
        setSelectedYear((prevYear) => prevYear + 1);
        return 0; // January
      }
      return prevMonth + 1;
    });
  };

  // Go to a specific date (month and year)
  const handleGoToDate = () => {
    const [year, month] = goToDate.split("-");
    setSelectedYear(parseInt(year, 10));
    setSelectedMonth(parseInt(month, 10));
  };

  // Go to today's date
  const goToToday = () => {
    const today = new Date();
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
  };

  return (
    <div className="border p-2 rounded-lg">
      {/* Year and Month Selectors */}
      <div className="flex justify-center gap-2 items-center mb-3">
        <button
          onClick={goToPreviousMonth}
          className="px-2 py-1 border rounded"
        >
          {"<"}
        </button>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          className="p-1 border rounded"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
          className="p-1 border rounded"
        >
          {months.map((month, index) => (
            <option key={index} value={index}>
              {month}
            </option>
          ))}
        </select>
        <button onClick={goToNextMonth} className="px-2 py-1 border rounded">
          {">"}
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {/* Weekday Headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-bold">
            {day}
          </div>
        ))}

        {/* Empty spaces for alignment */}
        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="text-center "></div>
        ))}

        {/* Days of the Month */}
        {days.map((date) => {
          const holiday = getHolidayDetails(date);
          return (
            <div
              key={date.toISOString()}
              className={`text-center px-2 py-1 border dark:text-white relative ${
                date.toDateString() === new Date().toDateString()
                  ? "bg-blue-200 dark:text-black font-bold"
                  : ""
              } ${holiday ? " font-bold" : ""}`}
            >
              {date.getDate()}
              {holiday && (
                <div className="absolute z-50 bottom-0 left-1/2 transform -translate-x-1/2 text-xs bg-gray-700 text-white px-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-300">
                  {holiday.name}
                </div>
              )}
              {holiday && (
                <div className="absolute inset-0  bg-black bg-opacity-50 hidden hover:block text-white text-xs p-2">
                  <div>
                    <strong>{holiday.name}</strong>
                  </div>
                  <div>{holiday.description}</div>
                  <div>Type: {holiday.type.join(", ")}</div>
                  <a
                    href={holiday.canonical_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    More Info
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Go to Today */}
      <div className="flex justify-center gap-2 mt-4">
        <button
          onClick={goToToday}
          className="px-2 py-1 border rounded text-black dark:text-white"
        >
          Go to Today
        </button>
      </div>
    </div>
  );
};

export default FullCalendar;
