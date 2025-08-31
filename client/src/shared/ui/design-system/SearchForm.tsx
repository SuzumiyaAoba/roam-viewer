import { cva, type VariantProps } from 'class-variance-authority'
import type React from 'react'
import { forwardRef, useState } from 'react'
import { Button } from '../shadcn/button'
import { Input } from '../shadcn/input'
import { cn } from './utils'

const searchFormVariants = cva('relative w-full', {
  variants: {
    variant: {
      default: '',
      elevated: 'bg-white rounded-lg shadow-sm border border-gray-200 p-4',
      minimal: '',
      prominent: 'bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface SearchFormProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'onChange'>,
    VariantProps<typeof searchFormVariants> {
  /**
   * Input variant style
   */
  inputVariant?: 'default' | 'outline'
  /**
   * Placeholder text for the search input
   */
  placeholder?: string
  /**
   * Search button text
   */
  buttonText?: string
  /**
   * Whether to show the search button
   */
  showButton?: boolean
  /**
   * Search input value
   */
  value?: string
  /**
   * Default value for uncontrolled usage
   */
  defaultValue?: string
  /**
   * Callback when search is submitted
   */
  onSubmit?: (query: string) => void
  /**
   * Callback when input value changes
   */
  onChange?: (value: string) => void
  /**
   * Search icon element
   */
  icon?: React.ReactNode
  /**
   * Loading state
   */
  loading?: boolean
  /**
   * Disabled state
   */
  disabled?: boolean
}

const SearchForm = forwardRef<HTMLFormElement, SearchFormProps>(
  (
    {
      className,
      variant,
      inputVariant = 'default',
      placeholder = 'Search...',
      buttonText = 'Search',
      showButton = true,
      value,
      defaultValue,
      onSubmit,
      onChange,
      icon,
      loading = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue || '')
    const isControlled = value !== undefined
    const searchValue = isControlled ? value : internalValue

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onChange?.(newValue)
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (onSubmit && searchValue.trim()) {
        onSubmit(searchValue.trim())
      }
    }

    return (
      <form
        ref={ref}
        className={cn(searchFormVariants({ variant }), className)}
        onSubmit={handleSubmit}
        {...props}
      >
        <div className="flex w-full items-center">
          {/* Search Icon */}
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
              {icon}
            </div>
          )}

          {/* Search Input using shadcn/ui Input */}
          <Input
            type="search"
            value={searchValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled || loading}
            className={cn(icon && 'pl-10', showButton && 'rounded-r-none border-r-0')}
          />

          {/* Loading Spinner */}
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="animate-spin h-4 w-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}

          {/* Search Button using shadcn/ui Button */}
          {showButton && (
            <Button
              type="submit"
              disabled={disabled || loading || !searchValue.trim()}
              className="rounded-l-none border-l-0"
              variant="default"
            >
              {loading ? 'Searching...' : buttonText}
            </Button>
          )}
        </div>
      </form>
    )
  }
)
SearchForm.displayName = 'SearchForm'

// Quick Search variant for minimal use cases
const QuickSearch = forwardRef<
  HTMLInputElement,
  Omit<SearchFormProps, 'showButton'> & {
    onSearch?: (query: string) => void
  }
>(
  (
    {
      className,
      placeholder = 'Quick search...',
      icon = (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      onSearch,
      onSubmit,
      ...props
    },
    ref
  ) => {
    const handleSubmit = (query: string) => {
      onSearch?.(query)
      onSubmit?.(query)
    }

    return (
      <SearchForm
        ref={ref as any}
        className={className}
        placeholder={placeholder}
        icon={icon}
        showButton={false}
        onSubmit={handleSubmit}
        {...props}
      />
    )
  }
)
QuickSearch.displayName = 'QuickSearch'

// Search with suggestions dropdown
interface SearchSuggestion {
  id: string
  text: string
  category?: string
  icon?: React.ReactNode
}

interface SearchWithSuggestionsProps extends SearchFormProps {
  suggestions?: SearchSuggestion[]
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void
  showSuggestions?: boolean
  maxSuggestions?: number
}

const SearchWithSuggestions = forwardRef<HTMLFormElement, SearchWithSuggestionsProps>(
  (
    {
      suggestions = [],
      onSuggestionSelect,
      showSuggestions = true,
      maxSuggestions = 5,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)

    const filteredSuggestions = suggestions
      .filter((suggestion) =>
        value ? suggestion.text.toLowerCase().includes(value.toLowerCase()) : true
      )
      .slice(0, maxSuggestions)

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
      onSuggestionSelect?.(suggestion)
      onChange?.(suggestion.text)
      setIsOpen(false)
      setSelectedIndex(-1)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen || filteredSuggestions.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1))
          break
        case 'Enter':
          if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
            e.preventDefault()
            handleSuggestionClick(filteredSuggestions[selectedIndex])
          }
          break
        case 'Escape':
          setIsOpen(false)
          setSelectedIndex(-1)
          break
      }
    }

    return (
      <div className="relative">
        <SearchForm
          ref={ref}
          value={value}
          onChange={(newValue) => {
            onChange?.(newValue)
            setIsOpen(showSuggestions && newValue.length > 0)
            setSelectedIndex(-1)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(showSuggestions && (value?.length || 0) > 0)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          {...props}
        />

        {/* Suggestions Dropdown */}
        {isOpen && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  'w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors',
                  index === selectedIndex && 'bg-blue-50'
                )}
              >
                {suggestion.icon && (
                  <div className="text-gray-400 flex-shrink-0">{suggestion.icon}</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.text}
                  </div>
                  {suggestion.category && (
                    <div className="text-xs text-gray-500 truncate">{suggestion.category}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)
SearchWithSuggestions.displayName = 'SearchWithSuggestions'

export { SearchForm, QuickSearch, SearchWithSuggestions, searchFormVariants }

export type { SearchSuggestion, SearchWithSuggestionsProps }
