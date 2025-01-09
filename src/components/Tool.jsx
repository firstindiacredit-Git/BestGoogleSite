import React from "react";

const IframePage = () => {
  return (
    <div className="mt-20">
      <div
        className="flex-grow-1"
        style={{ overflow: "clip",borderRadius:"1rem" }} // Removed the "red" background
      >
        <iframe
          src="https://pizeonflytools.vercel.app/"
          style={{
            width: "100%",
            height: "290vh",
            border: "none",
            position: "relative",
            top: "-4.5rem",
            borderRadius:"1rem"
          }}
          title="Tool"
        />
      </div>
    </div>
  );
};

export default IframePage;
