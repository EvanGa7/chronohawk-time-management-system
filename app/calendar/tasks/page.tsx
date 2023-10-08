'use client'
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'; // Import useRouter hook
import {Checkbox} from "@nextui-org/react";
import calculations from '.calendar/tasks/calc.ts'

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
            <label htmlFor="tasktype" className="block text-sm font-medium text-buddha-200">
              Task Type
            </label>
            <input 
              type="text"
              id="tasktype"
              name="tasktype"
              className="mt-1 p-2 w-full border border-buddha-950 rounded-md"
              placeholder="Enter task type"
              onChange={handleChange}
              required
            />
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


