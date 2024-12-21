import React, { useState, useEffect } from "react";

const Top100Page = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('cars');
  const [page, setPage] = useState(1);
  const API_KEY = 'BTOsYx47SEw8rRDvct+x+g==SUy2ivypa6z9mOk1';
const year = new Date().getFullYear();
  // Updated APIs with real free API endpoints
  const APIs = {
    cars: `https://api.api-ninjas.com/v1/cars?limit=100&year=${year}`,
    stocks: 'https://finnhub.io/api/v1/stock/symbol?exchange=US&token=ctj9ln9r01qgfbt0ega0ctj9ln9r01qgfbt0egag',
    crypto: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100',
    billionaires: `https://forbes400.onrender.com/api/forbes400?limit=100&year=${year}`
  };

  const VIN_NUMBERS = [
    '5UXWX7C5*BA',
    '1HGCM82633A123456',
    'WDDUG7JB0FA123456',
    // Add more VIN numbers...
  ];

  const fetchTop100 = async (category) => {
    try {
      console.log(`Fetching ${category} data...`);
      
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
        console.log(`${category} API response:`, data);

        const processedData = data.map(vehicle => ({
          name: `${vehicle.make} ${vehicle.model}`,
          description: `Year: ${vehicle.year}, Engine: ${vehicle.engine || 'N/A'}, Transmission: ${vehicle.transmission || 'N/A'}`
        }));
        
        setItems(processedData);
        setError(null);
      } else {
        // बाकी कैटेगरीज के लिए मौजूदा लॉजिक
        const response = await fetch(APIs[category]);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const rawData = await response.text(); // Get raw response first
        console.log(`Raw ${category} data:`, rawData.substring(0, 200)); // Debug log
        
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

        console.log(`Processed ${category} data:`, processedData.slice(0, 2)); // Debug log
        setItems(processedData);
        setError(null); // Clear any previous errors
        
      }
    } catch (err) {
      console.error(`Error fetching ${category} data:`, err);
      setError(`Failed to fetch ${category} data: ${err.message}`);
      setItems([]); // Clear items on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTop100(category);
  }, [category, page]);

  return (
    <div className="max-w-screen-xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Top 100 {category.charAt(0).toUpperCase() + category.slice(1)}
      </h1>

      {/* Updated Category Selector */}
      <div className="flex justify-center mb-6 space-x-4">
        <button
          onClick={() => setCategory('cars')}
          className={`px-4 py-2 rounded-md ${
            category === 'cars' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Cars
        </button>
        <button
          onClick={() => setCategory('crypto')}
          className={`px-4 py-2 rounded-md ${
            category === 'crypto' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Crypto
        </button>
        <button
          onClick={() => setCategory('stocks')}
          className={`px-4 py-2 rounded-md ${
            category === 'stocks' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Stocks
        </button>
        <button
          onClick={() => setCategory('billionaires')}
          className={`px-4 py-2 rounded-md ${
            category === 'billionaires' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Billionaires
        </button>
      </div>

      {loading && <p className="text-center text-lg">Loading...</p>}
      {error && <p className="text-center text-red-600">{`Error: ${error}`}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-lg overflow-hidden border"
          >
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {index + 1}. {item.name}
              </h3>
              <p className="text-gray-600 mt-2">{item.description}</p>
              {/* Add more item details based on category */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Top100Page;
