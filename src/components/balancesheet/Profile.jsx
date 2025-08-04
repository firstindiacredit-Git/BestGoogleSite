import React, { useState, useEffect } from "react";
import {
  Card,
  Avatar,
  Typography,
  Row,
  Col,
  Button,
  Upload,
  message,
  Form,
  Input,
  Modal,
  Divider,
  Space,
  Spin,
  Layout,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  EditOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  CloseOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../config";
import "./Profile.css";

const { Title, Text } = Typography;
const { Content } = Layout;

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUserDetails(data.user);
        form.setFieldsValue({
          username: data.user.username,
          email: data.user.email,
        });
        if (data.user.avatar) {
          setImageUrl(data.user.avatar);
        }
      } else {
        message.error(data.message || "Failed to fetch profile");
      }
    } catch (error) {
      message.error("Error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    // Set current values as placeholders
    form.setFieldsValue({
      username: userDetails?.username || user?.username,
      email: userDetails?.email || user?.email,
    });
  };

  const handleCancel = () => {
    setEditing(false);
    form.resetFields();
    form.setFieldsValue({
      username: userDetails?.username || user?.username,
      email: userDetails?.email || user?.email,
    });
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Prepare update data
      const updateData = {
        username: values.username,
        email: values.email,
      };

      // If password fields are filled, include password change
      if (values.currentPassword && values.newPassword) {
        updateData.currentPassword = values.currentPassword;
        updateData.newPassword = values.newPassword;
      }

      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (response.ok) {
        message.success("Profile updated successfully");
        setEditing(false);
        fetchUserProfile();
        // Clear password fields
        form.setFieldsValue({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        message.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      message.error("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (info) => {
    if (info.file.status === "uploading") {
      return;
    }
    if (info.file.status === "done") {
      setImageUrl(info.file.response.url);
      message.success("Avatar updated successfully");
      // Refresh user data to update avatar in context
      fetchUserProfile();
    }
  };

  const handlePreview = (file) => {
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  if (loading) {
    return (
      <Layout className="profile-layout">
        <Content className="profile-content">
          <div className="loading-container">
            <Spin size="large" />
            <Text>Loading profile...</Text>
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="profile-layout">
      <Content className="profile-content">
        <Card
          style={{
            marginBottom: "24px",
            background: "linear-gradient(45deg, #2196F3 30%, #64B5F6 90%)",
            borderRadius: "8px",
          }}
          bodyStyle={{ padding: "24px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center ",
            }}
          >
            <div>
              <Title level={2} style={{ color: "white", margin: 0 }}>
                Profile Settings
              </Title>
              <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                Manage your account information
              </Text>
            </div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/")}
              style={{
                color: "white",
                borderColor: "white",
                background: "rgba(255, 255, 255, 0.2)",
              }}
            >
              Back to Dashboard
            </Button>
          </div>
        </Card>

        <Row justify="center">
          <Col xs={24} sm={20} md={16} lg={12}>
            <Card
              className="profile-card"
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <Upload
                  name="avatar"
                  showUploadList={false}
                  action={`${API_URL}/api/users/avatar`}
                  headers={{
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  }}
                  onChange={handleImageUpload}
                  onPreview={handlePreview}
                >
                  <Avatar
                    size={120}
                    src={user?.photoURL || imageUrl}
                    icon={<UserOutlined />}
                    style={{
                      border: "4px solid #f0f0f0",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  />
                </Upload>
                <Title
                  level={3}
                  style={{ marginTop: "16px", marginBottom: "8px" }}
                >
                  {userDetails?.username || user?.username}
                </Title>
                <Text type="secondary" style={{ fontSize: "16px" }}>
                  {userDetails?.email || user?.email}
                </Text>
              </div>

              <Divider />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <Title level={4} style={{ margin: 0 }}>
                  Account Information
                </Title>
                {!editing ? (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                    size="large"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Space>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={() => form.submit()}
                      size="large"
                    >
                      Save Changes
                    </Button>
                    <Button
                      icon={<CloseOutlined />}
                      onClick={handleCancel}
                      size="large"
                    >
                      Cancel
                    </Button>
                  </Space>
                )}
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                disabled={!editing}
                initialValues={{
                  username: userDetails?.username || user?.username,
                  email: userDetails?.email || user?.email,
                }}
              >
                <Form.Item
                  name="username"
                  label="Username"
                  rules={[
                    {
                      required: true,
                      message: "Please input your username!",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    size="large"
                    placeholder={
                      userDetails?.username ||
                      user?.username ||
                      "Enter your username"
                    }
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    {
                      required: true,
                      message: "Please input your email!",
                    },
                    {
                      type: "email",
                      message: "Please enter a valid email!",
                    },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    size="large"
                    placeholder={
                      userDetails?.email || user?.email || "Enter your email"
                    }
                  />
                </Form.Item>

                <Divider>Change Password</Divider>

                <Form.Item
                  name="currentPassword"
                  label="Current Password"
                  rules={[
                    {
                      required: editing,
                      message: "Please input your current password!",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    size="large"
                    placeholder="Enter current password"
                  />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  label="New Password"
                  rules={[
                    {
                      required: editing,
                      message: "Please input your new password!",
                    },
                    {
                      min: 6,
                      message: "Password must be at least 6 characters!",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    size="large"
                    placeholder="Enter new password"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Confirm New Password"
                  dependencies={["newPassword"]}
                  rules={[
                    {
                      required: editing,
                      message: "Please confirm your new password!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Passwords do not match!")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    size="large"
                    placeholder="Confirm new password"
                  />
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>

        <Modal
          open={previewVisible}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
        >
          <img
            alt="avatar preview"
            style={{ width: "100%" }}
            src={previewImage}
          />
        </Modal>
      </Content>
    </Layout>
  );
};

export default Profile;
