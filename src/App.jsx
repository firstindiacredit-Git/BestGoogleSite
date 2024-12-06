import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import SearchPage from "./components/SearchPage.jsx";
import AddList from "./components/Calculator.jsx";
import Signin from "./components/Signup/signin.jsx";
import Signup from "./components/Signup.jsx";
import NewSearchPage from "./components/NewSearchPage.jsx";
import Weather from "./components/Weather.jsx";
import AddLinks from "./components/Admin/AddLinks.jsx";
import Dashboard from "./components/Admin/Dashboard.jsx";
import Login from "./components/Admin/Login.jsx";
import Users from "./components/Admin/Users.jsx";
import PremiumPage from "./components/PremiumPage.jsx";
import PasswordGenerator from "./components/PasswordGenerater.jsx";
import PremiumForm from "./components/PremiumForm.jsx";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/AddList" element={<AddList />} />
        <Route path="/Signin" element={<Signin />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/NewSearchPage" element={<NewSearchPage />} />
        <Route path="/Weather" element={<Weather />} />
        <Route path="/admin/addlinks" element={<AddLinks />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/PremiumPage" element={<PremiumPage />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/PasswordGenerator" element={<PasswordGenerator />} />
        <Route path="/PremiumForm" element={<PremiumForm />} />
      </Routes>
    </Router>
  );
}

export default App;
