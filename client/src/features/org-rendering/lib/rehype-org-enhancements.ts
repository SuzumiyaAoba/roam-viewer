import { visit } from "unist-util-visit";
import type { Element, Root, Text } from "hast";

interface PluginOptions {
  enableSyntaxHighlight?: boolean;
}

// Helper function to get TODO keyword colors
function getTodoKeywordColor(keyword: string): string[] {
  const colors: Record<string, string[]> = {
    TODO: ["inline-flex", "items-center", "px-2", "py-1", "text-xs", "font-medium", "bg-orange-100", "text-orange-800", "mr-2"],
    DONE: ["inline-flex", "items-center", "px-2", "py-1", "text-xs", "font-medium", "bg-green-100", "text-green-800", "mr-2"],
    DOING: ["inline-flex", "items-center", "px-2", "py-1", "text-xs", "font-medium", "bg-blue-100", "text-blue-800", "mr-2"],
    NEXT: ["inline-flex", "items-center", "px-2", "py-1", "text-xs", "font-medium", "bg-purple-100", "text-purple-800", "mr-2"],
    WAITING: ["inline-flex", "items-center", "px-2", "py-1", "text-xs", "font-medium", "bg-yellow-100", "text-yellow-800", "mr-2"],
    CANCELLED: ["inline-flex", "items-center", "px-2", "py-1", "text-xs", "font-medium", "bg-gray-100", "text-gray-800", "mr-2"],
    CANCELED: ["inline-flex", "items-center", "px-2", "py-1", "text-xs", "font-medium", "bg-gray-100", "text-gray-800", "mr-2"],
  };
  return colors[keyword] || ["inline-flex", "items-center", "px-2", "py-1", "text-xs", "font-medium", "bg-gray-100", "text-gray-800", "mr-2"];
}

// Helper function to get priority colors
function getPriorityColor(priority: string): string[] {
  const colors: Record<string, string[]> = {
    A: ["inline-flex", "items-center", "px-2", "py-1", "text-xs", "font-medium", "bg-red-100", "text-red-800", "mr-2", "border", "border-current", "rounded"],
    B: ["inline-flex", "items-center", "px-2", "py-1", "text-xs", "font-medium", "bg-yellow-100", "text-yellow-800", "mr-2", "border", "border-current", "rounded"],
    C: ["inline-flex", "items-center", "px-2", "py-1", "text-xs", "font-medium", "bg-green-100", "text-green-800", "mr-2", "border", "border-current", "rounded"],
  };
  return colors[priority] || ["inline-flex", "items-center", "px-2", "py-1", "text-xs", "font-medium", "bg-gray-100", "text-gray-800", "mr-2", "border", "border-current", "rounded"];
}

// Helper function to get header classes by level
function getHeaderClass(level: number): string[] {
  const classes: Record<number, string[]> = {
    1: ["text-xl", "font-bold", "text-gray-900", "mb-3", "mt-6", "first:mt-0", "relative", "before:content-['#']", "before:text-gray-400", "before:mr-2", "before:font-mono"],
    2: ["text-lg", "font-semibold", "text-gray-800", "mb-3", "mt-5", "relative", "before:content-['##']", "before:text-gray-400", "before:mr-2", "before:font-mono"],
    3: ["text-base", "font-semibold", "text-gray-800", "mb-2", "mt-4", "relative", "before:content-['###']", "before:text-gray-400", "before:mr-2", "before:font-mono"],
    4: ["text-base", "font-medium", "text-gray-700", "mb-2", "mt-3", "relative", "before:content-['####']", "before:text-gray-400", "before:mr-2", "before:font-mono"],
    5: ["text-sm", "font-medium", "text-gray-700", "mb-2", "mt-3", "relative", "before:content-['#####']", "before:text-gray-400", "before:mr-2", "before:font-mono"],
    6: ["text-sm", "font-medium", "text-gray-600", "mb-1", "mt-2", "relative", "before:content-['######']", "before:text-gray-400", "before:mr-2", "before:font-mono"],
  };
  return classes[level] || ["text-sm", "font-medium", "text-gray-700"];
}

