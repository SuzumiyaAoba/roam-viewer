import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { TimestampsDisplay } from "./TimestampDisplay";
import type { TimestampEntry } from "../shared/lib/timestamp-utils";

const meta = {
  title: "Components/TimestampDisplay",
  component: TimestampsDisplay,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A component for displaying Org-mode timestamps with proper formatting and color coding. Supports different timestamp types including scheduled, deadline, and closed timestamps with appropriate visual indicators.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    entries: {
      control: "object",
      description: "Array of timestamp entries to display",
    },
    className: {
      control: "text", 
      description: "Additional CSS classes",
    },
  },
} satisfies Meta<typeof TimestampsDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample timestamp entries for stories
const scheduledEntry: TimestampEntry = {
  type: "scheduled",
  date: new Date("2024-01-15T09:00:00"),
  originalText: "SCHEDULED: <2024-01-15 Mon 09:00>",
  lineNumber: 1,
};

const deadlineEntry: TimestampEntry = {
  type: "deadline",
  date: new Date("2024-01-20T17:00:00"),
  originalText: "DEADLINE: <2024-01-20 Sat 17:00>",
  lineNumber: 2,
};

const closedEntry: TimestampEntry = {
  type: "closed",
  date: new Date("2024-01-16T14:30:00"),
  originalText: "CLOSED: <2024-01-16 Tue 14:30>",
  lineNumber: 3,
};

const dateOnlyEntry: TimestampEntry = {
  type: "scheduled",
  date: new Date("2024-02-01T00:00:00"),
  originalText: "SCHEDULED: <2024-02-01 Thu>",
  lineNumber: 4,
};

const rangeEntry: TimestampEntry = {
  type: "scheduled",
  date: new Date("2024-01-25T09:00:00"),
  originalText: "SCHEDULED: <2024-01-25 Thu 09:00>--<2024-01-25 Thu 17:00>",
  lineNumber: 5,
};

const multiDayEntry: TimestampEntry = {
  type: "scheduled",
  date: new Date("2024-03-01T00:00:00"),
  originalText: "SCHEDULED: <2024-03-01 Fri>--<2024-03-03 Sun>",
  lineNumber: 6,
};

export const SingleScheduled: Story = {
  args: {
    entries: [scheduledEntry],
  },
  parameters: {
    docs: {
      description: {
        story: "A single scheduled timestamp with date and time",
      },
    },
  },
};

export const SingleDeadline: Story = {
  args: {
    entries: [deadlineEntry],
  },
  parameters: {
    docs: {
      description: {
        story: "A single deadline timestamp with orange/red styling",
      },
    },
  },
};

export const SingleClosed: Story = {
  args: {
    entries: [closedEntry],
  },
  parameters: {
    docs: {
      description: {
        story: "A closed timestamp indicating when a task was completed",
      },
    },
  },
};

export const DateOnly: Story = {
  args: {
    entries: [dateOnlyEntry],
  },
  parameters: {
    docs: {
      description: {
        story: "A timestamp with date only (no specific time)",
      },
    },
  },
};

export const TimeRange: Story = {
  args: {
    entries: [rangeEntry],
  },
  parameters: {
    docs: {
      description: {
        story: "A timestamp with start and end time on the same day",
      },
    },
  },
};

export const MultiDay: Story = {
  args: {
    entries: [multiDayEntry],
  },
  parameters: {
    docs: {
      description: {
        story: "A timestamp spanning multiple days",
      },
    },
  },
};

export const MultipleTimestamps: Story = {
  args: {
    entries: [scheduledEntry, deadlineEntry, closedEntry],
  },
  parameters: {
    docs: {
      description: {
        story: "Multiple timestamps of different types displayed together",
      },
    },
  },
};

export const MeetingSchedule: Story = {
  args: {
    entries: [
      {
        type: "scheduled",
        date: new Date("2024-01-15T09:00:00"),
        originalText: "SCHEDULED: <2024-01-15 Mon 09:00>--<2024-01-15 Mon 10:30>",
        lineNumber: 1,
      },
      {
        type: "deadline",
        date: new Date("2024-01-15T08:30:00"),
        originalText: "DEADLINE: <2024-01-15 Mon 08:30>",
        lineNumber: 2,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: "Example of a meeting with preparation deadline and scheduled time slot",
      },
    },
  },
};

export const ProjectTimeline: Story = {
  args: {
    entries: [
      {
        type: "scheduled",
        date: new Date("2024-02-01T09:00:00"),
        originalText: "SCHEDULED: <2024-02-01 Thu 09:00>",
        lineNumber: 1,
      },
      {
        type: "deadline",
        date: new Date("2024-02-15T17:00:00"),
        originalText: "DEADLINE: <2024-02-15 Thu 17:00>",
        lineNumber: 2,
      },
      {
        type: "closed",
        date: new Date("2024-02-14T16:30:00"),
        originalText: "CLOSED: <2024-02-14 Wed 16:30>",
        lineNumber: 3,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: "Project timeline showing start date, deadline, and actual completion time",
      },
    },
  },
};

export const EmptyTimestamps: Story = {
  args: {
    entries: [],
  },
  parameters: {
    docs: {
      description: {
        story: "Empty timestamp array should render nothing",
      },
    },
  },
};

export const CustomStyling: Story = {
  args: {
    entries: [scheduledEntry, deadlineEntry],
    className: "bg-gray-50 p-4 rounded-lg border",
  },
  parameters: {
    docs: {
      description: {
        story: "Example with custom styling applied to the container",
      },
    },
  },
};

