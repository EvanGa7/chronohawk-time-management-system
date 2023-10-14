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

const MAX_EVENT_HEIGHT = 80;

interface Task {
  title: string;
  duedate: Date;
  start: Date;
  end: Date;
  priorityof: number;
  estimatedtime: number;
  taskid: string;
}

export default function Calendar() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const [freeTime, setFreeTime] = useState([{
    freetimeid: '',
    userid: '',
    dayoffree: 0,
    minutesavailable: 0,
  }]
  );

  const [freeTimeByDay, setFreeTimeByDay] = useState({});

  useEffect(() => {
    const freeTimeObj = freeTime.reduce((acc, curr) => {
      acc[curr.dayoffree] = curr.minutesavailable;
      return acc;
    }, {});
    setFreeTimeByDay(freeTimeObj);
  }, [freeTime]);

  function getNextDateForDay(dayNum: number): Date {
    const today = new Date();
    const resultDate = new Date(today);
    resultDate.setDate(today.getDate() + (dayNum + 7 - today.getDay()) % 7);
    return resultDate;
  }  

  const freeTimeEvents = [];

  freeTime.forEach(freeTimeEntry => {
    const nextDate = getNextDateForDay(freeTimeEntry.dayoffree);
    for (let i = 0; i < 52; i++) {  // Assuming you want to create events for 52 weeks
      freeTimeEvents.push({
        title: `Free Time: ${freeTimeEntry.minutesavailable} mins`,
        start: new Date(nextDate),
        end: new Date(nextDate),  // Assuming the free time spans the entire day
        color: '#FF3352',
        allDay: true,
      });
      nextDate.setDate(nextDate.getDate() + 7);  // Move to the same day of the next week
    }
  });

  

  function calculateTaskDuration(taskDuration, startDate, dueDate) {
    let remainingDuration = taskDuration;
    let currentDate = new Date(startDate);
    let endDate = new Date(startDate);

    while (remainingDuration > 0) {
        const dayOfWeek = currentDate.getDay();
        const availableTime = freeTimeByDay[dayOfWeek];

        // Check if the current date exceeds the due date
        if (dueDate && currentDate > dueDate) {
            console.error("Task cannot be scheduled within the due date!");
            return null; // or handle this case as you see fit
        }

        if (availableTime >= remainingDuration) {
          endDate.setMinutes(endDate.getMinutes() + remainingDuration);
          remainingDuration = 0;
        } else {
            endDate.setMinutes(23, 59); // Set to end of day
            remainingDuration -= availableTime;
            currentDate.setDate(currentDate.getDate() + 1);
            endDate = new Date(currentDate);
        }      
    }

    return {
        start: startDate,
        end: endDate,
    };
}

  async function updateTasksWithDates() {
    // Sort tasks based on priority
    const sortedTasks = [...tasks].sort((a, b) => b.priorityof - a.priorityof);

    let currentDate = new Date(); // Start scheduling from today

    // For each task, calculate its start and end dates
    for (const task of sortedTasks) {
      const { start, end } = calculateTaskDuration(task.estimatedtime, currentDate, task.duedate);
      
      if (!start || !end) {
        console.error("Couldn't schedule task:", task);
        continue; // Skip this task if it couldn't be scheduled
      }

      task.start = start;
      task.end = end;

      currentDate = new Date(end); // Update the currentDate to the end date of the last scheduled task
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day

      // Update the task in the database
      const { error } = await supabase
        .from('tasks')
        .update({
          startdate: task.start,
          enddate: task.end
        })
        .eq('taskid', task.taskid);

      if (error) {
        console.error("Error updating task:", error.message);
      }
    }
    window.location.reload();
  }

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
        } else {
          // Map over the retrieved data to transform it into the desired format
          const freeTimes = data.map(freeTime => ({
            freetimeid: freeTime.freetimeid,
            userid: freeTime.userid,
            dayoffree: freeTime.dayoffree,
            minutesavailable: freeTime.minutesavailable,
          }));
          
          setFreeTime(freeTimes);
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
            duedate: task.duedate,
            start: task.startdate,
            end: task.enddate, 
            eventHeight: Math.min(30,MAX_EVENT_HEIGHT),
            taskid: task.taskid,
            priorityof: task.piorityof,
            estimatedtime: task.estimatedtime,
      }));

        setTasks(formattedTasks);
        useEffect(() => {
          updateTasksWithDates();
        }, [tasks, freeTimeByDay]);
      } catch (error) {
        console.error("Error fetching tasks:", error.message);
      }
    };

    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.start);
    setIsModalOpen(true);
  };

  function renderEventContent(eventInfo) {
    const { event } = eventInfo;
    const height = event.extendedProps.eventHeight || 30;
  
    return (
      <div style={{ height: `${height}px`, overflow: 'hidden' }}>
        {event.title}
        {event.estimatedtime}
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
              events={[...freeTimeEvents, ...tasks]}
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
        <br />
        <button className="bg-buddha-500 hover:bg-buddha-200 text-buddha-950 py-2 px-4 rounded-full" onClick={updateTasksWithDates}>
            Update Tasks
        </button>
      </main>
      <Taskmenu />
    </div>
    </>
  );
}