// Helper function to create an element
function createElement(tagName: string, properties: Record<string, any> = {}, children: any[] = []): Element {
  return {
    type: "element",
    tagName,
    properties,
    children,
  };
}

// Helper function to create a text node
function createText(value: string): Text {
  return {
    type: "text",
    value,
  };
}

// Transform TODO keywords in headers and standalone spans
function transformTodoKeywords(tree: Root): void {
  visit(tree, "element", (node: Element, _index, _parent) => {
    if (!node.children) return;

    // Handle TODO keywords in headers
    if (/^h[1-6]$/.test(node.tagName)) {
      const headerLevel = parseInt(node.tagName.charAt(1), 10);
      let hasChanges = false;

      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type === "text") {
          const textNode = child as Text;
          const todoKeywords = ["TODO", "DONE", "DOING", "NEXT", "WAITING", "CANCELLED", "CANCELED"];
          
          for (const keyword of todoKeywords) {
            const pattern = new RegExp(`^${keyword}\\s+`, "");
            if (pattern.test(textNode.value)) {
              // Split the text: keyword + remaining text
              const remainingText = textNode.value.replace(pattern, "").trim();
              
              // Create TODO keyword span
              const todoSpan = createElement("span", {
                className: getTodoKeywordColor(keyword),
              }, [createText(keyword)]);

              // Replace current text node with TODO span + remaining text
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
      }

      // Add header classes if changes were made or if no class exists
      if (hasChanges || !node.properties?.className) {
        node.properties = node.properties || {};
        node.properties.className = getHeaderClass(headerLevel);
      }
    }

    // Handle TODO keywords in standalone spans (from uniorg)
    if (node.tagName === "span" && node.properties?.className) {
      const classNames = Array.isArray(node.properties.className) 
        ? node.properties.className 
        : [node.properties.className];
      
      if (classNames.some((cls: any) => typeof cls === "string" && cls.includes("todo-keyword"))) {
        const textChild = node.children.find(child => child.type === "text") as Text;
        if (textChild) {
          const keyword = textChild.value.trim();
          node.properties.className = getTodoKeywordColor(keyword);
        }
      }
    }
  });
}

// Transform priority indicators [#A], [#B], [#C]
function transformPriorities(tree: Root): void {
  visit(tree, "text", (node: Text, index, parent) => {
    if (!parent || !Array.isArray(parent.children)) return;

    const priorityPattern = /\[(#?[ABC])\]/g;
    let match;
    const changes: Array<{index: number, replacement: any[]}> = [];
    
    while ((match = priorityPattern.exec(node.value)) !== null) {
      const fullMatch = match[0];
      const priority = match[1].replace('#', ''); // Remove # if present
      const beforeText = node.value.substring(0, match.index);
      const afterText = node.value.substring(match.index + fullMatch.length);
      
      const prioritySpan = createElement("span", {
        className: getPriorityColor(priority),
      }, [createText(`#${priority}`)]);

      const replacement = [];
      if (beforeText) replacement.push(createText(beforeText));
      replacement.push(prioritySpan);
      if (afterText) replacement.push(createText(afterText));

      changes.push({ index: index!, replacement });
      break; // Handle one match at a time
    }

    // Apply changes
    changes.forEach(({ index, replacement }) => {
      parent.children.splice(index, 1, ...replacement);
    });
  });
}

// Transform timestamp spans
function transformTimestamps(tree: Root): void {
  visit(tree, "element", (node: Element) => {
    if (node.tagName === "span" && 
        node.properties?.className && 
        (Array.isArray(node.properties.className) ? node.properties.className : [node.properties.className])
          .includes("timestamp")) {
      
      const textChild = node.children.find(child => child.type === "text") as Text;
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

          node.properties.className = ["inline-flex", "items-center", "gap-1", "px-3", "py-1", "bg-blue-50", "text-blue-700", "border", "border-blue-200", "rounded-lg", "text-sm", "font-medium"];
          node.children = [
            createElement("svg", {
              className: ["w-3", "h-3"],
              fill: "none" as const,
              stroke: "currentColor" as const,
              viewBox: "0 0 24 24" as const,
            }, [
              createElement("path", {
                strokeLinecap: "round" as const,
                strokeLinejoin: "round" as const,
                strokeWidth: "2" as const,
                d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" as const,
              }),
            ]),
            createElement("span", {}, [createText(startTime)]),
            createElement("svg", {
              className: ["w-3", "h-3", "text-blue-500"],
              fill: "none" as const,
              stroke: "currentColor" as const,
              viewBox: "0 0 24 24" as const,
            }, [
              createElement("path", {
                strokeLinecap: "round" as const,
                strokeLinejoin: "round" as const,
                strokeWidth: "2" as const,
                d: "M13 7l5 5-5 5M6 12h12" as const,
              }),
            ]),
            createElement("span", {}, [createText(endTime)]),
          ];
        }
      } else if (isActive) {
        const cleanContent = content.replace(/^[<[]|[>\]]$/g, "");
        node.properties.className = ["inline-flex", "items-center", "gap-1", "px-2", "py-1", "bg-green-50", "text-green-700", "border", "border-green-200", "rounded-md", "text-sm"];
        node.children = [
          createElement("svg", {
            className: ["w-3", "h-3"],
            fill: "none" as const,
            stroke: "currentColor" as const,
            viewBox: "0 0 24 24" as const,
          }, [
            createElement("path", {
              strokeLinecap: "round" as const,
              strokeLinejoin: "round" as const,
              strokeWidth: "2" as const,
              d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" as const,
            }),
          ]),
          createText(cleanContent),
        ];
      } else if (isInactive) {
        const cleanContent = content.replace(/^[<[]|[>\]]$/g, "");
        node.properties.className = ["inline-flex", "items-center", "gap-1", "px-2", "py-1", "bg-gray-50", "text-gray-600", "border", "border-gray-200", "rounded-md", "text-sm"];
        node.children = [
          createElement("svg", {
            className: ["w-3", "h-3"],
            fill: "none" as const,
            stroke: "currentColor" as const,
            viewBox: "0 0 24 24" as const,
          }, [
            createElement("path", {
              strokeLinecap: "round" as const,
              strokeLinejoin: "round" as const,
              strokeWidth: "2" as const,
              d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" as const,
            }),
          ]),
          createText(cleanContent),
        ];
      } else {
        // Fallback styling
        const cleanContent = content.replace(/^[<[]|[>]]$/g, "");
        node.properties.className = ["inline-flex", "items-center", "gap-1", "px-2", "py-1", "bg-blue-50", "text-blue-600", "border", "border-blue-200", "rounded-md", "text-sm"];
        node.children = [
          createElement("svg", {
            className: ["w-3", "h-3"],
            fill: "none" as const,
            stroke: "currentColor" as const,
            viewBox: "0 0 24 24" as const,
          }, [
            createElement("path", {
              strokeLinecap: "round" as const,
              strokeLinejoin: "round" as const,
              strokeWidth: "2" as const,
              d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" as const,
            }),
          ]),
          createText(cleanContent),
        ];
      }
    }
  });
}

// Apply basic Tailwind CSS classes
function applyBasicTailwindClasses(tree: Root, _enableSyntaxHighlight: boolean): void {
  visit(tree, "element", (node: Element) => {
    // Skip elements that already have classes to avoid conflicts
    const hasClasses = node.properties?.className && 
      (Array.isArray(node.properties.className) ? node.properties.className.length > 0 : true);

    if (hasClasses && node.tagName !== "pre" && node.tagName !== "code") {
      return;
    }

    switch (node.tagName) {
      case "h1":
        if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = getHeaderClass(1);
        }
        break;
      case "h2":
        if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = getHeaderClass(2);
        }
        break;
      case "h3":
        if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = getHeaderClass(3);
        }
        break;
      case "h4":
        if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = getHeaderClass(4);
        }
        break;
      case "h5":
        if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = getHeaderClass(5);
        }
        break;
      case "h6":
        if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = getHeaderClass(6);
        }
        break;
      case "p":
        if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = ["text-gray-700", "leading-relaxed", "mb-4"];
        }
        break;
      case "ul":
        if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = ["list-disc", "list-inside", "mb-4", "ml-4", "space-y-1"];
        }
        break;
      case "ol":
        if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = ["list-decimal", "list-inside", "mb-4", "ml-4", "space-y-1"];
        }
        break;
      case "li":
        if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = ["text-gray-700"];
        }
        break;
      case "code":
        // Handle both Shiki-styled and regular code blocks
        const classNames = Array.isArray(node.properties?.className) 
          ? node.properties.className 
          : node.properties?.className ? [node.properties.className] : [];
        
        if (!classNames.some(cls => typeof cls === 'string' && cls.includes("shiki"))) {
          node.properties = node.properties || {};
          node.properties.className = ["bg-gray-100", "text-gray-800", "px-1.5", "py-0.5", "rounded", "text-sm", "font-mono"];
        }
        break;
      case "pre":
        const preClassNames = Array.isArray(node.properties?.className) 
          ? node.properties.className 
          : node.properties?.className ? [node.properties.className] : [];
        
        if (preClassNames.some(cls => typeof cls === 'string' && cls.includes("shiki"))) {
          // Enhance Shiki styling
          node.properties = node.properties || {};
          const existingClasses = Array.isArray(node.properties.className) 
            ? node.properties.className.filter((cls): cls is string => typeof cls === 'string')
            : [node.properties.className].filter((cls): cls is string => typeof cls === 'string');
          node.properties.className = [...existingClasses, "rounded-lg", "overflow-x-auto", "mb-4", "text-sm", "border", "border-gray-200", "shadow-sm", "p-4"];
        } else if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = ["bg-gray-900", "text-gray-100", "p-4", "rounded-lg", "overflow-x-auto", "mb-4", "text-sm"];
        }
        break;
      case "table":
        if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = ["min-w-full", "divide-y", "divide-gray-200", "border"];
        }
        break;
      case "th":
        if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = ["px-6", "py-3", "text-left", "text-xs", "font-medium", "text-gray-500", "uppercase", "tracking-wider"];
        }
        break;
      case "td":
        if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = ["px-6", "py-4", "whitespace-nowrap", "text-sm", "text-gray-900"];
        }
        break;
      case "thead":
        if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = ["bg-gray-50"];
        }
        break;
      case "tbody":
        if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = ["bg-white", "divide-y", "divide-gray-200"];
        }
        break;
      case "a":
        if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = ["text-blue-600", "hover:text-blue-800", "underline"];
        }
        break;
      case "strong":
        if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = ["font-semibold", "text-gray-900"];
        }
        break;
      case "em":
        if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = ["italic"];
        }
        break;
      case "hr":
        if (!hasClasses) {
          node.properties = node.properties || {};
          node.properties.className = ["border-gray-300", "my-8"];
        }
        break;
    }
  });
}

// Main plugin function
export function rehypeOrgEnhancements(options: PluginOptions = {}) {
  const { enableSyntaxHighlight = true } = options;

  return function transformer(tree: Root) {
    // Apply transformations in order
    transformTodoKeywords(tree);
    transformPriorities(tree);
    transformTimestamps(tree);
    applyBasicTailwindClasses(tree, enableSyntaxHighlight);
    
    return tree;
  };
}