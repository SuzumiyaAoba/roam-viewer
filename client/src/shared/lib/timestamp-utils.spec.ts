import { describe, expect, it } from "vitest";
import {
  parseTimestamps,
  formatTimestamp,
  getTimestampColor,
  getTimestampLabel,
  type TimestampEntry,
} from "./timestamp-utils";

describe("parseTimestamps", () => {
  it("should parse DEADLINE entries", () => {
    const content = `** TODO 重要なタスク
DEADLINE: <2025-09-02 Tue>
Some other content.`;

    const entries = parseTimestamps(content);
    console.log("DEADLINE entries:", entries);

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      type: "deadline",
      originalText: "DEADLINE: <2025-09-02 Tue>",
      lineNumber: 1,
    });
    expect(entries[0].date).toBeInstanceOf(Date);
    expect(entries[0].date.getFullYear()).toBe(2025);
    expect(entries[0].date.getMonth()).toBe(8); // September (0-indexed)
    expect(entries[0].date.getDate()).toBe(2);
  });

  it("should parse CLOSED entries", () => {
    const content = `** DONE 完了済みタスク
CLOSED: [2025-08-29 Thu 14:30]
More content.`;

    const entries = parseTimestamps(content);
    console.log("CLOSED entries:", entries);

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      type: "closed",
      originalText: "CLOSED: [2025-08-29 Thu 14:30]",
      lineNumber: 1,
    });
    expect(entries[0].date).toBeInstanceOf(Date);
    expect(entries[0].date.getHours()).toBe(14);
    expect(entries[0].date.getMinutes()).toBe(30);
  });

  it("should parse SCHEDULED entries", () => {
    const content = `** TODO Task
SCHEDULED: <2025-09-15 Mon 09:00>`;

    const entries = parseTimestamps(content);

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      type: "scheduled",
      originalText: "SCHEDULED: <2025-09-15 Mon 09:00>",
    });
  });

  it("should parse multiple timestamp entries", () => {
    const content = `** TODO Multiple timestamps
DEADLINE: <2025-09-02 Tue>
SCHEDULED: <2025-08-30 Fri 09:00>
Some content in between.
CLOSED: [2025-08-29 Thu 14:30]`;

    const entries = parseTimestamps(content);

    expect(entries).toHaveLength(3);
    expect(entries.map((e) => e.type)).toEqual(
      expect.arrayContaining(["deadline", "scheduled", "closed"]),
    );
  });

  it("should return empty array when no timestamps", () => {
    const content = `** Regular heading
Just normal content without any timestamps.
More content.`;

    const entries = parseTimestamps(content);
    expect(entries).toHaveLength(0);
  });

  it("should parse real org-roam timestamp format", () => {
    const content = `**** TODO 重要なタスク
DEADLINE: <2025-09-02 Tue>
**** DONE 完了済みタスク
CLOSED: [2025-08-29 Thu 14:30]`;

    console.log("=== Real Format Test ===");
    console.log("Input content:");
    console.log(JSON.stringify(content, null, 2));

    const entries = parseTimestamps(content);
    console.log("Real format entries:", entries);

    expect(entries).toHaveLength(2);
    expect(entries[0].type).toBe("deadline");
    expect(entries[1].type).toBe("closed");
  });
});

describe("formatTimestamp", () => {
  it("should format date-only timestamp", () => {
    const entry: TimestampEntry = {
      type: "deadline",
      date: new Date(2025, 8, 2), // September 2, 2025
      originalText: "DEADLINE: <2025-09-02 Tue>",
      lineNumber: 1,
    };

    const formatted = formatTimestamp(entry);
    console.log("Formatted date-only:", formatted);

    expect(formatted).toContain("2025");
    expect(formatted).toContain("09");
    expect(formatted).toContain("02");
  });

  it("should format timestamp with time", () => {
    const entry: TimestampEntry = {
      type: "closed",
      date: new Date(2025, 7, 29, 14, 30), // August 29, 2025 14:30
      originalText: "CLOSED: [2025-08-29 Thu 14:30]",
      lineNumber: 1,
    };

    const formatted = formatTimestamp(entry);
    console.log("Formatted with time:", formatted);

    expect(formatted).toContain("14:30");
  });
});

describe("getTimestampColor", () => {
  it("should return correct colors for each type", () => {
    expect(getTimestampColor("deadline")).toContain("text-red-600");
    expect(getTimestampColor("scheduled")).toContain("text-blue-600");
    expect(getTimestampColor("closed")).toContain("text-green-600");
  });
});

describe("getTimestampLabel", () => {
  it("should return correct labels for each type", () => {
    expect(getTimestampLabel("deadline")).toBe("DEADLINE");
    expect(getTimestampLabel("scheduled")).toBe("SCHEDULED");
    expect(getTimestampLabel("closed")).toBe("CLOSED");
  });
});
