import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Radio, RadioGroup } from './Radio'

const meta = {
  title: 'Design System/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Radio buttons allow users to select a single option from a set of mutually exclusive options. Use RadioGroup to manage multiple radio buttons together.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg'],
      description: 'The size of the radio button'
    },
    checked: {
      control: 'boolean',
      description: 'Whether the radio button is checked'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the radio button is disabled'
    },
    label: {
      control: 'text',
      description: 'The label text for the radio button'
    },
    description: {
      control: 'text',
      description: 'Additional description text'
    }
  },
} satisfies Meta<typeof Radio>

export default meta
type Story = StoryObj<typeof meta>

// Basic states
export const Default: Story = {
  args: {
    name: 'example',
    value: 'option1',
  },
}

export const Checked: Story = {
  args: {
    name: 'example',
    value: 'option1',
    checked: true,
  },
}

export const Disabled: Story = {
  args: {
    name: 'example',
    value: 'option1',
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    name: 'example',
    value: 'option1',
    disabled: true,
    checked: true,
  },
}

// With labels
export const WithLabel: Story = {
  args: {
    name: 'example',
    value: 'option1',
    label: 'Option 1',
    id: 'option1',
  },
}

export const WithLabelAndDescription: Story = {
  args: {
    name: 'example',
    value: 'option1',
    label: 'Premium Plan',
    description: 'Get access to all premium features and priority support.',
    id: 'premium',
  },
}

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    name: 'example',
    value: 'option1',
    label: 'Small radio button',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    name: 'example',
    value: 'option1',
    label: 'Large radio button',
  },
}

// Radio Group examples
export const RadioGroupVertical: Story = {
  render: () => {
    const [value, setValue] = React.useState('option1')
    
    return (
      <RadioGroup value={value} onValueChange={setValue} name="vertical-group">
        <Radio value="option1" label="Option 1" description="This is the first option" />
        <Radio value="option2" label="Option 2" description="This is the second option" />
        <Radio value="option3" label="Option 3" description="This is the third option" />
      </RadioGroup>
    )
  },
}

export const RadioGroupHorizontal: Story = {
  render: () => {
    const [value, setValue] = React.useState('small')
    
    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Size</label>
        <RadioGroup 
          value={value} 
          onValueChange={setValue} 
          name="size-group"
          orientation="horizontal"
        >
          <Radio value="small" label="S" />
          <Radio value="medium" label="M" />
          <Radio value="large" label="L" />
          <Radio value="xlarge" label="XL" />
        </RadioGroup>
      </div>
    )
  },
}

// Interactive example
export const Interactive: Story = {
  render: () => {
    const [selectedValue, setSelectedValue] = React.useState('')
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose your preferred contact method
          </label>
          <RadioGroup 
            value={selectedValue} 
            onValueChange={setSelectedValue} 
            name="contact-method"
          >
            <Radio 
              value="email" 
              label="Email" 
              description="We'll send you updates via email" 
            />
            <Radio 
              value="sms" 
              label="SMS" 
              description="Get text message notifications" 
            />
            <Radio 
              value="phone" 
              label="Phone Call" 
              description="Receive important updates via phone" 
            />
            <Radio 
              value="none" 
              label="No Contact" 
              description="Don't contact me unless absolutely necessary" 
            />
          </RadioGroup>
        </div>
        
        {selectedValue && (
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              Selected: <strong>{selectedValue}</strong>
            </p>
          </div>
        )}
      </div>
    )
  },
}

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Radio Button Sizes</h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-700">Small</label>
            <div className="space-y-2">
              <Radio size="sm" name="small-group" value="option1" label="Small unchecked" />
              <Radio size="sm" name="small-group-2" value="option2" checked label="Small checked" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-700">Default</label>
            <div className="space-y-2">
              <Radio size="default" name="default-group" value="option1" label="Default unchecked" />
              <Radio size="default" name="default-group-2" value="option2" checked label="Default checked" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-700">Large</label>
            <div className="space-y-2">
              <Radio size="lg" name="large-group" value="option1" label="Large unchecked" />
              <Radio size="lg" name="large-group-2" value="option2" checked label="Large checked" />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Showcase of all radio button sizes in different states'
      }
    }
  },
}