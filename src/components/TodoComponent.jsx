import React, { useState, useEffect,useRef } from "react";
import { auth, db } from "./../firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Check, Edit, Trash2, Palette } from "lucide-react";

const TodoComponent = ({ containerColor, textColor }) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [user, setUser] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [predefinedColors, setPredefinedColors] = useState([
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
  ]);

  const isLight = (color) => {
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  };

  const colorPickerRef = useRef(null);

  // Load todos on component mount and auth state change
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Load todos from Firestore for authenticated users
        loadFirestoreTodos(user.uid);
      } else {
        // Load todos from localStorage for non-authenticated users
        const localTodos = JSON.parse(localStorage.getItem("todos") || "[]");
        setTodos(localTodos);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Save todos whenever they change
  useEffect(() => {
    if (user) {
      // Only save positions to localStorage for authenticated users
      const todoPositions = todos.map((todo, index) => ({
        id: todo.id,
        position: index,
      }));
      localStorage.setItem(`todoPositions_${user.uid}`, JSON.stringify(todoPositions));
    } else {
      // Save everything to localStorage for non-authenticated users
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos, user]);

  const loadFirestoreTodos = async (userId) => {
    const todosRef = collection(db, `users/${userId}/TodoList`);
    const q = query(todosRef, orderBy("timestamp", "desc"));
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreTodos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Get positions from localStorage
      const positions = JSON.parse(localStorage.getItem(`todoPositions_${userId}`) || "[]");
      
      // Sort todos based on saved positions
      const sortedTodos = [...firestoreTodos].sort((a, b) => {
        const posA = positions.find(p => p.id === a.id)?.position || 0;
        const posB = positions.find(p => p.id === b.id)?.position || 0;
        return posA - posB;
      });
      
      setTodos(sortedTodos);
    });

    return unsubscribe;
  };

  const addTodo = async (text) => {
    if (!text || text.trim() === "") return;

    const newTodoItem = {
      text: text.trim(),
      completed: false,
      timestamp: new Date().toISOString(),
      id: Date.now().toString(),
    };

    if (user) {
      // Add to Firestore for authenticated users
      try {
        const todoRef = doc(db, `users/${user.uid}/TodoList/${newTodoItem.id}`);
        await setDoc(todoRef, newTodoItem);
      } catch (error) {
        console.error("Error adding todo:", error);
      }
    } else {
      // Add to local state for non-authenticated users
      setTodos(prev => [newTodoItem, ...prev]);
    }
  };

  const toggleTodo = async (id) => {
    const todoToToggle = todos.find(todo => todo.id === id);
    if (!todoToToggle) return;

    const updatedTodo = { ...todoToToggle, completed: !todoToToggle.completed };

    if (user) {
      // Update in Firestore for authenticated users
      try {
        const todoRef = doc(db, `users/${user.uid}/TodoList/${id}`);
        await setDoc(todoRef, updatedTodo);
      } catch (error) {
        console.error("Error updating todo:", error);
      }
    } else {
      // Update in local state for non-authenticated users
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
    }
  };

  const deleteTodo = async (id) => {
    if (user) {
      // Delete from Firestore for authenticated users
      try {
        const todoRef = doc(db, `users/${user.uid}/TodoList/${id}`);
        await deleteDoc(todoRef);
      } catch (error) {
        console.error("Error deleting todo:", error);
      }
    } else {
      // Delete from local state for non-authenticated users
      setTodos(prev => prev.filter(todo => todo.id !== id));
    }
  };

  const startEditing = (id, text) => {
    setEditingId(id);
    setInputValue(text);
  };

  const submitEdit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const updatedTodo = { ...todos.find(todo => todo.id === editingId), text: inputValue };

    if (user) {
      // Update in Firestore for authenticated users
      try {
        const todoRef = doc(db, `users/${user.uid}/TodoList/${editingId}`);
        setDoc(todoRef, updatedTodo);
      } catch (error) {
        console.error("Error updating todo:", error);
      }
    } else {
      // Update in local state for non-authenticated users
      setTodos(prev => prev.map(todo => 
        todo.id === editingId ? updatedTodo : todo
      ));
    }

    setEditingId(null);
    setInputValue("");
  };

  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
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
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
    setDragOverIndex(null);
  };

  const handleClickOutside = (event) => {
    if (
      colorPickerRef.current &&
      !colorPickerRef.current.contains(event.target)
    ) {
      setShowColorPicker(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="container mx-auto rounded-b-lg"
      style={{ backgroundColor: containerColor, color: textColor }}
    >
      <div className="bg-transparent w-full rounded-lg  p-6 relative">
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

        {showColorPicker && (
          <div
            ref={colorPickerRef}
            className="absolute -mt-5 right-0 bg-white border rounded shadow-lg p-3 z-50 w-48 "
          >
            <div className="grid grid-cols-7 gap-1">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setContainerColor(color);
                  }}
                  style={{
                    backgroundColor: color,
                  }}
                  className="h-5 w-5 border cursor-pointer focus:outline-none"
                  aria-label={`Select color ${color}`}
                ></button>
              ))}
            </div>
            <div className="col-span-full flex justify-center mt-1">
              <input
                id="customColorPicker"
                type="color"
                className="w-full h-6  rounded-md cursor-pointer "
                onChange={(e) => {
                  setContainerColor(e.target.value);
                }}
              />
            </div>
          </div>
        )}

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (editingId) {
              submitEdit(e);
            } else {
              addTodo(newTodo);
              setNewTodo("");
            }
          }} 
          className="mb-6"
        >
          <div className="flex gap-2 relative">
            <input
              type="text"
              value={editingId ? inputValue : newTodo}
              onChange={(e) => editingId ? setInputValue(e.target.value) : setNewTodo(e.target.value)}
              placeholder={editingId ? "Edit todo..." : "Add a new todo..."}
              className="text-black flex-1 p-3 rounded-lg border focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {editingId ? "Update" : "Add"}
            </button>
          </div>
        </form>

        <ul className="space-y-3">
          {todos.map((todo, index) => (
            <li
              key={todo.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              className={`flex items-center justify-between p-4 rounded-lg cursor-move bg-white/50 shadow-sm transition-shadow ${
                draggedItemIndex === index ? "opacity-50" : ""
              } ${dragOverIndex === index ? "bg-blue-100" : ""}`}
            >
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => toggleTodo(todo.id)}
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
