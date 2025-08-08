import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  Modal,
  Input,
  Space,
  message,
  Popconfirm,
  Row,
  Col,
  Avatar,
  Menu,
  Table,
  Statistic,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  LogoutOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx';
import SheetManager from './SheetManager.jsx';

const { Title, Text } = Typography;

// Array of gradient colors for cards
const cardGradients = [
  'linear-gradient(45deg, #FF6B6B 30%, #FF8E8E 90%)',
  'linear-gradient(45deg, #4ECDC4 30%, #6EE7DE 90%)',
  'linear-gradient(45deg, #45B7D1 30%, #96D9E8 90%)',
  'linear-gradient(45deg, #96CEB4 30%, #B8E0D2 90%)',
  'linear-gradient(45deg, #FFD93D 30%, #FFE66D 90%)',
  'linear-gradient(45deg, #FF8B94 30%, #FFA5AD 90%)',
];

function BalancesheetDashboard({ onSheetClick }) {
  const [sheets, setSheets] = useState([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [sheetEntries, setSheetEntries] = useState([]);
  const [newSheetName, setNewSheetName] = useState('');
  const [editSheet, setEditSheet] = useState(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  useEffect(() => {
    // Only fetch sheets if user is actually logged in
    if (user && user._id) {
      fetchSheets();
    } else {
      // Don't read token if user is not logged in
      message.warning('Login to use this Feature');
      // Redirect to search page after showing message
      setTimeout(() => {
        navigate('/search');
      }, 2000);
    }
  }, [user, navigate]);

  // Additional effect to monitor authentication state changes
  useEffect(() => {
    const checkAuth = () => {
      // Only check token if user is actually logged in
      if (!user || !user._id) {
        message.warning('Login to use this Feature');
        // Redirect to search page after showing message
        setTimeout(() => {
          navigate('/search');
        }, 2000);
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        message.warning('Login to use this Feature');
        // Redirect to search page after showing message
        setTimeout(() => {
          navigate('/search');
        }, 2000);
      }
    };

    // Check auth on mount and set up interval
    checkAuth();
    const interval = setInterval(checkAuth, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchSheets = async () => {
    try {
      // Only read token if user is actually logged in
      if (!user || !user._id) {
        message.warning('Login to use this Feature');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        message.warning('Login to use this Feature');
        return;
      }

      const response = await axios.get('/sheets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSheets(response.data);
    } catch (error) {
      console.error('Error fetching sheets:', error);
      
      if (error.response?.status === 401) {
        // Unauthorized - clear token and show alert
        localStorage.removeItem('token');
        localStorage.removeItem('userCredentials');
        message.warning('Login to use this Feature');
      } else if (error.response?.status === 500) {
        message.error('Server error. Please try again later.');
      } else {
        message.error('Failed to fetch balance sheets');
      }
    }
  };

  // Separate owned and shared sheets
  const ownedSheets = sheets.filter(sheet => sheet.user === user?._id);
  const sharedSheets = sheets.filter(sheet => sheet.user !== user?._id);

  const handleCreateSheet = async () => {
    try {
      const response = await axios.post('/sheets', {
        name: newSheetName
      });
      setSheets([...sheets, response.data]);
      setIsCreateModalVisible(false);
      setNewSheetName('');
      message.success('Balance sheet created successfully');
    } catch (error) {
      console.error('Error creating sheet:', error);
      message.error('Failed to create balance sheet');
    }
  };

  const handleEditSheet = async () => {
    try {
      const response = await axios.put(`/sheets/${editSheet._id}`, {
        name: editSheet.name
      });
      setSheets(sheets.map(sheet => 
        sheet._id === editSheet._id ? response.data : sheet
      ));
      setIsEditModalVisible(false);
      setEditSheet(null);
      message.success('Balance sheet updated successfully');
    } catch (error) {
      console.error('Error updating sheet:', error);
      message.error('Failed to update balance sheet');
    }
  };

  const handleDeleteSheet = async (sheetId) => {
    try {
      // Show loading message
      const loadingMessage = message.loading('Deleting balance sheet...', 0);
      
      // Make the delete request
      await axios.delete(`/sheets/${sheetId}`);
      
      // Update the UI
      setSheets(sheets.filter(sheet => sheet._id !== sheetId));
      
      // Close loading message and show success
      loadingMessage();
      message.success('Balance sheet deleted successfully');
    } catch (error) {
      console.error('Error deleting sheet:', error);
      
      // Show appropriate error message based on the error type
      if (error.response) {
        switch (error.response.status) {
          case 404:
            message.error('Balance sheet not found');
            break;
          case 401:
            message.error('Please log in again to delete the sheet');
            break;
          default:
            message.error('Failed to delete balance sheet. Please try again.');
        }
      } else {
        message.error('Network error. Please check your connection and try again.');
      }
    }
  };

  const handlePreviewSheet = async (sheet) => {
    try {
      setSelectedSheet(sheet);
      const response = await axios.get(`/sheets/${sheet._id}/entries`);
      setSheetEntries(response.data);
      setIsPreviewModalVisible(true);
    } catch (error) {
      console.error('Error fetching sheet entries:', error);
      message.error('Failed to load sheet preview');
    }
  };

  const calculateTotals = (entries) => {
    const income = entries
      .filter(entry => entry.type === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0);
    const expenses = entries
      .filter(entry => entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0);
    return { income, expenses, balance: income - expenses };
  };

  const handleMenuClick = (key, sheet) => {
    switch (key) {
      case 'edit':
        setEditSheet(sheet);
        setIsEditModalVisible(true);
        break;
      case 'preview':
        handlePreviewSheet(sheet);
        break;
      case 'delete':
        // Delete is handled by Popconfirm
        break;
      default:
        break;
    }
  };

  const menu = (sheet) => (
    <Menu onClick={({ key }) => handleMenuClick(key, sheet)}>
      <Menu.Item key="preview" icon={<EyeOutlined />}>
        View Sheet
      </Menu.Item>
      <Menu.Item key="edit" icon={<EditOutlined />}>
        Edit
      </Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
        <Popconfirm
          title="Delete Balance Sheet"
          description={
            <div>
              <p>Are you sure you want to delete "{sheet.name}"?</p>
              <p style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '8px' }}>
                Warning: This will permanently delete all entries in this sheet.
              </p>
            </div>
          }
          onConfirm={() => handleDeleteSheet(sheet._id)}
          okText="Yes, Delete"
          cancelText="No, Cancel"
          okButtonProps={{ 
            danger: true,
            style: { backgroundColor: '#ff4d4f' }
          }}
          cancelButtonProps={{ style: { borderColor: '#d9d9d9' } }}
        >
          Delete
        </Popconfirm>
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <span style={{ color: type === 'income' ? '#52c41a' : '#ff4d4f' }}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => (
        <span style={{ color: record.type === 'income' ? '#52c41a' : '#ff4d4f' }}>
          ₹{amount.toFixed(2)}
        </span>
      ),
    },
  ];

  const handleSheetUpdated = (updatedSheet) => {
    setSheets(sheets.map(sheet => 
      sheet._id === updatedSheet._id ? updatedSheet : sheet
    ));
    message.success('Sheet updated successfully');
  };

  const handleSheetDeleted = (deletedSheetId) => {
    setSheets(sheets.filter(sheet => sheet._id !== deletedSheetId));
    message.success('Sheet deleted successfully');
  };

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('userCredentials');
    localStorage.removeItem('username');
    
    // Call the original logout function
    logout();
    
    // Redirect to main app home
    navigate('/search');
  };

  return (
    <div className='bg-transparent backdrop-blur-sm' style={{ padding: '24px', paddingBottom: '50px', minHeight: '100vh' }}>
      {/* Desktop Header */}
      <Card
        style={{
          marginBottom: '24px',
          background: 'linear-gradient(45deg, #2196F3 30%, #64B5F6 90%)',
          borderRadius: '8px',
        }}
        bodyStyle={{ padding: '24px' }}
        className="desktop-header"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ color: 'white', margin: 0 }}>
              Balance Sheets
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Welcome back, {user?.username || 'User'}!
            </Text>
          </div>
          <Space>
            {/* <Avatar 
              src={user?.photoURL}
              icon={<UserOutlined />} 
              onClick={() => navigate('/profile')}
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            /> */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
              style={{ backgroundColor: '#4CAF50' }}
            >
              New Sheet
            </Button>
            {/* <Button
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className='dark:bg-white/30 backdrop-blur-xl dark:text-white'
              style={{ color: 'blue', borderColor: 'white' }}
            >
              Logout
            </Button> */}
          </Space>
        </div>
      </Card>

      {/* Mobile Header */}
      <Card
        style={{
          marginBottom: '24px',
          background: 'linear-gradient(45deg, #2196F3 30%, #64B5F6 90%)',
          borderRadius: '8px',
        }}
        bodyStyle={{ padding: '16px' }}
        className="mobile-header"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              Balance Sheets
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {user?.username || 'User'}
            </Text>
          </div>
        </div>
      </Card>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <div className="nav-item" onClick={() => navigate('/profile')}>
          <UserOutlined />
          <span>Profile</span>
        </div>
        <div className="nav-item" onClick={() => setIsCreateModalVisible(true)}>
          <PlusOutlined />
          <span>New Sheet</span>
        </div>
        <div className="nav-item" onClick={handleLogout}>
          <LogoutOutlined />
          <span>Logout</span>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 576px) {
          .desktop-header {
            display: none;
          }
          .mobile-header {
            display: block;
          }
          .mobile-bottom-nav {
            display: flex;
          }
        }
        @media (min-width: 577px) {
          .mobile-header {
            display: none !important;
          }
          .desktop-header {
            display: block;
          }
          .mobile-bottom-nav {
            display: none !important;
            visibility: hidden;
            opacity: 0;
            pointer-events: none;
          }
        }
        .mobile-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: white;
          display: flex;
          justify-content: space-around;
          align-items: center;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          height: 100%;
          cursor: pointer;
          color: #666;
          transition: all 0.3s ease;
        }
        .nav-item:hover {
          color: #1890ff;
        }
        .nav-item span {
          font-size: 12px;
          margin-top: 4px;
        }
        .nav-item .anticon {
          font-size: 20px;
        }
      `}</style>

      {/* Owned Sheets Section */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={3} style={{ 
          marginBottom: '16px',
          fontSize: { xs: '1rem', sm: '1.5rem', md: '1.75rem' }
        }}>My Balance Sheets</Title>
        <Row gutter={[24, 24]}>
          {ownedSheets.map((sheet, index) => (
            <Col xs={24} sm={12} md={8} key={sheet._id}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  background: cardGradients[index % cardGradients.length],
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                bodyStyle={{ padding: '20px', height: '100%' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div onClick={() => onSheetClick ? onSheetClick(sheet._id) : navigate(`/sheet/${sheet._id}`)}>
                    <Title level={4} style={{ color: 'white', margin: 0 }}>
                      {sheet.name}
                    </Title>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Created: {new Date(sheet.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                  <SheetManager 
                    sheet={sheet}
                    onSheetUpdated={handleSheetUpdated}
                    onSheetDeleted={handleSheetDeleted}
                  />
                </div>
              </Card>
            </Col>
          ))}
          {ownedSheets.length === 0 && (
            <Col span={24}>
              <Empty
                description="No balance sheets created yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Col>
          )}
        </Row>
      </div>

      {/* Shared Sheets Section */}
      <div>
        <Title level={3} style={{ 
          marginBottom: '16px',
          fontSize: { xs: '1rem', sm: '1.5rem', md: '1.75rem' }
        }}>Shared with Me</Title>
        <Row gutter={[24, 24]}>
          {sharedSheets.map((sheet, index) => (
            <Col xs={24} sm={12} md={8} key={sheet._id}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  background: cardGradients[index % cardGradients.length],
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                bodyStyle={{ padding: '20px', height: '100%' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div onClick={() => onSheetClick ? onSheetClick(sheet._id) : navigate(`/sheet/${sheet._id}`)}>
                    <Title level={4} style={{ color: 'white', margin: 0 }}>
                      {sheet.name}
                    </Title>
                    <div style={{ marginTop: '8px' }}>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.8)', display: 'block' }}>
                        <UserOutlined style={{ marginRight: '8px' }} />
                        Shared by: {sheet.sharedBy}
                      </Text>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.8)', display: 'block', marginTop: '4px' }}>
                        {/* ClockCircleOutlined is removed, so this line is removed */}
                        Shared on: {new Date(sheet.updatedAt).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
          {sharedSheets.length === 0 && (
            <Col span={24}>
              <Empty
                description="No balance sheets shared with you"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Col>
          )}
        </Row>
      </div>

      {/* Create Modal */}
      <Modal
        title="Create New Balance Sheet"
        open={isCreateModalVisible}
        onOk={handleCreateSheet}
        onCancel={() => {
          setIsCreateModalVisible(false);
          setNewSheetName('');
        }}
        okText="Create"
        cancelText="Cancel"
      >
        <Input
          placeholder="Enter sheet name"
          value={newSheetName}
          onChange={(e) => setNewSheetName(e.target.value)}
          onPressEnter={handleCreateSheet}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Balance Sheet"
        open={isEditModalVisible}
        onOk={handleEditSheet}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditSheet(null);
        }}
        okText="Save Changes"
        cancelText="Cancel"
      >
        <Input
          placeholder="Enter sheet name"
          value={editSheet?.name || ''}
          onChange={(e) => setEditSheet({ ...editSheet, name: e.target.value })}
          onPressEnter={handleEditSheet}
        />
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={
          <div>
            <Title level={4} style={{ margin: 0 }}>{selectedSheet?.name}</Title>
            <Text type="secondary">Sheet Preview</Text>
          </div>
        }
        open={isPreviewModalVisible}
        onCancel={() => {
          setIsPreviewModalVisible(false);
          setSelectedSheet(null);
          setSheetEntries([]);
        }}
        width={800}
        footer={null}
      >
        {selectedSheet && (
          <div>
            <Card style={{ marginBottom: '16px' }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Total Income"
                    value={calculateTotals(sheetEntries).income}
                    precision={2}
                    valueStyle={{ color: '#52c41a' }}
                    prefix="₹"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Total Expenses"
                    value={calculateTotals(sheetEntries).expenses}
                    precision={2}
                    valueStyle={{ color: '#ff4d4f' }}
                    prefix="₹"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Balance"
                    value={calculateTotals(sheetEntries).balance}
                    precision={2}
                    valueStyle={{ 
                      color: calculateTotals(sheetEntries).balance >= 0 ? '#52c41a' : '#ff4d4f' 
                    }}
                    prefix="₹"
                  />
                </Col>
              </Row>
            </Card>
            <Table
              columns={columns}
              dataSource={sheetEntries}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default BalancesheetDashboard; 