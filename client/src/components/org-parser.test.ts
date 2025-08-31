import { describe, it, expect } from 'vitest'

// Extract the parsing functions from OrgRenderer for direct testing
function extractMetadata(content: string): { metadata: any; cleanedContent: string } {
  const lines = content.split('\n')
  const cleanedLines: string[] = []
  const metadata: any = {}
  
  let seenProperties = false
  let seenTitle = false
  let inPropertiesBlock = false

  for (const line of lines) {
    const trimmed = line.trim()
    
    // Track PROPERTIES blocks
    if (trimmed === ':PROPERTIES:') {
      if (seenProperties) continue
      seenProperties = true
      inPropertiesBlock = true
      continue
    } else if (trimmed === ':END:' && inPropertiesBlock) {
      inPropertiesBlock = false
      continue
    } else if (inPropertiesBlock) {
      if (trimmed.startsWith(':ID:')) {
        metadata.id = trimmed.replace(':ID:', '').trim()
      }
      continue
    }
    
    // Extract metadata from #+lines
    if (trimmed.startsWith('#+title:')) {
      if (!seenTitle) {
        metadata.title = trimmed.replace('#+title:', '').trim()
        seenTitle = true
      }
      continue
    }
    
    if (trimmed.startsWith('#+category:')) {
      metadata.category = trimmed.replace('#+category:', '').trim()
      continue
    }
    
    if (trimmed.startsWith('#+tags:')) {
      metadata.tags = trimmed.replace('#+tags:', '').trim().split(/\s+/).filter(t => t.length > 0)
      continue
    }
    
    if (trimmed.startsWith('#+author:')) {
      metadata.author = trimmed.replace('#+author:', '').trim()
      continue
    }
    
    if (trimmed.startsWith('#+date:')) {
      metadata.date = trimmed.replace('#+date:', '').trim()
      continue
    }
    
    // Skip other org metadata BUT NOT code blocks
    if (trimmed.startsWith('#+') && !trimmed.startsWith('#+BEGIN_SRC') && !trimmed.startsWith('#+END_SRC')) {
      continue
    }
    
    cleanedLines.push(line)
  }
  
  return {
    metadata,
    cleanedContent: cleanedLines.join('\n')
  }
}

