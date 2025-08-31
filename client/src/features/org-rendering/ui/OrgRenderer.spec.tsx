import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrgRenderer } from './OrgRenderer'

describe('OrgRenderer', () => {
  describe('Basic text rendering', () => {
    it('should render simple paragraphs', () => {
      const content = 'This is a simple paragraph.'
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<p class="text-gray-700 leading-relaxed mb-4">This is a simple paragraph.</p>')
    })

    it('should handle empty content', () => {
      const { container } = render(<OrgRenderer content="" />)
      expect(container.querySelector('.org-content')).toBeEmptyDOMElement()
    })

    it('should handle multiple paragraphs', () => {
      const content = `First paragraph.

Second paragraph.`
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<p class="text-gray-700 leading-relaxed mb-4">First paragraph.</p>')
      expect(container.innerHTML).toContain('<p class="text-gray-700 leading-relaxed mb-4">Second paragraph.</p>')
    })
  })

  describe('Headers', () => {
    it('should render level 1 headers', () => {
      const content = '* Main Header'
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<h1 class="text-3xl font-bold text-gray-900 mb-4 mt-8 first:mt-0">Main Header</h1>')
    })

    it('should render level 2 headers', () => {
      const content = '** Sub Header'
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<h2 class="text-2xl font-semibold text-gray-800 mb-3 mt-6">Sub Header</h2>')
    })

    it('should render level 3 headers', () => {
      const content = '*** Sub Sub Header'
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<h3 class="text-xl font-semibold text-gray-800 mb-3 mt-5">Sub Sub Header</h3>')
    })

    it('should handle headers with inline formatting', () => {
      const content = '* *Bold* Header with /italic/ text'
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<strong class="font-semibold text-gray-900">Bold</strong>')
      expect(container.innerHTML).toContain('<em class="italic">italic</em>')
    })

    it('should cap header levels at h6', () => {
      const content = '******* Deep Header'
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<h6')
      expect(container.innerHTML).toContain('Deep Header</h6>')
    })
  })

  describe('Lists', () => {
    it('should render unordered lists', () => {
      const content = `- First item
- Second item
- Third item`
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<ul class="list-disc list-inside mb-4 ml-4 space-y-1">')
      expect(container.innerHTML).toContain('<li class="text-gray-700">First item</li>')
      expect(container.innerHTML).toContain('<li class="text-gray-700">Second item</li>')
      expect(container.innerHTML).toContain('<li class="text-gray-700">Third item</li>')
    })

    it('should render numbered lists', () => {
      const content = `1. First item
2. Second item
3. Third item`
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<ul class="list-disc list-inside mb-4 ml-4 space-y-1">')
      expect(container.innerHTML).toContain('<li class="text-gray-700">First item</li>')
      expect(container.innerHTML).toContain('<li class="text-gray-700">Second item</li>')
      expect(container.innerHTML).toContain('<li class="text-gray-700">Third item</li>')
    })

    it('should handle list items with inline formatting', () => {
      const content = `- *Bold* item
- /Italic/ item
- =Code= item`
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<strong class="font-semibold text-gray-900">Bold</strong>')
      expect(container.innerHTML).toContain('<em class="italic">Italic</em>')
      expect(container.innerHTML).toContain('<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">Code</code>')
    })
  })

  describe('Code blocks', () => {
    it('should render code blocks', () => {
      const content = `#+BEGIN_SRC javascript
console.log('Hello, world!');
const x = 42;
#+END_SRC`
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm">')
      expect(container.innerHTML).toContain('console.log(\'Hello, world!\');\nconst x = 42;')
    })

    it('should handle code blocks without language', () => {
      const content = `#+BEGIN_SRC
plain text code
#+END_SRC`
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm">')
      expect(container.innerHTML).toContain('plain text code')
    })

    it('should handle multiline code blocks', () => {
      const content = `#+BEGIN_SRC python
def hello():
    print("Hello")
    return 42

hello()
#+END_SRC`
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('def hello():\n    print("Hello")\n    return 42\n\nhello()')
    })
  })

  describe('Inline formatting', () => {
    it('should render bold text', () => {
      const content = 'This is *bold* text.'
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<strong class="font-semibold text-gray-900">bold</strong>')
    })

    it('should render italic text', () => {
      const content = 'This is /italic/ text.'
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<em class="italic">italic</em>')
    })

    it('should render code text with equals', () => {
      const content = 'This is =code= text.'
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">code</code>')
    })

    it('should render code text with tildes', () => {
      const content = 'This is ~code~ text.'
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">code</code>')
    })

    it('should render strikethrough text', () => {
      const content = 'This is +strikethrough+ text.'
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<del class="line-through text-gray-500">strikethrough</del>')
    })

    it('should handle multiple inline formats in one paragraph', () => {
      const content = 'Text with *bold*, /italic/, =code=, and +strikethrough+ formatting.'
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<strong class="font-semibold text-gray-900">bold</strong>')
      expect(container.innerHTML).toContain('<em class="italic">italic</em>')
      expect(container.innerHTML).toContain('<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">code</code>')
      expect(container.innerHTML).toContain('<del class="line-through text-gray-500">strikethrough</del>')
    })
  })

  describe('Links', () => {
    it('should render simple links', () => {
      const content = 'Visit [[https://example.com]] for more info.'
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<a href="https://example.com" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">https://example.com</a>')
    })

    it('should render links with descriptions', () => {
      const content = 'Visit [[https://example.com][Example Website]] for more info.'
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<a href="https://example.com" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">Example Website</a>')
    })

    it('should render internal links without target="_blank"', () => {
      const content = 'See [[internal-page]] for details.'
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<a href="internal-page" class="text-blue-600 hover:text-blue-800 underline">internal-page</a>')
      expect(container.innerHTML).not.toContain('target="_blank"')
    })

    it('should handle multiple links in one paragraph', () => {
      const content = 'Visit [[https://example.com][Example]] and [[https://google.com][Google]].'
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<a href="https://example.com"')
      expect(container.innerHTML).toContain('<a href="https://google.com"')
    })
  })

  describe('Horizontal rules', () => {
    it('should render horizontal rules with three dashes', () => {
      const content = `Before rule
---
After rule`
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<hr class="border-gray-300 my-8" />')
    })

    it('should render horizontal rules with more than three dashes', () => {
      const content = `Before rule
------
After rule`
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('<hr class="border-gray-300 my-8" />')
    })
  })

  describe('Metadata handling', () => {
    it('should extract and display title metadata', () => {
      const content = `#+title: My Document
This is the content.`
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('My Document')
      expect(container.innerHTML).toContain('This is the content.')
      expect(container.innerHTML).not.toContain('#+title:')
    })

    it('should extract and display category metadata', () => {
      const content = `#+category: Technology
#+title: My Document
This is the content.`
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('Technology')
      expect(container.innerHTML).toContain('Category:')
    })

    it('should extract and display tags metadata', () => {
      const content = `#+tags: react typescript web
#+title: My Document
This is the content.`
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('react')
      expect(container.innerHTML).toContain('typescript')
      expect(container.innerHTML).toContain('web')
    })

    it('should handle PROPERTIES blocks', () => {
      const content = `:PROPERTIES:
:ID: 123-456-789
:END:
#+title: My Document
This is the content.`
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('123-456-789')
      expect(container.innerHTML).toContain('This is the content.')
      expect(container.innerHTML).not.toContain(':PROPERTIES:')
      expect(container.innerHTML).not.toContain(':END:')
    })

    it('should skip duplicate metadata', () => {
      const content = `#+title: First Title
#+title: Second Title
#+category: First Category
#+category: Second Category
This is the content.`
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('First Title')
      expect(container.innerHTML).toContain('First Category')
      expect(container.innerHTML).not.toContain('Second Title')
      expect(container.innerHTML).not.toContain('Second Category')
    })
  })

  describe('Complex mixed content', () => {
    it('should handle complex document with all elements', () => {
      const content = `#+title: Complex Document
#+category: Mixed
#+tags: test example complex

* Main Section

This is a paragraph with *bold* and /italic/ text.

** Subsection

Here's a list:
- First item with =code=
- Second item with [[https://example.com][link]]

#+BEGIN_SRC javascript
console.log('Hello, world!');
#+END_SRC

---

Final paragraph.`

      const { container } = render(<OrgRenderer content={content} />)
      
      // Check metadata
      expect(container.innerHTML).toContain('Complex Document')
      expect(container.innerHTML).toContain('Mixed')
      expect(container.innerHTML).toContain('test')
      
      // Check headers
      expect(container.innerHTML).toContain('<h1')
      expect(container.innerHTML).toContain('<h2')
      
      // Check inline formatting
      expect(container.innerHTML).toContain('<strong')
      expect(container.innerHTML).toContain('<em')
      expect(container.innerHTML).toContain('<code')
      
      // Check list
      expect(container.innerHTML).toContain('<ul')
      expect(container.innerHTML).toContain('<li')
      
      // Check code block
      expect(container.innerHTML).toContain('<pre')
      expect(container.innerHTML).toContain('console.log')
      
      // Check horizontal rule
      expect(container.innerHTML).toContain('<hr')
      
      // Check link
      expect(container.innerHTML).toContain('<a href="https://example.com"')
    })

    it('should handle empty lines and spacing correctly', () => {
      const content = `First paragraph.


Second paragraph after empty lines.

* Header

Another paragraph.`

      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('First paragraph.')
      expect(container.innerHTML).toContain('Second paragraph after empty lines.')
      expect(container.innerHTML).toContain('Another paragraph.')
    })
  })

  describe('HTML escaping and security', () => {
    it('should escape HTML in content', () => {
      const content = 'This contains <script>alert("xss")</script> HTML.'
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('&lt;script&gt;')
      expect(container.innerHTML).toContain('&lt;/script&gt;')
      expect(container.innerHTML).not.toContain('<script>')
    })

    it('should escape HTML in code blocks', () => {
      const content = `#+BEGIN_SRC html
<div>Hello</div>
<script>alert('xss')</script>
#+END_SRC`
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('&lt;div&gt;')
      expect(container.innerHTML).toContain('&lt;script&gt;')
      expect(container.innerHTML).not.toContain('<div>Hello</div>')
    })

    it('should escape HTML in link URLs and descriptions', () => {
      const content = 'Visit [[javascript:alert("xss")][<script>Bad Link</script>]] for more.'
      const { container } = render(<OrgRenderer content={content} />)
      
      expect(container.innerHTML).toContain('javascript:alert(&quot;xss&quot;)')
      expect(container.innerHTML).toContain('&lt;script&gt;Bad Link&lt;/script&gt;')
    })
  })

  describe('Error handling', () => {
    it('should handle malformed org content gracefully', () => {
      const content = `#+BEGIN_SRC
Missing end tag`
      const { container } = render(<OrgRenderer content={content} />)
      
      // Should render without throwing an error
      expect(container.querySelector('.org-content')).toBeDefined()
    })

    it('should display error message when parsing fails', () => {
      // Mock console.error to avoid test noise
      const originalError = console.error
      console.error = vi.fn()
      
      // Mock document.createElement to throw an error
      const originalCreateElement = document.createElement
      document.createElement = vi.fn(() => {
        throw new Error('Test error')
      })
      
      const { container } = render(<OrgRenderer content="Test content" />)
      
      expect(container.innerHTML).toContain('Error:')
      expect(container.innerHTML).toContain('Failed to render org-mode content')
      
      document.createElement = originalCreateElement
      console.error = originalError
    })
  })

  describe('Legacy tests for backward compatibility', () => {
    it('should accept custom className', () => {
      render(<OrgRenderer content="test" className="custom-class" />)
      
      const container = screen.getByText('test').closest('div')
      expect(container).toHaveClass('custom-class')
    })

    it('should handle syntax highlighting option', () => {
      const { rerender } = render(<OrgRenderer content="test" enableSyntaxHighlight={true} />)
      expect(screen.getByText('test')).toBeInTheDocument()

      rerender(<OrgRenderer content="test" enableSyntaxHighlight={false} />)
      expect(screen.getByText('test')).toBeInTheDocument()
    })

    it('should handle special characters in content', () => {
      render(<OrgRenderer content="Special chars: éñ中文" />)
      
      expect(screen.getByText('Special chars: éñ中文')).toBeInTheDocument()
    })
  })
})

