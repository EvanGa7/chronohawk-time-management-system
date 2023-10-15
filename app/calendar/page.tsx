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
import '../globals.css';

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Task {
  title: string;
  duedate: Date;
  start: Date;
  end: Date;
  priorityof: number;
  estimatedtime: number;
  taskid: string;
  tasktype: number;
  numdays: number;
  eventHeight: number;
  color: string;
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

//   function calculateTaskDuration(taskDuration, startDate, dueDate, numdays) {
//     let remainingDuration = taskDuration;
//     let currentDate = new Date(startDate);
//     let endDate = new Date(startDate);

//     let daysScheduled = 0;

//     while (daysScheduled < numdays) {
//         const dayOfWeek = currentDate.getDay();
//         const availableTime = freeTimeByDay[dayOfWeek] || 0;

//         if (dueDate && currentDate > dueDate) {
//             console.error("Task cannot be scheduled within the due date!");
//             return null;
//         }

//         if (remainingDuration > 0) {
//             if (availableTime >= remainingDuration) {
//                 endDate.setMinutes(endDate.getMinutes() + remainingDuration);
//                 remainingDuration = 0;
//             } else {
//                 endDate.setMinutes(endDate.getMinutes() + availableTime);
//                 remainingDuration -= availableTime;
//             }
//         }

//         if (remainingDuration <= 0 && daysScheduled === numdays - 1) {
//             break;
//         }

//         currentDate.setDate(currentDate.getDate() + 1);
//         endDate = new Date(currentDate);
//         daysScheduled++;
//     }

//     endDate.setDate(endDate.getDate() - 1);

//     return {
//         start: startDate,
//         end: endDate,
//     };
// }

// function deductTimeFromTracker(freeTimeTracker, day, time) {
//   const dayInfo = freeTimeTracker.find(d => d.day === day);
//   if (dayInfo) {
//       dayInfo.availableTime -= time;
//   }
// }

// function isTimeAvailable(freeTimeTracker, day, time) {
//   const dayInfo = freeTimeTracker.find(d => d.day === day);
//   return dayInfo && dayInfo.availableTime >= time;
// }


// function initializeFreeTimeTracker(freeTimeByDay) {
//   return Object.keys(freeTimeByDay).map(day => ({
//       day: parseInt(day),
//       availableTime: freeTimeByDay[day]
//   }));
// }

// async function updateTasksWithDates() {
//   const sortedTasks = [...tasks].sort((a, b) => {
//       if (a.duedate < b.duedate) return -1;
//       if (a.duedate > b.duedate) return 1;
//       return b.priorityof - a.priorityof;
//   });

//   let currentDate = new Date();
//   const freeTimeTracker = initializeFreeTimeTracker(freeTimeByDay);

//   let recalculationCount = 0;
//   const MAX_RECALCULATIONS = 3;

//   for (let i = 0; i < sortedTasks.length; i++) {
//       let task = sortedTasks[i];

//       const { start: taskStartDate, end: taskEndDate } = calculateTaskDuration(task.estimatedtime, currentDate, task.duedate, task.numdays);

//       // If endDate is before startDate, reset and recalculate

//         if (taskEndDate < taskStartDate) {
//           if (recalculationCount >= MAX_RECALCULATIONS) {
//               console.error("Max recalculations reached for task", task.name);
//                         // Reset currentDate to the next day after the previously scheduled task's endDate
//           if (i > 0) {
//               currentDate = new Date(sortedTasks[i - 1].end);
//               currentDate.setDate(currentDate.getDate() + 1);
//               continue
//           }
//           i--; // Decrement index to recalculate the current task
//           }
//           recalculationCount++;
//         } else {
//             recalculationCount = 0;  // reset count for the next task
//         }
//       }

//       // Deduct the time used by the task from the freeTimeTracker
//       let timeUsed = (taskEndDate.getHours() * 60 + taskEndDate.getMinutes()) - (taskStartDate.getHours() * 60 + taskStartDate.getMinutes());
//       deductTimeFromTracker(freeTimeTracker, taskStartDate.getDay(), timeUsed);

//       // Check if there's any remaining time on the current day
//       if (!isTimeAvailable(freeTimeTracker, taskEndDate.getDay(), task.estimatedtime)) {
//           currentDate.setDate(currentDate.getDate() + 1);
//       } else {
//           currentDate = new Date(taskEndDate);
//       }

//       task.start = taskStartDate;
//       task.end = taskEndDate;

//       // Update the task in the database
//       const { error } = await supabase
//           .from('tasks')
//           .update({
//               startdate: task.start,
//               enddate: task.end
//           })
//           .eq('taskid', task.taskid);

//       if (error) {
//           console.error("Error updating task:", error.message);
//       }
//   }
//   window.location.reload();
// }

function calculateTaskDuration(taskDuration, startDate, dueDate, numdays) {
  let remainingDuration = taskDuration;
  let currentDate = new Date(startDate);
  let endDate = new Date(startDate);

  let daysScheduled = 0;

  while (daysScheduled < numdays) {
      const dayOfWeek = currentDate.getDay();
      const availableTime = freeTimeByDay[dayOfWeek] || 0;

      if (dueDate && currentDate > dueDate) {
          console.error("Task cannot be scheduled within the due date!");
          return null;
      }

      if (remainingDuration > 0) {
          if (availableTime >= remainingDuration) {
              endDate.setMinutes(endDate.getMinutes() + remainingDuration);
              remainingDuration = 0;
          } else {
              endDate.setMinutes(endDate.getMinutes() + availableTime);
              remainingDuration -= availableTime;
          }
      }

      // If there's no remaining duration, break out of the loop
      if (remainingDuration <= 0) {
          break;
      }

      currentDate.setDate(currentDate.getDate() + 1);
      endDate = new Date(currentDate);
      daysScheduled++;
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

  for (let i = 0; i < sortedTasks.length; i++) {
      const task = sortedTasks[i];
      const result = calculateTaskDuration(task.estimatedtime, currentDate, task.duedate, task.numdays);
      
      if (!result) {
          console.error("Couldn't schedule task:", task);
          continue;
      }

      const { start, end } = result;

      task.start = start;
      task.end = end;

      // Update the currentDate to the end date of the last scheduled task
      currentDate = new Date(end);

      // Check if there's any remaining time on the current day
      const dayOfWeek = currentDate.getDay();
      const availableTime = freeTimeByDay[dayOfWeek] || 0;
      const timeUsed = (end.getHours() * 60 + end.getMinutes()) - (start.getHours() * 60 + start.getMinutes());
      const remainingTime = availableTime - timeUsed;
      
      // If the next task can fit into the remaining time, schedule it on the same day
      if (i + 1 < sortedTasks.length && sortedTasks[i + 1].estimatedtime <= remainingTime) {
          i++; // Move to the next task
          const nextTask = sortedTasks[i];
          nextTask.start = currentDate;
          nextTask.end = new Date(currentDate.getTime() + nextTask.estimatedtime * 60 * 1000);
      } else {
          currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
      }

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

function getTimeDetails(task) {
  const start = new Date(task.start);
  const end = new Date(task.end);
  const dayOfWeek = start.getDay();
  const availableTime = freeTimeByDay[dayOfWeek] || 0;
  const timeUsed = (end.getHours() * 60 + end.getMinutes()) - (start.getHours() * 60 + start.getMinutes());
  const remainingTime = availableTime - timeUsed;

  return {
      timeUsed,
      remainingTime
  };
}

  function getColorForTaskType(taskType: number) {
    switch (taskType) {
      case 1: return 'red';
      case 2: return 'orange';
      case 3: return 'darkyellow';
      case 4: return 'green';
      case 5: return 'blue';
      case 6: return 'indigo';
      case 7: return 'purple';
      case 8: return 'violet';
      case 9: return '#ADD8E6'; // lightblue
      case 10: return '#90EE90'; // lightgreen
      case 11: return '#D8BFD8'; // thistle (a light purple)
      default: return 'white';  // Default color
    }
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

        const formattedTasks = data.map(task => {
          const adjustedEndDate = new Date(task.enddate);
          adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

          const taskColor = getColorForTaskType(task.tasktype);

          return {
              title: task.taskname,
              duedate: task.duedate,
              start: task.startdate,
              end: adjustedEndDate,
              eventHeight: 30,
              taskid: task.taskid,
              priorityof: task.piorityof,
              estimatedtime: task.estimatedtime,
              numdays: task.numdays,
              color: taskColor,
          };
      });      

        setTasks(formattedTasks);
        console.log(formattedTasks);
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
    const height = 50;

    const { timeUsed, remainingTime } = getTimeDetails(event);

    return (
        <div style={{ height: `${height}px`, overflow: 'hidden' }}>
            <b>{event.title}</b>
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
      <main className="calendar-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full w-full text-buddha-200">
          <div className="lg:col-span-2">
            <FullCalendar
              height = "auto"
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
      </main>
      <button className="bg-buddha-500 hover:bg-buddha-200 text-buddha-950 py-2 px-4 rounded-full align-center" onClick={updateTasksWithDates}>
         Update Tasks
      </button>
      <br />
      <Taskmenu />
    </div>
    </>
  );
}
