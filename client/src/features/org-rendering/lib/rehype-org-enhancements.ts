/**
 * @fileoverview A unified rehype plugin for enhancing org-mode content with custom CSS classes
 * @author Claude Code
 * @version 1.0.0
 */

import { visit } from "unist-util-visit";
import type { Element, Root, Text, Node } from "hast";
import type { Plugin, Transformer } from "unified";

/**
 * Custom CSS classes configuration for various org-mode elements
 */
export interface CustomClasses {
  /** CSS classes for TODO keywords (TODO, DONE, DOING, etc.) */
  todoKeywords?: {
    [keyword: string]: string[];
  };
  /** CSS classes for priority indicators ([#A], [#B], [#C]) */
  priorities?: {
    [priority: string]: string[];
  };
  /** CSS classes for header elements by level (1-6) */
  headers?: {
    [level: number]: string[];
  };
  /** CSS classes for timestamp elements */
  timestamps?: {
    /** Timestamp ranges like <2025-01-15>--<2025-01-16> */
    range?: string[];
    /** Active timestamps <2025-01-15> */
    active?: string[];
    /** Inactive timestamps [2025-01-15] */
    inactive?: string[];
    /** Fallback timestamp styling */
    fallback?: string[];
    /** Icon classes for range timestamps */
    rangeIcon?: string[];
    /** Icon classes for arrow between range timestamps */
    arrowIcon?: string[];
    /** Icon classes for clock icons */
    clockIcon?: string[];
    /** Icon classes for calendar icons */
    calendarIcon?: string[];
  };
  /** CSS classes for basic HTML elements */
  elements?: {
    p?: string[];
    ul?: string[];
    ol?: string[];
    li?: string[];
    code?: string[];
    pre?: string[];
    /** Pre elements with Shiki syntax highlighting */
    preShiki?: string[];
    table?: string[];
    th?: string[];
    td?: string[];
    thead?: string[];
    tbody?: string[];
    a?: string[];
    strong?: string[];
    em?: string[];
    hr?: string[];
  };
}

/**
 * Plugin options for rehype-org-enhancements
 */
export interface PluginOptions {
  /** Whether to enable syntax highlighting integration */
  enableSyntaxHighlight?: boolean;
  /** Custom CSS classes to override defaults */
  customClasses?: CustomClasses;
  /** Whether to validate input options (default: true) */
  validate?: boolean;
  /** TODO keywords to recognize (default: standard org-mode keywords) */
  todoKeywords?: string[];
  /** Priority levels to recognize (default: A, B, C) */
  priorityLevels?: string[];
}

/**
 * Default TODO keyword CSS classes
 */
const DEFAULT_TODO_KEYWORDS: Record<string, string[]> = {
  TODO: [
    "inline-flex",
    "items-center",
    "px-2",
    "py-1",
    "text-xs",
    "font-medium",
    "bg-orange-100",
    "text-orange-800",
    "mr-2",
  ],
  DONE: [
    "inline-flex",
    "items-center",
    "px-2",
    "py-1",
    "text-xs",
    "font-medium",
    "bg-green-100",
    "text-green-800",
    "mr-2",
  ],
  DOING: [
    "inline-flex",
    "items-center",
    "px-2",
    "py-1",
    "text-xs",
    "font-medium",
    "bg-blue-100",
    "text-blue-800",
    "mr-2",
  ],
  NEXT: [
    "inline-flex",
    "items-center",
    "px-2",
    "py-1",
    "text-xs",
    "font-medium",
    "bg-purple-100",
    "text-purple-800",
    "mr-2",
  ],
  WAITING: [
    "inline-flex",
    "items-center",
    "px-2",
    "py-1",
    "text-xs",
    "font-medium",
    "bg-yellow-100",
    "text-yellow-800",
    "mr-2",
  ],
  CANCELLED: [
    "inline-flex",
    "items-center",
    "px-2",
    "py-1",
    "text-xs",
    "font-medium",
    "bg-gray-100",
    "text-gray-800",
    "mr-2",
  ],
  CANCELED: [
    "inline-flex",
    "items-center",
    "px-2",
    "py-1",
    "text-xs",
    "font-medium",
    "bg-gray-100",
    "text-gray-800",
    "mr-2",
  ],
};

