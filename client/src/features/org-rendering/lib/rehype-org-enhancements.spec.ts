/**
 * @fileoverview Tests for rehype-org-enhancements plugin
 */

import { describe, expect, test } from "vitest";
import { unified } from "unified";
import {
  rehypeOrgEnhancements,
  type CustomClasses,
  type PluginOptions,
} from "./rehype-org-enhancements";
import type { Root, Element } from "hast";

// Helper function to create a mock hast tree
function createMockTree(elements: Element[]): Root {
  return {
    type: "root",
    children: elements,
  };
}

// Helper function to create an element
function createElement(tagName: string, properties: any = {}, children: any[] = []): Element {
  return {
    type: "element",
    tagName,
    properties,
    children,
  };
}

// Helper function to create a text node
function createText(value: string) {
  return {
    type: "text",
    value,
  };
}

describe("rehype-org-enhancements", () => {
  describe("Plugin Configuration", () => {
    test("should accept default options", () => {
      expect(() => {
        const plugin = rehypeOrgEnhancements();
        expect(typeof plugin).toBe("function");
      }).not.toThrow();
    });

    test("should validate options correctly", () => {
      expect(() => {
        rehypeOrgEnhancements({
          enableSyntaxHighlight: "invalid" as any,
        });
      }).toThrow("enableSyntaxHighlight must be a boolean");

      expect(() => {
        rehypeOrgEnhancements({
          customClasses: "invalid" as any,
        });
      }).toThrow("customClasses must be an object");

      expect(() => {
        rehypeOrgEnhancements({
          validate: "invalid" as any,
        });
      }).toThrow("validate must be a boolean");

      expect(() => {
        rehypeOrgEnhancements({
          todoKeywords: "invalid" as any,
        });
      }).toThrow("todoKeywords must be an array");

      expect(() => {
        rehypeOrgEnhancements({
          priorityLevels: [123] as any,
        });
      }).toThrow("All priorityLevels must be strings");
    });

    test("should disable validation when requested", () => {
      expect(() => {
        const plugin = rehypeOrgEnhancements({
          validate: false,
          enableSyntaxHighlight: "invalid" as any,
        });
        expect(typeof plugin).toBe("function");
      }).not.toThrow();
    });

    test("should use custom todoKeywords and priorityLevels", () => {
      const customOptions: PluginOptions = {
        todoKeywords: ["CUSTOM", "TASK"],
        priorityLevels: ["X", "Y", "Z"],
      };

      expect(() => {
        rehypeOrgEnhancements(customOptions);
      }).not.toThrow();
    });
  });

  describe("Plugin Execution", () => {
    test("should return transformer function", () => {
      const plugin = rehypeOrgEnhancements();
      expect(typeof plugin).toBe("function");
    });

    test("should handle invalid tree gracefully in validation mode", () => {
      const transformer = rehypeOrgEnhancements({ validate: true });

      expect(() => {
        transformer(null as any);
      }).toThrow("Expected root node");
    });

    test("should handle invalid tree gracefully in non-validation mode", () => {
      const transformer = rehypeOrgEnhancements({ validate: false });

      expect(() => {
        const result = transformer(null as any);
        expect(result).toBe(null);
      }).not.toThrow();
    });

    test("should process valid tree successfully", () => {
      const transformer = rehypeOrgEnhancements();
      const tree = createMockTree([createElement("p", {}, [createText("Hello world")])]);

      const result = transformer(tree);
      expect(result).toBeTruthy();
      expect(result.type).toBe("root");
    });
  });

  describe("TODO Keywords Transformation", () => {
    test("should transform TODO keywords in headers", () => {
      const transformer = rehypeOrgEnhancements();
      const tree = createMockTree([createElement("h1", {}, [createText("TODO Fix the bug")])]);

      const result = transformer(tree);
      const header = result.children[0] as Element;

      expect(header.properties?.className).toEqual(
        expect.arrayContaining(["text-xl", "font-bold"]),
      );
      expect(header.children).toHaveLength(2);
      expect((header.children[0] as Element).tagName).toBe("span");
      expect((header.children[0] as Element).properties?.className).toEqual(
        expect.arrayContaining(["bg-orange-100", "text-orange-800"]),
      );
    });

    test("should use custom TODO keyword classes", () => {
      const customClasses: CustomClasses = {
        todoKeywords: {
          TODO: ["custom-todo-class"],
        },
      };

      const transformer = rehypeOrgEnhancements({ customClasses });
      const tree = createMockTree([createElement("h1", {}, [createText("TODO Fix the bug")])]);

      const result = transformer(tree);
      const header = result.children[0] as Element;
      const todoSpan = header.children[0] as Element;

      expect(todoSpan.properties?.className).toEqual(["custom-todo-class"]);
    });

    test("should handle custom TODO keywords", () => {
      const transformer = rehypeOrgEnhancements({
        todoKeywords: ["CUSTOM", "TASK"],
      });

      const tree = createMockTree([createElement("h1", {}, [createText("CUSTOM Fix the bug")])]);

      const result = transformer(tree);
      const header = result.children[0] as Element;
      const todoSpan = header.children[0] as Element;

      expect((todoSpan.children[0] as any).value).toBe("CUSTOM");
    });

    test("should transform standalone TODO spans from uniorg", () => {
      const transformer = rehypeOrgEnhancements();
      const tree = createMockTree([
        createElement("span", { className: ["todo-keyword", "TODO"] }, [createText("TODO")]),
      ]);

      const result = transformer(tree);
      const span = result.children[0] as Element;

      expect(span.properties?.className).toEqual(
        expect.arrayContaining(["bg-orange-100", "text-orange-800"]),
      );
    });
  });

  describe("Priority Transformation", () => {
    test("should transform priority indicators", () => {
      const transformer = rehypeOrgEnhancements();
      const tree = createMockTree([createElement("p", {}, [createText("Task [#A] is important")])]);

      const result = transformer(tree);
      const paragraph = result.children[0] as Element;

      // Should have: "Task ", priority span, " is important"
      expect(paragraph.children).toHaveLength(3);

      const prioritySpan = paragraph.children[1] as Element;
      expect(prioritySpan.tagName).toBe("span");
      expect(prioritySpan.properties?.className).toEqual(
        expect.arrayContaining(["bg-red-100", "text-red-800"]),
      );
      expect((prioritySpan.children[0] as any).value).toBe("#A");
    });

    test("should use custom priority classes", () => {
      const customClasses: CustomClasses = {
        priorities: {
          A: ["custom-priority-a"],
        },
      };

      const transformer = rehypeOrgEnhancements({ customClasses });
      const tree = createMockTree([createElement("p", {}, [createText("Task [#A] is important")])]);

      const result = transformer(tree);
      const paragraph = result.children[0] as Element;
      const prioritySpan = paragraph.children[1] as Element;

      expect(prioritySpan.properties?.className).toEqual(["custom-priority-a"]);
    });

    test("should handle custom priority levels", () => {
      const transformer = rehypeOrgEnhancements({
        priorityLevels: ["X", "Y", "Z"],
      });

      const tree = createMockTree([createElement("p", {}, [createText("Task [#X] is important")])]);

      const result = transformer(tree);
      const paragraph = result.children[0] as Element;
      const prioritySpan = paragraph.children[1] as Element;

      expect((prioritySpan.children[0] as any).value).toBe("#X");
    });

    test("should ignore unrecognized priority levels", () => {
      const transformer = rehypeOrgEnhancements({
        priorityLevels: ["A", "B"],
      });

      const tree = createMockTree([
        createElement("p", {}, [createText("Task [#Z] is not recognized")]),
      ]);

      const result = transformer(tree);
      const paragraph = result.children[0] as Element;

      // Should remain as single text node since Z is not recognized
      expect(paragraph.children).toHaveLength(1);
      expect((paragraph.children[0] as any).value).toBe("Task [#Z] is not recognized");
    });
  });

  describe("Timestamp Transformation", () => {
    test("should transform active timestamps", () => {
      const transformer = rehypeOrgEnhancements();
      const tree = createMockTree([
        createElement("span", { className: ["timestamp"] }, [createText("<2025-01-15 Wed>")]),
      ]);

      const result = transformer(tree);
      const span = result.children[0] as Element;

      expect(span.properties?.className).toEqual(
        expect.arrayContaining(["bg-green-50", "text-green-700"]),
      );

      // Should have SVG icon and text
      expect(span.children).toHaveLength(2);
      expect((span.children[0] as Element).tagName).toBe("svg");
      expect((span.children[1] as any).value).toBe("2025-01-15 Wed");
    });

    test("should transform inactive timestamps", () => {
      const transformer = rehypeOrgEnhancements();
      const tree = createMockTree([
        createElement("span", { className: ["timestamp"] }, [createText("[2025-01-15 Wed]")]),
      ]);

      const result = transformer(tree);
      const span = result.children[0] as Element;

      expect(span.properties?.className).toEqual(
        expect.arrayContaining(["bg-gray-50", "text-gray-600"]),
      );
    });

    test("should transform timestamp ranges", () => {
      const transformer = rehypeOrgEnhancements();
      const tree = createMockTree([
        createElement("span", { className: ["timestamp"] }, [
          createText("<2025-01-15 Wed>--<2025-01-16 Thu>"),
        ]),
      ]);

      const result = transformer(tree);
      const span = result.children[0] as Element;

      expect(span.properties?.className).toEqual(
        expect.arrayContaining(["bg-blue-50", "text-blue-700"]),
      );

      // Should have: clock icon, start time, arrow icon, end time
      expect(span.children).toHaveLength(4);
      expect((span.children[0] as Element).tagName).toBe("svg"); // Clock icon
      expect((span.children[1] as Element).children[0] as any).toEqual(
        expect.objectContaining({ value: "2025-01-15 Wed" }),
      );
      expect((span.children[2] as Element).tagName).toBe("svg"); // Arrow icon
      expect((span.children[3] as Element).children[0] as any).toEqual(
        expect.objectContaining({ value: "2025-01-16 Thu" }),
      );
    });

    test("should use custom timestamp classes", () => {
      const customClasses: CustomClasses = {
        timestamps: {
          active: ["custom-active-timestamp"],
          clockIcon: ["custom-clock-icon"],
        },
      };

      const transformer = rehypeOrgEnhancements({ customClasses });
      const tree = createMockTree([
        createElement("span", { className: ["timestamp"] }, [createText("<2025-01-15 Wed>")]),
      ]);

      const result = transformer(tree);
      const span = result.children[0] as Element;
      const clockIcon = span.children[0] as Element;

      expect(span.properties?.className).toEqual(["custom-active-timestamp"]);
      expect(clockIcon.properties?.className).toEqual(["custom-clock-icon"]);
    });
  });

  describe("Basic Element Classes", () => {
    test("should apply default classes to elements", () => {
      const transformer = rehypeOrgEnhancements();
      const tree = createMockTree([
        createElement("p", {}, [createText("Paragraph")]),
        createElement("ul", {}, [createElement("li", {}, [createText("Item")])]),
        createElement("code", {}, [createText("code")]),
      ]);

      const result = transformer(tree);

      const paragraph = result.children[0] as Element;
      const list = result.children[1] as Element;
      const listItem = list.children[0] as Element;
      const code = result.children[2] as Element;

      expect(paragraph.properties?.className).toEqual(
        expect.arrayContaining(["text-gray-700", "leading-relaxed", "mb-4"]),
      );
      expect(list.properties?.className).toEqual(
        expect.arrayContaining(["list-disc", "list-inside"]),
      );
      expect(listItem.properties?.className).toEqual(expect.arrayContaining(["text-gray-700"]));
      expect(code.properties?.className).toEqual(
        expect.arrayContaining(["bg-gray-100", "text-gray-800"]),
      );
    });

    test("should use custom element classes", () => {
      const customClasses: CustomClasses = {
        elements: {
          p: ["custom-paragraph"],
          ul: ["custom-list"],
          code: ["custom-code"],
        },
      };

      const transformer = rehypeOrgEnhancements({ customClasses });
      const tree = createMockTree([
        createElement("p", {}, [createText("Paragraph")]),
        createElement("ul", {}, [createElement("li", {}, [createText("Item")])]),
        createElement("code", {}, [createText("code")]),
      ]);

      const result = transformer(tree);

      expect((result.children[0] as Element).properties?.className).toEqual(["custom-paragraph"]);
      expect((result.children[1] as Element).properties?.className).toEqual(["custom-list"]);
      expect((result.children[2] as Element).properties?.className).toEqual(["custom-code"]);
    });

    test("should not override existing classes on elements (except pre and code)", () => {
      const transformer = rehypeOrgEnhancements();
      const tree = createMockTree([
        createElement("p", { className: ["existing-class"] }, [createText("Paragraph")]),
        createElement("div", { className: ["existing-class"] }, [createText("Div")]),
      ]);

      const result = transformer(tree);

      expect((result.children[0] as Element).properties?.className).toEqual(["existing-class"]);
      expect((result.children[1] as Element).properties?.className).toEqual(["existing-class"]);
    });

    test("should handle Shiki pre elements specially", () => {
      const transformer = rehypeOrgEnhancements();
      const tree = createMockTree([
        createElement("pre", { className: ["shiki", "github-light"] }, [
          createElement("code", {}, [createText("console.log('hello');")]),
        ]),
      ]);

      const result = transformer(tree);
      const pre = result.children[0] as Element;

      expect(pre.properties?.className).toEqual(
        expect.arrayContaining(["shiki", "github-light", "rounded-lg", "overflow-x-auto"]),
      );
    });

    test("should apply header classes by level", () => {
      const transformer = rehypeOrgEnhancements();
      const tree = createMockTree([
        createElement("h1", {}, [createText("Header 1")]),
        createElement("h3", {}, [createText("Header 3")]),
        createElement("h6", {}, [createText("Header 6")]),
      ]);

      const result = transformer(tree);

      expect((result.children[0] as Element).properties?.className).toEqual(
        expect.arrayContaining(["text-xl", "font-bold"]),
      );
      expect((result.children[1] as Element).properties?.className).toEqual(
        expect.arrayContaining(["text-base", "font-semibold"]),
      );
      expect((result.children[2] as Element).properties?.className).toEqual(
        expect.arrayContaining(["text-sm", "font-medium", "text-gray-600"]),
      );
    });
  });

  describe("Error Handling", () => {
    test("should handle errors gracefully in validation mode", () => {
      const transformer = rehypeOrgEnhancements({ validate: true });

      // Create an invalid tree that might cause errors
      const tree = createMockTree([
        createElement("span", { className: ["timestamp"] }, [null as any]),
      ]);

      // In validation mode with malformed input, expect a handled error
      expect(() => {
        transformer(tree);
      }).toThrow(/Error transforming TODO keywords/); // Should wrap errors properly
    });

    test("should continue processing in non-validation mode even with errors", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const transformer = rehypeOrgEnhancements({ validate: false });

      // Create a tree that might cause processing errors
      const tree = createMockTree([
        createElement("h1", {}, [createText("TODO Fix bug")]),
        createElement("span", { className: ["timestamp"] }, [null as any]), // This might cause an error
        createElement("p", {}, [createText("This should still be processed")]),
      ]);

      let result;
      expect(() => {
        result = transformer(tree);
      }).not.toThrow();

      // First and third elements should still be processed
      expect(result).toBeTruthy();
      expect(result.children).toHaveLength(3);

      consoleSpy.mockRestore();
    });
  });

  describe("Integration Tests", () => {
    test("should work with unified processor", async () => {
      const processor = unified().use(rehypeOrgEnhancements, {
        customClasses: {
          todoKeywords: {
            TODO: ["test-todo-class"],
          },
        },
      });

      const tree = createMockTree([createElement("h1", {}, [createText("TODO Test integration")])]);

      const result = await processor.run(tree);

      expect(result).toBeTruthy();
      expect(result.type).toBe("root");

      const header = (result as Root).children[0] as Element;
      const todoSpan = header.children[0] as Element;
      expect(todoSpan.properties?.className).toEqual(["test-todo-class"]);
    });

    test("should handle complex org-mode content", () => {
      const transformer = rehypeOrgEnhancements();
      const tree = createMockTree([
        createElement("h1", {}, [createText("TODO [#A] Important Task")]),
        createElement("p", {}, [createText("This task has priority [#A] and is urgent.")]),
        createElement("span", { className: ["timestamp"] }, [createText("<2025-01-15 Wed>")]),
        createElement("ul", {}, [
          createElement("li", {}, [createText("First item")]),
          createElement("li", {}, [createText("Second item with [#B] priority")]),
        ]),
      ]);

      const result = transformer(tree);

      expect(result.children).toHaveLength(4);

      // Header should have TODO span, priority span, and remaining text
      const header = result.children[0] as Element;
      expect(header.children.length).toBeGreaterThan(1);

      // Paragraph should have priority span
      const paragraph = result.children[1] as Element;
      expect(paragraph.children.length).toBeGreaterThan(1);

      // Timestamp should be transformed
      const timestamp = result.children[2] as Element;
      expect(timestamp.properties?.className).toEqual(expect.arrayContaining(["bg-green-50"]));

      // List should have classes
      const list = result.children[3] as Element;
      expect(list.properties?.className).toEqual(expect.arrayContaining(["list-disc"]));
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty tree", () => {
      const transformer = rehypeOrgEnhancements();
      const tree = createMockTree([]);

      const result = transformer(tree);
      expect(result.children).toHaveLength(0);
    });

    test("should handle elements without children", () => {
      const transformer = rehypeOrgEnhancements();
      const tree = createMockTree([createElement("hr", {}, []), createElement("br", {}, [])]);

      expect(() => {
        const result = transformer(tree);
        expect(result.children).toHaveLength(2);
      }).not.toThrow();
    });

    test("should handle malformed class names", () => {
      const customClasses: CustomClasses = {
        todoKeywords: {
          TODO: null as any, // Invalid class array
        },
      };

      const transformer = rehypeOrgEnhancements({
        customClasses,
        validate: false,
      });

      const tree = createMockTree([createElement("h1", {}, [createText("TODO Test")])]);

      expect(() => {
        const result = transformer(tree);
        // Should fall back to default classes
        const header = result.children[0] as Element;
        const todoSpan = header.children[0] as Element;
        expect(todoSpan.properties?.className).toEqual(expect.arrayContaining(["bg-orange-100"]));
      }).not.toThrow();
    });

    test("should handle deeply nested structures", () => {
      const transformer = rehypeOrgEnhancements();
      const tree = createMockTree([
        createElement("div", {}, [
          createElement("section", {}, [
            createElement("article", {}, [
              createElement("h2", {}, [createText("TODO Nested task")]),
              createElement("p", {}, [createText("Priority [#A] task")]),
            ]),
          ]),
        ]),
      ]);

      expect(() => {
        const result = transformer(tree);
        expect(result).toBeTruthy();
      }).not.toThrow();
    });
  });
});

// Mock vitest's vi if not available
declare global {
  var vi: any;
}

if (typeof vi === "undefined") {
  (global as any).vi = {
    spyOn: (obj: any, method: string) => ({
      mockImplementation: (fn: Function) => {
        const original = obj[method];
        obj[method] = fn;
        return {
          mockRestore: () => {
            obj[method] = original;
          },
        };
      },
    }),
  };
}
