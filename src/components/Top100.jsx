import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Typography, Spin, Alert, Radio, Input, List, Space, Table, Rate } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined, SearchOutlined, PlayCircleOutlined } from '@ant-design/icons';
import sportsmen from './sportsmen.json';
import brands from './brand.json';
import bikes from './bikes.json';
import gdp from './gdp.json';

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
  const [category, setCategory] = useState('motorcycles');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  // const API_KEY = 'BTOsYx47SEw8rRDvct+x+g==SUy2ivypa6z9mOk1';
  const year = new Date().getFullYear();
  // Updated APIs with real free API endpoints
  // const APIs = {
  //   motorcycles: 'local',
  //   cars: `https://api.api-ninjas.com/v1/cars?limit=100&year=${year}`,
  //   stocks: 'https://finnhub.io/api/v1/stock/symbol?exchange=US&token=ctp4omhr01qhpppjiev0ctp4omhr01qhpppjievg',
  //   crypto: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100',
  //   billionaires: `https://forbes400.onrender.com/api/forbes400?limit=100&year=${year}`,
  //   banks: 'wikipedia',
  //   sportsmen: 'local',
  //   movies: 'https://imdb-top-100-movies.p.rapidapi.com/',
  //   brands: 'local',
  //   gdp: 'local'
  // };

  // const VIN_NUMBERS = [
  //   '5UXWX7C5*BA',
  //   '1HGCM82633A123456',
  //   'WDDUG7JB0FA123456',
  //   // Add more VIN numbers...
  // ];

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
      
      // Add debug logs
      // console.log(`Fetching data for category: ${category}`);
      
      // Handle local data cases first
      if (['sportsmen', 'brands', 'motorcycles', 'gdp'].includes(category)) {
        // console.log(`Using local data for ${category}`);
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
        
        if (category === 'motorcycles') {
          const processedData = bikes.motorcycles.map(bike => ({
            name: bike.motorcycle,
            description: `Year: ${bike.model_year}, Time: ${bike.time_seconds}s, Mph Speed: ${bike.speed_mph}mph, Kmh Speed: ${bike.speed_kmh}km/h`
          }));
          setItems(processedData);
          setError(null);
          setLoading(false);
          return;
        }
        
        if (category === 'gdp') {
          const processedData = gdp.GDP_by_country.map(country => ({
            name: country.Country,
            description: `IMF Forecast (${country.IMF?.Year || 'N/A'}): $${(country.IMF?.Forecast/1000).toFixed(2)}T
                          World Bank (${country.World_Bank?.Year || 'N/A'}): $${(country.World_Bank?.Estimate/1000).toFixed(2)}T
                          UN (${country.United_Nations?.Year || 'N/A'}): $${(country.United_Nations?.Estimate/1000).toFixed(2)}T`,
            value: country.IMF?.Forecast ? `$${(country.IMF.Forecast/1000).toFixed(2)}T` : 'N/A'
          }));
          setItems(processedData);
          setError(null);
          setLoading(false);
          return;
        }
      }

      // For API data, use the backend caching service
      // console.log(`Calling backend cache service for ${category}`);
      const response = await fetch(`https://bgs-backend.vercel.app/api/top100/${category}?year=${year}`);
      
      // Log the response status and headers
      // console.log('Response status:', response.status);
      // console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // console.log(`Received data for ${category}:`, data);

      // Process the data based on category
      let processedData = [];
      switch(category) {
        case 'cars':
          processedData = data.map(vehicle => ({
            name: `${vehicle.make} ${vehicle.model}`,
            description: `Year: ${vehicle.year}, Class: ${vehicle.class || 'N/A'}`
          }));
          break;
        case 'stocks':
          processedData = data.map(stock => ({
            name: `${stock.symbol} (${stock.displaySymbol})`,
            description: `Type: ${stock.type || 'N/A'}
                          Currency: ${stock.currency || 'N/A'}
                          Description: ${stock.description || 'N/A'}
                          MIC: ${stock.mic || 'N/A'}
                          FIGI: ${stock.figi || 'N/A'}`
          }));
          break;
        case 'crypto':
          processedData = data.map(coin => ({
            name: coin.name,
            description: `Price: $${coin.current_price}, Market Cap: $${coin.market_cap}`
          }));
          break;
        case 'billionaires':
          processedData = data.map(person => ({
            name: person.personName,
            description: `Net Worth: $${(parseInt(person.finalWorth) / 1000).toFixed(1)}B, Source: ${person.source}, Country: ${person.countryOfCitizenship}`,
            image: person.person?.squareImage || null
          }));
          break;
        case 'movies':
          processedData = data.map(movie => ({
            name: movie.title,
            description: `Rating: ${movie.rating}, Year: ${movie.year}`
          }));
          break;
      }

      setItems(processedData);
      // console.log(processedData, "cached data");
      setError(null);
      
    } catch (err) {
      console.error(`Error fetching ${category} data:`, err);
      // Add more detailed error logging
      // console.log('Error details:', {
      //   message: err.message,
      //   stack: err.stack,
      //   category: category
      // });
      setError(`Failed to fetch ${category} data: ${err.message}`);
      setItems([]);
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
          <Card
          className="dark:bg-[#28283A] border border-gray-200 dark:border-gray-800 dark:text"
            title={
              category === 'stocks' ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{item.originalIndex + 1}. {item.name}</span>
                </div>
              ) : category === 'motorcycles' ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{item.originalIndex + 1}. {item.name}</span>
                  <span>{item.description.split('Kmh Speed: ')[1]?.split('km/h')[0]} km/h</span>
                </div>
              ) : category === 'brands' ? (
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }} 
                      />
                    )}
                    <span>{item.originalIndex + 1}. {item.name}</span>
                  </div>
                  <span>{item.description?.split('Net Worth: ')[1]?.split(',')[0]}</span>
                </div>
              ) : category === 'crypto' ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{item.originalIndex + 1}. {item.name}</span>
                  <span>{item.description?.includes('Price: $') ? `$${item.description.split('Price: $')[1]?.split(',')[0]}` : ''}</span>
                </div>
              ) : category === 'gdp' ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{item.originalIndex + 1}. {item.name}</span>
                  <span>{item.value}</span>
                </div>
              ) : (
                `${item.originalIndex + 1}. ${item.name}`
              )
            }
            bordered={true}
            hoverable
          >
            {(() => {
              switch (category) {
                case 'motorcycles':
                  return (
                    <div>
                      {item.description.split(',').map((info, index) => (
                        <p key={index}>{info.trim()}</p>
                      ))}
                    </div>
                  );
                case 'cars':
                  return (
                    <div>
                      {item.description.split(',').map((info, index) => (
                        <p key={index}>{info.trim()}</p>
                      ))}
                    </div>
                  );
                case 'crypto':
                  return (
                    <div>
                      {item.description.split(',').map((info, index) => (
                        <p key={index}>{info.trim()}</p>
                      ))}
                    </div>
                  );
                case 'stocks':
                  return (
                    <div>
                      {item.description.split('\n').map((line, index) => (
                        <p key={index}>{line.trim()}</p>
                      ))}
                    </div>
                  );
                case 'billionaires':
                  return (
                    <div>
                      {item.description.split(',').map((info, index) => (
                        <p key={index}>{info.trim()}</p>
                      ))}
                    </div>
                  );
                case 'sportsmen':
                  return (
                    <div>
                      {item.description.split(',').map((info, index) => (
                        <p key={index}>{info.trim()}</p>
                      ))}
                    </div>
                  );
                case 'movies':
                  return (
                    <div>
                      {item.description.split(',').map((info, index) => (
                        <p key={index}>{info.trim()}</p>
                      ))}
                    </div>
                  );
                case 'brands':
                  return (
                    <div>
                      {item.description.split(',').map((info, index) => (
                        <p key={index}>{info.trim()}</p>
                      ))}
                    </div>
                  );
                case 'gdp':
                  return (
                    <div>
                      {item.description.split('\n').map((line, index) => (
                        <p key={index}>{line.trim()}</p>
                      ))}
                    </div>
                  );
                default:
                  return item.description;
              }
            })()}
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderListView = () => (
    <List
      itemLayout="horizontal"
      dataSource={filteredItems}
      renderItem={(item) => (
        <List.Item className="bg-gray-200 dark:bg-[#28283A] dark:text-white  rounded-sm mb-4">
          <List.Item.Meta
            title={
              category === 'stocks' ? (
                <div className="dark:text-white" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="dark:text-white">{item.originalIndex + 1}. {item.name}</span>
                </div>
              ) : category === 'motorcycles' ? (
                <div className="dark:text-white" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="dark:text-white">{item.originalIndex + 1}. {item.name}</span>
                  <span className="dark:text-white">{item.description.split('Kmh Speed: ')[1]?.split('km/h')[0]} km/h</span>
                </div>
              ) : category === 'brands' ? (
                <div className="dark:text-white" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="dark:text-white">{item.originalIndex + 1}. {item.name}</span>
                  <span className="dark:text-white">{item.value}</span>
                </div>
              ) : category === 'sportsmen' ? (
                <div className="dark:text-white" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="dark:text-white">{item.originalIndex + 1}. {item.name?.split('$')[0] || item.name}</span>
                  <span className="dark:text-white">{item.name?.includes('$') ? `$${item.name.split('$')[1]}` : ''}</span>
                </div>
              ) : category === 'billionaires' ? (
                <div className="dark:text-white" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="dark:text-white" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }} 
                      />
                    )}
                    <span className="dark:text-white">{item.originalIndex + 1}. {item.name}</span>
                  </div>
                  <span className="dark:text-white">{item.description?.split('Net Worth: ')[1]?.split(',')[0]}</span>
                </div>
              ) : category === 'crypto' ? (
                <div className="dark:text-white" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="dark:text-white">{item.originalIndex + 1}. {item.name}</span>
                  <span className="dark:text-white">{item.description?.includes('Price: $') ? `$${item.description.split('Price: $')[1]?.split(',')[0]}` : ''}</span>
                </div>
              ) : category === 'gdp' ? (
                <div className="dark:text-white" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="dark:text-white">{item.originalIndex + 1}. {item.name}</span>
                  <span className="dark:text-white">{item.value}</span>
                </div>
              ) : (
                `${item.originalIndex + 1}. ${item.name}`
              )
            }
            description={item.description}
          />
        </List.Item>
      )}
    />
  );

  return (
    <div className="max-w-screen-2xl mx-auto p-4 bg-gray-200/10 dark:bg-[#513a7a]/10 border border-gray-200 dark:border-gray-800 rounded-xl">
      <Title level={1} style={{ textAlign: 'center', marginBottom: '2rem', }} className="dark:text-white">
        Top 100 {category.charAt(0).toUpperCase() + category.slice(1)}
      </Title>

      <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: '2rem' }}>
        {/* Category Selection */}
        <div style={{ textAlign: 'center' }}>
          <Radio.Group value={category} onChange={(e) => setCategory(e.target.value)} buttonStyle="solid">
            <Radio.Button className="dark:bg-[#28283A] dark:text-white" value="motorcycles">Bikes</Radio.Button>
            <Radio.Button className="dark:bg-[#28283A] dark:text-white" value="cars">Cars</Radio.Button>
            <Radio.Button className="dark:bg-[#28283A] dark:text-white" value="crypto">Crypto</Radio.Button>
            <Radio.Button className="dark:bg-[#28283A] dark:text-white" value="stocks">Stocks</Radio.Button>
            <Radio.Button className="dark:bg-[#28283A] dark:text-white" value="billionaires">Billionaires</Radio.Button>
            <Radio.Button className="dark:bg-[#28283A] dark:text-white" value="banks">Banks</Radio.Button>
            <Radio.Button className="dark:bg-[#28283A] dark:text-white" value="sportsmen">Sports Person</Radio.Button>
            <Radio.Button className="dark:bg-[#28283A] dark:text-white" value="movies">Movies</Radio.Button>
            <Radio.Button className="dark:bg-[#28283A] dark:text-white" value="brands">Brands</Radio.Button>
            <Radio.Button className="dark:bg-[#28283A] dark:text-white" value="gdp">GDP</Radio.Button>
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