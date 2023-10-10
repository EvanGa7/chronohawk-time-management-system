import React, { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function taskModal({ isOpen, onClose, selectedTask }) {
  const [isRecursive, setIsRecursive] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

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
    const { error } = await supabase
      .from('tasks')
      .update({
        taskname: formData.taskname,
        tasktype: formData.tasktype,
        duedate: formData.duedate,
        estimatedtime: formData.estimatedtime,
        priorityof: formData.priorityof,
        statusof: formData.statusof,
        numdays: formData.numdays,
        recursion: formData.recursion
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
              <ModalHeader className="flex flex-col gap-1 text-buddha-950">View Task</ModalHeader>
              <ModalBody>
                {isEditMode ? (
                  <>
                    <h2 className="text-center text-lg font-bold mb-4">Edit Task</h2>
                    <label>Task Name:</label>
                    <input className="border p-2 rounded w-full" type="text" value={formData.taskname} onChange={e => handleInputChange('taskname', e.target.value)} />
                    <label>Task Type:</label>
                    <input className="border p-2 rounded w-full" type="text" value={formData.tasktype} onChange={e => handleInputChange('tasktype', e.target.value)} />
                    <label>Due Date:</label>
                    <input className="border p-2 rounded w-full" type="date" value={formData.duedate} onChange={e => handleInputChange('duedate', e.target.value)} />
                    <label>Estimated Time:</label>
                    <input className="border p-2 rounded w-full" type="number" value={formData.estimatedtime} onChange={e => handleInputChange('estimatedtime', e.target.value)} />
                    <label>Priority:</label>
                    <input className="border p-2 rounded w-full" type="number" value={formData.priorityof} onChange={e => handleInputChange('priorityof', e.target.value)} />
                    <label>Status:</label>
                    <input className="border p-2 rounded w-full" type="text" value={formData.statusof} onChange={e => handleInputChange('statusof', e.target.value)} />
                    <label>Number of Days:</label>
                    <input className="border p-2 rounded w-full" type="number" value={formData.numdays} onChange={e => handleInputChange('numdays', e.target.value)} />
                    <label>Recursion:</label>
                    <input className="border p-2 rounded w-full" type="boolean" value={formData.recursion} onChange={e => handleInputChange('recursion', e.target.value)} />
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
                  </>
                ) : (
                  // View Mode
                  <>
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
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button className="bg-buddha-500 text-buddha-950" onPress={isEditMode ? saveEditedTask : toggleEditMode}>
                    {isEditMode ? 'Save' : 'Edit'}
                </Button>
              </ModalFooter>
            </>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

export default taskModal;
