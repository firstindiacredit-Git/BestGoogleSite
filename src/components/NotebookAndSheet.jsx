import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { MdOutlinePlaylistRemove } from "react-icons/md";

const NotebookAndDocumentSheet = () => {
  // Notebook State
  const [notebookContent, setNotebookContent] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState([]);

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
    <div className="min-h-screen dark:bg-[#4a454e] bg-gray-100 p-6">
      <div>
        <div className="w-[141%] mx-auto grid grid-cols-1 -mt-5 md:grid-cols-2 gap-6">
          {/* Notebook Section (Wider) */}
          <div className="bg-white text-black p-4 rounded-lg shadow-md col-span-1 md:col-span-1">
            <h2 className="text-xl font-semibold">Notebook</h2>
            <ReactQuill
              theme="snow"
              value={notebookContent}
              onChange={setNotebookContent}
              placeholder="Write your notes here..."
              className="h-44 text-sm text-black mb-10"
            />

            {/* Save Note and History Buttons */}
            <div className="flex  gap-4">
              <button
                onClick={saveNote}
                className="px-2 py-1 mt-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Note
              </button>
              <button
                onClick={showHistory}
                className="px-2 py-1 mt-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                History
              </button>
            </div>
          </div>

          {/* Todo List Section (Max width for small screens) */}
          <div className="max-w-sm -ml-[2%] mx-auto p-6 bg-white rounded-lg shadow-md col-span-1 md:col-span-1">
            <h1 className="text-xl text-black font-semibold text-center ">
              Todo List
            </h1>
            <div className="flex mb-4">
              <input
                type="text"
                value={todo}
                onChange={(e) => setTodo(e.target.value)}
                placeholder="Enter a todo"
                className="w-full px-4 py-2 text-black border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddTodo}
                className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>

            <ul className="space-y-4">
              {todos.map((item, index) => (
                <li
                  key={index}
                  className={`flex text-black justify-between items-center p-2 ${
                    item.completed ? "bg-gray-100 line-through" : "bg-white"
                  }`}
                >
                  <span
                    onClick={() => handleToggleComplete(index)}
                    className="cursor-pointer text-lg"
                  >
                    {item.text}
                  </span>
                  <button
                    onClick={() => handleRemoveTodo(index)}
                    className="ml-2 px-1 py-1 text-gray-500 rounded  focus:rounded-2xl focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <MdOutlinePlaylistRemove className="h-6 w-6" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* History Modal (Popup) */}
        {showHistoryModal && (
          <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-2/3 max-h-3/4 overflow-y-auto">
              <h2 className="text-4xl text-black font-semibold mb-4">
                History
              </h2>
              {/* Display all history notes */}
              <div className="space-y-4 overflow-y-auto max-h-80">
                {history.map((note, index) => (
                  <div key={index} className="text-black">
                    {/* Display text content without any HTML */}
                    <div className="mb-2 whitespace-pre-line border-b-2 border-gray-300 pb-2">
                      {note.replace(/<[^>]*>/g, "")}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={closeHistoryModal}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Document Sheet Section (Shifted Down) */}
      <div className="bg-white p-4 mt-2 rounded-lg shadow-md">
        <h2 className="text-3xl  text-green-600 font-semibold">
          Document Sheet
        </h2>

        {/* Render all tables */}
        {tables.map((table) => (
          <div key={table.id} className="">
            {/* Table Name Input */}
            <input
              type="text"
              value={table.name}
              onChange={(e) => handleTableNameChange(table.id, e.target.value)}
              className="text-lg font-medium ml-16 text-black w-60 border-none px-4 py-2 rounded"
              placeholder="Enter table name"
            />

            <table className="table-auto border-collapse border border-gray-300 w-full text-left">
              <thead>
                <tr>
                  {table.data[0].map((header, colIndex) => (
                    <th
                      key={colIndex}
                      className="border border-gray-300 px-4 py-2 bg-gray-300"
                    >
                      <input
                        type="text"
                        value={header}
                        onChange={(e) =>
                          handleChange(table.id, 0, colIndex, e.target.value)
                        }
                        className="w-full text-black border-none focus:outline-none bg-transparent"
                        placeholder="Column Header"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.data.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td
                        key={colIndex}
                        className="border text-black border-gray-300 px-4 py-2"
                      >
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) =>
                            handleChange(
                              table.id,
                              rowIndex + 1,
                              colIndex,
                              e.target.value
                            )
                          }
                          className="w-full border-none focus:outline-none"
                          placeholder="Enter data"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-1 flex gap-2">
              <button
                onClick={() => addRow(table.id)}
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Row
              </button>
              <button
                onClick={() => addColumn(table.id)}
                className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Add Column
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addTable}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mt-4"
        >
          Add Table
        </button>
      </div>
    </div>
  );
};

export default NotebookAndDocumentSheet;
