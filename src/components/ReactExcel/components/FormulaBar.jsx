import React from 'react';
import { isLightColor } from '../utils/colorUtils';

const FormulaBar = ({ selectedCell, tableIndex, value, onChange, backgroundColor }) => {
  const textColorClass = backgroundColor && !isLightColor(backgroundColor)
    ? 'text-white'
    : 'text-gray-900';

  return (
    <div className="flex flex-col mb-4">
      <div className={`flex items-center gap-2 px-2 py-1 bg-gray-100 border-b text-sm ${textColorClass}`}>
        <div className="font-medium min-w-[60px]">
          {selectedCell && selectedCell.tableIndex === tableIndex
            ? `${String.fromCharCode(65 + selectedCell.colIndex)}${
                selectedCell.rowIndex + 1
              }`
            : 'Select Cell'}
        </div>
      </div>
      <div className="flex items-center gap-2 px-2 py-1.5 bg-white border">
        <span className={`font-medium ${textColorClass}`}>ƒx</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter formula or value"
          className={`flex-1 outline-none border-none ${textColorClass}`}
          disabled={!selectedCell || selectedCell.tableIndex !== tableIndex}
        />
      </div>
    </div>
  );
};

export default FormulaBar;
