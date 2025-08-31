import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { QuickSearch, SearchForm, type SearchSuggestion, SearchWithSuggestions } from './SearchForm'

const meta = {
  title: 'Design System/SearchForm',
  component: SearchForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A comprehensive search form component with multiple variants, suggestions support, and advanced features. Perfect for implementing search functionality with great user experience.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'elevated', 'minimal', 'prominent'],
      description: 'The visual variant of the search form',
    },
    inputVariant: {
      control: { type: 'select' },
      options: ['default', 'filled', 'outlined', 'minimal'],
      description: 'The input field variant style',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg'],
      description: 'The size of the search form',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the search input',
    },
    buttonText: {
      control: 'text',
      description: 'Text for the search button',
    },
    showButton: {
      control: 'boolean',
      description: 'Whether to show the search button',
    },
    showClearButton: {
      control: 'boolean',
      description: 'Whether to show clear button when input has value',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
} satisfies Meta<typeof SearchForm>

export default meta
type Story = StoryObj<typeof meta>

// Basic examples
export const Default: Story = {
  args: {
    placeholder: 'Search nodes...',
    onSubmit: (query) => alert(`Searching for: ${query}`),
  },
}

export const WithIcon: Story = {
  args: {
    placeholder: 'Search with icon...',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    onSubmit: (query) => alert(`Searching for: ${query}`),
  },
}

export const WithoutButton: Story = {
  args: {
    placeholder: 'Search without button...',
    showButton: false,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    onSubmit: (query) => alert(`Searching for: ${query}`),
  },
}

// Variants
export const Elevated: Story = {
  args: {
    variant: 'elevated',
    placeholder: 'Elevated search form...',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    onSubmit: (query) => alert(`Searching for: ${query}`),
  },
}

export const Prominent: Story = {
  args: {
    variant: 'prominent',
    size: 'lg',
    placeholder: 'Search everything...',
    buttonText: 'Find',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    onSubmit: (query) => alert(`Searching for: ${query}`),
  },
}

// Input variants
export const FilledInput: Story = {
  args: {
    inputVariant: 'filled',
    placeholder: 'Filled input style...',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    onSubmit: (query) => alert(`Searching for: ${query}`),
  },
}

export const OutlinedInput: Story = {
  args: {
    inputVariant: 'outlined',
    placeholder: 'Outlined input style...',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    onSubmit: (query) => alert(`Searching for: ${query}`),
  },
}

export const MinimalInput: Story = {
  args: {
    inputVariant: 'minimal',
    placeholder: 'Minimal input style...',
    showButton: false,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    onSubmit: (query) => alert(`Searching for: ${query}`),
  },
}

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    placeholder: 'Small search...',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    onSubmit: (query) => alert(`Searching for: ${query}`),
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    placeholder: 'Large search form...',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    onSubmit: (query) => alert(`Searching for: ${query}`),
  },
}

// States
export const Loading: Story = {
  args: {
    placeholder: 'Loading state...',
    loading: true,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    onSubmit: (query) => alert(`Searching for: ${query}`),
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled state...',
    disabled: true,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    onSubmit: (query) => alert(`Searching for: ${query}`),
  },
}

// QuickSearch component
export const QuickSearchExample: Story = {
  render: () => (
    <div className="w-80">
      <QuickSearch
        placeholder="Quick search nodes..."
        onSearch={(query) => alert(`Quick searching: ${query}`)}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'QuickSearch component for minimal search interfaces without a button',
      },
    },
  },
}

// Controlled example
export const ControlledExample: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('')

    return (
      <div className="w-80 space-y-4">
        <SearchForm
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Controlled search..."
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
          onSubmit={(query) => alert(`Searching for: ${query}`)}
        />
        <p className="text-sm text-gray-600">
          Current value: <code>{searchValue}</code>
        </p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Controlled search form example with external state management',
      },
    },
  },
}

// Search with suggestions
export const WithSuggestions: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('')

    const suggestions: SearchSuggestion[] = [
      {
        id: '1',
        text: 'React Components',
        category: 'Programming',
        icon: <span>⚛️</span>,
      },
      {
        id: '2',
        text: 'TypeScript Basics',
        category: 'Programming',
        icon: <span>📘</span>,
      },
      {
        id: '3',
        text: 'Design Systems',
        category: 'Design',
        icon: <span>🎨</span>,
      },
      {
        id: '4',
        text: 'Node.js Server',
        category: 'Backend',
        icon: <span>🖥️</span>,
      },
      {
        id: '5',
        text: 'Database Design',
        category: 'Data',
        icon: <span>🗄️</span>,
      },
      {
        id: '6',
        text: 'API Documentation',
        category: 'Documentation',
        icon: <span>📚</span>,
      },
    ]

    return (
      <div className="w-96">
        <SearchWithSuggestions
          value={searchValue}
          onChange={setSearchValue}
          suggestions={suggestions}
          placeholder="Search with suggestions..."
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
          onSubmit={(query) => alert(`Searching for: ${query}`)}
          onSuggestionSelect={(suggestion) => {
            alert(`Selected: ${suggestion.text}`)
          }}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Search form with dropdown suggestions and keyboard navigation',
      },
    },
  },
}