/**
 * Default priority CSS classes
 */
const DEFAULT_PRIORITIES: Record<string, string[]> = {
  A: [
    "inline-flex",
    "items-center",
    "px-2",
    "py-1",
    "text-xs",
    "font-medium",
    "bg-red-100",
    "text-red-800",
    "mr-2",
    "border",
    "border-current",
    "rounded",
  ],
  B: [
    "inline-flex",
    "items-center",
    "px-2",
    "py-1",
    "text-xs",
    "font-medium",
    "bg-yellow-100",
    "text-yellow-800",
    "mr-2",
    "border",
    "border-current",
    "rounded",
  ],
  C: [
    "inline-flex",
    "items-center",
    "px-2",
    "py-1",
    "text-xs",
    "font-medium",
    "bg-green-100",
    "text-green-800",
    "mr-2",
    "border",
    "border-current",
    "rounded",
  ],
};

/**
 * Default header CSS classes by level
 */
const DEFAULT_HEADERS: Record<number, string[]> = {
  1: [
    "text-xl",
    "font-bold",
    "text-gray-900",
    "mb-3",
    "mt-6",
    "first:mt-0",
    "relative",
    "before:content-['#']",
    "before:text-gray-400",
    "before:mr-2",
    "before:font-mono",
  ],
  2: [
    "text-lg",
    "font-semibold",
    "text-gray-800",
    "mb-3",
    "mt-5",
    "relative",
    "before:content-['##']",
    "before:text-gray-400",
    "before:mr-2",
    "before:font-mono",
  ],
  3: [
    "text-base",
    "font-semibold",
    "text-gray-800",
    "mb-2",
    "mt-4",
    "relative",
    "before:content-['###']",
    "before:text-gray-400",
    "before:mr-2",
    "before:font-mono",
  ],
  4: [
    "text-base",
    "font-medium",
    "text-gray-700",
    "mb-2",
    "mt-3",
    "relative",
    "before:content-['####']",
    "before:text-gray-400",
    "before:mr-2",
    "before:font-mono",
  ],
  5: [
    "text-sm",
    "font-medium",
    "text-gray-700",
    "mb-2",
    "mt-3",
    "relative",
    "before:content-['#####']",
    "before:text-gray-400",
    "before:mr-2",
    "before:font-mono",
  ],
  6: [
    "text-sm",
    "font-medium",
    "text-gray-600",
    "mb-1",
    "mt-2",
    "relative",
    "before:content-['######']",
    "before:text-gray-400",
    "before:mr-2",
    "before:font-mono",
  ],
};

/**
 * Default timestamp CSS classes
 */
const DEFAULT_TIMESTAMPS = {
  range: [
    "inline-flex",
    "items-center",
    "gap-1",
    "px-3",
    "py-1",
    "bg-blue-50",
    "text-blue-700",
    "border",
    "border-blue-200",
    "rounded-lg",
    "text-sm",
    "font-medium",
  ],
  active: [
    "inline-flex",
    "items-center",
    "gap-1",
    "px-2",
    "py-1",
    "bg-green-50",
    "text-green-700",
    "border",
    "border-green-200",
    "rounded-md",
    "text-sm",
  ],
  inactive: [
    "inline-flex",
    "items-center",
    "gap-1",
    "px-2",
    "py-1",
    "bg-gray-50",
    "text-gray-600",
    "border",
    "border-gray-200",
    "rounded-md",
    "text-sm",
  ],
  fallback: [
    "inline-flex",
    "items-center",
    "gap-1",
    "px-2",
    "py-1",
    "bg-blue-50",
    "text-blue-600",
    "border",
    "border-blue-200",
    "rounded-md",
    "text-sm",
  ],
  rangeIcon: ["w-3", "h-3"],
  arrowIcon: ["w-3", "h-3", "text-blue-500"],
  clockIcon: ["w-3", "h-3"],
  calendarIcon: ["w-3", "h-3"],
} as const;

/**
 * Default element CSS classes
 */
