-- Creating the users table
CREATE TABLE users (
    userid uuid PRIMARY KEY,                --Supabase id that stores a list of numbers and letters that are specific to each user
    firstName VARCHAR(25) NOT NULL,         --uses 25 characters to store the users first name
    lastName VARCHAR(25) NOT NULL,          --uses 25 characters to store the users first name
    phone VARCHAR(15) NOT NULL,             --Stores the user's phone number within 15 characters 
    email VARCHAR(50) NOT NULL,             --This stores the user's email that has to be within 50 characters
    password VARCHAR(100) NOT NULL          --Stores the password of the user that is within 100 characters
);

-- Creating the tasks table
CREATE TABLE tasks (
    taskid SERIAL PRIMARY KEY,              --Autoincrementing value to create a unique task id
    userid uuid REFERENCES users(userid),   --Supabase id that stores a list of numbers and letters that are specific to each user that references the user id from the users table
    taskname VARCHAR(100) NOT NULL,         --Holds the name of the task that can hold up to 100 character
    tasktype VARCHAR(15) NOT NULL,          --Holds the type of task that can be up to 15 characters
    duedate DATE NOT NULL,                  --This stores when the assignment is due with the value type of date
    estimatedtime INT NOT NULL,             --This stores the estimated time to completion using the value type of int
    timeleft INT NOT NULL,                  --Holds the amount of time left that the user has not completed
    priorityof SMALLINT NOT NULL,           --Stores the priority of each task as a small integer
    statusof VARCHAR(15) NOT NULL           --Holds the if the task is completed or in progress of the tasks using 15 characters
    recursion BOOLEAN NOT NULL,             --Uses a boolean to determine if it's recuring or not
    importance FLOAT(4) NOT NULL,           --This holds a value that shows how important the assignment is
                                                --0.25 = low importance
                                                --0.50 = medium importance
                                                --0.75 = high importance
                                                --1.00 = critical importance
    numdays SMALLINT NOT NULL,              --Holds the number of days needed to complete using a small int
    startdate DATE,                         --Holds the start date that the user wants to start the preperation for the task and this is a date type value
    enddate DATE,                           --Holds when the preperateion time scheduled is over using a date value
    isrecurringadded BOOLEAN                --For recursion to determine if duplicate tasks have been created for the current cycle so that it doesn't create duplicates
);

-- Creating the freeTime table
CREATE TABLE freeTime (
    freetimeid SERIAL PRIMARY KEY,          --Autoincrementing value to create a unique free time id
    userid uuid REFERENCES users(userid),   --Supabase id that stores a list of numbers and letters that are specific to each user that references the user id from the users table
    dayoffree SMALLINT NOT NULL,            --An integer that represents what day of the week the free time is for
    minutesavailable INT NOT NULL,          --Minutes available for each day that is stored as an int
);

-- Creating the recursion table
CREATE TABLE recursion (
    recursionid SERIAL PRIMARY KEY,         --Autoincrementing value to create a unique free recursion id
    taskid INTEGER REFERENCES tasks(taskid),--Autoincrementing value to create a unique task id that references taskid from the tasks table
    frequencycycle SMALLINT,                --Holds the number of days between each recursion using a small integer
    repetitioncycle SMALLINT,               --Holds how long the repetitions will go until it ends using a small integer
    cycleStartdate DATE,                    --This contains when the recursions begin using a date
);