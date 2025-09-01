import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import { Layout } from "./Layout";

const meta: Meta<typeof Layout> = {
  title: "Components/Layout",
  component: Layout,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The main layout component that provides the application structure with header, navigation, and content area. Includes responsive design and consistent spacing.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    title: {
      control: "text",
      description: "Page title displayed in the header",
    },
    children: {
      control: "text",
      description: "Content to be displayed in the main area",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Dashboard",
    children: "This is the main content area of the layout.",
  },
};

export const WithTitle: Story = {
  args: {
    title: "Node Management",
    children: (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Welcome to Node Management</h2>
          <p className="text-gray-600">
            This page demonstrates the layout with a custom title and structured content.
          </p>
        </div>
      </div>
    ),
  },
};

export const NoTitle: Story = {
  args: {
    children: (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Custom Page Title</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-gray-600">
            This layout doesn't use the built-in title prop, instead relying on custom content for
            the page title.
          </p>
        </div>
      </div>
    ),
  },
};

export const ContentExamples: Story = {
  args: {
    title: "Content Examples",
    children: (
      <div className="space-y-6">
        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg mb-2">Card 1</h3>
            <p className="text-gray-600">This is example content in a card format.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg mb-2">Card 2</h3>
            <p className="text-gray-600">Another card with different content.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg mb-2">Card 3</h3>
            <p className="text-gray-600">A third card completing the grid.</p>
          </div>
        </div>

        {/* Full-width content */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Full Width Content</h2>
          <div className="prose max-w-none">
            <p className="text-gray-600">
              This is a full-width content area that demonstrates how the layout handles different
              types of content structures. The layout provides consistent margins and spacing for
              optimal readability.
            </p>
            <ul className="text-gray-600">
              <li>Flexible content areas</li>
              <li>Consistent spacing and margins</li>
              <li>Responsive design patterns</li>
              <li>Semantic HTML structure</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
};

export const FormLayout: Story = {
  args: {
    title: "Settings",
    children: (
      <div className="max-w-2xl">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-6">User Settings</h2>

          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="form-firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name
                </label>
                <input
                  id="form-firstName"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label
                  htmlFor="form-lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name
                </label>
                <input
                  id="form-lastName"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="form-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="form-email"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john.doe@example.com"
              />
            </div>

            <div>
              <label htmlFor="form-bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="form-bio"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              >
                Save Changes
              </button>
              <button
                type="button"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    ),
  },
};

export const DataTable: Story = {
  args: {
    title: "Users",
    children: (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">User Management</h2>
          <p className="text-gray-600 text-sm mt-1">Manage user accounts and permissions</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
                { name: "Jane Smith", email: "jane@example.com", role: "Editor", status: "Active" },
                {
                  name: "Bob Johnson",
                  email: "bob@example.com",
                  role: "Viewer",
                  status: "Inactive",
                },
              ].map((user, _index) => (
                <tr key={user.email} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-600">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button type="button" className="text-blue-600 hover:text-blue-900">
                      Edit
                    </button>
                    <button type="button" className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
};

export const EmptyState: Story = {
  args: {
    title: "Projects",
    children: (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <title>Empty projects icon</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Get started by creating your first project. Projects help you organize your work and
          collaborate with others.
        </p>
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
        >
          Create Project
        </button>
      </div>
    ),
  },
};
