import React from "react";
import { Menu, Button, Space } from "antd";
import {
  HomeOutlined,
  CalculatorOutlined,
  FileTextOutlined,
  UserOutlined,
  SearchOutlined,
  LockOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const HeaderComponent = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "Home",
    },
    {
      key: "/AddList",
      icon: <CalculatorOutlined />,
      label: "Calculator",
    },
    {
      key: "/Notes",
      icon: <FileTextOutlined />,
      label: "Notes",
    },
    {
      key: "/NewSearchPage",
      icon: <SearchOutlined />,
      label: "New Search",
    },
    {
      key: "/PasswordGenerator",
      icon: <LockOutlined />,
      label: "Password Generator",
    },
    {
      key: "/PremiumPage",
      icon: <CrownOutlined />,
      label: "Premium",
    },
  ];

  const handleMenuClick = (e) => {
    navigate(e.key);
  };

  return (
    <div className="flex justify-between items-center px-6 h-16 border-b">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold mr-8">BestGoogle</h1>
        <Menu
          mode="horizontal"
          items={menuItems}
          onClick={handleMenuClick}
          className="border-0"
        />
      </div>
      <Space>
        <Button
          type="text"
          icon={<UserOutlined />}
          onClick={() => navigate("/Signin")}
        >
          Sign In
        </Button>
        <Button type="primary" onClick={() => navigate("/Signup")}>
          Sign Up
        </Button>
      </Space>
    </div>
  );
};

export default HeaderComponent;
