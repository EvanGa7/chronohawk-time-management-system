'use client'
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'; // Import useRouter hook
import {Checkbox} from "@nextui-org/react";
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@nextui-org/react";

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

function prioritizeTasks(
  taskType: number,
  dueDate: Date | null,
  today: Date,
  urgencyThreshold: number,
  importanceScale: number,
  timeNeeded: number | null,
  daysLeft: number,
  type: number,
  dueTime: Date | null,
  currentTime: Date,
  currentCycleStartDate: Date | null,
  timesDoneWithinCycle: number,
  N: number,
  max: number,
  freeTime: (date: Date) => number
): number {
  let urgency: number;
  let timePlannedToday: number = 0;

  //get the user id
  const [userId, setUserId] = useState<number | null>(null);

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

  //retrieve the freetime for the user
  useEffect(() => {
    async function getFreeTime() {

      const { data, error } = await supabase
        .from('freetime')
        .select('*')
        .eq('userID', userId)
        .single()

      if (error) {
        alert(error.message);
      }

      if (data) {
       
      }

    }
  })

  //retrieve the tasks for the user
  useEffect(() => {
    async function getTasks() {

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('userID', userId)

      if (error) {
        alert(error.message);
      }

      if (data) {
       
      }

    }
  })

    if (taskType === 1 || taskType === 2) {
      if (dueDate && dueDate > today) {

        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(today.getDate() - 14);
    
        if (dueDate < twoWeeksAgo) {
          // Deactivate or delete it in SQL.
          // Deactivation or deletion logic here...
        }

      }
  
      if (dueDate && dueDate <= addDays(today, 1)) {
        // When dueDate exists and is due tomorrow or today.
        urgency = max + max * importanceScale;
      } else {
        urgency =
          max * importanceScale + (timeNeeded ? timeNeeded / daysLeft : 0); // If timeNeeded exists.
      }
    } else if (type === 3) {
      if (
        dueDate &&
        dueDate.toDateString() === today.toDateString() &&
        dueTime &&
        dueTime.getTime() >= currentTime.getTime() + (timeNeeded || 0)
      ) {
        // Here dueDate is the most recent day, calculated based on repeating.
        urgency = max; // Task with fixed schedule, must list if not past the scheduled time.
      } else {
        urgency = -1;
      }
    } else if (type === 4) {
      if (currentCycleStartDate && currentCycleStartDate <= today && timesDoneWithinCycle < N) {
        // timesDoneWithinCycle and currentCycleStartDate require calculation/user update.
        urgency = max * importanceScale;
      } else {
        urgency = -1;
      }
    } else {
      // type === 5
      urgency = 0; // Optional
    }
  
    // Input: list of tasks and urgency.
    // Output: list of tasks to display, sorted by urgency.
    // Procedure: sorting tasks on urgency.
    
    if (urgency >= max) {
      // Add task to display list.
      // Update timePlannedToday.
    } else if (urgency >= 0 && timePlannedToday < freeTime(today)) {
      // Add task to display list.
      // Update timePlannedToday.
    }
  
    return urgency;
  }

  
  function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

