import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Typography, Spin, Alert, Radio, Input, List, Space, Table, Rate } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined, SearchOutlined, PlayCircleOutlined } from '@ant-design/icons';
import sportsmen from './sportsmen.json';
import brands from './brand.json';

const { Title } = Typography;
const { Search } = Input;

function WikipediaBanks() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://en.wikipedia.org/w/api.php?action=parse&page=List_of_largest_banks&format=json&origin=*"
        );
        const result = await response.json();
        const htmlContent = result.parse.text["*"];
        
        // Extract table data
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlContent;
        const tableElement = tempDiv.querySelector(".wikitable");
        
        // Convert HTML table to array of objects
        const rows = Array.from(tableElement.querySelectorAll("tr"));
        const headers = Array.from(rows[0].querySelectorAll("th")).map(th => th.textContent.trim());
        
        const tableData = rows.slice(1).map((row, index) => {
          const cells = Array.from(row.querySelectorAll("td"));
          const rowData = cells.map(cell => cell.textContent.trim());
          const obj = {
            key: index,
          };
          headers.forEach((header, i) => {
            obj[header] = rowData[i];
          });
          return obj;
        });

        setData(tableData);
        // console.log(tableData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = data.filter(item =>
    item['Bank name']?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item['Rank']?.toString().includes(searchQuery) ||
    item['Total assets(2023)(US$ billion)']?.toString().includes(searchQuery)
  );

  const renderGridView = () => (
    <Row gutter={[16, 16]}>
      {filteredData.map((item, index) => (
        <Col xs={24} sm={12} lg={8} key={index}>
          <Card
            title={`${index + 1}. ${item['Bank name'] || 'Unknown Bank'}`}
            bordered={true}
            hoverable
          >
            <p>Rank: {item['Rank'] || 'N/A'}</p>
            <p>Total Assets: {item['Total assets(2023)(US$ billion)'] || 'N/A'} billion USD</p>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderListView = () => (
    <List
      itemLayout="horizontal"
      dataSource={filteredData}
      renderItem={(item, index) => (
        <List.Item>
          <List.Item.Meta
            title={`${index + 1}. ${item['Bank name'] || 'Unknown Bank'}`}
            description={`Rank: ${item['Rank'] || 'N/A'} | Total Assets: ${item['Total assets(2023)(US$ billion)'] || 'N/A'} billion USD`}
          />
        </List.Item>
      )}
    />
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Search
          placeholder="Search banks..."
          allowClear
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 300 }}
        />
        <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
          <Radio.Button value="grid">
            <AppstoreOutlined />
          </Radio.Button>
          <Radio.Button value="list">
            <UnorderedListOutlined />
          </Radio.Button>
        </Radio.Group>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', margin: '2rem' }}>
          <Spin size="large" />
        </div>
      ) : (
        viewMode === 'grid' ? renderGridView() : renderListView()
      )}
    </div>
  );
}

