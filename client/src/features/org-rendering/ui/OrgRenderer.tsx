import { Icon } from "@iconify/react";
import rehypeShiki from "@shikijs/rehype";
import { useEffect, useState } from "react";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";
import uniorgParse from "uniorg-parse";
import uniorg2rehype from "uniorg-rehype";
import {
  formatDate,
  formatOrgDate,
  formatOrgTimestamp,
  type OrgTimestamp,
} from "../../../shared/lib/date-utils";

interface OrgRendererProps {
  /**
   * The org-mode content to render
   */
  content: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether to show syntax highlighting for code blocks
   */
  enableSyntaxHighlight?: boolean;
}

// Extract and parse metadata from org content
interface OrgMetadata {
  title?: string;
  category?: string;
  tags?: string[];
  id?: string;
  author?: string;
  date?: string;
  scheduled?: string;
  deadline?: string;
  // Enhanced timestamp objects from uniorg AST
  scheduledTimestamp?: OrgTimestamp;
  deadlineTimestamp?: OrgTimestamp;
}

function extractMetadata(content: string): { metadata: OrgMetadata; cleanedContent: string } {
  const lines = content.split("\n");
  const cleanedLines: string[] = [];
  const metadata: OrgMetadata = {};

  let seenProperties = false;
  let seenTitle = false;
  let inPropertiesBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Track PROPERTIES blocks
    if (trimmed === ":PROPERTIES:") {
      if (seenProperties) continue; // Skip duplicate PROPERTIES block
      seenProperties = true;
      inPropertiesBlock = true;
      continue; // Don't include in cleaned content
    } else if (trimmed === ":END:" && inPropertiesBlock) {
      inPropertiesBlock = false;
      continue; // Don't include in cleaned content
    } else if (inPropertiesBlock) {
      // Extract ID from properties
      if (trimmed.startsWith(":ID:")) {
        metadata.id = trimmed.replace(":ID:", "").trim();
      }
      continue; // Don't include properties in cleaned content
    }

    // Extract metadata from #+lines
    if (trimmed.startsWith("#+title:")) {
      if (!seenTitle) {
        metadata.title = trimmed.replace("#+title:", "").trim();
        seenTitle = true;
      }
      continue; // Don't include in cleaned content
    }

    if (trimmed.startsWith("#+category:")) {
      metadata.category = trimmed.replace("#+category:", "").trim();
      continue; // Don't include in cleaned content
    }

    if (trimmed.startsWith("#+tags:")) {
      metadata.tags = trimmed
        .replace("#+tags:", "")
        .trim()
        .split(/\s+/)
        .filter((t) => t.length > 0);
      continue; // Don't include in cleaned content
    }

    if (trimmed.startsWith("#+author:")) {
      metadata.author = trimmed.replace("#+author:", "").trim();
      continue; // Don't include in cleaned content
    }

    if (trimmed.startsWith("#+date:")) {
      metadata.date = trimmed.replace("#+date:", "").trim();
      continue; // Don't include in cleaned content
    }

    // Extract SCHEDULED and DEADLINE timestamps
    if (trimmed.includes("SCHEDULED:")) {
      const scheduledMatch = trimmed.match(/SCHEDULED:\s*([^>\]]+[>\]])/);
      if (scheduledMatch) {
        metadata.scheduled = scheduledMatch[1];
      }
    }

    if (trimmed.includes("DEADLINE:")) {
      const deadlineMatch = trimmed.match(/DEADLINE:\s*([^>\]]+[>\]])/);
      if (deadlineMatch) {
        metadata.deadline = deadlineMatch[1];
      }
    }

    // Skip other org metadata BUT NOT code blocks
    if (
      trimmed.startsWith("#+") &&
      !trimmed.startsWith("#+BEGIN_SRC") &&
      !trimmed.startsWith("#+END_SRC")
    ) {
      continue;
    }

    // Skip duplicate PROPERTIES or ID lines after we've seen them
    if (
      seenProperties &&
      !inPropertiesBlock &&
      (trimmed === ":PROPERTIES:" || trimmed.startsWith(":ID:") || trimmed === ":END:")
    ) {
      continue;
    }

    cleanedLines.push(line);
  }

  return {
    metadata,
    cleanedContent: cleanedLines.join("\n"),
  };
}