const DEFAULT_ELEMENTS = {
  p: ["text-gray-700", "leading-relaxed", "mb-4"],
  ul: ["list-disc", "list-inside", "mb-4", "ml-4", "space-y-1"],
  ol: ["list-decimal", "list-inside", "mb-4", "ml-4", "space-y-1"],
  li: ["text-gray-700"],
  code: ["bg-gray-100", "text-gray-800", "px-1.5", "py-0.5", "rounded", "text-sm", "font-mono"],
  pre: ["bg-gray-900", "text-gray-100", "p-4", "rounded-lg", "overflow-x-auto", "mb-4", "text-sm"],
  preShiki: [
    "rounded-lg",
    "overflow-x-auto",
    "mb-4",
    "text-sm",
    "border",
    "border-gray-200",
    "shadow-sm",
    "p-4",
  ],
  table: ["min-w-full", "divide-y", "divide-gray-200", "border"],
  th: [
    "px-6",
    "py-3",
    "text-left",
    "text-xs",
    "font-medium",
    "text-gray-500",
    "uppercase",
    "tracking-wider",
  ],
  td: ["px-6", "py-4", "whitespace-nowrap", "text-sm", "text-gray-900"],
  thead: ["bg-gray-50"],
  tbody: ["bg-white", "divide-y", "divide-gray-200"],
  a: ["text-blue-600", "hover:text-blue-800", "underline"],
  strong: ["font-semibold", "text-gray-900"],
  em: ["italic"],
  hr: ["border-gray-300", "my-8"],
} as const;

/**
 * Default recognized TODO keywords
 */
const DEFAULT_TODO_KEYWORDS_LIST = [
  "TODO",
  "DONE",
  "DOING",
  "NEXT",
  "WAITING",
  "CANCELLED",
  "CANCELED",
];

/**
 * Default recognized priority levels
 */
const DEFAULT_PRIORITY_LEVELS = ["A", "B", "C"];

/**
 * Plugin configuration with resolved options
 */
interface ResolvedOptions {
  enableSyntaxHighlight: boolean;
  customClasses: CustomClasses;
  validate: boolean;
  todoKeywords: string[];
  priorityLevels: string[];
}

/**
 * Validates plugin options
 * @param options - Plugin options to validate
 * @throws {Error} If options are invalid
 */
function validateOptions(options: PluginOptions): void {
  if (
    options.enableSyntaxHighlight !== undefined &&
    typeof options.enableSyntaxHighlight !== "boolean"
  ) {
    throw new Error("enableSyntaxHighlight must be a boolean");
  }

  if (options.customClasses !== undefined && typeof options.customClasses !== "object") {
    throw new Error("customClasses must be an object");
  }

  if (options.validate !== undefined && typeof options.validate !== "boolean") {
    throw new Error("validate must be a boolean");
  }

  if (options.todoKeywords !== undefined) {
    if (!Array.isArray(options.todoKeywords)) {
      throw new Error("todoKeywords must be an array");
    }
    if (options.todoKeywords.some((keyword) => typeof keyword !== "string")) {
      throw new Error("All todoKeywords must be strings");
    }
  }

  if (options.priorityLevels !== undefined) {
    if (!Array.isArray(options.priorityLevels)) {
      throw new Error("priorityLevels must be an array");
    }
    if (options.priorityLevels.some((level) => typeof level !== "string")) {
      throw new Error("All priorityLevels must be strings");
    }
  }
}

/**
 * Resolves plugin options with defaults
 * @param options - Plugin options
 * @returns Resolved options with defaults
 */
function resolveOptions(options: PluginOptions = {}): ResolvedOptions {
  return {
    enableSyntaxHighlight: options.enableSyntaxHighlight ?? true,
    customClasses: options.customClasses ?? {},
    validate: options.validate ?? true,
    todoKeywords: options.todoKeywords ?? DEFAULT_TODO_KEYWORDS_LIST,
    priorityLevels: options.priorityLevels ?? DEFAULT_PRIORITY_LEVELS,
  };
}

/**
 * Checks if a node is a valid hast element
 * @param node - Node to check
 * @returns True if node is a valid element
 */
function isElement(node: Node): node is Element {
  return node && node.type === "element" && typeof node.tagName === "string";
}

