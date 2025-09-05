import type React from "react";

export interface PriorityLabelProps {
  priority: string;
  className?: string;
}

export function extractPriority(content: string): string | null {
  // First try [#A] format
  let priorityMatch = content.match(/\[#([ABC])\]/);
  if (priorityMatch) {
    return priorityMatch[1];
  }

  // Then try [A] format
  priorityMatch = content.match(/\[([ABC])\]/);
  return priorityMatch ? priorityMatch[1] : null;
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    A: "bg-red-100 text-red-800 border-red-200",
    B: "bg-yellow-100 text-yellow-800 border-yellow-200",
    C: "bg-green-100 text-green-800 border-green-200",
  };
  return colors[priority] || "bg-gray-100 text-gray-800 border-gray-200";
}

export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    A: "高優先度",
    B: "中優先度",
    C: "低優先度",
  };
  return labels[priority] || priority;
}

export function PriorityLabel({
  priority,
  className = "",
}: PriorityLabelProps): React.ReactElement {
  const colorClasses = getPriorityColor(priority);
  const label = getPriorityLabel(priority);

  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium border rounded ${colorClasses} ${className}`}
    >
      #{priority} {label}
    </span>
  );
}
