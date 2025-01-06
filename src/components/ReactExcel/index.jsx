import React from 'react';
import { useReactExcel } from './hooks/useReactExcel';
import TableComponent from './components/TableComponent';
import TableHeader from './components/TableHeader';
import FormulaBar from './components/FormulaBar';
import TableControls from './components/TableControls';
import ColorPicker from './components/ColorPicker';

const ReactExcel = () => {
  const {
    tables,
    tableNames,
    selectedCell,
    formulaBarValue,
    showColorPicker,
    activeTableIndex,
    userId,
    handleTableNameChange,
    handleCellSelect,
    handleFormulaBarChange,
    handleColorChange,
    handleAddRow,
    handleAddColumn,
    handleClearTable,
    handleAddTable,
    toggleColorPicker,
    handleFormulaChange,
    handleFormulaSubmit,
    handleCellEdit,
    handleDeleteRow,
    handleDeleteColumn,
    handleResizeColumn,
    handleResizeRow,
  } = useReactExcel();

  if (!userId) return (
    <div className="text-center py-8 text-gray-500">
      Please sign in to use Excel
    </div>
  );

  if (!tables.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <p className="text-gray-500 mb-4">No tables yet</p>
        <button
          onClick={handleAddTable}
          className="border border-gray-300 transition-all text-gray-500 px-3 py-1 rounded hover:bg-gray-600 hover:text-white"
        >
          + Create Table
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {tables.map((table, index) => (
        <div
          key={table.id}
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${
            table.cardStyle?.backgroundColor
              ? ''
              : table.isAutoColor
              ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900'
              : ''
          }`}
          style={table.cardStyle}
        >
          <div className="p-4">
            <TableHeader
              tableName={tableNames[table.id]}
              onNameChange={(name) => handleTableNameChange(table.id, name)}
            />
            <div className="mb-4">
              <FormulaBar
                value={selectedCell?.formula || ''}
                onChange={handleFormulaChange}
                onSubmit={handleFormulaSubmit}
                selectedCell={selectedCell}
              />
            </div>
            <div className="mb-4">
              <TableControls
                onAddRow={() => handleAddRow(index)}
                onAddColumn={() => handleAddColumn(index)}
                onClearTable={() => handleClearTable(index)}
                onColorClick={() => toggleColorPicker(index)}
              />
            </div>
            <TableComponent
              table={table}
              tableIndex={index}
              selectedCell={selectedCell?.tableIndex === index ? selectedCell : null}
              onCellSelect={(rowIndex, colIndex) =>
                handleCellSelect(index, rowIndex, colIndex)
              }
              onCellEdit={handleCellEdit}
              onDeleteRow={handleDeleteRow}
              onDeleteColumn={handleDeleteColumn}
              onResizeColumn={handleResizeColumn}
              onResizeRow={handleResizeRow}
              columnWidths={table.columnWidths}
              rowHeights={table.rowHeights}
            />
          </div>
          {showColorPicker === index && (
            <ColorPicker
              color={table.cardStyle?.backgroundColor}
              onChange={(color) => handleColorChange(index, color)}
              onClose={() => toggleColorPicker(null)}
            />
          )}
        </div>
      ))}
      <button
        onClick={handleAddTable}
        className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Add Table
      </button>
    </div>
  );
};

export default ReactExcel;
