import { describe, expect, it } from "vitest";
import { parseLogbook, type LogbookEntry } from "./logbook-utils";

describe("parseLogbook", () => {
  it("should parse state change entries", () => {
    const content = `
# Test Node

Some content here.

:LOGBOOK:
State "DONE" from "TODO" 2025-08-30 Fri 20:00
State "TODO" from "" 2025-08-29 Thu 09:15
:END:

More content here.
`;

    const entries = parseLogbook(content);

    console.log("Parsed entries:", entries);

    expect(entries).toHaveLength(2);

    // Most recent first (reversed order)
    expect(entries[0]).toMatchObject({
      type: "state-change",
      toState: "TODO",
      fromState: undefined,
      originalText: 'State "TODO" from "" 2025-08-29 Thu 09:15',
    });

    expect(entries[1]).toMatchObject({
      type: "state-change",
      toState: "DONE",
      fromState: "TODO",
      originalText: 'State "DONE" from "TODO" 2025-08-30 Fri 20:00',
    });
  });

  it("should parse clock entries", () => {
    const content = `
:LOGBOOK:
CLOCK: [2024-01-15 Mon 09:00]--[2024-01-15 Mon 11:30] =>  2:30
CLOCK: [2024-01-16 Tue 10:00]
:END:
`;

    const entries = parseLogbook(content);

    console.log("Clock entries:", entries);

    expect(entries).toHaveLength(2);

    expect(entries[0].type).toBe("clock");
    expect(entries[1].type).toBe("clock");
  });

  it("should parse mixed entries", () => {
    const content = `
:LOGBOOK:
CLOCK: [2024-01-15 Mon 09:00]--[2024-01-15 Mon 11:30] =>  2:30
State "DONE" from "TODO" 2025-08-30 Fri 20:00
CLOCK: [2024-01-16 Tue 10:00]
State "TODO" from "" 2025-08-29 Thu 09:15
:END:
`;

    const entries = parseLogbook(content);

    console.log("Mixed entries:", entries);

    expect(entries).toHaveLength(4);

    // Check types
    const stateEntries = entries.filter((e) => e.type === "state-change");
    const clockEntries = entries.filter((e) => e.type === "clock");

    expect(stateEntries).toHaveLength(2);
    expect(clockEntries).toHaveLength(2);
  });

  it("should return empty array when no LOGBOOK section", () => {
    const content = `
# Test Node

Some content here.
No logbook section.
`;

    const entries = parseLogbook(content);
    expect(entries).toHaveLength(0);
  });

  it("should return empty array when LOGBOOK section is empty", () => {
    const content = `
:LOGBOOK:
:END:
`;

    const entries = parseLogbook(content);
    expect(entries).toHaveLength(0);
  });

  it("should parse real org-roam LOGBOOK format", () => {
    const content = `:LOGBOOK:
- State "DONE" from "TODO" [2025-08-30 Fri 20:00]
:END:`;

    console.log("=== Real Format Test ===");
    console.log("Input content:");
    console.log(JSON.stringify(content, null, 2));

    const entries = parseLogbook(content);
    console.log("Real format entries:", entries);

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      type: "state-change",
      toState: "DONE",
      fromState: "TODO",
    });
  });

  it("should parse LOGBOOK with surrounding empty lines (real org-mode format)", () => {
    const content = `** ドロワー


:LOGBOOK:
- State "DONE" from "TODO" [2025-08-30 Fri 20:00]
:END:


`;

    console.log("=== Real Org-Mode Format Test ===");
    console.log("Input content with empty lines:");
    console.log(JSON.stringify(content, null, 2));

    const lines = content.split("\n");
    console.log("Lines with indices:");
    lines.forEach((line, index) => {
      console.log(`Line ${index}: "${line}" (trimmed: "${line.trim()}")`);
    });

    const entries = parseLogbook(content);
    console.log("Parsed entries from real format:", entries);

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      type: "state-change",
      toState: "DONE",
      fromState: "TODO",
    });
  });

  it("should handle multiple entries with empty lines", () => {
    const content = `** Task with multiple state changes


:LOGBOOK:
- State "DONE" from "TODO" [2025-08-30 Fri 20:00]

- State "TODO" from "" [2025-08-29 Thu 09:15]
CLOCK: [2025-08-29 Thu 10:00]--[2025-08-29 Thu 12:00] =>  2:00

:END:


More content here.`;

    const entries = parseLogbook(content);
    console.log("Multiple entries with empty lines:", entries);

    expect(entries.length).toBeGreaterThan(0);

    const stateEntries = entries.filter((e) => e.type === "state-change");
    const clockEntries = entries.filter((e) => e.type === "clock");

    expect(stateEntries).toHaveLength(2);
    expect(clockEntries).toHaveLength(1);
  });

  it("should debug parsing step by step", () => {
    const content = `:LOGBOOK:
State "DONE" from "TODO" 2025-08-30 Fri 20:00
:END:`;

    console.log("=== Debug Test ===");
    console.log("Input content:");
    console.log(JSON.stringify(content, null, 2));

    const lines = content.split("\n");
    console.log("Lines:", lines);

    lines.forEach((line, index) => {
      console.log(`Line ${index}: "${line.trim()}"`);
    });

    const entries = parseLogbook(content);
    console.log("Final entries:", entries);

    expect(entries).toHaveLength(1);
  });
});
