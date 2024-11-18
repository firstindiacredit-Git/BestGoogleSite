import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { db, auth } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const SortableToDoList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Listen for user login state
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchTasks(user.uid); // Fetch tasks on login
      } else {
        setUserId(null);
        setTasks([]); // Reset tasks on logout
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const fetchTasks = async (uid) => {
    const tasksCollection = collection(db, "users", uid, "todolist");
    const taskSnapshot = await getDocs(tasksCollection);

    const fetchedTasks = taskSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setTasks(fetchedTasks);
  };

  const saveTask = async (task) => {
    if (!userId) return;

    const taskDoc = doc(db, "users", userId, "todolist", task.id);
    await setDoc(taskDoc, task);
  };

  const deleteTask = async (taskId) => {
    if (!userId) return;

    const taskDoc = doc(db, "users", userId, "todolist", taskId);
    await deleteDoc(taskDoc);
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) {
      return;
    }

    const reorderedTasks = Array.from(tasks);
    const [movedTask] = reorderedTasks.splice(source.index, 1);
    reorderedTasks.splice(destination.index, 0, movedTask);

    setTasks(reorderedTasks);

    // Optionally save updated order (not required for Firestore as task order is UI-only)
  };

  const handleAddTask = () => {
    if (newTask.trim() !== "") {
      const newTaskObj = {
        id: String(Date.now()), // Unique ID
        text: newTask,
        isCompleted: false,
      };

      setTasks([...tasks, newTaskObj]);
      saveTask(newTaskObj);
      setNewTask(""); // Clear input after adding
    }
  };

  const handleToggleCompletion = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
    );

    setTasks(updatedTasks);

    const toggledTask = updatedTasks.find((task) => task.id === taskId);
    saveTask(toggledTask);
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);

    deleteTask(taskId);
  };

  return (
    <div className="ml-1 border p-4 rounded-lg bg-white/10 backdrop-blur-lg shadow-2xl">
      <h1 className="dark:text-white text-xl font-semibold mb-3">
        TO DO LISTS
      </h1>
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="p-2 border border-gray-300 rounded-md w-60 focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleAddTask}
          className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Add
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="todo-list">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="w-full max-w-[500px] min-h-[60px] border border-gray-300 bg-white rounded-md shadow-md overflow-hidden"
            >
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex items-center justify-between p-5 border-b border-gray-300 cursor-move bg-white text-black text-sm box-border transition-transform duration-250 ease-in-out ${
                        task.isCompleted ? "bg-green-100" : ""
                      }`}
                    >
                      <span
                        onClick={() => handleToggleCompletion(task.id)}
                        className={`font-bold text-base flex-1 ${
                          task.isCompleted
                            ? "line-through text-gray-500"
                            : "text-black"
                        }`}
                      >
                        {task.text}
                      </span>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 bg-red-500 text-white rounded-md ml-2 hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

const Todolist = () => {
  return (
    <div className="-mt-5 flex justify-center">
      <SortableToDoList />
    </div>
  );
};

export default Todolist;
