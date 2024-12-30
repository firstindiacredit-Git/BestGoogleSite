import React, { useState } from "react";
import dayjs from "dayjs";
import holidays from "./holidays";

const FullCalendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showYearSelect, setShowYearSelect] = useState(false);
  const [yearInput, setYearInput] = useState(currentDate.year());
  const [monthInput, setMonthInput] = useState(currentDate.month());
  const [showTooltip, setShowTooltip] = useState(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const generateCalendarDays = () => {
    const firstDayOfMonth = dayjs(new Date(currentDate.year(), currentDate.month(), 1));
    const lastDayOfMonth = firstDayOfMonth.endOf('month');
    const startDate = firstDayOfMonth.startOf('week');
    
    // Always show 6 weeks (42 days)
    const totalDays = 42;
    const days = [];
    
    for (let i = 0; i < totalDays; i++) {
      const currentDate = startDate.add(i, 'day');
      days.push({
        date: currentDate,
        dayOfMonth: currentDate.date(),
        isCurrentMonth: currentDate.month() === currentDate.month(),
        isToday: currentDate.isSame(dayjs(), 'day'),
      });
    }
    
    return days;
  };

  const isToday = (date) => {
    return date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
  };

  const isSelected = (date) => {
    return selectedDate && date.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD');
  };

  const getHolidayDetails = (date) => {
    return holidays.find(holiday => 
      dayjs(holiday.date.iso).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  };

  const goToNextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'));
  };

  const goToToday = () => {
    setCurrentDate(dayjs());
    setSelectedDate(dayjs());
  };

  const handleYearMonthSubmit = () => {
    setCurrentDate(dayjs().year(yearInput).month(monthInput));
    setShowYearSelect(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-xl p-4 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">
            {currentDate.format('MMMM')}
          </h2>
          <button
            onClick={() => setShowYearSelect(true)}
            className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            Go to
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={goToPreviousMonth}
            className="p-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {"<"}
          </button>
          <span className="text-lg">{currentDate.format('YYYY')}</span>
          <button 
            onClick={goToNextMonth}
            className="p-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {">"}
          </button>
        </div>
      </div>

      {/* Year/Month Selector Modal */}
      {showYearSelect && (
        <div className="z-50 absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-64">
            <h3 className="text-lg font-semibold mb-4">Go to Date</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Year</label>
                <input
                  type="number"
                  value={yearInput}
                  onChange={(e) => setYearInput(parseInt(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"
                  min="1900"
                  max="2100"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Month</label>
                <select
                  value={monthInput}
                  onChange={(e) => setMonthInput(parseInt(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowYearSelect(false)}
                  className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleYearMonthSubmit}
                  className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {generateCalendarDays().map((day, index) => {
          const isCurrentDay = isToday(day.date);
          const isSelectedDay = isSelected(day.date);
          const dayHoliday = getHolidayDetails(day.date);
          const isSunday = day.date.day() === 0;

          return (
            <div
              key={index}
              className="relative"
              onMouseEnter={() => dayHoliday && setShowTooltip(index)}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <button
                onClick={() => setSelectedDate(day.date)}
                className={`
                  relative h-10 w-full text-center rounded-lg transition-colors
                  ${!day.isCurrentMonth ? 'text-gray-300 dark:text-gray-600 pointer-events-none opacity-50' : ''}
                  ${isSunday && day.isCurrentMonth ? 'bg-gray-100/80 dark:bg-gray-800/80' : ''}
                  ${dayHoliday && day.isCurrentMonth ? 'text-blue-600 dark:text-blue-400' : ''}
                  ${isCurrentDay ? 'bg-blue-500 text-white' : ''}
                  ${isSelectedDay && !isCurrentDay ? 'border-2 border-blue-500 dark:border-white' : ''}
                  ${!isCurrentDay && !isSelectedDay && day.isCurrentMonth ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : ''}
                `}
              >
                <span className="absolute inset-0 flex items-center justify-center">
                  {day.dayOfMonth}
                </span>
              </button>
              {showTooltip === index && dayHoliday && (
                <div 
                  style={{zIndex:"999"}} 
                  className="absolute w-48 p-2 mb-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="font-bold">{dayHoliday.name}</div>
                  <div className="text-xs mt-1">{dayHoliday.description}</div>
                  <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                    Type: {dayHoliday.type.join(", ")}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Today button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={goToToday}
          className="px-4 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
        >
          Today
        </button>
      </div>
    </div>
  );
};

export default FullCalendar;
