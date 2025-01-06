import { useState, useCallback, useEffect } from 'react';
import { useTable, useResizeColumns, useSortBy } from 'react-table';
import { db, auth } from '../../../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { evaluateFormula } from '../utils/formulaEvaluator';

const DEFAULT_TABLE_DATA = [
  ['', '', ''],
  ['', '', ''],
  ['', '', '']
];

export const useReactExcel = () => {
  const [tables, setTables] = useState([]);
  const [tableNames, setTableNames] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeTableIndex, setActiveTableIndex] = useState(null);
  const [userId, setUserId] = useState(null);

  // Firebase listeners and initial data fetch
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        fetchTables(user.uid);
      } else {
        setTables([]);
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Convert array to Firebase-friendly format
  const arrayToFirebase = (arr) => {
    return arr.reduce((acc, row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        acc[`${rowIndex}-${colIndex}`] = cell;
      });
      return acc;
    }, {});
  };

  // Convert Firebase format back to array
  const firebaseToArray = (obj, rowCount, colCount) => {
    const arr = Array(rowCount).fill().map(() => Array(colCount).fill(''));
    Object.entries(obj).forEach(([key, value]) => {
      const [row, col] = key.split('-').map(Number);
      if (row < rowCount && col < colCount) {
        arr[row][col] = value;
      }
    });
    return arr;
  };

  const fetchTables = async (uid) => {
    try {
      const tablesSnapshot = await getDocs(query(collection(db, 'users', uid, 'excel')));
      const fetchedTables = [];
      const names = {};

      tablesSnapshot.forEach((doc) => {
        const data = doc.data();
        const rowCount = data.rowCount || 3;
        const colCount = data.colCount || 3;
        fetchedTables.push({
          id: doc.id,
          data: data.tableData ? firebaseToArray(data.tableData, rowCount, colCount) : DEFAULT_TABLE_DATA,
          formulas: data.formulas || {},
          cardStyle: data.cardStyle || {},
          isAutoColor: data.isAutoColor || false,
          columnWidths: data.columnWidths || {},
          rowHeights: data.rowHeights || {}
        });
        names[doc.id] = data.tableName || '';
      });

      setTables(fetchedTables);
      setTableNames(names);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Failed to load tables');
    }
  };

  const handleTableNameChange = useCallback(async (tableId, name) => {
    setTableNames((prev) => ({ ...prev, [tableId]: name }));
    try {
      await updateDoc(doc(db, 'users', userId, 'excel', tableId), {
        tableName: name,
      });
    } catch (error) {
      console.error('Error updating table name:', error);
      toast.error('Failed to update table name');
    }
  }, [userId]);

  const handleCellSelect = useCallback((tableIndex, rowIndex, colIndex) => {
    setSelectedCell({ tableIndex, rowIndex, colIndex });
    const value = tables[tableIndex].data[rowIndex][colIndex];
    setFormulaBarValue(value);
  }, [tables]);

  const handleFormulaBarChange = useCallback((value) => {
    if (!selectedCell) return;

    setFormulaBarValue(value);
    const { tableIndex, rowIndex, colIndex } = selectedCell;
    
    const updatedTables = [...tables];
    updatedTables[tableIndex].data[rowIndex][colIndex] = value;

    if (value.startsWith('=')) {
      try {
        const result = evaluateFormula(value, updatedTables[tableIndex].data);
        updatedTables[tableIndex].formulas[`${rowIndex}-${colIndex}`] = {
          formula: value,
          result,
        };
      } catch (error) {
        console.error('Formula evaluation error:', error);
      }
    } else {
      delete updatedTables[tableIndex].formulas[`${rowIndex}-${colIndex}`];
    }

    setTables(updatedTables);
  }, [selectedCell, tables]);

  const handleColorChange = useCallback(async (tableIndex, color) => {
    try {
      const updatedTables = [...tables];
      const table = updatedTables[tableIndex];
      
      if (!table) {
        console.error('Table not found');
        return;
      }

      if (color === 'auto') {
        table.isAutoColor = true;
        delete table.cardStyle;
      } else {
        table.isAutoColor = false;
        table.cardStyle = {
          ...table.cardStyle,
          backgroundColor: color,
        };
      }
      
      setTables(updatedTables);

      await updateDoc(doc(db, 'users', userId, 'excel', table.id), {
        cardStyle: table.cardStyle || {},
        isAutoColor: table.isAutoColor
      });

      toast.success('Color updated successfully');
    } catch (error) {
      console.error('Error updating color:', error);
      toast.error('Failed to update color');
    }
  }, [tables, userId]);

  const handleAddRow = useCallback(async (tableIndex) => {
    try {
      const updatedTables = [...tables];
      const table = updatedTables[tableIndex];
      
      if (!table) {
        console.error('Table not found');
        return;
      }

      // Initialize data if it doesn't exist
      if (!Array.isArray(table.data)) {
        table.data = Array(3).fill().map(() => Array(3).fill(''));
      }

      const columnCount = table.data[0]?.length || 3;
      table.data.push(Array(columnCount).fill(''));
      setTables(updatedTables);

      await updateDoc(doc(db, 'users', userId, 'excel', table.id), {
        tableData: arrayToFirebase(table.data),
        rowCount: table.data.length,
        colCount: columnCount
      });

      toast.success('Row added successfully');
    } catch (error) {
      console.error('Error adding row:', error);
      toast.error('Failed to add row');
    }
  }, [tables, userId]);

  const handleAddColumn = useCallback(async (tableIndex) => {
    try {
      const updatedTables = [...tables];
      const table = updatedTables[tableIndex];
      
      if (!table) {
        console.error('Table not found');
        return;
      }

      // Initialize data if it doesn't exist
      if (!Array.isArray(table.data)) {
        table.data = Array(3).fill().map(() => Array(3).fill(''));
      }

      table.data = table.data.map(row => [...row, '']);
      setTables(updatedTables);

      await updateDoc(doc(db, 'users', userId, 'excel', table.id), {
        tableData: arrayToFirebase(table.data),
        rowCount: table.data.length,
        colCount: table.data[0].length
      });

      toast.success('Column added successfully');
    } catch (error) {
      console.error('Error adding column:', error);
      toast.error('Failed to add column');
    }
  }, [tables, userId]);

  const handleClearTable = useCallback(async (tableIndex) => {
    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];
    
    if (!table || !Array.isArray(table.data)) {
      console.error('Invalid table data');
      return;
    }

    const rowCount = table.data.length || 3;
    const columnCount = table.data[0]?.length || 3;
    table.data = Array(rowCount).fill().map(() => Array(columnCount).fill(''));
    table.formulas = {};
    setTables(updatedTables);

    try {
      await updateDoc(doc(db, 'users', userId, 'excel', table.id), {
        tableData: arrayToFirebase(table.data),
        rowCount: table.data.length,
        colCount: columnCount,
        formulas: {}
      });
    } catch (error) {
      console.error('Error updating table:', error);
      toast.error('Failed to clear table');
    }
  }, [tables, userId]);

  const handleAddTable = useCallback(async () => {
    if (!userId) {
      toast.error('Please sign in to add a table');
      return;
    }

    try {
      const newTable = {
        tableData: arrayToFirebase(DEFAULT_TABLE_DATA),
        rowCount: DEFAULT_TABLE_DATA.length,
        colCount: DEFAULT_TABLE_DATA[0].length,
        formulas: {},
        cardStyle: {},
        isAutoColor: false,
        tableName: 'New Table',
        columnWidths: {},
        rowHeights: {}
      };

      const docRef = await addDoc(collection(db, 'users', userId, 'excel'), newTable);
      setTables(prev => [...prev, { 
        ...newTable, 
        id: docRef.id, 
        data: DEFAULT_TABLE_DATA 
      }]);
      setTableNames(prev => ({ ...prev, [docRef.id]: newTable.tableName }));
    } catch (error) {
      console.error('Error adding table:', error);
      toast.error('Failed to add table');
    }
  }, [userId]);

  const toggleColorPicker = useCallback((tableIndex) => {
    setShowColorPicker(prev => !prev);
    setActiveTableIndex(tableIndex);
  }, []);

  const handleCellEdit = useCallback(async (tableIndex, rowIndex, colIndex, value) => {
    try {
      const updatedTables = [...tables];
      const table = updatedTables[tableIndex];
      
      if (!table) {
        console.error('Table not found');
        return;
      }

      // Initialize data if it doesn't exist
      if (!Array.isArray(table.data)) {
        table.data = Array(3).fill().map(() => Array(3).fill(''));
      }

      // Ensure row exists
      while (table.data.length <= rowIndex) {
        table.data.push(Array(table.data[0].length).fill(''));
      }

      // Ensure column exists
      if (table.data[0].length <= colIndex) {
        table.data = table.data.map(row => [...row, ...Array(colIndex - row.length + 1).fill('')]);
      }

      table.data[rowIndex][colIndex] = value;
      setTables(updatedTables);

      await updateDoc(doc(db, 'users', userId, 'excel', table.id), {
        tableData: arrayToFirebase(table.data),
        rowCount: table.data.length,
        colCount: table.data[0].length
      });
    } catch (error) {
      console.error('Error updating cell:', error);
      toast.error('Failed to update cell');
    }
  }, [tables, userId]);

  const handleDeleteRow = useCallback(async (tableIndex, rowIndex) => {
    try {
      const updatedTables = [...tables];
      const table = updatedTables[tableIndex];
      
      if (!table || !Array.isArray(table.data)) {
        console.error('Invalid table data');
        return;
      }

      table.data.splice(rowIndex, 1);
      if (table.data.length === 0) {
        table.data = [Array(table.data[0]?.length || 3).fill('')];
      }

      setTables(updatedTables);

      await updateDoc(doc(db, 'users', userId, 'excel', table.id), {
        tableData: arrayToFirebase(table.data),
        rowCount: table.data.length,
        colCount: table.data[0].length
      });

      toast.success('Row deleted successfully');
    } catch (error) {
      console.error('Error deleting row:', error);
      toast.error('Failed to delete row');
    }
  }, [tables, userId]);

  const handleDeleteColumn = useCallback(async (tableIndex, colIndex) => {
    try {
      const updatedTables = [...tables];
      const table = updatedTables[tableIndex];
      
      if (!table || !Array.isArray(table.data)) {
        console.error('Invalid table data');
        return;
      }

      table.data = table.data.map(row => {
        row.splice(colIndex, 1);
        return row;
      });

      if (table.data[0].length === 0) {
        table.data = table.data.map(() => ['']);
      }

      setTables(updatedTables);

      await updateDoc(doc(db, 'users', userId, 'excel', table.id), {
        tableData: arrayToFirebase(table.data),
        rowCount: table.data.length,
        colCount: table.data[0].length
      });

      toast.success('Column deleted successfully');
    } catch (error) {
      console.error('Error deleting column:', error);
      toast.error('Failed to delete column');
    }
  }, [tables, userId]);

  const handleResizeColumn = useCallback(async (tableIndex, colIndex, width) => {
    try {
      const updatedTables = [...tables];
      const table = updatedTables[tableIndex];
      
      if (!table) {
        console.error('Table not found');
        return;
      }

      if (!table.columnWidths) {
        table.columnWidths = {};
      }

      table.columnWidths[colIndex] = width;
      setTables(updatedTables);

      await updateDoc(doc(db, 'users', userId, 'excel', table.id), {
        columnWidths: table.columnWidths
      });
    } catch (error) {
      console.error('Error resizing column:', error);
      toast.error('Failed to resize column');
    }
  }, [tables, userId]);

  const handleResizeRow = useCallback(async (tableIndex, rowIndex, height) => {
    try {
      const updatedTables = [...tables];
      const table = updatedTables[tableIndex];
      
      if (!table) {
        console.error('Table not found');
        return;
      }

      if (!table.rowHeights) {
        table.rowHeights = {};
      }

      table.rowHeights[rowIndex] = height;
      setTables(updatedTables);

      await updateDoc(doc(db, 'users', userId, 'excel', table.id), {
        rowHeights: table.rowHeights
      });
    } catch (error) {
      console.error('Error resizing row:', error);
      toast.error('Failed to resize row');
    }
  }, [tables, userId]);

  return {
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
    handleCellEdit,
    handleDeleteRow,
    handleDeleteColumn,
    handleResizeColumn,
    handleResizeRow
  };
};