/**
 * Checks if a node is a valid text node
 * @param node - Node to check
 * @returns True if node is a valid text node
 */
function isText(node: Node): node is Text {
  return node && node.type === "text" && typeof node.value === "string";
}

/**
 * Safely gets CSS classes from custom configuration with fallback to defaults
 * @param customClasses - Custom classes configuration
 * @param path - Path to the classes (e.g., 'todoKeywords.TODO')
 * @param defaultClasses - Default classes to use as fallback
 * @returns CSS classes array
 */
function getClasses(
  customClasses: CustomClasses,
  path: string,
  defaultClasses: readonly string[] | string[],
): string[] {
  try {
    const parts = path.split(".");
    let current: any = customClasses;

    for (const part of parts) {
      if (current?.[part] !== undefined) {
        current = current[part];
      } else {
        return [...defaultClasses];
      }
    }

    if (Array.isArray(current) && current.every((cls) => typeof cls === "string")) {
      return current;
    }

    return [...defaultClasses];
  } catch {
    return [...defaultClasses];
  }
}

/**
 * Creates a hast element with proper type checking
 * @param tagName - HTML tag name
 * @param properties - Element properties
 * @param children - Element children
 * @returns Hast element
 */
function createElement(
  tagName: string,
  properties: Record<string, any> = {},
  children: any[] = [],
): Element {
  return {
    type: "element",
    tagName,
    properties: { ...properties },
    children: [...children],
  };
}

/**
 * Creates a hast text node
 * @param value - Text value
 * @returns Hast text node
 */
function createText(value: string): Text {
  return {
    type: "text",
    value,
  };
}

/**
 * Transforms TODO keywords in headers and standalone spans
 * @param tree - Hast tree
 * @param options - Resolved plugin options
 */
function transformTodoKeywords(tree: Root, options: ResolvedOptions): void {
  try {
    visit(tree, "element", (node: Element) => {
      if (!node || !node.children) return;

      // Handle TODO keywords in headers
      if (/^h[1-6]$/.test(node.tagName)) {
        const headerLevel = parseInt(node.tagName.charAt(1), 10);
        if (isNaN(headerLevel) || headerLevel < 1 || headerLevel > 6) return;

        let hasChanges = false;

        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          if (!child || !isText(child)) continue;

          for (const keyword of options.todoKeywords) {
            const pattern = new RegExp(`^${keyword}\\s+`, "");
            if (pattern.test(child.value)) {
              const remainingText = child.value.replace(pattern, "").trim();

              const todoClasses = getClasses(
                options.customClasses,
                `todoKeywords.${keyword}`,
                DEFAULT_TODO_KEYWORDS[keyword] || DEFAULT_TODO_KEYWORDS.TODO,
              );

              const todoSpan = createElement(
                "span",
                {
                  className: todoClasses,
                },
                [createText(keyword)],
              );

              const newChildren: Array<Element | Text> = [todoSpan];
              if (remainingText) {
                newChildren.push(createText(remainingText));
              }

              node.children.splice(i, 1, ...newChildren);
              hasChanges = true;
              break;
            }
          }
        }

        // Add header classes if changes were made or if no class exists
        if (hasChanges || !node.properties?.className) {
          node.properties = node.properties || {};
          node.properties.className = getClasses(
            options.customClasses,
            `headers.${headerLevel}`,
            DEFAULT_HEADERS[headerLevel] || DEFAULT_HEADERS[1],
          );
        }
      }

      // Handle TODO keywords in standalone spans (from uniorg)
      if (node.tagName === "span" && node.properties?.className) {
        const classNames = Array.isArray(node.properties.className)
          ? node.properties.className
          : [node.properties.className];

        if (
          classNames.some((cls: any) => typeof cls === "string" && cls.includes("todo-keyword"))
        ) {
          const textChild = node.children?.find((child) => child && child.type === "text") as Text;
          if (textChild && options.todoKeywords.includes(textChild.value.trim())) {
            const keyword = textChild.value.trim();
            node.properties.className = getClasses(
              options.customClasses,
              `todoKeywords.${keyword}`,
              DEFAULT_TODO_KEYWORDS[keyword] || DEFAULT_TODO_KEYWORDS.TODO,
            );
          }
        }
      }
    });
  } catch (error) {
    if (options.validate) {
      throw new Error(`Error transforming TODO keywords: ${error}`);
    }
  }
}

