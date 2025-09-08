import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Button } from "./Button";
import { Loading, LoadingButton, Spinner } from "./Spinner";

const meta = {
  title: "Design System/Spinner & Loading",
  component: Spinner,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Loading indicators including spinners, loading states, and loading buttons for showing progress and async operations.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "default", "lg", "xl", "2xl"],
      description: "The size of the spinner",
    },
    variant: {
      control: { type: "select" },
      options: ["default", "primary", "secondary", "success", "warning", "destructive", "white"],
      description: "The color variant of the spinner",
    },
    label: {
      control: "text",
      description: "Accessible label for screen readers",
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Spinner
export const DefaultSpinner: Story = {
  args: {},
};

export const PrimarySpinner: Story = {
  args: {
    variant: "primary",
  },
};

export const LargeSpinner: Story = {
  args: {
    size: "xl",
    variant: "primary",
  },
};

// All sizes
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-6">
      <div className="text-center">
        <Spinner size="xs" variant="primary" />
        <p className="text-xs text-gray-500 mt-2">XS</p>
      </div>
      <div className="text-center">
        <Spinner size="sm" variant="primary" />
        <p className="text-xs text-gray-500 mt-2">SM</p>
      </div>
      <div className="text-center">
        <Spinner size="default" variant="primary" />
        <p className="text-xs text-gray-500 mt-2">Default</p>
      </div>
      <div className="text-center">
        <Spinner size="lg" variant="primary" />
        <p className="text-xs text-gray-500 mt-2">LG</p>
      </div>
      <div className="text-center">
        <Spinner size="xl" variant="primary" />
        <p className="text-xs text-gray-500 mt-2">XL</p>
      </div>
      <div className="text-center">
        <Spinner size="2xl" variant="primary" />
        <p className="text-xs text-gray-500 mt-2">2XL</p>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "All available spinner sizes",
      },
    },
  },
};

// All variants
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-6 p-6">
      <div className="text-center">
        <Spinner variant="default" />
        <p className="text-xs text-gray-500 mt-2">Default</p>
      </div>
      <div className="text-center">
        <Spinner variant="primary" />
        <p className="text-xs text-gray-500 mt-2">Primary</p>
      </div>
      <div className="text-center">
        <Spinner variant="secondary" />
        <p className="text-xs text-gray-500 mt-2">Secondary</p>
      </div>
      <div className="text-center">
        <Spinner variant="success" />
        <p className="text-xs text-gray-500 mt-2">Success</p>
      </div>
      <div className="text-center">
        <Spinner variant="warning" />
        <p className="text-xs text-gray-500 mt-2">Warning</p>
      </div>
      <div className="text-center">
        <Spinner variant="destructive" />
        <p className="text-xs text-gray-500 mt-2">Destructive</p>
      </div>
      <div className="text-center bg-gray-800 p-4 rounded">
        <Spinner variant="white" />
        <p className="text-xs text-white mt-2">White</p>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "All available spinner color variants",
      },
    },
  },
};

// Loading Component
export const BasicLoading: Story = {
  render: () => <Loading text="Loading content..." />,
  parameters: {
    docs: {
      description: {
        story: "Basic loading component with text",
      },
    },
  },
};

export const LoadingWithoutText: Story = {
  render: () => <Loading text="" />,
  parameters: {
    docs: {
      description: {
        story: "Loading component without text",
      },
    },
  },
};

export const LoadingOverlay: Story = {
  render: () => (
    <Loading overlay text="Saving changes..." className="h-64 w-full">
      <div className="p-6 bg-gray-50 rounded-lg h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Content Area</h3>
          <p className="text-gray-600">This content is covered by the loading overlay.</p>
        </div>
      </div>
    </Loading>
  ),
  parameters: {
    docs: {
      description: {
        story: "Loading overlay that covers existing content",
      },
    },
  },
};

// Loading Button
export const LoadingButtonStory: Story = {
  render: () => {
    const [loading, setLoading] = React.useState(false);

    const handleClick = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    };

    return (
      <div className="space-y-4">
        <LoadingButton loading={loading} onClick={handleClick} loadingText="Saving...">
          Save Changes
        </LoadingButton>

        <p className="text-sm text-gray-600">Click the button to see the loading state</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive loading button that shows spinner when active",
      },
    },
  },
};

export const LoadingButtonVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-x-2">
        <LoadingButton loading>Default Loading</LoadingButton>
        <LoadingButton loading className="bg-green-600 hover:bg-green-700">
          Success Loading
        </LoadingButton>
        <LoadingButton loading className="bg-red-600 hover:bg-red-700">
          Error Loading
        </LoadingButton>
      </div>

      <div className="space-x-2">
        <LoadingButton>Not Loading</LoadingButton>
        <LoadingButton className="bg-green-600 hover:bg-green-700">Success Button</LoadingButton>
        <LoadingButton className="bg-red-600 hover:bg-red-700">Error Button</LoadingButton>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Loading buttons in different states and colors",
      },
    },
  },
};

// Interactive examples
export const DataFetching: Story = {
  render: () => {
    const [loading, setLoading] = React.useState(true);
    const [data, setData] = React.useState<Array<{ id: number; name: string; email: string }> | null>(null);

    const fetchData = React.useCallback(() => {
      setLoading(true);
      setData(null);
      setTimeout(() => {
        setData([
          { id: 1, name: "John Doe", email: "john@example.com" },
          { id: 2, name: "Jane Smith", email: "jane@example.com" },
          { id: 3, name: "Bob Johnson", email: "bob@example.com" },
        ]);
        setLoading(false);
      }, 2000);
    }, []);

    React.useEffect(() => {
      fetchData();
    }, [fetchData]);

    return (
      <div className="max-w-md border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Users</h3>
            <Button onClick={fetchData} size="sm" variant="outline" disabled={loading}>
              {loading ? <Spinner size="xs" className="mr-1" /> : null}
              Refresh
            </Button>
          </div>
        </div>

        <div className="min-h-48">
          {loading ? (
            <Loading text="Loading users..." className="h-48" />
          ) : (
            <div className="p-4 space-y-3">
              {data?.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Data fetching with loading states and refresh functionality",
      },
    },
  },
};
