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
    cyclestartdate: Date,
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
              <ModalHeader className="flex flex-col gap-1">View Task</ModalHeader>
              <ModalBody>
                {isEditMode ? (
                  // Edit Mode
                  <>
                    {/* Your input fields for editing go here */}
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
                <Button className="bg-buddha-500 text-buddha-950" onPress={toggleEditMode}>
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
