/**
 * @fileoverview A unified rehype plugin for enhancing org-mode content with custom CSS classes
 * @author Claude Code
 * @version 2.0.0
 */

import { visit } from "unist-util-visit";
import type { Element, Root, Text, Node } from "hast";
import type { Plugin, Transformer } from "unified";

// ============================================================================
// CONSTANTS
// ============================================================================

/** Regular expression patterns used throughout the plugin */
const PATTERNS = {
  HEADER: /^h[1-6]$/,
  PRIORITY: (levels: string[]) => new RegExp(`\\[(#?[${levels.join("")}])\\]`, "g"),
  TODO_KEYWORD: (keyword: string) => new RegExp(`^${keyword}\\s+`, ""),
  TIMESTAMP_CLEANUP: /^[<[]|[>\]]$/g,
} as const;

/** SVG icon definitions for timestamps */
const SVG_ICONS = {
  CLOCK: {
    viewBox: "0 0 24 24",
    path: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  ARROW: {
    viewBox: "0 0 24 24",
    path: "M13 7l5 5-5 5M6 12h12",
  },
  CALENDAR: {
    viewBox: "0 0 24 24",
    path: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z",
  },
} as const;

/** Header level constants */
const HEADER_LEVELS = {
  MIN: 1,
  MAX: 6,
} as const;

/** Common SVG properties to reduce duplication */
const SVG_PROPS = {
  fill: "none" as const,
  stroke: "currentColor" as const,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: "2" as const,
} as const;

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
 * Validation error messages
 */
const VALIDATION_ERRORS = {
  ENABLE_SYNTAX_HIGHLIGHT: "enableSyntaxHighlight must be a boolean",
  CUSTOM_CLASSES: "customClasses must be an object",
  VALIDATE: "validate must be a boolean",
  TODO_KEYWORDS_ARRAY: "todoKeywords must be an array",
  TODO_KEYWORDS_STRINGS: "All todoKeywords must be strings",
  PRIORITY_LEVELS_ARRAY: "priorityLevels must be an array",
  PRIORITY_LEVELS_STRINGS: "All priorityLevels must be strings",
} as const;

/**
 * Validates a string array option
 * @param option - Option value to validate
 * @param arrayErrorMsg - Error message for non-array
 * @param stringErrorMsg - Error message for non-string items
 * @throws {Error} If validation fails
 */
function validateStringArray(
  option: unknown,
  arrayErrorMsg: string,
  stringErrorMsg: string,
): void {
  if (!Array.isArray(option)) {
    throw new Error(arrayErrorMsg);
  }
  if (option.some((item) => typeof item !== "string")) {
    throw new Error(stringErrorMsg);
  }
}

/**
 * Validates boolean option
 * @param option - Option value to validate
 * @param errorMsg - Error message if not boolean
 * @throws {Error} If validation fails
 */
function validateBoolean(option: unknown, errorMsg: string): void {
  if (typeof option !== "boolean") {
    throw new Error(errorMsg);
  }
}

/**
 * Validates object option
 * @param option - Option value to validate
 * @param errorMsg - Error message if not object
 * @throws {Error} If validation fails
 */
function validateObject(option: unknown, errorMsg: string): void {
  if (typeof option !== "object" || option === null || Array.isArray(option)) {
    throw new Error(errorMsg);
  }
}

/**
 * Validates plugin options with improved error messages and structure
 * @param options - Plugin options to validate
 * @throws {Error} If options are invalid
 */
function validateOptions(options: PluginOptions): void {
  // Validate enableSyntaxHighlight
  if (options.enableSyntaxHighlight !== undefined) {
    validateBoolean(options.enableSyntaxHighlight, VALIDATION_ERRORS.ENABLE_SYNTAX_HIGHLIGHT);
  }

  // Validate customClasses
  if (options.customClasses !== undefined) {
    validateObject(options.customClasses, VALIDATION_ERRORS.CUSTOM_CLASSES);
  }

  // Validate validate option
  if (options.validate !== undefined) {
    validateBoolean(options.validate, VALIDATION_ERRORS.VALIDATE);
  }

  // Validate todoKeywords
  if (options.todoKeywords !== undefined) {
    validateStringArray(
      options.todoKeywords,
      VALIDATION_ERRORS.TODO_KEYWORDS_ARRAY,
      VALIDATION_ERRORS.TODO_KEYWORDS_STRINGS,
    );
  }

  // Validate priorityLevels
  if (options.priorityLevels !== undefined) {
    validateStringArray(
      options.priorityLevels,
      VALIDATION_ERRORS.PRIORITY_LEVELS_ARRAY,
      VALIDATION_ERRORS.PRIORITY_LEVELS_STRINGS,
    );
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
 * Creates an SVG icon element with consistent properties
 * @param iconType - Type of icon from SVG_ICONS
 * @param customClasses - Custom CSS classes
 * @param classPath - Path to classes in custom configuration
 * @param defaultClasses - Default classes to use
 * @returns SVG element
 */
function createSvgIcon(
  iconType: keyof typeof SVG_ICONS,
  customClasses: CustomClasses,
  classPath: string,
  defaultClasses: readonly string[],
): Element {
  const icon = SVG_ICONS[iconType];
  return createElement(
    "svg",
    {
      className: getClasses(customClasses, classPath, defaultClasses),
      ...SVG_PROPS,
      viewBox: icon.viewBox,
    },
    [
      createElement("path", {
        ...SVG_PROPS,
        d: icon.path,
      }),
    ],
  );
}

/**
 * Creates a timestamp span with icon and text
 * @param content - Text content
 * @param iconType - Type of icon to use
 * @param customClasses - Custom CSS classes
 * @param classPath - Path to classes in custom configuration
 * @param defaultClasses - Default classes
 * @param iconClassPath - Path to icon classes
 * @param defaultIconClasses - Default icon classes
 * @returns Array of child elements
 */
function createTimestampContent(
  content: string,
  iconType: keyof typeof SVG_ICONS,
  customClasses: CustomClasses,
  classPath: string,
  defaultClasses: readonly string[],
  iconClassPath: string,
  defaultIconClasses: readonly string[],
): (Element | Text)[] {
  return [
    createSvgIcon(iconType, customClasses, iconClassPath, defaultIconClasses),
    createText(content),
  ];
}

/**
 * Checks if a header level is valid
 * @param level - Header level to validate
 * @returns True if level is valid (1-6)
 */
function isValidHeaderLevel(level: number): boolean {
  return !isNaN(level) && level >= HEADER_LEVELS.MIN && level <= HEADER_LEVELS.MAX;
}

/**
 * Extracts header level from tag name
 * @param tagName - HTML tag name (e.g., 'h1', 'h2')
 * @returns Header level (1-6) or null if invalid
 */
function extractHeaderLevel(tagName: string): number | null {
  if (!PATTERNS.HEADER.test(tagName)) return null;
  const level = parseInt(tagName.charAt(1), 10);
  return isValidHeaderLevel(level) ? level : null;
}

/**
 * Processes TODO keyword in header text node
 * @param child - Text node containing TODO keyword
 * @param keyword - TODO keyword to process
 * @param options - Resolved plugin options
 * @returns Object with remaining text and todo span, or null if no match
 */
function processTodoKeywordInText(
  child: Text,
  keyword: string,
  options: ResolvedOptions,
): { remainingText: string; todoSpan: Element } | null {
  const pattern = PATTERNS.TODO_KEYWORD(keyword);
  if (!pattern.test(child.value)) return null;

  const remainingText = child.value.replace(pattern, "").trim();
  const todoClasses = getClasses(
    options.customClasses,
    `todoKeywords.${keyword}`,
    DEFAULT_TODO_KEYWORDS[keyword] || DEFAULT_TODO_KEYWORDS.TODO,
  );

  const todoSpan = createElement(
    "span",
    { className: todoClasses },
    [createText(keyword)],
  );

  return { remainingText, todoSpan };
}

/**
 * Transforms TODO keywords in header elements
 * @param node - Header element
 * @param options - Resolved plugin options
 * @returns True if any changes were made
 */
function transformHeaderTodoKeywords(node: Element, options: ResolvedOptions): boolean {
  const headerLevel = extractHeaderLevel(node.tagName);
  if (!headerLevel || !node.children) return false;

  let hasChanges = false;

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (!child || !isText(child)) continue;

    for (const keyword of options.todoKeywords) {
      const result = processTodoKeywordInText(child, keyword, options);
      if (result) {
        const { remainingText, todoSpan } = result;
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

  return hasChanges;
}

/**
 * Transforms standalone TODO keyword spans (from uniorg)
 * @param node - Span element with TODO keyword class
 * @param options - Resolved plugin options
 */
function transformStandaloneTodoKeywords(node: Element, options: ResolvedOptions): void {
  if (!node.properties?.className) return;

  const classNames = Array.isArray(node.properties.className)
    ? node.properties.className
    : [node.properties.className];

  if (!classNames.some((cls: unknown) => typeof cls === "string" && cls.includes("todo-keyword"))) {
    return;
  }

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
      if (PATTERNS.HEADER.test(node.tagName)) {
        transformHeaderTodoKeywords(node, options);
        return;
      }

      // Handle TODO keywords in standalone spans (from uniorg)
      if (node.tagName === "span") {
        transformStandaloneTodoKeywords(node, options);
      }
    });
  } catch (error) {
    if (options.validate) {
      throw new Error(`Error transforming TODO keywords: ${error}`);
    }
  }
}

/**
 * Priority transformation result
 */
interface PriorityTransformResult {
  index: number;
  replacement: (Element | Text)[];
}

/**
 * Creates a priority span element
 * @param priority - Priority level (A, B, C, etc.)
 * @param options - Resolved plugin options
 * @returns Priority span element
 */
function createPrioritySpan(priority: string, options: ResolvedOptions): Element {
  const priorityClasses = getClasses(
    options.customClasses,
    `priorities.${priority}`,
    DEFAULT_PRIORITIES[priority] || DEFAULT_PRIORITIES.A,
  );

  return createElement(
    "span",
    { className: priorityClasses },
    [createText(`#${priority}`)],
  );
}

/**
 * Processes priority indicators in a text node
 * @param node - Text node to process
 * @param options - Resolved plugin options
 * @returns Array of transformation results
 */
function processPriorityIndicators(
  node: Text,
  options: ResolvedOptions,
): PriorityTransformResult[] {
  const priorityPattern = PATTERNS.PRIORITY(options.priorityLevels);
  const changes: PriorityTransformResult[] = [];
  let match;

  // Reset regex lastIndex to ensure we start from the beginning
  priorityPattern.lastIndex = 0;

  while ((match = priorityPattern.exec(node.value)) !== null) {
    const fullMatch = match[0];
    const priority = match[1].replace("#", "");
    
    // Double-check priority is valid (regex should ensure this, but be safe)
    if (!options.priorityLevels.includes(priority)) continue;

    const beforeText = node.value.substring(0, match.index);
    const afterText = node.value.substring(match.index + fullMatch.length);

    const prioritySpan = createPrioritySpan(priority, options);
    const replacement: (Element | Text)[] = [];
    
    if (beforeText) replacement.push(createText(beforeText));
    replacement.push(prioritySpan);
    if (afterText) replacement.push(createText(afterText));

    changes.push({ index: 0, replacement }); // Index will be set by caller
    break; // Handle one match at a time to avoid index confusion
  }

  return changes;
}

/**
 * Validates parent and index for priority transformation
 * @param parent - Parent node
 * @param index - Index of current node
 * @returns True if valid for transformation
 */
function isValidForPriorityTransform(
  parent: Node | null,
  index: number | undefined,
): parent is Element & { children: (Element | Text)[] } {
  return (
    parent !== null &&
    index !== undefined &&
    "children" in parent &&
    Array.isArray(parent.children)
  );
}

/**
 * Transforms priority indicators [#A], [#B], [#C]
 * @param tree - Hast tree
 * @param options - Resolved plugin options
 */
function transformPriorities(tree: Root, options: ResolvedOptions): void {
  try {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!isValidForPriorityTransform(parent, index)) return;

      const changes = processPriorityIndicators(node, options);
      
      // Apply changes (we know there's at most one change due to early break)
      changes.forEach(({ replacement }) => {
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
 * Timestamp type definitions for better type safety
 */
type TimestampType = "range" | "active" | "inactive" | "fallback";

/**
 * Configuration for timestamp processing
 */
interface TimestampConfig {
  type: TimestampType;
  iconType: keyof typeof SVG_ICONS;
  classPath: string;
  iconClassPath: string;
  defaultClasses: readonly string[];
  defaultIconClasses: readonly string[];
}

/**
 * Determines timestamp type and returns configuration
 * @param content - Timestamp content
 * @returns Timestamp configuration or null if invalid
 */
function getTimestampConfig(content: string): TimestampConfig | null {
  const isRange = content.includes("--");
  const isActive = content.startsWith("<") && content.endsWith(">");
  const isInactive = content.startsWith("[") && content.endsWith("]");

  if (isRange) {
    return {
      type: "range",
      iconType: "CLOCK",
      classPath: "timestamps.range",
      iconClassPath: "timestamps.rangeIcon",
      defaultClasses: DEFAULT_TIMESTAMPS.range,
      defaultIconClasses: DEFAULT_TIMESTAMPS.rangeIcon,
    };
  }

  if (isActive) {
    return {
      type: "active",
      iconType: "CLOCK",
      classPath: "timestamps.active",
      iconClassPath: "timestamps.clockIcon",
      defaultClasses: DEFAULT_TIMESTAMPS.active,
      defaultIconClasses: DEFAULT_TIMESTAMPS.clockIcon,
    };
  }

  if (isInactive) {
    return {
      type: "inactive",
      iconType: "CALENDAR",
      classPath: "timestamps.inactive",
      iconClassPath: "timestamps.calendarIcon",
      defaultClasses: DEFAULT_TIMESTAMPS.inactive,
      defaultIconClasses: DEFAULT_TIMESTAMPS.calendarIcon,
    };
  }

  // Fallback
  return {
    type: "fallback",
    iconType: "CLOCK",
    classPath: "timestamps.fallback",
    iconClassPath: "timestamps.clockIcon",
    defaultClasses: DEFAULT_TIMESTAMPS.fallback,
    defaultIconClasses: DEFAULT_TIMESTAMPS.clockIcon,
  };
}

/**
 * Creates timestamp range content with start/end times and arrow
 * @param content - Raw timestamp content
 * @param options - Resolved plugin options
 * @param config - Timestamp configuration
 * @returns Array of child elements for range timestamp
 */
function createRangeTimestampContent(
  content: string,
  options: ResolvedOptions,
  config: TimestampConfig,
): (Element | Text)[] {
  const rangeParts = content.split("--");
  if (rangeParts.length !== 2) {
    // Fallback to simple timestamp if parsing fails
    const cleanContent = content.replace(PATTERNS.TIMESTAMP_CLEANUP, "");
    return createTimestampContent(
      cleanContent,
      config.iconType,
      options.customClasses,
      config.classPath,
      config.defaultClasses,
      config.iconClassPath,
      config.defaultIconClasses,
    );
  }

  const startTime = rangeParts[0].trim().replace(PATTERNS.TIMESTAMP_CLEANUP, "");
  const endTime = rangeParts[1].trim().replace(PATTERNS.TIMESTAMP_CLEANUP, "");

  return [
    createSvgIcon(
      config.iconType,
      options.customClasses,
      config.iconClassPath,
      config.defaultIconClasses,
    ),
    createElement("span", {}, [createText(startTime)]),
    createSvgIcon(
      "ARROW",
      options.customClasses,
      "timestamps.arrowIcon",
      DEFAULT_TIMESTAMPS.arrowIcon,
    ),
    createElement("span", {}, [createText(endTime)]),
  ];
}

/**
 * Transforms a single timestamp element
 * @param node - Timestamp span element
 * @param options - Resolved plugin options
 */
function transformTimestampElement(node: Element, options: ResolvedOptions): void {
  const textChild = node.children?.find((child) => child && child.type === "text") as Text;
  if (!textChild) return;

  const content = textChild.value;
  const config = getTimestampConfig(content);
  if (!config) return;

  // Apply timestamp classes
  node.properties.className = getClasses(
    options.customClasses,
    config.classPath,
    config.defaultClasses,
  );

  // Create appropriate content based on timestamp type
  if (config.type === "range") {
    node.children = createRangeTimestampContent(content, options, config);
  } else {
    const cleanContent = content.replace(PATTERNS.TIMESTAMP_CLEANUP, "");
    node.children = createTimestampContent(
      cleanContent,
      config.iconType,
      options.customClasses,
      config.classPath,
      config.defaultClasses,
      config.iconClassPath,
      config.defaultIconClasses,
    );
  }
}

/**
 * Checks if an element is a timestamp span
 * @param node - Element to check
 * @returns True if element is a timestamp span
 */
function isTimestampElement(node: Element): boolean {
  if (node.tagName !== "span" || !node.properties?.className) return false;

  const classNames = Array.isArray(node.properties.className)
    ? node.properties.className
    : [node.properties.className];

  return classNames.includes("timestamp");
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
      
      if (isTimestampElement(node)) {
        transformTimestampElement(node, options);
      }
    });
  } catch (error) {
    if (options.validate) {
      throw new Error(`Error transforming timestamps: ${error}`);
    }
  }
}

/**
 * Element mapping for basic styling
 */
const BASIC_ELEMENT_MAP = [
  ["p", "elements.p", DEFAULT_ELEMENTS.p],
  ["ul", "elements.ul", DEFAULT_ELEMENTS.ul],
  ["ol", "elements.ol", DEFAULT_ELEMENTS.ol],
  ["li", "elements.li", DEFAULT_ELEMENTS.li],
  ["table", "elements.table", DEFAULT_ELEMENTS.table],
  ["th", "elements.th", DEFAULT_ELEMENTS.th],
  ["td", "elements.td", DEFAULT_ELEMENTS.td],
  ["thead", "elements.thead", DEFAULT_ELEMENTS.thead],
  ["tbody", "elements.tbody", DEFAULT_ELEMENTS.tbody],
  ["a", "elements.a", DEFAULT_ELEMENTS.a],
  ["strong", "elements.strong", DEFAULT_ELEMENTS.strong],
  ["em", "elements.em", DEFAULT_ELEMENTS.em],
  ["hr", "elements.hr", DEFAULT_ELEMENTS.hr],
] as const;

/**
 * Checks if an element has existing CSS classes
 * @param node - Element to check
 * @returns True if element has classes
 */
function hasExistingClasses(node: Element): boolean {
  return Boolean(
    node.properties?.className &&
    (Array.isArray(node.properties.className)
      ? node.properties.className.length > 0
      : true),
  );
}

/**
 * Normalizes class names to string array
 * @param className - Class name(s) to normalize
 * @returns Array of string class names
 */
function normalizeClassNames(className: unknown): string[] {
  if (!className) return [];
  if (Array.isArray(className)) {
    return className.filter((cls): cls is string => typeof cls === "string");
  }
  return typeof className === "string" ? [className] : [];
}

/**
 * Applies classes to an element, ensuring properties object exists
 * @param node - Element to apply classes to
 * @param classes - Classes to apply
 */
function applyClasses(node: Element, classes: string[]): void {
  node.properties = node.properties || {};
  node.properties.className = classes;
}

/**
 * Processes header elements for basic styling
 * @param node - Header element
 * @param options - Resolved plugin options
 */
function processHeaderElement(node: Element, options: ResolvedOptions): void {
  const level = extractHeaderLevel(node.tagName);
  if (!level || hasExistingClasses(node)) return;

  const classes = getClasses(
    options.customClasses,
    `headers.${level}`,
    DEFAULT_HEADERS[level] || DEFAULT_HEADERS[1],
  );
  applyClasses(node, classes);
}

/**
 * Processes code elements with special Shiki handling
 * @param node - Code element
 * @param options - Resolved plugin options
 */
function processCodeElement(node: Element, options: ResolvedOptions): void {
  const classNames = normalizeClassNames(node.properties?.className);
  const hasShiki = classNames.some((cls) => cls.includes("shiki"));
  
  if (!hasShiki) {
    const classes = getClasses(
      options.customClasses,
      "elements.code",
      DEFAULT_ELEMENTS.code,
    );
    applyClasses(node, classes);
  }
}

/**
 * Processes pre elements with special Shiki handling
 * @param node - Pre element
 * @param options - Resolved plugin options
 */
function processPreElement(node: Element, options: ResolvedOptions): void {
  const classNames = normalizeClassNames(node.properties?.className);
  const hasShiki = classNames.some((cls) => cls.includes("shiki"));
  
  if (hasShiki) {
    // Merge existing classes with Shiki-specific styling
    const preShikiClasses = getClasses(
      options.customClasses,
      "elements.preShiki",
      DEFAULT_ELEMENTS.preShiki,
    );
    applyClasses(node, [...classNames, ...preShikiClasses]);
  } else if (!hasExistingClasses(node)) {
    const classes = getClasses(
      options.customClasses,
      "elements.pre",
      DEFAULT_ELEMENTS.pre,
    );
    applyClasses(node, classes);
  }
}

/**
 * Processes basic elements for styling
 * @param node - Element to process
 * @param options - Resolved plugin options
 */
function processBasicElement(node: Element, options: ResolvedOptions): void {
  if (hasExistingClasses(node)) return;

  for (const [tagName, path, defaultClasses] of BASIC_ELEMENT_MAP) {
    if (node.tagName === tagName) {
      const classes = getClasses(options.customClasses, path, defaultClasses);
      applyClasses(node, classes);
      break;
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
      if (!node || !node.tagName) return;

      // Skip elements that already have classes (except pre and code which need special handling)
      const hasClasses = hasExistingClasses(node);
      if (hasClasses && node.tagName !== "pre" && node.tagName !== "code") {
        return;
      }

      // Handle different element types
      if (PATTERNS.HEADER.test(node.tagName)) {
        processHeaderElement(node, options);
      } else if (node.tagName === "code") {
        processCodeElement(node, options);
      } else if (node.tagName === "pre") {
        processPreElement(node, options);
      } else {
        processBasicElement(node, options);
      }
    });
  } catch (error) {
    if (options.validate) {
      throw new Error(`Error applying basic classes: ${error}`);
    }
  }
}

// ============================================================================
// MAIN PLUGIN FUNCTION
// ============================================================================

/**
 * Plugin performance configuration
 */
interface PluginPerformanceConfig {
  /** Whether to enable performance monitoring */
  enablePerformanceLogging: boolean;
  /** Performance threshold in milliseconds for warnings */
  performanceThreshold: number;
}

/**
 * Default performance configuration
 */
const DEFAULT_PERFORMANCE_CONFIG: PluginPerformanceConfig = {
  enablePerformanceLogging: false,
  performanceThreshold: 100, // ms
};

/**
 * Logs performance metrics if enabled
 * @param operation - Name of the operation
 * @param duration - Duration in milliseconds
 * @param config - Performance configuration
 */
function logPerformance(
  operation: string,
  duration: number,
  config: PluginPerformanceConfig,
): void {
  if (!config.enablePerformanceLogging) return;
  
  if (duration > config.performanceThreshold) {
    console.warn(`rehype-org-enhancements: ${operation} took ${duration}ms`);
  } else {
    console.debug(`rehype-org-enhancements: ${operation} took ${duration}ms`);
  }
}

/**
 * Validates the input tree structure
 * @param tree - Tree to validate
 * @param validate - Whether to throw on invalid tree
 * @returns True if tree is valid, false otherwise
 */
function validateTree(tree: unknown, validate: boolean): tree is Root {
  if (!tree || typeof tree !== "object" || (tree as Root).type !== "root") {
    if (validate) {
      throw new Error("Expected root node");
    }
    return false;
  }
  return true;
}

/**
 * Applies all transformations to the tree with error handling and performance monitoring
 * @param tree - Root tree node
 * @param options - Resolved plugin options
 */
function applyTransformations(tree: Root, options: ResolvedOptions): void {
  const performanceConfig = DEFAULT_PERFORMANCE_CONFIG;
  const transformations = [
    { name: "TODO keywords", fn: transformTodoKeywords },
    { name: "priorities", fn: transformPriorities },
    { name: "timestamps", fn: transformTimestamps },
    { name: "basic classes", fn: applyBasicClasses },
  ] as const;

  for (const { name, fn } of transformations) {
    const startTime = performance.now();
    try {
      fn(tree, options);
    } catch (error) {
      if (options.validate) {
        throw new Error(`Error in ${name} transformation: ${error}`);
      }
      console.warn(`rehype-org-enhancements: ${name} transformation failed:`, error);
    }
    const endTime = performance.now();
    logPerformance(`${name} transformation`, endTime - startTime, performanceConfig);
  }
}

/**
 * Main plugin function for rehype-org-enhancements
 *
 * This unified plugin enhances org-mode content parsed by uniorg with custom CSS classes
 * and styling for various org-mode elements including:
 *
 * - **TODO Keywords**: Transforms TODO, DONE, DOING, etc. with customizable styling
 * - **Priority Indicators**: Handles [#A], [#B], [#C] priority markers
 * - **Timestamps**: Styles active/inactive timestamps and ranges with icons
 * - **Basic Elements**: Applies consistent styling to HTML elements
 *
 * @param options - Plugin configuration options
 * @returns Unified transformer function that processes hast trees
 *
 * @example Basic usage
 * ```typescript
 * import { unified } from 'unified';
 * import { rehypeOrgEnhancements } from './rehype-org-enhancements';
 *
 * const processor = unified()
 *   .use(uniorgParse)
 *   .use(uniorg2rehype)
 *   .use(rehypeOrgEnhancements);
 * ```
 *
 * @example With custom classes
 * ```typescript
 * const processor = unified()
 *   .use(uniorgParse)
 *   .use(uniorg2rehype)
 *   .use(rehypeOrgEnhancements, {
 *     customClasses: {
 *       todoKeywords: {
 *         TODO: ['bg-orange-200', 'text-orange-800'],
 *         DONE: ['bg-green-200', 'text-green-800'],
 *       },
 *       priorities: {
 *         A: ['bg-red-200', 'text-red-800', 'font-bold'],
 *       },
 *       timestamps: {
 *         active: ['bg-blue-100', 'text-blue-700'],
 *       },
 *       elements: {
 *         p: ['text-gray-800', 'leading-relaxed'],
 *         code: ['bg-slate-100', 'rounded', 'px-2'],
 *       },
 *     },
 *     todoKeywords: ['TODO', 'DONE', 'WAITING', 'DELEGATED'],
 *     priorityLevels: ['A', 'B', 'C', 'D'],
 *   });
 * ```
 *
 * @example Performance and validation options
 * ```typescript
 * const processor = unified()
 *   .use(uniorgParse)
 *   .use(uniorg2rehype)
 *   .use(rehypeOrgEnhancements, {
 *     validate: false, // Disable validation for better performance
 *     enableSyntaxHighlight: true, // Enable syntax highlighting integration
 *   });
 * ```
 */
export const rehypeOrgEnhancements: Plugin<[PluginOptions?], Root, Root> = function (options = {}) {
  // Validate options if validation is enabled (default: true)
  if (options.validate !== false) {
    validateOptions(options);
  }

  // Resolve options with defaults and create immutable config
  const resolvedOptions = Object.freeze(resolveOptions(options));

  /**
   * Transformer function that processes hast trees
   * @param tree - Root hast tree node
   * @returns Processed tree
   */
  const transformer: Transformer<Root, Root> = function (tree) {
    // Validate input tree structure
    if (!validateTree(tree, resolvedOptions.validate)) {
      return tree;
    }

    const startTime = performance.now();
    
    try {
      // Apply all transformations with error handling and performance monitoring
      applyTransformations(tree, resolvedOptions);
    } catch (error) {
      // Re-throw validation errors, log others
      if (resolvedOptions.validate) {
        throw error;
      }
      console.warn("rehype-org-enhancements: Transformation failed:", error);
    }

    const endTime = performance.now();
    logPerformance("total plugin execution", endTime - startTime, DEFAULT_PERFORMANCE_CONFIG);

    return tree;
  };

  return transformer;
};

// Export default for convenience
export default rehypeOrgEnhancements;

// Export types for external use
export type { CustomClasses, PluginOptions };
