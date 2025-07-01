import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("../Admin/login");
      window.location.reload();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-white dark:bg-[#37375d] dark:text-white shadow p-5 flex justify-between items-center">
      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
        Admin Dashboard
      </div>
    </header>
  );
}