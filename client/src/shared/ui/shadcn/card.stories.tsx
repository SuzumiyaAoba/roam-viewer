import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A flexible card component with composable parts including header, title, description, content, and footer. Perfect for displaying organized content with consistent styling.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>
          Card description goes here. This provides additional context about the card content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          This is the main content area of the card. You can put any content here including text,
          images, forms, or other components.
        </p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card with Footer</CardTitle>
        <CardDescription>This card includes a footer with action buttons.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          This card demonstrates how to use the footer component for actions or additional
          information.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <button type="button" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
          Cancel
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Confirm
        </button>
      </CardFooter>
    </Card>
  ),
};

export const SimpleCard: Story = {
  render: () => (
    <Card className="w-80 p-6">
      <h3 className="text-lg font-semibold mb-2">Simple Card</h3>
      <p className="text-gray-600">
        This is a simple card that only uses the base Card component without the composable parts.
      </p>
    </Card>
  ),
};

export const ProductCard: Story = {
  render: () => (
    <Card className="w-80">
      <div className="aspect-video bg-gray-200 rounded-t-xl flex items-center justify-center">
        <span className="text-gray-500">Product Image</span>
      </div>
      <CardHeader>
        <CardTitle>Wireless Headphones</CardTitle>
        <CardDescription>
          Premium quality wireless headphones with noise cancellation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">$299</span>
          <span className="text-sm text-gray-500 line-through">$399</span>
        </div>
        <div className="flex items-center mt-2">
          <div className="flex text-yellow-400">{"★".repeat(5)}</div>
          <span className="text-sm text-gray-600 ml-2">(124 reviews)</span>
        </div>
      </CardContent>
      <CardFooter>
        <button
          type="button"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Add to Cart
        </button>
      </CardFooter>
    </Card>
  ),
};

export const ProfileCard: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader className="text-center">
        <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-gray-600 text-2xl">👤</span>
        </div>
        <CardTitle>John Doe</CardTitle>
        <CardDescription>Senior Software Engineer</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Department:</span>
            <span>Engineering</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Location:</span>
            <span>San Francisco, CA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Joined:</span>
            <span>January 2022</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex space-x-2">
        <button
          type="button"
          className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Contact
        </button>
        <button
          type="button"
          className="flex-1 border border-gray-300 py-2 rounded-md hover:bg-gray-50"
        >
          View Profile
        </button>
      </CardFooter>
    </Card>
  ),
};

export const StatCard: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <svg
            className="h-4 w-4 text-gray-600"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <title>Revenue icon</title>
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$45,231.89</div>
          <p className="text-xs text-gray-600">+20.1% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
          <svg
            className="h-4 w-4 text-gray-600"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <title>Subscriptions icon</title>
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+2350</div>
          <p className="text-xs text-gray-600">+180.1% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Now</CardTitle>
          <svg
            className="h-4 w-4 text-gray-600"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <title>Active users icon</title>
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+573</div>
          <p className="text-xs text-gray-600">+201 since last hour</p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const FormCard: Story = {
  render: () => {
    const fullNameId = `fullname-${Math.random().toString(36).slice(2)}`;
    const emailId = `email-${Math.random().toString(36).slice(2)}`;
    const passwordId = `password-${Math.random().toString(36).slice(2)}`;

    return (
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Enter your information below to create your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor={fullNameId} className="text-sm font-medium">
              Full Name
            </label>
            <input
              id={fullNameId}
              type="text"
              placeholder="John Doe"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor={emailId} className="text-sm font-medium">
              Email
            </label>
            <input
              id={emailId}
              type="email"
              placeholder="john@example.com"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor={passwordId} className="text-sm font-medium">
              Password
            </label>
            <input
              id={passwordId}
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <button
            type="button"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Create Account
          </button>
          <p className="text-xs text-center text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              className="text-blue-600 hover:underline bg-transparent border-none p-0"
            >
              Sign in
            </button>
          </p>
        </CardFooter>
      </Card>
    );
  },
};

export const NotificationCard: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <CardTitle className="text-base">New message</CardTitle>
          <span className="text-xs text-gray-500 ml-auto">2 min ago</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          You have a new message from Sarah Wilson about the project timeline.
        </p>
      </CardContent>
      <CardFooter className="flex space-x-2">
        <button type="button" className="text-sm text-blue-600 hover:text-blue-800">
          View Message
        </button>
        <button type="button" className="text-sm text-gray-600 hover:text-gray-800">
          Mark as Read
        </button>
      </CardFooter>
    </Card>
  ),
};

export const CompositionExample: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Minimal card */}
      <Card className="p-6">
        <h3 className="font-semibold mb-2">Minimal Card</h3>
        <p className="text-gray-600 text-sm">Just content, no header or footer.</p>
      </Card>

      {/* Header only */}
      <Card>
        <CardHeader>
          <CardTitle>Header Only</CardTitle>
          <CardDescription>This card only has a header section.</CardDescription>
        </CardHeader>
      </Card>

      {/* Content only */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Content Only</h3>
          <p className="text-gray-600 text-sm">This card only has content, with custom padding.</p>
        </CardContent>
      </Card>

      {/* Footer only */}
      <Card>
        <CardFooter className="pt-6">
          <button type="button" className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-md">
            Footer Only
          </button>
        </CardFooter>
      </Card>
    </div>
  ),
};
