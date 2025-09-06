import { Icon } from "@iconify/react";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Link, useNavigate, useParams } from "react-router-dom";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { LogbookDisplay } from "../../components/LogbookDisplay";
import { TimestampsDisplay } from "../../components/TimestampDisplay";
import type { BacklinkNode } from "../../entities/node";
import { useBacklinks, useDeleteNode, useForwardLinks, useNode } from "../../entities/node";
import { OrgRenderer } from "../../features/org-rendering";
import { extractPriority, PriorityLabel } from "../../shared/lib/priority-utils";
import { parseTimestamps } from "../../shared/lib/timestamp-utils";
import { TodoIcon } from "../../shared/lib/todo-utils";
import {
  replaceFootnoteReferencesWithLinks,
  getFootnoteDefId,
} from "../../shared/lib/footnote-utils";


import { Layout } from "../../widgets/layout";

// Simple function to remove frontmatter
function removeFrontmatter(content: string): string {
  const lines = content.split("\n");
  if (lines[0] === "---") {
    const endIndex = lines.findIndex((line, index) => index > 0 && line === "---");
    if (endIndex > 0) {
      return lines.slice(endIndex + 1).join("\n");
    }
  }
  return content;
}

// Enhanced content splitting with precise timestamp positioning
function splitContentWithTimestamps(content: string): {
  sections: Array<{
    type: "content" | "logbook" | "timestamps";
    content?: string;
    timestamps?: import("../../shared/lib/timestamp-utils").TimestampEntry[];
    originalLineNumber?: number;
  }>;
  footnotes: string;
  hasLogbook: boolean;
} {
  const lines = content.split("\n");
  const footnoteLines: string[] = [];
  const sections: Array<{
    type: "content" | "logbook" | "timestamps";
    content?: string;
    timestamps?: import("../../shared/lib/timestamp-utils").TimestampEntry[];
    originalLineNumber?: number;
  }> = [];

  // Parse timestamps and create a map by line number
  const timestamps = parseTimestamps(content);
  const timestampsByLine = new Map<
    number,
    import("../../shared/lib/timestamp-utils").TimestampEntry[]
  >();

  timestamps.forEach((timestamp) => {
    if (timestamp.lineNumber !== undefined) {
      const existing = timestampsByLine.get(timestamp.lineNumber) || [];
      existing.push(timestamp);
      timestampsByLine.set(timestamp.lineNumber, existing);
    }
  });

  let inLogbookBlock = false;
  let logbookStartFound = false;
  let logbookEndFound = false;
  let currentContentLines: string[] = [];
  let logbookContent = "";

  // Process line by line to maintain proper positioning
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Handle footnotes
    if (trimmed.match(/^\[fn:[^\]]+\]\s+.+/)) {
      footnoteLines.push(line);
      continue;
    }

    // Handle LOGBOOK blocks
    if (trimmed === ":LOGBOOK:" && !logbookStartFound) {
      // Save any accumulated content before LOGBOOK
      if (currentContentLines.length > 0) {
        sections.push({
          type: "content",
          content: currentContentLines.join("\n"),
        });
        currentContentLines = [];
      }

      logbookStartFound = true;
      inLogbookBlock = true;
      continue;
    } else if (trimmed === ":END:" && inLogbookBlock && !logbookEndFound) {
      // Save LOGBOOK content
      if (logbookContent.trim()) {
        sections.push({
          type: "logbook",
          content: logbookContent,
        });
      }

      inLogbookBlock = false;
      logbookEndFound = true;
      continue;
    } else if (inLogbookBlock) {
      logbookContent += (logbookContent ? "\n" : "") + line;
      continue;
    }

    // Handle timestamp lines
    if (timestampsByLine.has(i)) {
      // Save any accumulated content before timestamps
      if (currentContentLines.length > 0) {
        sections.push({
          type: "content",
          content: currentContentLines.join("\n"),
        });
        currentContentLines = [];
      }

      // Add timestamp section
      sections.push({
        type: "timestamps",
        timestamps: timestampsByLine.get(i)!,
        originalLineNumber: i,
      });
      continue;
    }

    // Regular content line
    currentContentLines.push(line);
  }

  // Save any remaining content
  if (currentContentLines.length > 0) {
    sections.push({
      type: "content",
      content: currentContentLines.join("\n"),
    });
  }

  return {
    sections,
    footnotes: footnoteLines.join("\n"),
    hasLogbook: logbookStartFound && logbookEndFound,
  };
}

