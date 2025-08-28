import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrgRenderer } from './OrgRenderer'
import React from 'react'

describe('OrgRenderer', () => {
  it('should render basic org content', () => {
    render(<OrgRenderer content="Regular paragraph" />)
    
    expect(screen.getByText('Regular paragraph')).toBeInTheDocument()
  })

  it('should render org headers', () => {
    render(<OrgRenderer content="* Header" />)
    
    const header = screen.getByRole('heading', { level: 1 })
    expect(header).toHaveTextContent('Header')
    expect(header).toHaveClass('text-3xl', 'font-bold', 'text-gray-900')
  })

  it('should render org subheaders', () => {
    render(<OrgRenderer content="** Subheader" />)
    
    const subheader = screen.getByRole('heading', { level: 2 })
    expect(subheader).toHaveTextContent('Subheader')
    expect(subheader).toHaveClass('text-2xl', 'font-semibold', 'text-gray-800')
  })

  it('should render multiple header levels', () => {
    const content = `* Level 1
** Level 2
*** Level 3
**** Level 4
***** Level 5
****** Level 6
******* Level 7 (should be h6)`

    render(<OrgRenderer content={content} />)
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Level 1')
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Level 2')
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Level 3')
    expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Level 4')
    expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Level 5')
    expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent('Level 6')
    // Level 7+ should be rendered as h6
    expect(screen.getByText('Level 7 (should be h6)')).toBeTruthy()
  })

  it('should render org lists', () => {
    render(<OrgRenderer content="- List item 1\n- List item 2" />)
    
    const list = screen.getByRole('list')
    expect(list).toHaveClass('list-disc', 'list-inside')
    
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(2)
    expect(listItems[0]).toHaveTextContent('List item 1')
    expect(listItems[1]).toHaveTextContent('List item 2')
  })

  it('should render org links', () => {
    render(<OrgRenderer content="Check out [[https://example.com][Example Site]]" />)
    
    const link = screen.getByRole('link', { name: 'Example Site' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveClass('text-blue-600', 'hover:text-blue-800', 'underline')
  })

  it('should render simple org links', () => {
    render(<OrgRenderer content="Visit [[https://example.com]]" />)
    
    const link = screen.getByRole('link', { name: 'https://example.com' })
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('should accept custom className', () => {
    render(<OrgRenderer content="test" className="custom-class" />)
    
    const container = screen.getByText('test').closest('div')
    expect(container).toHaveClass('custom-class')
  })

  it('should have default prose classes', () => {
    render(<OrgRenderer content="test" />)
    
    const container = screen.getByText('test').closest('div')
    expect(container).toHaveClass('prose', 'max-w-none')
  })

  it('should handle syntax highlighting option', () => {
    const { rerender } = render(<OrgRenderer content="test" enableSyntaxHighlight={true} />)
    expect(screen.getByText('test')).toBeInTheDocument()

    rerender(<OrgRenderer content="test" enableSyntaxHighlight={false} />)
    expect(screen.getByText('test')).toBeInTheDocument()
  })

  it('should render code blocks', () => {
    const codeContent = `#+BEGIN_SRC javascript
console.log('Hello, World!');
const x = 42;
#+END_SRC`
    
    render(<OrgRenderer content={codeContent} />)
    
    const codeBlock = screen.getByText("console.log('Hello, World!');\nconst x = 42;")
    expect(codeBlock.closest('pre')).toHaveClass('bg-gray-900', 'text-gray-100')
  })

  it('should render inline formatting', () => {
    render(<OrgRenderer content="This has *bold*, /italic/, and =code= formatting." />)
    
    expect(screen.getByText('bold')).toHaveClass('font-semibold')
    expect(screen.getByText('italic')).toHaveClass('italic')
    expect(screen.getByText('code')).toHaveClass('bg-gray-100', 'text-gray-800')
  })

  it('should render horizontal rules', () => {
    render(<OrgRenderer content="Text above\n---\nText below" />)
    
    const hr = document.querySelector('hr')
    expect(hr).toHaveClass('border-gray-300', 'my-8')
  })

  it('should handle mixed content', () => {
    const mixedContent = `* Header
Some paragraph text with *bold* and /italic/.

- List item 1
- List item 2

#+BEGIN_SRC javascript
console.log('code block');
#+END_SRC

Another paragraph with [[https://example.com][a link]].`

    render(<OrgRenderer content={mixedContent} />)
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Header')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByRole('link')).toHaveTextContent('a link')
    expect(screen.getByText("console.log('code block');")).toBeInTheDocument()
  })

  it('should handle internal links differently', () => {
    render(<OrgRenderer content="Internal [[/path/to/page][link]] and external [[https://example.com][link]]." />)
    
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    
    // Internal link should not have target="_blank"
    expect(links[0]).not.toHaveAttribute('target')
    
    // External link should have target="_blank"
    expect(links[1]).toHaveAttribute('target', '_blank')
  })

  it('should handle processing errors gracefully', () => {
    // Mock console.error to avoid test noise
    const originalError = console.error
    console.error = vi.fn()
    
    // Mock React.useMemo to throw an error
    const originalUseMemo = React.useMemo
    React.useMemo = vi.fn().mockImplementation(() => {
      throw new Error('Test parsing error')
    })
    
    render(<OrgRenderer content="test" />)
    
    expect(screen.getByText('Error:')).toBeInTheDocument()
    expect(screen.getByText('Failed to render org-mode content.')).toBeInTheDocument()
    
    // Restore mocks
    React.useMemo = originalUseMemo
    console.error = originalError
  })

  it('should display content in prose container', () => {
    const { container } = render(<OrgRenderer content="test content" />)
    
    const proseDiv = container.querySelector('div.prose')
    expect(proseDiv).toHaveClass('prose', 'max-w-none')
    expect(screen.getByText('test content')).toBeInTheDocument()
  })

  it('should handle empty content', () => {
    const { container } = render(<OrgRenderer content="" />)
    
    const proseDiv = container.querySelector('div.prose')
    expect(proseDiv).toHaveClass('prose', 'max-w-none')
  })

  it('should handle special characters in content', () => {
    render(<OrgRenderer content="Special chars: éñ中文" />)
    
    expect(screen.getByText('Special chars: éñ中文')).toBeInTheDocument()
  })

  it('should preserve content across multiple lines', () => {
    const multilineContent = "Line 1\nLine 2\n\nLine 4"
    render(<OrgRenderer content={multilineContent} />)
    
    // Each line becomes a separate paragraph
    expect(screen.getByText('Line 1')).toBeInTheDocument()
    expect(screen.getByText('Line 2')).toBeInTheDocument()
    expect(screen.getByText('Line 4')).toBeInTheDocument()
  })
})

// Test the exported components object
describe('orgComponents', () => {
  it('should export components object', () => {
    const { orgComponents } = require('./OrgRenderer')
    
    expect(orgComponents).toBeDefined()
    expect(orgComponents.h1).toBeDefined()
    expect(orgComponents.h2).toBeDefined()
    expect(orgComponents.p).toBeDefined()
    expect(orgComponents.ul).toBeDefined()
    expect(orgComponents.ol).toBeDefined()
    expect(orgComponents.a).toBeDefined()
    expect(orgComponents.code).toBeDefined()
    expect(orgComponents.pre).toBeDefined()
  })

  it('should have properly styled heading components', () => {
    const { orgComponents } = require('./OrgRenderer')
    
    render(orgComponents.h1({ children: 'Test H1' }))
    const h1 = screen.getByText('Test H1')
    expect(h1).toHaveClass('text-3xl', 'font-bold')

    render(orgComponents.h2({ children: 'Test H2' }))
    const h2 = screen.getByText('Test H2')
    expect(h2).toHaveClass('text-2xl', 'font-semibold')
  })

  it('should have styled paragraph component', () => {
    const { orgComponents } = require('./OrgRenderer')
    
    render(orgComponents.p({ children: 'Test paragraph' }))
    const p = screen.getByText('Test paragraph')
    expect(p).toHaveClass('text-gray-700', 'leading-relaxed')
  })

  it('should have styled link component', () => {
    const { orgComponents } = require('./OrgRenderer')
    
    render(orgComponents.a({ href: 'https://example.com', children: 'External Link' }))
    const link = screen.getByRole('link', { name: 'External Link' })
    expect(link).toHaveClass('text-blue-600', 'hover:text-blue-800', 'underline')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should handle internal links differently', () => {
    const { orgComponents } = require('./OrgRenderer')
    
    render(orgComponents.a({ href: '/internal', children: 'Internal Link' }))
    const link = screen.getByRole('link', { name: 'Internal Link' })
    expect(link).not.toHaveAttribute('target')
    expect(link).not.toHaveAttribute('rel')
  })

  it('should have styled code components', () => {
    const { orgComponents } = require('./OrgRenderer')
    
    // Inline code
    render(orgComponents.code({ children: 'inline code' }))
    const inlineCode = screen.getByText('inline code')
    expect(inlineCode).toHaveClass('bg-gray-100', 'text-gray-800', 'px-1.5', 'py-0.5', 'rounded')

    // Block code
    render(orgComponents.code({ className: 'language-javascript', children: 'console.log()' }))
    const blockCode = screen.getByText('console.log()')
    expect(blockCode).toHaveClass('language-javascript')
  })

  it('should have styled list components', () => {
    const { orgComponents } = require('./OrgRenderer')
    
    render(orgComponents.ul({ children: orgComponents.li({ children: 'List item' }) }))
    const ul = screen.getByRole('list')
    expect(ul).toHaveClass('list-disc', 'list-inside')
    
    const li = screen.getByText('List item')
    expect(li).toHaveClass('text-gray-700')
  })

  it('should have styled table components', () => {
    const { orgComponents } = require('./OrgRenderer')
    
    render(
      orgComponents.table({
        children: orgComponents.thead({
          children: orgComponents.tr({
            children: orgComponents.th({ children: 'Header' })
          })
        })
      })
    )
    
    const table = screen.getByRole('table')
    expect(table).toHaveClass('min-w-full', 'divide-y', 'divide-gray-200', 'border')
    
    const th = screen.getByText('Header')
    expect(th).toHaveClass('px-6', 'py-3', 'text-left', 'text-xs', 'font-medium')
  })
})