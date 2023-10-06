'use client'
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'; // Import useRouter hook

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const NewTask = () => {
  const [formData, setFormData] = useState({
    taskname: '',
    tasktype: '',
    duedate: '',
    estimatedtime: '',
    timeleft: '',
    priorityof: '',
    statusof: '',
    numdays: '',
  });

  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Insert the new task into the 'tasks' table
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...formData,
        userid: supabase.auth.getUser().id, // Assuming the user is logged in
      }]);

    if (data) {
      alert('Task Created Successfully!');
      router.push('/path_to_redirect_after_success'); // Adjust the path
    } else if (error) {
      alert(error.message);
    }
  };

  return (
    <div className="main-bg relative min-h-screen flex items-center justify-center text-buddha-200">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4">Create New Task</h2>
        <form onSubmit={handleSubmit}>
          {/* Add input fields for each column in your tasks table */}
          {/* Example for taskname: */}
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
              placeholder="Enter Number Of Days Needed To Complete"
              onChange={handleChange}
              required
            />
          </div>
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


