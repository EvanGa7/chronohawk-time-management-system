import React, { useState, useEffect, useRef } from "react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Tooltip, ChipProps, getKeyValue, user} from "@nextui-org/react";
import {EditIcon} from "../components/EditIcon";
import {DeleteIcon} from "../components/DeleteIcon";
import {EyeIcon} from "../components/EyeIcon";
import {Button} from "../components/Button"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const columns = [
  {name: "TASKID", uid: "taskid"},
  {name: "USERID", uid: "userid"},
  {name: "TASKNAME", uid: "taskname"},
  {name: "TASKTYPE", uid: "tasktype"},
  {name: "DUEDATE", uid: "duedate"},
  {name: "ESTIMATEDTIME", uid: "estimatedtime"},
  {name: "TIMELEFT", uid: "timeleft"},
  {name: "PRIORITY", uid: "priorityof"},
  {name: "STATUS", uid: "statusof"},
  {name: "NUMDAYS", uid: "numdays"},
  {name: "RECURSION", uid: "recursion"},
  {name: "ACTIONS", uid: "actions"},
];


const statusColorMap: Record<string, ChipProps["color"]> = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

type Task = {
  taskid: number;
  userid: string | null;
  taskname: string;
  tasktype: string;
  duedate: Date;
  estimatedtime: number;
  timeleft: number;
  priorityof: number;
  statusof: string;
  numdays: number | null;
  recursion: boolean;
};

export default function taskMenu() {
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const tasksRef = useRef<Task[]>([]);
  const [, forceUpdate] = useState({});

  useEffect(() => {
      const retrieveUser = async () => {
          const session = await supabase.auth.getSession();
          if (session && session.data.session) {
              const userId = session.data.session.user?.id;
              setUserId(userId);
          }
      }
      retrieveUser();
  }, []);

  useEffect(() => {
      const fetchTasks = async () => {
          if (!userId) return; // Don't fetch if userId is not set

          try {
              const { data, error } = await supabase
                  .from('tasks')
                  .select('*')
                  .eq('userid', userId);

              if (error) throw error;

              const tasksArray = data.map(task => ({
                taskid: task.taskid,
                userid: task.userid,
                taskname: task.taskname,
                tasktype: task.tasktype,
                duedate: task.duedate,
                estimatedtime: task.estimatedtime,
                timeleft: task.timeleft,
                priorityof: task.priorityof,
                statusof: task.statusof,
                numdays: task.numdays,
                recursion: task.recursion,
              }));

              tasksRef.current = tasksArray;
              forceUpdate({});  // Force a re-render

          } catch (error) {
              setError(error.message);
          }
      };

      fetchTasks();
  }, [userId]);

  if (error) return <div>Error: {error}</div>;

  const renderCell = React.useCallback((task: Task, columnKey: React.Key) => {
    const cellValue = getKeyValue<Task, string | number | boolean>(task, columnKey as keyof Task);

    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{ radius: "lg", src: task.avatar }}
            description={task.email}
            name={String(cellValue)}
          >
            {task.email}
          </User>
        );
      case "role":
        return (
          <div className="flex flex-col">
            <p className="font-bold text-sm capitalize">{String(cellValue)}</p>
            <p className="font-bold text-sm capitalize text-gray-400">{task.team}</p>
          </div>
        );
      case "status":
        return (
          <Chip className="capitalize" color={statusColorMap[task.status]} size="sm" variant="flat">
            {String(cellValue)}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Task Details">
              <span className="text-lg text-gray-400 cursor-pointer hover:opacity-50">
                <EyeIcon />
              </span>
            </Tooltip>
            <Tooltip content="Edit Task">
              <span className="text-lg text-gray-400 cursor-pointer hover:opacity-50">
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete Task">
              <span className="text-lg text-red-500 cursor-pointer hover:opacity-50">
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      case "recursion":
        return cellValue ? "True" : "False";
      default:
        return String(cellValue);
    }
}, []);

  
  return (
    <div>
      <Table className="text-buddha-950" aria-label="Example table with custom cells">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={tasksRef.current}>
          {(item) => (
              <TableRow key={item.taskid}>
                  {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
              </TableRow>
          )}
      </TableBody>
      </Table>
      <br />
      <Button />
    </div>
  );
}