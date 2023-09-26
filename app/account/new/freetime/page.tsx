'use client'
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const dayMap = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

const FreeTimeEntry: React.FC = () => {
  const [timeData, setTimeData] = useState({
    dayoffree: '', // Changed to string to hold the day name
    minutesavailable: 0,
    timezone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTimeData({
      ...timeData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('freetime')
      .insert([
        {
          dayoffree: dayMap[timeData.dayoffree], // Translate day name to number here
          minutesavailable: timeData.minutesavailable,
          timezone: timeData.timezone,
          userid: supabase.auth.user()?.id,
        },
      ]);
    if (error) {
      alert(error.message);
    } else {
      alert('Free time entry added successfully');
    }
  };

  return (
    <div className='main-bg relative min-h-screen text-buddha-200"'>
    <form onSubmit={handleSubmit} className="p-8 rounded shadow-md w-96 mx-auto">
      <div className="mb-4">
        <label htmlFor="dayoffree" className="block text-sm font-medium text-buddha-200">
          Day of Free Time:
        </label>
        <select
          id="dayoffree"
          name="dayoffree"
          value={timeData.dayoffree}
          onChange={handleChange}
          className="mt-1 p-2 w-full border border-gray-300 rounded-md text-buddha-950"
          required
        >
          <option value="">Select a day</option>
          {Object.keys(dayMap).map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="minutesavailable" className="block text-sm font-medium text-buddha-200">
          Minutes Available:
        </label>
        <input
          type="number"
          id="minutesavailable"
          name="minutesavailable"
          value={timeData.minutesavailable}
          onChange={handleChange}
          className="mt-1 p-2 w-full border border-gray-300 rounded-md text-buddha-950"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="timezone" className="block text-sm font-medium text-buddha-200">
          Time Zone:
        </label>
        <input
          type="text"
          id="timezone"
          name="timezone"
          value={timeData.timezone}
          onChange={handleChange}
          className="mt-1 p-2 w-full border border-gray-300 rounded-md text-buddha-950"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-buddha-500 text-buddha-950 py-2 px-4 rounded hover:bg-buddha-50 focus:outline-none focus:ring focus:ring-buddha-200"
      >
        Submit
      </button>
    </form>
    </div>
  );
};

export default FreeTimeEntry;