// Remove duplicate PROPERTIES and metadata blocks for cleaner display
function removeDuplicateMetadata(content: string): string {
  const lines = content.split("\n");
  const cleanedLines: string[] = [];
  let seenProperties = false;
  let seenTitle = false;
  let seenCategory = false;
  let seenFiletags = false;
  let inPropertiesBlock = false;
  let inLogbookBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Track LOGBOOK blocks (preserve these completely)
    if (trimmed === ":LOGBOOK:") {
      inLogbookBlock = true;
      cleanedLines.push(line);
      continue;
    } else if (trimmed === ":END:" && inLogbookBlock) {
      inLogbookBlock = false;
      cleanedLines.push(line);
      continue;
    } else if (inLogbookBlock) {
      // Preserve all LOGBOOK content
      cleanedLines.push(line);
      continue;
    }

    // Track PROPERTIES blocks
    if (trimmed === ":PROPERTIES:") {
      if (seenProperties) continue; // Skip duplicate PROPERTIES block
      seenProperties = true;
      inPropertiesBlock = true;
    } else if (trimmed === ":END:" && inPropertiesBlock) {
      inPropertiesBlock = false;
    } else if (inPropertiesBlock) {
      // Skip all properties content (but keep the first occurrence)
      if (seenProperties && trimmed.startsWith(":ID:")) {
        // Allow first ID, skip subsequent ones
        const idCount = cleanedLines.filter((l) => l.trim().startsWith(":ID:")).length;
        if (idCount > 0) continue;
      }
    }

    // Track metadata lines and skip duplicates
    if (trimmed.startsWith("#+title:")) {
      if (seenTitle) continue;
      seenTitle = true;
    } else if (trimmed.startsWith("#+category:")) {
      if (seenCategory) continue;
      seenCategory = true;
    } else if (trimmed.startsWith("#+filetags:")) {
      if (seenFiletags) continue;
      seenFiletags = true;
    }

    // Skip duplicate PROPERTIES or metadata lines after we've seen them
    if (
      seenProperties &&
      !inPropertiesBlock &&
      (trimmed === ":PROPERTIES:" || trimmed.startsWith(":ID:") || trimmed === ":END:")
    ) {
      continue;
    }

    cleanedLines.push(line);
  }

  return cleanedLines.join("\n");
}

