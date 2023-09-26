-- Creating the users table
CREATE TABLE users (
    userID SERIAL PRIMARY KEY,
    firstName VARCHAR(25) NOT NULL,
    lastName VARCHAR(25) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
);

-- Creating the tasks table
CREATE TABLE tasks (
    taskID SERIAL PRIMARY KEY,
    userID INTEGER REFERENCES users(userID),
    taskName VARCHAR(100) NOT NULL,
    taskType VARCHAR(15) NOT NULL,
    dueDate DATE NOT NULL,
    estimatedTime INT NOT NULL,
    timeLeft INT NOT NULL, 
    priorityOf SMALLINT NOT NULL,
    statusOf VARCHAR(15) NOT NULL
);

-- Creating the freeTime table
CREATE TABLE freeTime (
    freeTimeID SERIAL PRIMARY KEY,
    userID INTEGER REFERENCES users(userID),
    dayOfFree SMALLINT NOT NULL,
    minutesAvailable INT NOT NULL,
    sleepTime TIME NOT NULL,
    timeZone VARCHAR(20) NOT NULL
);

-- Creating the recursion table
CREATE TABLE recursion (
    recursionID SERIAL PRIMARY KEY,
    taskID INTEGER REFERENCES tasks(taskID),
    recursionType BOOLEAN NOT NULL,
    dayOf SMALLINT,
    frequencyCycle SMALLINT,
    totalCycleDays SMALLINT,
    repetitionCycle SMALLINT,
    cycleStartDate DATE
);
