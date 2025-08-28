# Testing Documentation

This directory contains comprehensive tests for the roam-viewer application. The testing setup uses a combination of Bun's built-in test runner for simple unit tests and Vitest for more complex React component and integration testing.

## Test Structure

```
test/
├── README.md                           # This documentation
├── setup.ts                           # Test setup file for jsdom and mocks
├── simple-unit.test.ts                # Basic utility tests that run with Bun
├── api-client.test.ts                 # API client unit tests
├── utils/
│   ├── parseTagsString.test.ts        # Utility function tests
│   └── utils.test.ts                  # cn function and removeFrontmatter tests
├── hooks/
│   └── useNodes.test.tsx              # React Query hooks tests
├── components/
│   ├── Layout.test.tsx                # Layout component tests
│   ├── NodeDetail.test.tsx            # Node detail page tests
│   ├── NodeForm.test.tsx              # Node creation/editing form tests
│   ├── NodeList.test.tsx              # Node list and filtering tests
│   ├── TagList.test.tsx               # Tag list page tests
│   ├── TagDetail.test.tsx             # Tag detail page tests
│   ├── App.test.tsx                   # App routing tests
│   └── design-system/
│       ├── Button.test.tsx            # Button component tests
│       └── NodeCard.test.tsx          # NodeCard component tests
├── integration/
│   └── user-workflows.test.tsx        # End-to-end user workflow tests
└── server/
    └── server-logic.test.ts           # Server-side logic tests
```

## Available Test Commands

### Basic Unit Tests (Bun)
```bash
# Run all basic unit tests
bun test

# Run specific utility tests
bun test:unit
```

### React Component Tests (Vitest)
```bash
# Run all tests including React components (when Vitest config is working)
bun run test:vitest

# Run with coverage report
bun run test:coverage

# Run with interactive UI
bun run test:ui
```

## Test Categories

### 1. Unit Tests (`simple-unit.test.ts`)

Basic utility functions that don't require complex mocking:
- Tag parsing utilities
- URL encoding functions
- API error creation
- Input validation helpers

**Example:**
```typescript
test('should parse comma-separated tags correctly', () => {
  const result = parseTagsString('tag1, tag2, tag3')
  expect(result).toEqual(['tag1', 'tag2', 'tag3'])
})
```

### 2. API Client Tests (`api-client.test.ts`)

Tests for the API client class including:
- HTTP request handling
- Error handling (network errors, HTTP errors)
- Response parsing (JSON and text)
- All CRUD operations (nodes, search, tags, relationships)
- API v2.0.0 compatibility

**Key Features Tested:**
- Node operations: create, read, update, delete
- Search functionality with different response formats
- Tag operations with legacy and new API formats
- Backlinks and forward links
- Error handling and retry logic

### 3. React Hooks Tests (`hooks/useNodes.test.tsx`)

Tests for React Query-based hooks:
- Data fetching hooks (useNodes, useNode, useSearchNodes)
- Mutation hooks (useCreateNode, useUpdateNode, useDeleteNode)
- Query invalidation and cache management
- Error handling in React context

### 4. Component Tests

#### NodeForm Tests (`components/NodeForm.test.tsx`)
- Form rendering and field population
- Form validation (required fields, input parsing)
- File format selection (Markdown vs Org Mode)
- Tag parsing and submission
- Loading and error states
- Success navigation

#### NodeList Tests (`components/NodeList.test.tsx`)
- Node list rendering
- Search functionality with debouncing
- Tag filtering via URL parameters
- View mode persistence
- Loading and error states
- Empty state handling

### 5. Integration Tests (`integration/user-workflows.test.tsx`)

End-to-end user workflows:
- Complete node creation workflow
- Search and filter workflows
- Navigation between pages
- Error recovery scenarios
- Form input validation and sanitization

### 6. Layout and Page Component Tests

#### Layout Tests (`components/Layout.test.tsx`)
- Basic layout structure and navigation
- Header, main, and footer rendering
- Responsive design classes
- Navigation links and brand logo
- Semantic HTML structure

#### Page Component Tests
- **NodeDetail Tests** (`components/NodeDetail.test.tsx`): Markdown rendering, raw/rendered view toggle, backlinks/forward links, edit/delete actions
- **TagList Tests** (`components/TagList.test.tsx`): Tag listing, empty states, navigation links, responsive grid layout
- **TagDetail Tests** (`components/TagDetail.test.tsx`): Tag-specific node display, filtering options, error handling

### 7. Design System Component Tests (`components/design-system/`)

