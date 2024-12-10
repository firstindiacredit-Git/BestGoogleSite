import React from "react";

const IframePage = () => {
  return (
    <div className="body bg-[#f4f4f5] d-flex py-lg-3 py-md-2 flex-column">
      <div
        className="flex-grow-1"
        style={{ minHeight: "85vh", overflow: "hidden" }}
      >
        <iframe
          src="https://pizeonflytools.vercel.app/"
          style={{
            width: "100%",
            height: "80vh",
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
