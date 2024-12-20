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
import { MdDeleteOutline } from "react-icons/md";
const SortableToDoList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Listen for user login state
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchTasks(user.uid); 
      } else {
        setUserId(null);
        setTasks([]); 
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
  };

  const handleAddTask = () => {
    if (newTask.trim() !== "") {
      const now = new Date();
      const newTaskObj = {
        id: String(Date.now()), // Unique ID
        text: newTask,
        isCompleted: false,
        timestamp: `${now.toLocaleDateString()}, ${now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`, // e.g., "11/22/2024, 2:30 PM"
      };

      setTasks([...tasks, newTaskObj]);
      saveTask(newTaskObj);
      setNewTask("");
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

   const handleKeyDown = (e) => {
    
     if (e.key === "e") e.preventDefault(); 
     if (e.key === "Enter") handleAddTask(); 
   };

  return (
    <div className="border w-full p-2 mt-2 rounded-lg bg-white/10 backdrop-blur-lg ">
      <h1 className="dark:text-white text-[16px] font-semibold mb-3">
        TO DO LISTS
      </h1>
      <div className="mb-2 ml-1 flex items-center gap-1">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e)}
          placeholder="Add a new task..."
          className="px-2 py-1 border border-gray-300 rounded-md w-60 focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleAddTask}
          className="px-2 py-1 bg-blue-500 text-[16px] text-white rounded hover:bg-blue-600 transition"
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
                      className={`flex items-center justify-between p-1 border-b border-gray-300 cursor-move bg-white text-black text-sm box-border transition-transform duration-250 ease-in-out ${
                        task.isCompleted ? "bg-green-100" : ""
                      }`}
                    >
                      {/* Index */}
                      <span className="font-semibold text-gray-600 mr-2">
                        {index + 1}.
                      </span>

                      {/* Task Details */}
                      <div className="">
                        <span
                          onClick={() => handleToggleCompletion(task.id)}
                          className={`font-bold  text-base ${
                            task.isCompleted
                              ? "line-through text-gray-400"
                              : "text-black"
                          } break-words`}
                          style={{
                            display: "inline-block",
                            width: "15ch",  
                            overflowWrap: "break-word",  
                          }}
                        >
                          {task.text}
                        </span>
                      </div>

                      <div className="text-[10px] -ml-5 text-gray-500">
                        <span>{task.timestamp}</span>
                      </div>
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={() => handleToggleCompletion(task.id)}
                        className="h-4 w-4 accent-blue-500 cursor-pointer"
                      />

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-black rounded-md ml-2 hover:bg-gray-600 transition"
                      >
                        <MdDeleteOutline />
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
