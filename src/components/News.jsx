import React from "react";

const News = () => {
  return (
    <div className="p-8 border border-gray-200 dark:border-gray-800 bg-gray-200/10 dark:bg-[#513a7a]/10" style={{borderRadius:"1rem"}}>
      <div
        style={{ minHeight: "120vh", overflow: "clip",borderRadius:"1rem" }}
      >
        <iframe
          src="https://news-app-sage-mu.vercel.app/"
          style={{
            width: "100%",
            height: "120vh",
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

export default News;