const NewTask = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    taskname: '',
    tasktype: '',
    duedate: '',
    estimatedtime: '',
    priorityof: '0',
    statusof: 'Inactive',
    numdays: '',
    recursion: false,
    frequencycycle: '',
    repetitioncycle: '',
    cyclestartdate: '',
  });

  const [isRecursive, setIsRecursive] = useState(false); // New state for recursion checkbox

  const handleCheckboxChange = () => {
    setIsRecursive(!isRecursive);
    setFormData({ ...formData, recursion: true});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const importance = parseFloat(formData.priorityof); // Assuming priorityof is a value between 0 and 1
    const daysLeft = parseInt(formData.numdays);
    const timeNeeded = parseFloat(formData.estimatedtime);
    const dueDate = new Date(formData.duedate);
    const today = new Date();

    const urgency = prioritizeTasks(importance, daysLeft, timeNeeded, dueDate, today);

    setFormData(prevData => ({ ...prevData, priorityof: urgency.toString() }));
  
    // Insert the new task into the 'tasks' table
    const session = await supabase.auth.getSession();
    if (session && session.data.session) {
      const {data} = await supabase
        .from('tasks')
        .insert([{
          userid: session.data.session.user?.id,
          taskname: formData.taskname,
          tasktype: formData.tasktype,
          duedate: formData.duedate,
          estimatedtime: formData.estimatedtime,
          timeleft: formData.estimatedtime,
          priorityof: formData.priorityof,
          statusof: formData.statusof,
          numdays: formData.numdays,
          recursion: formData.recursion,
        }]);
    } else {
      alert('Error inserting task data: ' + Error.prototype.message);
      return; // Exit early if there's an error
    }

    // Retrieve the taskid of the newly inserted task
    const { data: retrievedTask, error: retrieveError } = await supabase
    .from('tasks')
    .select('taskid')
    .eq('taskname', formData.taskname)
    .eq('tasktype', formData.tasktype)
    .eq('duedate', formData.duedate)
    .eq('estimatedtime', formData.estimatedtime)
    .eq('timeleft', formData.estimatedtime)
    .eq('priorityof', formData.priorityof)
    .eq('statusof', formData.statusof)
    .eq('numdays', formData.numdays)
    .eq('recursion', formData.recursion)
    .single();

    if (retrieveError) {
      alert('Error retrieving task data: ' + retrieveError.message);
      return;
    }

    const taskid = retrievedTask.taskid;
  
    if (isRecursive) {
      // If the task is recursive, insert into the 'recursion' table
      const { error: recursionError } = await supabase
        .from('recursion')
        .insert([{
          taskid: taskid,
          frequencycycle: formData.frequencycycle,
          repetitioncycle: formData.repetitioncycle,
          cyclestartdate: formData.cyclestartdate,
        }]);
  
      if (recursionError) {
        alert('Error inserting recursion data: ' + recursionError.message);
        return; // Exit early if there's an error
      }
    }
  
    alert('Task Created Successfully!');
    router.push('/calendar'); // Adjust the path
  };

  const [selectedTaskType, setSelectedTaskType] = useState<string | null>(null);

  const handleTaskTypeChange = (selectedType: string) => {
    setSelectedTaskType(selectedType);
    let typeValue;
    switch (selectedType) {
        case 'Test':
            typeValue = 1;
            break;
        case 'Quiz':
            typeValue = 2;
            break;
        case 'Assignment':
            typeValue = 3;
            break;
        case 'Project':
            typeValue = 4;
            break;
        default:
            typeValue = null;
    }
    setFormData(prevData => ({ ...prevData, tasktype: typeValue }));
};

  return (
    <div className="main-bg relative min-h-screen flex items-center justify-center text-buddha-950">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4 text-buddha-200">Create New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="taskname" className="block text-sm font-medium text-buddha-200">
              Task Name
            </label>
            <input 
              type="text"
              id="taskname"
              name="taskname"
              className="mt-1 p-2 w-full border border-buddha-950 rounded-md"
              placeholder="Enter task name"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-buddha-200">
                Task Type
            </label>
            <Dropdown>
                <DropdownTrigger>
                    <Button variant="flat" className='bg-buddha-500 text-buddha-950'>
                      {selectedTaskType ? selectedTaskType : 'Select Task Type'}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Task Types">
                  <DropdownItem key="type1" onClick={() => handleTaskTypeChange('Test')}>Test</DropdownItem>
                  <DropdownItem key="type2" onClick={() => handleTaskTypeChange('Quiz')}>Quiz</DropdownItem>
                  <DropdownItem key="type3" onClick={() => handleTaskTypeChange('Assignment')}>Assignment</DropdownItem>
                  <DropdownItem key="type4" onClick={() => handleTaskTypeChange('Project')}>Project</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className="mb-4">
            <label htmlFor="duedate" className="block text-sm font-medium text-buddha-200">
              Due Date
            </label>
            <input 
              type="date"
              id="duedate"
              name="duedate"
              className="mt-1 p-2 w-full border border-buddha-950 rounded-md"
              placeholder="Enter task name"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="estimatedtime" className="block text-sm font-medium text-buddha-200">
              Estimated Time
            </label>
            <input 
              type="number"
              id="estimatedtime"
              name="estimatedtime"
              className="mt-1 p-2 w-full border border-buddha-950 rounded-md"
              placeholder="Enter Estimated Minutes Needed"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="numdays" className="block text-sm font-medium text-buddha-200">
              Number Of Days
            </label>
            <input 
              type="number"
              id="numdays"
              name="numdays"
              className="mt-1 p-2 w-full border border-buddha-950 rounded-md"
              placeholder="Enter Estimated Days Needed"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="recursion" className="block text-sm font-medium text-buddha-200">
              Task Recursion
            </label>
            <Checkbox onChange={handleCheckboxChange} />
          </div>

          {isRecursive && (
            <>
              <div className="mb-4">
                <label htmlFor="cyclestartdate" className="block text-sm font-medium text-buddha-200">
                  Recursion Start Date
                </label>
                <input 
                  type="date"
                  id="cyclestartdate"
                  name="cyclestartdate"
                  className="mt-1 p-2 w-full border border-buddha-950 rounded-md"
                  placeholder="Enter Start Date"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="repetitioncycle" className="block text-sm font-medium text-buddha-200">
                  Recursion Cycle Period
                </label>
                <input 
                  type="number"
                  id="repetitioncycle"
                  name="repetitioncycle"
                  className="mt-1 p-2 w-full border border-buddha-950 rounded-md"
                  placeholder="Enter Number Of Days In Period"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="frequencycycle" className="block text-sm font-medium text-buddha-200">
                  Frequency of Recursions
                </label>
                <input 
                  type="number"
                  id="frequencycycle"
                  name="frequencycycle"
                  className="mt-1 p-2 w-full border border-buddha-950 rounded-md"
                  placeholder="Enter Number Of Repititions in Period"
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-buddha-500 text-buddha-950 py-2 px-4 rounded"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTask;


