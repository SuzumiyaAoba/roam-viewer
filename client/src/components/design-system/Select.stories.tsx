import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Select, SelectLabel, SelectHelperText } from './Select'

const meta = {
  title: 'Design System/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A dropdown select component for choosing from a list of options. Supports keyboard navigation, validation states, and custom styling.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'error'],
      description: 'The variant of the select'
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg'],
      description: 'The size of the select'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the select is disabled'
    },
    required: {
      control: 'boolean',
      description: 'Whether the select is required'
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no option is selected'
    }
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

const basicOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
  { value: 'option4', label: 'Option 4' },
]

const countryOptions = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'au', label: 'Australia' },
]

// Basic examples
export const Default: Story = {
  args: {
    options: basicOptions,
    placeholder: 'Select an option...',
  },
}

export const WithValue: Story = {
  args: {
    options: basicOptions,
    value: 'option2',
    placeholder: 'Select an option...',
  },
}

export const WithDisabledOption: Story = {
  args: {
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2 (Disabled)', disabled: true },
      { value: 'option3', label: 'Option 3' },
      { value: 'option4', label: 'Option 4' },
    ],
    placeholder: 'Select an option...',
  },
}

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    options: basicOptions,
    placeholder: 'Small select...',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    options: basicOptions,
    placeholder: 'Large select...',
  },
}

// States
export const Disabled: Story = {
  args: {
    options: basicOptions,
    placeholder: 'Disabled select...',
    disabled: true,
  },
}

export const Error: Story = {
  args: {
    variant: 'error',
    options: basicOptions,
    placeholder: 'Select an option...',
  },
}

// With labels and helper text
export const WithLabel: Story = {
  render: (args) => (
    <div className="w-64">
      <SelectLabel htmlFor="select-with-label">Country</SelectLabel>
      <Select {...args} />
    </div>
  ),
  args: {
    options: countryOptions,
    placeholder: 'Select a country...',
  },
}

export const WithHelperText: Story = {
  render: () => (
    <div className="w-64">
      <SelectLabel htmlFor="select-with-helper">Priority Level</SelectLabel>
      <Select 
        options={[
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
          { value: 'critical', label: 'Critical' }
        ]}
        placeholder="Select priority..."
      />
      <SelectHelperText>Choose the appropriate priority level for this task.</SelectHelperText>
    </div>
  ),
}

export const WithError: Story = {
  render: () => (
    <div className="w-64">
      <SelectLabel htmlFor="select-error">Required Field</SelectLabel>
      <Select 
        variant="error"
        options={[
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
          { value: 'option3', label: 'Option 3' }
        ]}
        placeholder="Select an option..."
        required
      />
      <SelectHelperText error>This field is required.</SelectHelperText>
    </div>
  ),
}

// Interactive example
export const Interactive: Story = {
  render: () => {
    const [selectedValue, setSelectedValue] = React.useState('')
    
    return (
      <div className="space-y-4 w-64">
        <div>
          <SelectLabel>Interactive Select</SelectLabel>
          <Select 
            options={[
              { value: 'react', label: 'React' },
              { value: 'vue', label: 'Vue.js' },
              { value: 'angular', label: 'Angular' },
              { value: 'svelte', label: 'Svelte' }
            ]}
            value={selectedValue}
            onValueChange={setSelectedValue}
            placeholder="Choose a framework..."
          />
          <SelectHelperText>
            {selectedValue ? `You selected: ${selectedValue}` : 'No selection made yet'}
          </SelectHelperText>
        </div>
        
        {selectedValue && (
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              Selected value: <strong>{selectedValue}</strong>
            </p>
            <button 
              onClick={() => setSelectedValue('')}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800"
            >
              Clear selection
            </button>
          </div>
        )}
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive select with state management and feedback'
      }
    }
  },
}