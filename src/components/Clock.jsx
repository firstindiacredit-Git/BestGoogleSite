import React, { useState, useEffect } from "react";
import styled from "styled-components";
import moment from "moment-timezone";
import { IoCloseOutline } from "react-icons/io5";
// import { ToastContainer, toast } from "react-toastify";
// import "./ToastifyNotification.css";
// import "react-toastify/dist/ReactToastify.css";

const ClockApp = () => {
  const [clockStyle, setClockStyle] = useState("digital");
  const [clocks, setClocks] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);

  const availableCountries = [
    { label: "USA", timezone: "America/New_York" },
    { label: "India", timezone: "Asia/Kolkata" },
    { label: "UK", timezone: "Europe/London" },
    { label: "Japan", timezone: "Asia/Tokyo" },
    { label: "Canada", timezone: "America/Toronto" },
    { label: "Australia", timezone: "Australia/Sydney" },
    { label: "Germany", timezone: "Europe/Berlin" },
    { label: "China", timezone: "Asia/Shanghai" },
    { label: "Brazil", timezone: "America/Sao_Paulo" },
    { label: "South Africa", timezone: "Africa/Johannesburg" },
    { label: "Russia", timezone: "Europe/Moscow" },
    { label: "France", timezone: "Europe/Paris" },
    { label: "Italy", timezone: "Europe/Rome" },
    { label: "Mexico", timezone: "America/Mexico_City" },
    { label: "Argentina", timezone: "America/Argentina/Buenos_Aires" },
    { label: "Saudi Arabia", timezone: "Asia/Riyadh" },
    { label: "South Korea", timezone: "Asia/Seoul" },
    { label: "Turkey", timezone: "Europe/Istanbul" },
    { label: "Singapore", timezone: "Asia/Singapore" },
    { label: "New Zealand", timezone: "Pacific/Auckland" },
  ];

  useEffect(() => {
    const savedClockStyle = localStorage.getItem("clockStyle") || "digital";
    const savedSelectedCountries = JSON.parse(
      localStorage.getItem("selectedCountries")
    ) || ["USA", "India", "UK", "Japan"];
    setClockStyle(savedClockStyle);
    setSelectedCountries(savedSelectedCountries);
  }, []);

  useEffect(() => {
    const updatedClocks = availableCountries.filter((country) =>
      selectedCountries.includes(country.label)
    );
    setClocks(updatedClocks);
  }, [selectedCountries]);

  const handleClockStyleChange = (style) => {
    setClockStyle(style);
    localStorage.setItem("clockStyle", style);
  };

  const handleAddClock = (countryLabel) => {
    if (
      selectedCountries.length < 4 &&
      !selectedCountries.includes(countryLabel)
    ) {
      const updatedCountries = [...selectedCountries, countryLabel];
      setSelectedCountries(updatedCountries);
      localStorage.setItem(
        "selectedCountries",
        JSON.stringify(updatedCountries)
      );
      // toast.success(`Clock for ${countryLabel} added!`);
    } else if (selectedCountries.length >= 4) {
      // toast.warn("You can only add up to 4 clocks.");
    }
  };

  const handleRemoveClock = (label) => {
    const updatedCountries = selectedCountries.filter(
      (country) => country !== label
    );
    setSelectedCountries(updatedCountries);
    localStorage.setItem("selectedCountries", JSON.stringify(updatedCountries));
  };

  const getCurrentTime = (timezone) =>
    moment()
      .tz(timezone)
      .format(clockStyle === "digital" ? "HH:mm:ss" : "h:mm A");

  return (
    <div className="flex flex-col h-[10rem] mt-5 items-center border rounded-lg p-4 justify-center">
      <StyledWrapper>
        <div className="flex gap-1 mt-6">
          <select
            onChange={(e) => handleClockStyleChange(e.target.value)}
            value={clockStyle}
            className="px-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="digital">Digital</option>
            <option value="analog">Analog</option>
          </select>
          <select
            onChange={(e) => handleAddClock(e.target.value)}
            className="border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a country</option>
            {availableCountries.map((country) => (
              <option key={country.label} value={country.label}>
                {country.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid justify-items-between items-center grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  ">
          <div className="w-80 mx-auto -ml-7 justify-between">
            <div className="justify-center flex flex-grow-0 w-full m-auto ">
              {clocks.map((clock) => (
                <div key={clock.label} className="card relative group">
                  <Clock clockStyle={clockStyle} timezone={clock.timezone} />
                  <h2 className="text-xs ml-2 font-mono text-center dark:text-white">
                    {clock.label}
                  </h2>
                  <button
                    onClick={() => handleRemoveClock(clock.label)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white  hover:bg-red-500 hover:text-black rounded-2xl transition-opacity"
                  >
                    <IoCloseOutline size={24} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </StyledWrapper>
      {/* <ToastContainer /> */}
      {/* <ToastContainer /> */}
    </div>
  );
};

const Clock = ({ clockStyle, timezone }) => {
  const [time, setTime] = useState(moment().tz(timezone));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(moment().tz(timezone));
    }, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return clockStyle === "analog" ? (
    <AnalogClock time={time} />
  ) : (
    <DigitalClock time={time} />
  );
};

const DigitalClock = ({ time }) => (
  <DigitalClockWrapper>
    <h2 className="digital-clock-text ">{time.format("HH:mm:ss")}</h2>
  </DigitalClockWrapper>
);
const AnalogClock = ({ time }) => {
  const hours = time.hours() % 12;
  const minutes = time.minutes();
  const seconds = time.seconds();

  const hourDegrees = (hours + minutes / 60) * 30;
  const minuteDegrees = (minutes + seconds / 60) * 6;
  const secondDegrees = seconds * 6;

  return (
    <AnalogClockWrapper size="60px">
      <div className="realistic-clock">
        <div className="clock-face">
          <div className="glass-cover" />
          <div
            className="hour hand"
            style={{ transform: `rotate(${hourDegrees}deg)` }}
          />
          <div
            className="minute hand"
            style={{ transform: `rotate(${minuteDegrees}deg)` }}
          />
          <div
            className="second hand"
            style={{ transform: `rotate(${secondDegrees}deg)` }}
          />
          <div className="center-circle" />
          <div className="clock-numbers">
            {[...Array(12)].map((_, i) => {
              const angle = (i + 1) * (360 / 12);
              const radius = 23;
              const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius + 29;
              const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius + 29;
              return (
                <p
                  key={i}
                  style={{
                    top: `${y}px`,
                    left: `${x}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                  className="number"
                >
                  {i + 1}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </AnalogClockWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
    padding: 20px;
    text-align: center;
    width: 80px;
  }
`;

const DigitalClockWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 25px;
  width: 69px;
  margin-left: -5px;
  background: #111;
  border-radius: 10%;

  .digital-clock-text {
    font-size: 12px;
    color: #fff;
    font-family: "Courier New", monospace;
    text-align: center;
    padding: 10px;
  }
`;

const AnalogClockWrapper = styled.div`
  .realistic-clock {
    position: relative;
    width: ${(props) => props.size || "60px"};
    height: ${(props) => props.size || "60px"};
    margin: 10px auto;
  }

  .clock-face {
    position: relative;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, #333, #111);
    border-radius: 50%;
    border: 1px solid #cec5c5;
    box-shadow: 0 0 0px rgba(0, 0, 0, 0.5),
      inset 0 0 5px rgba(255, 255, 255, 0.1);
  }

  .glass-cover {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    z-index: 2;
    transform: translate(-50%, -50%);
  }

  .hand {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2px;
    height: 50%;
    background: #fff;
    transform-origin: 50% 100%;
    transition: transform 0.1s ease;
  }

  .hour {
    height: 23%;
    top: 30%;
    background-color: #ff6600;
  }

  .minute {
    height: 34%;
    top: 17%;
    background-color: #66ccff;
  }

  .second {
    height: 34%;
    top: 17%;
    width: 1px;
    background-color: red;
  }

  .center-circle {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    background-color: #fff;
    border-radius: 50%;
    z-index: 3;
    transform: translate(-50%, -50%);
  }

  .clock-numbers {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);
  }

  .number {
    position: absolute;
    font-size: 10px;
    font-weight: bold;
    color: #fff;
    transition: all 0.3s ease;
  }
`;

export default ClockApp;
