import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Avatar, 
  Typography, 
  Row, 
  Col, 
  Statistic, 
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
  Descriptions,
  Tag
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  EditOutlined, 
  UploadOutlined,
  SaveOutlined,
  DollarOutlined,
  FileTextOutlined,
  PictureOutlined,
  ArrowLeftOutlined,
  CloseOutlined,
  CalendarOutlined,
  TeamOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { API_URL } from '../config';
import './Profile.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Content } = Layout;

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUserDetails(data);
        form.setFieldsValue({
          username: data.username,
          email: data.email,
          password: data.password,
          bio: data.bio || ''
        });
        if (data.avatar) {
          setImageUrl(data.avatar);
        }
      } else {
        message.error(data.message || 'Failed to fetch profile');
      }
    } catch (error) {
      message.error('Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(values)
      });
      const data = await response.json();
      if (response.ok) {
        message.success('Profile updated successfully');
        setEditing(false);
        fetchUserProfile();
      } else {
        message.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      message.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (info) => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      setImageUrl(info.file.response.url);
      message.success('Avatar updated successfully');
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
            marginBottom: '24px',
            background: 'linear-gradient(45deg, #2196F3 30%, #64B5F6 90%)',
            borderRadius: '8px',
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                Profile
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Manage your account settings
              </Text>
            </div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/')}
              style={{ 
                color: 'white',
                borderColor: 'white',
                background: 'rgba(255, 255, 255, 0.2)'
              }}
            >
              Back to Dashboard
            </Button>
          </div>
        </Card>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card className="profile-card">
              <div className="profile-header">
                <Upload
                  name="avatar"
                  showUploadList={false}
                  action={`${API_URL}/api/users/avatar`}
                  headers={{
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }}
                  onChange={handleImageUpload}
                  onPreview={handlePreview}
                >
                  <Avatar
                    size={120}
                    src={imageUrl}
                    icon={<UserOutlined />}
                    className="profile-avatar"
                  />
                </Upload>
                <Title level={3} className="profile-username">
                  {user?.username}
                </Title>
                <Text type="secondary" className="profile-email">
                  {user?.email}
                </Text>
                {user?.role && (
                  <Tag color="blue" className="profile-role">
                    {user.role}
                  </Tag>
                )}
              </div>
              <Divider />
              <Row gutter={[16, 16]} className="profile-stats">
                <Col span={12}>
                  <Statistic
                    title="Total Sheets"
                    value={userDetails?.totalSheets || 0}
                    prefix={<FileTextOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Total Entries"
                    value={userDetails?.totalEntries || 0}
                    prefix={<TeamOutlined />}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} md={16}>
            <Card className="profile-info-card">
              <div className="profile-info-header">
                <Title level={4}>Profile Information</Title>
                {!editing ? (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Space>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={() => form.submit()}
                    >
                      Save
                    </Button>
                    <Button
                      icon={<CloseOutlined />}
                      onClick={handleCancel}
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
                  username: user?.username,
                  email: user?.email,
                  createdAt: new Date(user?.createdAt).toLocaleDateString(),
                  updatedAt: new Date(user?.updatedAt).toLocaleDateString()
                }}
              >
                <Row gutter={[24, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="username"
                      label="Username"
                      rules={[
                        {
                          required: true,
                          message: 'Please input your username!',
                        },
                      ]}
                    >
                      <Input 
                        prefix={<UserOutlined />} 
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        {
                          required: true,
                          message: 'Please input your email!',
                        },
                        {
                          type: 'email',
                          message: 'Please enter a valid email!',
                        },
                      ]}
                    >
                      <Input 
                        prefix={<MailOutlined />} 
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Divider>Change Password</Divider>
                <Row gutter={[24, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="currentPassword"
                      label="Current Password"
                      rules={[
                        {
                          required: editing,
                          message: 'Please input your current password!',
                        },
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="newPassword"
                      label="New Password"
                      rules={[
                        {
                          required: editing,
                          message: 'Please input your new password!',
                        },
                        {
                          min: 6,
                          message: 'Password must be at least 6 characters!',
                        },
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name="bio"
                  label="Bio"
                >
                  <Input.TextArea rows={4} />
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
          <img alt="avatar preview" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </Content>
    </Layout>
  );
};

export default Profile; 