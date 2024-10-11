import React, { useState } from "react";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date().getDate();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const renderDays = () => {
    const daysArray = [];

    // Add empty divs to align the first day
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(<div key={`empty-${i}`} className="day w-12 h-12"></div>);
    }

    // Render days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === today &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear();
      const isSunday = new Date(year, month, day).getDay() === 0;

      daysArray.push(
        <div
          key={day}
          className={`day w-9 h-9 gap-1 flex items-center rounded-[50%] justify-center border border-gray-200 ${
            isToday ? "bg-blue-300" : ""
          } ${isSunday ? "text-red-500 font-bold" : "text-gray-600"}`}
        >
          {day}
        </div>
      );
    }

    return daysArray;
  };

  return (
    <div className="w-[35%] ml-[500px] h-[450px] mt-20 p-4 border border-gray-300 rounded-lg shadow-lg">
      <div className="header flex justify-between items-center mb-4">
        <button
          className="bg-gray-200 font-bold dark:bg-transparent border p-2 rounded"
          onClick={handlePreviousMonth}
        >
          Prev
        </button>
        <h2 className="text-lg font-bold">
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h2>
        <button
          className="bg-gray-200 p-2 font-bold dark:bg-transparent border rounded"
          onClick={handleNextMonth}
        >
          Next
        </button>
      </div>
      <div className="days grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={day}
            className="day text-center font-semibold text-gray-600"
          >
            {day}
          </div>
        ))}
        {renderDays()}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div>
      <Calendar />
    </div>
  );
};

export default Calendar;
