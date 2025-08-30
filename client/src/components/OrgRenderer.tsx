import React, { useMemo } from 'react'
import { Icon } from '@iconify/react'

interface OrgRendererProps {
  /**
   * The org-mode content to render
   */
  content: string
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Whether to show syntax highlighting for code blocks
   */
  enableSyntaxHighlight?: boolean
}

// Custom components for org-mode elements
const components = {
  // Headers with proper styling
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-8 first:mt-0" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-semibold text-gray-800 mb-3 mt-6" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-5" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="text-lg font-semibold text-gray-700 mb-2 mt-4" {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h5 className="text-base font-semibold text-gray-700 mb-2 mt-3" {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h6 className="text-sm font-semibold text-gray-700 mb-2 mt-3" {...props}>
      {children}
    </h6>
  ),
  
  // Paragraphs
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-gray-700 leading-relaxed mb-4" {...props}>
      {children}
    </p>
  ),
  
  // Lists
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside mb-4 ml-4 space-y-1" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside mb-4 ml-4 space-y-1" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-gray-700" {...props}>
      {children}
    </li>
  ),
  
  // Links
  a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      className="text-blue-600 hover:text-blue-800 underline"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  ),
  
  // Code
  code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => {
    const isInline = !className
    if (isInline) {
      return (
        <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      )
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
  
  // Code blocks
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm" {...props}>
      {children}
    </pre>
  ),
  
  // Blockquotes
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 italic bg-blue-50" {...props}>
      {children}
    </blockquote>
  ),
  
  // Tables
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full divide-y divide-gray-200 border" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-gray-50" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className="bg-white divide-y divide-gray-200" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" {...props}>
      {children}
    </td>
  ),
  
  // Horizontal rule
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="border-gray-300 my-8" {...props} />
  ),
  
  // Strong/Bold
  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-gray-900" {...props}>
      {children}
    </strong>
  ),
  
  // Emphasis/Italic
  em: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
  
  // Strikethrough
  del: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <del className="line-through text-gray-500" {...props}>
      {children}
    </del>
  ),
}

// Extract and parse metadata from org content
interface OrgMetadata {
  title?: string
  category?: string
  tags?: string[]
  id?: string
  author?: string
  date?: string
}

function extractMetadata(content: string): { metadata: OrgMetadata; cleanedContent: string } {
  const lines = content.split('\n')
  const cleanedLines: string[] = []
  const metadata: OrgMetadata = {}
  
  let seenProperties = false
  let seenTitle = false
  let inPropertiesBlock = false

  for (const line of lines) {
    const trimmed = line.trim()
    
    // Track PROPERTIES blocks
    if (trimmed === ':PROPERTIES:') {
      if (seenProperties) continue // Skip duplicate PROPERTIES block
      seenProperties = true
      inPropertiesBlock = true
      continue // Don't include in cleaned content
    } else if (trimmed === ':END:' && inPropertiesBlock) {
      inPropertiesBlock = false
      continue // Don't include in cleaned content
    } else if (inPropertiesBlock) {
      // Extract ID from properties
      if (trimmed.startsWith(':ID:')) {
        metadata.id = trimmed.replace(':ID:', '').trim()
      }
      continue // Don't include properties in cleaned content
    }
    
    // Extract metadata from #+lines
    if (trimmed.startsWith('#+title:')) {
      if (!seenTitle) {
        metadata.title = trimmed.replace('#+title:', '').trim()
        seenTitle = true
      }
      continue // Don't include in cleaned content
    }
    
    if (trimmed.startsWith('#+category:')) {
      metadata.category = trimmed.replace('#+category:', '').trim()
      continue // Don't include in cleaned content
    }
    
    if (trimmed.startsWith('#+tags:')) {
      metadata.tags = trimmed.replace('#+tags:', '').trim().split(/\s+/).filter(t => t.length > 0)
      continue // Don't include in cleaned content
    }
    
    if (trimmed.startsWith('#+author:')) {
      metadata.author = trimmed.replace('#+author:', '').trim()
      continue // Don't include in cleaned content
    }
    
    if (trimmed.startsWith('#+date:')) {
      metadata.date = trimmed.replace('#+date:', '').trim()
      continue // Don't include in cleaned content
    }
    
    // Skip other org metadata
    if (trimmed.startsWith('#+')) {
      continue
    }
    
    // Skip duplicate PROPERTIES or ID lines after we've seen them
    if (seenProperties && !inPropertiesBlock && 
        (trimmed === ':PROPERTIES:' || trimmed.startsWith(':ID:') || trimmed === ':END:')) {
      continue
    }
    
    cleanedLines.push(line)
  }
  
  return {
    metadata,
    cleanedContent: cleanedLines.join('\n')
  }
}

