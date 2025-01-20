import React from "react";

const IframePage = () => {
  return (
    <div className="mx-auto w-[90vw] pb-10 ">
      <div className="p-8 bg-white/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)]">
        <div className="rounded-sm h-[90vh]" style={{ overflow: "clip" }}>
          <iframe
            src="https://pizeonflytools.vercel.app/"
            style={{
              width: "100%",
              height: "100vh",
              border: "none",
              position: "relative",
              top: "-5rem",
            }}
            className="rounded-sm"
            title="Tool"
          />
        </div>
      </div>
    </div>
  );
};

export default IframePage;
