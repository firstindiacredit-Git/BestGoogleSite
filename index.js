import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import NewsState from "./provider/NewsState";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <NewsState>
        <App />
      </NewsState>
    </BrowserRouter>
  </React.StrictMode>
);
