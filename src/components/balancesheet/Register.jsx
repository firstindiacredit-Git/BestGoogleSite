import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Title } = Typography;

function Register() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();

  const handleSubmit = async (values) => {
    try {
      console.log('Registration form submitted with values:', {
        email: values.email,
        username: values.username
      });

      // Check if passwords match
      if (values.password !== values.confirmPassword) {
        message.error('Passwords do not match!');
        return;
      }

      const result = await register(values.username, values.email, values.password);
      console.log('Registration result:', result);
      
      if (result.success) {
        message.success('Registration successful!');
        navigate('/search');
      } else {
        // Handle specific error cases
        if (result.error?.includes('username')) {
          message.error('This username is already taken. Please choose another one.');
        } else if (result.error?.includes('email')) {
          message.error('This email is already registered. Please use another email.');
        } else {
          message.error(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.data?.code === 11000) {
        if (err.response.data.keyPattern.username) {
          message.error('This username is already taken. Please choose another one.');
        } else if (err.response.data.keyPattern.email) {
          message.error('This email is already registered. Please use another email.');
        }
      } else {
        message.error(err.message || 'An error occurred during registration');
      }
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>Register</Title>
        </div>
        
        <Form
          form={form}
          name="register"
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Username" 
              size="large"
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
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
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
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              block
            >
              Register
            </Button>
          </Form.Item>

          <Form.Item>
            <Button
              icon={<GoogleOutlined />}
              type="default"
              size="large"
              block
              style={{ marginBottom: 8 }}
              onClick={async () => {
                const result = await loginWithGoogle();
                if (result.success) {
                  navigate('/dashboard');
                }
              }}
            >
              Continue with Google
            </Button>
          </Form.Item>

          <Form.Item>
            <Button 
              type="link" 
              onClick={() => navigate('/dashboard')}
              block
            >
              Already have an account? Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Register; 