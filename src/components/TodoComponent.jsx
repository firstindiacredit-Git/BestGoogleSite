import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaTrash, FaEdit, FaCheck, FaPalette } from 'react-icons/fa';
import CustomColorPicker from './CustomColorPicker';

const TodoComponent = () => {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [todoColor, setTodoColor] = useState('#f0f9ff');
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo = {
      id: Date.now(),
      text: inputValue,
      completed: false,
      timestamp: new Date().toISOString(),
    };

    setTodos([...todos, newTodo]);
    setInputValue('');
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
    setInputValue('');
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTodos(items);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div 
          className="bg-white rounded-lg shadow-xl overflow-hidden"
          style={{ backgroundColor: todoColor }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Todo List</h2>
              <button
                className="p-2 rounded-lg hover:bg-white/20 transition duration-200"
                onClick={() => setShowColorPicker(!showColorPicker)}
              >
                <FaPalette className="w-5 h-5" />
              </button>
              {showColorPicker && (
                <div className="absolute mt-2 right-0">
                  <CustomColorPicker
                    color={todoColor}
                    onChange={setTodoColor}
                    onClose={() => setShowColorPicker(false)}
                  />
                </div>
              )}
            </div>

            <form onSubmit={editingId ? submitEdit : addTodo} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={editingId ? "Edit todo..." : "Add a new todo..."}
                  className="flex-1 p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                >
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="todos">
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {todos.map((todo, index) => (
                      <Draggable
                        key={todo.id}
                        draggableId={todo.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`flex items-center justify-between p-4 rounded-lg bg-white/50 backdrop-blur-sm ${
                              todo.completed ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <button
                                onClick={() => toggleComplete(todo.id)}
                                className={`p-2 rounded-full ${
                                  todo.completed
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200'
                                }`}
                              >
                                <FaCheck className="w-4 h-4" />
                              </button>
                              <span
                                className={`flex-1 ${
                                  todo.completed ? 'line-through' : ''
                                }`}
                              >
                                {todo.text}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => startEditing(todo.id, todo.text)}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition duration-200"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteTodo(todo.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition duration-200"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoComponent;
