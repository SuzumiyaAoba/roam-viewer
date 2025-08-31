import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Textarea, AutoTextarea, InlineTextarea } from './Textarea'

const meta = {
  title: 'Design System/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible textarea component with multiple variants, auto-resize functionality, character counting, and form validation states. Perfect for multi-line text input with enhanced user experience.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'filled', 'outlined', 'minimal', 'error', 'success'],
      description: 'The visual variant of the textarea'
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg'],
      description: 'The size of the textarea'
    },
    resize: {
      control: { type: 'select' },
      options: ['none', 'vertical', 'horizontal', 'both'],
      description: 'Resize behavior'
    },
    label: {
      control: 'text',
      description: 'Label for the textarea'
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below the textarea'
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text'
    },
    showCharCount: {
      control: 'boolean',
      description: 'Whether to show character count'
    },
    autoResize: {
      control: 'boolean',
      description: 'Auto-resize based on content'
    },
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

// Basic examples
export const Default: Story = {
  args: {
    placeholder: 'Enter your text here...',
    rows: 4,
  },
}

export const WithLabel: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter a detailed description...',
    rows: 4,
  },
}

export const WithHelperText: Story = {
  args: {
    label: 'Content',
    placeholder: 'Write your content...',
    helperText: 'Markdown formatting is supported',
    rows: 6,
  },
}

export const Required: Story = {
  args: {
    label: 'Message',
    placeholder: 'Enter your message...',
    required: true,
    helperText: 'This field is required',
    rows: 4,
  },
}

// Variants
export const Filled: Story = {
  args: {
    variant: 'filled',
    label: 'Notes',
    placeholder: 'Your notes...',
    rows: 4,
  },
}

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    label: 'Comments',
    placeholder: 'Add your comments...',
    rows: 4,
  },
}

export const Minimal: Story = {
  args: {
    variant: 'minimal',
    placeholder: 'Type here...',
    rows: 3,
  },
}

export const Error: Story = {
  args: {
    label: 'Feedback',
    placeholder: 'Please provide feedback...',
    errorMessage: 'Feedback is required and must be at least 10 characters long',
    value: 'Too short',
    rows: 4,
  },
}

export const Success: Story = {
  args: {
    label: 'Review',
    placeholder: 'Write your review...',
    successMessage: 'Review looks great!',
    value: 'This is an excellent product with great features and outstanding customer service.',
    rows: 4,
  },
}

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Quick Note',
    placeholder: 'Brief note...',
    rows: 3,
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Detailed Description',
    placeholder: 'Provide a comprehensive description...',
    rows: 6,
  },
}

// Character counting
export const WithCharCount: Story = {
  args: {
    label: 'Tweet',
    placeholder: 'What\'s happening?',
    showCharCount: true,
    maxLength: 280,
    rows: 4,
  },
}

export const CharCountOverLimit: Story = {
  render: () => {
    const [value, setValue] = useState('This is a very long message that exceeds the maximum character limit. It demonstrates how the component handles character count validation and displays warnings when limits are exceeded.')
    
    return (
      <Textarea
        label="Short Message"
        placeholder="Keep it brief..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        showCharCount
        maxLength={100}
        rows={4}
        helperText="Please keep your message under 100 characters"
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Textarea with character limit exceeded showing validation styling'
      }
    }
  },
}

// Auto-resize
export const AutoResize: Story = {
  render: () => (
    <AutoTextarea
      label="Auto-Resizing Content"
      placeholder="Start typing and watch the textarea grow..."
      helperText="This textarea automatically adjusts its height based on content"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Auto-resizing textarea that expands with content'
      }
    }
  },
}

export const InlineEditing: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Edit this content:</h3>
        <InlineTextarea
          defaultValue="This is editable content that looks like regular text but becomes an input when you focus on it."
          placeholder="Click to edit..."
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Minimal textarea for inline editing scenarios'
      }
    }
  },
}

// Controlled example
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('')
    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0
    
    return (
      <div className="space-y-4">
        <Textarea
          label="Article Content"
          placeholder="Write your article..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={8}
          showCharCount
          helperText={`Words: ${wordCount}`}
        />
        <div className="text-sm text-gray-600">
          Current value: <code>{value.substring(0, 50)}{value.length > 50 ? '...' : ''}</code>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Controlled textarea with external state management and word counting'
      }
    }
  },
}