function parseOrgContent(content: string): { metadata: any; htmlContent: string } {
  const { metadata, cleanedContent } = extractMetadata(content)
  const lines = cleanedContent.split('\n')
  const htmlParts: string[] = []
  let currentListItems: string[] = []
  let currentCodeBlock: { language: string; code: string } | null = null
  let inCodeBlock = false
  let currentTableRows: string[][] = []
  let inTable = false

  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
  }

  const parseInlineFormatting = (text: string): string => {
    // First, process org-mode formatting on the raw text
    let result = text
    
    // Process bold (*text*)
    result = result.replace(/\*([^*\s][^*]*[^*\s]|\w)\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    
    // Process italic (/text/)
    result = result.replace(/\/([^\/\s][^\/]*[^\/\s]|\w)\//g, '<em class="italic">$1</em>')
    
    // Process code (=text= or ~text~) - but not in HTML attributes
    result = result.replace(/(^|[^"'\w])=([^=\s][^=]*[^=\s]|\w)=($|[^"'\w])/g, '$1<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$2</code>$3')
    result = result.replace(/(^|[^"'\w])~([^~\s][^~]*[^~\s]|\w)~($|[^"'\w])/g, '$1<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$2</code>$3')
    
    // Process strikethrough (+text+)
    result = result.replace(/\+([^+\s][^+]*[^+\s]|\w)\+/g, '<del class="line-through text-gray-500">$1</del>')
    
    // Process links [[url][description]] or [[url]]
    result = result.replace(/\[\[([^\]]+)\](?:\[([^\]]+)\])?\]/g, (_, url, description) => {
      const isExternal = url.startsWith('http')
      const displayText = escapeHtml(description || url)
      const safeUrl = escapeHtml(url)
      return `<a href="${safeUrl}" class="text-blue-600 hover:text-blue-800 underline"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}>${displayText}</a>`
    })

    // Now escape HTML content between tags
    result = result.split(/(<[^>]*>)/).map(part => {
      if (part.startsWith('<') && part.endsWith('>')) {
        return part // Keep our generated HTML tags as-is
      } else if (part.trim() === '') {
        return part // Keep empty parts as-is
      } else {
        return escapeHtml(part) // Escape text content
      }
    }).join('')

    return result
  }

  const flushList = () => {
    if (currentListItems.length > 0) {
      htmlParts.push('<ul class="list-disc list-inside mb-4 ml-4 space-y-1">')
      currentListItems.forEach(item => {
        htmlParts.push(`<li class="text-gray-700">${parseInlineFormatting(item)}</li>`)
      })
      htmlParts.push('</ul>')
      currentListItems = []
    }
  }

  const flushCodeBlock = () => {
    if (currentCodeBlock) {
      htmlParts.push(`<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm"><code>${escapeHtml(currentCodeBlock.code)}</code></pre>`)
      currentCodeBlock = null
    }
  }

  const flushTable = () => {
    if (currentTableRows.length > 0) {
      htmlParts.push('<table class="min-w-full divide-y divide-gray-200 border">')
      
      let hasHeaderSeparator = false
      let headerEndIndex = -1
      
      // Check for header separator row
      for (let i = 0; i < currentTableRows.length; i++) {
        const row = currentTableRows[i]
        if (row.length === 1 && row[0].match(/^[\s\-\|]+$/)) {
          hasHeaderSeparator = true
          headerEndIndex = i
          break
        }
      }
      
      if (hasHeaderSeparator && headerEndIndex > 0) {
        // Render header
        htmlParts.push('<thead class="bg-gray-50">')
        htmlParts.push('<tr>')
        currentTableRows[0].forEach(cell => {
          const cellContent = parseInlineFormatting(cell.trim())
          htmlParts.push(`<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${cellContent}</th>`)
        })
        htmlParts.push('</tr>')
        htmlParts.push('</thead>')
        
        // Render body
        htmlParts.push('<tbody class="bg-white divide-y divide-gray-200">')
        for (let i = headerEndIndex + 1; i < currentTableRows.length; i++) {
          htmlParts.push('<tr>')
          currentTableRows[i].forEach(cell => {
            const cellContent = parseInlineFormatting(cell.trim())
            htmlParts.push(`<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cellContent}</td>`)
          })
          htmlParts.push('</tr>')
        }
        htmlParts.push('</tbody>')
      } else {
        // Render as simple table without header
        htmlParts.push('<tbody class="bg-white divide-y divide-gray-200">')
        currentTableRows.forEach(row => {
          htmlParts.push('<tr>')
          row.forEach(cell => {
            const cellContent = parseInlineFormatting(cell.trim())
            htmlParts.push(`<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cellContent}</td>`)
          })
          htmlParts.push('</tr>')
        })
        htmlParts.push('</tbody>')
      }
      
      htmlParts.push('</table>')
      currentTableRows = []
      inTable = false
    }
  }

  lines.forEach((line) => {    
    // Code blocks
    if (line.trim().startsWith('#+BEGIN_SRC')) {
      flushList()
      const language = line.trim().replace('#+BEGIN_SRC', '').trim()
      currentCodeBlock = { language, code: '' }
      inCodeBlock = true
      return
    }
    
    if (line.trim() === '#+END_SRC' && inCodeBlock) {
      flushCodeBlock()
      inCodeBlock = false
      return
    }
    
    if (inCodeBlock && currentCodeBlock) {
      currentCodeBlock.code += (currentCodeBlock.code ? '\n' : '') + line
      return
    }

    // Tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      flushList()
      if (!inTable) {
        inTable = true
        currentTableRows = []
      }
      
      // Parse table row - check if it's a separator row
      const trimmedLine = line.trim()
      if (trimmedLine.match(/^\|[\s\-\|]+\|$/)) {
        // This is a header separator row
        currentTableRows.push([trimmedLine])
      } else {
        // Regular table row
        const cells = trimmedLine.split('|').slice(1, -1) // Remove first and last empty strings
        currentTableRows.push(cells)
      }
      return
    } else if (inTable) {
      // End of table
      flushTable()
    }

    // Headers
    if (line.startsWith('*')) {
      flushList()
      flushTable()
      const level = line.match(/^\*+/)?.[0].length || 1
      const text = line.replace(/^\*+\s*/, '')
      const clampedLevel = Math.min(level, 6)
      const headerClasses = {
        1: "text-3xl font-bold text-gray-900 mb-4 mt-8 first:mt-0",
        2: "text-2xl font-semibold text-gray-800 mb-3 mt-6",
        3: "text-xl font-semibold text-gray-800 mb-3 mt-5",
        4: "text-lg font-semibold text-gray-700 mb-2 mt-4",
        5: "text-base font-semibold text-gray-700 mb-2 mt-3",
        6: "text-sm font-semibold text-gray-700 mb-2 mt-3"
      }[clampedLevel]

      htmlParts.push(`<h${clampedLevel} class="${headerClasses}">${parseInlineFormatting(text)}</h${clampedLevel}>`)
      return
    }

    // Lists
    if (line.trim().startsWith('- ') || line.trim().match(/^\d+\.\s/)) {
      flushTable()
      const text = line.trim().replace(/^[-\d+\.]\s*/, '')
      currentListItems.push(text)
      return
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim().match(/^-{3,}$/)) {
      flushList()
      flushTable()
      htmlParts.push('<hr class="border-gray-300 my-8" />')
      return
    }

    // Empty lines
    if (line.trim() === '') {
      flushList()
      flushTable()
      return
    }

    // Regular paragraphs
    if (line.trim()) {
      flushList()
      flushTable()
      htmlParts.push(`<p class="text-gray-700 leading-relaxed mb-4">${parseInlineFormatting(line.trim())}</p>`)
    }
  })

  // Flush any remaining items
  flushList()
  flushCodeBlock()
  flushTable()

  return { metadata, htmlContent: htmlParts.join('') }
}

describe('Org Parser', () => {
  describe('Metadata extraction', () => {
    it('should extract title metadata', () => {
      const content = `#+title: My Document
This is content.`
      const { metadata, cleanedContent } = extractMetadata(content)
      
      expect(metadata.title).toBe('My Document')
      expect(cleanedContent.trim()).toBe('This is content.')
    })

    it('should extract category metadata', () => {
      const content = `#+category: Technology
Content here`
      const { metadata } = extractMetadata(content)
      
      expect(metadata.category).toBe('Technology')
    })

    it('should extract tags metadata', () => {
      const content = `#+tags: react typescript web
Content here`
      const { metadata } = extractMetadata(content)
      
      expect(metadata.tags).toEqual(['react', 'typescript', 'web'])
    })

    it('should extract PROPERTIES block', () => {
      const content = `:PROPERTIES:
:ID: 123-456-789
:END:
Content here`
      const { metadata, cleanedContent } = extractMetadata(content)
      
      expect(metadata.id).toBe('123-456-789')
      expect(cleanedContent.trim()).toBe('Content here')
    })

    it('should skip duplicate metadata', () => {
      const content = `#+title: First Title
#+title: Second Title
Content here`
      const { metadata } = extractMetadata(content)
      
      expect(metadata.title).toBe('First Title')
    })
  })

  describe('HTML generation', () => {
    it('should render simple paragraphs', () => {
      const content = 'This is a simple paragraph.'
      const { htmlContent } = parseOrgContent(content)
      
      expect(htmlContent).toBe('<p class="text-gray-700 leading-relaxed mb-4">This is a simple paragraph.</p>')
    })

    it('should render headers with correct levels', () => {
      const content = `* Level 1
** Level 2
*** Level 3`
      const { htmlContent } = parseOrgContent(content)
      
      expect(htmlContent).toContain('<h1 class="text-3xl font-bold text-gray-900 mb-4 mt-8 first:mt-0">Level 1</h1>')
      expect(htmlContent).toContain('<h2 class="text-2xl font-semibold text-gray-800 mb-3 mt-6">Level 2</h2>')
      expect(htmlContent).toContain('<h3 class="text-xl font-semibold text-gray-800 mb-3 mt-5">Level 3</h3>')
    })

    it('should render lists', () => {
      const content = `- First item
- Second item
- Third item`
      const { htmlContent } = parseOrgContent(content)
      
      expect(htmlContent).toContain('<ul class="list-disc list-inside mb-4 ml-4 space-y-1">')
      expect(htmlContent).toContain('<li class="text-gray-700">First item</li>')
      expect(htmlContent).toContain('<li class="text-gray-700">Second item</li>')
      expect(htmlContent).toContain('<li class="text-gray-700">Third item</li>')
      expect(htmlContent).toContain('</ul>')
    })

    it('should render code blocks', () => {
      const content = `#+BEGIN_SRC javascript
console.log('Hello');
const x = 42;
#+END_SRC`
      const { htmlContent } = parseOrgContent(content)
      
      expect(htmlContent).toContain('<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm">')
      expect(htmlContent).toContain('<code>console.log(&#x27;Hello&#x27;);\nconst x = 42;</code>')
      expect(htmlContent).toContain('</pre>')
    })

    it('should render inline formatting', () => {
      const content = 'Text with *bold*, /italic/, =code=, and +strikethrough+ formatting.'
      const { htmlContent } = parseOrgContent(content)
      
      expect(htmlContent).toContain('<strong class="font-semibold text-gray-900">bold</strong>')
      expect(htmlContent).toContain('<em class="italic">italic</em>')
      expect(htmlContent).toContain('<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">code</code>')
      expect(htmlContent).toContain('<del class="line-through text-gray-500">strikethrough</del>')
    })

    it('should render links correctly', () => {
      const content = 'Visit [[https://example.com][Example]] and [[internal-page]].'
      const { htmlContent } = parseOrgContent(content)
      
      expect(htmlContent).toContain('<a href="https://example.com" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">Example</a>')
      expect(htmlContent).toContain('<a href="internal-page" class="text-blue-600 hover:text-blue-800 underline">internal-page</a>')
    })

    it('should render horizontal rules', () => {
      const content = `Before
---
After`
      const { htmlContent } = parseOrgContent(content)
      
      expect(htmlContent).toContain('<hr class="border-gray-300 my-8" />')
    })
  })

  describe('HTML escaping', () => {
    it('should escape HTML in content', () => {
      const content = 'This has <script>alert("xss")</script> content.'
      const { htmlContent } = parseOrgContent(content)
      
      expect(htmlContent).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
      expect(htmlContent).not.toContain('<script>alert')
    })

    it('should escape HTML in code blocks', () => {
      const content = `#+BEGIN_SRC html
<div>Hello</div>
<script>alert('xss')</script>
#+END_SRC`
      const { htmlContent } = parseOrgContent(content)
      
      expect(htmlContent).toContain('&lt;div&gt;Hello&lt;/div&gt;')
      expect(htmlContent).toContain('&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;')
      expect(htmlContent).not.toContain('<script>')
    })

    it('should escape HTML in links', () => {
      const content = 'Visit [[javascript:alert("xss")][<script>Bad</script>]].'
      const { htmlContent } = parseOrgContent(content)
      
      expect(htmlContent).toContain('javascript:alert(&quot;xss&quot;)')
      expect(htmlContent).toContain('&lt;script&gt;Bad&lt;/script&gt;')
    })
  })

  describe('Tables', () => {
    it('should render simple tables', () => {
      const content = `| Name | Age | City |
|------|-----|------|
| John | 25  | NYC  |
| Jane | 30  | LA   |`
      const { htmlContent } = parseOrgContent(content)
      
      expect(htmlContent).toContain('<table class="min-w-full divide-y divide-gray-200 border">')
      expect(htmlContent).toContain('<thead class="bg-gray-50">')
      expect(htmlContent).toContain('<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>')
      expect(htmlContent).toContain('<tbody class="bg-white divide-y divide-gray-200">')
      expect(htmlContent).toContain('<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">John</td>')
    })

    it('should render tables without header separators', () => {
      const content = `| Name | Age |
| John | 25  |
| Jane | 30  |`
      const { htmlContent } = parseOrgContent(content)
      
      expect(htmlContent).toContain('<table class="min-w-full divide-y divide-gray-200 border">')
      expect(htmlContent).toContain('<tr>')
      expect(htmlContent).toContain('<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Name</td>')
    })

    it('should handle empty table cells', () => {
      const content = `| Name |   | City |
| John |   | NYC  |`
      const { htmlContent } = parseOrgContent(content)
      
      expect(htmlContent).toContain('<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>')
    })

    it('should handle tables with inline formatting', () => {
      const content = `| Name | *Bold* | =Code= |
| John | /italic/ | ~verb~ |`
      const { htmlContent } = parseOrgContent(content)
      
      expect(htmlContent).toContain('<strong class="font-semibold text-gray-900">Bold</strong>')
      expect(htmlContent).toContain('<em class="italic">italic</em>')
    })
  })

  describe('Complex content', () => {
    it('should handle complete document with all elements', () => {
      const content = `#+title: Complex Document
#+category: Mixed
#+tags: test example

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

      const { metadata, htmlContent } = parseOrgContent(content)
      
      // Check metadata
      expect(metadata.title).toBe('Complex Document')
      expect(metadata.category).toBe('Mixed')
      expect(metadata.tags).toEqual(['test', 'example'])
      
      // Check HTML elements are present
      expect(htmlContent).toContain('<h1')
      expect(htmlContent).toContain('<h2')
      expect(htmlContent).toContain('<p')
      expect(htmlContent).toContain('<strong')
      expect(htmlContent).toContain('<em')
      expect(htmlContent).toContain('<ul')
      expect(htmlContent).toContain('<li')
      expect(htmlContent).toContain('<code')
      expect(htmlContent).toContain('<pre')
      expect(htmlContent).toContain('<hr')
      expect(htmlContent).toContain('<a href="https://example.com"')
    })

    it('should handle empty lines properly', () => {
      const content = `First paragraph.


Second paragraph after empty lines.

* Header

Another paragraph.`

      const { htmlContent } = parseOrgContent(content)
      
      expect(htmlContent).toContain('First paragraph.')
      expect(htmlContent).toContain('Second paragraph after empty lines.')
      expect(htmlContent).toContain('Another paragraph.')
    })

    it('should handle malformed code blocks gracefully', () => {
      const content = `#+BEGIN_SRC javascript
console.log('missing end tag')`

      const { htmlContent } = parseOrgContent(content)
      
      // Should still generate some HTML
      expect(htmlContent).toBeTruthy()
    })
  })
})