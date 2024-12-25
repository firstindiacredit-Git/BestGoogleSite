import React, { useState, useEffect, useRef } from "react";
import { Check, Edit, Trash2, Palette } from "lucide-react";

const TodoComponent = () => {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [containerColor, setContainerColor] = useState("#f0f9ff");
  const [textColor, setTextColor] = useState("#000");
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

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
    "#FFD700",
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
    "#FF4500",
    "#FFA500",
    "#FFD700",
    "#32CD32",
    "#20B2AA",
    "#4169E1",
    "#8A2BE2",
    "#9370DB",
    "#FF69B4",
  ];

  const isLight = (color) => {
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  };

  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    const savedContainerColor = localStorage.getItem("containerColor");

    if (savedTodos) setTodos(JSON.parse(savedTodos));
    if (savedContainerColor) {
      setContainerColor(savedContainerColor);
      setTextColor(isLight(savedContainerColor) ? "#000" : "#fff");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
    localStorage.setItem("containerColor", containerColor);
    setTextColor(isLight(containerColor) ? "#000" : "#fff");
  }, [todos, containerColor]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTodo = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo = {
      id: Date.now(),
      text: inputValue,
      completed: false,
    };

    setTodos([...todos, newTodo]);
    setInputValue("");
  };

  const toggleComplete = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const startEditing = (id, text) => {
    setEditingId(id);
    setInputValue(text);
  };

  const submitEdit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setTodos(
      todos.map((todo) =>
        todo.id === editingId ? { ...todo, text: inputValue } : todo
      )
    );
    setEditingId(null);
    setInputValue("");
  };

  const handleDragStart = (index) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = () => {
    if (draggedItemIndex === null || dragOverIndex === null) return;

    const updatedTodos = [...todos];
    const [movedItem] = updatedTodos.splice(draggedItemIndex, 1);
    updatedTodos.splice(dragOverIndex, 0, movedItem);

    setTodos(updatedTodos);
    setDraggedItemIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div
      className="container mt-8 mx-auto -ml-10 rounded-md"
      style={{ backgroundColor: containerColor, color: textColor }}
    >
      <div className="bg-transparent w-full rounded-lg shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Todo List</h2>
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="px-4 py-3 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
          >
            <Palette className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={editingId ? submitEdit : addTodo} className="mb-6">
          <div className="flex gap-2 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={editingId ? "Edit todo..." : "Add a new todo..."}
              className="flex-1 p-3 rounded-lg border focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {editingId ? "Update" : "Add"}
            </button>

            {showColorPicker && (
              <div
                ref={colorPickerRef}
                className="absolute z-10 grid grid-cols-7 gap-2 p-3 bg-white border rounded-md shadow-md"
                style={{ top: "-20px", left: "300px" }}
              >
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setContainerColor(color);
                      setShowColorPicker(false);
                    }}
                    style={{
                      backgroundColor: color,
                    }}
                    className="h-5 w-5 border cursor-pointer focus:outline-none"
                    aria-label={`Select color ${color}`}
                  ></button>
                ))}
                <div className="col-span-full flex justify-center">
                  <input
                    id="customColorPicker"
                    type="color"
                    className="w-full h-6 p-0 border-gray-300 rounded-md cursor-pointer focus:outline-none"
                    onChange={(e) => {
                      setContainerColor(e.target.value);
                      setShowColorPicker(false);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </form>

        <ul className="space-y-3">
          {todos.map((todo, index) => (
            <li
              key={todo.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              className={`flex items-center justify-between p-4 rounded-lg cursor-move bg-transparent shadow-sm transition-shadow ${
                draggedItemIndex === index ? "opacity-50" : ""
              } ${dragOverIndex === index ? "bg-blue-100" : ""}`}
            >
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => toggleComplete(todo.id)}
                  className={`p-2 rounded-full ${
                    todo.completed ? "bg-green-500 text-white" : "bg-gray-200"
                  }`}
                >
                  <Check className="w-4 h-4" />
                </button>
                <span className={todo.completed ? "line-through" : ""}>
                  {todo.text}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEditing(todo.id, todo.text)}
                  className="p-2 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-2 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TodoComponent;