// Resize options
export const ResizeOptions: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-2">No Resize</h4>
        <Textarea
          resize="none"
          placeholder="This textarea cannot be resized"
          rows={3}
        />
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Vertical Resize (Default)</h4>
        <Textarea
          resize="vertical"
          placeholder="This textarea can be resized vertically"
          rows={3}
        />
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Horizontal Resize</h4>
        <Textarea
          resize="horizontal"
          placeholder="This textarea can be resized horizontally"
          rows={3}
        />
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Both Directions</h4>
        <Textarea
          resize="both"
          placeholder="This textarea can be resized in both directions"
          rows={3}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different resize behavior options for the textarea'
      }
    }
  },
}

// Form examples
export const FormExample: Story = {
  render: () => (
    <div className="w-full max-w-2xl space-y-6">
      <h3 className="text-lg font-semibold">Contact Form</h3>
      
      <div className="grid gap-6">
        <Textarea
          label="Subject"
          placeholder="What is this about?"
          size="sm"
          rows={2}
          required
        />
        
        <Textarea
          label="Message"
          placeholder="Please describe your inquiry in detail..."
          helperText="Include as much relevant information as possible"
          rows={6}
          required
          showCharCount
          maxLength={1000}
        />
        
        <Textarea
          label="Additional Notes"
          placeholder="Any other information? (optional)"
          variant="filled"
          rows={3}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Example of textareas used in a contact form'
      }
    }
  },
}

// Node editing example
export const NodeEditingExample: Story = {
  render: () => (
    <div className="w-full max-w-4xl space-y-6">
      <h3 className="text-lg font-semibold">Node Editor</h3>
      
      <div className="space-y-6">
        <Textarea
          label="Title"
          placeholder="Node title..."
          size="sm"
          rows={1}
          variant="minimal"
          defaultValue="React Hooks Best Practices"
        />
        
        <Textarea
          label="Content"
          placeholder="Write your node content here..."
          rows={12}
          variant="outlined"
          showCharCount
          defaultValue={`# React Hooks Best Practices

Here are some key principles for using React Hooks effectively:

## 1. Rules of Hooks
- Only call hooks at the top level
- Only call hooks from React functions

## 2. Custom Hooks
- Extract component logic into custom hooks
- Share stateful logic between components

## 3. useEffect Optimization
- Include all dependencies in the dependency array
- Use cleanup functions for subscriptions`}
          helperText="Markdown formatting is supported"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Textarea
            label="Tags"
            placeholder="react, hooks, best-practices"
            size="sm"
            rows={2}
            helperText="Comma-separated tags"
          />
          
          <Textarea
            label="References"
            placeholder="Links or references..."
            size="sm"
            rows={2}
            helperText="External links and citations"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Example of how textareas might be used in the Roam Web node editor'
      }
    }
  },
}

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">Variants</h3>
        <div className="space-y-4">
          <Textarea
            variant="default"
            label="Default"
            placeholder="Default textarea style..."
            rows={3}
          />
          
          <Textarea
            variant="filled"
            label="Filled"
            placeholder="Filled textarea style..."
            rows={3}
          />
          
          <Textarea
            variant="outlined"
            label="Outlined"
            placeholder="Outlined textarea style..."
            rows={3}
          />
          
          <Textarea
            variant="minimal"
            label="Minimal"
            placeholder="Minimal textarea style..."
            rows={3}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">States</h3>
        <div className="space-y-4">
          <Textarea
            variant="error"
            label="Error State"
            placeholder="Invalid input..."
            errorMessage="This field contains errors"
            rows={3}
          />
          
          <Textarea
            variant="success"
            label="Success State"
            placeholder="Valid input..."
            successMessage="Input is valid"
            rows={3}
          />
          
          <Textarea
            label="Disabled"
            placeholder="Disabled textarea..."
            disabled
            rows={3}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Sizes</h3>
        <div className="space-y-4">
          <Textarea
            size="sm"
            label="Small"
            placeholder="Small textarea..."
            rows={2}
          />
          
          <Textarea
            size="default"
            label="Default Size"
            placeholder="Default size textarea..."
            rows={3}
          />
          
          <Textarea
            size="lg"
            label="Large"
            placeholder="Large textarea..."
            rows={4}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Overview of all available textarea variants, states, and sizes'
      }
    }
  },
}