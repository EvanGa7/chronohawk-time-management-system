//Study TIme calculations


//use as input



//set a number of days to study before test depending on type of task

//numDays the number of days the user wantes to study before hand


//if not enough time to study that day recalculate hours to study per day
function studyTime(
    daysLeft: number,
    numDays: number,
    timeLeft: number,
    schedule: Map<string, number>,
    today: string,
    dueDate: string,
    recursionType: string, // 'fixed' or 'flexible'
    estimatedTimeToStudy?: number, // Estimated time to study (only for flexible recursion)
    frequency?: number // Number of repetitions (only for flexible recursion)
  ) {
    // Convert today and dueDate strings to Date objects
    const todayDate = new Date(today);
    const dueDateDate = new Date(dueDate);
  
    if (daysLeft < numDays && daysLeft > 0) {
      // Calculate hours per day
      let hoursPerDay: number;
      if (recursionType === 'fixed') {
        hoursPerDay = Math.floor(timeLeft / daysLeft);
      } else if (recursionType === 'flexible' && estimatedTimeToStudy && frequency) {
        const daysApart = Math.floor((dueDateDate.getTime() - todayDate.getTime()) / (frequency * 24 * 60 * 60 * 1000));
        hoursPerDay = Math.floor(estimatedTimeToStudy / daysApart);
      } else {
        throw new Error('Invalid recursion type or missing parameters for flexible recursion');
      }
  
      // Create an array of days sorted by free time in descending order
      const sortedDays = Array.from(schedule.keys()).sort(
        (a, b) => schedule.get(b)! - schedule.get(a)!
      );
  
      for (const day of sortedDays) {
        if (schedule.has(day) && schedule.get(day)! < hoursPerDay) {
          // Adjust timeLeft and set hours for that day
          timeLeft -= schedule.get(day)!;
          schedule.set(day, hoursPerDay);
        }
      }
    } else if (timeLeft >= 3 && todayDate.getTime() === dueDateDate.getTime()) {
      let tempTime = timeLeft;
      let dayCount = 0;
  
      while (tempTime > 0) {
        if (schedule.has(today) && schedule.get(today)! >= 3) {
          // If the day has at least 3 hours of free time
          tempTime -= 3;
        } else {
          // If the day doesn't have enough free time
          const freeTime = schedule.get(today) || 0;
          tempTime -= freeTime;
          dayCount++;
          console.log(`Need more time on day ${dayCount}`);
        }
        // Move to the next day
        // Assuming you have a function getNextDay(today) to get the next day
        today = getNextDay(today);
      }
    }
  }
  
  function getNextDay(currentDay: string): string {
    // Define the days of the week
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    // Find the index of the current day
    const currentIndex = daysOfWeek.indexOf(currentDay);
  
    if (currentIndex === -1) {
      // Handle an invalid current day
      throw new Error('Invalid day of the week');
    }
  
    // Calculate the index of the next day (wrapping around to Sunday if it's Saturday)
    const nextIndex = (currentIndex + 1) % daysOfWeek.length;
  
    // Return the name of the next day
    return daysOfWeek[nextIndex];
  }
  