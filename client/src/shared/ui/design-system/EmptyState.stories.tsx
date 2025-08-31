import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import {
  EmptyState,
  EmptyStateError,
  EmptyStateLoading,
  EmptyStateNoNodes,
  EmptyStateNoResults,
  EmptyStateOffline,
} from "./EmptyState";

const meta = {
  title: "Design System/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A flexible empty state component for displaying when there's no data, errors, or loading states. Includes predefined variants for common scenarios and support for custom illustrations.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "muted", "accent"],
      description: "The visual variant of the empty state",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "default", "lg"],
      description: "The size of the empty state",
    },
    title: {
      control: "text",
      description: "Main title text",
    },
    description: {
      control: "text",
      description: "Description text",
    },
    icon: {
      control: "text",
      description: "Icon to display (emoji or custom element)",
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic examples
export const Default: Story = {
  args: {
    icon: "📄",
    title: "No items found",
    description: "There are no items to display at the moment.",
  },
};

export const WithAction: Story = {
  args: {
    icon: "➕",
    title: "Get started",
    description: "Create your first item to get started.",
    action: {
      label: "Create Item",
      onClick: () => alert("Create item clicked"),
    },
  },
};

export const WithTwoActions: Story = {
  args: {
    icon: "🔍",
    title: "No search results",
    description: "We couldn't find any results for your search.",
    action: {
      label: "Clear Search",
      onClick: () => alert("Clear search clicked"),
    },
    secondaryAction: {
      label: "Browse All",
      onClick: () => alert("Browse all clicked"),
      variant: "outline",
    },
  },
};

// Variants
export const Muted: Story = {
  args: {
    variant: "muted",
    icon: "🌫️",
    title: "Nothing here yet",
    description: "This section is empty but will be populated soon.",
  },
};

export const Accent: Story = {
  args: {
    variant: "accent",
    icon: "⭐",
    title: "Featured content",
    description: "Special content will appear here when available.",
  },
};

// Sizes
export const Small: Story = {
  args: {
    size: "sm",
    icon: "📋",
    title: "Empty list",
    description: "No items in this list.",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    icon: "🎯",
    title: "Welcome to your dashboard",
    description:
      "This is where you'll see your important information once you start using the application.",
    action: {
      label: "Get Started",
      onClick: () => alert("Get started clicked"),
    },
  },
};

// Custom illustration
export const WithCustomIllustration: Story = {
  args: {
    title: "Custom illustration",
    description: "This empty state uses a custom SVG illustration.",
    illustration: (
      <div className="mb-6">
        <svg
          className="w-32 h-32 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={0.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
    ),
    action: {
      label: "Create Document",
      onClick: () => alert("Create document clicked"),
    },
  },
};

// Predefined variants
export const NoResults: Story = {
  render: () => (
    <EmptyStateNoResults
      searchQuery="react components"
      action={{
        label: "Clear Search",
        onClick: () => alert("Clear search clicked"),
        variant: "outline",
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Predefined empty state for no search results",
      },
    },
  },
};

export const NoNodes: Story = {
  render: () => (
    <EmptyStateNoNodes
      action={{
        label: "Create First Node",
        onClick: () => alert("Create first node clicked"),
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Predefined empty state for when there are no nodes",
      },
    },
  },
};

export const ErrorState: Story = {
  render: () => (
    <EmptyStateError
      error="Failed to load data from the server."
      action={{
        label: "Try Again",
        onClick: () => alert("Try again clicked"),
        variant: "outline",
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Predefined empty state for error scenarios",
      },
    },
  },
};

export const LoadingState: Story = {
  render: () => <EmptyStateLoading />,
  parameters: {
    docs: {
      description: {
        story: "Predefined empty state for loading scenarios",
      },
    },
  },
};

export const OfflineState: Story = {
  render: () => (
    <EmptyStateOffline
      action={{
        label: "Retry",
        onClick: () => alert("Retry clicked"),
        variant: "outline",
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Predefined empty state for offline scenarios",
      },
    },
  },
};

// Real-world examples
export const RoamWebExamples: Story = {
  render: () => (
    <div className="space-y-12">
      {/* No nodes scenario */}
      <div className="border rounded-lg p-8">
        <h3 className="text-lg font-semibold mb-4">No Nodes Scenario</h3>
        <EmptyStateNoNodes
          action={{
            label: "Create Your First Node",
            onClick: () => alert("Navigate to create node"),
          }}
        />
      </div>

      {/* Search results */}
      <div className="border rounded-lg p-8">
        <h3 className="text-lg font-semibold mb-4">No Search Results</h3>
        <EmptyStateNoResults
          searchQuery="machine learning"
          action={{
            label: "Clear Search",
            onClick: () => alert("Clear search"),
            variant: "outline",
          }}
          secondaryAction={{
            label: "Browse All Nodes",
            onClick: () => alert("Browse all"),
            variant: "ghost",
          }}
        />
      </div>

      {/* Server error */}
      <div className="border rounded-lg p-8">
        <h3 className="text-lg font-semibold mb-4">Server Error</h3>
        <EmptyStateError
          error="Unable to connect to the Roam Web server. Please check if the server is running on port 3000."
          action={{
            label: "Retry Connection",
            onClick: () => alert("Retry connection"),
            variant: "outline",
          }}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Real-world examples of how empty states might be used in the Roam Web application",
      },
    },
  },
};

