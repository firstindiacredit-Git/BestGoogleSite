import React, { useState, useEffect } from "react";
import { Table, Tag, Card, Statistic, Row, Col, DatePicker } from "antd";
import {
  DollarOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const { RangePicker } = DatePicker;

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    proUsers: 0,
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      // Fetch users with pro subscription
      const usersRef = collection(db, "users");
      const proQuery = query(
        usersRef,
        where("subscriptionStatus", "==", "pro")
      );
      const proSnapshot = await getDocs(proQuery);

      const transactionsData = [];
      let totalRevenue = 0;

      // Fetch transaction details from Braintree for each pro user
      for (const doc of proSnapshot.docs) {
        const userData = doc.data();
        if (userData.subscriptionId) {
          const response = await fetch(
            `http://localhost:3001/api/subscription/${userData.subscriptionId}`
          );
          const subscriptionData = await response.json();

          transactionsData.push({
            key: doc.id,
            userId: doc.id,
            email: userData.email,
            name: userData.displayName,
            amount: subscriptionData.price,
            status: subscriptionData.status,
            startDate: subscriptionData.createdAt,
            nextBillingDate: subscriptionData.nextBillingDate,
            planId: subscriptionData.planId,
          });

          if (subscriptionData.status === "Active") {
            totalRevenue += parseFloat(subscriptionData.price);
          }
        }
      }

      setTransactions(transactionsData);
      setStats({
        totalRevenue,
        activeSubscriptions: transactionsData.filter(
          (t) => t.status === "Active"
        ).length,
        proUsers: proSnapshot.size,
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "User",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `$${amount}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Next Billing",
      dataIndex: "nextBillingDate",
      key: "nextBillingDate",
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">
        Subscription Management
      </h1>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix="$"
              precision={2}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Subscriptions"
              value={stats.activeSubscriptions}
              valueStyle={{ color: "#1890ff" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Pro Users"
              value={stats.proUsers}
              valueStyle={{ color: "#722ed1" }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Date Range Filter */}
      <div className="mb-6">
        <RangePicker
          onChange={(dates) => {
            // Implement date filtering logic
          }}
        />
      </div>

      {/* Transactions Table */}
      <Table
        columns={columns}
        dataSource={transactions}
        loading={loading}
        pagination={{ pageSize: 10 }}
        className="dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
};

export default Transactions;