// All timestamp types showcase
export const AllTypes: Story = {
  args: {
    entries: [
      {
        type: "scheduled",
        date: new Date("2024-01-15T09:00:00"),
        originalText: "SCHEDULED: <2024-01-15 Mon 09:00>",
        lineNumber: 1,
      },
      {
        type: "deadline",
        date: new Date("2024-01-20T17:00:00"),
        originalText: "DEADLINE: <2024-01-20 Sat 17:00>",
        lineNumber: 2,
      },
      {
        type: "closed",
        date: new Date("2024-01-16T14:30:00"),
        originalText: "CLOSED: <2024-01-16 Tue 14:30>",
        lineNumber: 3,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: "Overview of all available timestamp types with their distinct styling",
      },
    },
  },
};

// Edge cases and variations
export const EdgeCases = {
  args: { entries: [], className: "" },
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Edge Cases and Variations</h3>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Past Deadline (Overdue)</h4>
        <TimestampsDisplay 
          entries={[{
            type: "deadline",
            date: new Date("2023-12-01T17:00:00"), // Past date
            originalText: "DEADLINE: <2023-12-01 Fri 17:00>",
            lineNumber: 1,
          }]}
        />
      </div>

      <div>
        <h4 className="font-medium mb-2">Future Schedule</h4>
        <TimestampsDisplay 
          entries={[{
            type: "scheduled",
            date: new Date("2025-06-01T09:00:00"), // Future date
            originalText: "SCHEDULED: <2025-06-01 Sun 09:00>",
            lineNumber: 2,
          }]}
        />
      </div>

      <div>
        <h4 className="font-medium mb-2">All-Day Event (Multiple Days)</h4>
        <TimestampsDisplay 
          entries={[{
            type: "scheduled",
            date: new Date("2024-03-15T00:00:00"),
            originalText: "SCHEDULED: <2024-03-15 Fri>--<2024-03-18 Mon>",
            lineNumber: 3,
          }]}
        />
      </div>

      <div>
        <h4 className="font-medium mb-2">Same Day Range</h4>
        <TimestampsDisplay 
          entries={[{
            type: "scheduled",
            date: new Date("2024-01-20T14:00:00"),
            originalText: "SCHEDULED: <2024-01-20 Sat 14:00>--<2024-01-20 Sat 16:30>",
            lineNumber: 4,
          }]}
        />
      </div>

      <div>
        <h4 className="font-medium mb-2">Midnight Deadline</h4>
        <TimestampsDisplay 
          entries={[{
            type: "deadline",
            date: new Date("2024-01-25T00:00:00"),
            originalText: "DEADLINE: <2024-01-25 Thu>",
            lineNumber: 5,
          }]}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Various edge cases including overdue items, future dates, multi-day events, and midnight timestamps",
      },
    },
  },
};

// Real-world examples
export const TaskManagementExample = {
  args: { entries: [], className: "" },
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Task Management Examples</h3>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-white border rounded-lg">
          <h4 className="font-medium mb-2">📋 Project Kickoff Meeting</h4>
          <TimestampsDisplay 
            entries={[{
              type: "scheduled",
              date: new Date("2024-01-22T10:00:00"),
              originalText: "SCHEDULED: <2024-01-22 Mon 10:00>--<2024-01-22 Mon 11:30>",
              lineNumber: 1,
            }]}
          />
          <p className="text-sm text-gray-600 mt-2">Team standup and project planning session</p>
        </div>

        <div className="p-4 bg-white border rounded-lg">
          <h4 className="font-medium mb-2">🚀 Feature Release</h4>
          <TimestampsDisplay 
            entries={[
              {
                type: "deadline",
                date: new Date("2024-01-31T17:00:00"),
                originalText: "DEADLINE: <2024-01-31 Wed 17:00>",
                lineNumber: 2,
              },
              {
                type: "closed",
                date: new Date("2024-01-30T16:45:00"),
                originalText: "CLOSED: [2024-01-30 Tue 16:45]",
                lineNumber: 3,
              },
            ]}
          />
          <p className="text-sm text-gray-600 mt-2">Release completed 15 minutes early! 🎉</p>
        </div>

        <div className="p-4 bg-white border rounded-lg">
          <h4 className="font-medium mb-2">📅 Conference Trip</h4>
          <TimestampsDisplay 
            entries={[{
              type: "scheduled",
              date: new Date("2024-03-10T00:00:00"),
              originalText: "SCHEDULED: <2024-03-10 Sun>--<2024-03-13 Wed>",
              lineNumber: 4,
            }]}
          />
          <p className="text-sm text-gray-600 mt-2">Tech conference in San Francisco</p>
        </div>

        <div className="p-4 bg-white border rounded-lg">
          <h4 className="font-medium mb-2">⚠️ Urgent Bug Fix</h4>
          <TimestampsDisplay 
            entries={[
              {
                type: "deadline",
                date: new Date("2024-01-16T12:00:00"),
                originalText: "DEADLINE: <2024-01-16 Tue 12:00>",
                lineNumber: 5,
              },
              {
                type: "scheduled", 
                date: new Date("2024-01-16T09:00:00"),
                originalText: "SCHEDULED: <2024-01-16 Tue 09:00>",
                lineNumber: 6,
              },
            ]}
          />
          <p className="text-sm text-gray-600 mt-2">Critical production issue - needs immediate attention</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Real-world examples of how timestamps are used in task management scenarios",
      },
    },
  },
};