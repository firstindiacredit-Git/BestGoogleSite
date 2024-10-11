import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Header from "./components/Header";
import SearchPage from "./components/SearchPage";
import AddList from "./components/Calculator";
import Signin from "./components/Signup/signin";
import Signup from "./components/Signup/signup";
import AddLinks from "./components/Admin/AddLinks";
// import Header from "./components/Admin/Header";
import Dashboard from "./components/Admin/Dashboard";
import Login from "./components/Admin/Login";

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<Header />} /> */}
        <Route path="/" element={<SearchPage />} />
        <Route path="/AddList" element={<AddList />} />
        <Route path="/Signin" element={<Signin />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/admin/addlinks" element={<AddLinks />} />
        <Route path="/admin/login" element={<Login />} />

        <Route path="/admin/dashboard" element={<Dashboard />} />

        {/* Additional routes for search filters like Images, News, etc. */}
      </Routes>
    </Router>
  );
}

export default App;
