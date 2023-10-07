import React from "react";

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
  {name: "RECURSION", uid: "recursion"},
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
    priority : "10",
    status : "active",
    recursion : "True",
  },
];

export {columns, tasks};
