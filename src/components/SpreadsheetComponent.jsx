import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaDownload, FaPalette } from 'react-icons/fa';
import CustomColorPicker from './CustomColorPicker';

const SpreadsheetComponent = () => {
  const [tables, setTables] = useState([]);
  const [activeTable, setActiveTable] = useState(0);
  const [spreadsheetColor, setSpreadsheetColor] = useState('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    const savedTables = localStorage.getItem('spreadsheetTables');
    if (savedTables) {
      setTables(JSON.parse(savedTables));
    } else {
      createNewTable();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('spreadsheetTables', JSON.stringify(tables));
  }, [tables]);

  const createNewTable = () => {
    const newTable = {
      id: Date.now(),
      name: `Table ${tables.length + 1}`,
      data: Array(5).fill().map(() => Array(5).fill('')),
    };
    setTables([...tables, newTable]);
    setActiveTable(tables.length);
  };

  const deleteTable = (index) => {
    if (tables.length === 1) {
      alert('Cannot delete the last table');
      return;
    }
    const newTables = tables.filter((_, i) => i !== index);
    setTables(newTables);
    setActiveTable(Math.min(activeTable, newTables.length - 1));
  };

  const updateCell = (rowIndex, colIndex, value) => {
    const newTables = [...tables];
    newTables[activeTable].data[rowIndex][colIndex] = value;
    setTables(newTables);
  };

  const addRow = () => {
    const newTables = [...tables];
    const currentTable = newTables[activeTable];
    const newRow = Array(currentTable.data[0].length).fill('');
    currentTable.data.push(newRow);
    setTables(newTables);
  };

  const addColumn = () => {
    const newTables = [...tables];
    const currentTable = newTables[activeTable];
    currentTable.data = currentTable.data.map(row => [...row, '']);
    setTables(newTables);
  };

  const downloadCSV = () => {
    const currentTable = tables[activeTable];
    const csvContent = currentTable.data
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const element = document.createElement('a');
    const file = new Blob([csvContent], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `${currentTable.name}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const updateTableName = (index, newName) => {
    const newTables = [...tables];
    newTables[index].name = newName;
    setTables(newTables);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div 
          className="bg-white rounded-lg shadow-xl overflow-hidden"
          style={{ backgroundColor: spreadsheetColor }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Spreadsheet</h2>
              <div className="flex items-center gap-4">
                <button
                  className="p-2 rounded-lg hover:bg-white/20 transition duration-200"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                >
                  <FaPalette className="w-5 h-5" />
                </button>
                {showColorPicker && (
                  <div className="absolute mt-2 right-0">
                    <CustomColorPicker
                      color={spreadsheetColor}
                      onChange={setSpreadsheetColor}
                      onClose={() => setShowColorPicker(false)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {tables.map((table, index) => (
                <div
                  key={table.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer ${
                    index === activeTable
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  onClick={() => setActiveTable(index)}
                >
                  <input
                    type="text"
                    value={table.name}
                    onChange={(e) => updateTableName(index, e.target.value)}
                    className={`bg-transparent border-none focus:ring-0 ${
                      index === activeTable ? 'text-white' : 'text-gray-700'
                    }`}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTable(index);
                    }}
                    className="hover:text-red-500"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={createNewTable}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
              >
                <FaPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {tables[activeTable]?.data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, colIndex) => (
                        <td
                          key={colIndex}
                          className="border border-gray-300 p-2"
                        >
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) =>
                              updateCell(rowIndex, colIndex, e.target.value)
                            }
                            className="w-full bg-transparent border-none focus:ring-0"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={addRow}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
              >
                Add Row
              </button>
              <button
                onClick={addColumn}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
              >
                Add Column
              </button>
              <button
                onClick={downloadCSV}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 flex items-center gap-2"
              >
                <FaDownload className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetComponent;
