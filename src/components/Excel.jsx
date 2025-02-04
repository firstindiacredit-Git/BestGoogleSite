import React, { useState, useEffect, useCallback, useRef } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";
import ExcelJS from "exceljs";
import {  Button } from "antd";
import { Palette } from "lucide-react";
const Excel = () => {
  const [userId, setUserId] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tableNames, setTableNames] = useState({});
  const [formulaBarValue, setFormulaBarValue] = useState("");
  const [columnWidths, setColumnWidths] = useState({});
  const [rowHeights, setRowHeights] = useState({});
  const [isResizing, setIsResizing] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [deleteModel, setDeleteModel] = useState(false);
  const [deleteTableIndex, setDeleteTableIndex] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeTableIndex, setActiveTableIndex] = useState(null);
  const [isAutoColor, setIsAutoColor] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const colorPickerRef = useRef(null);

  const predefinedColors = [
    "#000000",
    "#424242",
    "#666666",
    "#808080",
    "#999999",
    "#B3B3B3",
    "#CCCCCC",
    "#E6E6E6",
    "#F2F2F2",
    "#FFFFFF",
    "#FF0000",
    "#FF4500",
    "#FF8C00",
    "#32CD32",
    "#00FF00",
    "#00CED1",
    "#0000FF",
    "#8A2BE2",
    "#FF00FF",
    "#FFB6C1",
    "#FFA07A",
    "#FFE4B5",
    "#FFFACD",
    "#98FB98",
    "#AFEEEE",
    "#87CEEB",
    "#E6E6FA",
    "#DDA0DD",
    "#FFC0CB",
    "#DC143C",
    "#DAA520",
    "#FFA500",
    "#FFD700",
    "#20B2AA",
    "#4169E1",
    "#9370DB",
    "#FF69B4",
  ];

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    setIsDarkMode(darkModeMediaQuery.matches);

    const handleThemeChange = (e) => {
      setIsDarkMode(e.matches);
    };

    darkModeMediaQuery.addEventListener("change", handleThemeChange);
    return () =>
      darkModeMediaQuery.removeEventListener("change", handleThemeChange);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target)
      ) {
        setShowColorPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get column label (A, B, C, etc.)
  const getColumnLabel = (index) => {
    return String.fromCharCode(65 + index);
  };

  // Transform array data to object format for Firestore
  const transformTableDataToObject = (data) => {
    const transformedData = {};
    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        transformedData[`${rowIndex}-${colIndex}`] = cell;
      });
    });
    return transformedData;
  };

  // Transform object data back to array format for UI
  const transformTableDataToArray = (data, rows, cols) => {
    const arrayData = Array(rows)
      .fill()
      .map(() => Array(cols).fill(""));
    Object.entries(data).forEach(([key, value]) => {
      const [rowIndex, colIndex] = key.split("-").map(Number);
      if (rowIndex < rows && colIndex < cols) {
        arrayData[rowIndex][colIndex] = value;
      }
    });
    return arrayData;
  };

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (tableId, data) => {
      try {
        const transformedData = transformTableDataToObject(data);
        await updateDoc(doc(db, "users", userId, "excel", tableId), {
          tableData: transformedData,
        });
      } catch (error) {
        console.error("Error auto-saving:", error);
        toast.error("Failed to auto-save changes");
      }
    }, 1000),
    [userId]
  );

  // Debounced save for table name
  const debouncedSaveTableName = useCallback(
    debounce(async (tableId, newName) => {
      try {
        await updateDoc(doc(db, "users", userId, "excel", tableId), {
          tableName: newName,
        });
      } catch (error) {
        console.error("Error updating table name:", error);
        toast.error("Failed to update table name");
      }
    }, 3000),
    [userId]
  );

  // Delete row
  const deleteRow = async (tableIndex, rowIndex) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to delete a row");
      return;
    }

    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];

    // Prevent deleting if only one row remains
    if (table.data.length <= 1) {
      toast.warning("Cannot delete the last row");
      return;
    }

    table.data.splice(rowIndex, 1);
    table.rows -= 1;

    try {
      const firebaseData = convertTableDataForFirebase(table.data);
      await updateDoc(doc(db, "users", userId, "excel", table.id), {
        data: firebaseData,
        rows: table.rows,
      });
      setTables(updatedTables);
    } catch (error) {
      console.error("Error deleting row:", error);
      toast.error("Failed to delete row");
    }
  };

  // Delete column
  const deleteColumn = async (tableIndex, colIndex) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to delete a column");
      return;
    }

    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];

    // Prevent deleting if only one column remains
    if (table.data[0].length <= 1) {
      toast.warning("Cannot delete the last column");
      return;
    }

    table.data.forEach((row) => row.splice(colIndex, 1));
    table.cols -= 1;

    try {
      const firebaseData = convertTableDataForFirebase(table.data);
      await updateDoc(doc(db, "users", userId, "excel", table.id), {
        data: firebaseData,
        cols: table.cols,
      });
      setTables(updatedTables);
    } catch (error) {
      console.error("Error deleting column:", error);
      toast.error("Failed to delete column");
    }
  };

  // Download as Excel
  const downloadExcel = (tableIndex) => {
    const table = tables[tableIndex];
    let csv = "";

    // Add column headers
    for (let i = 0; i < table.cols; i++) {
      csv += getColumnLabel(i) + ",";
    }
    csv = csv.slice(0, -1) + "\n";

    // Add data
    table.data.forEach((row) => {
      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `excel_sheet_${tableIndex + 1}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Helper function to get cell value from reference (e.g., "A1" -> value)
  const getCellValueFromRef = (tableData, ref) => {
    const colLetter = ref.match(/[A-Z]+/)[0];
    const rowNum = parseInt(ref.match(/\d+/)[0]) - 1;
    const colNum = colLetter
      .split("")
      .reduce(
        (acc, char) => acc * 26 + char.charCodeAt(0) - "A".charCodeAt(0),
        0
      );
    return tableData[rowNum]?.[colNum] || "";
  };

  // Helper function to get range of cells (e.g., "A1:A3" -> [value1, value2, value3])
  const getCellRange = (tableData, range) => {
    const [start, end] = range.split(":");
    const startCol = start.match(/[A-Z]+/)[0];
    const startRow = parseInt(start.match(/\d+/)[0]) - 1;
    const endCol = end.match(/[A-Z]+/)[0];
    const endRow = parseInt(end.match(/\d+/)[0]) - 1;

    const startColNum = startCol
      .split("")
      .reduce(
        (acc, char) => acc * 26 + char.charCodeAt(0) - "A".charCodeAt(0),
        0
      );
    const endColNum = endCol
      .split("")
      .reduce(
        (acc, char) => acc * 26 + char.charCodeAt(0) - "A".charCodeAt(0),
        0
      );

    const values = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startColNum; col <= endColNum; col++) {
        const value = tableData[row]?.[col];
        if (value && !isNaN(parseFloat(value))) {
          values.push(parseFloat(value));
        }
      }
    }
    return values;
  };

  // Evaluate formula
  const evaluateFormula = (formula, tableData) => {
    try {
      // Remove the leading =
      formula = formula.substring(1).toUpperCase();

      // Handle SUM function
      if (formula.startsWith("SUM(")) {
        const range = formula.match(/SUM\((.*)\)/)[1];
        const values = getCellRange(tableData, range);
        return values.reduce((sum, val) => sum + val, 0);
      }

      // Handle AVERAGE function
      if (formula.startsWith("AVERAGE(")) {
        const range = formula.match(/AVERAGE\((.*)\)/)[1];
        const values = getCellRange(tableData, range);
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      }

      // Handle MAX function
      if (formula.startsWith("MAX(")) {
        const range = formula.match(/MAX\((.*)\)/)[1];
        const values = getCellRange(tableData, range);
        return Math.max(...values);
      }

      // Handle MIN function
      if (formula.startsWith("MIN(")) {
        const range = formula.match(/MIN\((.*)\)/)[1];
        const values = getCellRange(tableData, range);
        return Math.min(...values);
      }

      // Handle basic arithmetic with cell references
      // Replace cell references with their values
      let expression = formula.replace(/[A-Z]+\d+/g, (match) => {
        const value = getCellValueFromRef(tableData, match);
        return isNaN(parseFloat(value)) ? "0" : value;
      });

      // Safely evaluate the arithmetic expression
      return eval(expression);
    } catch (error) {
      console.error("Formula error:", error);
      return "#ERROR!";
    }
  };

  // Handle cell change with formula support
  const handleCellChange = async (tableIndex, rowIndex, colIndex, value) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to edit cells");
      return;
    }

    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];

    // Check if the value is a formula (starts with =)
    if (value.startsWith("=")) {
      const result = evaluateFormula(value, table.data);
      // Store both the formula and the result
      table.data[rowIndex][colIndex] = value;
      table.formulas = table.formulas || {};
      table.formulas[`${rowIndex}-${colIndex}`] = {
        formula: value,
        result: result,
      };
    } else {
      table.data[rowIndex][colIndex] = value;
      // Clear any existing formula for this cell
      if (table.formulas) {
        delete table.formulas[`${rowIndex}-${colIndex}`];
      }
    }

    setTables(updatedTables);
    debouncedSave(table.id, table.data);
  };

  // Handle keyboard navigation
  const handleCellKeyDown = (e, tableIndex, rowIndex, colIndex) => {
    if (e.key === "ArrowRight") {
      const nextCell = document.querySelector(
        `[data-cell="${tableIndex}-${rowIndex}-${colIndex + 1}"]`
      );
      nextCell?.focus();
    } else if (e.key === "ArrowLeft") {
      const prevCell = document.querySelector(
        `[data-cell="${tableIndex}-${rowIndex}-${colIndex - 1}"]`
      );
      prevCell?.focus();
    } else if (e.key === "ArrowUp") {
      const upCell = document.querySelector(
        `[data-cell="${tableIndex}-${rowIndex - 1}-${colIndex}"]`
      );
      upCell?.focus();
    } else if (e.key === "ArrowDown") {
      const downCell = document.querySelector(
        `[data-cell="${tableIndex}-${rowIndex + 1}-${colIndex}"]`
      );
      downCell?.focus();
    }
  };

  // Clear table cells
  const clearTable = async (tableIndex) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to clear table");
      return;
    }

    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];
    table.data = Array(table.rows)
      .fill()
      .map(() => Array(table.cols).fill(""));

    try {
      const transformedData = transformTableDataToObject(table.data);
      await updateDoc(doc(db, "users", userId, "excel", table.id), {
        tableData: transformedData,
      });
      setTables(updatedTables);
      toast.success("Table cleared successfully");
    } catch (error) {
      console.error("Error clearing table:", error);
      toast.error("Failed to clear table");
    }
  };

  // Handle cell selection
  const handleCellSelect = (tableIndex, rowIndex, colIndex) => {
    const table = tables[tableIndex];
    const cellKey = `${rowIndex}-${colIndex}`;
    const formula =
      table.formulas?.[cellKey]?.formula || table.data[rowIndex][colIndex];
    setSelectedCell({ tableIndex, rowIndex, colIndex });
    setFormulaBarValue(formula || "");
  };

  // Handle formula bar change
  const handleFormulaBarChange = (value) => {
    if (!selectedCell) return;

    setFormulaBarValue(value);
    handleCellChange(
      selectedCell.tableIndex,
      selectedCell.rowIndex,
      selectedCell.colIndex,
      value
    );
  };

  // Recalculate all formulas in the table
  const recalculateFormulas = (tableIndex) => {
    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];

    // Update all formulas in the table
    Object.keys(table.formulas || {}).forEach((cellKey) => {
      const [row, col] = cellKey.split("-").map(Number);
      const formula = table.formulas[cellKey].formula;
      const result = evaluateFormula(formula, table.data);
      table.formulas[cellKey].result = result;
    });

    setTables(updatedTables);
  };

  // Handle cell double click for editing
  const handleCellDoubleClick = (tableIndex, rowIndex, colIndex) => {
    setEditingCell({ tableIndex, rowIndex, colIndex });
  };

  // Handle cell edit
  const handleCellEdit = (tableIndex, rowIndex, colIndex, value) => {
    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];
    table.data[rowIndex][colIndex] = value;
    setTables(updatedTables);
  };

  // Handle column resize
  const handleColumnResize = (tableIndex, colIndex, width) => {
    setColumnWidths((prev) => ({
      ...prev,
      [`${tableIndex}-${colIndex}`]: Math.max(60, width),
    }));
  };

  // Handle row resize
  const handleRowResize = (tableIndex, rowIndex, height) => {
    setRowHeights((prev) => ({
      ...prev,
      [`${tableIndex}-${rowIndex}`]: Math.max(24, height),
    }));
  };

  // Function to export data to Excel
  const exportToExcel = async (tableIndex) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Table ${tableIndex + 1}`);

    // Add column headers
    worksheet.columns = [
      { header: "#", key: "rowNumber", width: 5 },
      ...tables[tableIndex].data[0].map((_, colIndex) => ({
        header: String.fromCharCode(65 + colIndex),
        key: `col${colIndex}`,
        width: 20,
      })),
    ];

    // Add rows
    tables[tableIndex].data.forEach((row, rowIndex) => {
      worksheet.addRow({
        rowNumber: rowIndex + 1,
        ...row.reduce(
          (acc, value, colIndex) => ({ ...acc, [`col${colIndex}`]: value }),
          {}
        ),
      });
    });

    // Save the workbook
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Table_${tableIndex + 1}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Add an export button to the UI
  const exportButton = (tableIndex) => {
    return (
      <button
        onClick={() => exportToExcel(tableIndex)}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Export to Excel
      </button>
    );
  };

  // Add import functionality
  const importFromExcel = async (event, tableIndex) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = await ExcelJS.read(data, { type: "array" });
      const worksheet = workbook.worksheets[0];

      // Read data from the worksheet
      const importedData = [];
      worksheet.eachRow((row, rowNumber) => {
        const rowData = row.values.slice(1); // Skip the first element (row number)
        importedData.push(rowData);
      });

      // Update the table with imported data
      const updatedTables = [...tables];
      updatedTables[tableIndex].data = importedData;
      setTables(updatedTables);
    };

    reader.readAsArrayBuffer(file);
  };

  // Convert table data to Firebase-compatible format
  const convertTableDataForFirebase = (tableData) => {
    return tableData.reduce((acc, row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        acc[`${rowIndex}-${colIndex}`] = cell;
      });
      return acc;
    }, {});
  };

  // Convert Firebase data back to table format
  const convertFirebaseDataToTable = (firebaseData, rowCount, colCount) => {
    if (!firebaseData || typeof firebaseData !== "object")
      return Array(rowCount)
        .fill()
        .map(() => Array(colCount).fill(""));

    const table = Array(rowCount)
      .fill()
      .map(() => Array(colCount).fill(""));
    Object.entries(firebaseData).forEach(([key, value]) => {
      const [rowIndex, colIndex] = key.split("-").map(Number);
      if (rowIndex < rowCount && colIndex < colCount) {
        table[rowIndex][colIndex] = value;
      }
    });
    return table;
  };

  // Save table data to Firebase
  const saveTableData = async (tableIndex) => {
    if (!userId) return;

    try {
      const table = tables[tableIndex];
      const firebaseData = convertTableDataForFirebase(table.data);

      await updateDoc(doc(db, "users", userId, "excel", table.id), {
        data: firebaseData,
        rowCount: table.data.length,
        colCount: table.data[0].length,
        formulas: table.formulas || {},
        columnWidths: columnWidths,
        rowHeights: rowHeights,
        cardStyle: table.cardStyle || {},
      });
    } catch (error) {
      console.error("Error saving table:", error);
    }
  };

  // Load table data from Firebase
  const loadTableData = async (tableId) => {
    if (!userId) return null;

    try {
      const docSnap = await getDoc(doc(db, "users", userId, "excel", tableId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          data: convertFirebaseDataToTable(
            data.data,
            data.rowCount,
            data.colCount
          ),
        };
      }
    } catch (error) {
      console.error("Error loading table:", error);
    }
    return null;
  };

  // Auto-save effect
  useEffect(() => {
    const debouncedSave = debounce(async () => {
      if (!userId || !tables.length) return;

      for (let i = 0; i < tables.length; i++) {
        await saveTableData(i);
      }
    }, 2000);

    debouncedSave();
    return () => debouncedSave.cancel();
  }, [tables, userId, columnWidths, rowHeights]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthenticated(true);
        try {
          await fetchTables(user.uid);
        } catch (error) {
          console.error("Error fetching tables:", error);
          setError("Failed to fetch tables");
        }
      } else {
        setUserId(null);
        setIsAuthenticated(false);
        setTables([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Ensure user document exists
  const ensureUserDocument = async (uid) => {
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      const user = auth.currentUser;
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        createdAt: new Date(),
        lastLoginAt: new Date(),
      });
    }
  };

  // Fetch tables from Firestore
  const fetchTables = async (uid) => {
    try {
      setLoading(true);
      setError(null);

      await ensureUserDocument(uid);

      const tablesRef = collection(db, "users", uid, "excel");
      const q = query(tablesRef);
      const querySnapshot = await getDocs(q);

      const fetchedTables = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          rows: data.rows,
          cols: data.cols,
          data: convertFirebaseDataToTable(data.data, data.rows, data.cols),
          cardStyle: data.cardStyle || {},
          tableName:
            data.tableName || `Table ${querySnapshot.docs.indexOf(doc) + 1}`,
          formulas: data.formulas || {},
        };
      });

      if (fetchedTables.length > 0) {
        setTables(fetchedTables);
        setTableNames(
          fetchedTables.reduce(
            (acc, table) => ({ ...acc, [table.id]: table.tableName }),
            {}
          )
        );
      } else {
        // Initialize with one empty table if none exists
        const emptyData = Array(5)
          .fill()
          .map(() => Array(5).fill(""));
        const newTable = {
          rows: 5,
          cols: 5,
          tableData: convertTableDataForFirebase(emptyData),
          cardStyle: {},
          tableName: "Table 1",
        };

        const docRef = await addDoc(tablesRef, newTable);
        setTables([
          {
            id: docRef.id,
            rows: 5,
            cols: 5,
            data: emptyData,
            cardStyle: {},
            tableName: "Table 1",
          },
        ]);
        setTableNames({ [docRef.id]: "Table 1" });
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      setError("Failed to fetch tables");
      toast.error("Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  // Add new table
  const addTable = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add a table");
      return;
    }

    const emptyData = Array(5)
      .fill()
      .map(() => Array(5).fill(""));
    const newTable = {
      rows: 5,
      cols: 5,
      tableData: convertTableDataForFirebase(emptyData),
      cardStyle: {},
      tableName: `Table ${tables.length + 1}`,
    };

    try {
      const tablesRef = collection(db, "users", userId, "excel");
      const docRef = await addDoc(tablesRef, newTable);
      setTables([
        ...tables,
        {
          id: docRef.id,
          rows: 5,
          cols: 5,
          data: emptyData,
          cardStyle: {},
          tableName: `Table ${tables.length + 1}`,
        },
      ]);
      setTableNames((prev) => ({
        ...prev,
        [docRef.id]: `Table ${tables.length + 1}`,
      }));
      toast.success("New table added successfully!");
    } catch (error) {
      console.error("Error adding table:", error);
      toast.error("Failed to add new table");
    }
  };

  // Add row to specific table
  const addRow = async (tableIndex) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add a row");
      return;
    }

    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];
    const newRow = Array(table.cols).fill("");
    table.data.push(newRow);
    table.rows += 1;

    try {
      const firebaseData = convertTableDataForFirebase(table.data);
      await updateDoc(doc(db, "users", userId, "excel", table.id), {
        data: firebaseData,
        rows: table.rows,
      });
      setTables(updatedTables);
    } catch (error) {
      console.error("Error adding row:", error);
      toast.error("Failed to add row");
    }
  };

  // Add column to specific table
  const addColumn = async (tableIndex) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add a column");
      return;
    }

    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];
    table.data.forEach((row) => row.push(""));
    table.cols += 1;

    try {
      const firebaseData = convertTableDataForFirebase(table.data);
      await updateDoc(doc(db, "users", userId, "excel", table.id), {
        data: firebaseData,
        cols: table.cols,
      });
      setTables(updatedTables);
    } catch (error) {
      console.error("Error adding column:", error);
      toast.error("Failed to add column");
    }
  };

  // Delete table
  const deleteTable = async (tableId) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to delete a table");
      return;
    }

    try {
      await deleteDoc(doc(db, "users", userId, "excel", tableId));
      setTables(tables.filter((table) => table.id !== tableId));
      setTableNames((prev) => {
        const newTableNames = { ...prev };
        delete newTableNames[tableId];
        return newTableNames;
      });
      toast.success("Table deleted successfully!");
    } catch (error) {
      console.error("Error deleting table:", error);
      toast.error("Failed to delete table");
    }
  };

  // Update table name with debounce
  const updateTableName = (tableId, newName) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to rename table");
      return;
    }

    setTableNames((prev) => ({ ...prev, [tableId]: newName }));
    debouncedSaveTableName(tableId, newName);
  };

  // Add color handling functions
  const handleColorChange = async (tableIndex, color) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to change colors");
      return;
    }

    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];
    table.cardStyle = { backgroundColor: color };

    try {
      await updateDoc(doc(db, "users", userId, "excel", table.id), {
        cardStyle: { backgroundColor: color },
      });
      setTables(updatedTables);

      // Save to localStorage
      const savedColors = JSON.parse(
        localStorage.getItem("excelTableColors") || "{}"
      );
      savedColors[table.id] = { backgroundColor: color };
      localStorage.setItem("excelTableColors", JSON.stringify(savedColors));
    } catch (error) {
      console.error("Error updating color:", error);
      toast.error("Failed to update color");
    }
  };

  const handleAutoTheme = async (tableIndex, colors) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to apply theme");
      return;
    }

    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];
    const newStyle = {
      background: `linear-gradient(135deg, ${colors.join(", ")})`,
    };
    table.cardStyle = newStyle;

    try {
      await updateDoc(doc(db, "users", userId, "excel", table.id), {
        cardStyle: newStyle,
      });
      setTables(updatedTables);

      // Save to localStorage
      const savedColors = JSON.parse(
        localStorage.getItem("excelTableColors") || "{}"
      );
      savedColors[table.id] = newStyle;
      localStorage.setItem("excelTableColors", JSON.stringify(savedColors));
    } catch (error) {
      console.error("Error applying theme:", error);
      toast.error("Failed to apply theme");
    }
  };

  // Add localStorage effect after other useEffects
  useEffect(() => {
    // Load colors from localStorage
    const savedColors = localStorage.getItem("excelTableColors");
    if (savedColors) {
      const parsedColors = JSON.parse(savedColors);
      setTables((prevTables) =>
        prevTables.map((table) => ({
          ...table,
          cardStyle: parsedColors[table.id] || table.cardStyle,
        }))
      );
    }
  }, []);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error)
    return <div className="text-center py-4 text-red-500">{error}</div>;
  if (!isAuthenticated)
    return <div className="text-center py-4">Please sign in to use Excel</div>;

  return (
    <div className=" mx-auto relative">
      {tables.map((table, tableIndex) => (
        <div
          key={table.id}
          className={`mb-8 border border-gray-500/10 rounded-sm p-4 ${
            isAutoColor ? "bg-white dark:bg-[#28283A]" : "bg-gray-100"
          }`}
          style={isAutoColor ? {} : table.cardStyle}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-1/3">
              <input
                type="text"
                value={tableNames[table.id] || `Table ${tableIndex + 1}`}
                onChange={(e) => updateTableName(table.id, e.target.value)}
                className="text-lg bg-transparent dark:text-white focus:bg-gray-100 focus:dark:bg-[#513a7a] font-semibold   focus:border-blue-500 focus:outline-none px-2"
              />
            </div>
          <div className="font-Semibold text-2xl">Excel Sheet</div>
            <div className="w-1/3 flex justify-end">
              <button
                onClick={() => deleteTable(table.id)}
                className="bg-red-500 text-white px-3 disabled:opacity-50 disabled:hover:bg-gray-500 disabled:cursor-not-allowed py-1 rounded hover:bg-gray-600"
                title={
                  tables.length > 1
                    ? `Delete ${tableNames[table.id]}`
                    : "You need at least one table"
                }
                disabled={tables.length > 1 ? false : true}
              >
                Delete Table
              </button>
            </div>
          </div>

          {/* Formula Bar */}
          <div className="flex flex-col mb-4">
            <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 border-b text-sm text-gray-600">
              <div className="font-medium min-w-[60px]">
                {selectedCell && selectedCell.tableIndex === tableIndex
                  ? `${String.fromCharCode(65 + selectedCell.colIndex)}${
                      selectedCell.rowIndex + 1
                    }`
                  : "Select Cell"}
              </div>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 bg-white border">
              <span className="text-gray-500 font-medium">ƒx</span>
              <input
                type="text"
                value={
                  selectedCell?.tableIndex === tableIndex ? formulaBarValue : ""
                }
                onChange={(e) => handleFormulaBarChange(e.target.value)}
                placeholder="Enter formula or value"
                className="flex-1 bg-white outline-none border-none"
                disabled={
                  !selectedCell || selectedCell.tableIndex !== tableIndex
                }
              />
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full border-collapse table-fixed ">
              <thead>
                <tr>
                  <th className="border bg-gray-50 px-4 py-2 w-12 sticky left-0 z-10">
                    #
                  </th>
                  {table.data[0]?.map((_, colIndex) => (
                    <th
                      key={colIndex}
                      className="border bg-gray-50 px-4 py-2 relative"
                      style={{
                        width:
                          columnWidths[`${tableIndex}-${colIndex}`] || "120px",
                        minWidth: "60px",
                        position: "relative",
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span>{getColumnLabel(colIndex)}</span>
                        <button
                          onClick={() => deleteColumn(tableIndex, colIndex)}
                          className="text-gray-400 hover:text-red-500 ml-2"
                          title="Delete column"
                        >
                          ×
                        </button>
                      </div>
                      {/* Resize handle */}
                      <div
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-indigo-500"
                        onMouseDown={(e) => {
                          const startX = e.pageX;
                          const currentWidth =
                            columnWidths[`${tableIndex}-${colIndex}`] || 120;
                          const handleMouseMove = (e) => {
                            const diff = e.pageX - startX;
                            const newWidth = Math.max(60, currentWidth + diff);
                            handleColumnResize(tableIndex, colIndex, newWidth);
                          };
                          const handleMouseUp = () => {
                            document.removeEventListener(
                              "mousemove",
                              handleMouseMove
                            );
                            document.removeEventListener(
                              "mouseup",
                              handleMouseUp
                            );
                            setIsResizing(false);
                          };
                          document.addEventListener(
                            "mousemove",
                            handleMouseMove
                          );
                          document.addEventListener("mouseup", handleMouseUp);
                          setIsResizing(true);
                        }}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td
                      className="border bg-gray-50 w-12 text-center sticky left-0 z-10"
                      style={{
                        height:
                          rowHeights[`${tableIndex}-${rowIndex}`] || "24px",
                      }}
                    >
                      <div className="flex items-center justify-between px-2">
                        {rowIndex + 1}
                        <button
                          onClick={() => deleteRow(tableIndex, rowIndex)}
                          className="text-gray-400 hover:text-red-500"
                          title="Delete row"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                    {row.map((cell, colIndex) => {
                      const cellKey = `${rowIndex}-${colIndex}`;
                      const formula = table.formulas?.[cellKey];
                      const isEditing =
                        editingCell?.tableIndex === tableIndex &&
                        editingCell?.rowIndex === rowIndex &&
                        editingCell?.colIndex === colIndex;
                      const isUrl = (cell) => {
                        const urlPattern =
                          /^(https?:\/\/)?([\w.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?.*$/;
                        return urlPattern.test(cell);
                      };

                      return (
                        <td
                          key={colIndex}
                          className="border px-2 bg-white py-1 relative"
                          onClick={() => {
                            handleCellSelect(tableIndex, rowIndex, colIndex);
                            handleCellDoubleClick(
                              tableIndex,
                              rowIndex,
                              colIndex
                            );
                          }}
                          style={{
                            width:
                              columnWidths[`${tableIndex}-${colIndex}`] ||
                              "120px",
                            height:
                              rowHeights[`${tableIndex}-${rowIndex}`] || "24px",
                          }}
                        >
                          {isEditing ? (
                            <input
                              type="text"
                              autoFocus
                              value={table.data[rowIndex][colIndex] || ""}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                handleCellEdit(
                                  tableIndex,
                                  rowIndex,
                                  colIndex,
                                  newValue
                                );
                              }}
                              onBlur={() => {
                                const currentValue =
                                  table.data[rowIndex][colIndex];
                                if (
                                  currentValue &&
                                  currentValue.startsWith("=")
                                ) {
                                  recalculateFormulas(tableIndex);
                                }
                                setEditingCell(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const currentValue =
                                    table.data[rowIndex][colIndex];
                                  if (
                                    currentValue &&
                                    currentValue.startsWith("=")
                                  ) {
                                    recalculateFormulas(tableIndex);
                                  }
                                  setEditingCell(null);
                                }
                              }}
                              className="w-full h-full outline-none border-none"
                            />
                          ) : isUrl(cell) ? (
                            <a
                              href={cell}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-500 underline"
                            >
                              {cell}
                            </a>
                          ) : (
                            <div
                              className={`w-full h-full flex items-center ${
                                formula ||
                                !isNaN(table.data[rowIndex][colIndex])
                                  ? "justify-end"
                                  : "justify-start"
                              } ${
                                selectedCell?.tableIndex === tableIndex &&
                                selectedCell?.rowIndex === rowIndex &&
                                selectedCell?.colIndex === colIndex
                                  ? "ring-2 ring-blue-500"
                                  : ""
                              }`}
                            >
                              {formula
                                ? formula.result
                                : table.data[rowIndex][colIndex]}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between relative mt-4">
            <div className="w-1/3 flex gap-3">
              <div className="relative" ref={colorPickerRef}>
                  <Button
                    icon={<Palette className="p-1 w-8 h-8" />}
                    onClick={() => {
                      setActiveTableIndex(tableIndex);
                      setShowColorPicker((prev) => !prev);
                    }}
                    className={`${
                      isAutoColor
                        ? "bg-gray-100 dark:bg-[#513a7a] hover:bg-gray-200 dark:hover:bg-gray-700"
                        : ""
                    }`}
                  >
                  </Button>
                {showColorPicker && activeTableIndex === tableIndex && (
                  <div className="absolute w-48 left-0 -top-24 z-50 -mt-2 bg-white dark:bg-[#513a7a] border border-gray-200 dark:border-gray-700 rounded shadow-lg p-3">
                    {/* Auto Theme Button */}
                    <div className="mb-2">
                      <button
                        onClick={() => {
                          setIsAutoColor(true);
                          setShowColorPicker(false);
                          handleAutoTheme(tableIndex, [
                            "#ffffff",
                            "#f5f5f5",
                            "#e0e0e0",
                          ]);
                        }}
                        className="w-full py-1 px-2 text-sm bg-gray-100 dark:bg-[#513a7a] hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors text-gray-900 dark:text-white"
                      >
                        Auto Theme Color
                      </button>
                    </div>

                    {/* Predefined Colors */}
                    <div className="grid grid-cols-7 gap-1">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          className="w-5 h-5 border border-gray-200 cursor-pointer transition duration-300 ease-in-out transform hover:scale-125 focus:outline-none"
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            setIsAutoColor(false);
                            handleColorChange(tableIndex, color);
                            setShowColorPicker(false);
                          }}
                        />
                      ))}
                    </div>

                    {/* Custom Color Picker */}
                    <div className="mt-2 flex items-center justify-center">
                      <input
                        type="color"
                        className="w-full h-6 p-0 border border-gray-300 rounded-xs cursor-pointer focus:outline-none"
                        value={
                          tables[tableIndex]?.cardStyle?.backgroundColor ||
                          "#ffffff"
                        }
                        onChange={(e) => {
                          setIsAutoColor(false);
                          handleColorChange(tableIndex, e.target.value);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              {exportButton(tableIndex)}
            </div>
            <div className="w-1/3 flex justify-center gap-3">
              <button
                onClick={() => addRow(tableIndex)}
                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
              >
                Add Row
              </button>
              <button
                onClick={() => addColumn(tableIndex)}
                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
              >
                Add Column
              </button>
            </div>
            <div className="w-1/3 flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteTableIndex(tableIndex);
                  setDeleteModel(true);
                }}
                className="bg-amber-500 text-white px-3 py-1 rounded hover:bg-red-600"
                title="Clear table cells"
              >
                Clear Table
              </button>
            </div>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-center transition-all">
        <button
          onClick={() => addTable()}
          className="border hover:text-white dark:border-gray-300 border-black transition-all dark:text-gray-300 px-3 py-1 rounded hover:bg-gray-600"
        >
          + Table
        </button>
      </div>
      {deleteModel && (
        <div className="fixed z-999 inset-0 flex items-center justify-center  bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-4 rounded shadow-lg">
            <p>Are you sure you want to clear this table?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setDeleteModel(false)}
                className="bg-gray-500 text-white px-4 py-2 mr-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearTable(deleteTableIndex);
                  setDeleteModel(false);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Excel;