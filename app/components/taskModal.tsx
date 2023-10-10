import React, { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function taskModal({ isOpen, onClose, selectedTask, modalMode: initialModalMode }) {
  const [isRecursive, setIsRecursive] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'delete'>(initialModalMode || 'view');

  useEffect(() => {
    setModalMode(initialModalMode);
  }, [initialModalMode]);

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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Type:</label>
                        <input className="border p-2 rounded w-full" type="text" value={formData.tasktype} onChange={e => handleInputChange('tasktype', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date:</label>
                        <input className="border p-2 rounded w-full" type="date" value={formData.duedate} onChange={e => handleInputChange('duedate', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time:</label>
                        <input className="border p-2 rounded w-full" type="number" value={formData.estimatedtime} onChange={e => handleInputChange('estimatedtime', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority:</label>
                        <input className="border p-2 rounded w-full" type="number" value={formData.priorityof} onChange={e => handleInputChange('priorityof', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
                        <input className="border p-2 rounded w-full" type="text" value={formData.statusof} onChange={e => handleInputChange('statusof', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Days:</label>
                        <input className="border p-2 rounded w-full" type="number" value={formData.numdays} onChange={e => handleInputChange('numdays', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Recursion:</label>
                        <input className="border p-2 rounded w-full" type="boolean" value={formData.recursion} onChange={e => handleInputChange('recursion', e.target.value)} />
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