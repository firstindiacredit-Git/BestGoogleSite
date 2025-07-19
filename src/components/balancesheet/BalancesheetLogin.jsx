import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Title } = Typography;

function BalancesheetLogin({ onLoginSuccess }) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { balancesheetlogin, loginWithGoogle } = useAuth();

  const handleSubmit = async (values) => {
    try {
      console.log('Login form submitted with values:', {
        username: values.username
      });

      const result = await balancesheetlogin(values.username, values.password);
      console.log('Login result:', result);
      
      if (result.success) {
        message.success('Login successful!');
        if (onLoginSuccess) onLoginSuccess();
      } else {
        message.error(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      message.error(err.message || 'An error occurred during login');
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
          <Title level={2}>Login</Title>
        </div>
        
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Please input your username or email!' },
              { min: 3, message: 'Must be at least 3 characters!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Username or Email" 
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

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              block
            >
              Login
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
                  if (onLoginSuccess) onLoginSuccess();
                }
              }}
            >
              Continue with Google
            </Button>
          </Form.Item>

          <Form.Item>
            <Button 
              type="link" 
              onClick={() => navigate('/register')}
              block
            >
              Don't have an account? Register
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default BalancesheetLogin; 