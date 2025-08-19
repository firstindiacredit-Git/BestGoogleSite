import React, { useState } from "react";
import dayjs from "dayjs";
import holidays from "./holidays";
import {
  ArrowDown,
  ArrowDown01,
  ArrowDownIcon,
  ArrowDownNarrowWide,
  ArrowDownZA,
} from "lucide-react";

const FullCalendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showYearSelect, setShowYearSelect] = useState(false);
  const [yearInput, setYearInput] = useState(currentDate.year());
  const [monthInput, setMonthInput] = useState(currentDate.month());
  const [showTooltip, setShowTooltip] = useState(null);
  const [showDecadeSelect, setShowDecadeSelect] = useState(false);
  const [showGoToModal, setShowGoToModal] = useState(false);
  const [goToYear, setGoToYear] = useState(currentDate.year());
  const [goToMonth, setGoToMonth] = useState(currentDate.month());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

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

  const generateCalendarDays = () => {
    const firstDayOfMonth = dayjs(
      new Date(currentDate.year(), currentDate.month(), 1)
    );
    // const lastDayOfMonth = firstDayOfMonth.endOf("month");
    const startDate = firstDayOfMonth.startOf("week");

    // Always show 6 weeks (42 days)
    const totalDays = 42;
    const days = [];

    for (let i = 0; i < totalDays; i++) {
      const currentDate = startDate.add(i, "day");
      days.push({
        date: currentDate,
        dayOfMonth: currentDate.date(),
        isCurrentMonth: currentDate.month() === firstDayOfMonth.month(),
        isToday: currentDate.isSame(dayjs(), "day"),
      });
    }

    return days;
  };

  const generateYearRange = (year) => {
    const startYear = Math.floor(year / 10) * 10;
    return Array.from({ length: 12 }, (_, i) => startYear + i - 1);
  };

  const isToday = (date) => {
    return date.format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD");
  };

  const isSelected = (date) => {
    return (
      selectedDate &&
      date.format("YYYY-MM-DD") === selectedDate.format("YYYY-MM-DD")
    );
  };

  const getHolidayDetails = (date) => {
    return holidays.find(
      (holiday) =>
        dayjs(holiday.date.iso).format("YYYY-MM-DD") ===
        date.format("YYYY-MM-DD")
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(currentDate.subtract(1, "month"));
  };

  const goToNextMonth = () => {
    setCurrentDate(currentDate.add(1, "month"));
  };

  const goToToday = () => {
    setCurrentDate(dayjs());
    setSelectedDate(dayjs());
  };

  const handleYearMonthSubmit = () => {
    setCurrentDate(dayjs().year(yearInput).month(monthInput));
    setShowYearSelect(false);
    setShowDecadeSelect(false);
  };

  const goToPreviousDecade = () => {
    setYearInput(yearInput - 10);
  };

  const goToNextDecade = () => {
    setYearInput(yearInput + 10);
  };

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`w-full  mx-auto  rounded-sm p-3 backdrop-blur-sm text-gray-900 dark:text-gray-100`}
      style={{ height: '350px', minHeight: '350px' }}
    >
      {/* Header */}
      <div className="">
        <div className="flex items-center  justify-between ">
          {!isCollapsed && (
            <div className="flex items-center mt-2 justify-between px-2">
              <button
                onClick={goToPreviousMonth}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() => setShowYearSelect(true)}
                className="text-lg font-medium hover:text-indigo-500 dark:hover:text-blue-400 transition-colors"
              >
                {currentDate.format("MMMM")}
              </button>
              <button
                onClick={goToNextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}

          {!isCollapsed && (
            <div className="flex items-center mt-2 gap-2">
              <button
                onClick={() => {
                  setCurrentDate(currentDate.subtract(1, "year"));
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() => {
                  setShowDecadeSelect(true);
                  setShowYearSelect(false);
                }}
                className="text-lg font-medium hover:text-indigo-500 dark:hover:text-blue-400 transition-colors"
              >
                {currentDate.format("YYYY")}
              </button>
              <button
                onClick={() => {
                  setCurrentDate(currentDate.add(1, "year"));
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Year/Month Selector Modal */}
      {showYearSelect && (
        <div
          className="z-50 absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowYearSelect(false);
            }
          }}
        >
          <div className="bg-white dark:bg-[#513a7a] p-6 rounded-xl shadow-xl w-72 border dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Select Month</h3>
              <button
                onClick={() => setShowYearSelect(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {months.map((month, index) => (
                <button
                  key={month}
                  onClick={() => {
                    setMonthInput(index);
                    handleYearMonthSubmit();
                  }}
                  className={`p-3 rounded-sm font-medium transition-colors ${
                    monthInput === index
                      ? "bg-indigo-500 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {month.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Decade Selector Modal */}
      {showDecadeSelect && (
        <div
          className="z-50 absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDecadeSelect(false);
            }
          }}
        >
          <div className="bg-white dark:bg-[#513a7a] p-6 rounded-xl shadow-xl w-72 border dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPreviousDecade}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h3 className="text-lg font-semibold">
                {Math.floor(yearInput / 10) * 10} -{" "}
                {Math.floor(yearInput / 10) * 10 + 9}
              </h3>
              <button
                onClick={goToNextDecade}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {generateYearRange(yearInput).map((year) => (
                <button
                  key={year}
                  onClick={() => {
                    setYearInput(year);
                    setCurrentDate(currentDate.year(year));
                    setShowDecadeSelect(false);
                  }}
                  className={`p-3 rounded-sm font-medium transition-colors ${
                    yearInput === year
                      ? "bg-indigo-500 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Go To Modal */}
      {showGoToModal && (
        <div
          className="z-50 absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowGoToModal(false);
            }
          }}
        >
          <div className="bg-white dark:bg-[#513a7a] p-6 rounded-xl shadow-xl w-80 border dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Go to Date</h3>
              <button
                onClick={() => setShowGoToModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Month</label>
                <div className="grid grid-cols-4 gap-1">
                  {months.map((month, index) => (
                    <button
                      key={month}
                      onClick={() => setGoToMonth(index)}
                      className={`p-2 rounded-sm text-sm transition-colors ${
                        goToMonth === index
                          ? "bg-indigo-500 text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {month.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className=" w-fit">
                <label className="block text-sm font-medium mb-1  w-fit">
                  Year
                </label>
                <div className="flex w-full ">
                  <button
                    onClick={() => setGoToYear((prev) => prev - 1)}
                    className="p-2  rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={goToYear}
                    onChange={(e) => setGoToYear(parseInt(e.target.value))}
                    className="flex-1 w-1/2 px-1 py-2  dark:bg-[#513a7a] rounded-sm border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setGoToYear((prev) => prev + 1)}
                    className="p-2 rounded-sm  hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowGoToModal(false)}
                  className="px-4 py-2 text-sm rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setCurrentDate(dayjs().year(goToYear).month(goToMonth));
                    setShowGoToModal(false);
                  }}
                  className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-sm hover:bg-indigo-600"
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      {!isCollapsed && (
        <>
          <div
            className="grid grid-cols-7 gap-1"
            onMouseLeave={() => setShowTooltip(null)}
          >
            {/* Weekday headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm text-gray-500 dark:text-gray-400 py-2"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {generateCalendarDays().map((day, index) => {
              const isCurrentDay = isToday(day.date) && day.isCurrentMonth;
              const isSelectedDay = isSelected(day.date);
              const dayHoliday = getHolidayDetails(day.date);
              const isSunday = day.date.day() === 0;

              const colIndex = index % 7;
              const rowIndex = Math.floor(index / 7);
              const isRight = colIndex >= 5;
              const isBottom = rowIndex >= 4;
              // Tooltip position classes
              const horizontalClass = isRight ? 'right-0' : 'left-0';
              const verticalClass = isBottom ? 'bottom-full mb-1' : 'top-full mt-1';
              const originClass = isRight ? 'origin-right' : 'origin-left';

              return (
                <div
                  key={index}
                  className="relative"
                  onMouseEnter={() => {
                    if (dayHoliday && day.isCurrentMonth) {
                      setShowTooltip(index);
                    }
                  }}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <div
                    className={`
                  relative h-10 w-full rounded-md transition-colors
                  ${
                    !day.isCurrentMonth
                      ? "text-gray-300 dark:text-gray-700"
                      : ""
                  }
                  ${
                    isSunday && day.isCurrentMonth
                      ? "bg-gray-100/80 dark:bg-[#513a7a]/20"
                      : ""
                  }
                  ${
                    dayHoliday && day.isCurrentMonth
                      ? "text-indigo-600 dark:text-indigo-400"
                      : ""
                  }
                  ${
                    isCurrentDay
                      ? "bg-indigo-500 dark:bg-[#483072] text-white"
                      : ""
                  }
                  ${
                    isSelectedDay && !isCurrentDay
                      ? "border-2 border-blue-500 dark:border-white"
                      : ""
                  }
                  ${
                    !isCurrentDay && !isSelectedDay && day.isCurrentMonth
                      ? "hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      : ""
                  }
                `}
                    onClick={() =>
                      day.isCurrentMonth && setSelectedDate(day.date)
                    }
                  >
                    <span className="absolute inset-0 flex items-center justify-center">
                      {day.dayOfMonth}
                    </span>
                  </div>
                  {showTooltip === index && dayHoliday && (
                    <div
                      className={`absolute w-40 max-h-36 overflow-y-auto p-2 text-sm bg-white dark:bg-[#513a7a] text-gray-900 dark:text-gray-100 rounded-sm shadow-lg border border-gray-200 dark:border-gray-700 ${horizontalClass} ${verticalClass} ${originClass}`}
                      style={{ zIndex: 999 }}
                      onMouseEnter={() => setShowTooltip(index)}
                      onMouseLeave={() => setShowTooltip(null)}
                    >
                      <div className="font-bold">{dayHoliday.name}</div>
                      <div className="text-xs mt-1">
                        {dayHoliday.description}
                      </div>
                      <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                        Type: {dayHoliday.type.join(", ")}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-between items-center gap-2">
            <button
              onClick={() => {
                setGoToYear(currentDate.year());
                setGoToMonth(currentDate.month());
                setShowGoToModal(true);
              }}
              className="px-4 py-1.5 text-white text-sm rounded-md bg-indigo-500 hover:bg-indigo-600 hover:dark:bg-[#483072] dark:bg-[#513a7a] dark:hover:bg-gray-700  dark:text-gray-300 transition-colors flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Go to
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-1.5 text-sm dark:bg-[#513a7a]  bg-indigo-500 hover:bg-indigo-600 hover:dark:bg-[#483072] text-white rounded-md transition-colors flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
              Today
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FullCalendar;