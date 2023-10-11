
import React, { useState, useEffect } from 'react';


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
  