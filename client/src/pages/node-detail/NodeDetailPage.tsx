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
import type { BacklinkNode } from "../../entities/node";
import { useBacklinks, useDeleteNode, useForwardLinks, useNode } from "../../entities/node";
import { OrgRenderer } from "../../features/org-rendering";
import { extractPriority, PriorityLabel } from "../../shared/lib/priority-utils";
import { TodoIcon } from "../../shared/lib/todo-utils";
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

// Split content at LOGBOOK position for proper rendering order
function splitContentAtLogbook(content: string): {
  beforeLogbook: string;
  afterLogbook: string;
  hasLogbook: boolean;
} {
  const lines = content.split("\n");
  const beforeLines: string[] = [];
  const afterLines: string[] = [];
  let inLogbookBlock = false;
  let logbookStartFound = false;
  let logbookEndFound = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === ":LOGBOOK:" && !logbookStartFound) {
      logbookStartFound = true;
      inLogbookBlock = true;
      continue;
    } else if (trimmed === ":END:" && inLogbookBlock && !logbookEndFound) {
      inLogbookBlock = false;
      logbookEndFound = true;
      continue;
    } else if (inLogbookBlock) {
      continue; // Skip LOGBOOK content lines
    } else if (!logbookStartFound) {
      beforeLines.push(line); // Content before LOGBOOK
    } else if (logbookEndFound) {
      afterLines.push(line); // Content after LOGBOOK
    }
  }

  return {
    beforeLogbook: beforeLines.join("\n"),
    afterLogbook: afterLines.join("\n"),
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
                    const { beforeLogbook, afterLogbook, hasLogbook } = splitContentAtLogbook(node.content);
                    
                    const renderContent = (content: string) => {
                      if (!content.trim()) return null;
                      
                      return node.file?.endsWith(".org") ? (
                        <OrgRenderer
                          content={removeFrontmatter(content)}
                          enableSyntaxHighlight={true}
                        />
                      ) : (
                        <div className="markdown-content">
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
                                    rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
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
                        {/* Content before LOGBOOK */}
                        {renderContent(beforeLogbook)}
                        
                        {/* LOGBOOK section at its original position */}
                        {hasLogbook && (
                          <div className="my-8">
                            <LogbookDisplay content={node.content} />
                          </div>
                        )}
                        
                        {/* Content after LOGBOOK */}
                        {renderContent(afterLogbook)}
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
