import React, { useState, useEffect, useRef } from "react";
import { Check, Edit, Trash2, Palette } from "lucide-react";

const isLight = (color) => {
  const r = parseInt(color.substr(1, 2), 16);
  const g = parseInt(color.substr(3, 2), 16);
  const b = parseInt(color.substr(5, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
};

const TodoComponent = ({ data = [] }) => {
  // If data is provided (user logged in), use it. Otherwise check localStorage
  const [todos, setTodos] = useState(() => {
    if (data.length > 0) return data;
    const savedTodos = localStorage.getItem("todos");
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [containerColor, setContainerColor] = useState(() => {
    return localStorage.getItem("containerColor") || "#f0f9ff";
  });
  const [textColor, setTextColor] = useState(() => {
    const color = localStorage.getItem("containerColor") || "#f0f9ff";
    return isLight(color) ? "#000" : "#fff";
  });
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
    "#FFA500",
    "#FFD700",
    "#20B2AA",
    "#4169E1",
    "#9370DB",
    "#FF69B4",
  ];

  // Only save to localStorage if no data prop (user not logged in)
  useEffect(() => {
    if (data.length === 0) {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos, data]);

  useEffect(() => {
    localStorage.setItem("containerColor", containerColor);
    setTextColor(isLight(containerColor) ? "#000" : "#fff");
  }, [containerColor]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorPickerRef.current && 
        !colorPickerRef.current.contains(event.target) &&
        event.target.type !== 'color'  
      ) {
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
      className="container mx-auto"
      style={{ backgroundColor: containerColor, color: textColor }}
    >
      <div className="bg-transparent w-full rounded-lg shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="px-4 py-3 bg-black/20 text-black rounded-lg "
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
                className="absolute w-48 right-0 z-50 bg-white border rounded shadow-lg p-3"
              >
                <div className="grid grid-cols-7 gap-1">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      className="w-5 h-5 border border-gray-200 cursor-pointer transition duration-300 ease-in-out transform hover:scale-125 focus:outline-none"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setContainerColor(color);
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </div>

                {/* Custom Color Picker */}
                <div className="mt-1 flex items-center justify-center">
                  <input
                    id="customColorPicker"
                    type="color"
                    value={containerColor}
                    className="w-full h-6 p-0 border border-gray-300 rounded-md cursor-pointer focus:outline-none"
                    onChange={(e) => {
                      setContainerColor(e.target.value);
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
