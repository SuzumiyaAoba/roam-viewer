import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { formatNodeDate } from "../../lib/date-utils";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { cn } from "./utils";

const nodeCardVariants = cva(
  "group relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg",
        elevated: "bg-white shadow-md hover:shadow-xl border-0",
        minimal:
          "bg-gray-50 border border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-md",
        accent:
          "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:from-blue-100 hover:to-indigo-100 hover:shadow-lg",
        glass:
          "bg-white/70 backdrop-blur-sm border border-white/20 hover:bg-white/80 hover:shadow-lg",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
      interactive: {
        true: "hover:scale-[1.02] hover:-translate-y-1",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: true,
    },
  },
);

export interface NodeCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof nodeCardVariants> {
  /**
   * Node title
   */
  title: string;
  /**
   * Node content preview
   */
  content?: string;
  /**
   * Node file path
   */
  file?: string;
  /**
   * Node tags
   */
  tags?: string[];
  /**
   * TODO item text
   */
  todo?: string;
  /**
   * Node creation/modification date
   */
  date?: string | Date;
  /**
   * Whether the card is selected/active
   */
  selected?: boolean;
  /**
   * Click handler for the card
   */
  onCardClick?: () => void;
  /**
   * Edit button click handler
   */
  onEdit?: () => void;
  /**
   * Delete button click handler
   */
  onDelete?: () => void;
  /**
   * Tag click handler
   */
  onTagClick?: (tag: string) => void;
  /**
   * Show action buttons
   */
  showActions?: boolean;
  /**
   * Custom actions content
   */
  actions?: React.ReactNode;
  /**
   * Maximum number of tags to show
   */
  maxTags?: number;
  /**
   * Show selection checkbox
   */
  showCheckbox?: boolean;
  /**
   * Whether the node is selected
   */
  isSelected?: boolean;
  /**
   * Selection change handler
   */
  onSelectionChange?: (selected: boolean) => void;
  /**
   * Maximum length of content preview
   */
  maxContentLength?: number;
}

const NodeCard = forwardRef<HTMLDivElement, NodeCardProps>(
  (
    {
      className,
      variant,
      size,
      interactive,
      title,
      content,
      file,
      tags = [],
      todo,
      date,
      selected = false,
      onCardClick,
      onEdit,
      onDelete,
      onTagClick,
      showActions = true,
      actions,
      maxTags = 5,
      showCheckbox = false,
      isSelected = false,
      onSelectionChange,
      maxContentLength = 150,
      children,
      ...props
    },
    ref,
  ) => {
    const displayTags = (tags || []).slice(0, maxTags);
    const extraTagsCount = Math.max(0, (tags || []).length - maxTags);

    const displayContent =
      content && content.length > maxContentLength
        ? `${content.substring(0, maxContentLength)}...`
        : content;

    const formattedDate = formatNodeDate(date);

    const handleCardClick = (e: React.MouseEvent) => {
      // Don't trigger card click if clicking on action buttons or checkbox
      if (
        (e.target as HTMLElement).closest("[data-action-button]") ||
        (e.target as HTMLElement).closest("[data-checkbox]")
      ) {
        return;
      }
      onCardClick?.();
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      onSelectionChange?.(e.target.checked);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && onCardClick) {
        e.preventDefault();
        if (!(e.target as HTMLElement).closest("[data-action-button]")) {
          onCardClick();
        }
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          nodeCardVariants({ variant, size, interactive }),
          selected && "ring-2 ring-blue-500 ring-offset-2",
          className,
        )}
        {...(onCardClick && {
          onClick: handleCardClick,
          onKeyDown: handleKeyDown,
          role: "button",
          tabIndex: 0,
        })}
        {...props}
      >
        {/* Selection checkbox */}
        {showCheckbox && (
          <div
            className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm rounded p-1 shadow-sm"
            data-checkbox
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
              className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Status indicator for selected state */}
        {selected && (
          <div className="absolute top-4 right-4 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            {file && <p className="text-sm text-gray-500 truncate mt-1 font-mono">{file}</p>}
          </div>

          {/* Actions */}
          {showActions && (actions || onEdit || onDelete) && (
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
              {actions || (
                <>
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                      data-action-button
                      className="h-8 w-8 p-0"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <title>Edit node</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      data-action-button
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <title>Delete node</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* TODO Badge */}
        {todo && (
          <div className="mb-3">
            <Badge variant="warning" className="text-xs">
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <title>TODO icon</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              TODO: {todo}
            </Badge>
          </div>
        )}

        {/* Content Preview */}
        {displayContent && (
          <div className="mb-4">
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{displayContent}</p>
          </div>
        )}

        {/* Tags */}
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {displayTags.map((tag, _index) => (
              <Badge
                key={tag}
                variant="secondary"
                size="sm"
                className={cn(
                  "text-xs",
                  onTagClick && "cursor-pointer hover:bg-blue-200 transition-colors",
                )}
                onClick={(e) => {
                  if (onTagClick) {
                    e.stopPropagation();
                    onTagClick(tag);
                  }
                }}
              >
                {tag}
              </Badge>
            ))}
            {extraTagsCount > 0 && (
              <Badge variant="outline" size="sm" className="text-xs">
                +{extraTagsCount} more
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        {(date || children) && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
            <div className="flex-1">{children}</div>
            {formattedDate && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <title>Last modified</title>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {formattedDate}
              </div>
            )}
          </div>
        )}

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none rounded-xl" />
      </div>
    );
  },
);
NodeCard.displayName = "NodeCard";

// Compact variant for list views
const NodeCardCompact = forwardRef<HTMLDivElement, NodeCardProps>(
  ({ className, ...props }, ref) => (
    <NodeCard
      ref={ref}
      size="sm"
      variant="minimal"
      interactive={false}
      className={cn("py-3 px-4 hover:scale-100 hover:translate-y-0", className)}
      {...props}
    />
  ),
);
NodeCardCompact.displayName = "NodeCardCompact";

// Grid variant with fixed aspect ratio
const NodeCardGrid = forwardRef<HTMLDivElement, NodeCardProps>(({ className, ...props }, ref) => (
  <NodeCard ref={ref} className={cn("aspect-[4/3] flex flex-col", className)} {...props} />
));
NodeCardGrid.displayName = "NodeCardGrid";

export { NodeCard, NodeCardCompact, NodeCardGrid, nodeCardVariants };
