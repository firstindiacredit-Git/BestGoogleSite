import React from 'react';

const TableControls = ({
  tableIndex,
  onAddRow,
  onAddColumn,
  onClearTable,
  onToggleColorPicker,
}) => {
  return (
    <div className="flex justify-between mt-4">
      <div className="flex gap-3">
        <button
          onClick={onToggleColorPicker}
          className="flex items-center gap-2 bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
        >
          Color
        </button>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onAddRow}
          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
        >
          Add Row
        </button>
        <button
          onClick={onAddColumn}
          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
        >
          Add Column
        </button>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onClearTable}
          className="bg-amber-400 text-black px-3 py-1 rounded hover:bg-amber-500"
          title="Clear table cells"
        >
          Clear Table
        </button>
      </div>
    </div>
  );
};

export default TableControls;
