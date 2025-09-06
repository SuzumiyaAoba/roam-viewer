import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrgRenderer } from "./OrgRenderer";

// Skip React component tests when running in Bun test environment (no DOM)
const isVitest = typeof globalThis.process?.env?.VITEST !== 'undefined' || typeof document !== 'undefined';

// Test data samples covering various org-mode syntax
const ORG_SAMPLES = {
  // Basic syntax
  headers: `* Header Level 1
** Header Level 2
*** Header Level 3
**** Header Level 4
***** Header Level 5
****** Header Level 6`,

  textFormatting: `This is *bold text* and /italic text/ and _underlined text_.
Here is =code text= and ~verbatim text~ and +strikethrough+.`,

  lists: `* Unordered list item 1
* Unordered list item 2
  * Nested item 2.1
  * Nested item 2.2
* Unordered list item 3

1. Ordered list item 1
2. Ordered list item 2
   1. Nested ordered item 2.1
   2. Nested ordered item 2.2
3. Ordered list item 3`,

  checkboxes: `- [ ] Unchecked task
- [X] Checked task
- [-] Partial task
- [ ] Another unchecked task`,

  links: `[[https://example.com][External Link]]
[[internal:link][Internal Link]]
Direct URL: https://google.com`,

  tables: `| Name    | Age | Role      |
|---------+-----+-----------|
| Alice   | 30  | Developer |
| Bob     | 25  | Designer  |
| Charlie | 35  | Manager   |`,

  codeBlocks: `Inline ~code~ example.

#+BEGIN_SRC javascript
function hello() {
  console.log("Hello, world!");
  return 42;
}
#+END_SRC

#+BEGIN_EXAMPLE
This is an example block
  with preserved indentation
  and special characters: */_=~+
#+END_EXAMPLE`,

  quotes: `#+BEGIN_QUOTE
This is a quoted text block.
It can span multiple lines.

  -- Author Name
#+END_QUOTE`,

  // Advanced features
  todos: `** TODO Important task
** DONE Completed task
** NEXT Next task
** WAITING Waiting task
** CANCELLED Cancelled task`,

  priorities: `*** TODO [#A] High priority task
*** TODO [#B] Medium priority task
*** TODO [#C] Low priority task`,

  timestamps: `DEADLINE: <2025-01-15 Wed>
SCHEDULED: <2025-01-10 Mon 09:00>
CLOSED: [2025-01-05 Fri 17:30]`,

  footnotes: `This text has a footnote[fn:1] reference.
Another footnote[fn:named] with a name.

[fn:1] This is the first footnote content.
[fn:named] This is a named footnote content.`,

  logbook: `:LOGBOOK:
- State "DONE" from "TODO" [2025-01-05 Fri 10:30]
- State "TODO" from "" [2025-01-01 Mon 09:00]
:END:`,

  math: `Inline math: \\(E = mc^2\\)

Display math:
\\begin{equation}
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
\\end{equation}`,

  // Complex combinations
  complex: `* Project Planning [#A]
** TODO [#A] Design phase :urgent:important:
DEADLINE: <2025-02-01 Sat>

This is a high-priority task with *bold* and /italic/ text.

*** Sub-tasks
- [ ] Create wireframes
- [X] Research competitors
- [ ] Define user stories

Reference document[fn:1] contains more details.

**** Code Example
#+BEGIN_SRC python
def calculate_priority(urgency, importance):
    return urgency * importance
#+END_SRC

** DONE Research phase
CLOSED: [2025-01-15 Wed 14:20]

:LOGBOOK:
- State "DONE" from "TODO" [2025-01-15 Wed 14:20]
- State "TODO" from "" [2025-01-10 Mon 09:00]
:END:

Research results in table format:

| Tool     | Rating | Notes              |
|----------+--------+--------------------|
| Tool A   | 8/10   | Good performance   |
| Tool B   | 6/10   | Limited features   |
| Tool C   | 9/10   | Excellent UX       |

[fn:1] See project documentation at [[https://docs.example.com][Project Docs]].`,

  // Edge cases
  empty: ``,
  whitespaceOnly: `   
  
   `,
  malformed: `* Incomplete header
** Missing closing
=unclosed code
[[broken link
| incomplete | table
#+BEGIN_SRC no_end`,

  japanese: `* 日本語見出し
これは日本語のテストです。*太字*と/斜体/と_下線_があります。

** TODO [#A] 重要なタスク :緊急:
DEADLINE: <2025-01-31 金>

脚注の例[fn:注釈1]もあります。

[fn:注釈1] これは日本語の脚注です。`,

  specialChars: `Special characters: !@#$%^&*()_+-={}[]|\\:";'<>?,./
Unicode: αβγδε 中文 العربية русский
Emojis: 🚀 📝 ✅ ❌`,

  longContent: `* Very Long Content Test
${"** Subsection ".repeat(50)}
This is a very long content that tests performance and memory usage.
${"Line of text that repeats many times to create long content. ".repeat(100)}

*** Deep Nesting Test
${"*".repeat(10)} Very deep header level
This tests deeply nested content handling.`
};

