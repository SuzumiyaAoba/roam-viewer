import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta = {
  title: "Design System/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile badge component for displaying status, categories, or short pieces of information. Supports various styles, sizes, and interactive features.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "secondary", "destructive", "success", "warning", "outline", "ghost"],
      description: "The visual variant of the badge",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "default", "lg"],
      description: "The size of the badge",
    },
    removable: {
      control: "boolean",
      description: "Whether the badge can be removed",
    },
    dot: {
      control: "boolean",
      description: "Whether to show a dot indicator",
    },
    children: {
      control: "text",
      description: "The content of the badge",
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Default: Story = {
  args: {
    children: "Badge",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Error",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    children: "Success",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: "Warning",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost",
  },
};

// Sizes
export const Small: Story = {
  args: {
    size: "sm",
    children: "Small",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large",
  },
};

// Interactive features
export const WithDot: Story = {
  args: {
    dot: true,
    children: "Online",
    variant: "success",
  },
};

export const WithStartIcon: Story = {
  args: {
    startIcon: "🏷️",
    children: "Tagged",
  },
};

export const WithEndIcon: Story = {
  args: {
    endIcon: "→",
    children: "Next",
  },
};

export const Removable: Story = {
  args: {
    removable: true,
    children: "Removable",
    onRemove: () => alert("Badge removed!"),
  },
};

export const RemovableWithIcon: Story = {
  args: {
    removable: true,
    startIcon: "🏷️",
    children: "Tag",
    onRemove: () => alert("Tag removed!"),
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-6">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="default" size="sm">
        Small
      </Badge>
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Overview of all available badge variants and sizes",
      },
    },
  },
};

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-6">
      <Badge size="sm">Small Badge</Badge>
      <Badge size="default">Default Badge</Badge>
      <Badge size="lg">Large Badge</Badge>
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Comparison of all available badge sizes",
      },
    },
  },
};