#### Button Tests (`Button.test.tsx`)
- All button variants (default, destructive, outline, secondary, ghost, link)
- All button sizes (default, sm, lg, icon)
- Event handling and accessibility
- asChild functionality with Slot component
- Forward ref support

#### NodeCard Tests (`NodeCard.test.tsx`)
- Content display and truncation
- Tag handling and click events
- Action buttons (edit/delete)
- Selected state and visual indicators
- Multiple variants (NodeCard, NodeCardCompact, NodeCardGrid)
- Date formatting and TODO badges

### 8. Application Routing Tests (`components/App.test.tsx`)

- Route navigation and parameter handling
- Wildcard route redirection
- URL encoding for special characters
- Component mounting for different routes
- Edge cases and error boundaries

### 9. Utility Function Tests (`utils/`)

#### Core Utils Tests (`utils.test.ts`)
- `cn` function for Tailwind CSS class merging
- `removeFrontmatter` function for Markdown processing
- Class name conflict resolution
- Frontmatter parsing edge cases

#### Tag Parsing Tests (`parseTagsString.test.ts`)
- Comma-separated tag parsing
- Whitespace handling and filtering
- Unicode character support
- Edge cases with empty strings

### 10. Server-side Logic Tests (`server/server-logic.test.ts`)

- API response handling (md-roam v2.0.0 vs legacy)
- Request parameter filtering (refs field removal)
- Error handling and retry logic
- Japanese text processing with extended timeouts
- URL encoding/decoding
- Data transformation for frontend compatibility

## Testing Best Practices

### 1. Component Testing
- Use React Testing Library for user-centric testing
- Test user interactions, not implementation details
- Mock external dependencies (API calls, router navigation)
- Test both happy paths and error scenarios

### 2. API Testing
- Mock fetch globally for consistent API testing
- Test different response formats (v1 and v2 API)
- Verify request payloads and headers
- Test error handling for different HTTP status codes

### 3. Hook Testing
- Use QueryClient provider wrapper for React Query hooks
- Test query invalidation behavior
- Verify loading and error states
- Test optimistic updates where applicable

### 4. Integration Testing
- Test complete user workflows from start to finish
- Verify state management across components
- Test URL parameter handling and navigation
- Include error recovery scenarios

## Mock Strategy

### Global Mocks
- `fetch` - Mocked globally for API client testing
- `matchMedia` - Browser API mock for responsive components
- `IntersectionObserver` - Mock for component visibility detection
- `ResizeObserver` - Mock for responsive behavior

### React Router Mocks
- `useNavigate` - Mocked to verify navigation calls
- `useSearchParams` - Mocked to control URL parameters
- `useParams` - Mocked to provide route parameters

### React Query Setup
- QueryClient with disabled retry for faster tests
- Proper cleanup between tests
- Mock implementations for specific test scenarios

## Known Issues and Solutions

### Vitest Configuration Issues
Currently experiencing configuration issues with Vitest in this Bun-based project. The comprehensive test suite is written and ready, but may need configuration adjustments to run properly.

**Workaround:** Use Bun's built-in test runner for basic unit tests that don't require complex React rendering or mocking.

### Component Testing Considerations
- Some tests may need adjustment based on actual component implementation details
- Mock implementations should match the real API behavior
- URL parameter handling may vary based on router configuration

## Future Improvements

1. **Playwright Integration**: Add end-to-end browser testing
2. **Visual Regression Testing**: Use Storybook + Chromatic for UI testing
3. **Performance Testing**: Add tests for large dataset handling
4. **Accessibility Testing**: Include a11y testing with @testing-library/jest-dom
5. **API Mocking**: Consider MSW (Mock Service Worker) for more realistic API mocking

## Running Tests in CI/CD

For continuous integration, use:

```bash
# Basic unit tests (always working)
bun test test/simple-unit.test.ts

# Full test suite (when Vitest config is resolved)
bun run test:vitest --run --coverage
```

## Test Data Management

### Mock Data Patterns
- Use consistent mock data across tests
- Create reusable mock factories for complex objects
- Maintain separate mock data for different test scenarios

### Example Mock Patterns
```typescript
const mockNode = {
  id: 'test-id',
  title: 'Test Node',
  file: 'test.md',
  tags: ['tag1', 'tag2'],
  content: 'Test content'
}

const mockApiResponse = {
  ok: true,
  headers: { get: () => 'application/json' },
  json: () => Promise.resolve(mockNode)
}
```

This testing setup ensures comprehensive coverage of the roam-viewer application while maintaining good separation of concerns and testability.