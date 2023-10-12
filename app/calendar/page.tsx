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

  function calculateTaskDuration(taskDuration, startDate) {
    let remainingDuration = taskDuration;
    let currentDate = new Date(startDate);
    let endDate = new Date(startDate);

    while (remainingDuration > 0) {
        const dayOfWeek = currentDate.getDay();
        const availableTime = freeTimeByDay[dayOfWeek] || 0;

        if (availableTime >= remainingDuration) {
            endDate = new Date(currentDate);
            endDate.setMinutes(endDate.getMinutes() + remainingDuration);
            break;
        } else {
            remainingDuration -= availableTime;
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    return {
        start: startDate,
        end: endDate,
    };
}


  const updateFreeTime = (taskDuration, startDate) => {
    let remainingDuration = taskDuration;
    let currentDate = new Date(startDate);
    const updatedFreeTime = { ...freeTimeByDay };
  
    while (remainingDuration > 0) {
      const dayOfWeek = currentDate.getDay();
      const availableTime = updatedFreeTime[dayOfWeek] || 0;
  
      if (availableTime >= remainingDuration) {
        updatedFreeTime[dayOfWeek] -= remainingDuration;
        break;
      }
  
      updatedFreeTime[dayOfWeek] = 0;
      remainingDuration -= availableTime;
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    setFreeTimeByDay(updatedFreeTime);
  };

  const updateTask = async (taskData) => {
    // 1. Fetch existing tasks for the day
    const targetDate = new Date(taskData.date).toISOString().split('T')[0]; // Get YYYY-MM-DD format
    const { data: existingTasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('duedate', targetDate)
        .eq('userid', userId);

    if (error) {
        console.error("Error fetching tasks:", error.message);
        return;
    }

    // 2. Calculate total time for existing tasks
    const totalTimeForExistingTasks = existingTasks.reduce((sum, task) => sum + task.estimatedDuration, 0);

    // 3. Check against free time
    const dayOfWeek = new Date(taskData.date).getDay();
    const availableFreeTime = freeTimeByDay[dayOfWeek] || 0;

    if (totalTimeForExistingTasks + taskData.estimatedDuration > availableFreeTime) {
        alert("You don't have enough free time on this day to update this task.");
        return;
    }

    const { start, end } = calculateTaskDuration(taskData.estimatedDuration, taskData.startDate);
    taskData.start = start;
    taskData.end = end;

    updateFreeTime(taskData.estimatedDuration, taskData.startDate);

    // Check if the task already exists
    const existingTask = existingTasks.find(t => t.id === taskData.id);

    if (existingTask) {
        // Update the existing task
        const { error: updateError } = await supabase
            .from('tasks')
            .update({
                ...taskData,
                startdate: taskData.start,  // Update the start date
                enddate: taskData.end       // Update the end date
            })
            .eq('id', taskData.id);

        if (updateError) {
            console.error("Error updating task:", updateError.message);
            return;
        }

        alert("Task updated successfully!");
    } else {
        alert("Task does not exist. Cannot update.");
    }
};


function scheduleTasks(tasks, freeTimeByDay) {
  const sortedTasks = [...tasks].sort((a, b) => a.priority - b.priority); // Sort tasks by priority

  const scheduledTasks = [];
  let currentDay = new Date();

  for (const task of sortedTasks) {
      const { start, end } = calculateTaskDuration(task.estimatedDuration, currentDay);
      task.start = start;
      task.end = end;

      scheduledTasks.push(task);

      updateFreeTime(task.estimatedDuration, start);
      currentDay = new Date(end);
      currentDay.setDate(currentDay.getDate() + 1); // Move to the next day after the end date of the last scheduled task
  }

  return scheduledTasks;
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
          start: task.duedate,
          end: task.duedate, 
          eventHeight: 30,
          taskid: task.taskid,  // Include the taskid as a custom property
          color: '#EAC725'  // Set the color for the task
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

  useEffect(() => {
    const scheduledTasks = scheduleTasks(tasks, freeTimeByDay);
    setTasks(scheduledTasks);
  }, [tasks, freeTimeByDay]);
  

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
              events={[...freeTimeEvents, ...tasks]}
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
