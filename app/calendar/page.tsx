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
  recursion: boolean;
  recursionDetails?: Recursion;
  importance: number;
  statusof: string;
  timeleft: number;
  isrecurringadded: boolean;
}

interface Recursion {
  recursionid: number;
  taskid: number;
  frequencycycle: number;
  repetitioncycle: number;
  cyclestartdate: Date;
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
        end: new Date(nextDate),
        color: '#FF3352',  // Ensure this line is present and correct
        allDay: true,
      });      
      nextDate.setDate(nextDate.getDate() + 7);  // Move to the same day of the next week
    }
  });

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

      // Handle recursion
      if (task.recursion && task.recursionDetails) {
        const { cyclestartdate, repetitioncycle, frequencycycle } = task.recursionDetails;
        let recursionDate = new Date(cyclestartdate);
        const recursionEndDate = new Date(cyclestartdate);
        recursionEndDate.setDate(recursionEndDate.getDate() + repetitioncycle - 1); // Subtracting 1 to include the start date in the cycle
        while (recursionDate <= recursionEndDate) {
          // Schedule the recurring task
          const recurringTask = { ...task, start: recursionDate, duedate: new Date(recursionDate) };
          const recurringResult = calculateTaskDuration(recurringTask.estimatedtime, recursionDate, recurringTask.duedate, recurringTask.numdays);      
      
          if (recurringResult) {
      
              if (recurringTask.isrecurringadded == true) {
                  // Task exists, so update it
                  const { error: updateError } = await supabase
                      .from('tasks')
                      .update({
                        taskname: recurringTask.title,
                        duedate: recurringTask.duedate,
                        userid: userId,
                        priorityof: recurringTask.priorityof,
                        estimatedtime: recurringTask.estimatedtime,
                        tasktype: recurringTask.tasktype,
                        numdays: recurringTask.numdays,
                        importance: recurringTask.importance,
                        statusof: recurringTask.statusof,
                        timeleft: recurringTask.timeleft,
                        recursion: recurringTask.recursion,
                        startdate: recurringResult.start,
                        enddate: recurringResult.end
                      })
                      .eq('taskid',recurringTask.taskid);
      
                  if (updateError) {
                      console.error("Error updating recurring task:", updateError.message);
                  }
              } else {
                  const { error: updateError } = await supabase
                  .from('tasks')
                  .update({
                    isrecurringadded: true
                  })
                  .eq('taskid',recurringTask.taskid);

                  if (updateError) {
                    console.error("Error updating recurring task:", updateError.message);
                }
      
                  // Task doesn't exist, so insert it
                  const { error: insertError } = await supabase
                      .from('tasks')
                      .insert({
                          taskname: recurringTask.title,
                          startdate: recurringResult.start,
                          enddate: recurringResult.end,
                          duedate: recurringTask.duedate,
                          userid: userId,
                          priorityof: recurringTask.priorityof,
                          estimatedtime: recurringTask.estimatedtime,
                          tasktype: recurringTask.tasktype,
                          numdays: recurringTask.numdays,
                          importance: recurringTask.importance,
                          statusof: recurringTask.statusof,
                          timeleft: recurringTask.timeleft,
                          recursion: recurringTask.recursion,
                          isrecurringadded: true
                      });
      
                  if (insertError) {
                      console.error("Error inserting recurring task:", insertError.message);
                  }
              }
          }
      
          // Move to the next recursion date
          recursionDate.setDate(recursionDate.getDate() + frequencycycle);
      }}

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

// function getTimeDetails(task) {
//   const start = new Date(task.start);
//   const end = new Date(task.end);

//   // Calculate the difference in days between start and end dates
//   const diffInDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1; // +1 to include the start day

//   // Calculate time used based on the estimated time per day and the number of days
//   const timeUsed = (task.estimatedtime / task.numdays) * diffInDays;

//   // Logging for debugging
//   console.log("Start Date:", start);
//   console.log("End Date:", end);
//   console.log("Estimated Time:", task.estimatedtime);
//   console.log("Number of Days:", task.numdays);
//   console.log("Difference in Days:", diffInDays);
//   console.log("Calculated Time Used:", timeUsed);

//   return {
//       timeUsed,
//   };
// }


  function getColorForTaskType(taskType: number) {
    switch (taskType) {
      case 1: return 'red';
      case 2: return 'orange';
      case 3: return '#FFD700'; // gold
      case 4: return 'green';
      case 5: return 'blue';
      case 6: return 'indigo';
      case 7: return 'purple';
      case 8: return 'violet';
      case 9: return '#ADD8E6'; // lightblue
      case 10: return '#90EE90'; // lightgreen
      case 11: return '#D8BFD8'; // thistle (a light purple)
      default: return 'gray';  // Default color
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
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('userid', userId);
  
        if (tasksError) throw tasksError;
  
        const { data: recursionData, error: recursionError } = await supabase
          .from('recursion')
          .select('*');
  
        if (recursionError) throw recursionError;
  
        const formattedTasks = tasksData.map(task => {
          const taskRecursion = recursionData.find(r => r.taskid === task.taskid);
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
            priorityof: task.priorityof,
            estimatedtime: task.estimatedtime,
            statusof: task.statusof,
            tasktype: task.tasktype,
            timeleft: task.timeleft,
            numdays: task.numdays,
            importance: task.importance,
            color: taskColor,
            recursion: task.recursion,
            recursionDetails: taskRecursion || undefined,
            isrecurringadded: task.isrecurringadded
          };
        });
        
        setTasks(formattedTasks);
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

      return (
          <div style={{ height: `${height}px`, overflow: 'hidden' }}>
              <span style={{ color: 'white' }}>{event.title}</span>
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
              height="auto"
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
      <br />
      <br />
      <div className="flex justify-center items-center">
          <button className="bg-buddha-500 hover:bg-buddha-200 text-buddha-950 py-4 px-6 rounded-full" onClick={updateTasksWithDates}>
              Update Tasks
          </button>
      </div>
      <br />
      <br />
      <Taskmenu />
    </div>
    </>
  );
}
