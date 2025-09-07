import type { Meta, StoryObj } from "@storybook/react";
import { LogbookDisplay } from "./LogbookDisplay";

const meta = {
  title: "Components/LogbookDisplay",
  component: LogbookDisplay,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A component for displaying Org-mode logbook entries including state changes and time tracking (clock entries). Supports collapsible timeline view with visual indicators for different entry types.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    content: {
      control: "text",
      description: "The logbook content in Org-mode format",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
} satisfies Meta<typeof LogbookDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample logbook content for stories
const basicLogbookContent = `:LOGBOOK:
- State "DONE"       from "TODO"       [2024-01-15 Mon 10:30]
- State "TODO"       from              [2024-01-10 Wed 09:00]
:END:`;

const clockEntriesContent = `:LOGBOOK:
CLOCK: [2024-01-15 Mon 09:00]--[2024-01-15 Mon 12:00] =>  3:00
CLOCK: [2024-01-15 Mon 13:00]--[2024-01-15 Mon 17:00] =>  4:00
CLOCK: [2024-01-16 Tue 09:00]--[2024-01-16 Tue 11:30] =>  2:30
:END:`;

const mixedEntriesContent = `:LOGBOOK:
- State "DOING"      from "TODO"       [2024-01-16 Tue 09:00]
CLOCK: [2024-01-16 Tue 09:00]--[2024-01-16 Tue 12:00] =>  3:00
- State "WAITING"    from "DOING"      [2024-01-16 Tue 12:00] \\
  待機: クライアントからの承認待ち
CLOCK: [2024-01-16 Tue 13:00]--[2024-01-16 Tue 15:30] =>  2:30
- State "DONE"       from "WAITING"    [2024-01-16 Tue 15:30]
:END:`;

const ongoingClockContent = `:LOGBOOK:
CLOCK: [2024-01-16 Tue 14:00]
- State "DOING"      from "TODO"       [2024-01-16 Tue 14:00]
:END:`;

const detailedLogbookContent = `:LOGBOOK:
- State "CANCELLED"  from "TODO"       [2024-01-20 Sat 16:00] \\
  理由: 要件が変更されたため、このタスクは不要になった
- State "TODO"       from "NEXT"       [2024-01-18 Thu 09:00] \\
  優先度を上げて実装開始
- State "NEXT"       from "WAITING"    [2024-01-15 Mon 10:30]
- State "WAITING"    from "DOING"      [2024-01-10 Wed 14:00] \\
  デザイン承認待ち
CLOCK: [2024-01-10 Wed 09:00]--[2024-01-10 Wed 14:00] =>  5:00
- State "DOING"      from "TODO"       [2024-01-10 Wed 09:00]
- State "TODO"       from              [2024-01-08 Mon 10:00]
:END:`;

const japaneseLogbookContent = `:LOGBOOK:
- State "完了"       from "作業中"      [2024-01-16 Tue 17:00] \\
  テストも完了し、本番環境にデプロイ済み
- State "作業中"     from "TODO"       [2024-01-16 Tue 09:00]
CLOCK: [2024-01-16 Tue 09:00]--[2024-01-16 Tue 12:00] =>  3:00
CLOCK: [2024-01-16 Tue 13:00]--[2024-01-16 Tue 17:00] =>  4:00
- State "TODO"       from              [2024-01-15 Mon 10:00] \\
  新機能の実装タスクを作成
:END:`;

export const Default: Story = {
  args: {
    content: basicLogbookContent,
  },
};

export const ClockEntries: Story = {
  args: {
    content: clockEntriesContent,
  },
  parameters: {
    docs: {
      description: {
        story: "Shows time tracking entries (clock entries) with duration calculations",
      },
    },
  },
};

export const MixedEntries: Story = {
  args: {
    content: mixedEntriesContent,
  },
  parameters: {
    docs: {
      description: {
        story: "Demonstrates mixed state changes and clock entries with notes",
      },
    },
  },
};

export const OngoingWork: Story = {
  args: {
    content: ongoingClockContent,
  },
  parameters: {
    docs: {
      description: {
        story: "Shows an ongoing clock entry (no end time) marked as 'in progress'",
      },
    },
  },
};

export const DetailedLogbook: Story = {
  args: {
    content: detailedLogbookContent,
  },
  parameters: {
    docs: {
      description: {
        story: "Complex logbook with multiple state transitions, notes, and clock entries",
      },
    },
  },
};

export const JapaneseContent: Story = {
  args: {
    content: japaneseLogbookContent,
  },
  parameters: {
    docs: {
      description: {
        story: "Demonstrates support for Japanese text in state labels and notes",
      },
    },
  },
};

export const EmptyLogbook: Story = {
  args: {
    content: `:LOGBOOK:
:END:`,
  },
  parameters: {
    docs: {
      description: {
        story: "Empty logbook should not render anything",
      },
    },
  },
};

export const CustomStyling: Story = {
  args: {
    content: mixedEntriesContent,
    className: "bg-blue-50 border-blue-200 rounded-lg",
  },
  parameters: {
    docs: {
      description: {
        story: "Example with custom styling applied to the container",
      },
    },
  },
};

// All state types showcase
export const AllStateTypes: Story = {
  args: {
    content: `:LOGBOOK:
- State "DONE"       from "DOING"      [2024-01-16 Tue 17:00]
- State "DOING"      from "WAITING"    [2024-01-16 Tue 14:00]
- State "WAITING"    from "NEXT"       [2024-01-16 Tue 12:00]
- State "NEXT"       from "TODO"       [2024-01-16 Tue 10:00]
- State "TODO"       from "CANCELLED"  [2024-01-16 Tue 09:00]
- State "CANCELLED"  from              [2024-01-15 Mon 15:00]
:END:`,
  },
  parameters: {
    docs: {
      description: {
        story: "Shows all different state types with their respective color coding",
      },
    },
  },
};

// Real-world example
export const RealWorldExample: Story = {
  args: {
    content: `:LOGBOOK:
- State "DONE"       from "DOING"      [2024-01-16 Tue 16:45] \\
  実装完了。テストも通ったので本番デプロイ予定。
CLOCK: [2024-01-16 Tue 14:00]--[2024-01-16 Tue 16:45] =>  2:45
- State "DOING"      from "WAITING"    [2024-01-16 Tue 14:00] \\
  レビューが完了したので実装再開
- State "WAITING"    from "DOING"      [2024-01-15 Mon 17:30] \\
  コードレビュー待ち。明日朝一で確認予定。
CLOCK: [2024-01-15 Mon 09:30]--[2024-01-15 Mon 12:00] =>  2:30
CLOCK: [2024-01-15 Mon 13:00]--[2024-01-15 Mon 17:30] =>  4:30
- State "DOING"      from "TODO"       [2024-01-15 Mon 09:30] \\
  API実装開始。まずは認証部分から。
- State "TODO"       from              [2024-01-14 Sun 20:00] \\
  新機能のAPIエンドポイント実装タスク
:END:`,
  },
  parameters: {
    docs: {
      description: {
        story: "Real-world example showing a typical development task workflow with Japanese notes",
      },
    },
  },
};

// Performance test with many entries
export const ManyEntries: Story = {
  args: {
    content: `:LOGBOOK:
- State "DONE"       from "DOING"      [2024-01-20 Sat 17:00]
CLOCK: [2024-01-20 Sat 15:00]--[2024-01-20 Sat 17:00] =>  2:00
- State "DOING"      from "WAITING"    [2024-01-20 Sat 15:00]
- State "WAITING"    from "DOING"      [2024-01-19 Fri 18:00]
CLOCK: [2024-01-19 Fri 14:00]--[2024-01-19 Fri 18:00] =>  4:00
- State "DOING"      from "TODO"       [2024-01-19 Fri 14:00]
CLOCK: [2024-01-18 Thu 10:00]--[2024-01-18 Thu 12:00] =>  2:00
CLOCK: [2024-01-18 Thu 13:00]--[2024-01-18 Thu 16:00] =>  3:00
CLOCK: [2024-01-17 Wed 09:00]--[2024-01-17 Wed 11:30] =>  2:30
CLOCK: [2024-01-17 Wed 14:00]--[2024-01-17 Wed 17:00] =>  3:00
CLOCK: [2024-01-16 Tue 10:30]--[2024-01-16 Tue 12:00] =>  1:30
CLOCK: [2024-01-16 Tue 13:30]--[2024-01-16 Tue 16:00] =>  2:30
- State "TODO"       from              [2024-01-15 Mon 09:00]
:END:`,
  },
  parameters: {
    docs: {
      description: {
        story: "Tests performance with many logbook entries (12 entries with mixed types)",
      },
    },
  },
};

// Error handling examples
export const InvalidContent = {
  args: { content: "", className: "" },
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Invalid Logbook Content</h3>
        <p className="text-gray-600 text-sm mb-4">
          These examples show how the component handles malformed or invalid content gracefully:
        </p>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Empty Content</h4>
        <LogbookDisplay content="" />
        <p className="text-xs text-gray-500 mt-1">No content - should render nothing</p>
      </div>

      <div>
        <h4 className="font-medium mb-2">No Logbook Block</h4>
        <LogbookDisplay content="Just some regular text without logbook" />
        <p className="text-xs text-gray-500 mt-1">No logbook markers - should render nothing</p>
      </div>

      <div>
        <h4 className="font-medium mb-2">Invalid Logbook Format</h4>
        <LogbookDisplay content=":LOGBOOK:\nSome invalid content\n:END:" />
        <p className="text-xs text-gray-500 mt-1">Invalid entries - should render empty logbook</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates how the component handles various invalid or malformed content",
      },
    },
  },
};