// Metadata display component
function MetadataDisplay({ metadata }: { metadata: OrgMetadata }) {
  const hasMetadata = Object.values(metadata).some((v) => v !== undefined && v !== null);

  if (!hasMetadata) return null;

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
            <span className="text-gray-600">作成日:</span>
            <span className="font-medium text-gray-900">
              {formatDate(metadata.date, { format: "medium" })}
            </span>
          </div>
        )}

        {(metadata.scheduledTimestamp || metadata.scheduled) && (
          <div className="flex items-center gap-2">
            <Icon icon="lucide:clock" className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600">予定:</span>
            {(() => {
              // Use enhanced timestamp object if available, fallback to string parsing
              const result = metadata.scheduledTimestamp
                ? formatOrgTimestamp(metadata.scheduledTimestamp, "scheduled")
                : formatOrgDate(metadata.scheduled, "scheduled");

              const { display, isToday, isSoon, isRange } = result;
              return (
                <span
                  className={`font-medium ${isToday ? "text-blue-700 bg-blue-50 px-2 py-1 rounded" : isSoon ? "text-blue-600" : "text-gray-900"}`}
                >
                  {isRange && <Icon icon="lucide:arrow-right" className="inline w-3 h-3 mr-1" />}
                  {display}
                </span>
              );
            })()}
          </div>
        )}

        {(metadata.deadlineTimestamp || metadata.deadline) && (
          <div className="flex items-center gap-2">
            <Icon icon="lucide:alert-triangle" className="w-4 h-4 text-red-600" />
            <span className="text-gray-600">締切:</span>
            {(() => {
              // Use enhanced timestamp object if available, fallback to string parsing
              const result = metadata.deadlineTimestamp
                ? formatOrgTimestamp(metadata.deadlineTimestamp, "deadline")
                : formatOrgDate(metadata.deadline, "deadline");

              const { display, isOverdue, isToday, isSoon, isRange } = result;
              return (
                <span
                  className={`font-medium ${
                    isOverdue
                      ? "text-red-700 bg-red-50 px-2 py-1 rounded"
                      : isToday
                        ? "text-orange-700 bg-orange-50 px-2 py-1 rounded"
                        : isSoon
                          ? "text-orange-600"
                          : "text-gray-900"
                  }`}
                >
                  {isRange && <Icon icon="lucide:arrow-right" className="inline w-3 h-3 mr-1" />}
                  {display}
                </span>
              );
            })()}
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
              {metadata.tags.map((tag, _index) => (
                <span
                  key={tag}
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
  );
}

// Extract timestamp information from uniorg AST
function extractTimestampsFromAST(ast: any): {
  scheduledTimestamp?: OrgTimestamp;
  deadlineTimestamp?: OrgTimestamp;
} {
  const result: { scheduledTimestamp?: OrgTimestamp; deadlineTimestamp?: OrgTimestamp } = {};

  function traverse(node: any) {
    if (node.type === "planning") {
      if (node.scheduled && node.scheduled.type === "timestamp") {
        result.scheduledTimestamp = node.scheduled as OrgTimestamp;
      }
      if (node.deadline && node.deadline.type === "timestamp") {
        result.deadlineTimestamp = node.deadline as OrgTimestamp;
      }
    }

    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  traverse(ast);
  return result;
}

// Uniorg-based org-mode parser function to HTML with Shiki syntax highlighting
async function parseOrgContent(
  content: string,
  enableSyntaxHighlight = true,
): Promise<{ metadata: OrgMetadata; htmlContent: string }> {
  try {
    // First, extract metadata and get cleaned content
    const { metadata, cleanedContent } = extractMetadata(content);

    // Parse with uniorg to get AST for timestamp extraction
    const astProcessor = unified().use(uniorgParse);
    const ast = astProcessor.parse(content);

    // Extract enhanced timestamp information from AST
    const { scheduledTimestamp, deadlineTimestamp } = extractTimestampsFromAST(ast);

    // Merge AST-based timestamp info with string-based metadata
    const enhancedMetadata: OrgMetadata = {
      ...metadata,
      scheduledTimestamp,
      deadlineTimestamp,
    };

    // Create uniorg processor with Shiki syntax highlighting
    const processorBuilder = unified().use(uniorgParse).use(uniorg2rehype);

    // Add Shiki syntax highlighting if enabled
    if (enableSyntaxHighlight) {
      processorBuilder.use(rehypeShiki as any, {
        themes: {
          light: "github-light",
          dark: "github-dark",
        },
        defaultTheme: "light",
        // Popular languages for coding - only commonly supported ones
        langs: [
          "javascript",
          "typescript",
          "jsx",
          "tsx",
          "python",
          "java",
          "go",
          "rust",
          "cpp",
          "c",
          "bash",
          "shell",
          "json",
          "yaml",
          "xml",
          "html",
          "css",
          "scss",
          "sql",
          "markdown",
          "php",
          "ruby",
          "dockerfile",
        ],
        // Custom styling to integrate with Tailwind CSS
        defaultColor: false,
      });
    }

    const processor = processorBuilder.use(rehypeStringify, { allowDangerousHtml: true });

    // Process the cleaned content
    const result = await processor.process(cleanedContent);
    let htmlContent = String(result);

    // Apply enhanced Tailwind CSS classes including TODO keyword styling
    htmlContent = addEnhancedTailwindClasses(htmlContent, enableSyntaxHighlight);

    return { metadata: enhancedMetadata, htmlContent };
  } catch (error) {
    console.error("Error parsing org content with uniorg:", error);
    // Fallback to basic parsing if uniorg fails
    const { metadata } = extractMetadata(content);
    return {
      metadata,
      htmlContent: `<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> Failed to parse org-mode content with uniorg.
        <pre class="mt-2 text-sm">${String(error)}</pre>
      </div>`,
    };
  }
}

// Helper function to get TODO keyword colors
function getTodoKeywordColor(keyword: string): string {
  const colors: Record<string, string> = {
    TODO: "bg-orange-100 text-orange-800",
    DONE: "bg-green-100 text-green-800",
    DOING: "bg-blue-100 text-blue-800",
    NEXT: "bg-purple-100 text-purple-800",
    WAITING: "bg-yellow-100 text-yellow-800",
    CANCELLED: "bg-gray-100 text-gray-800",
    CANCELED: "bg-gray-100 text-gray-800",
  };
  return colors[keyword] || "bg-gray-100 text-gray-800";
}

// Helper function to get header classes by level
function getHeaderClass(level: string): string {
  const classes: Record<string, string> = {
    "1": "text-3xl font-bold text-gray-900 mb-4 mt-8 first:mt-0",
    "2": "text-2xl font-semibold text-gray-800 mb-3 mt-6",
    "3": "text-xl font-semibold text-gray-800 mb-3 mt-5",
    "4": "text-lg font-semibold text-gray-700 mb-2 mt-4",
    "5": "text-base font-semibold text-gray-700 mb-2 mt-3",
    "6": "text-sm font-semibold text-gray-700 mb-2 mt-3",
  };
  return classes[level] || "text-base font-semibold text-gray-700";
}

// Apply enhanced Tailwind CSS classes with improved TODO keyword handling
function addEnhancedTailwindClasses(html: string, _enableSyntaxHighlight = true): string {
  let processedHtml = html;

  // Step 1: Replace uniorg's default TODO keyword spans with styled badges
  const todoKeywords = ["TODO", "DONE", "DOING", "NEXT", "WAITING", "CANCELLED", "CANCELED"];
  todoKeywords.forEach((keyword) => {
    const defaultSpan = `<span class="todo-keyword ${keyword}">${keyword}</span>`;
    const styledSpan = `<span class="inline-flex items-center px-2 py-1 text-xs font-medium ${getTodoKeywordColor(keyword)} rounded-full mr-2">${keyword}</span>`;
    processedHtml = processedHtml.replace(
      new RegExp(defaultSpan.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      styledSpan,
    );
  });

  // Step 2: Handle additional TODO keywords that uniorg might not detect
  const additionalKeywords = ["DOING", "NEXT", "WAITING", "CANCELLED", "CANCELED"];
  additionalKeywords.forEach((keyword) => {
    // Pattern: <h1>DOING some task</h1> -> <h1 class="..."><span class="...">DOING</span>some task</h1>
    const pattern = new RegExp(`<h([1-6])>${keyword}\\s+([^<]*)</h([1-6])>`, "g");
    processedHtml = processedHtml.replace(pattern, (_match, level, text, closingLevel) => {
      const headerClass = getHeaderClass(level);
      const todoColors = getTodoKeywordColor(keyword);
      const styledKeyword = `<span class="inline-flex items-center px-2 py-1 text-xs font-medium ${todoColors} rounded-full mr-2">${keyword}</span>`;
      return `<h${level} class="${headerClass}">${styledKeyword}${text.trim()}</h${closingLevel}>`;
    });
  });

  // Step 3: Style timestamp elements
  processedHtml = processedHtml.replace(
    /<span class="timestamp">([^<]*)<\/span>/g,
    (_, content) => {
      // Decode HTML entities
      const decodedContent = content
        .replace(/&#x3C;/g, "<")
        .replace(/&#x3E;/g, ">")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");

      // Check if it's a range (contains --)
      const isRange = decodedContent.includes("--");

      if (isRange) {
        // Handle timestamp ranges like <2025-01-15 Wed 14:30>--<2025-01-15 Wed 16:00>
        const rangeParts = decodedContent.split("--");
        if (rangeParts.length === 2) {
          const startTime = rangeParts[0].trim().replace(/^[<\[]|[>\]]$/g, "");
          const endTime = rangeParts[1].trim().replace(/^[<\[]|[>\]]$/g, "");

          return `<span class="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>${startTime}</span>
            <svg class="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5-5 5M6 12h12" />
            </svg>
            <span>${endTime}</span>
          </span>`;
        }
      }

      // Handle single timestamps
      const isActive = decodedContent.startsWith("<") && decodedContent.endsWith(">");
      const isInactive = decodedContent.startsWith("[") && decodedContent.endsWith("]");

      if (isActive) {
        const cleanContent = decodedContent.replace(/^[<\[]|[>\]]$/g, "");
        return `<span class="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ${cleanContent}
        </span>`;
      } else if (isInactive) {
        const cleanContent = decodedContent.replace(/^[<\[]|[>\]]$/g, "");
        return `<span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-md text-sm">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          ${cleanContent}
        </span>`;
      }

      // Fallback for other timestamp formats
      const cleanContent = decodedContent.replace(/^[<\[]|[>\]]$/g, "");
      return `<span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-sm">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        ${cleanContent}
      </span>`;
    },
  );

  // Step 4: Apply standard Tailwind classes
  return (
    processedHtml
      // Headers (only add classes if not already present)
      .replace(
        /<h1(?![^>]*class=)([^>]*)>/g,
        '<h1$1 class="text-3xl font-bold text-gray-900 mb-4 mt-8 first:mt-0">',
      )
      .replace(
        /<h2(?![^>]*class=)([^>]*)>/g,
        '<h2$1 class="text-2xl font-semibold text-gray-800 mb-3 mt-6">',
      )
      .replace(
        /<h3(?![^>]*class=)([^>]*)>/g,
        '<h3$1 class="text-xl font-semibold text-gray-800 mb-3 mt-5">',
      )
      .replace(
        /<h4(?![^>]*class=)([^>]*)>/g,
        '<h4$1 class="text-lg font-semibold text-gray-700 mb-2 mt-4">',
      )
      .replace(
        /<h5(?![^>]*class=)([^>]*)>/g,
        '<h5$1 class="text-base font-semibold text-gray-700 mb-2 mt-3">',
      )
      .replace(
        /<h6(?![^>]*class=)([^>]*)>/g,
        '<h6$1 class="text-sm font-semibold text-gray-700 mb-2 mt-3">',
      )
      // Paragraphs
      .replace(/<p([^>]*)>/g, '<p$1 class="text-gray-700 leading-relaxed mb-4">')
      // Lists
      .replace(/<ul([^>]*)>/g, '<ul$1 class="list-disc list-inside mb-4 ml-4 space-y-1">')
      .replace(/<ol([^>]*)>/g, '<ol$1 class="list-decimal list-inside mb-4 ml-4 space-y-1">')
      .replace(/<li([^>]*)>/g, '<li$1 class="text-gray-700">')
      // Code - handle both Shiki-styled and regular code blocks
      .replace(
        /<code(?![^>]*class=[^>]*shiki)([^>]*)>/g,
        '<code$1 class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">',
      )
      .replace(
        /<pre(?![^>]*class=[^>]*shiki)([^>]*)>/g,
        '<pre$1 class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm">',
      )
      // Shiki code blocks - enhance styling while letting CSS handle background colors
      .replace(
        /<pre class="shiki([^"]*)"([^>]*)>/g,
        '<pre class="shiki$1 rounded-lg overflow-x-auto mb-4 text-sm border border-gray-200 shadow-sm p-4"$2>',
      )
      .replace(/<code class="shiki([^"]*)"([^>]*)>/g, '<code class="shiki$1 block"$2>')
      // Tables
      .replace(/<table([^>]*)>/g, '<table$1 class="min-w-full divide-y divide-gray-200 border">')
      .replace(
        /<th([^>]*)>/g,
        '<th$1 class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">',
      )
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
  );
}

export function OrgRenderer({
  content,
  className = "",
  enableSyntaxHighlight = true,
}: OrgRendererProps) {
  const [metadata, setMetadata] = useState<OrgMetadata>({});
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function processContent() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await parseOrgContent(content, enableSyntaxHighlight);
        setMetadata(result.metadata);
        setHtmlContent(result.htmlContent);
      } catch (err) {
        console.error("Error processing org content:", err);
        const error = err as Error;
        setError(error);
        setMetadata({});
        setHtmlContent(`<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> Failed to render org-mode content.
          <pre class="mt-2 text-sm">${String(error)}</pre>
        </div>`);
      } finally {
        setIsLoading(false);
      }
    }

    processContent();
  }, [content, enableSyntaxHighlight]);

  if (isLoading) {
    return (
      <div className={`max-w-none ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Parsing org-mode content...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-none ${className}`}>
      <MetadataDisplay metadata={metadata} />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: OrgRenderer needs to render parsed HTML content */}
      <div className="org-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}
