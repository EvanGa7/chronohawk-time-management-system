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
  taskType: string,
  dueDate: Date,
  today: Date,
  status: string,
  freeTimePerDay: [
    {
      freetimeid: string,
      userid : string,
      dayoffree: number,
      minutesavailable: number,
    }
  ],
  estimatedTimeNeeded: number,
  daysThoughtNeeded: number,
  importance: number,
  timeLeft: number
): number {
  const maxUrgency = 10; 
  const days = [0, 1, 2, 3, 4, 5, 6];

  // 1. Task Type Urgency
  const taskTypeWeights = {
    1: 4, // Test
    2: 4, // Quiz
    3: 2, // Assignment
    4: 3, // Project
    5: 2, // Lecture
    6: 1, // Reading
    7: 2, // Discussion
    8: 5, // Final
    9: 5, // Midterm
    10: 3, // Presentation
    11: 3, // Paper
  };
  const taskTypeUrgency = taskTypeWeights[taskType] || 1;

  // 2. Due Date Urgency
  const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const dueDateUrgency = daysLeft <= 1 ? 3 : 2/daysLeft;

  // 3. Status Urgency
  const statusWeights = {
    'Not Started': 1,
    'Completed': 0
  };
  const statusUrgency = statusWeights[status];

  // 4. Free Time Urgency
  // const freeTimeUrgency = estimatedTimeNeeded / (freeTimePerDay + 1); // +1 to avoid division by zero
  let freeTimeUrgency = 0;
  freeTimePerDay.forEach(freeTime => {
    if (days.includes(freeTime.dayoffree)) {
      freeTimeUrgency += freeTime.minutesavailable;
    }
  });

  // 5. Time Needed Urgency
  const timeNeededUrgency = daysLeft <= daysThoughtNeeded ? 2 : 1;

  // 7. Time Left Urgency
  const timeLeftUrgency = (estimatedTimeNeeded - timeLeft + 1) / (estimatedTimeNeeded + 1); // +1 to avoid division by zero

  // Maximum possible urgencies for each component
  const maxTaskTypeUrgency = Math.max(...Object.values(taskTypeWeights));
  const maxDueDateUrgency = 3; // Since daysLeft <= 1 is the maximum value
  const maxStatusUrgency = Math.max(...Object.values(statusWeights));
  const maxFreeTimeUrgency = 7 * 24 * 60; // Assuming a week's worth of minutes as the maximum
  const maxTimeNeededUrgency = 2; // Since daysLeft <= daysThoughtNeeded is the maximum value
  const maxImportanceUrgency = 1; // Since importance is squared and it's between 0 and 1
  const maxTimeLeftUrgency = 1; // Since it's a fraction

  const maxPossibleUrgency = maxTaskTypeUrgency + maxDueDateUrgency + maxStatusUrgency + maxFreeTimeUrgency + maxTimeNeededUrgency + maxImportanceUrgency + maxTimeLeftUrgency;

  // Normalize each urgency individually
  const normalizedTaskTypeUrgency = taskTypeUrgency / maxTaskTypeUrgency;
  const normalizedDueDateUrgency = dueDateUrgency / maxDueDateUrgency;
  const normalizedStatusUrgency = statusUrgency / maxStatusUrgency;
  const normalizedFreeTimeUrgency = freeTimeUrgency / maxFreeTimeUrgency;
  const normalizedTimeNeededUrgency = timeNeededUrgency / maxTimeNeededUrgency;
  const normalizedImportance = importance; // Since it's already between 0 and 1
  const normalizedTimeLeftUrgency = timeLeftUrgency; // Since it's already between 0 and 1

  // Combine normalized urgencies
  const combinedUrgency = normalizedTaskTypeUrgency + normalizedDueDateUrgency + normalizedStatusUrgency + normalizedFreeTimeUrgency + normalizedTimeNeededUrgency + normalizedImportance + normalizedTimeLeftUrgency;

  // Normalize the combined urgency to be between 1 and 10
  const finalUrgency = Math.min(Math.max((combinedUrgency / 7) * 10, 1), 10); // Divided by 7 because there are 7 factors

  const urgency = Math.floor(finalUrgency);
  return urgency;
}

