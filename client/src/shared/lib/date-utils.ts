/**
 * Date formatting utilities for consistent timestamp display
 */

export interface DateFormatOptions {
  includeTime?: boolean;
  relative?: boolean;
  format?: "short" | "medium" | "long" | "full";
}

/**
 * Format a date string or Date object for display
 */
export function formatDate(
  dateInput: string | Date | null | undefined,
  options: DateFormatOptions = {},
): string {
  if (!dateInput) return "";

  const { includeTime = false, relative = false, format = "medium" } = options;

  let date: Date;

  // Handle various input formats
  if (typeof dateInput === "string") {
    // Handle org-mode date formats like <2024-01-15 Mon> or [2024-01-15]
    const orgDateMatch = dateInput.match(/[<[](\d{4}-\d{2}-\d{2})/);
    if (orgDateMatch) {
      date = new Date(orgDateMatch[1]);
    } else {
      date = new Date(dateInput);
    }
  } else {
    date = dateInput;
  }

  // Check if date is valid
  if (Number.isNaN(date.getTime())) {
    return dateInput.toString();
  }

  // Return relative time if requested and within reasonable range
  if (relative) {
    const relativeTime = getRelativeTime(date);
    if (relativeTime) return relativeTime;
  }

  // Format options for different detail levels
  const formatOptions: Intl.DateTimeFormatOptions = {
    year: format === "short" ? "2-digit" : "numeric",
    month: format === "short" ? "numeric" : format === "long" ? "long" : "short",
    day: "numeric",
  };

  if (includeTime) {
    formatOptions.hour = "2-digit";
    formatOptions.minute = "2-digit";
    formatOptions.hour12 = false; // Use 24-hour format
  }

  return date.toLocaleDateString("ja-JP", formatOptions);
}

/**
 * Get relative time string for dates within a reasonable range
 */
function getRelativeTime(date: Date): string | null {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  // Only show relative time for recent dates
  if (diffInMinutes < 1) return "たった今";
  if (diffInMinutes < 60) return `${diffInMinutes}分前`;
  if (diffInHours < 24) return `${diffInHours}時間前`;
  if (diffInDays === 1) return "昨日";
  if (diffInDays < 7) return `${diffInDays}日前`;

  // For dates older than a week, return null to use standard formatting
  return null;
}

/**
 * Parse org-mode timestamp object from uniorg AST
 */
export interface OrgTimestamp {
  type: "timestamp";
  timestampType: "active" | "inactive" | "active-range" | "inactive-range";
  rawValue: string;
  start: {
    year: number;
    month: number;
    day: number;
    hour?: number;
    minute?: number;
  };
  end?: {
    year: number;
    month: number;
    day: number;
    hour?: number;
    minute?: number;
  };
}

/**
 * Format org-mode timestamp object with time range support
 */
export function formatOrgTimestamp(
  timestamp: OrgTimestamp | null,
  type: "scheduled" | "deadline" = "scheduled",
): { display: string; isOverdue: boolean; isToday: boolean; isSoon: boolean; isRange: boolean } {
  if (!timestamp) {
    return { display: "", isOverdue: false, isToday: false, isSoon: false, isRange: false };
  }

  const isRange = timestamp.timestampType?.includes("range") || !!timestamp.end;

  // Create start date
  // For DEADLINE without time, treat as next day 0:00 (end of the specified day)
  let startDate = new Date(
    timestamp.start.year,
    timestamp.start.month - 1, // JS months are 0-based
    timestamp.start.day,
    timestamp.start.hour || 0,
    timestamp.start.minute || 0,
  );

  // If DEADLINE has no time specified, set to next day 0:00
  if (type === "deadline" && timestamp.start.hour === undefined) {
    startDate = new Date(startDate);
    startDate.setDate(startDate.getDate() + 1); // Next day
    startDate.setHours(0, 0, 0, 0); // 0:00:00
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const diffInDays = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // For deadlines, check if the actual datetime has passed (not just the date)
  const isOverdue = type === "deadline" ? startDate.getTime() < now.getTime() : false;
  const isToday = diffInDays === 0;
  const isSoon = diffInDays > 0 && diffInDays <= 3;

  let display: string;

  if (isRange && timestamp.end) {
    // Format time range
    const endDate = new Date(
      timestamp.end.year,
      timestamp.end.month - 1,
      timestamp.end.day,
      timestamp.end.hour || 0,
      timestamp.end.minute || 0,
    );

    const startTime = formatDate(startDate, {
      format: "medium",
      includeTime: !!(timestamp.start.hour !== undefined),
      relative: Math.abs(diffInDays) <= 7,
    });

    // Same day range - show date once
    if (startDate.toDateString() === endDate.toDateString()) {
      if (timestamp.start.hour !== undefined && timestamp.end.hour !== undefined) {
        // Same day with times: "2024年1月15日 9:00-17:00"
        const startTimeStr = `${timestamp.start.hour.toString().padStart(2, "0")}:${(timestamp.start.minute || 0).toString().padStart(2, "0")}`;
        const endTimeStr = `${timestamp.end.hour.toString().padStart(2, "0")}:${(timestamp.end.minute || 0).toString().padStart(2, "0")}`;
        display = `${startTime.replace(/\s+\d{1,2}:\d{2}$/, "")} ${startTimeStr}-${endTimeStr}`;
      } else {
        // Same day without times
        display = startTime;
      }
    } else {
      // Multi-day range
      const endTime = formatDate(endDate, {
        format: "medium",
        includeTime: !!(timestamp.end.hour !== undefined),
      });
      display = `${startTime} 〜 ${endTime}`;
    }
  } else {
    // Single timestamp
    display = formatDate(startDate, {
      format: "medium",
      includeTime: !!(timestamp.start.hour !== undefined),
      relative: Math.abs(diffInDays) <= 7,
    });
  }

  return { display, isOverdue, isToday, isSoon, isRange };
}

/**
 * Format org-mode scheduled/deadline dates with better styling (legacy string-based)
 */
export function formatOrgDate(
  dateStr: string | null | undefined,
  type: "scheduled" | "deadline" = "scheduled",
): { display: string; isOverdue: boolean; isToday: boolean; isSoon: boolean; isRange: boolean } {
  if (!dateStr) {
    return { display: "", isOverdue: false, isToday: false, isSoon: false, isRange: false };
  }

  const date = parseOrgDate(dateStr);
  if (!date) {
    return { display: dateStr, isOverdue: false, isToday: false, isSoon: false, isRange: false };
  }

  // For DEADLINE without time, treat as next day 0:00 (end of the specified day)
  const targetDateTime = new Date(date);
  if (type === "deadline" && !dateStr.includes(":")) {
    targetDateTime.setDate(targetDateTime.getDate() + 1); // Next day
    targetDateTime.setHours(0, 0, 0, 0); // 0:00:00
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffInDays = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // For deadlines, check if the actual datetime has passed (not just the date)
  const isOverdue = type === "deadline" ? targetDateTime.getTime() < now.getTime() : false;
  const isToday = diffInDays === 0;
  const isSoon = diffInDays > 0 && diffInDays <= 3;

  const display = formatDate(date, {
    format: "medium",
    relative: Math.abs(diffInDays) <= 7,
  });

  return { display, isOverdue, isToday, isSoon, isRange: false };
}

/**
 * Parse org-mode date format
 */
function parseOrgDate(dateStr: string): Date | null {
  // Handle formats like <2024-01-15 Mon>, [2024-01-15], or plain 2024-01-15
  const match = dateStr.match(/([<[])?(\d{4}-\d{2}-\d{2})/);
  if (match) {
    return new Date(match[2]);
  }

  // Fallback to regular Date parsing
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Format file modification time for node cards
 */
export function formatNodeDate(dateInput: string | Date | null | undefined): string {
  return formatDate(dateInput, {
    format: "medium",
    relative: true,
  });
}
