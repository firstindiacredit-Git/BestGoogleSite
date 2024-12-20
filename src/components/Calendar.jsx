import React, { useState, useEffect } from "react";
import holidays from "./holidays";  

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
 
  const days = getDaysInMonth(selectedYear, selectedMonth);
 
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();
   const lastDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();

  useEffect(() => {
     
    const filteredHolidays = holidays.filter((holiday) => {
      const holidayDate = new Date(holiday.date.iso);
      return (
        holidayDate.getFullYear() === selectedYear &&
        holidayDate.getMonth() === selectedMonth
      );
    });
    setHolidaysList(filteredHolidays);
  }, [selectedYear, selectedMonth]);
 
  const getHolidayDetails = (date) => {
    return holidaysList.find((holiday) => {
      const holidayDate = new Date(holiday.date.iso);
      return holidayDate.getDate() === date.getDate();
    });
  };
 
  const goToPreviousMonth = () => {
    setSelectedMonth((prevMonth) => {
      if (prevMonth === 0) {
        setSelectedYear((prevYear) => prevYear - 1);
        return 11;  
      }
      return prevMonth - 1;
    });
  };
 
  const goToNextMonth = () => {
    setSelectedMonth((prevMonth) => {
      if (prevMonth === 11) {
        setSelectedYear((prevYear) => prevYear + 1);
        return 0; 
      }
      return prevMonth + 1;
    });
  };
 
  const goToToday = () => {
    const today = new Date();
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
  };
 
  const numberOfRows = Math.ceil((days.length + firstDayOfWeek) / 7);

  return (
    <div className="border p-2 h-[20rem] rounded-lg">
      {/* Year and Month Selectors */}
      <div className="flex justify-center gap-2 text-[14px] items-center mb-3">
        <button
          onClick={goToPreviousMonth}
          className="px-2 py-1 border text-[14px] dark:text-white rounded"
        >
          {"<"}
        </button>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          className="p-1 border dark:text-white dark:bg-gray-900 rounded"
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
          className="p-1 dark:text-white dark:bg-gray-900 border rounded"
        >
          {months.map((month, index) => (
            <option key={index} value={index}>
              {month}
            </option>
          ))}
        </select>
        <button
          onClick={goToNextMonth}
          className="px-2 dark:text-white py-1 border rounded"
        >
          {">"}
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 text-[14px] dark:text-blue-500 ">
        {/* Weekday Headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-bold">
            {day}
          </div>
        ))}

        {/* Empty spaces for alignment */}
        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="text-center border"></div>
        ))}

        {/* Days of the Month */}
        {days.map((date) => {
          const holiday = getHolidayDetails(date);
          const isSunday = date.getDay() === 0;
          return (
            <div
              key={date.toISOString()}
              className={`text-center px-2 py-1 border dark:text-white relative ${
                date.toDateString() === new Date().toDateString()
                  ? "bg-blue-200 dark:text-black font-bold"
                  : ""
              } ${holiday ? "bg-yellow-200 font-bold" : ""} ${
                isSunday ? "text-red-500 dark:text-red-500 font-bold" : "" // Add red styles for Sundays
              }`}
            >
              {date.getDate()}
              {holiday && (
                <div className="absolute z-50 bottom-0 left-1/2 transform -translate-x-1/2 text-[10px] bg-gray-700 text-white px-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-300">
                  {holiday.name}
                </div>
              )}
              {holiday && (
                <div className="absolute inset-0 bg-black bg-opacity-50 hidden hover:block text-white text-[14px] p-2">
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

        {/* Empty spaces at the end of the month */}
        {Array.from({
          length: (7 + ((days.length + lastDayOfWeek) % 7)) % 7,
        }).map((_, index) => (
          <div key={`empty-end-${index}`} className="text-center border"></div>
        ))}
      </div>

      {/* Go to Today */}
      <div className="flex  justify-center relative gap-2 mt-4">
        <button
          onClick={goToToday}
          className="px-2 py-1 text-[14px] border rounded text-black dark:text-white"
        >
          Go to Today
        </button>
      </div>
    </div>
  );
};

export default FullCalendar;
