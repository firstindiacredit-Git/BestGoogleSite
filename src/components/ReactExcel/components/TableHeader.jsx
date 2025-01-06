import React from 'react';
import { isLightColor } from '../utils/colorUtils';

const TableHeader = ({ tableName, onNameChange, backgroundColor }) => {
  const textColorClass = backgroundColor && !isLightColor(backgroundColor)
    ? 'text-white'
    : 'text-gray-900';

  return (
    <div className="flex items-center justify-between mb-4">
      <input
        type="text"
        value={tableName}
        onChange={(e) => onNameChange(e.target.value)}
        className={`text-lg bg-transparent font-semibold focus:outline-none px-2 ${textColorClass}`}
        placeholder="Table Name"
      />
      <h1 className={`text-2xl font-bold ${textColorClass}`}>
        Excel Sheet
      </h1>
    </div>
  );
};

export default TableHeader;
