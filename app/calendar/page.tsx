'use client'
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick
import timeGridPlugin from '@fullcalendar/timegrid';
import Taskmenu from '../components/taskmenu';
import { useRouter } from 'next/navigation'; // Import useRouter hook
import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Task {
  title: string;
  start: Date;
  end: Date;
}

export default function Calendar() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false); 
  const [newTask, setNewTask] = useState<Task>({
    title: '',
    start: new Date(),
    end: new Date(),
  });

  //check if signed in
useEffect(() => {
  const fetchUserData = async () => {
    try {
      const user = await supabase.auth.getUser();
      
      if (!user || !user.data || !user.data.user || !user.data.user.id) {
          throw new Error('A user is not logged in!');
      }

      setUserId(user.data.user.id);

    } catch (error) {
      alert(error.message);
      router.push('/account');
    }
  };

  fetchUserData();
}, []);

  // Function to handle adding a new task
  const handleAddTask = () => {
    // Add the new task to the tasks array
    setTasks([...tasks, newTask]);
    setIsAddingTask(false);
  };

  return (
    <>
    <div className="main-bg relative min-h-screen p-8 text-buddha-200">
      <main className="flex min-h-screen flex-col items-center p-24 ">
        <div className="grid grid-cols-1 sm:grid-cols-2 h-full w-full text-buddha-200">
          <div className="sm:col-span-2">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek',
              }}
              events={tasks}
              nowIndicator={true}
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

      <Taskmenu
        isAddingTask={isAddingTask}
        setIsAddingTask={setIsAddingTask}
        newTask={newTask}
        setNewTask={setNewTask}
        handleAddTask={handleAddTask}
      />
    </div>
    </>
  );
}
