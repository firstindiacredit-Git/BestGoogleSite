import { useState, useEffect, useRef } from "react";
import { Edit, Trash2, Palette } from "lucide-react";
import { Popconfirm, message } from "antd";
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
import { createPortal } from "react-dom";
import PropTypes from "prop-types";

// Helper function to determine if a color is light or dark
const isLight = (color) => {
  // Convert hex to RGB
  let hex = color.replace("#", "");
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

// Simple prevent scroll function like in CategoryHome
const preventScroll = (prevent) => {
  document.body.style.overflow = prevent ? "hidden" : "";
};

const TodoforTodo = ({ inNotebookSheet = false }) => {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [todoContainerColor, setTodoContainerColor] = useState("#9370DB");
  const [todoTextColor, setTodoTextColor] = useState("#000000");
  const [todoIsAutoColor, setTodoIsAutoColor] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: null,
    right: null,
  });

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
    const completedTodos = todos.filter((todo) => todo.completed).length;
    return Math.round((completedTodos / todos.length) * 100);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setTodos([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const fetchTodos = async () => {
      if (!user) return;

      try {
        const querySnapshot = await getDocs(
          collection(db, "users", user.uid, "TodoList")
        );
        const todosList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTodos(todosList);
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    };

    fetchTodos();
  }, [user]);

  // Load saved colors from localStorage on component mount
  useEffect(() => {
    const savedContainerColor = localStorage.getItem('todofortodo_containerColor');
    const savedTextColor = localStorage.getItem('todofortodo_textColor');
    const savedIsAutoColor = localStorage.getItem('todofortodo_isAutoColor');

    if (savedContainerColor && savedTextColor) {
      setTodoContainerColor(savedContainerColor);
      setTodoTextColor(savedTextColor);
      setTodoIsAutoColor(savedIsAutoColor === 'true');
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".color-picker-menu")) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showColorPicker && colorPickerRef.current) {
      const rect = colorPickerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + -205,
        right: window.innerWidth - rect.right,
      });
      preventScroll(true);
    } else {
      preventScroll(false);
    }
    return () => preventScroll(false);
  }, [showColorPicker]);

  useEffect(() => {
    if (inNotebookSheet) {
      const savedContainerColor = localStorage.getItem('todofortodo_containerColor');
      if (!savedContainerColor) {
        setTodoIsAutoColor(false);
        setTodoContainerColor("#fff");
        setTodoTextColor("#000");
      }
    }
  }, [inNotebookSheet]);

  const handleColorChange = (color) => {
    setTodoContainerColor(color);
    setTodoIsAutoColor(false);

    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const newTextColor = brightness > 128 ? "#000000" : "#ffffff";
    setTodoTextColor(newTextColor);

    // Save colors to localStorage
    localStorage.setItem('todofortodo_containerColor', color);
    localStorage.setItem('todofortodo_textColor', newTextColor);
    localStorage.setItem('todofortodo_isAutoColor', 'false');
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (!user) {
      message.warning("Your todos will not be saved.");
      const newTodo = {
        id: Date.now().toString(),
        text: inputValue,
        completed: false,
        createdAt: new Date(),
      };
      setTodos([...todos, newTodo]);
      setInputValue("");
      setDraggedItemIndex(null);
      setDragOverIndex(null);
      return;
    }

    try {
      const docRef = await addDoc(
        collection(db, "users", user.uid, "TodoList"),
        {
          text: inputValue,
          completed: false,
          createdAt: new Date(),
        }
      );

      const newTodo = {
        id: docRef.id,
        text: inputValue,
        completed: false,
      };

      setTodos([...todos, newTodo]);
      setInputValue("");
      setDraggedItemIndex(null);
      setDragOverIndex(null);
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const toggleComplete = async (id) => {
    if (!user) {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
      return;
    }

    try {
      const todoRef = doc(db, "users", user.uid, "TodoList", id);
      const todo = todos.find((t) => t.id === id);
      await updateDoc(todoRef, {
        completed: !todo.completed,
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
    if (!user) {
      setTodos(todos.filter((todo) => todo.id !== id));
      return;
    }

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

    if (!user) {
      setTodos(
        todos.map((todo) =>
          todo.id === editingId ? { ...todo, text: inputValue } : todo
        )
      );
      setEditingId(null);
      setInputValue("");
      return;
    }

    try {
      const todoRef = doc(db, "users", user.uid, "TodoList", editingId);
      await updateDoc(todoRef, {
        text: inputValue,
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

  const renderColorPickerMenu = () => {
    const dropdownClasses =
      "fixed w-48 bg-white dark:bg-[#28283A] border border-gray-200 dark:border-gray-700 rounded-sm shadow-lg p-1 z-[9999] color-picker-menu";
    const autoButtonClasses =
      "w-full py-1 px-2 text-sm bg-gray-100 dark:bg-[#513a7a] hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors text-gray-900 dark:text-white";
    const colorGridClasses = "grid grid-cols-7 gap-1";
    const colorSwatchClasses =
      "w-5 h-5 border dark:border-gray-600 border-gray-200 cursor-pointer transition duration-300 ease-in-out transform hover:scale-125 focus:outline-none";
    const customColorContainerClasses = "mt-2 flex items-center justify-center";
    const customColorInputClasses =
      "w-full h-6 p-0 border dark:border-gray-600 border-gray-300 rounded-xs cursor-pointer focus:outline-none";

    const dropdownContent = showColorPicker && (
      <div
        className={dropdownClasses}
        style={{
          top: `${dropdownPosition.top}px`,
          right: `${dropdownPosition.right}px`,
        }}
      >
        <div className="mb-2">
          <button
            onClick={() => {
              setTodoIsAutoColor(true);
              setShowColorPicker(false);
              localStorage.setItem('todofortodo_isAutoColor', 'true');
            }}
            className={autoButtonClasses}
          >
            Auto Theme Color
          </button>
        </div>

        <div className={colorGridClasses}>
          {predefinedColors.map((color) => (
            <button
              key={color}
              className={colorSwatchClasses}
              style={{ backgroundColor: color }}
              onClick={() => {
                handleColorChange(color);
                setShowColorPicker(false);
              }}
            />
          ))}
        </div>

        <div className={customColorContainerClasses}>
          <input
            type="color"
            className={customColorInputClasses}
            value={todoContainerColor}
            onChange={(e) => handleColorChange(e.target.value)}
          />
        </div>
      </div>
    );
    const paletteButtonContainerClasses = "color-picker-menu relative w-9";
    const paletteButtonClasses = `p-2 rounded-sm transition duration-200 ${
      todoIsAutoColor
        ? "bg-gray-100 dark:bg-[#513a7a] hover:bg-gray-200 dark:hover:bg-gray-700"
        : "bg-opacity-20 bg-gray-500 hover:bg-opacity-30"
    }`;
    return (
      <div className={paletteButtonContainerClasses} ref={colorPickerRef}>
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className={paletteButtonClasses}
          style={{ color: todoIsAutoColor ? undefined : todoTextColor }}
        >
          <Palette className="w-5 h-5" />
        </button>
        {dropdownContent && createPortal(dropdownContent, document.body)}
      </div>
    );
  };

  return (
    <div
      className={`p-2  transition-colors duration-200 w-full"
       rounded-b-sm backdrop-blur-sm relative ${
         todoIsAutoColor ? "dark:bg-[#28283A]/[(var(--widget-opacity))]" : ""
       }`}
      style={{
        backgroundColor: todoIsAutoColor ? undefined : todoContainerColor,
        color: todoIsAutoColor ? undefined : todoTextColor,
      }}
    >
      {inNotebookSheet && (
        <h1 className="text-2xl font-bold px-3 py-2">To do List</h1>
      )}
      <div className="p-3">
        <div className="flex justify-between gap-4 items-center mb-1">
          <div className="mb-4 w-full">
            <div
              className={`text-sm flex justify-between ${
                todoIsAutoColor
                  ? "text-gray-900 dark:text-gray-200"
                  : isLight(todoContainerColor)
                  ? "text-gray-700"
                  : "text-gray-200"
              } mb-1`}
            >
              <div>Progress</div>
              <div>{calculateProgress()}%</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div
          className="h-[400px] overflow-y-auto"
          style={{ border: "", borderRadius: "4px" }}
        >
          <ul className="space-y-2 mb-4">
            {todos.map((todo, index) => (
              <li
                key={todo.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={handleDrop}
                className={`flex items-center gap-3 p-2 rounded ${
                  dragOverIndex === index ? "border-2 border-blue-300" : ""
                }`}
              >
                <span
                  className={`min-w-[20px] text-sm ${
                    todoIsAutoColor
                      ? "text-gray-700 dark:text-gray-300"
                      : isLight(todoContainerColor)
                      ? "text-gray-600"
                      : "text-gray-300"
                  }`}
                >
                  {index + 1}.
                </span>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo.id)}
                  className="w-5 h-5 border-2 rounded-sm focus:ring-0 text-indigo-500"
                />
                <span
                  className={`flex-1 ${
                    todoIsAutoColor
                      ? todo.completed
                        ? "text-gray-400"
                        : "text-gray-900 dark:text-gray-100"
                      : isLight(todoContainerColor)
                      ? todo.completed
                        ? "text-gray-400"
                        : "text-gray-800"
                      : todo.completed
                      ? "text-gray-400"
                      : "text-gray-100"
                  } ${todo.completed ? "line-through" : ""}`}
                >
                  {todo.text}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditing(todo.id, todo.text)}
                    className={`${
                      todoIsAutoColor
                        ? "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                        : isLight(todoContainerColor)
                        ? "text-gray-500 hover:text-gray-700"
                        : "text-gray-300 hover:text-white"
                    }`}
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
                      className={`${
                        todoIsAutoColor
                          ? "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                          : isLight(todoContainerColor)
                          ? "text-gray-500 hover:text-gray-700"
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Popconfirm>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <form
          onSubmit={editingId ? submitEdit : addTodo}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add new task"
            className={`w-full p-1.5 pr-10 border rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              todoIsAutoColor
                ? "bg-white text-gray-900 border-gray-200 dark:bg-[#28283A] dark:text-white dark:placeholder-gray-400 dark:border-gray-700"
                : isLight(todoContainerColor)
                ? "bg-white text-gray-800"
                : "bg-gray-800 text-white placeholder-gray-400 border-gray-700"
            }`}
            style={{
              backgroundColor: todoIsAutoColor ? undefined : todoContainerColor,
              color: todoIsAutoColor ? undefined : todoTextColor,
            }}
          />
          <button
            type="submit"
            className={`absolute right-12 top-1/2 -translate-y-1/2 ${
              todoIsAutoColor
                ? "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                : isLight(todoContainerColor)
                ? "text-gray-500 hover:text-gray-700"
                : "text-gray-300 hover:text-white"
            }`}
            style={{
              backgroundColor: todoIsAutoColor
                ? undefined
                : todoContainerColor,
              color: todoIsAutoColor ? undefined : todoTextColor,
            }}
          >
            <span className="text-2xl">+</span>
          </button>
          {renderColorPickerMenu()}
        </form>
      </div>
    </div>
  );
};

TodoforTodo.propTypes = {
  inNotebookSheet: PropTypes.bool,
};

export default TodoforTodo;