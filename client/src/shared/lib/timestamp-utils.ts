export interface TimestampEntry {
  type: "deadline" | "scheduled" | "closed";
  date: Date;
  originalText: string;
  lineNumber?: number;
}

/**
 * Parse org-mode timestamps (DEADLINE, SCHEDULED, CLOSED) from content
 */
export function parseTimestamps(content: string): TimestampEntry[] {
  const lines = content.split("\n");
  const entries: TimestampEntry[] = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // DEADLINE: <2025-09-02 Tue>
    const deadlineMatch = trimmedLine.match(/^DEADLINE:\s*<([^>]+)>/);
    if (deadlineMatch) {
      const dateStr = deadlineMatch[1];
      const parsedDate = parseOrgDate(dateStr);
      if (parsedDate) {
        entries.push({
          type: "deadline",
          date: parsedDate,
          originalText: trimmedLine,
          lineNumber: index,
        });
      }
    }

    // SCHEDULED: <2025-09-02 Tue>
    const scheduledMatch = trimmedLine.match(/^SCHEDULED:\s*<([^>]+)>/);
    if (scheduledMatch) {
      const dateStr = scheduledMatch[1];
      const parsedDate = parseOrgDate(dateStr);
      if (parsedDate) {
        entries.push({
          type: "scheduled",
          date: parsedDate,
          originalText: trimmedLine,
          lineNumber: index,
        });
      }
    }

    // CLOSED: [2025-08-29 Thu 14:30]
    const closedMatch = trimmedLine.match(/^CLOSED:\s*\[([^\]]+)\]/);
    if (closedMatch) {
      const dateStr = closedMatch[1];
      const parsedDate = parseOrgDate(dateStr);
      if (parsedDate) {
        entries.push({
          type: "closed",
          date: parsedDate,
          originalText: trimmedLine,
          lineNumber: index,
        });
      }
    }
  });

  return entries;
}

/**
 * Parse org-mode date string to JavaScript Date
 * Supports formats like:
 * - "2025-09-02 Tue"
 * - "2025-08-29 Thu 14:30"
 * - "2025-08-30 Fri 20:00"
 */
function parseOrgDate(dateStr: string): Date | null {
  try {
    // Remove day of week (e.g., "Tue", "Thu") if present
    const cleanDateStr = dateStr.replace(/\s+(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(\s|$)/, " ").trim();

    // Try different formats
    const formats = [
      // 2025-09-02
      /^(\d{4})-(\d{2})-(\d{2})$/,
      // 2025-08-29 14:30
      /^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})$/,
    ];

    for (const format of formats) {
      const match = cleanDateStr.match(format);
      if (match) {
        if (match[4] && match[5]) {
          // With time
          return new Date(
            parseInt(match[1], 10), // year
            parseInt(match[2], 10) - 1, // month (0-indexed)
            parseInt(match[3], 10), // day
            parseInt(match[4], 10), // hour
            parseInt(match[5], 10), // minute
          );
        } else {
          // Date only
          return new Date(
            parseInt(match[1], 10), // year
            parseInt(match[2], 10) - 1, // month (0-indexed)
            parseInt(match[3], 10), // day
          );
        }
      }
    }

    // Fallback: try native Date parsing
    return new Date(cleanDateStr);
  } catch (error) {
    console.warn("Failed to parse org date:", dateStr, error);
    return null;
  }
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(entry: TimestampEntry): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  };

  // Add time if available (not midnight)
  if (entry.date.getHours() !== 0 || entry.date.getMinutes() !== 0) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }

  return entry.date.toLocaleDateString("ja-JP", options);
}

/**
 * Get display color for timestamp type
 */
export function getTimestampColor(type: TimestampEntry["type"]): string {
  switch (type) {
    case "deadline":
      return "text-red-600 bg-red-50 border-red-200";
    case "scheduled":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "closed":
      return "text-green-600 bg-green-50 border-green-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

/**
 * Get display label for timestamp type
 */
export function getTimestampLabel(type: TimestampEntry["type"]): string {
  switch (type) {
    case "deadline":
      return "DEADLINE";
    case "scheduled":
      return "SCHEDULED";
    case "closed":
      return "CLOSED";
    default:
      return (type as string).toUpperCase();
  }
}
