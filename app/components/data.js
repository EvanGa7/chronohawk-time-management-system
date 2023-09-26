import React from "react";

// const mysql = require('mysql2');
// const readline = require('readline');
// let login = false;
// let usernameOutside = '';
// let userIDOutside  = '';

// // Create a connection pool to the database
// const pool = mysql.createPool({
//     host: 'localhost',
//     port: 3306,
//     user: 'root',
//     password: 'Thomas775!',
//     database: 'timeManagement',
//     connectionLimit: 10, // Adjust as needed
// });  

const columns = [
  {name: "TASKID", uid: "tid"},
  {name: "USERID", uid: "uid"},
  {name: "TASKNAME", uid: "name"},
  {name: "TASKTYPE", uid: "type"},
  {name: "DUEDATE", uid: "due"},
  {name: "ESTIMATEDTIME", uid: "etime"},
  {name: "TIMELEFT", uid: "tleft"},
  {name: "PRIORITY", uid: "priority"},
  {name: "STATUS", uid: "status"},
  {name: "ACTIONS", uid: "actions"},
];

const tasks = [
  {
    id: 1,
    tid: 1,
    uid: 1,
    name : "Finish Project",
    type : "Work",
    due : "2021-04-30",
    etime : "10",
    tleft : "10",
    priority : "High",
    status : "active",
  },
];

export {columns, tasks};
