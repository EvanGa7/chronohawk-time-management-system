'use client'
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

interface Task {
  title: string;
  start: Date;
  end: Date;
}

export default function Calendar() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false); 
  const [newTask, setNewTask] = useState<Task>({
    title: '',
    start: new Date(),
    end: new Date(),
  });

  // Function to handle adding a new task
  const handleAddTask = () => {
    // Add the new task to the tasks array
    setTasks([...tasks, newTask]);
    setIsAddingTask(false);
  };

  return (
    <>
      <main className="flex min-h-screen flex-col items-center p-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 h-full w-full text-buddha-950">
          <div className="sm:col-span-2">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek',
              }}
              events={tasks}
              navIndicator={true}
              editable={true}
              selectMirror={true}
              selectable={true}
              // dateClick={handleNewTaskClick} // Update the function name
              // eventClick={handleTaskClick} // Update the function name
              // eventDrop={handleTaskDrop} // Update the function name
            />
          </div>
        </div>
      </main>

      {/* Task management section */}
      <section className="p-4">
        {/* Task input form */}
        <div>
          <h2>Add Task</h2>
          {/* Task input fields (title, start, end, etc.) */}
          {/* Implement your form fields here */}
          <button onClick={handleAddTask}>Add Task</button>
        </div>

        {/* Rest of your task management section */}
      </section>

      {isAddingTask && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add Task</h2>
            <input
              type="text"
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            {/* Add other task-related input fields here */}
            <button onClick={handleAddTask}>Add Task</button>
            <button onClick={() => setIsAddingTask(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}
