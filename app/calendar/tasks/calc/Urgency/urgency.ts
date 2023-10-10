
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js'
import { user } from '@nextui-org/react';

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


export function prioritizeTasks(
  taskType: number,
  dueDate: Date | null,
  today: Date,
  urgencyThreshold: number,
  importanceScale: number,
  timeNeeded: number | null,
  daysLeft: number,
  type: number,
  dueTime: Date | null,
  currentTime: Date,
  currentCycleStartDate: Date | null,
  timesDoneWithinCycle: number,
  N: number,
  max: number,
  freeTime: (date: Date) => number
): number {
  let urgency: number;
  let timePlannedToday: number = 0;

  //get the user id
  const [userId, setUserId] = useState<number | null>(null);

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

  //retrieve the freetime for the user
  useEffect(() => {
    async function getFreeTime() {

      const { data, error } = await supabase
        .from('freetime')
        .select('*')
        .eq('userID', userId)
        .single()

      if (error) {
        alert(error.message);
      }

      if (data) {
       
      }

    }
  })


  
    if (taskType === 1 || taskType === 2) {
      if (dueDate && dueDate > today) {

        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(today.getDate() - 14);
    
        if (dueDate < twoWeeksAgo) {
          // Deactivate or delete it in SQL.
          // Deactivation or deletion logic here...
        }

      }
  
      if (dueDate && dueDate <= addDays(today, 1)) {
        // When dueDate exists and is due tomorrow or today.
        urgency = max + max * importanceScale;
      } else {
        urgency =
          max * importanceScale + (timeNeeded ? timeNeeded / daysLeft : 0); // If timeNeeded exists.
      }
    } else if (type === 3) {
      if (
        dueDate &&
        dueDate.toDateString() === today.toDateString() &&
        dueTime &&
        dueTime.getTime() >= currentTime.getTime() + (timeNeeded || 0)
      ) {
        // Here dueDate is the most recent day, calculated based on repeating.
        urgency = max; // Task with fixed schedule, must list if not past the scheduled time.
      } else {
        urgency = -1;
      }
    } else if (type === 4) {
      if (currentCycleStartDate && currentCycleStartDate <= today && timesDoneWithinCycle < N) {
        // timesDoneWithinCycle and currentCycleStartDate require calculation/user update.
        urgency = max * importanceScale;
      } else {
        urgency = -1;
      }
    } else {
      // type === 5
      urgency = 0; // Optional
    }
  
    // Input: list of tasks and urgency.
    // Output: list of tasks to display, sorted by urgency.
    // Procedure: sorting tasks on urgency.
    
    if (urgency >= max) {
      // Add task to display list.
      // Update timePlannedToday.
    } else if (urgency >= 0 && timePlannedToday < freeTime(today)) {
      // Add task to display list.
      // Update timePlannedToday.
    }
  
    return urgency;
  }

  
  function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }