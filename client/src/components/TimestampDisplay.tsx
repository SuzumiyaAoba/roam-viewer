import React from "react";
import { Icon } from "@iconify/react";
import {
  formatTimestamp,
  getTimestampColor,
  getTimestampLabel,
  type TimestampEntry,
} from "../shared/lib/timestamp-utils";

interface TimestampDisplayProps {
  entry: TimestampEntry;
  className?: string;
}

interface TimestampsDisplayProps {
  entries: TimestampEntry[];
  className?: string;
}

function TimestampBadge({ entry, className = "" }: TimestampDisplayProps) {
  const getIcon = (type: TimestampEntry["type"]) => {
    switch (type) {
      case "deadline":
        return "lucide:alert-triangle";
      case "scheduled":
        return "lucide:calendar";
      case "closed":
        return "lucide:check-circle";
      default:
        return "lucide:clock";
    }
  };

  return (
    <div
      className={`timestamp-entry inline-flex items-center space-x-2 px-3 py-1 rounded-md border text-sm font-medium ${getTimestampColor(entry.type)} ${className}`}
    >
      <Icon icon={getIcon(entry.type)} className="w-3 h-3" />
      <span className="font-mono text-xs">{getTimestampLabel(entry.type)}:</span>
      <span>{formatTimestamp(entry)}</span>
    </div>
  );
}

export function TimestampsDisplay({ entries, className = "" }: TimestampsDisplayProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className={`timestamps-display flex flex-wrap gap-2 mb-3 ${className}`}>
      {entries.map((entry, index) => (
        <TimestampBadge key={`${entry.type}-${entry.lineNumber}-${index}`} entry={entry} />
      ))}
    </div>
  );
}
