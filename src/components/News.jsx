import React from "react";

const News = () => {
  return (
    <div className="pb-10">
      <div className=" p-8 rounded-sm  backdrop-blur-sm shadow-sm w-[90vw] mx-auto bg-gray-200/[var(--widget-opacity)] dark:bg-[#513a7a]/[var(--widget-opacity)]">
        <div className="pt-5 h-[90vh]  rounded-2xl overflow-clip">
          <iframe
            src="https://news-app-sage-mu.vercel.app/"
            style={{
              width: "100%",
              height: "120vh",
              border: "none",
              position: "relative",
              top: "-16rem",
              borderRadius: "5rem",
            }}
            title="Tool"
          />
        </div>
      </div>
    </div>
  );
};

export default News;
