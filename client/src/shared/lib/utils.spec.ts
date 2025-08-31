import { describe, expect, it } from "vitest";
import { cn } from "./utils";

// Helper function from NodeDetail.tsx that we want to test
function removeFrontmatter(content: string): string {
  const lines = content.split(/\r?\n/);
  if (lines[0] === "---") {
    const endIndex = lines.findIndex((line, index) => index > 0 && line === "---");
    if (endIndex > 0) {
      return lines.slice(endIndex + 1).join("\n");
    }
  }
  return content;
}

describe("Utility Functions", () => {
  describe("cn function (class name merger)", () => {
    it("should merge class names correctly", () => {
      const result = cn("base-class", "additional-class");
      expect(result).toContain("base-class");
      expect(result).toContain("additional-class");
    });

    it("should handle empty inputs", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("should handle null and undefined inputs", () => {
      const result = cn("valid-class", null, undefined, "another-class");
      expect(result).toContain("valid-class");
      expect(result).toContain("another-class");
      expect(result).not.toContain("null");
      expect(result).not.toContain("undefined");
    });

    it("should merge tailwind classes with conflicts", () => {
      const result = cn("px-2", "px-4");
      // Should only contain px-4 (later class wins)
      expect(result).toContain("px-4");
      expect(result).not.toContain("px-2");
    });

    it("should handle arrays of class names", () => {
      const result = cn(["class1", "class2"], "class3");
      expect(result).toContain("class1");
      expect(result).toContain("class2");
      expect(result).toContain("class3");
    });

    it("should handle objects with boolean values", () => {
      const result = cn({
        "active-class": true,
        "inactive-class": false,
        "conditional-class": 1 > 0,
      });
      expect(result).toContain("active-class");
      expect(result).toContain("conditional-class");
      expect(result).not.toContain("inactive-class");
    });

    it("should handle complex combinations", () => {
      const result = cn(
        "base-class",
        {
          "conditional-true": true,
          "conditional-false": false,
        },
        ["array-class1", "array-class2"],
        "final-class",
      );

      expect(result).toContain("base-class");
      expect(result).toContain("conditional-true");
      expect(result).not.toContain("conditional-false");
      expect(result).toContain("array-class1");
      expect(result).toContain("array-class2");
      expect(result).toContain("final-class");
    });

    it("should handle duplicate classes", () => {
      const result = cn("duplicate-class", "other-class", "duplicate-class");
      expect(result).toContain("duplicate-class");
      expect(result).toContain("other-class");
      // Should not have duplicates (though exact behavior depends on implementation)
    });

    it("should handle whitespace correctly", () => {
      const result = cn("  spaced-class  ", "normal-class");
      expect(result).toContain("spaced-class");
      expect(result).toContain("normal-class");
    });

    describe("Tailwind merge behavior", () => {
      it("should merge conflicting padding classes", () => {
        const result = cn("p-2", "p-4");
        expect(result).toBe("p-4");
      });

      it("should merge conflicting margin classes", () => {
        const result = cn("m-1", "m-2", "m-3");
        expect(result).toBe("m-3");
      });

      it("should merge conflicting text size classes", () => {
        const result = cn("text-sm", "text-lg");
        expect(result).toBe("text-lg");
      });

      it("should keep non-conflicting classes", () => {
        const result = cn("px-2", "py-4", "text-red-500", "bg-blue-100");
        expect(result).toContain("px-2");
        expect(result).toContain("py-4");
        expect(result).toContain("text-red-500");
        expect(result).toContain("bg-blue-100");
      });

      it("should handle responsive modifiers correctly", () => {
        const result = cn("p-2", "md:p-4", "lg:p-6");
        expect(result).toContain("p-2");
        expect(result).toContain("md:p-4");
        expect(result).toContain("lg:p-6");
      });

      it("should merge state modifiers correctly", () => {
        const result = cn("hover:bg-red-500", "hover:bg-blue-500");
        expect(result).toBe("hover:bg-blue-500");
      });
    });
  });

  describe("removeFrontmatter function", () => {
    it("should remove frontmatter from content", () => {
      const contentWithFrontmatter = `---
title: Test Post
tags: [test, markdown]
date: 2024-01-01
---
# Main Content

This is the actual content of the post.`;

      const result = removeFrontmatter(contentWithFrontmatter);

      expect(result).not.toContain("title: Test Post");
      expect(result).not.toContain("tags: [test, markdown]");
      expect(result).toContain("# Main Content");
      expect(result).toContain("This is the actual content of the post.");
    });

    it("should return content unchanged when no frontmatter", () => {
      const contentWithoutFrontmatter = `# Regular Content

This content has no frontmatter.`;

      const result = removeFrontmatter(contentWithoutFrontmatter);

      expect(result).toBe(contentWithoutFrontmatter);
    });

    it("should handle content that starts with --- but has no closing ---", () => {
      const incompleFrontmatter = `---
title: Incomplete
This never closes properly

# Content Here`;

      const result = removeFrontmatter(incompleFrontmatter);

      // Should return original content since no closing ---
      expect(result).toBe(incompleFrontmatter);
    });

    it("should handle empty content", () => {
      const result = removeFrontmatter("");
      expect(result).toBe("");
    });

    it("should handle content with only frontmatter", () => {
      const onlyFrontmatter = `---
title: Only Frontmatter
description: No content after
---`;

      const result = removeFrontmatter(onlyFrontmatter);

      // Should return empty string (everything after last --- is removed)
      expect(result).toBe("");
    });

    it("should handle frontmatter with empty content after", () => {
      const frontmatterWithEmptyContent = `---
title: Empty After
---

`;

      const result = removeFrontmatter(frontmatterWithEmptyContent);

      expect(result).toBe("\n");
    });

    it("should handle multiple --- separators correctly", () => {
      const multipleSeperators = `---
title: Test
---
# Content

Some text.

---
This is not frontmatter, it's content.`;

      const result = removeFrontmatter(multipleSeperators);

      expect(result).not.toContain("title: Test");
      expect(result).toContain("# Content");
      expect(result).toContain("This is not frontmatter, it's content.");
    });

    it("should handle content with --- in the middle (not frontmatter)", () => {
      const contentWithDashes = `# Normal Content

Some text before.

---

Some text after the dashes.`;

      const result = removeFrontmatter(contentWithDashes);

      // Should return unchanged since it doesn't start with ---
      expect(result).toBe(contentWithDashes);
    });

    it("should handle Windows line endings", () => {
      const windowsContent = `---\r\ntitle: Windows Test\r\n---\r\n# Content\r\n\r\nWindows line endings.`;

      const result = removeFrontmatter(windowsContent);

      expect(result).not.toContain("title: Windows Test");
      expect(result).toContain("# Content");
    });

    it("should handle single line content", () => {
      const singleLine = "Just a single line with no frontmatter";

      const result = removeFrontmatter(singleLine);

      expect(result).toBe(singleLine);
    });

    it("should preserve original line breaks in content", () => {
      const contentWithLineBreaks = `---
title: Test
---
Line 1

Line 3 (line 2 was empty)

Line 5`;

      const result = removeFrontmatter(contentWithLineBreaks);

      expect(result).toBe(`Line 1

Line 3 (line 2 was empty)

Line 5`);
    });

    it("should handle frontmatter with special characters", () => {
      const specialChars = `---
title: "Test with: special characters & symbols"
tags: ['tag1', 'tag2']
special: "!@#$%^&*()"
---
# Content with émojis 🚀

Regular content here.`;

      const result = removeFrontmatter(specialChars);

      expect(result).not.toContain("special characters & symbols");
      expect(result).toContain("# Content with émojis 🚀");
    });
  });
});

describe("Integration Tests", () => {
  it("should work together - cn with frontmatter-free content classes", () => {
    const content = `---
title: Test
---
# Heading

Content here.`;

    const cleanContent = removeFrontmatter(content);
    const classes = cn("markdown-content", "prose", { "prose-lg": cleanContent.length > 100 });

    expect(cleanContent).toContain("# Heading");
    expect(cleanContent).not.toContain("title: Test");
    expect(classes).toContain("markdown-content");
    expect(classes).toContain("prose");
  });
});
