import { Icon } from "@iconify/react";
import type React from "react";

export interface TodoIconProps {
  todo: string;
  size?: number;
  className?: string;
}

export function getTodoIcon(todo: string): {
  icon: string;
  className: string;
} {
  const todoLower = todo.toLowerCase();

  if (todoLower === "todo") {
    return {
      icon: "lucide:circle",
      className: "text-orange-500",
    };
  }

  if (todoLower === "doing") {
    return {
      icon: "lucide:clock",
      className: "text-blue-500",
    };
  }

  if (todoLower === "done") {
    return {
      icon: "lucide:check-circle",
      className: "text-green-500",
    };
  }

  // Default for any other TODO state
  return {
    icon: "lucide:circle-dot",
    className: "text-gray-500",
  };
}

export function TodoIcon({ todo, size = 16, className = "" }: TodoIconProps): React.ReactElement {
  const { icon, className: iconClassName } = getTodoIcon(todo);

  return (
    <Icon icon={icon} width={size} height={size} className={`${iconClassName} ${className}`} />
  );
}