/**
 * Transforms priority indicators [#A], [#B], [#C]
 * @param tree - Hast tree
 * @param options - Resolved plugin options
 */
function transformPriorities(tree: Root, options: ResolvedOptions): void {
  try {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || !Array.isArray(parent.children) || index === undefined) return;

      const priorityPattern = new RegExp(`\\[(#?[${options.priorityLevels.join("")}])\\]`, "g");
      let match;
      const changes: Array<{ index: number; replacement: any[] }> = [];

      while ((match = priorityPattern.exec(node.value)) !== null) {
        const fullMatch = match[0];
        const priority = match[1].replace("#", "");
        if (!options.priorityLevels.includes(priority)) continue;

        const beforeText = node.value.substring(0, match.index);
        const afterText = node.value.substring(match.index + fullMatch.length);

        const priorityClasses = getClasses(
          options.customClasses,
          `priorities.${priority}`,
          DEFAULT_PRIORITIES[priority] || DEFAULT_PRIORITIES.A,
        );

        const prioritySpan = createElement(
          "span",
          {
            className: priorityClasses,
          },
          [createText(`#${priority}`)],
        );

        const replacement = [];
        if (beforeText) replacement.push(createText(beforeText));
        replacement.push(prioritySpan);
        if (afterText) replacement.push(createText(afterText));

        changes.push({ index, replacement });
        break; // Handle one match at a time
      }

      // Apply changes
      changes.forEach(({ index, replacement }) => {
        parent.children.splice(index, 1, ...replacement);
      });
    });
  } catch (error) {
    if (options.validate) {
      throw new Error(`Error transforming priorities: ${error}`);
    }
  }
}

/**
 * Transforms timestamp spans
 * @param tree - Hast tree
 * @param options - Resolved plugin options
 */
