import React from "react";

import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Tooltip, ChipProps, getKeyValue} from "@nextui-org/react";
import {EditIcon} from "../components/EditIcon";
import {DeleteIcon} from "../components/DeleteIcon";
import {EyeIcon} from "../components/EyeIcon";
import {columns, tasks} from "./data";

const statusColorMap: Record<string, ChipProps["color"]> = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

type Task = typeof tasks[0];

export default function App() {
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
    <Table className="text-buddha-950"aria-label="Example table with custom cells">
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={tasks}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}