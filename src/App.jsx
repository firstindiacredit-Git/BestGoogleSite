import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/AuthContext.jsx";
import SearchPage from "./components/SearchPage.jsx";
import AddList from "./components/Calculator.jsx";
import Signin from "./components/Signup/signin.jsx";
import Signup from "./components/Signup.jsx";
import NewSearchPage from "./components/NewSearchPage.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import Forgotpassword from "./components/Signup/Forgotpassword.jsx";
import AddLinks from "./components/Admin/AddLinks.jsx";
import Dashboard from "./components/Admin/Dashboard.jsx";
import AddBookmark from "./components/Admin/AddBookmark.jsx";
import Login from "./components/Admin/Login.jsx";
import Users from "./components/Admin/Users.jsx";
import PremiumPage from "./components/PremiumPage.jsx";
import PasswordGenerator from "./components/PasswordGenerater.jsx";
import PremiumForm from "./components/PremiumForm.jsx";
import Sidebar from "./components/Admin/Sidebar.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/AddList" element={<AddList />} />
          <Route path="/Signin" element={<Signin />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/NewSearchPage" element={<NewSearchPage />} />
          <Route path="/Forgotpassword" element={<Forgotpassword />} />
          <Route path="/ProfilePage" element={<ProfilePage />} />
          <Route path="/PremiumPage" element={<PremiumPage />} />
          <Route path="/PasswordGenerator" element={<PasswordGenerator />} />
          <Route path="/PremiumForm" element={<PremiumForm />} />
          <Route path="/admin/login" element={<Login />} />
          <Route element={<Sidebar />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/AddBookmark" element={<AddBookmark />} />
            <Route path="/admin/addlinks" element={<AddLinks />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
