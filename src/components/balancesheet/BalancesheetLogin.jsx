import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Typography, message } from "antd";
import { useAuth } from "../../context/AuthContext";

const { Title, Text } = Typography;

function Login() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Check for existing authentication when component mounts
  useEffect(() => {
    // If user is already authenticated, redirect to main app search page
    if (user && !loading) {
      message.success("Welcome back! You&apos;re already logged in.");
      navigate("/search");
    }
  }, [user, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Card className="backdrop-blur-sm" style={{ width: 400, backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
          <div style={{ textAlign: "center" }}>
            <Title level={3}>Checking authentication...</Title>
          </div>
        </Card>
      </div>
    );
  }

  // If user is already authenticated, don't render the login form
  if (user) {
    return null;
  }

  // Show "Login to use this feature" message instead of login form
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
      }}
    >
      <Card className="backdrop-blur-sm" style={{ width: 400, backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>
            🔐
          </div>
          <Title level={2} style={{ marginBottom: "16px" }}>
            Login Required
          </Title>
          <Text style={{ fontSize: "16px", color: "#666", marginBottom: "24px" }}>
            Please login to access the Balance Sheet feature
          </Text>
          {/* <Button
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
          </Button> */}
        </div>
      </Card>
    </div>
  );


}

export default Login;
