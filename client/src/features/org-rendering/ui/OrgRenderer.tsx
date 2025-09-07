import { Icon } from "@iconify/react";
import rehypeShiki from "@shikijs/rehype";
import { useEffect, useState } from "react";
import rehypeKatex from "rehype-katex";
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
import { rehypeOrgEnhancements, type CustomClasses } from "../lib/rehype-org-enhancements";

interface UniorgNode {
  type: string;
  children?: unknown[];
  scheduled?: OrgTimestamp;
  deadline?: OrgTimestamp;
  [key: string]: unknown;
}

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
  /**
   * Custom CSS classes for various elements
   */
  customClasses?: CustomClasses;
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
function extractTimestampsFromAST(ast: UniorgNode): {
  scheduledTimestamp?: OrgTimestamp;
  deadlineTimestamp?: OrgTimestamp;
} {
  const result: { scheduledTimestamp?: OrgTimestamp; deadlineTimestamp?: OrgTimestamp } = {};

  function traverse(node: UniorgNode) {
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
        traverse(child as UniorgNode);
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
  customClasses?: CustomClasses,
): Promise<{ metadata: OrgMetadata; htmlContent: string }> {
  try {
    // First, extract metadata and get cleaned content
    const { metadata, cleanedContent } = extractMetadata(content);

    // Parse with uniorg to get AST for timestamp extraction
    const astProcessor = unified().use(uniorgParse);
    const ast = astProcessor.parse(content);

    // Extract enhanced timestamp information from AST
    const { scheduledTimestamp, deadlineTimestamp } = extractTimestampsFromAST(
      ast as unknown as UniorgNode,
    );

    // Merge AST-based timestamp info with string-based metadata
    const enhancedMetadata: OrgMetadata = {
      ...metadata,
      scheduledTimestamp,
      deadlineTimestamp,
    };

    // Create uniorg processor with Shiki syntax highlighting and KaTeX
    const processorBuilder = unified()
      .use(uniorgParse)
      // biome-ignore lint/suspicious/noExplicitAny: uniorg2rehype plugin typing incompatibility
      .use(uniorg2rehype as any, { allowDangerousHtml: true });

    // Add KaTeX math rendering
    processorBuilder.use(rehypeKatex);

    // Add Shiki syntax highlighting if enabled
    if (enableSyntaxHighlight) {
      // biome-ignore lint/suspicious/noExplicitAny: rehypeShiki plugin typing incompatibility
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

    // Add org-mode specific enhancements and Tailwind CSS classes
    processorBuilder.use(rehypeOrgEnhancements, { enableSyntaxHighlight, customClasses });

    const processor = processorBuilder.use(rehypeStringify, { allowDangerousHtml: true });

    // Process the cleaned content
    const result = await processor.process(cleanedContent);
    const htmlContent = String(result);

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

export function OrgRenderer({
  content,
  className = "",
  enableSyntaxHighlight = true,
  customClasses,
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
        const result = await parseOrgContent(content, enableSyntaxHighlight, customClasses);
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
  }, [content, enableSyntaxHighlight, customClasses]);

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
