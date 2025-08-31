import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { unified } from 'unified'
import uniorgParse from 'uniorg-parse'
import uniorg2rehype from 'uniorg-rehype'
import rehypeStringify from 'rehype-stringify'

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
    
    // Skip other org metadata BUT NOT code blocks
    if (trimmed.startsWith('#+') && !trimmed.startsWith('#+BEGIN_SRC') && !trimmed.startsWith('#+END_SRC')) {
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

// Uniorg-based org-mode parser function to HTML
async function parseOrgContent(content: string): Promise<{ metadata: OrgMetadata; htmlContent: string }> {
  try {
    // First, extract metadata and get cleaned content
    const { metadata, cleanedContent } = extractMetadata(content)
    
    // Create uniorg processor - use default handlers first to ensure it works
    const processor = unified()
      .use(uniorgParse)
      .use(uniorg2rehype)
      .use(rehypeStringify, { allowDangerousHtml: true })
      .use(rehypeStringify)

    // Process the cleaned content
    const result = await processor.process(cleanedContent)
    let htmlContent = String(result)
    
    // Apply Tailwind CSS classes post-processing
    htmlContent = addTailwindClasses(htmlContent)

    return { metadata, htmlContent }
  } catch (error) {
    console.error('Error parsing org content with uniorg:', error)
    // Fallback to basic parsing if uniorg fails
    const { metadata } = extractMetadata(content)
    return {
      metadata,
      htmlContent: `<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> Failed to parse org-mode content with uniorg.
        <pre class="mt-2 text-sm">${String(error)}</pre>
      </div>`
    }
  }
}

// Post-process HTML to add Tailwind CSS classes
function addTailwindClasses(html: string): string {
  return html
    // Headers
    .replace(/<h1([^>]*)>/g, '<h1$1 class="text-3xl font-bold text-gray-900 mb-4 mt-8 first:mt-0">')
    .replace(/<h2([^>]*)>/g, '<h2$1 class="text-2xl font-semibold text-gray-800 mb-3 mt-6">')
    .replace(/<h3([^>]*)>/g, '<h3$1 class="text-xl font-semibold text-gray-800 mb-3 mt-5">')
    .replace(/<h4([^>]*)>/g, '<h4$1 class="text-lg font-semibold text-gray-700 mb-2 mt-4">')
    .replace(/<h5([^>]*)>/g, '<h5$1 class="text-base font-semibold text-gray-700 mb-2 mt-3">')
    .replace(/<h6([^>]*)>/g, '<h6$1 class="text-sm font-semibold text-gray-700 mb-2 mt-3">')
    // Paragraphs
    .replace(/<p([^>]*)>/g, '<p$1 class="text-gray-700 leading-relaxed mb-4">')
    // Lists
    .replace(/<ul([^>]*)>/g, '<ul$1 class="list-disc list-inside mb-4 ml-4 space-y-1">')
    .replace(/<ol([^>]*)>/g, '<ol$1 class="list-decimal list-inside mb-4 ml-4 space-y-1">')
    .replace(/<li([^>]*)>/g, '<li$1 class="text-gray-700">')
    // Code
    .replace(/<code([^>]*)>/g, '<code$1 class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">')
    .replace(/<pre([^>]*)>/g, '<pre$1 class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm">')
    // Tables
    .replace(/<table([^>]*)>/g, '<table$1 class="min-w-full divide-y divide-gray-200 border">')
    .replace(/<th([^>]*)>/g, '<th$1 class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">')
    .replace(/<td([^>]*)>/g, '<td$1 class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">')
    .replace(/<thead([^>]*)>/g, '<thead$1 class="bg-gray-50">')
    .replace(/<tbody([^>]*)>/g, '<tbody$1 class="bg-white divide-y divide-gray-200">')
    // Links
    .replace(/<a([^>]*)>/g, '<a$1 class="text-blue-600 hover:text-blue-800 underline">')
    // Strong and emphasis
    .replace(/<strong([^>]*)>/g, '<strong$1 class="font-semibold text-gray-900">')
    .replace(/<em([^>]*)>/g, '<em$1 class="italic">')
    // Horizontal rule
    .replace(/<hr([^>]*)>/g, '<hr$1 class="border-gray-300 my-8">')
}


export function OrgRenderer({ 
  content, 
  className = '', 
  enableSyntaxHighlight = true 
}: OrgRendererProps) {
  const [metadata, setMetadata] = useState<OrgMetadata>({})
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function processContent() {
      setIsLoading(true)
      setError(null)
      
      try {
        const result = await parseOrgContent(content)
        setMetadata(result.metadata)
        setHtmlContent(result.htmlContent)
      } catch (err) {
        console.error('Error processing org content:', err)
        const error = err as Error
        setError(error)
        setMetadata({})
        setHtmlContent(`<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> Failed to render org-mode content.
          <pre class="mt-2 text-sm">${String(error)}</pre>
        </div>`)
      } finally {
        setIsLoading(false)
      }
    }

    processContent()
  }, [content, enableSyntaxHighlight])

  if (isLoading) {
    return (
      <div className={`max-w-none ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Parsing org-mode content...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-none ${className}`}>
      <MetadataDisplay metadata={metadata} />
      <div 
        className="org-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  )
}

