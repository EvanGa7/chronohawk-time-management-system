'use client'
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation'; // Import useRouter hook

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [timeData, setTimeData] = useState({
    Monday: { minutesavailable: 0 },
    Tuesday: { minutesavailable: 0 },
    Wednesday: { minutesavailable: 0 },
    Thursday: { minutesavailable: 0 },
    Friday: { minutesavailable: 0 },
    Saturday: { minutesavailable: 0 },
    Sunday: { minutesavailable: 0 },
  });

//check if signed in
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

  const handleChange = (day: string, value: any) => {
    setTimeData((prevData) => ({
      ...prevData,
      [day]: {
        minutesavailable: value,
      },
    }));
  };

  //function for submitting the frretime info to the database
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId) {
      alert('User ID is missing.');
      return;
    }

    const entries = Object.keys(timeData).map((day) => ({
      dayoffree: dayMap[day],
      minutesavailable: timeData[day].minutesavailable,
      userid: userId,
    }));

    const { data, error } = await supabase.from('freetime').insert(entries);
    if (error) {
      alert(error.message);
    } else {
      alert('Free time entries added successfully');
      router.push('/calendar');
    }
  };
  
  return (
    <div className='main-bg relative min-h-screen text-buddha-200'>
      <br/>
      <h2 className="text-3xl font-bold text-center ">Enter Your Free Time During The Week</h2>
      <form onSubmit={handleSubmit} className="p-8 rounded shadow-md w-96 mx-auto">
        {Object.keys(dayMap).map((day) => (
          <div key={day} className="mb-4">
            <label htmlFor={`${day}-minutesavailable`} className="block text-sm font-medium text-buddha-200">
              {day} - Minutes Available:
            </label>
            <input
              type="number"
              id={`${day}-minutesavailable`}
              name={`${day}-minutesavailable`}
              value={timeData[day].minutesavailable}
              onChange={(e) => handleChange(day, e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md text-buddha-950"
              required
            />
          </div>
        ))}
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
