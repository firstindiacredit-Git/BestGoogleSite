import React from "react";

const IframePage = () => {
  return (
    <div className="modal-content bg-white shadow-lg w-full">
      
      <div className="modal-body">
        <iframe
          src="https://pizeonflytools.vercel.app/"
          style={{ width: "100%", height: "900px" }}
          title="URL Viewer"
          className=""
        ></iframe>
      </div>
    </div>
  );
};

export default IframePage;
