import React from "react";

const IframePage = () => {
  return (
    <div className="mt-20">
      <div
        className="flex-grow-1"
        style={{  background:"red", overflow: "hidden", }}
      >
        <iframe
          src="https://pizeonflytools.vercel.app/"
          style={{
            width: "100%",
            height: "60vh",
            border: "none",
            position: "relative",
            top: "-4.5rem",
          }}
          title="Tool"
        />
      </div>
    </div>
  );
};

export default IframePage;