const Top100Page = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('cars');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const API_KEY = 'BTOsYx47SEw8rRDvct+x+g==SUy2ivypa6z9mOk1';
  const year = new Date().getFullYear();
  // Updated APIs with real free API endpoints
  const APIs = {
    cars: `https://api.api-ninjas.com/v1/cars?limit=100&year=${year}`,
    stocks: 'https://finnhub.io/api/v1/stock/symbol?exchange=US&token=ctj9ln9r01qgfbt0ega0ctj9ln9r01qgfbt0egag',
    crypto: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100',
    billionaires: `https://forbes400.onrender.com/api/forbes400?limit=100&year=${year}`,
    banks: 'wikipedia',
    sportsmen: 'local',
    movies: 'https://imdb-top-100-movies.p.rapidapi.com/',
    brands: 'local'
  };

  const VIN_NUMBERS = [
    '5UXWX7C5*BA',
    '1HGCM82633A123456',
    'WDDUG7JB0FA123456',
    // Add more VIN numbers...
  ];

  // Update the filteredItems definition with null checks
  const filteredItems = items.map((item, index) => ({
    ...item,
    originalIndex: index
  })).filter(item =>
    (item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
    (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
  );

  const fetchTop100 = async (category) => {
    try {
      setLoading(true);
      
      if (category === 'sportsmen') {
        const processedData = sportsmen.map(person => ({
          name: `${person.name} ${' '} $${(person.contract_value_usd/1000000).toFixed(1)}M`,
          description: `Sport: ${person.sport}, Contract: ${person.length_of_contract}`
        }));
        setItems(processedData);
        setError(null);
        setLoading(false);
        return;
      }
      
      if (category === 'brands') {
        const processedData = brands.map(brand => ({
          name: `${brand.Brand}`,
          description: `Rank: ${brand.Rank}, Change: ${brand.Change}, Value: ${brand.Value}`,
          value: `$${brand.Value}M`
        }));
        setItems(processedData);
        setError(null);
        setLoading(false);
        return;
      }
      
      // console.log(`Fetching ${category} data...`);
      
      if (category === 'cars') {
        const response = await fetch(APIs[category], {
          headers: {
            'X-Api-Key': API_KEY,
            'Content-Type': 'application/json'
          },
        });
      
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        // console.log(`${category} API response:`, data);

        const processedData = data.map(vehicle => ({
          name: `${vehicle.make}, Model: ${vehicle.model}`,
          description: `Year: ${vehicle.year}, Class: ${vehicle.class || 'N/A'}, Transmission: ${vehicle.transmission || 'N/A'}`
        }));
        
        setItems(processedData);
        setError(null);
      } else if (category === 'movies') {
        const options = {
          method: 'GET',
          headers: {
            'x-rapidapi-key': 'ed98e198d3msha2890b3dde9a12dp1e7caejsnf255bf4ce34c',
            'x-rapidapi-host': 'imdb-top-100-movies.p.rapidapi.com'
          }
        };
        
        const response = await fetch(APIs[category], options);
        const data = await response.json();
        
        const processedData = data.map(movie => ({
          name: movie.title,
          description: `Year: ${movie.year}, Rating: ${movie.rating}`,
          image: movie.image,
          rating: movie.rating
        }));
        
        setItems(processedData);
        setError(null);
        setLoading(false);
        return;
      } else {
        const response = await fetch(APIs[category]);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const rawData = await response.text(); // Get raw response first
        // console.log(`Raw ${category} data:`, rawData.substring(0, 200)); // Debug log
        
        let data;
        // Special handling for CSV data from Alpha Vantage
        if (category === 'companies') {
          data = rawData; // Keep as string for CSV parsing
        } else {
          data = JSON.parse(rawData);
        }
        
        let processedData = [];
        switch(category) {
          case 'cars':
            if (!data.Results || !Array.isArray(data.Results)) {
              console.error('Unexpected cars data format:', data);
              throw new Error('Invalid cars data format');
            }
            processedData = data.Results
              .filter(item => item.Make_Name) // Filter out any items without names
              .map(item => ({
                name: item.Make_Name || 'Unknown Make',
                description: `Make ID: ${item.Make_ID || 'N/A'}`
              }));
            break;
          
          case 'crypto':
            if (!Array.isArray(data)) {
              console.error('Unexpected crypto data format:', data);
              throw new Error('Invalid crypto data format');
            }
            processedData = data.map(item => ({
              name: item.name || item.symbol || 'Unknown Crypto',
              description: `Price: $${item.current_price || 'N/A'}, Market Cap: $${item.market_cap || 'N/A'}`
            }));
            break;

          case 'stocks':
            if (!Array.isArray(data)) {
              console.error('Unexpected stocks data format:', data);
              throw new Error('Invalid stocks data format');
            }
            processedData = data.map(item => ({
              name: item.description || item.symbol || 'Unknown Stock',
              description: `Symbol: ${item.symbol || 'N/A'}, Type: ${item.type || 'N/A'}`
            }));
            break;

          case 'billionaires':
            if (!Array.isArray(data)) {
              console.error('Unexpected billionaires data format:', data);
              throw new Error('Invalid billionaires data format');
            }
            processedData = data.map(item => ({
              name: item.personName || 'Unknown Billionaire',
              description: `Net Worth: $${(item.finalWorth/1000).toFixed(1)}B, Source: ${item.source || 'N/A'}, Country: ${item.countryOfCitizenship || 'N/A'}`
            }));
            break;
        }
        
        // Filter out any invalid entries and take top 100
        processedData = processedData
          .filter(item => item.name && item.description)
          .slice(0, 100);

        if (processedData.length === 0) {
          throw new Error('No valid data found');
        }

        // console.log(`Processed ${category} data:`, processedData.slice(0, 2)); // Debug log
        setItems(processedData);
        setError(null); // Clear any previous errors
        
      }
    } catch (err) {
      // console.error(`Error fetching ${category} data:`, err);
      // setError(`Failed to fetch ${category} data: ${err.message}`);
      setItems([]); // Clear items on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true); // Set loading to true before fetching
    fetchTop100(category);
  }, [category, page]);

  const renderGridView = () => (
    <Row gutter={[16, 16]}>
      {filteredItems.map((item) => (
        <Col xs={24} sm={12} lg={8} key={item.originalIndex}>
          {category === 'movies' ? (
            <Card
              hoverable
              cover={
                <img
                  alt={item.name}
                  src={item.image}
                  style={{ height: '300px', objectFit: 'cover' }}
                />
              }
              actions={[
                <PlayCircleOutlined key="watch" />,
                <Rate disabled defaultValue={item.rating / 2} count={5} />
              ]}
            >
              <Card.Meta
                title={`${item.originalIndex + 1}. ${item.name}`}
                description={item.description}
              />
            </Card>
          ) : (
            <Card
              title={
                category === 'brands' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{item.originalIndex + 1}. {item.name}</span>
                    <span>{item.value}</span>
                  </div>
                ) : category === 'sportsmen' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{item.originalIndex + 1}. {item.name?.split('$')[0] || item.name}</span>
                    <span>{item.name?.includes('$') ? `$${item.name.split('$')[1]}` : ''}</span>
                  </div>
                ) : category === 'billionaires' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{item.originalIndex + 1}. {item.name?.split(',')[0] || item.name}</span>
                    <span>{item.description?.includes('$') ? item.description.split('$')[1]?.split(',')[0] : ''}</span>
                  </div>
                ) : category === 'crypto' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{item.originalIndex + 1}. {item.name}</span>
                    <span>{item.description?.includes('Price: $') ? `$${item.description.split('Price: $')[1]?.split(',')[0]}` : ''}</span>
                  </div>
                ) : (
                  `${item.originalIndex + 1}. ${item.name}`
                )
              }
              bordered={true}
              hoverable
            >
              {item.description}
            </Card>
          )}
        </Col>
      ))}
    </Row>
  );

  const renderListView = () => (
    <List
      itemLayout="horizontal"
      dataSource={filteredItems}
      renderItem={(item) => (
        <List.Item>
          {category === 'movies' ? (
            <List.Item.Meta
              avatar={
                <img 
                  src={item.image} 
                  alt={item.name}
                  style={{ width: '100px', height: '150px', objectFit: 'cover' }}
                />
              }
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{item.originalIndex + 1}. {item.name}</span>
                  <Rate disabled defaultValue={item.rating / 2} count={5} />
                </div>
              }
              description={item.description}
            />
          ) : (
            <List.Item.Meta
              title={
                category === 'brands' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{item.originalIndex + 1}. {item.name}</span>
                    <span>{item.value}</span>
                  </div>
                ) : category === 'sportsmen' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{item.originalIndex + 1}. {item.name?.split('$')[0] || item.name}</span>
                    <span>{item.name?.includes('$') ? `$${item.name.split('$')[1]}` : ''}</span>
                  </div>
                ) : category === 'billionaires' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{item.originalIndex + 1}. {item.name?.split(',')[0] || item.name}</span>
                    <span>{item.description?.includes('$') ? item.description.split('$')[1]?.split(',')[0] : ''}</span>
                  </div>
                ) : category === 'crypto' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{item.originalIndex + 1}. {item.name}</span>
                    <span>{item.description?.includes('Price: $') ? `$${item.description.split('Price: $')[1]?.split(',')[0]}` : ''}</span>
                  </div>
                ) : (
                  `${item.originalIndex + 1}. ${item.name}`
                )
              }
              description={item.description}
            />
          )}
        </List.Item>
      )}
    />
  );

  return (
    <div className="max-w-screen-xl mx-auto p-4">
      <Title level={1} style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Top 100 {category.charAt(0).toUpperCase() + category.slice(1)}
      </Title>

      <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: '2rem' }}>
        {/* Category Selection */}
        <div style={{ textAlign: 'center' }}>
          <Radio.Group value={category} onChange={(e) => setCategory(e.target.value)} buttonStyle="solid">
            <Radio.Button value="cars">Cars</Radio.Button>
            <Radio.Button value="crypto">Crypto</Radio.Button>
            <Radio.Button value="stocks">Stocks</Radio.Button>
            <Radio.Button value="billionaires">Billionaires</Radio.Button>
            <Radio.Button value="banks">Banks</Radio.Button>
            <Radio.Button value="sportsmen">Sports Person</Radio.Button>
            <Radio.Button value="movies">Movies</Radio.Button>
            <Radio.Button value="brands">Brands</Radio.Button>
          </Radio.Group>
        </div>

        {/* Search and View Toggle - Only show if not loading and not banks */}
        {!loading && category !== 'banks' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Search
              placeholder="Search items..."
              allowClear
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 300 }}
            />
            <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
              <Radio.Button value="grid">
                <AppstoreOutlined />
              </Radio.Button>
              <Radio.Button value="list">
                <UnorderedListOutlined />
              </Radio.Button>
            </Radio.Group>
          </div>
        )}
      </Space>

      {/* Show loading state */}
      {loading && (
        <div style={{ textAlign: 'center', margin: '2rem' }}>
          <Spin size="large" />
        </div>
      )}

      {/* Only render content when not loading */}
      {!loading && (
        <>
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '2rem' }} />}
          {category === 'banks' ? (
            <WikipediaBanks />
          ) : (
            <>
              {category === 'sportsmen' && (
                <Title level={2} style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  Overview of largest sports contracts
                </Title>
              )}
              {viewMode === 'grid' ? renderGridView() : renderListView()}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Top100Page;