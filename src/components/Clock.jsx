import React, { useState, useEffect } from "react";
import styled from "styled-components";
import moment from "moment-timezone";
import { IoCloseOutline } from "react-icons/io5";
import { ToastContainer, toast } from "react-toastify"; // Import toastify
import "react-toastify/dist/ReactToastify.css"; 
import "./ToastifyNotification.css";

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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedClockStyle = localStorage.getItem("clockStyle") || "digital";
    const savedSelectedCountries = JSON.parse(
      localStorage.getItem("selectedCountries")
    ) || ["USA", "India", "UK", "Japan"]; // Default to 3 countries

    setClockStyle(savedClockStyle);
    setSelectedCountries(savedSelectedCountries);
  }, []);

  // Update clocks when selectedCountries changes
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

      // Show toast notification when a new clock is added
      toast.success(`Clock for ${countryLabel} added!`);
    } else if (selectedCountries.length >= 4) {
      toast.warn("You can only add up to 4 clocks.");
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
    <div className="flex flex-col h-[10rem] items-center border rounded-lg p-4 justify-center">
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

        <div className="grid -ml-7 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {clocks.map((clock) => (
            <div key={clock.label} className="card relative group">
              <Clock clockStyle={clockStyle} timezone={clock.timezone} />
              <h2 className="text-sm font-mono text-center ml-5">
                {clock.label}
              </h2>
              <button
                onClick={() => handleRemoveClock(clock.label)}
                className="absolute top-2 -right-4 opacity-0 group-hover:opacity-100 bg-white hover:bg-red-500 hover:text-black rounded-2xl transition-opacity"
              >
                <IoCloseOutline size={24} />
              </button>
            </div>
          ))}
        </div>
      </StyledWrapper>
      <ToastContainer />
      {/* Add the ToastContainer here */}
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
  <div>
    <h2 className="text-xl font-mono text-green-500">
      {time.format("HH:mm:ss")}
    </h2>
  </div>
);

// Analog Clock Component
const AnalogClock = ({ time }) => {
  const hours = time.hours() % 12;
  const minutes = time.minutes();
  const seconds = time.seconds();

  const hourDegrees = (hours + minutes / 60) * 30;
  const minuteDegrees = (minutes + seconds / 60) * 6;
  const secondDegrees = seconds * 6;

  return (
    <AnalogClockWrapper>
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
          <div className="clock-numbers ">
            {[...Array(12)].map((_, i) => {
              const angle = (i + 1) * (360 / 12); // Calculate the angle for each number
              const radius = 24; // Adjust radius for small clock size
              const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius + 29; // Adjust x position
              const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius + 29; // Adjust y position
              return (
                <p
                  key={i}
                  style={{
                    top: `${y}px`,
                    left: `${x}px`,
                    transform: "translate(-50%, -50%)", // Center the text
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

// Styled Components
const StyledWrapper = styled.div`
  .card {
    padding: 20px;
    text-align: center;
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
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5),
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

  .center-circle {
    width: ${(props) => (props.size ? `calc(${props.size} / 15)` : "8px")};
    height: ${(props) => (props.size ? `calc(${props.size} / 15)` : "8px")};
    background-color: #333;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
  }

  .clock-numbers p {
    position: absolute;
    font-size: ${(props) =>
      props.size ? `calc(${props.size} / 5)` : "0.5rem"};
    color: white;
    transform-origin: 50% 50%;
  }

  .hour,
  .minute,
  .second {
    position: absolute;
    top: 50%;
    left: 50%;
    transform-origin: 0% 50%;
    transform: rotate(0deg);
  }

  .hour {
    width: 30%;
    height: ${(props) => (props.size ? `calc(${props.size} / 15)` : "4px")};
    background-color: #d1c8b1;
  }

  .minute {
    width: 50%;
    height: ${(props) => (props.size ? `calc(${props.size} / 20)` : "4px")};
    background-color: #8d8d8d;
  }

  .second {
    width: 50%;
    height: ${(props) => (props.size ? `calc(${props.size} / 20)` : "1px")};
    background-color: #f00;
  }
`;

export default ClockApp;
