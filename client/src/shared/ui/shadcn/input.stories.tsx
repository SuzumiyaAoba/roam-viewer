import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './input'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A styled input component built with Tailwind CSS. Supports all standard HTML input types and attributes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'tel', 'url', 'search', 'file'],
      description: 'The type of input field',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the input is read-only',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const WithValue: Story = {
  args: {
    value: 'Hello World',
    placeholder: 'Enter text...',
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
    value: 'secretpassword',
  },
}

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter email...',
    value: 'user@example.com',
  },
}

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter number...',
    value: '42',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
    value: 'Cannot edit this',
  },
}

export const Required: Story = {
  args: {
    required: true,
    placeholder: 'Required field*',
  },
}

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    value: 'Read-only value',
    placeholder: 'Cannot edit this',
  },
}

export const WithError: Story = {
  args: {
    placeholder: 'Enter text...',
    className: 'border-red-500 focus:ring-red-500',
    value: 'Invalid input',
  },
}

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
}

export const File: Story = {
  args: {
    type: 'file',
    accept: '.jpg,.png,.gif',
  },
}

export const WithCustomStyling: Story = {
  args: {
    placeholder: 'Custom styled input',
    className: 'bg-blue-50 border-blue-300 focus:ring-blue-500',
  },
}

// Example showing all states in a form
export const FormExample: Story = {
  render: () => (
    <div className="space-y-4 p-6 max-w-md">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <Input id="name" type="text" placeholder="Enter your full name" required />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <Input id="email" type="email" placeholder="your.email@example.com" required />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <Input id="password" type="password" placeholder="Enter secure password" required />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Phone (Optional)
        </label>
        <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
          Website
        </label>
        <Input id="website" type="url" placeholder="https://example.com" />
      </div>
    </div>
  ),
}
