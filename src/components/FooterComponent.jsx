import React from "react";
import { Typography, Space } from "antd";

const { Link, Text } = Typography;

const FooterComponent = () => {
  return (
    <Space direction="vertical" align="center">
      <Space split="|">
        <Link href="/about">About</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </Space>
      <Text type="secondary">
        © {new Date().getFullYear()} AllMyTab. All rights reserved.
      </Text>
    </Space>
  );
};

export default FooterComponent;
