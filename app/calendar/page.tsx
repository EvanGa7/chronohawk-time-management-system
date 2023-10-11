'use client'
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick
import timeGridPlugin from '@fullcalendar/timegrid';
import Taskmenu from '../components/taskmenu';
import { useRouter } from 'next/navigation'; // Import useRouter hook
import { createClient } from '@supabase/supabase-js';
import InModal from '../components/inModal';
import TaskModal from '../components/taskModal';

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

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

  useEffect(() => {
    const fetchFreeTime = async () => {
      try {
        const user = await supabase.auth.getUser();

        const { data, error } = await supabase
          .from('freetime')
          .select('*')
          .eq('userid', user.data.user.id);

        if (error) throw error;
        
        if (data.length === 0) {
          alert("Please enter your free time before adding tasks!");  
          router.push('/account/new/freetime');
        }

      } catch (error) {
        console.error("Error fetching free time:", error.message);
      }
    };
    fetchFreeTime();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('userid', userId);

        if (error) throw error;

        const formattedTasks = data.map(task => ({
          title: task.taskname,
          start: task.duedate, // Assuming duedate is the start date
          end: task.duedate,   // Assuming duedate is the end date
          eventHeight: 30,
          taskid: task.taskid  // Include the taskid as a custom property
        }));

        setTasks(formattedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error.message);
      }
    };

    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  const handleDateSelect = (selectInfo) => {
    
    setSelectedDate(selectInfo.start);
    setIsModalOpen(true);
  };

  function renderEventContent(eventInfo) {
    const { event } = eventInfo;
    const height = event.extendedProps.eventHeight || 'auto'; // Use the custom property
  
    return (
      <div style={{ height: `${height}px`, overflow: 'hidden' }}>
        {event.title}
      </div>
    );
  }

  const handleEventClick = (clickInfo) => {
    setSelectedTask(clickInfo.event.extendedProps.taskid);
    setIsTaskModalOpen(true);
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
              eventColor = '#EAC725'
              eventTextColor = '#1F2937'
              eventContent={renderEventContent}
              eventClick={handleEventClick}
              initialView="dayGridMonth"
              nowIndicator={true}
              selectable={true}
              dayMaxEvents={true}
              weekends={true}
              select={handleDateSelect}
            />
          </div>
          <TaskModal 
            isOpen={isTaskModalOpen} 
              onClose={() => setIsTaskModalOpen(false)} 
              selectedTask={selectedTask}
              modalMode="view"
          />
          <InModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            selectedDate={selectedDate}
          />
        </div>
      </main>
      <Taskmenu />
    </div>
    </>
  );
}
