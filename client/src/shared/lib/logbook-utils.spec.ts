import { describe, expect, it } from "vitest";
import { parseLogbook } from "./logbook-utils";

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

    const entries = parseLogbook(content);

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

    const entries = parseLogbook(content);

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

    const entries = parseLogbook(content);

    expect(entries).toHaveLength(1);
  });
});
