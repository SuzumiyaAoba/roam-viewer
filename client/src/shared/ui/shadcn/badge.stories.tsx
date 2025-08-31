import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile badge component for displaying status, categories, or other metadata. Supports multiple variants and sizes.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
      description: "The visual style variant of the badge",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
    children: {
      control: "text",
      description: "The content of the badge",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

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

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
};

// Show all variants together
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

// Status badges
export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Active</Badge>
      <Badge variant="secondary">Pending</Badge>
      <Badge variant="destructive">Failed</Badge>
      <Badge variant="outline">Draft</Badge>
    </div>
  ),
};

// Count badges
export const CountBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="relative">
        <button className="bg-blue-600 text-white px-3 py-2 rounded">Messages</button>
        <Badge className="absolute -top-2 -right-2">3</Badge>
      </div>

      <div className="relative">
        <button className="bg-green-600 text-white px-3 py-2 rounded">Notifications</button>
        <Badge variant="destructive" className="absolute -top-2 -right-2">
          12
        </Badge>
      </div>

      <div className="relative">
        <button className="bg-purple-600 text-white px-3 py-2 rounded">Updates</button>
        <Badge variant="secondary" className="absolute -top-2 -right-2">
          99+
        </Badge>
      </div>
    </div>
  ),
};

// Interactive badges
export const InteractiveBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge
        className="cursor-pointer hover:bg-primary/80 transition-colors"
        onClick={() => alert("Default badge clicked!")}
      >
        Click me
      </Badge>
      <Badge
        variant="secondary"
        className="cursor-pointer hover:bg-secondary/80 transition-colors"
        onClick={() => alert("Secondary badge clicked!")}
      >
        Clickable
      </Badge>
      <Badge
        variant="outline"
        className="cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => alert("Outline badge clicked!")}
      >
        Interactive
      </Badge>
    </div>
  ),
};

// Tags example
export const TagsExample: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Article Tags</h3>
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary">React</Badge>
          <Badge variant="secondary">TypeScript</Badge>
          <Badge variant="secondary">JavaScript</Badge>
          <Badge variant="secondary">Frontend</Badge>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Priority Levels</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="destructive">High</Badge>
          <Badge variant="default">Medium</Badge>
          <Badge variant="outline">Low</Badge>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline">Design</Badge>
          <Badge variant="outline">Development</Badge>
          <Badge variant="outline">Marketing</Badge>
          <Badge variant="outline">Sales</Badge>
        </div>
      </div>
    </div>
  ),
};

// With icons
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default" className="flex items-center gap-1">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        Completed
      </Badge>

      <Badge variant="destructive" className="flex items-center gap-1">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
        Failed
      </Badge>

      <Badge variant="secondary" className="flex items-center gap-1">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
        Pending
      </Badge>
    </div>
  ),
};

// Sizes example
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 items-center">
      <Badge className="text-xs px-1.5 py-0.5">Extra Small</Badge>
      <Badge>Default Size</Badge>
      <Badge className="text-sm px-3 py-1">Large</Badge>
      <Badge className="text-base px-4 py-2">Extra Large</Badge>
    </div>
  ),
};

// Custom styling
export const CustomStyling: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">Gradient</Badge>
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Warning</Badge>
      <Badge className="bg-green-100 text-green-800 border-green-300">Success</Badge>
      <Badge className="bg-gray-900 text-white">Dark</Badge>
    </div>
  ),
};