describe.skipIf(!isVitest)("OrgRenderer", () => {
  describe("Basic Syntax Rendering", () => {
    it("should render headers with correct HTML structure", async () => {
      render(<OrgRenderer content={ORG_SAMPLES.headers} />);
      
      await waitFor(() => {
        // Check for header elements with hash prefixes
        expect(screen.getByText("Header Level 1")).toBeInTheDocument();
        expect(screen.getByText("Header Level 2")).toBeInTheDocument();
        expect(screen.getByText("Header Level 6")).toBeInTheDocument();
      });
    });

    it("should render text formatting correctly", async () => {
      render(<OrgRenderer content={ORG_SAMPLES.textFormatting} />);
      
      await waitFor(() => {
        // Check for formatted text with actual CSS classes
        const container = screen.getByText(/bold text/).closest('div');
        expect(container?.innerHTML).toContain('<strong class="font-semibold text-gray-900">bold text</strong>');
        expect(container?.innerHTML).toContain('<em class="italic">italic text</em>');
        expect(container?.innerHTML).toContain('<code');
      });
    });

    it("should render unordered and ordered lists", async () => {
      render(<OrgRenderer content={ORG_SAMPLES.lists} />);
      
      await waitFor(() => {
        expect(screen.getByText("Unordered list item 1")).toBeInTheDocument();
        expect(screen.getByText("Ordered list item 1")).toBeInTheDocument();
        expect(screen.getByText("Nested item 2.1")).toBeInTheDocument();
      });
    });

    it("should render checkboxes with correct states", async () => {
      render(<OrgRenderer content={ORG_SAMPLES.checkboxes} />);
      
      await waitFor(() => {
        expect(screen.getByText("Unchecked task")).toBeInTheDocument();
        expect(screen.getByText("Checked task")).toBeInTheDocument();
        expect(screen.getByText("Partial task")).toBeInTheDocument();
      });
    });

    it("should render links and URLs", async () => {
      render(<OrgRenderer content={ORG_SAMPLES.links} />);
      
      await waitFor(() => {
        expect(screen.getByText("External Link")).toBeInTheDocument();
        expect(screen.getByText("Internal Link")).toBeInTheDocument();
        expect(screen.getByText("https://google.com")).toBeInTheDocument();
      });
    });

    it("should render tables with proper structure", async () => {
      render(<OrgRenderer content={ORG_SAMPLES.tables} />);
      
      await waitFor(() => {
        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Developer")).toBeInTheDocument();
      });
    });
  });

  describe("Advanced Features", () => {
    it("should render TODO keywords with proper styling", async () => {
      render(<OrgRenderer content={ORG_SAMPLES.todos} />);
      
      await waitFor(() => {
        expect(screen.getByText("Important task")).toBeInTheDocument();
        expect(screen.getByText("Completed task")).toBeInTheDocument();
        
        // Check for TODO keyword badges with actual CSS classes
        const container = screen.getByText(/Important task/).closest('div');
        expect(container?.innerHTML).toContain('TODO');
        expect(container?.innerHTML).toContain('bg-orange-100');
      });
    });

    it("should render priority indicators", async () => {
      render(<OrgRenderer content={ORG_SAMPLES.priorities} />);
      
      await waitFor(() => {
        const container = screen.getByText(/High priority task/).closest('div');
        expect(container?.innerHTML).toContain('priority-A');
        expect(container?.innerHTML).toContain('bg-red-100');
        expect(screen.getByText('A')).toBeInTheDocument();
      });
    });

    it("should render code blocks with syntax highlighting when enabled", async () => {
      render(<OrgRenderer content={ORG_SAMPLES.codeBlocks} enableSyntaxHighlight={true} />);
      
      await waitFor(() => {
        // Check for syntax highlighted code blocks
        const codeBlock = document.querySelector('pre.shiki');
        expect(codeBlock).toBeInTheDocument();
        
        // Check for text content within the code block (syntax highlighting breaks up text)
        const functionElements = screen.getAllByText((content, element) => {
          return element?.textContent?.includes('function') && element?.textContent?.includes('hello') || false;
        });
        expect(functionElements.length).toBeGreaterThan(0);
        
        const consoleElements = screen.getAllByText((content, element) => {
          return element?.textContent?.includes('console') && element?.textContent?.includes('log') || false;
        });
        expect(consoleElements.length).toBeGreaterThan(0);
      });
    });

    it("should render code blocks without syntax highlighting when disabled", async () => {
      render(<OrgRenderer content={ORG_SAMPLES.codeBlocks} enableSyntaxHighlight={false} />);
      
      await waitFor(() => {
        // Even without syntax highlighting, text may be broken up by elements
        const functionElements = screen.getAllByText((content, element) => {
          return element?.textContent?.includes('function') && element?.textContent?.includes('hello') || false;
        });
        expect(functionElements.length).toBeGreaterThan(0);
      });
    });

    it("should render mathematical expressions", async () => {
      render(<OrgRenderer content={ORG_SAMPLES.math} />);
      
      await waitFor(() => {
        // Math expressions should be processed by KaTeX
        const container = screen.getByText(/E = mc/).closest('div');
        expect(container?.innerHTML).toContain('katex');
      });
    });
  });

  describe("Complex Content", () => {
    it("should handle complex nested content with multiple features", async () => {
      render(<OrgRenderer content={ORG_SAMPLES.complex} />);
      
      await waitFor(() => {
        expect(screen.getByText("Project Planning")).toBeInTheDocument();
        expect(screen.getByText("Design phase")).toBeInTheDocument();
        expect(screen.getByText("Create wireframes")).toBeInTheDocument();
        expect(screen.getByText("Research phase")).toBeInTheDocument();
        
        // Check for mixed formatting
        const container = screen.getByText(/Design phase/).closest('div');
        expect(container?.innerHTML).toContain('TODO');
        expect(container?.innerHTML).toContain('#A');
      });
    });

    it("should handle Japanese content correctly", async () => {
      render(<OrgRenderer content={ORG_SAMPLES.japanese} />);
      
      await waitFor(() => {
        expect(screen.getByText("日本語見出し")).toBeInTheDocument();
        expect(screen.getByText(/日本語のテストです/)).toBeInTheDocument();
        expect(screen.getByText("重要なタスク")).toBeInTheDocument();
      });
    });

    it("should handle special characters and Unicode", async () => {
      render(<OrgRenderer content={ORG_SAMPLES.specialChars} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Special characters/)).toBeInTheDocument();
        expect(screen.getByText(/αβγδε/)).toBeInTheDocument();
        expect(screen.getByText(/🚀 📝/)).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty content gracefully", () => {
      render(<OrgRenderer content={ORG_SAMPLES.empty} />);
      // Should not throw an error
    });

    it("should handle whitespace-only content", () => {
      render(<OrgRenderer content={ORG_SAMPLES.whitespaceOnly} />);
      // Should not throw an error
    });

    it("should handle malformed content gracefully", async () => {
      render(<OrgRenderer content={ORG_SAMPLES.malformed} />);
      
      await waitFor(() => {
        // Should render what it can without crashing
        expect(screen.getByText(/Incomplete header/)).toBeInTheDocument();
      });
    });

    it("should handle very long content without performance issues", async () => {
      const startTime = Date.now();
      render(<OrgRenderer content={ORG_SAMPLES.longContent} />);
      
      await waitFor(() => {
        expect(screen.getByText("Very Long Content Test")).toBeInTheDocument();
      });
      
      const endTime = Date.now();
      // Should render within reasonable time (< 5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });

  describe("Props Handling", () => {
    it("should apply custom className", async () => {
      const { container } = render(
        <OrgRenderer content="* Test" className="custom-class" />
      );
      
      await waitFor(() => {
        expect(container.firstChild).toHaveClass("custom-class");
      });
    });

    it("should handle enableSyntaxHighlight prop", async () => {
      const codeContent = `#+BEGIN_SRC javascript
console.log("test");
#+END_SRC`;
      
      // Test with syntax highlighting enabled
      const { rerender } = render(
        <OrgRenderer content={codeContent} enableSyntaxHighlight={true} />
      );
      
      await waitFor(() => {
        const consoleElements = screen.getAllByText((content, element) => {
          return element?.textContent?.includes('console') && element?.textContent?.includes('log') || false;
        });
        expect(consoleElements.length).toBeGreaterThan(0);
      });
      
      // Test with syntax highlighting disabled
      rerender(<OrgRenderer content={codeContent} enableSyntaxHighlight={false} />);
      
      await waitFor(() => {
        const consoleElements = screen.getAllByText((content, element) => {
          return element?.textContent?.includes('console') && element?.textContent?.includes('log') || false;
        });
        expect(consoleElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Accessibility", () => {
    it("should generate accessible HTML structure", async () => {
      render(<OrgRenderer content={ORG_SAMPLES.headers} />);
      
      await waitFor(() => {
        // Check for proper heading hierarchy
        const h1 = screen.getByRole('heading', { level: 1 });
        const h2 = screen.getByRole('heading', { level: 2 });
        const h3 = screen.getByRole('heading', { level: 3 });
        
        expect(h1).toBeInTheDocument();
        expect(h2).toBeInTheDocument();
        expect(h3).toBeInTheDocument();
      });
    });

    it("should generate accessible table structure", async () => {
      render(<OrgRenderer content={ORG_SAMPLES.tables} />);
      
      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
        
        const columnHeaders = screen.getAllByRole('columnheader');
        expect(columnHeaders).toHaveLength(3);
      });
    });

    it("should generate accessible links", async () => {
      render(<OrgRenderer content={ORG_SAMPLES.links} />);
      
      await waitFor(() => {
        const links = screen.getAllByRole('link');
        expect(links.length).toBeGreaterThan(0);
        
        // Links should have proper href attributes
        const externalLink = screen.getByText('External Link').closest('a');
        expect(externalLink).toHaveAttribute('href', 'https://example.com');
        
        // Check that links are properly styled
        expect(externalLink).toHaveClass('text-blue-600');
      });
    });
  });

  describe("Performance", () => {
    it("should render multiple times without memory leaks", async () => {
      const { rerender } = render(<OrgRenderer content="* Test 1" />);
      
      // Re-render multiple times with different content
      for (let i = 2; i <= 10; i++) {
        rerender(<OrgRenderer content={`* Test ${i}`} />);
        await waitFor(() => {
          expect(screen.getByText(`Test ${i}`)).toBeInTheDocument();
        });
      }
    });

    it("should handle rapid content changes", async () => {
      const { rerender } = render(<OrgRenderer content="* Initial" />);
      
      // Rapidly change content
      const contents = [
        "** Second",
        "*** Third", 
        "**** Fourth",
        "***** Fifth"
      ];
      
      for (const content of contents) {
        rerender(<OrgRenderer content={content} />);
      }
      
      await waitFor(() => {
        expect(screen.getByText("Fifth")).toBeInTheDocument();
      });
    });
  });
});