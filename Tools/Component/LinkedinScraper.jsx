import React from "react";
import { Back } from "./back";

const LinkedinScraper = () => {
    return (
        <div style={{ width: "100%", height: "700px", border: "1px solid #ccc" }}>
           <Back/>
            <iframe
                src="https://linked-in-extractor.vercel.app/" // Replace with the desired URL
                width="100%"
                height="100%"
                style={{ border: "none" }}
                title="Example Website"
            />
        </div>
    );
};

export default LinkedinScraper;

