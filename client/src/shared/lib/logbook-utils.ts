export interface LogbookEntry {
  type: "clock" | "state-change";
  startDate: Date;
  endDate?: Date;
  note?: string;
  originalText: string;
  // For state changes
  fromState?: string;
  toState?: string;
}

export function parseLogbook(content: string): LogbookEntry[] {
  const entries: LogbookEntry[] = [];
  const lines = content.split("\n");

  let inLogbook = false;
  let currentEntry: Partial<LogbookEntry> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Start of LOGBOOK section
    if (trimmed === ":LOGBOOK:") {
      inLogbook = true;
      continue;
    }

    // End of LOGBOOK section
    if (trimmed === ":END:" && inLogbook) {
      if (currentEntry?.startDate) {
        entries.push({
          type: currentEntry.type || "clock",
          startDate: currentEntry.startDate,
          endDate: currentEntry.endDate,
          note: currentEntry.note,
          originalText: currentEntry.originalText || "",
          fromState: currentEntry.fromState,
          toState: currentEntry.toState,
        });
      }
      inLogbook = false;
      currentEntry = null;
      continue;
    }

    if (inLogbook && trimmed) {
      // Parse CLOCK entries - support various formats
      // Format: "CLOCK: [2024-01-01 Mon 10:00]--[2024-01-01 Mon 12:00] =>  2:00"
      // Format: "CLOCK: [2024-01-01 Mon 10:00]"
      // Also try more flexible patterns
      const clockPatterns = [
        /^CLOCK:\s*\[([^\]]+)\](?:--\[([^\]]+)\])?(?:\s*=>\s*(.+))?/,
        /^\s*CLOCK:\s*\[([^\]]+)\](?:--\[([^\]]+)\])?(?:\s*=>\s*(.+))?/,
        /^-\s*CLOCK:\s*\[([^\]]+)\](?:--\[([^\]]+)\])?(?:\s*=>\s*(.+))?/,
      ];

      let clockMatch = null;
      for (const pattern of clockPatterns) {
        clockMatch = trimmed.match(pattern);
        if (clockMatch) break;
      }

      if (clockMatch) {
        const startDateStr = clockMatch[1];
        const endDateStr = clockMatch[2];
        const duration = clockMatch[3];

        try {
          const startDate = parseOrgDate(startDateStr);
          const endDate = endDateStr ? parseOrgDate(endDateStr) : undefined;

          if (currentEntry?.startDate) {
            entries.push({
              type: currentEntry.type || "clock",
              startDate: currentEntry.startDate,
              endDate: currentEntry.endDate,
              note: currentEntry.note,
              originalText: currentEntry.originalText || "",
              fromState: currentEntry.fromState,
              toState: currentEntry.toState,
            });
          }

          currentEntry = {
            type: "clock",
            startDate,
            endDate,
            originalText: trimmed,
          };

          if (duration) {
            currentEntry.note = `Duration: ${duration}`;
          }
        } catch (e) {
          console.warn("Failed to parse date in logbook entry:", startDateStr, e);
        }
        continue;
      }

      // Parse state change entries
      // Format: 'State "DONE" from "TODO" 2025-08-30 Fri 20:00'
      // Format: '- State "DONE" from "TODO" [2025-08-30 Fri 20:00]'
      // Format: 'State "TODO" from "" 2025-08-30 Fri 20:00'
      const statePatterns = [
        /^State\s+"([^"]+)"\s+from\s+"([^"]*)"\s+(.+)$/,
        /^-\s*State\s+"([^"]+)"\s+from\s+"([^"]*)"\s+\[([^\]]+)\]$/,
        /^\s*-\s*State\s+"([^"]+)"\s+from\s+"([^"]*)"\s+\[([^\]]+)\]$/,
      ];

      let stateMatch = null;
      for (const pattern of statePatterns) {
        stateMatch = trimmed.match(pattern);
        if (stateMatch) break;
      }

      if (stateMatch) {
        const toState = stateMatch[1];
        const fromState = stateMatch[2];
        const dateStr = stateMatch[3];

        try {
          const date = parseOrgDate(dateStr);

          if (currentEntry?.startDate) {
            entries.push({
              type: currentEntry.type || "state-change",
              startDate: currentEntry.startDate,
              endDate: currentEntry.endDate,
              note: currentEntry.note,
              originalText: currentEntry.originalText || "",
              fromState: currentEntry.fromState,
              toState: currentEntry.toState,
            });
          }

          currentEntry = {
            type: "state-change",
            startDate: date,
            originalText: trimmed,
            fromState: fromState || undefined,
            toState: toState,
          };
        } catch (e) {
          console.warn("Failed to parse date in state change entry:", dateStr, e);
        }
        continue;
      }

      // Parse note lines (lines that start with "- " or are plain text)
      if (currentEntry && (trimmed.startsWith("- ") || !trimmed.startsWith("CLOCK:"))) {
        const noteText = trimmed.startsWith("- ") ? trimmed.slice(2) : trimmed;
        currentEntry.note = currentEntry.note ? `${currentEntry.note} ${noteText}` : noteText;
      }
    }
  }

  // Add any remaining entry
  if (currentEntry?.startDate) {
    entries.push({
      type: currentEntry.type || "clock",
      startDate: currentEntry.startDate,
      endDate: currentEntry.endDate,
      note: currentEntry.note,
      originalText: currentEntry.originalText || "",
      fromState: currentEntry.fromState,
      toState: currentEntry.toState,
    });
  }

  return entries.reverse(); // Most recent first
}

function parseOrgDate(dateStr: string): Date {
  // Parse org-mode date format: "2024-01-01 Mon 10:00"
  // Remove day of week if present
  const cleanDateStr = dateStr.replace(/\s+(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+/, " ");

  // Try different formats
  const formats = [
    // "2024-01-01 10:00"
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})$/,
    // "2024-01-01 10:00:00"
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})$/,
    // "2024-01-01"
    /^(\d{4})-(\d{2})-(\d{2})$/,
  ];

  for (const format of formats) {
    const match = cleanDateStr.match(format);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
      const day = parseInt(match[3], 10);
      const hour = match[4] ? parseInt(match[4], 10) : 0;
      const minute = match[5] ? parseInt(match[5], 10) : 0;
      const second = match[6] ? parseInt(match[6], 10) : 0;

      return new Date(year, month, day, hour, minute, second);
    }
  }

  // Fallback to built-in parser
  const parsed = new Date(cleanDateStr);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Unable to parse date: ${dateStr}`);
  }

  return parsed;
}

export function formatLogbookDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}`;
}

export function calculateDuration(startDate: Date, endDate?: Date): string {
  const end = endDate || new Date();
  const diffMs = end.getTime() - startDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}`;
  }
  return `${minutes}m`;
}