// Metadata display component
function MetadataDisplay({ metadata }: { metadata: OrgMetadata }) {
  const hasMetadata = Object.values(metadata).some(v => v !== undefined && v !== null)
  
  if (!hasMetadata) return null
  
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon icon="lucide:info" className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Metadata</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        {metadata.title && (
          <div className="flex items-center gap-2">
            <Icon icon="lucide:heading" className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600">Title:</span>
            <span className="font-medium text-gray-900">{metadata.title}</span>
          </div>
        )}
        
        {metadata.category && (
          <div className="flex items-center gap-2">
            <Icon icon="lucide:folder" className="w-4 h-4 text-green-600" />
            <span className="text-gray-600">Category:</span>
            <span className="font-medium text-gray-900">{metadata.category}</span>
          </div>
        )}
        
        {metadata.author && (
          <div className="flex items-center gap-2">
            <Icon icon="lucide:user" className="w-4 h-4 text-purple-600" />
            <span className="text-gray-600">Author:</span>
            <span className="font-medium text-gray-900">{metadata.author}</span>
          </div>
        )}
        
        {metadata.date && (
          <div className="flex items-center gap-2">
            <Icon icon="lucide:calendar" className="w-4 h-4 text-orange-600" />
            <span className="text-gray-600">Date:</span>
            <span className="font-medium text-gray-900">{metadata.date}</span>
          </div>
        )}
        
        {metadata.id && (
          <div className="flex items-center gap-2 col-span-1 md:col-span-2">
            <Icon icon="lucide:hash" className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">ID:</span>
            <code className="bg-white px-2 py-1 rounded text-xs font-mono text-gray-700 border">
              {metadata.id}
            </code>
          </div>
        )}
        
        {metadata.tags && metadata.tags.length > 0 && (
          <div className="flex items-start gap-2 col-span-1 md:col-span-2">
            <Icon icon="lucide:tags" className="w-4 h-4 text-indigo-600 mt-0.5" />
            <span className="text-gray-600">Tags:</span>
            <div className="flex flex-wrap gap-1">
              {metadata.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Simple org-mode parser function
function parseOrgContent(content: string): { metadata: OrgMetadata; elements: React.ReactNode[] } {
  // First, extract metadata and get cleaned content
  const { metadata, cleanedContent } = extractMetadata(content)
  const lines = cleanedContent.split('\n')
  const elements: React.ReactNode[] = []
  let currentListItems: string[] = []
  let currentCodeBlock: { language: string; code: string } | null = null
  let inCodeBlock = false

  const flushList = () => {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={elements.length} className="list-disc list-inside mb-4 ml-4 space-y-1">
          {currentListItems.map((item, index) => (
            <li key={index} className="text-gray-700">{parseInlineFormatting(item)}</li>
          ))}
        </ul>
      )
      currentListItems = []
    }
  }

  const flushCodeBlock = () => {
    if (currentCodeBlock) {
      elements.push(
        <pre key={elements.length} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm">
          <code>{currentCodeBlock.code}</code>
        </pre>
      )
      currentCodeBlock = null
    }
  }

  lines.forEach((line, index) => {
    
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

    // Headers
    if (line.startsWith('*')) {
      flushList()
      const level = line.match(/^\*+/)?.[0].length || 1
      const text = line.replace(/^\*+\s*/, '')
      const HeaderTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements
      const headerClasses = {
        1: "text-3xl font-bold text-gray-900 mb-4 mt-8 first:mt-0",
        2: "text-2xl font-semibold text-gray-800 mb-3 mt-6",
        3: "text-xl font-semibold text-gray-800 mb-3 mt-5",
        4: "text-lg font-semibold text-gray-700 mb-2 mt-4",
        5: "text-base font-semibold text-gray-700 mb-2 mt-3",
        6: "text-sm font-semibold text-gray-700 mb-2 mt-3"
      }[Math.min(level, 6)] as string

      elements.push(
        <HeaderTag key={index} className={headerClasses}>
          {parseInlineFormatting(text)}
        </HeaderTag>
      )
      return
    }

    // Lists
    if (line.trim().startsWith('- ') || line.trim().match(/^\d+\.\s/)) {
      const text = line.trim().replace(/^[-\d+\.]\s*/, '')
      currentListItems.push(text)
      return
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim().match(/^-{3,}$/)) {
      flushList()
      elements.push(<hr key={index} className="border-gray-300 my-8" />)
      return
    }

    // Empty lines
    if (line.trim() === '') {
      flushList()
      return
    }

    // Regular paragraphs
    if (line.trim()) {
      flushList()
      elements.push(
        <p key={index} className="text-gray-700 leading-relaxed mb-4">
          {parseInlineFormatting(line.trim())}
        </p>
      )
    }
  })

  // Flush any remaining items
  flushList()
  flushCodeBlock()

  return { metadata, elements }
}

// Parse inline formatting like *bold*, /italic/, =code=
function parseInlineFormatting(text: string): React.ReactNode {
  // This is a simplified implementation
  let result: React.ReactNode[] = []
  let remaining = text
  let key = 0

  // Process bold (*text*)
  remaining = remaining.replace(/\*([^*]+)\*/g, (_, content) => {
    const placeholder = `__BOLD_${key++}__`
    result.push(
      <strong key={placeholder} className="font-semibold text-gray-900">
        {content}
      </strong>
    )
    return placeholder
  })

  // Process italic (/text/)
  remaining = remaining.replace(/\/([^\/]+)\//g, (_, content) => {
    const placeholder = `__ITALIC_${key++}__`
    result.push(
      <em key={placeholder} className="italic">
        {content}
      </em>
    )
    return placeholder
  })

  // Process code (=text=)
  remaining = remaining.replace(/=([^=]+)=/g, (_, content) => {
    const placeholder = `__CODE_${key++}__`
    result.push(
      <code key={placeholder} className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
        {content}
      </code>
    )
    return placeholder
  })

  // Process links [[url][description]] or [[url]]
  remaining = remaining.replace(/\[\[([^\]]+)\](?:\[([^\]]+)\])?\]/g, (_, url, description) => {
    const placeholder = `__LINK_${key++}__`
    const isExternal = url.startsWith('http')
    result.push(
      <a
        key={placeholder}
        href={url}
        className="text-blue-600 hover:text-blue-800 underline"
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
      >
        {description || url}
      </a>
    )
    return placeholder
  })

  // Split by placeholders and build final result
  const parts = remaining.split(/(__[A-Z]+_\d+__)/g)
  const finalResult: React.ReactNode[] = []

  parts.forEach((part, index) => {
    if (part.startsWith('__') && part.endsWith('__')) {
      const component = result.find((r: any) => r.key === part)
      if (component) {
        finalResult.push(component)
      }
    } else if (part) {
      finalResult.push(part)
    }
  })

  return finalResult.length === 0 ? text : finalResult
}

export function OrgRenderer({ 
  content, 
  className = '', 
  enableSyntaxHighlight = true 
}: OrgRendererProps) {
  const { metadata, renderedElements, error } = useMemo(() => {
    try {
      const result = parseOrgContent(content)
      return {
        metadata: result.metadata,
        renderedElements: result.elements,
        error: null
      }
    } catch (error) {
      console.error('Error processing org content:', error)
      return {
        metadata: {},
        renderedElements: (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> Failed to render org-mode content.
            <pre className="mt-2 text-sm">{String(error)}</pre>
          </div>
        ),
        error: error
      }
    }
  }, [content, enableSyntaxHighlight])

  if (error) {
    return (
      <div className={`prose max-w-none ${className}`}>
        {renderedElements}
      </div>
    )
  }

  return (
    <div className={`prose max-w-none ${className}`}>
      <MetadataDisplay metadata={metadata} />
      {renderedElements}
    </div>
  )
}

// Export components for reuse
export { components as orgComponents }