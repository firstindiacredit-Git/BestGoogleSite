import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { useTheme } from '../context/ThemeContext';
import { 
  Layout, 
  Typography, 
  Button, 
  Card, 
  Input, 
  Checkbox,
  Space,
  Progress,
  Table,
  Tag,
  Divider,
  Row,
  Col,
  Statistic,
  Tooltip,
  Badge,
  message
} from 'antd';
import { 
  DownloadOutlined,
  SearchOutlined,
  ClearOutlined,
  PlayCircleOutlined,
  StopOutlined,
  EditOutlined,
  GlobalOutlined,
  PhoneOutlined,
  EnvironmentFilled,
  EnvironmentOutlined,
  StarOutlined,
  MailOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import PhoneInTalkRoundedIcon from '@mui/icons-material/PhoneInTalkRounded';
import PublicIcon from '@mui/icons-material/Public';
import Confetti from 'react-confetti';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

// Update the ResizableTitle component to be memoized
const ResizableTitle = React.memo(({ onResize, width, ...restProps }) => {
  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => e.stopPropagation()}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
});

function DataMiningTool() {
  const { isDarkMode } = useTheme();
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [controller, setController] = useState(null);
  const [extractEmail, setExtractEmail] = useState(false);
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [columnWidths, setColumnWidths] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [wasExtracting, setWasExtracting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);



  useEffect(() => {
    if (isExtracting) {
      setWasExtracting(true);
    }
    
    if (!isExtracting && wasExtracting && results.length > 0 && progress === 100) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        setWasExtracting(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isExtracting, wasExtracting, results.length, progress]);

  const handleStartExtract = async () => {
    if (isExtracting) {
      try {
        await fetch('http://45.61.57.93:5000/stop-scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        controller?.abort();
        setIsExtracting(false);
        setProgress(0);
        setEstimatedTime(null);
        setWasExtracting(false);
      } catch (error) {
        console.error('Error stopping extraction:', error);
      }
      return;
    }

    setIsExtracting(true);
    setResults([]);
    setTotalResults(0);
    setProgress(0);
    setStartTime(Date.now());
    setShowResults(true);

    const abortController = new AbortController();
    setController(abortController);

    try {
      const response = await fetch('http://45.61.57.93:5000/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: keywords,
          location: location,
          isPincode: /^\d{6}$/.test(location.trim()),
          total: 100,
          extractEmail
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

        for (const line of lines) {
          try {
            if (line.trim()) {
              const data = JSON.parse(line);
              
              if (data.type === 'update') {
                setResults(prev => [...prev, data.data]);
                setTotalResults(prev => prev + 1);
                setProgress(data.progress);

                if (startTime && data.progress > 0) {
                  const elapsedTime = (Date.now() - startTime) / 1000;
                  const itemsPerSecond = data.progress / elapsedTime;
                  const remainingItems = 100 - data.progress;
                  const estimatedSeconds = remainingItems / itemsPerSecond;
                  setEstimatedTime(Math.ceil(estimatedSeconds));
                }
              } else if (data.type === 'complete') {
                setProgress(100);
                setEstimatedTime(0);
              }
            }
          } catch (error) {
            console.error('Error parsing line:', error);
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Extraction stopped by user');
      } else {
        console.error('Error:', error);
      }
    } finally {
      setIsExtracting(false);
      setController(null);
      setStartTime(null);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch('http://45.61.57.93:5000/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: results }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'google_maps_data.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleClearData = () => {
    setResults([]);
    setTotalResults(0);
  };

  // Update handleResize to use useCallback with columnWidths dependency
  const handleResize = useCallback((index) => (_, { size }) => {
    setColumnWidths(prev => {
      const newWidths = { ...prev };
      newWidths[index] = size.width;
      return newWidths;
    });
  }, []);

  // Move columns definition outside of component or use useMemo with proper dependencies
  const columns = useMemo(() => [
    {
      title: 'S.No',
      dataIndex: 'index',
      key: 'index',
      width: 70,
      render: (_, __, index) => ((currentPage - 1) * pageSize) + index + 1,
      resizable: true,
    },
    {
      title: 'Title',
      dataIndex: 'name',
      key: 'name',
      render: (text) => text ? (
        <Tooltip title={text}>
          <div className="truncate">{text}</div>
        </Tooltip>
      ) : 'N/A',
      resizable: true,
    },
    {
      title: 'Country Code',
      dataIndex: 'countryCode',
      key: 'countryCode',
      render: (text) => text || '+91',
      resizable: true,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => text ? (
        <Tooltip title={text}>
          <div className="truncate">
            <PhoneInTalkRoundedIcon style={{ color: '#4caf50' }} />
            {text === 'N/A' ? text : text.slice(1)}
          </div>
        </Tooltip>
      ) : 'N/A',
      resizable: true,
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website',
      render: (text) => (
        <div className="truncate">
          <PublicIcon style={{ color: '#4caf50' }} />
          {text && text !== 'N/A' ? (
            <Button 
              type="link" 
              style={{ padding: '0 0 0 4px' }}
              href={text} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Visit
            </Button>
          ) : (
            <span style={{ marginLeft: '4px' }}>N/A</span>
          )}
        </div>
      ),
      resizable: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => text ? (
        <Tooltip title={text}>
          <div className="truncate">
            <Tag color="blue">{text}</Tag>
          </div>
        </Tooltip>
      ) : 'N/A',
      resizable: true,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (text) => text ? (
        <Space>
          <StarOutlined style={{ color: '#fadb14' }} />
          {text}
        </Space>
      ) : 'N/A',
      resizable: true,
    },
    {
      title: 'Reviews',
      dataIndex: 'reviews',
      key: 'reviews',
      render: (text) => text ? `(${text})` : 'N/A',
      resizable: true,
    },
    {
      title: 'Pincode',
      dataIndex: 'pincode',
      key: 'pincode',
      render: (text) => text || 'N/A',
      resizable: true,
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      render: (text) => {
        if (!text) return 'N/A';
        return (
          <Tooltip title={text}>
            <div className="truncate">
              {text}
            </div>
          </Tooltip>
        );
      },
      resizable: true,
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      render: (text) => text || 'N/A',
      resizable: true,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (text) => {
        if (typeof text !== 'string') return 'N/A';
        return (
          <Tooltip title={text}>
            <div className="truncate">
              < EnvironmentFilled style={{ color: '#4caf50' }} />
              {text.slice(1, 100)}
            </div>
          </Tooltip>
        );
      },
      resizable: true,
    },
  ], [currentPage, pageSize]); // Add currentPage and pageSize to dependencies

  // Memoize the email column addition
  const finalColumns = useMemo(() => {
    let cols = [...columns];
    if (extractEmail) {
      cols.push({
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        render: (text) => typeof text === 'string' ? (
          <Space>
            <MailOutlined />
            {text}
          </Space>
        ) : 'N/A',
      });
    }
    return cols;
  }, [columns, extractEmail]);

  // Update resizableColumns memoization
  const resizableColumns = useMemo(() => 
    finalColumns.map((col, index) => ({
      ...col,
      width: columnWidths[index] || col.width || 150,
      onHeaderCell: (column) => ({
        width: column.width,
        onResize: handleResize(index),
      }),
    })),
    [finalColumns, columnWidths, handleResize]
  );

  // Memoize filtered results
  const memoizedFilteredResults = useMemo(() => 
    results.filter(item => {
      if (!searchTerm) return true;
      
      const search = searchTerm.toString().trim().toLowerCase();
      const isPincodeSearch = /^\d{6}$/.test(search);
      
      if (isPincodeSearch) {
        return item.pincode === search;
      } else {
        return (
          item.name?.toLowerCase().includes(search) ||
          item.address?.toLowerCase().includes(search) ||
          item.city?.toLowerCase().includes(search) ||
          item.state?.toLowerCase().includes(search) ||
          item.pincode?.includes(search)
        );
      }
    }),
    [results, searchTerm]
  );

  // Memoize ResizableTitle component
  const MemoizedResizableTitle = useMemo(() => React.memo(ResizableTitle), []);

  return (
    <>
      <style>
        {`
          .dark-table .ant-table-thead > tr > th {
            background-color: #3a345f !important;
            color: #e2e8f0 !important;
            border-color: #4a456f !important;
          }
          .dark-table .ant-table-tbody > tr > td {
            background-color: #2a243f !important;
            color: #e2e8f0 !important;
            border-color: #4a456f !important;
          }
          .dark-table .ant-table-tbody > tr:hover > td {
            background-color: #3a345f !important;
          }
          .dark-table .ant-pagination-item {
            background-color: #3a345f !important;
            border-color: #4a456f !important;
          }
          .dark-table .ant-pagination-item a {
            color: #e2e8f0 !important;
          }
          .dark-table .ant-pagination-item-active {
            background-color: #513a7a !important;
            border-color: #513a7a !important;
          }
          .dark-table .ant-pagination-prev,
          .dark-table .ant-pagination-next {
            background-color: #3a345f !important;
            border-color: #4a456f !important;
          }
          .dark-table .ant-pagination-prev button,
          .dark-table .ant-pagination-next button {
            color: #e2e8f0 !important;
          }
          .dark-table .ant-select-selector {
            background-color: #3a345f !important;
            border-color: #4a456f !important;
            color: #e2e8f0 !important;
          }
          .dark-table .ant-input {
            background-color: #3a345f !important;
            border-color: #4a456f !important;
            color: #e2e8f0 !important;
          }
          .dark-table .ant-input::placeholder {
            color: #a0aec0 !important;
          }
          .dark-table .ant-checkbox-wrapper {
            color: #e2e8f0 !important;
          }
          .dark-table .ant-btn {
            color: #e2e8f0 !important;
          }
          .dark-table .ant-btn-primary {
            color: #fff !important;
          }
          .dark-table .ant-btn-danger  {
            color: #fff !important;
          }
          .dark-table .ant-input::placeholder {
            color: #a0aec0 !important;
          }
          .dark-table .ant-checkbox-wrapper {
            color: #e2e8f0 !important;
          }
          .dark-table .ant-checkbox-wrapper .ant-checkbox + span {
            color: #e2e8f0 !important;
          }
          .dark-table .ant-progress-text {
            color: #e2e8f0 !important;
          }
          .dark-table .ant-typography {
            color: #e2e8f0 !important;
          }
          .dark-table .ant-input-search .ant-input {
            background-color: #3a345f !important;
            border-color: #4a456f !important;
            color: #e2e8f0 !important;
          }
          .dark-table .ant-input-search .ant-input::placeholder {
            color: #a0aec0 !important;
          }
          .dark-table .ant-input-search .ant-input-search-button {
            background-color: #513a7a !important;
            border-color: #513a7a !important;
            color: #fff !important;
          }
          .dark-table .ant-input-search .ant-input-clear-icon {
            color: #e2e8f0 !important;
          }
        `}
      </style>
      <Layout className="app-layout" style={{ minHeight: '100vh',width: '95%',marginLeft: '2.5%' }}>
      <Header className="app-header" style={{ 
        background: isDarkMode ? '#1a1a2e' : '#ffffff', 
        padding: '16px 24px', 
        minHeight: '80px', 
        display: 'flex', 
        alignItems: 'center',
        borderBottom: isDarkMode ? '1px solid #2a243f' : '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="https://cdn-icons-png.flaticon.com/512/2642/2642502.png" 
              alt="Logo" 
              style={{ width: '40px', height: '40px', marginRight: '12px' }}
            />
            <div>
              <Title level={3} style={{ color: isDarkMode ? 'white' : '#1e293b', margin: 0, lineHeight: '1.2', fontSize: '24px' }}>
                Google Map Extractor
              </Title>
              <Text style={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.7)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Extract business data from Google Maps
              </Text>
            </div>
          </div>
          
          <div>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
            >
              Download Excel
            </Button>
          </div>
        </div>
      </Header>

      <Content style={{ 
        padding: '24px', 
        background: isDarkMode ? '#1a1a2e' : '#D6E1FE',
        minHeight: 'calc(100vh - 80px)'
      }}>
        <Row gutter={[16, 16]}>
          {/* Left side - Search Criteria */}
          <Col xs={24} md={8} lg={6} xl={5}>
            <Card 
              title={<Title level={4} style={{ textAlign: 'center', margin: 0, color: isDarkMode ? '#e2e8f0' : '#000' }}>SEARCH CRITERIA</Title>}
              bordered={false}
              style={{
                background: isDarkMode ? '#2a243f' : '#fff',
                border: isDarkMode ? '1px solid #3a345f' : '1px solid #f0f0f0'
              }}
              className={isDarkMode ? 'dark-table' : ''}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Input
                  placeholder="Keywords (e.g. restaurants, hotels)"
                  size="large"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  prefix={<SearchOutlined />}
                  style={{
                    background: isDarkMode ? '#3a345f' : '#fff',
                    border: isDarkMode ? '1px solid #4a456f' : '1px solid #d9d9d9',
                    color: isDarkMode ? '#e2e8f0' : '#000'
                  }}
                />
                
                <Input
                  placeholder="Location (city name or pincode)"
                  size="large"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  prefix={<EnvironmentOutlined />}
                  style={{
                    background: isDarkMode ? '#3a345f' : '#fff',
                    border: isDarkMode ? '1px solid #4a456f' : '1px solid #d9d9d9',
                    color: isDarkMode ? '#e2e8f0' : '#000'
                  }}
                />
                
                <Checkbox
                  checked={extractEmail}
                  onChange={(e) => setExtractEmail(e.target.checked)}
                  style={{
                    color: isDarkMode ? '#e2e8f0' : '#000'
                  }}
                >
                  Extract Email (Slower)
                </Checkbox>
                
                <Button
                  type="primary"
                  icon={isExtracting ? <StopOutlined /> : <PlayCircleOutlined />}
                  danger={isExtracting}
                  size="large"
                  onClick={handleStartExtract}
                  block
                >
                  {isExtracting ? 'Stop Extracting' : 'Start Extracting'}
                </Button>
                
                {isExtracting && (
                  <div>
                    <Progress 
                      percent={Math.round(progress)} 
                      status="active"
                      size="small"
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                      <Text>{totalResults}</Text>
                      {estimatedTime > 0 && (
                        <Text>Est: {Math.floor(estimatedTime / 60)}m {estimatedTime % 60}s</Text>
                      )}
                    </div>
                  </div>
                )}
                
                <Button
                  danger
                  icon={<ClearOutlined />}
                  onClick={handleClearData}
                  disabled={isExtracting || results.length === 0}
                  block
                  style={{
                    color: isDarkMode ? '#e2e8f0' : '#000'
                  }}
                >
                  Clear Results
                </Button>
              </Space>
            </Card>
          </Col>
          
          {/* Right side - Results Table */}
          <Col xs={24} md={16} lg={18} xl={19}>
            <Card 
              bordered={false}
              style={{
                background: isDarkMode ? '#2a243f' : '#fff',
                border: isDarkMode ? '1px solid #3a345f' : '1px solid #f0f0f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Badge 
                  count={totalResults} 
                  overflowCount={999}
                  style={{ backgroundColor: '#52c41a'}}
                >
                  <Title level={4} style={{ margin: 0, color: isDarkMode ? '#e2e8f0' : '#000' }}>RESULTS</Title>
                </Badge>
                
                <Search
                  placeholder="Search results..."
                  allowClear
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    width: 250,
                    background: isDarkMode ? '#3a345f' : '#fff',
                    border: isDarkMode ? '1px solid #4a456f' : '1px solid #d9d9d9',
                    color: isDarkMode ? '#e2e8f0' : '#000'
                  }}
                />
              </div>
              
              {isExtracting && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <LoadingOutlined style={{ fontSize: '24px', marginBottom: '16px' }} />
                  <div>Extracting data from Google Maps...</div>
                </div>
              )}
              
                             <Table
                 columns={resizableColumns}
                 dataSource={memoizedFilteredResults}
                 rowKey={(record, index) => index}
                 pagination={{
                   current: currentPage,
                   pageSize: pageSize,
                   total: memoizedFilteredResults.length,
                   onChange: (page, size) => {
                     setCurrentPage(page);
                     setPageSize(size);
                   },
                   showSizeChanger: true,
                   showQuickJumper: true,
                   showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                   pageSizeOptions: ['10', '20', '50', '100', '150'],
                   position: ['bottomCenter']
                 }}
                 scroll={{ x: 'max-content', y: 'calc(100vh - 400px)' }}
                 bordered
                 size="middle"
                 loading={false}
                 locale={{ emptyText: 'No data yet. Start extracting to see results.' }}
                 components={{
                   header: {
                     cell: MemoizedResizableTitle,
                   },
                 }}
                 style={{
                   background: isDarkMode ? '#2a243f' : '#fff'
                 }}
                 className={isDarkMode ? 'dark-table' : ''}
               />
            </Card>
          </Col>
        </Row>
             </Content>
       {showConfetti && <Confetti />}
     </Layout>
   </>
   );
 }

export default React.memo(DataMiningTool);