// Dashboard scenarios
export const DashboardScenarios: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Recent nodes */}
      <div className="border rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-4">RECENT NODES</h3>
        <EmptyState
          size="sm"
          icon="📝"
          title="No recent nodes"
          description="Nodes you've recently viewed or edited will appear here."
        />
      </div>

      {/* Favorites */}
      <div className="border rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-4">FAVORITES</h3>
        <EmptyState
          size="sm"
          icon="⭐"
          title="No favorites yet"
          description="Star nodes to add them to your favorites."
        />
      </div>

      {/* Tags */}
      <div className="border rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-4">POPULAR TAGS</h3>
        <EmptyState
          size="sm"
          icon="🏷️"
          title="No tags found"
          description="Create nodes with tags to see them here."
        />
      </div>

      {/* Backlinks */}
      <div className="border rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-4">BACKLINKS</h3>
        <EmptyState
          size="sm"
          icon="🔗"
          title="No backlinks"
          description="References to this node will appear here."
        />
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Dashboard widget scenarios with compact empty states",
      },
    },
  },
};

// Custom content
export const WithCustomContent: Story = {
  render: () => (
    <EmptyState
      icon="🎨"
      title="Customize your experience"
      description="Make this space your own with custom settings."
    >
      <div className="bg-gray-50 rounded-lg p-4 max-w-sm">
        <h4 className="font-medium text-gray-900 mb-2">Quick Setup</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Connect your data source
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
            Configure preferences
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
            Invite team members
          </li>
        </ul>
      </div>
    </EmptyState>
  ),
  parameters: {
    docs: {
      description: {
        story: "Empty state with custom content children",
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Variants</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Default</h4>
            <EmptyState
              size="sm"
              icon="📄"
              title="Default variant"
              description="Standard empty state styling."
            />
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Muted</h4>
            <EmptyState
              size="sm"
              variant="muted"
              icon="🌫️"
              title="Muted variant"
              description="Subtle, less prominent styling."
            />
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Accent</h4>
            <EmptyState
              size="sm"
              variant="accent"
              icon="⭐"
              title="Accent variant"
              description="Highlighted for special content."
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Sizes</h3>
        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Small</h4>
            <EmptyState
              size="sm"
              icon="📋"
              title="Small size"
              description="Compact for tight spaces."
            />
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Default</h4>
            <EmptyState
              icon="📄"
              title="Default size"
              description="Standard sizing for most use cases."
            />
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Large</h4>
            <EmptyState
              size="lg"
              icon="🎯"
              title="Large size"
              description="Spacious for hero sections and important messages."
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Overview of all available empty state variants and sizes",
      },
    },
  },
};
