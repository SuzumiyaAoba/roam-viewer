import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A styled textarea component built with Tailwind CSS. Perfect for multiline text input with automatic resizing and consistent styling.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      description: "Placeholder text for the textarea",
    },
    disabled: {
      control: "boolean",
      description: "Whether the textarea is disabled",
    },
    required: {
      control: "boolean",
      description: "Whether the textarea is required",
    },
    readOnly: {
      control: "boolean",
      description: "Whether the textarea is read-only",
    },
    rows: {
      control: "number",
      description: "Number of visible text lines",
    },
    cols: {
      control: "number",
      description: "Number of visible character widths",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter your message...",
  },
};

export const WithValue: Story = {
  args: {
    value:
      "This is a sample text that spans multiple lines.\n\nIt demonstrates how the textarea component handles multiline content with proper spacing and formatting.",
    placeholder: "Enter your message...",
  },
};

export const Small: Story = {
  args: {
    rows: 3,
    placeholder: "Short message...",
  },
};

export const Large: Story = {
  args: {
    rows: 10,
    placeholder: "Long form content...",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "This textarea is disabled and cannot be edited.",
    placeholder: "Disabled textarea",
  },
};

export const Required: Story = {
  args: {
    required: true,
    placeholder: "This field is required*",
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    value: "This is read-only content that cannot be modified by the user.",
    rows: 4,
  },
};

export const WithError: Story = {
  args: {
    placeholder: "Enter text...",
    className: "border-red-500 focus:ring-red-500",
    value: "This content has validation errors",
  },
};

export const WithSuccess: Story = {
  args: {
    placeholder: "Enter text...",
    className: "border-green-500 focus:ring-green-500",
    value: "This content is valid!",
  },
};

export const Resizable: Story = {
  args: {
    placeholder: "This textarea can be resized...",
    style: { resize: "vertical" },
    rows: 4,
  },
};

export const NonResizable: Story = {
  args: {
    placeholder: "This textarea cannot be resized...",
    style: { resize: "none" },
    rows: 4,
  },
};

// Example showing different use cases
export const FormExample: Story = {
  render: () => {
    const descriptionId = `description-${Math.random().toString(36).slice(2)}`;
    const feedbackId = `feedback-${Math.random().toString(36).slice(2)}`;
    const codeId = `code-${Math.random().toString(36).slice(2)}`;
    const notesId = `notes-${Math.random().toString(36).slice(2)}`;

    return (
      <div className="space-y-6 p-6 max-w-2xl">
        <div>
          <label htmlFor={descriptionId} className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <Textarea id={descriptionId} placeholder="Provide a detailed description..." rows={4} />
          <p className="text-xs text-gray-500 mt-1">Maximum 500 characters</p>
        </div>

        <div>
          <label htmlFor={feedbackId} className="block text-sm font-medium text-gray-700 mb-2">
            Feedback
          </label>
          <Textarea id={feedbackId} placeholder="Share your thoughts and suggestions..." rows={6} />
        </div>

        <div>
          <label htmlFor={codeId} className="block text-sm font-medium text-gray-700 mb-2">
            Code Snippet
          </label>
          <Textarea
            id={codeId}
            placeholder="Paste your code here..."
            className="font-mono text-sm"
            rows={8}
            spellCheck={false}
          />
        </div>

        <div>
          <label htmlFor={notesId} className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <Textarea
            id={notesId}
            placeholder="Any additional information..."
            rows={3}
            style={{ resize: "vertical" }}
          />
        </div>
      </div>
    );
  },
};

export const ChatExample: Story = {
  render: () => (
    <div className="max-w-lg border rounded-lg p-4">
      <div className="mb-4">
        <div className="bg-gray-100 rounded-lg p-3 mb-2">
          <p className="text-sm">Previous message in the conversation...</p>
        </div>
        <div className="bg-blue-100 rounded-lg p-3 ml-8">
          <p className="text-sm">Your reply goes here</p>
        </div>
      </div>

      <div className="flex items-end space-x-2">
        <Textarea
          placeholder="Type your message..."
          rows={3}
          className="flex-1"
          style={{ resize: "none" }}
        />
        <button
          type="button"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  ),
};