function BacklinkCard({ link }: { link: BacklinkNode }) {
  return (
    <div className="border-l-4 border-blue-200 pl-4 space-y-2">
      <Link
        to={`/nodes/${encodeURIComponent(link.id)}`}
        className="text-blue-600 hover:text-blue-800 font-medium block"
      >
        {link.title}
      </Link>
      <p className="text-sm text-gray-500">{link.file}</p>
      {(link.source || link.dest) && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          {link.source && (
            <div className="flex">
              <span className="font-medium text-gray-700 mr-2">Source:</span>
              <span className="font-mono">{link.source}</span>
            </div>
          )}
          {link.dest && (
            <div className="flex mt-1">
              <span className="font-medium text-gray-700 mr-2">Dest:</span>
              <span className="font-mono">{link.dest}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ForwardLinkCard({ link }: { link: BacklinkNode }) {
  return (
    <div className="border-l-4 border-green-200 pl-4 space-y-2">
      <Link
        to={`/nodes/${encodeURIComponent(link.id)}`}
        className="text-green-600 hover:text-green-800 font-medium block"
      >
        {link.title}
      </Link>
      <p className="text-sm text-gray-500">{link.file}</p>
      {(link.source || link.dest) && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          {link.source && (
            <div className="flex">
              <span className="font-medium text-gray-700 mr-2">Source:</span>
              <span className="font-mono">{link.source}</span>
            </div>
          )}
          {link.dest && (
            <div className="flex mt-1">
              <span className="font-medium text-gray-700 mr-2">Dest:</span>
              <span className="font-mono">{link.dest}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function NodeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showRaw, setShowRaw] = React.useState(false);

  const { data: node, isLoading: nodeLoading, error: nodeError } = useNode(id || "");
  const { data: backlinks } = useBacklinks(id || "");
  const { data: forwardLinks } = useForwardLinks(id || "");
  const deleteNodeMutation = useDeleteNode();

  if (!id) {
    return <div>Node ID is required</div>;
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this node?")) {
      deleteNodeMutation.mutate(id, {
        onSuccess: () => {
          navigate("/nodes");
        },
      });
    }
  };

  if (nodeLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading node...</p>
        </div>
      </Layout>
    );
  }

  if (nodeError || !node) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> Node not found or server error.
          </div>
          <Link to="/nodes" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            ← Back to Nodes
          </Link>
        </div>
      </Layout>
    );
  }

  const priority = node.content ? extractPriority(node.content) : null;

  return (
    <Layout title={node.title}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link to="/nodes" className="text-gray-600 hover:text-gray-800">
            ← Back to Nodes
          </Link>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/nodes/${encodeURIComponent(node.id)}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors flex items-center justify-center"
            title="Edit node"
          >
            <Icon icon="lucide:edit" width={16} height={16} />
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteNodeMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center"
            title={deleteNodeMutation.isPending ? "Deleting..." : "Delete node"}
          >
            {deleteNodeMutation.isPending ? (
              <Icon icon="lucide:loader-2" width={16} height={16} className="animate-spin" />
            ) : (
              <Icon icon="lucide:trash-2" width={16} height={16} />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-end mb-4">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRaw(!showRaw)}
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded border"
                >
                  {showRaw ? "Rendered" : "Raw"}
                </button>
              </div>
            </div>

            {showRaw ? (
              <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md text-sm font-mono">
                {removeDuplicateMetadata(node.content || "No content available.")}
              </pre>
            ) : (
              <div className="max-w-none">
                {node.content ? (
                  (() => {
                    // Extract footnote reference map for back-links from cleaned content
                    const cleanedContent = removeFrontmatter(node.content);
                    const { sections, footnotes } =
                      splitContentWithTimestamps(cleanedContent);
                    const { referenceMap } = replaceFootnoteReferencesWithLinks(cleanedContent);

                    const renderContent = (content: string, key?: number) => {
                      if (!content.trim()) return null;

                      if (node.file?.endsWith(".org")) {
                        // Check if content has footnote references
                        const footnoteRefs = content.match(/\[fn:[^\]]+\]/g);

                        if (!footnoteRefs || footnoteRefs.length === 0) {
                          // No footnotes, render normally
                          return (
                            <OrgRenderer key={key} content={content} enableSyntaxHighlight={true} />
                          );
                        }

                        // Check if content has footnote references
                        const contentFootnoteRefs = content.match(/\[fn:[^\]]+\]/g) || [];

                        if (contentFootnoteRefs.length === 0) {
                          // No footnotes, use normal OrgRenderer
                          return (
                            <OrgRenderer key={key} content={content} enableSyntaxHighlight={true} />
                          );
                        }

                        // Has footnotes - replace them directly with HTML and use dangerouslySetInnerHTML
                        const { content: htmlContent } =
                          replaceFootnoteReferencesWithLinks(content);

                        // Simple text processing to handle basic org formatting without breaking HTML
                        const processedHtml = htmlContent
                          // Process line by line to preserve structure
                          .split("\n")
                          .map((line) => {
                            // Skip lines that are already HTML (contain < or >)
                            if (line.includes("<") && line.includes(">")) {
                              return line;
                            }

                            // Handle headers - check for org-mode headers first
                            const headerMatch = line.match(/^(\*{1,6})\s+(.+)$/);
                            if (headerMatch) {
                              const [, stars, title] = headerMatch;
                              const level = Math.min(stars.length, 6);
                              const hashes = "#".repeat(level);

                              // Process the title for TODO items, priorities, and other formatting
                              let processedTitle = title;

                              // TODO keyword processing
                              const todoKeywords = [
                                "TODO",
                                "DONE",
                                "DOING",
                                "NEXT",
                                "WAITING",
                                "CANCELLED",
                                "CANCELED",
                              ];
                              const todoColors: Record<string, string> = {
                                TODO: "bg-orange-100 text-orange-800",
                                DONE: "bg-green-100 text-green-800",
                                DOING: "bg-blue-100 text-blue-800",
                                NEXT: "bg-purple-100 text-purple-800",
                                WAITING: "bg-yellow-100 text-yellow-800",
                                CANCELLED: "bg-red-100 text-red-800",
                                CANCELED: "bg-red-100 text-red-800",
                              };

                              todoKeywords.forEach((keyword) => {
                                const colors = todoColors[keyword] || "bg-gray-100 text-gray-800";
                                processedTitle = processedTitle.replace(
                                  new RegExp(`\\b${keyword}\\b`, "g"),
                                  `<span class="inline-flex items-center px-2 py-1 text-xs font-medium ${colors} mr-2 border border-current rounded">${keyword}</span>`,
                                );
                              });

                              // Priority processing - [#A], [#B], [#C]
                              const priorityColors: Record<string, string> = {
                                A: "bg-red-100 text-red-800",
                                B: "bg-yellow-100 text-yellow-800",
                                C: "bg-blue-100 text-blue-800",
                              };

                              processedTitle = processedTitle.replace(
                                /\[#([ABC])\]/g,
                                (_, priority) => {
                                  const colors =
                                    priorityColors[priority] || "bg-gray-100 text-gray-800";
                                  return `<span class="inline-flex items-center px-2 py-1 text-xs font-medium ${colors} mr-2 border border-current rounded">#${priority}</span>`;
                                },
                              );

                              // Other formatting
                              processedTitle = processedTitle
                                .replace(/\/([^/<>]+)\//g, "<em>$1</em>")
                                .replace(/_([^_<>]+)_/g, "<u>$1</u>")
                                .replace(
                                  /=([^=<>]+)=/g,
                                  '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>',
                                )
                                .replace(
                                  /~([^~<>]+)~/g,
                                  '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>',
                                );

                              return `<h${level} class="text-gray-900 font-bold leading-tight mb-4 mt-6"><span class="text-gray-400 mr-2 text-sm">${hashes}</span>${processedTitle}</h${level}>`;
                            }

                            // Apply basic formatting to non-header lines only
                            if (line.trim()) {
                              // Skip lines that start with * (org headers) to avoid conflicts
                              if (line.match(/^\*+\s/)) {
                                return ""; // This should have been caught by header processing above
                              }

                              let formatted = line
                                // Only apply bold formatting to text that's not part of org headers
                                .replace(/\*([^*<>\n]+)\*/g, "<strong>$1</strong>")
                                .replace(/\/([^/<>\n]+)\//g, "<em>$1</em>")
                                .replace(/_([^_<>\n]+)_/g, "<u>$1</u>")
                                .replace(
                                  /=([^=<>\n]+)=/g,
                                  '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>',
                                )
                                .replace(
                                  /~([^~<>\n]+)~/g,
                                  '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>',
                                );

                              return `<p class="mb-2 leading-relaxed">${formatted}</p>`;
                            }

                            return "";
                          })
                          .filter((line) => line.trim())
                          .join("\n");

                        return (
                          <div
                            key={key}
                            className="org-content prose"
                            dangerouslySetInnerHTML={{ __html: processedHtml }}
                          />
                        );
                      }

                      return (
                        <div key={key} className="markdown-content">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
                            components={{
                              // Custom link rendering for internal node links
                              a: ({ href, children, ...props }) => {
                                // Check if it's an internal node reference (you can customize this logic)
                                if (href?.startsWith("#") || href?.match(/^\[\[.*\]\]$/)) {
                                  return (
                                    <span className="text-blue-600 bg-blue-50 px-1 rounded cursor-pointer hover:bg-blue-100">
                                      {children}
                                    </span>
                                  );
                                }
                                return (
                                  <a
                                    href={href}
                                    target={href?.startsWith("http") ? "_blank" : undefined}
                                    rel={
                                      href?.startsWith("http") ? "noopener noreferrer" : undefined
                                    }
                                    {...props}
                                  >
                                    {children}
                                  </a>
                                );
                              },
                            }}
                          >
                            {removeFrontmatter(content)}
                          </ReactMarkdown>
                        </div>
                      );
                    };

                    return (
                      <>
                        {/* Render sections in their original order with timestamps at correct positions */}
                        {sections.map((section, index) => {
                          if (section.type === "content") {
                            return renderContent(section.content!, index);
                          } else if (section.type === "logbook") {
                            return (
                              <div key={index} className="my-8">
                                <LogbookDisplay content={`:LOGBOOK:\n${section.content}\n:END:`} />
                              </div>
                            );
                          } else if (section.type === "timestamps") {
                            return (
                              <TimestampsDisplay
                                key={index}
                                entries={section.timestamps!}
                                className="my-3"
                              />
                            );
                          }
                          return null;
                        })}

                        {/* Footnotes section at the very end */}
                        {footnotes.trim() && (
                          <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="text-sm text-gray-600 mb-4 font-semibold">脚注</div>
                            <div className="space-y-3">
                              {footnotes
                                .split("\n")
                                .filter((line) => line.trim())
                                .map((line, index) => {
                                  const match = line.trim().match(/^\[fn:([^\]]+)\]\s+(.+)$/);
                                  if (match) {
                                    const [, label, content] = match;
                                    return (
                                      <div
                                        key={index}
                                        className="text-sm"
                                        id={getFootnoteDefId(label)}
                                      >
                                        <div className="flex items-start space-x-2">
                                          <span className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-xs font-medium shrink-0">
                                            {label}
                                          </span>
                                          <span className="text-gray-700 leading-relaxed">
                                            {content}
                                          </span>
                                          <div className="flex items-center space-x-1 shrink-0">
                                            {referenceMap.get(label)?.map((refId, refIndex) => (
                                              <a
                                                key={refId}
                                                href={`#${refId}`}
                                                className="text-blue-500 hover:text-blue-700 text-xs"
                                                title={`参照 ${refIndex + 1} に戻る`}
                                              >
                                                ↩
                                                {referenceMap.get(label)!.length > 1
                                                  ? refIndex + 1
                                                  : ""}
                                              </a>
                                            )) || (
                                              <a
                                                href={`#fn-ref-${label}`}
                                                className="text-blue-500 hover:text-blue-700 text-xs"
                                                title="元の位置に戻る"
                                              >
                                                ↩
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                })}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()
                ) : (
                  <div className="text-gray-500 italic">No content available.</div>
                )}
              </div>
            )}
          </div>

          {/* Backlinks */}
          {backlinks && backlinks.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Backlinks ({backlinks.length})
              </h2>
              <div className="space-y-3">
                {backlinks.map((link) => (
                  <BacklinkCard key={link.id} link={link} />
                ))}
              </div>
            </div>
          )}

          {/* Forward Links */}
          {forwardLinks && forwardLinks.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Forward Links ({forwardLinks.length})
              </h2>
              <div className="space-y-3">
                {forwardLinks.map((link) => (
                  <ForwardLinkCard key={link.id} link={link} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Node Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Node Info</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium text-gray-700">ID</dt>
                <dd className="text-gray-600 font-mono text-xs break-all">{node.id}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">File</dt>
                <dd className="text-gray-600">{node.file}</dd>
              </div>
              {node.level !== undefined && (
                <div>
                  <dt className="font-medium text-gray-700">Level</dt>
                  <dd className="text-gray-600">{node.level}</dd>
                </div>
              )}
              {node.todo && (
                <div>
                  <dt className="font-medium text-gray-700">TODO</dt>
                  <dd className="text-gray-600 flex items-center gap-2">
                    <TodoIcon todo={node.todo} />
                    {node.todo}
                  </dd>
                </div>
              )}
              {priority && (
                <div>
                  <dt className="font-medium text-gray-700">優先度</dt>
                  <dd className="flex items-center gap-2">
                    <PriorityLabel priority={priority} />
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Tags */}
          {node.tags && node.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {node.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/nodes?tag=${encodeURIComponent(tag)}`}
                    className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full hover:bg-blue-200 transition-colors cursor-pointer inline-block"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Aliases */}
          {node.aliases && node.aliases.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Aliases</h2>
              <div className="space-y-2">
                {node.aliases.map((alias, _index) => (
                  <div key={alias} className="text-sm text-gray-600">
                    {alias}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* References */}
          {node.refs && node.refs.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                References ({node.refs.length})
              </h2>
              <div className="space-y-3">
                {node.refs.map((refValue, _index) => (
                  <div key={refValue} className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm font-mono text-gray-700 break-all">
                      {refValue.startsWith("https://") ? (
                        <a
                          href={refValue}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {refValue}
                        </a>
                      ) : (
                        refValue
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