const NewTask = () => {
  const router = useRouter();
  const [selectedImportance, setSelectedImportance] = useState<string | null>(null);
  const [importanceValue, setImportanceValue] = useState<number | null>(null);
  const [urgency, setUrgency] = useState<number>(0);
  const handleImportanceChange = (label: string, value: number) => {
    setSelectedImportance(label);
    setImportanceValue(value);
    // Update formData or any other state if needed
    setFormData(prevData => ({ ...prevData, importance: value }));
  };

  const [freeTimeData, setFreeTimeData] = useState([{
    freetimeid: '',
    userid : '',
    dayoffree: 0,
    minutesavailable: 0,
  }]);

  const [formData, setFormData] = useState({
    taskname: '',
    tasktype: '',
    duedate: '',
    estimatedtime: '',
    importance: 0,
    priorityof: 0,
    numdays: 0,
    statusof: 'Not Started',
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

  const retrievedFreeTime = async () => {
    const session = await supabase.auth.getSession();
    if (session && session.data.session) {
      const { data: retrievedFreeTime, error: retrieveFreeTimeError } = await supabase
      .from('freetime')
      .select('*')
      .eq('userid', session.data.session.user?.id)

      if (retrieveFreeTimeError) {
        alert('Error retrieving freetime data: ' + retrieveFreeTimeError.message);
        return;
      }
    // Map over the retrieved data to transform it into the desired format
    const freeTimes = retrievedFreeTime.map(freeTime => ({
      freetimeid: freeTime.freetimeid,
      userid: freeTime.userid,
      dayoffree: freeTime.dayoffree,
      minutesavailable: freeTime.minutesavailable,
    }));

    setFreeTimeData(freeTimes);
  }
  }

  useEffect(() => {
    retrievedFreeTime();
  }, []);

  const calculateNumDays = () => {
    //calculate the number of days needed to complete using the estimated time and the free time
    const estimatedTime = parseFloat(formData.estimatedtime);
    const freeTimePerDay = freeTimeData;
    let numDays = 0;
    let timeLeft = estimatedTime;
    let day = 0;
    while (timeLeft > 0) {
      if (day > 6) {
        day = 0;
      }
      if (freeTimePerDay[day].minutesavailable > 0) {
        timeLeft -= freeTimePerDay[day].minutesavailable;
        numDays++;
      }
      day++;
    }
    return numDays;
  }

  const handlePriority = (numdays) => {
    const importance = parseFloat(formData.importance);
    const timeNeeded = parseFloat(formData.estimatedtime);
    const dueDate = new Date(formData.duedate);
    const today = new Date();
    const status = formData.statusof;
    const taskType = formData.tasktype;
    const timeLeft = 4;
    const daysThoughtNeeded = numdays;
    const freeTimePerDay = freeTimeData;
    const calculatedUrgency = prioritizeTasks(taskType, dueDate, today, status, freeTimePerDay, timeNeeded, daysThoughtNeeded, importance, timeLeft);

    console.log("Calculated urgency:", calculatedUrgency);

    return calculatedUrgency;
  }

  const handleSubmit = async () => {

    // Calculate the number of days needed to complete the task
    const numDays = calculateNumDays();
    
    // Calculate the priority of the task
    const urgency = handlePriority(numDays);

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
          priorityof: urgency,
          statusof: formData.statusof,
          numdays: numDays,
          recursion: formData.recursion,
          importance: formData.importance,
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
    .eq('priorityof', urgency)
    .eq('statusof', formData.statusof)
    .eq('numdays', numDays)
    .eq('recursion', formData.recursion)
    .eq('importance', formData.importance)
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
        case 'Lecture':
            typeValue = 5;
            break;
        case 'Reading':
            typeValue = 6;
            break;
        case 'Discussion':
            typeValue = 7;
            break;
        case 'Final':
            typeValue = 8;
            break;
        case 'Midterm':
            typeValue = 9;
            break;
        case 'Presentation': 
            typeValue = 10;
            break;
        case 'Paper':
            typeValue = 11;
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
                    <Button variant="flat" className='bg-buddha-500 text-buddha-950 w-full'>
                      {selectedTaskType ? selectedTaskType : 'Select Task Type'}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Task Types">
                  <DropdownItem key="type1" onClick={() => handleTaskTypeChange('Test')}>Test</DropdownItem>
                  <DropdownItem key="type2" onClick={() => handleTaskTypeChange('Quiz')}>Quiz</DropdownItem>
                  <DropdownItem key="type3" onClick={() => handleTaskTypeChange('Assignment')}>Assignment</DropdownItem>
                  <DropdownItem key="type4" onClick={() => handleTaskTypeChange('Project')}>Project</DropdownItem>
                  <DropdownItem key="type5" onClick={() => handleTaskTypeChange('Lecture')}>Lecture</DropdownItem>
                  <DropdownItem key="type6" onClick={() => handleTaskTypeChange('Reading')}>Reading</DropdownItem>
                  <DropdownItem key="type7" onClick={() => handleTaskTypeChange('Discussion')}>Discussion</DropdownItem>
                  <DropdownItem key="type8" onClick={() => handleTaskTypeChange('Final')}>Final</DropdownItem>
                  <DropdownItem key="type9" onClick={() => handleTaskTypeChange('Midterm')}>Midterm</DropdownItem>
                  <DropdownItem key="type10" onClick={() => handleTaskTypeChange('Presentation')}>Presentation</DropdownItem>
                  <DropdownItem key="type11" onClick={() => handleTaskTypeChange('Paper')}>Paper</DropdownItem>
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
              <label className="block text-sm font-medium text-buddha-200">
                  Task Importance
              </label>
              <Dropdown>
                  <DropdownTrigger>
                      <Button variant="flat" className='bg-buddha-500 text-buddha-950 w-full'>
                          {selectedImportance ? selectedImportance : 'Select Importance'}
                      </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Task Importance">
                      <DropdownItem key="importance1" onClick={() => handleImportanceChange('Low Importance', 0.25)}>Low Importance</DropdownItem>
                      <DropdownItem key="importance2" onClick={() => handleImportanceChange('Medium Importance', 0.5)}>Medium Importance</DropdownItem>
                      <DropdownItem key="importance3" onClick={() => handleImportanceChange('High Importance', 0.75)}>High Importance</DropdownItem>
                      <DropdownItem key="importance4" onClick={() => handleImportanceChange('ASAP', 1)}>Critical Importance</DropdownItem>
                  </DropdownMenu>
              </Dropdown>
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
            <Button className="bg-buddha-500 text-buddha-950" onPress={handleSubmit}>
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTask;


