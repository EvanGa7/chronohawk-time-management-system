import React, { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Checkbox} from "@nextui-org/react";
import { createClient } from '@supabase/supabase-js';
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button} from "@nextui-org/react";

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export function taskModal({ isOpen, onClose, selectedTask, modalMode: initialModalMode }) {
  const [isRecursive, setIsRecursive] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'delete'>(initialModalMode || 'view');
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
    const timeLeft = formData.timeleft;
    const daysThoughtNeeded = numdays;
    const freeTimePerDay = freeTimeData;
    const calculatedUrgency = prioritizeTasks(taskType, dueDate, today, status, freeTimePerDay, timeNeeded, daysThoughtNeeded, importance, timeLeft);

    return calculatedUrgency;
  }

  const handleCheckboxChange = async () => {
    if (!formData.recursion) {
      setIsRecursive(true);
      setFormData(prevData => ({ ...prevData, recursion: true }));
      try {
        await insertRecursionData();
      } catch (error) {
        alert('Error inserting recursion data: ' + error.message);
        // Revert UI changes if there's an error
        setIsRecursive(false);
        setFormData(prevData => ({ ...prevData, recursion: false }));
      }
    } else {
      setIsRecursive(false);
      setFormData(prevData => ({ ...prevData, recursion: false }));
      try {
        await deleteRecursionData();
      } catch (error) {
        alert('Error deleting recursion data: ' + error.message);
        // Revert UI changes if there's an error
        setIsRecursive(true);
        setFormData(prevData => ({ ...prevData, recursion: true }));
      }
    }
  };
  
  const insertRecursionData = async () => {
    const { error } = await supabase
      .from('recursion')
      .insert([{
        taskid: selectedTask,
        frequencycycle: formData.frequencycycle,
        repetitioncycle: formData.repetitioncycle,
        cyclestartdate: formData.cyclestartdate,
      }]);
    if (error) throw error;
  };
  
  const deleteRecursionData = async () => {
    const { error } = await supabase
      .from('recursion')
      .delete()
      .eq('taskid', selectedTask);
    if (error) throw error;
  };

  useEffect(() => {
    setModalMode(initialModalMode);
  }, [initialModalMode]);

  const [formData, setFormData] = useState({
    taskname: '',
    tasktype: '',
    duedate: '',
    estimatedtime: '',
    timeleft: '',
    priorityof: '0',
    statusof: 'Not Started',
    numdays: 0,
    recursion: false,
    frequencycycle: '',
    repetitioncycle: '',
    cyclestartdate: '',
    importance: 0
  });

  useEffect(() => {
    const fetchTaskData = async () => {
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('taskid', selectedTask)
        .single();

      if (taskError) {
        alert('Error fetching task data: ' + taskError.message);
        return;
      }

      if (taskData) {
        setFormData(taskData);
        if (taskData.recursion === true) {
          setIsRecursive(true);
          const { data: recursionData, error: recursionError } = await supabase
            .from('recursion')
            .select('frequencycycle, repetitioncycle, cyclestartdate')
            .eq('taskid', selectedTask);
      
          if (recursionError) {
            alert('Error fetching recursion data: ' + recursionError.message);
            return;
          }
      
          if (recursionData && recursionData.length === 1) {
            const recursionDetails = recursionData[0];
            setFormData(prevData => ({
              ...prevData,
              frequencycycle: recursionDetails.frequencycycle,
              repetitioncycle: recursionDetails.repetitioncycle,
              cyclestartdate: recursionDetails.cyclestartdate
            }));
        }
        } else {
          setIsRecursive(false);
        }
      }
      
    };

    if (selectedTask) {
      fetchTaskData();
    }
}, [selectedTask]);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleInputChange = (field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  const saveEditedTask = async () => {

    // Calculate the number of days needed to complete the task
    const numDays = calculateNumDays();

    // Calculate the priority of the task
    const urgency = handlePriority(numDays);

    const { error } = await supabase
      .from('tasks')
      .update({
        taskname: formData.taskname,
        tasktype: formData.tasktype,
        duedate: formData.duedate,
        estimatedtime: formData.estimatedtime,
        priorityof: urgency,
        statusof: formData.statusof,
        numdays: numDays,
        recursion: formData.recursion,
        importance: formData.importance
      })
      .eq('taskid', selectedTask);
  
    if (error) {
      alert('Error updating task: ' + error.message);
      return;
    }
  
    // If there's recursion data, update that as well
    if (isRecursive) {
      const { error: recursionError } = await supabase
        .from('recursion')
        .update({
          frequencycycle: formData.frequencycycle,
          repetitioncycle: formData.repetitioncycle,
          cyclestartdate: formData.cyclestartdate
        })
        .eq('taskid', selectedTask);
  
      if (recursionError) {
        alert('Error updating recursion data: ' + recursionError.message);
        return;
      }
    }
  
    // Close the modal and refresh the data (or however you want to handle it)
    onClose();
    window.location.reload();
    // Optionally, you can fetch the tasks again or use any other method to refresh the data
  };

  const handleDelete = async () => {
    try {
      // 1. Check if the task has recursion data
      if (isRecursive) {
        // 2. Delete the recursion data
        const { error: recursionDeleteError } = await supabase
          .from('recursion')
          .delete()
          .eq('taskid', selectedTask);
  
        if (recursionDeleteError) throw recursionDeleteError;
      }
  
      // 3. Delete the task
      const { error: taskDeleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('taskid', selectedTask);
  
      if (taskDeleteError) throw taskDeleteError;
  
      onClose();
      window.location.reload(); // or use any other method to refresh the data
    } catch (error) {
      alert('Error deleting task: ' + error.message);
    }
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
    <>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} placement="top-center">
          <ModalContent className="bg-clear p-6 rounded-lg shadow-lg w-full max-w-xl mx-auto">
            {modalMode === 'view' && (
              <>
                <ModalHeader className="flex flex-col gap-1 text-buddha-950 border-b pb-2 mb-4">View Task</ModalHeader>
                <div className="mb-4 space-y-2">
                    <p><strong>Task Name:</strong> {formData.taskname}</p>
                    <p><strong>Task Type:</strong> {formData.tasktype}</p>
                    <p><strong>Due Date:</strong> {formData.duedate}</p>
                    <p><strong>Estimated Time:</strong> {formData.estimatedtime}</p>
                    <p><strong>Priority:</strong> {formData.priorityof}</p>
                    <p><strong>Status:</strong> {formData.statusof}</p>
                    <p><strong>Number of Days:</strong> {formData.numdays}</p>
                    <p><strong>Recursion:</strong> {formData.recursion ? 'True' : 'False'}</p>
                    {isRecursive && (
                      <>
                        <p><strong>Frequency Cycle:</strong> {formData.frequencycycle}</p>
                        <p><strong>Repetition Cycle:</strong> {formData.repetitioncycle}</p>
                        <p><strong>Cycle Start Date:</strong> {formData.cyclestartdate}</p>
                      </>
                    )}
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button color="danger" variant="flat" onPress={() => setModalMode('delete')} className="px-4 py-2">
                    Delete
                  </Button>
                  <Button variant='shadow' onPress={() => setModalMode('edit')} className="bg-buddha-500 text-buddha-950 px-4 py-2">
                    Edit
                  </Button>
                </div>
              </>
            )}
  
            {modalMode === 'edit' && (
              <>
                <ModalHeader className="flex flex-col gap-1 text-buddha-950 border-b pb-2 mb-4">Edit Task</ModalHeader>
                <div className="mb-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Name:</label>
                        <input className="border p-2 rounded w-full" type="text" value={formData.taskname} onChange={e => handleInputChange('taskname', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-buddha-950">
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date:</label>
                        <input className="border p-2 rounded w-full" type="date" value={formData.duedate} onChange={e => handleInputChange('duedate', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time:</label>
                        <input className="border p-2 rounded w-full" type="number" value={formData.estimatedtime} onChange={e => handleInputChange('estimatedtime', e.target.value)} />
                    </div>
                    <div className="mb-4 ">
                      <label className="block text-sm font-medium text-buddha-950">
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
                      <label htmlFor="recursion" className="block text-sm font-medium text-buddha-950">
                        Task Recursion
                      </label>
                      <Checkbox
                        id="recursion"
                        checked={formData.recursion}
                        onChange={handleCheckboxChange}
                      />
                    </div>
                    {isRecursive && (
                    <>
                        <label className="block mt-4">
                        <span className="text-gray-700">Frequency Cycle:</span>
                        <input 
                            className="border p-2 rounded w-full"
                            type="text" 
                            value={formData.frequencycycle} 
                            onChange={e => handleInputChange('frequencycycle', e.target.value)} 
                        />
                        </label>
                        <label className="block mt-4">
                        <span className="text-gray-700">Repetition Cycle:</span>
                        <input 
                            className="border p-2 rounded w-full"
                            type="text" 
                            value={formData.repetitioncycle} 
                            onChange={e => handleInputChange('repetitioncycle', e.target.value)} 
                        />
                        </label>
                        <label className="block mt-4">
                        <span className="text-gray-700">Cycle Start Date:</span>
                        <input 
                            className="border p-2 rounded w-full"
                            type="date" 
                            value={formData.cyclestartdate} 
                            onChange={e => handleInputChange('cyclestartdate', e.target.value)} 
                        />
                        </label>
                    </>
                    )}
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button color="danger" variant="flat" onPress={() => setModalMode('view')} className="px-4 py-2">
                    Cancel
                  </Button>
                  <Button variant='shadow' className="bg-buddha-500 text-buddha-950 px-4 py-2" onPress={saveEditedTask}>
                    Save
                  </Button>
                </div>
              </>
            )}
  
            {modalMode === 'delete' && (
              <>
                <ModalHeader className="flex flex-col gap-1 text-buddha-950 border-b pb-2 mb-4">Delete Task</ModalHeader>
                <ModalBody className="mb-4 text-red-600">
                  Are you sure you want to delete this task?
                </ModalBody>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button color="danger" variant="flat" onPress={handleDelete} className="px-4 py-2">
                    Confirm Delete
                  </Button>
                  <Button variant='shadow' onPress={onClose} className="px-4 py-2 bg-buddha-200">
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

  
  export default taskModal;