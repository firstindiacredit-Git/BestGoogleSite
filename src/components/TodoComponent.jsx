import React, { useState, useEffect, useRef } from "react";
import { Check, Edit, Trash2, Palette } from "lucide-react";
import { Popconfirm } from "antd";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Helper function to determine if a color is light or dark
const isLight = (color) => {
  // Convert hex to RGB
  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

const TodoComponent = () => {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [containerColor, setContainerColor] = useState("#ffffff");
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

  const calculateProgress = () => {
    if (todos.length === 0) return 0;
    const completedTodos = todos.filter(todo => todo.completed).length;
    return Math.round((completedTodos / todos.length) * 100);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const fetchTodos = async () => {
      if (!user) return;
      
      try {
        const querySnapshot = await getDocs(collection(db, "users", user.uid, "TodoList"));
        const todosList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTodos(todosList);
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    };

    fetchTodos();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target)
      ) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !user) return;

    try {
      const docRef = await addDoc(collection(db, "users", user.uid, "TodoList"), {
        text: inputValue,
        completed: false,
        createdAt: new Date()
      });

      const newTodo = {
        id: docRef.id,
        text: inputValue,
        completed: false
      };

      setTodos([...todos, newTodo]);
      setInputValue("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const toggleComplete = async (id) => {
    try {
      const todoRef = doc(db, "users", user.uid, "TodoList", id);
      const todo = todos.find(t => t.id === id);
      await updateDoc(todoRef, {
        completed: !todo.completed
      });

      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "TodoList", id));
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const startEditing = (id, text) => {
    setEditingId(id);
    setInputValue(text);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      const todoRef = doc(db, "users", user.uid, "TodoList", editingId);
      await updateDoc(todoRef, {
        text: inputValue
      });

      setTodos(
        todos.map((todo) =>
          todo.id === editingId ? { ...todo, text: inputValue } : todo
        )
      );
      setEditingId(null);
      setInputValue("");
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const handleDragStart = (index) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedItemIndex === null || dragOverIndex === null) return;

    const newTodos = [...todos];
    const [draggedItem] = newTodos.splice(draggedItemIndex, 1);
    newTodos.splice(dragOverIndex, 0, draggedItem);

    setTodos(newTodos);
    setDraggedItemIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="max-w-sm rounded-lg p-6" style={{ backgroundColor: containerColor }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-medium ${isLight(containerColor) ? 'text-gray-800' : 'text-gray-100'}`}>
          Todo list
        </h2>
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className={`p-2 rounded ${isLight(containerColor) ? 'hover:bg-gray-100' : 'hover:bg-opacity-20 hover:bg-white'}`}
        >
          <Palette className={`w-5 h-5 ${isLight(containerColor) ? 'text-gray-700' : 'text-gray-100'}`} />
        </button>
      </div>

      {showColorPicker && (
        <div
          ref={colorPickerRef}
          className="absolute w-48 right-8 mt-2 bg-white border rounded shadow-lg p-3 z-10"
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

          <div className="mt-1 flex items-center justify-center">
            <input
              type="color"
              className="w-full h-6 p-0 border border-gray-300 rounded-md cursor-pointer focus:outline-none"
              value={containerColor}
              onChange={(e) => setContainerColor(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className={`text-sm ${isLight(containerColor) ? 'text-gray-700' : 'text-gray-200'} mb-1`}>
          {calculateProgress()}%
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
      </div>

      <ul className="space-y-2 mb-4">
        {todos.map((todo, index) => (
          <li
            key={todo.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={handleDrop}
            className={`flex items-center gap-3 p-2 rounded ${
              dragOverIndex === index ? 'border-2 border-blue-300' : ''
            }`}
          >
            <span className={`min-w-[20px] text-sm ${
              isLight(containerColor) ? 'text-gray-600' : 'text-gray-300'
            }`}>
              {index + 1}.
            </span>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleComplete(todo.id)}
              className="w-5 h-5 border-2 rounded-sm focus:ring-0 text-blue-500"
            />
            <span className={`flex-1 ${
              isLight(containerColor) 
                ? (todo.completed ? 'text-gray-400' : 'text-gray-800')
                : (todo.completed ? 'text-gray-400' : 'text-gray-100')
            } ${todo.completed ? 'line-through' : ''}`}>
              {todo.text}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => startEditing(todo.id, todo.text)}
                className={`${isLight(containerColor) ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 hover:text-white'}`}
              >
                <Edit className="w-4 h-4" />
              </button>
              <Popconfirm
                title="Delete task"
                description="Are you sure you want to delete this task?"
                onConfirm={() => deleteTodo(todo.id)}
                okText="Yes"
                cancelText="No"
                placement="leftTop"
              >
                <button
                  className={`${isLight(containerColor) ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 hover:text-white'}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Popconfirm>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={editingId ? submitEdit : addTodo} className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add new task"
          className={`w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isLight(containerColor) ? 'bg-white text-gray-800' : 'bg-gray-800 text-white placeholder-gray-400 border-gray-700'
          }`}
        />
        <button
          type="submit"
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${
            isLight(containerColor) ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-white'
          }`}
        >
          <span className="text-2xl">+</span>
        </button>
      </form>
    </div>
  );
};

export default TodoComponent;