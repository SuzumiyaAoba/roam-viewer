import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Checkbox } from './Checkbox'

const meta = {
  title: 'Design System/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A checkbox component for binary choices. Supports different sizes, labels, descriptions, and indeterminate state.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg'],
      description: 'The size of the checkbox'
    },
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled'
    },
    indeterminate: {
      control: 'boolean',
      description: 'Whether the checkbox is in indeterminate state'
    },
    label: {
      control: 'text',
      description: 'The label text for the checkbox'
    },
    description: {
      control: 'text',
      description: 'Additional description text'
    }
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

// Basic states
export const Default: Story = {
  args: {},
}

export const Checked: Story = {
  args: {
    checked: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    checked: true,
  },
}

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
}

// With labels
export const WithLabel: Story = {
  args: {
    label: 'Accept terms and conditions',
    id: 'terms',
  },
}

export const WithLabelAndDescription: Story = {
  args: {
    label: 'Enable notifications',
    description: 'Get notified when someone mentions you in a comment.',
    id: 'notifications',
  },
}

export const WithLongText: Story = {
  args: {
    label: 'I agree to the Terms of Service and Privacy Policy',
    description: 'By checking this box, you acknowledge that you have read and understand our Terms of Service and Privacy Policy.',
    id: 'agreement',
  },
  parameters: {
    layout: 'padded',
  },
}

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Small checkbox',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Large checkbox',
  },
}

// Interactive example
export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(false)
    
    return (
      <div className="space-y-4">
        <Checkbox 
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          label="Interactive checkbox"
          description="This checkbox state is managed by React"
        />
        <p className="text-sm text-gray-600">
          Current state: {checked ? 'Checked' : 'Unchecked'}
        </p>
      </div>
    )
  },
}

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Checkbox Sizes</h4>
        
        <div className="space-y-3">
          <Checkbox size="sm" label="Small checkbox" />
          <Checkbox size="default" label="Default checkbox" />
          <Checkbox size="lg" label="Large checkbox" />
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Checked States</h4>
        
        <div className="space-y-3">
          <Checkbox size="sm" checked label="Small checked" />
          <Checkbox size="default" checked label="Default checked" />
          <Checkbox size="lg" checked label="Large checked" />
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Indeterminate States</h4>
        
        <div className="space-y-3">
          <Checkbox size="sm" indeterminate label="Small indeterminate" />
          <Checkbox size="default" indeterminate label="Default indeterminate" />
          <Checkbox size="lg" indeterminate label="Large indeterminate" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Showcase of all checkbox sizes and states'
      }
    }
  },
}