function transformTimestamps(tree: Root, options: ResolvedOptions): void {
  try {
    visit(tree, "element", (node: Element) => {
      if (!node || !node.tagName) return;
      if (
        node.tagName === "span" &&
        node.properties?.className &&
        (Array.isArray(node.properties.className)
          ? node.properties.className
          : [node.properties.className]
        ).includes("timestamp")
      ) {
        const textChild = node.children?.find((child) => child && child.type === "text") as Text;
        if (!textChild) return;

        const content = textChild.value;
        const isRange = content.includes("--");
        const isActive = content.startsWith("<") && content.endsWith(">");
        const isInactive = content.startsWith("[") && content.endsWith("]");

        if (isRange) {
          // Handle timestamp ranges
          const rangeParts = content.split("--");
          if (rangeParts.length === 2) {
            const startTime = rangeParts[0].trim().replace(/^[<[]|[>\]]$/g, "");
            const endTime = rangeParts[1].trim().replace(/^[<[]|[>\]]$/g, "");

            node.properties.className = getClasses(
              options.customClasses,
              "timestamps.range",
              DEFAULT_TIMESTAMPS.range,
            );
            node.children = [
              createElement(
                "svg",
                {
                  className: getClasses(
                    options.customClasses,
                    "timestamps.rangeIcon",
                    DEFAULT_TIMESTAMPS.rangeIcon,
                  ),
                  fill: "none" as const,
                  stroke: "currentColor" as const,
                  viewBox: "0 0 24 24" as const,
                },
                [
                  createElement("path", {
                    strokeLinecap: "round" as const,
                    strokeLinejoin: "round" as const,
                    strokeWidth: "2" as const,
                    d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" as const,
                  }),
                ],
              ),
              createElement("span", {}, [createText(startTime)]),
              createElement(
                "svg",
                {
                  className: getClasses(
                    options.customClasses,
                    "timestamps.arrowIcon",
                    DEFAULT_TIMESTAMPS.arrowIcon,
                  ),
                  fill: "none" as const,
                  stroke: "currentColor" as const,
                  viewBox: "0 0 24 24" as const,
                },
                [
                  createElement("path", {
                    strokeLinecap: "round" as const,
                    strokeLinejoin: "round" as const,
                    strokeWidth: "2" as const,
                    d: "M13 7l5 5-5 5M6 12h12" as const,
                  }),
                ],
              ),
              createElement("span", {}, [createText(endTime)]),
            ];
          }
        } else if (isActive) {
          const cleanContent = content.replace(/^[<[]|[>\]]$/g, "");
          node.properties.className = getClasses(
            options.customClasses,
            "timestamps.active",
            DEFAULT_TIMESTAMPS.active,
          );
          node.children = [
            createElement(
              "svg",
              {
                className: getClasses(
                  options.customClasses,
                  "timestamps.clockIcon",
                  DEFAULT_TIMESTAMPS.clockIcon,
                ),
                fill: "none" as const,
                stroke: "currentColor" as const,
                viewBox: "0 0 24 24" as const,
              },
              [
                createElement("path", {
                  strokeLinecap: "round" as const,
                  strokeLinejoin: "round" as const,
                  strokeWidth: "2" as const,
                  d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" as const,
                }),
              ],
            ),
            createText(cleanContent),
          ];
        } else if (isInactive) {
          const cleanContent = content.replace(/^[<[]|[>\]]$/g, "");
          node.properties.className = getClasses(
            options.customClasses,
            "timestamps.inactive",
            DEFAULT_TIMESTAMPS.inactive,
          );
          node.children = [
            createElement(
              "svg",
              {
                className: getClasses(
                  options.customClasses,
                  "timestamps.calendarIcon",
                  DEFAULT_TIMESTAMPS.calendarIcon,
                ),
                fill: "none" as const,
                stroke: "currentColor" as const,
                viewBox: "0 0 24 24" as const,
              },
              [
                createElement("path", {
                  strokeLinecap: "round" as const,
                  strokeLinejoin: "round" as const,
                  strokeWidth: "2" as const,
                  d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" as const,
                }),
              ],
            ),
            createText(cleanContent),
          ];
        } else {
          // Fallback styling
          const cleanContent = content.replace(/^[<[]|[>]]$/g, "");
          node.properties.className = getClasses(
            options.customClasses,
            "timestamps.fallback",
            DEFAULT_TIMESTAMPS.fallback,
          );
          node.children = [
            createElement(
              "svg",
              {
                className: getClasses(
                  options.customClasses,
                  "timestamps.clockIcon",
                  DEFAULT_TIMESTAMPS.clockIcon,
                ),
                fill: "none" as const,
                stroke: "currentColor" as const,
                viewBox: "0 0 24 24" as const,
              },
              [
                createElement("path", {
                  strokeLinecap: "round" as const,
                  strokeLinejoin: "round" as const,
                  strokeWidth: "2" as const,
                  d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" as const,
                }),
              ],
            ),
            createText(cleanContent),
          ];
        }
      }
    });
  } catch (error) {
    if (options.validate) {
      throw new Error(`Error transforming timestamps: ${error}`);
    }
  }
}

/**
 * Applies basic CSS classes to HTML elements
 * @param tree - Hast tree
 * @param options - Resolved plugin options
 */
