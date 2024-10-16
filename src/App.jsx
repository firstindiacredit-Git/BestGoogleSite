import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import SearchPage from "./components/SearchPage.jsx";
import AddList from "./components/Calculator.jsx";
import Signin from "./components/Signup/signin.jsx";
import Signup from "./components/Signup.jsx";
import AddLinks from "./components/Admin/AddLinks.jsx";
import Dashboard from "./components/Admin/Dashboard.jsx";
import Login from "./components/Admin/Login.jsx";
import Users from "./components/Admin/Users.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/AddList" element={<AddList />} />
        <Route path="/Signin" element={<Signin />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/admin/addlinks" element={<AddLinks />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
