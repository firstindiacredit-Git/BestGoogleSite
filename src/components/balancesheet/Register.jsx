import { useNavigate } from 'react-router-dom';
import { Button, Card, Typography, message } from 'antd';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

function Register() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Show "Login to use this feature" message instead of registration form
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', padding: "40px 20px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>
            🔐
          </div>
          <Title level={2} style={{ marginBottom: "16px" }}>
            Login Required
          </Title>
          <Text style={{ fontSize: "16px", color: "#666", marginBottom: "24px" }}>
            Please login to access the Balance Sheet feature
          </Text>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/search')}
            style={{
              height: "48px",
              fontSize: "16px",
              borderRadius: "8px",
            }}
          >
            Go to Login
          </Button>
        </div>
      </Card>
    </div>
  );


}

export default Register; 