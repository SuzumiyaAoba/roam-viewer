# Custom Classes Example for OrgRenderer

The OrgRenderer component now supports custom CSS classes for all elements. Here's how to use it:

## Basic Usage

```tsx
import { OrgRenderer, type CustomClasses } from "./features/org-rendering/ui/OrgRenderer";

// Define custom classes
const customClasses: CustomClasses = {
  todoKeywords: {
    TODO: ["bg-red-200", "text-red-800", "px-3", "py-1", "rounded-full"],
    DONE: ["bg-blue-200", "text-blue-800", "px-3", "py-1", "rounded-full"],
  },
  priorities: {
    A: ["bg-purple-200", "text-purple-800", "border-2", "border-purple-400"],
    B: ["bg-yellow-200", "text-yellow-800", "border-2", "border-yellow-400"],
    C: ["bg-green-200", "text-green-800", "border-2", "border-green-400"],
  },
  headers: {
    1: ["text-2xl", "font-bold", "text-purple-900", "mb-4"],
    2: ["text-xl", "font-semibold", "text-purple-800", "mb-3"],
  },
  elements: {
    p: ["text-slate-700", "leading-relaxed", "mb-3"],
    ul: ["list-disc", "ml-6", "space-y-2"],
    code: ["bg-slate-100", "text-pink-600", "px-2", "py-1", "rounded"],
  }
};

// Use with custom classes
<OrgRenderer 
  content={orgContent} 
  customClasses={customClasses}
  enableSyntaxHighlight={true}
/>
```

## Available Customization Options

### TODO Keywords
Customize styling for TODO, DONE, DOING, NEXT, WAITING, CANCELLED, CANCELED

### Priorities
Customize styling for priority indicators [#A], [#B], [#C]

### Headers
Customize styling for header levels 1-6

### Timestamps
Customize timestamp display styles:
- `range`: Timestamp ranges like `<2025-01-15>--<2025-01-16>`  
- `active`: Active timestamps `<2025-01-15>`
- `inactive`: Inactive timestamps `[2025-01-15]`
- `fallback`: Default timestamp styling
- Icon classes: `rangeIcon`, `arrowIcon`, `clockIcon`, `calendarIcon`

### Elements
Customize basic HTML elements:
- `p`, `ul`, `ol`, `li`: Text and list elements
- `code`, `pre`, `preShiki`: Code blocks
- `table`, `th`, `td`, `thead`, `tbody`: Table elements  
- `a`, `strong`, `em`, `hr`: Inline and structural elements

## Default Behavior

If no custom classes are provided, the component uses the built-in Tailwind CSS classes for consistent styling. Custom classes completely override the defaults for specific elements.