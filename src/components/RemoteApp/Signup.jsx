import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { mockSignup } from './mockApi';

const { Title, Text } = Typography;

const Signup = ({ onSignupSuccess, onLoginClick }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      // Check if passwords match
      if (values.password !== values.confirmPassword) {
        message.error('Passwords do not match!');
        setLoading(false);
        return;
      }
      
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...signupData } = values;
      
      // Use mock API for testing (replace with real API when backend is ready)
      const response = await mockSignup(signupData);
      
      if (response.success) {
        message.success('Account created successfully!');
        // Call the success callback
        if (onSignupSuccess) {
          onSignupSuccess();
        }
      } else {
        message.error(response.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      message.error(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'transparent',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: 400, 
          maxWidth: '100%', 
          background: 'rgba(20, 20, 20, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src="/Images/flydesk1.png" alt="FlyDesk" style={{ height: '40px', marginBottom: '20px' }} />
          <Title level={3} style={{ color: 'white', margin: 0 }}>Create an Account</Title>
        </div>
        
        <Form
          name="signup_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Username" 
              size="large"
              style={{ 
                background: 'rgba(30, 30, 30, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Email" 
              size="large"
              style={{ 
                background: 'rgba(30, 30, 30, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Password"
              size="large"
              style={{ 
                background: 'rgba(30, 30, 30, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Confirm Password"
              size="large"
              style={{ 
                background: 'rgba(30, 30, 30, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block 
              loading={loading}
              style={{
                background: "linear-gradient(90deg, #0066FF 0%, #00BFFF 100%)",
                borderColor: "transparent",
                height: "45px",
                fontSize: "16px",
                fontWeight: "500",
                borderRadius: '8px',
                marginTop: '10px'
              }}
            >
              Sign Up
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Already have an account? <button 
                onClick={onLoginClick}
                style={{ 
                  color: '#00BFFF', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Log in
              </button>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Signup;
