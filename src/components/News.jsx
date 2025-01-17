import React from "react";

const News = () => {
  return (
    <div
      className="p-8 rounded-sm overflow-clip backdrop-blur-sm shadow-sm w-[90vw] mx-auto bg-gray-200/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)]"
      // style={{ borderRadius: "1rem" }}
    >
      <iframe
        src="https://news-app-sage-mu.vercel.app/"
        style={{
          width: "100%",
          height: "120vh",
          border: "none",
          position: "relative",
          top: "-16rem",
          borderRadius: "0.25rem",
        }}
        title="Tool"
      />
    </div>
  );
};

export default News;
