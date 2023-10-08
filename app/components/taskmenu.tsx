import React, { useState, useEffect } from "react";
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

const statusColorMap: Record<string, ChipProps["color"]> = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

export const useTasks = (userId) => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
      try {
          const { data, error } = await supabase
              .from('tasks')
              .select('*')
              .eq('userid', userId); // Filter tasks based on the user's ID

          console.log(data, error);

          if (error) throw error;

          // Set tasks here
          setTasks(data);

          console.log(tasks);
      } catch (error) {
          setError(error.message);
      }
  };

  useEffect(() => {
      if (userId) {
          fetchTasks();
      }
  }, [userId]);

  return { tasks, error };
};

type Task = typeof useTasks extends () => { tasks: infer T } ? T[number] : never;

export default function taskMenu() {
  const [userId, setUserId] = useState(null);
  const { tasks, error } = useTasks(userId);

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

  if (error) return <div>Error: {error}</div>;

  const renderCell = React.useCallback((task: Task, columnKey: React.Key) => {
    const cellValue = getKeyValue<Task, string | number>(task, columnKey as keyof Task);

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
      default:
        return cellValue;
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
        <TableBody items={tasks}>
          {(item) => (
              <TableRow key={item.taskid}>
                  {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
              </TableRow>
          )}
      </TableBody>
      </Table>
      <Button />
    </div>
  );
}