import React, { useState, useCallback } from 'react';
import { useTable } from 'react-table';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';

const TableComponent = ({
  table,
  tableIndex,
  selectedCell,
  onCellSelect,
  onCellEdit,
  onDeleteRow,
  onDeleteColumn,
  onResizeColumn,
  onResizeRow,
  columnWidths = {},
  rowHeights = {}
}) => {
  const [editingCell, setEditingCell] = useState(null);
  const [cellValue, setCellValue] = useState('');
  const [columnSizes, setColumnSizes] = useState(columnWidths);

  const data = React.useMemo(() => {
    if (!table?.data || !Array.isArray(table.data)) return [];
    return table.data;
  }, [table?.data]);

  const columns = React.useMemo(() => {
    if (!data || !data[0]) return [];
    return data[0].map((_, index) => ({
      Header: String.fromCharCode(65 + index),
      accessor: (row) => row[index],
      width: columnSizes[index] || 150,
      Cell: ({ row, value }) => {
        const rowIndex = row.index;
        const colIndex = index;
        const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.colIndex === colIndex;
        const isSelected = selectedCell?.rowIndex === rowIndex && selectedCell?.colIndex === colIndex;

        return (
          <div
            className={`relative h-full w-full ${
              isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''
            }`}
          >
            {isEditing ? (
              <input
                autoFocus
                className="absolute inset-0 w-full h-full px-2 py-1 border-2 border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                value={cellValue}
                onChange={(e) => setCellValue(e.target.value)}
                onBlur={() => {
                  onCellEdit?.(tableIndex, rowIndex, colIndex, cellValue);
                  setEditingCell(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onCellEdit?.(tableIndex, rowIndex, colIndex, cellValue);
                    setEditingCell(null);
                  } else if (e.key === 'Escape') {
                    setEditingCell(null);
                  }
                }}
              />
            ) : (
              <div
                className="px-2 py-1 h-full w-full cursor-pointer"
                onClick={() => onCellSelect?.(rowIndex, colIndex)}
                onDoubleClick={() => {
                  setEditingCell({ rowIndex, colIndex });
                  setCellValue(value || '');
                }}
              >
                {value || ''}
              </div>
            )}
          </div>
        );
      },
    }));
  }, [data, editingCell, selectedCell, columnSizes, onCellSelect, onCellEdit, tableIndex]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data: data || [],
  });

  const handleResize = useCallback((index, size) => {
    setColumnSizes(prev => {
      const newSizes = { ...prev, [index]: size };
      onResizeColumn?.(tableIndex, index, size);
      return newSizes;
    });
  }, [onResizeColumn, tableIndex]);

  const ResizableCell = ({ column, index }) => {
    const width = column.width || 150;

    return (
      <Resizable
        width={width}
        height={30}
        onResize={(e, { size }) => {
          e.stopPropagation();
          handleResize(index, size.width);
        }}
        draggableOpts={{ enableUserSelectHack: false }}
      >
        <div style={{ width, height: '100%' }} className="flex items-center justify-between px-2">
          <span>{column.Header}</span>
          <button
            className="delete-column-btn opacity-0 group-hover:opacity-100 ml-2 text-red-500 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteColumn?.(tableIndex, index);
            }}
          >
            ×
          </button>
        </div>
      </Resizable>
    );
  };

  if (!data.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        No data available. Add some rows and columns to get started.
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table {...getTableProps()} className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          {headerGroups.map((headerGroup, groupIndex) => {
            const { key, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
            return (
              <tr key={key} {...headerGroupProps} className="group">
                <th className="w-10 px-2 py-1 bg-gray-100 dark:bg-indigo-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                {headerGroup.headers.map((column, index) => {
                  const { key, ...columnProps } = column.getHeaderProps();
                  return (
                    <th
                      key={key}
                      {...columnProps}
                      className="px-2 py-1 bg-gray-100 dark:bg-indigo-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider group relative"
                    >
                      <ResizableCell column={column} index={index} />
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody {...getTableBodyProps()} className="divide-y divide-gray-200 dark:divide-gray-700">
          {rows.map(row => {
            prepareRow(row);
            const { key, ...rowProps } = row.getRowProps();
            return (
              <tr key={key} {...rowProps} className="group">
                <td className="relative w-10 px-2 py-1 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-indigo-800">
                  <div className="flex items-center">
                    <span>{row.index + 1}</span>
                    <button
                      className="delete-row-btn opacity-0 group-hover:opacity-100 ml-2 text-red-500 hover:text-red-700"
                      onClick={() => onDeleteRow?.(tableIndex, row.index)}
                    >
                      ×
                    </button>
                  </div>
                </td>
                {row.cells.map(cell => {
                  const { key, ...cellProps } = cell.getCellProps();
                  return (
                    <td
                      key={key}
                      {...cellProps}
                      className="relative px-2 py-1 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                      style={{
                        height: rowHeights[row.index] || '32px',
                      }}
                    >
                      {cell.render('Cell')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;
