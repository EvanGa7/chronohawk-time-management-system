import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input } from "@nextui-org/react";
import { createClient } from '@supabase/supabase-js';
import {Checkbox} from "@nextui-org/react";
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem} from "@nextui-org/react";

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function inModel({ isOpen, onClose, selectedDate}) {
  const [isRecursive, setIsRecursive] = useState(false); // New state for recursion checkbox

  let formattedDate;
  if (selectedDate) {
    formattedDate = selectedDate.toISOString().split('T')[0];
  }
 
  const [formData, setFormData] = useState({
    taskname: '',
    tasktype: '',
    estimatedtime: '',
    priorityof: '0',
    statusof: 'Inactive',
    numdays: '',
    recursion: false,
    frequencycycle: '',
    repetitioncycle: '',
    cyclestartdate: '',
  });

  const handleCheckboxChange = () => {
    setIsRecursive(!isRecursive);
    setFormData({ ...formData, recursion: true});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async () => {
  
    // Insert the new task into the 'tasks' table
    const session = await supabase.auth.getSession();
    if (session && session.data.session) {
      const {data} = await supabase
        .from('tasks')
        .insert([{
          userid: session.data.session.user?.id,
          taskname: formData.taskname,
          tasktype: formData.tasktype,
          duedate: formattedDate,
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
    .eq('duedate', formattedDate)
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
    onClose();
    //refresh the page
    window.location.reload();
}

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
    <>
     {isOpen && (
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        placement="top-center"
      >
        <ModalContent>
            <>
              <ModalHeader className="flex flex-col gap-1">Create A New Task</ModalHeader>
              <ModalBody>
                <label htmlFor="taskname" className="block text-sm font-medium text-buddha-950">
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
                <label className="block text-sm font-medium text-buddha-950">
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
                <label htmlFor="duedate" className="block text-sm font-medium text-buddha-950">
                Due Date
                </label>
                <div className="mt-1 p-2 w-full border border-buddha-950 rounded-md">
                    {selectedDate.toISOString().split('T')[0]}
                </div>
                <label htmlFor="estimatedtime" className="block text-sm font-medium text-buddha-950">
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
                <label htmlFor="numdays" className="block text-sm font-medium text-buddha-950">
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
                <label htmlFor="recursion" className="block text-sm font-medium text-buddha-950">
                Task Recursion
                </label>
                <Checkbox onChange={handleCheckboxChange} />

            {isRecursive && (
                <>
                    <label htmlFor="cyclestartdate" className="block text-sm font-medium text-buddha-950">
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
                    <label htmlFor="repetitioncycle" className="block text-sm font-medium text-buddha-950">
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
                    <label htmlFor="frequencycycle" className="block text-sm font-medium text-buddha-950">
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
                </> )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                    Close
                </Button>
                <Button className="bg-buddha-500 text-buddha-950" onPress={handleSubmit}>
                    Add
                </Button>
                </ModalFooter>
            </>
        </ModalContent>
      </Modal>
    )}
    </>
  );
}

export default inModel;

