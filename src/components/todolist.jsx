import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const initialTasks = [
  { id: "1", text: "Buy groceries", isCompleted: false },
  { id: "2", text: "Complete React project", isCompleted: false },
  { id: "3", text: "Read a book", isCompleted: true },
  { id: "4", text: "Walk the dog", isCompleted: false },
];

const SortableToDoList = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState("");

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
      const newTaskObj = {
        id: String(tasks.length + 1),
        text: newTask,
        isCompleted: false,
      };
      setTasks([...tasks, newTaskObj]);
      setNewTask(""); // Clear input after adding
    }
  };

  const handleToggleCompletion = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
    );
    setTasks(updatedTasks);
  };

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="p-2 border border-gray-300 rounded-md w-80"
        />
        <button
          onClick={handleAddTask}
          className="ml-2 p-2 bg-blue-500 text-white rounded-md"
        >
          Add Task
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="todo-list">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="w-full max-w-[500px] min-h-[60px] border border-gray-300 bg-white rounded-md overflow-hidden"
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
                        className={`font-bold text-xl ${
                          task.isCompleted ? "line-through text-gray-500" : ""
                        }`}
                      >
                        {task.text}
                      </span>
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
    <div className="p-5">
      <SortableToDoList />
    </div>
  );
};

export default Todolist;