function applyBasicClasses(tree: Root, options: ResolvedOptions): void {
  try {
    visit(tree, "element", (node: Element) => {
      const hasClasses =
        node.properties?.className &&
        (Array.isArray(node.properties.className) ? node.properties.className.length > 0 : true);

      if (hasClasses && node.tagName !== "pre" && node.tagName !== "code") {
        return;
      }

      // Apply header classes
      if (/^h[1-6]$/.test(node.tagName)) {
        const level = parseInt(node.tagName.charAt(1), 10);
        if (!hasClasses && level >= 1 && level <= 6) {
          node.properties = node.properties || {};
          node.properties.className = getClasses(
            options.customClasses,
            `headers.${level}`,
            DEFAULT_HEADERS[level] || DEFAULT_HEADERS[1],
          );
        }
        return;
      }

      // Apply element-specific classes
      const elementMap: Array<[string, string]> = [
        ["p", "elements.p"],
        ["ul", "elements.ul"],
        ["ol", "elements.ol"],
        ["li", "elements.li"],
        ["table", "elements.table"],
        ["th", "elements.th"],
        ["td", "elements.td"],
        ["thead", "elements.thead"],
        ["tbody", "elements.tbody"],
        ["a", "elements.a"],
        ["strong", "elements.strong"],
        ["em", "elements.em"],
        ["hr", "elements.hr"],
      ];

      for (const [tagName, path] of elementMap) {
        if (node.tagName === tagName && !hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = getClasses(
            options.customClasses,
            path,
            DEFAULT_ELEMENTS[tagName as keyof typeof DEFAULT_ELEMENTS],
          );
          break;
        }
      }

      // Handle code elements
      if (node.tagName === "code") {
        const classNames = Array.isArray(node.properties?.className)
          ? node.properties.className
          : node.properties?.className
            ? [node.properties.className]
            : [];

        if (!classNames.some((cls) => typeof cls === "string" && cls.includes("shiki"))) {
          node.properties = node.properties || {};
          node.properties.className = getClasses(
            options.customClasses,
            "elements.code",
            DEFAULT_ELEMENTS.code,
          );
        }
      }

      // Handle pre elements
      if (node.tagName === "pre") {
        const preClassNames = Array.isArray(node.properties?.className)
          ? node.properties.className
          : node.properties?.className
            ? [node.properties.className]
            : [];

        if (preClassNames.some((cls) => typeof cls === "string" && cls.includes("shiki"))) {
          node.properties = node.properties || {};
          const existingClasses = Array.isArray(node.properties.className)
            ? node.properties.className.filter((cls): cls is string => typeof cls === "string")
            : [node.properties.className].filter((cls): cls is string => typeof cls === "string");
          const preShikiClasses = getClasses(
            options.customClasses,
            "elements.preShiki",
            DEFAULT_ELEMENTS.preShiki,
          );
          node.properties.className = [...existingClasses, ...preShikiClasses];
        } else if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = getClasses(
            options.customClasses,
            "elements.pre",
            DEFAULT_ELEMENTS.pre,
          );
        }
      }
    });
  } catch (error) {
    if (options.validate) {
      throw new Error(`Error applying basic classes: ${error}`);
    }
  }
}

/**
 * Main plugin function for rehype-org-enhancements
 *
 * This plugin enhances org-mode content parsed by uniorg with custom CSS classes
 * and styling for TODO keywords, priorities, timestamps, and basic HTML elements.
 *
 * @param options - Plugin configuration options
 * @returns Unified transformer function
 *
 * @example
 * ```typescript
 * import { unified } from 'unified';
 * import { rehypeOrgEnhancements } from './rehype-org-enhancements';
 *
 * const processor = unified()
 *   .use(uniorgParse)
 *   .use(uniorg2rehype)
 *   .use(rehypeOrgEnhancements, {
 *     customClasses: {
 *       todoKeywords: {
 *         TODO: ['custom-todo-class'],
 *       },
 *     },
 *   });
 * ```
 */
export const rehypeOrgEnhancements: Plugin<[PluginOptions?], Root, Root> = function (options = {}) {
  // Validate options if validation is enabled
  if (options.validate !== false) {
    validateOptions(options);
  }

  // Resolve options with defaults
  const resolvedOptions = resolveOptions(options);

  // Return transformer function
  const transformer: Transformer<Root, Root> = function (tree) {
    if (!tree || tree.type !== "root") {
      if (resolvedOptions.validate) {
        throw new Error("Expected root node");
      }
      return tree;
    }

    try {
      // Apply transformations in logical order
      transformTodoKeywords(tree, resolvedOptions);
      transformPriorities(tree, resolvedOptions);
      transformTimestamps(tree, resolvedOptions);
      applyBasicClasses(tree, resolvedOptions);
    } catch (error) {
      if (resolvedOptions.validate) {
        throw error;
      }
      // In non-validation mode, log error but continue
      console.warn("rehype-org-enhancements warning:", error);
    }

    return tree;
  };

  return transformer;
};

// Export default for convenience
export default rehypeOrgEnhancements;

// Export types for external use
export type { CustomClasses, PluginOptions };
