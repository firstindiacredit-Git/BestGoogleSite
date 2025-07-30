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
import { Button } from "antd";
import { Palette } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// Helper function to generate unique IDs for localStorage
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

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
  const [editingTableNames, setEditingTableNames] = useState({});
  const { isDarkMode } = useTheme();
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
    try {
      const colLetter = ref.match(/[A-Z]+/)[0];
      const rowNum = parseInt(ref.match(/\d+/)[0]) - 1;
      const colNum = colLetter
        .split("")
        .reduce(
          (acc, char) => acc * 26 + char.charCodeAt(0) - "A".charCodeAt(0),
          0
        );

      // Make sure we have valid indices
      if (
        rowNum < 0 ||
        colNum < 0 ||
        !tableData[rowNum] ||
        !tableData[rowNum][colNum]
      ) {
        return 0;
      }

      const value = tableData[rowNum][colNum];

      // If the value is a formula, we need to get the result
      if (typeof value === "string" && value.startsWith("=")) {
        // Prevent circular references
        return 0;
      }

      return isNaN(parseFloat(value)) ? 0 : parseFloat(value);
    } catch (error) {
      console.error("Error getting cell value:", error);
      return 0;
    }
  };

  // Helper function to get range of cells (e.g., "A1:B1" -> [value1, value2])
  const getCellRange = (tableData, range) => {
    try {
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
          if (!tableData[row] || !tableData[row][col]) continue;

          const value = tableData[row][col];
          // Skip formula cells to prevent circular references
          if (typeof value === "string" && value.startsWith("=")) continue;

          // Convert to number or use 0
          const numValue = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
          values.push(numValue);
        }
      }
      return values;
    } catch (error) {
      console.error("Error getting cell range:", error);
      return [];
    }
  };

  // Evaluate formula
  const evaluateFormula = (formula, tableData) => {
    try {
      // Remove the leading =
      const cleanFormula = formula.substring(1).toUpperCase();

      // Handle SUM function
      if (cleanFormula.startsWith("SUM(")) {
        const rangeMatch = cleanFormula.match(/SUM\((.*)\)/);
        if (!rangeMatch || !rangeMatch[1]) return "#ERROR!";

        const range = rangeMatch[1];
        const values = getCellRange(tableData, range);
        return values.reduce((sum, val) => sum + val, 0);
      }

      // Handle AVERAGE function
      if (cleanFormula.startsWith("AVERAGE(")) {
        const rangeMatch = cleanFormula.match(/AVERAGE\((.*)\)/);
        if (!rangeMatch || !rangeMatch[1]) return "#ERROR!";

        const range = rangeMatch[1];
        const values = getCellRange(tableData, range);
        if (values.length === 0) return "#DIV/0!";
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      }

      // Handle MAX function
      if (cleanFormula.startsWith("MAX(")) {
        const rangeMatch = cleanFormula.match(/MAX\((.*)\)/);
        if (!rangeMatch || !rangeMatch[1]) return "#ERROR!";

        const range = rangeMatch[1];
        const values = getCellRange(tableData, range);
        if (values.length === 0) return 0;
        return Math.max(...values);
      }

      // Handle MIN function
      if (cleanFormula.startsWith("MIN(")) {
        const rangeMatch = cleanFormula.match(/MIN\((.*)\)/);
        if (!rangeMatch || !rangeMatch[1]) return "#ERROR!";

        const range = rangeMatch[1];
        const values = getCellRange(tableData, range);
        if (values.length === 0) return 0;
        return Math.min(...values);
      }

      // Handle basic arithmetic with cell references
      // Replace cell references with their values
      let expression = cleanFormula.replace(/[A-Z]+\d+/g, (match) => {
        const value = getCellValueFromRef(tableData, match);
        return value;
      });

      // Safely evaluate the arithmetic expression
      // Use Function instead of eval for better security
      const result = new Function(`return ${expression}`)();
      return isNaN(result) ? "#ERROR!" : result;
    } catch (error) {
      console.error("Formula error:", error);
      return "#ERROR!";
    }
  };

  // Recalculate formulas for a table
  const recalculateFormulas = (tableIndex) => {
    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];

    if (!table.formulas) return;

    // Create a copy of the formulas to avoid modifying during iteration
    const formulaEntries = Object.entries(table.formulas);

    for (const [cellKey, formulaData] of formulaEntries) {
      const [rowIndex, colIndex] = cellKey.split("-").map(Number);
      const formula = formulaData.formula;

      if (formula && typeof formula === "string" && formula.startsWith("=")) {
        const result = evaluateFormula(formula, table.data);
        table.formulas[cellKey] = {
          formula,
          result,
        };
      }
    }

    setTables(updatedTables);
  };

  // Handle cell change with formula support
  const handleCellChange = async (tableIndex, rowIndex, colIndex, value) => {
    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];

    // Check if the value is a formula (starts with =)
    if (value.startsWith("=")) {
      // Store the formula in the cell
      table.data[rowIndex][colIndex] = value;

      // Calculate the result
      const result = evaluateFormula(value, table.data);

      // Store both the formula and the result
      table.formulas = table.formulas || {};
      table.formulas[`${rowIndex}-${colIndex}`] = {
        formula: value,
        result: result,
      };

      // Recalculate other formulas that might depend on this cell
      recalculateFormulas(tableIndex);
    } else {
      // Store the regular value
      table.data[rowIndex][colIndex] = value;

      // Clear any existing formula for this cell
      if (table.formulas && table.formulas[`${rowIndex}-${colIndex}`]) {
        delete table.formulas[`${rowIndex}-${colIndex}`];
      }

      // Recalculate formulas that might depend on this cell
      recalculateFormulas(tableIndex);
    }

    setTables(updatedTables);

    // Save the changes
    await saveTableData(tableIndex);
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
    try {
      const updatedTables = [...tables];
      const table = updatedTables[tableIndex];

      // Create empty data array
      table.data = Array(table.rows)
        .fill()
        .map(() => Array(table.cols).fill(""));

      // Clear formulas
      table.formulas = {};

      // Update state
      setTables(updatedTables);

      // Save to appropriate storage
      if (userId) {
        // User is logged in, save to Firebase
        await saveTableData(tableIndex);
      } else {
        // No user logged in, save to localStorage
        const localTables = JSON.parse(
          localStorage.getItem("excelTables") || "[]"
        );
        const localTableIndex = localTables.findIndex((t) => t.id === table.id);

        if (localTableIndex >= 0) {
          localTables[localTableIndex] = {
            ...localTables[localTableIndex],
            data: convertTableDataForFirebase(table.data),
            formulas: {},
          };
          localStorage.setItem("excelTables", JSON.stringify(localTables));
        }
      }

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

  // Handle cell double click for editing
  const handleCellDoubleClick = (tableIndex, rowIndex, colIndex) => {
    setEditingCell({ tableIndex, rowIndex, colIndex });
  };

  // Handle cell edit
  const handleCellEdit = (tableIndex, rowIndex, colIndex, value) => {
    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];

    // Update the cell value
    table.data[rowIndex][colIndex] = value;

    // If it's a formula, prepare for calculation when editing is done
    if (value.startsWith("=")) {
      // Just store the formula text for now, calculation will happen on blur
      table.formulas = table.formulas || {};
      table.formulas[`${rowIndex}-${colIndex}`] = {
        formula: value,
        result: "#PENDING", // Will be calculated on blur
      };
    } else if (table.formulas && table.formulas[`${rowIndex}-${colIndex}`]) {
      // If it was a formula before but isn't anymore, remove it from formulas
      delete table.formulas[`${rowIndex}-${colIndex}`];
    }

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

  // Save table data to Firebase or localStorage
  const saveTableData = async (tableIndex) => {
    try {
      const table = tables[tableIndex];
      const firebaseData = convertTableDataForFirebase(table.data);

      if (userId) {
        // Save to Firebase if user is logged in
        await updateDoc(doc(db, "users", userId, "excel", table.id), {
          data: firebaseData,
          rowCount: table.data.length,
          colCount: table.data[0].length,
          formulas: table.formulas || {},
          columnWidths: columnWidths,
          rowHeights: rowHeights,
          cardStyle: table.cardStyle || {},
          tableName: tableNames[table.id] || `Table ${tableIndex + 1}`,
        });
      } else {
        // Save to localStorage if no user is logged in
        const localTables = JSON.parse(
          localStorage.getItem("excelTables") || "[]"
        );
        const tableIndex = localTables.findIndex((t) => t.id === table.id);

        const updatedTable = {
          id: table.id,
          data: firebaseData,
          rowCount: table.data.length,
          colCount: table.data[0].length,
          formulas: table.formulas || {},
          columnWidths: columnWidths,
          rowHeights: rowHeights,
          cardStyle: table.cardStyle || {},
          tableName: tableNames[table.id] || `Table ${tableIndex + 1}`,
        };

        if (tableIndex >= 0) {
          localTables[tableIndex] = updatedTable;
        } else {
          localTables.push(updatedTable);
        }

        localStorage.setItem("excelTables", JSON.stringify(localTables));
      }
    } catch (error) {
      console.error("Error saving table:", error);
      toast.error("Failed to save table");
    }
  };

  // Load table data from Firebase or localStorage
  const loadTableData = async (tableId) => {
    try {
      if (userId) {
        // Load from Firebase if user is logged in
        const docSnap = await getDoc(
          doc(db, "users", userId, "excel", tableId)
        );
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
      } else {
        // Load from localStorage if no user is logged in
        const localTables = JSON.parse(
          localStorage.getItem("excelTables") || "[]"
        );
        const table = localTables.find((t) => t.id === tableId);

        if (table) {
          return {
            ...table,
            data: convertFirebaseDataToTable(
              table.data,
              table.rowCount,
              table.colCount
            ),
          };
        }
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
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthenticated(true);
        fetchTables(user.uid);
      } else {
        setUserId(null);
        setIsAuthenticated(false);
        fetchTables(null); // Fetch from localStorage when no user
      }
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

  // Fetch tables from Firestore or localStorage
  const fetchTables = async (uid) => {
    try {
      setLoading(true);
      setError(null);

      if (uid) {
        // User is logged in, fetch from Firebase
        await ensureUserDocument(uid);

        const tablesRef = collection(db, "users", uid, "excel");
        const q = query(tablesRef);
        const querySnapshot = await getDocs(q);

        const fetchedTables = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            rows: data.rowCount || 5,
            cols: data.colCount || 5,
            data: convertFirebaseDataToTable(
              data.data,
              data.rowCount || 5,
              data.colCount || 5
            ),
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
            rowCount: 5,
            colCount: 5,
            data: convertTableDataForFirebase(emptyData),
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
      } else {
        // No user logged in, fetch from localStorage
        const localTables = JSON.parse(
          localStorage.getItem("excelTables") || "[]"
        );

        if (localTables.length > 0) {
          const processedTables = localTables.map((table) => ({
            id: table.id,
            rows: table.rowCount || 5,
            cols: table.colCount || 5,
            data: convertFirebaseDataToTable(
              table.data,
              table.rowCount || 5,
              table.colCount || 5
            ),
            cardStyle: table.cardStyle || {},
            tableName: table.tableName || "Untitled Table",
            formulas: table.formulas || {},
          }));

          setTables(processedTables);
          setTableNames(
            processedTables.reduce(
              (acc, table) => ({ ...acc, [table.id]: table.tableName }),
              {}
            )
          );
        } else {
          // Initialize with one empty table if none exists
          const emptyData = Array(5)
            .fill()
            .map(() => Array(5).fill(""));
          const newTableId = generateUniqueId();
          const newTable = {
            id: newTableId,
            rowCount: 5,
            colCount: 5,
            data: convertTableDataForFirebase(emptyData),
            cardStyle: {},
            tableName: "Table 1",
          };

          localStorage.setItem("excelTables", JSON.stringify([newTable]));

          setTables([
            {
              id: newTableId,
              rows: 5,
              cols: 5,
              data: emptyData,
              cardStyle: {},
              tableName: "Table 1",
            },
          ]);
          setTableNames({ [newTableId]: "Table 1" });
        }
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
    const emptyData = Array(5)
      .fill()
      .map(() => Array(5).fill(""));

    const newTableName = `Table ${tables.length + 1}`;

    if (userId) {
      // User is logged in, add to Firebase
      try {
        const tablesRef = collection(db, "users", userId, "excel");
        const newTable = {
          rowCount: 5,
          colCount: 5,
          data: convertTableDataForFirebase(emptyData),
          cardStyle: {},
          tableName: newTableName,
        };

        const docRef = await addDoc(tablesRef, newTable);

        const tableToAdd = {
          id: docRef.id,
          rows: 5,
          cols: 5,
          data: emptyData,
          cardStyle: {},
          tableName: newTableName,
        };

        setTables([...tables, tableToAdd]);
        setTableNames({ ...tableNames, [docRef.id]: newTableName });
      } catch (error) {
        console.error("Error adding table:", error);
        toast.error("Failed to add table");
      }
    } else {
      // No user logged in, add to localStorage
      try {
        const newTableId = generateUniqueId();
        const localTables = JSON.parse(
          localStorage.getItem("excelTables") || "[]"
        );

        const newTable = {
          id: newTableId,
          rowCount: 5,
          colCount: 5,
          data: convertTableDataForFirebase(emptyData),
          cardStyle: {},
          tableName: newTableName,
        };

        localTables.push(newTable);
        localStorage.setItem("excelTables", JSON.stringify(localTables));

        const tableToAdd = {
          id: newTableId,
          rows: 5,
          cols: 5,
          data: emptyData,
          cardStyle: {},
          tableName: newTableName,
        };

        setTables([...tables, tableToAdd]);
        setTableNames({ ...tableNames, [newTableId]: newTableName });
      } catch (error) {
        console.error("Error adding table to localStorage:", error);
        toast.error("Failed to add table");
      }
    }
  };

  // Update table name
  const updateTableName = (tableId, newName) => {
    try {
      // Prevent empty table names
      if (!newName || newName.trim() === "") {
        return; // Don't show warning, just return silently
      }

      if (userId) {
        // User is logged in, update in Firebase
        const tableRef = doc(db, "users", userId, "excel", tableId);
        updateDoc(tableRef, { tableName: newName });
      } else {
        // No user logged in, update in localStorage
        const localTables = JSON.parse(
          localStorage.getItem("excelTables") || "[]"
        );
        const tableIndex = localTables.findIndex((t) => t.id === tableId);

        if (tableIndex >= 0) {
          localTables[tableIndex].tableName = newName;
          localStorage.setItem("excelTables", JSON.stringify(localTables));
        }
      }

      // Update local state
      setTableNames({ ...tableNames, [tableId]: newName });
    } catch (error) {
      console.error("Error updating table name:", error);
      toast.error("Failed to update table name");
    }
  };

  // Handle color change for table
  const handleColorChange = async (tableIndex, color) => {
    try {
      const updatedTables = [...tables];
      updatedTables[tableIndex] = {
        ...updatedTables[tableIndex],
        cardStyle: {
          ...updatedTables[tableIndex].cardStyle,
          backgroundColor: color,
        },
      };
      setTables(updatedTables);

      if (userId) {
        // User is logged in, update in Firebase
        const tableRef = doc(
          db,
          "users",
          userId,
          "excel",
          updatedTables[tableIndex].id
        );
        await updateDoc(tableRef, {
          cardStyle: {
            backgroundColor: color,
          },
        });
      } else {
        // No user logged in, update in localStorage
        const localTables = JSON.parse(
          localStorage.getItem("excelTables") || "[]"
        );
        const localTableIndex = localTables.findIndex(
          (t) => t.id === updatedTables[tableIndex].id
        );

        if (localTableIndex >= 0) {
          localTables[localTableIndex].cardStyle = {
            backgroundColor: color,
          };
          localStorage.setItem("excelTables", JSON.stringify(localTables));
        }
      }
    } catch (error) {
      console.error("Error updating table color:", error);
      toast.error("Failed to update table color");
    }
  };

  // Auto-save effect
  useEffect(() => {
    const debouncedSave = debounce(async () => {
      if (!tables.length) return;

      for (let i = 0; i < tables.length; i++) {
        await saveTableData(i);
      }
    }, 2000);

    debouncedSave();

    return () => debouncedSave.cancel();
  }, [tables, userId]);

  // Add row to table
  const addRow = async (tableIndex) => {
    try {
      const updatedTables = [...tables];
      const table = updatedTables[tableIndex];
      const newRow = Array(table.data[0].length).fill("");

      table.data.push(newRow);
      table.rows = table.data.length;

      setTables(updatedTables);

      // Save changes
      await saveTableData(tableIndex);

      toast.success("Row added successfully");
    } catch (error) {
      console.error("Error adding row:", error);
      toast.error("Failed to add row");
    }
  };

  // Add column to table
  const addColumn = async (tableIndex) => {
    try {
      const updatedTables = [...tables];
      const table = updatedTables[tableIndex];

      table.data.forEach((row) => {
        row.push("");
      });

      table.cols = table.data[0].length;

      setTables(updatedTables);

      // Save changes
      await saveTableData(tableIndex);

      toast.success("Column added successfully");
    } catch (error) {
      console.error("Error adding column:", error);
      toast.error("Failed to add column");
    }
  };

  // Delete table
  const deleteTable = async (tableId) => {
    try {
      if (userId) {
        // User is logged in, delete from Firebase
        await deleteDoc(doc(db, "users", userId, "excel", tableId));
      } else {
        // No user logged in, delete from localStorage
        const localTables = JSON.parse(
          localStorage.getItem("excelTables") || "[]"
        );
        const updatedTables = localTables.filter(
          (table) => table.id !== tableId
        );
        localStorage.setItem("excelTables", JSON.stringify(updatedTables));
      }

      // Update local state
      setTables(tables.filter((table) => table.id !== tableId));

      // Update table names
      const newTableNames = { ...tableNames };
      delete newTableNames[tableId];
      setTableNames(newTableNames);

      toast.success("Table deleted successfully");
    } catch (error) {
      console.error("Error deleting table:", error);
      toast.error("Failed to delete table");
    }
  };

  // Handle auto theme for table
  const handleAutoTheme = async (tableIndex, colors) => {
    try {
      const updatedTables = [...tables];
      const newStyle = {
        background: `linear-gradient(135deg, ${colors.join(", ")})`,
      };

      updatedTables[tableIndex] = {
        ...updatedTables[tableIndex],
        cardStyle: newStyle,
      };

      setTables(updatedTables);

      if (userId) {
        // User is logged in, update in Firebase
        const tableRef = doc(
          db,
          "users",
          userId,
          "excel",
          updatedTables[tableIndex].id
        );
        await updateDoc(tableRef, {
          cardStyle: newStyle,
        });
      } else {
        // No user logged in, update in localStorage
        const localTables = JSON.parse(
          localStorage.getItem("excelTables") || "[]"
        );
        const localTableIndex = localTables.findIndex(
          (t) => t.id === updatedTables[tableIndex].id
        );

        if (localTableIndex >= 0) {
          localTables[localTableIndex].cardStyle = newStyle;
          localStorage.setItem("excelTables", JSON.stringify(localTables));
        }
      }

      toast.success("Theme applied successfully");
    } catch (error) {
      console.error("Error applying theme:", error);
      toast.error("Failed to apply theme");
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error)
    return <div className="text-center py-4 text-red-500">{error}</div>;

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
                value={editingTableNames[table.id] !== undefined ? editingTableNames[table.id] : (tableNames[table.id] || `Table ${tableIndex + 1}`)}
                onChange={(e) => {
                  const newValue = e.target.value;
                  // Update the editing state
                  setEditingTableNames(prev => ({
                    ...prev,
                    [table.id]: newValue
                  }));
                }}
                onFocus={() => {
                  // When user starts editing, set the current value in editing state
                  setEditingTableNames(prev => ({
                    ...prev,
                    [table.id]: tableNames[table.id] || `Table ${tableIndex + 1}`
                  }));
                }}
                onBlur={(e) => {
                  const currentValue = e.target.value;
                  // Clear the editing state
                  setEditingTableNames(prev => {
                    const newState = { ...prev };
                    delete newState[table.id];
                    return newState;
                  });
                  
                  // Only restore default name if field is completely empty
                  if (!currentValue || currentValue.trim() === "") {
                    const defaultName = `Table ${tableIndex + 1}`;
                    updateTableName(table.id, defaultName);
                  } else {
                    // Save the valid name
                    updateTableName(table.id, currentValue.trim());
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.target.blur(); // Trigger blur event
                  }
                }}
                placeholder={`Table ${tableIndex + 1}`}
                className="text-lg bg-transparent dark:text-white focus:bg-gray-100 focus:dark:bg-[#513a7a] font-semibold focus:border-blue-500 focus:outline-none px-2"
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
                                  // Calculate the formula result
                                  const result = evaluateFormula(
                                    currentValue,
                                    table.data
                                  );

                                  // Update the formula result
                                  const updatedTables = [...tables];
                                  updatedTables[tableIndex].formulas =
                                    updatedTables[tableIndex].formulas || {};
                                  updatedTables[tableIndex].formulas[
                                    `${rowIndex}-${colIndex}`
                                  ] = {
                                    formula: currentValue,
                                    result: result,
                                  };

                                  // Update state
                                  setTables(updatedTables);

                                  // Recalculate other formulas that might depend on this one
                                  recalculateFormulas(tableIndex);

                                  // Save changes
                                  saveTableData(tableIndex);
                                }
                                setEditingCell(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const currentValue = table.data[rowIndex][colIndex];
                                  if (currentValue && currentValue.startsWith("=")) {
                                    recalculateFormulas(tableIndex);
                                  }
                                  setEditingCell(null);
                                  
                                  // Move to the next row
                                  const nextRow = rowIndex + 1;
                                  if (nextRow < table.data.length) {
                                    handleCellDoubleClick(tableIndex, nextRow, colIndex);
                                  } else {
                                    // If we're at the last row, add a new row and move to it
                                    addRow(tableIndex).then(() => {
                                      handleCellDoubleClick(tableIndex, nextRow, colIndex);
                                    });
                                  }
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
                                !isNaN(
                                  parseFloat(table.data[rowIndex][colIndex])
                                )
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
                                : cell &&
                                  cell.startsWith &&
                                  cell.startsWith("=")
                                ? "#NEED_CALC" // Indicate formula needs calculation
                                : cell}
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
                {/* <Button
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
                ></Button> */}
                {showColorPicker && activeTableIndex === tableIndex && (
                  <div className="absolute w-48 left-0 -top-56 z-50 -mt-2 bg-white dark:bg-[#513a7a] border border-gray-200 dark:border-gray-700 rounded shadow-lg p-3">
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
