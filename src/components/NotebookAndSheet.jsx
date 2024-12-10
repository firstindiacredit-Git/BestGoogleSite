import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import NotePage from "./NotePage";
import Excel from "./Excel";
import TodoComponent from "./TodoComponent";
import "react-quill/dist/quill.snow.css";
import { MdOutlinePlaylistRemove } from "react-icons/md";
import {
  FaPalette,
  FaDownload,
  FaBold,
  FaUnderline,
  FaMinus,
  FaPlus,
  FaTrash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeUp,
  FaVolumeMute,
  FaSearchPlus,
  FaSearchMinus,
} from "react-icons/fa";

import CustomColorPicker, { isLightColor } from "./CustomColorPicker";

const NotebookAndDocumentSheet = () => {
  // Notebook State
  const [notebookContent, setNotebookContent] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [notepadColor, setNotepadColor] = useState("#fff3cd");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [notes, setNotes] = useState("");
  const [notepadId, setNotepadId] = useState(null);
  const [showNotePadPicker, setShowNotePadPicker] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [newTodo, setNewTodo] = useState("");
  const [todoId, setTodoId] = useState(null);
  const [todoColor, setTodoColor] = useState("#cfe2ff");
  const [showTodoPicker, setShowTodoPicker] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [editedTodoText, setEditedTodoText] = useState("");
  const [excelSheetId, setExcelSheetId] = useState(null);
  const [excelSheetColor, setExcelSheetColor] = useState("#d4edda");
  const [showExcelPicker, setShowExcelPicker] = useState(false);
  const [deleteAction, setDeleteAction] = useState({ type: "", index: null });
  const notePadRef = useRef(null);
  const colorPickerRef = useRef(null);

  // Handle Save Note (All notes saved in history)
  const saveNote = () => {
    setHistory((prevHistory) => [...prevHistory, notebookContent]);
    setNotebookContent(""); // Clear the notebook after saving
  };

  // Display History Modal (Popup)
  const showHistory = () => {
    setShowHistoryModal(true);
  };

  // Close History Modal
  const closeHistoryModal = () => {
    setShowHistoryModal(false);
  };

  // State for managing multiple tables
  const [tables, setTables] = useState([
    { id: 1, name: "Table 1", data: [[""]] }, // Default table with name
  ]);

  // Handle input changes for cells
  const handleChange = (tableId, rowIndex, colIndex, value) => {
    setTables((prevTables) =>
      prevTables.map((table) =>
        table.id === tableId
          ? {
              ...table,
              data: table.data.map((row, rIdx) =>
                rIdx === rowIndex
                  ? row.map((cell, cIdx) => (cIdx === colIndex ? value : cell))
                  : row
              ),
            }
          : table
      )
    );
  };

  const handleNotesChange = async (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
  };

  const downloadNotePad = () => {
    const element = document.createElement("a");
    const file = new Blob([notes], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "notepad.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toggleSpeechToText = () => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      if (!isListening) {
        recognition.start();
        setIsListening(true);

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join("");

          setNotes((prev) => prev + " " + transcript);
          handleNotesChange({ target: { value: notes + " " + transcript } });
        };

        recognition.onerror = (event) => {
          console.error(event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };
      } else {
        recognition.stop();
        setIsListening(false);
      }
    } else {
      alert("Speech recognition is not supported in your browser.");
    }
  };

  const speakText = () => {
    if (!isSpeaking) {
      const utterance = new SpeechSynthesisUtterance(notes);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    } else {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleBold = () => setIsBold(!isBold);
  const toggleUnderline = () => setIsUnderline(!isUnderline);

  const handleFontSizeChange = (newSize) => {
    if (newSize >= 8 && newSize <= 32) {
      setFontSize(newSize);
    }
  };

  const handleZoomIn = () => setZoomLevel(Math.min(zoomLevel + 10, 200));
  const handleZoomOut = () => setZoomLevel(Math.max(zoomLevel - 10, 50));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      notePadRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSelectAll = () => {
    const textarea = notePadRef.current.querySelector("textarea");
    textarea.select();
  };

  const clearNotePad = () => {
    setDeleteAction({ type: "notepad" });
    $("#deleteproject").modal("show");
  };

  const updateColors = async (type, color) => {};

  // Handle table name change
  const handleTableNameChange = (tableId, value) => {
    setTables((prevTables) =>
      prevTables.map((table) =>
        table.id === tableId ? { ...table, name: value } : table
      )
    );
  };

  // Add a new row to a specific table
  const addRow = (tableId) => {
    setTables((prevTables) =>
      prevTables.map((table) =>
        table.id === tableId
          ? {
              ...table,
              data: [...table.data, Array(table.data[0].length).fill("")],
            }
          : table
      )
    );
  };

  // Add a new column to a specific table
  const addColumn = (tableId) => {
    setTables((prevTables) =>
      prevTables.map((table) =>
        table.id === tableId
          ? {
              ...table,
              data: table.data.map((row) => [...row, ""]),
            }
          : table
      )
    );
  };

  // Add a new table
  const addTable = () => {
    const newTableId = tables.length + 1;
    const newTableName = `Table ${newTableId}`;
    setTables([
      ...tables,
      { id: newTableId, name: newTableName, data: [[""]] },
    ]);
  };

  const handleAddTodo = () => {
    if (todo) {
      setTodos([...todos, { text: todo, completed: false }]);
      setTodo("");
    }
  };

  const handleRemoveTodo = (index) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  const handleToggleComplete = (index) => {
    const newTodos = [...todos];
    newTodos[index].completed = !newTodos[index].completed;
    setTodos(newTodos);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className=" bg-white  dark:bg-gray-800 rounded-lg shadow-xl mx-auto">
        <div className="flex gap-10 w-full">
          <div className="w-[60%]"><NotePage /></div>
          <div className="w-[40%]"><TodoComponent /></div>
        </div>
        <Excel />
      </div>
    </div>
  );
};

export default NotebookAndDocumentSheet;