// Real-world examples
export const NodeSearchExample: Story = {
  render: () => (
    <div className="w-full max-w-2xl space-y-6">
      {/* Header Search */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Header Search</h3>
        <QuickSearch
          placeholder="Search nodes..."
          inputVariant="filled"
          size="sm"
          onSearch={(query) => alert(`Header search: ${query}`)}
        />
      </div>

      {/* Main Search */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Main Search</h3>
        <SearchForm
          variant="elevated"
          placeholder="Search your knowledge base..."
          buttonText="Find"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
          onSubmit={(query) => alert(`Main search: ${query}`)}
        />
      </div>

      {/* Hero Search */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Hero Search</h3>
        <SearchForm
          variant="prominent"
          size="lg"
          placeholder="What would you like to learn about?"
          buttonText="Explore"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
          onSubmit={(query) => alert(`Hero search: ${query}`)}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Examples of how search forms might be used in the Roam Web application',
      },
    },
  },
}

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">Form Variants</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default</label>
            <SearchForm
              placeholder="Default search form..."
              onSubmit={(query) => alert(`Search: ${query}`)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Elevated</label>
            <SearchForm
              variant="elevated"
              placeholder="Elevated search form..."
              onSubmit={(query) => alert(`Search: ${query}`)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prominent</label>
            <SearchForm
              variant="prominent"
              placeholder="Prominent search form..."
              onSubmit={(query) => alert(`Search: ${query}`)}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Input Variants</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Input</label>
            <SearchForm
              inputVariant="default"
              placeholder="Default input..."
              onSubmit={(query) => alert(`Search: ${query}`)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filled Input</label>
            <SearchForm
              inputVariant="filled"
              placeholder="Filled input..."
              onSubmit={(query) => alert(`Search: ${query}`)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Outlined Input</label>
            <SearchForm
              inputVariant="outlined"
              placeholder="Outlined input..."
              onSubmit={(query) => alert(`Search: ${query}`)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimal Input</label>
            <SearchForm
              inputVariant="minimal"
              placeholder="Minimal input..."
              showButton={false}
              onSubmit={(query) => alert(`Search: ${query}`)}
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Overview of all available search form variants',
      },
    },
  },
}

// Height alignment test - to verify button and input alignment
export const HeightAlignmentTest: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-4xl">
      <h3 className="text-lg font-semibold">Height Alignment Test</h3>
      <div className="text-sm text-gray-600 mb-6">
        This story tests the alignment between input fields and buttons across all size and variant
        combinations.
      </div>

      {/* Size variations with default input variant */}
      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-4">Default Input Variant - All Sizes</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Small (38px height)
              </label>
              <SearchForm
                size="sm"
                inputVariant="default"
                placeholder="Small search..."
                onSubmit={(query) => alert(`Search: ${query}`)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default (50px height)
              </label>
              <SearchForm
                size="default"
                inputVariant="default"
                placeholder="Default search..."
                onSubmit={(query) => alert(`Search: ${query}`)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Large (62px height)
              </label>
              <SearchForm
                size="lg"
                inputVariant="default"
                placeholder="Large search..."
                onSubmit={(query) => alert(`Search: ${query}`)}
              />
            </div>
          </div>
        </div>

        {/* Outlined variant with thicker borders */}
        <div>
          <h4 className="font-medium mb-4">Outlined Input Variant - All Sizes (Thicker Border)</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Small Outlined (38px height + 2px border)
              </label>
              <SearchForm
                size="sm"
                inputVariant="outlined"
                placeholder="Small outlined search..."
                onSubmit={(query) => alert(`Search: ${query}`)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Outlined (50px height + 2px border)
              </label>
              <SearchForm
                size="default"
                inputVariant="outlined"
                placeholder="Default outlined search..."
                onSubmit={(query) => alert(`Search: ${query}`)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Large Outlined (62px height + 2px border)
              </label>
              <SearchForm
                size="lg"
                inputVariant="outlined"
                placeholder="Large outlined search..."
                onSubmit={(query) => alert(`Search: ${query}`)}
              />
            </div>
          </div>
        </div>

        {/* Filled variant */}
        <div>
          <h4 className="font-medium mb-4">Filled Input Variant</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Small Filled</label>
              <SearchForm
                size="sm"
                inputVariant="filled"
                placeholder="Small filled search..."
                onSubmit={(query) => alert(`Search: ${query}`)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Filled</label>
              <SearchForm
                size="default"
                inputVariant="filled"
                placeholder="Default filled search..."
                onSubmit={(query) => alert(`Search: ${query}`)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Large Filled</label>
              <SearchForm
                size="lg"
                inputVariant="filled"
                placeholder="Large filled search..."
                onSubmit={(query) => alert(`Search: ${query}`)}
              />
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
        story:
          'Test story to verify proper height alignment between input fields and buttons across all variants and sizes.',
      },
    },
  },
}
