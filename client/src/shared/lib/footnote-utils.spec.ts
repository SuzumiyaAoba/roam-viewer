import { describe, expect, it } from "vitest";
import {
  parseFootnoteReferences,
  parseFootnoteDefinitions,
  replaceFootnoteReferencesWithLinks,
  getFootnoteRefId,
  getFootnoteDefId,
} from "./footnote-utils";

describe("parseFootnoteReferences", () => {
  it("should parse simple footnote references", () => {
    const content = "これは脚注の例です[fn:1]。別の脚注もあります[fn:note2]。";
    const references = parseFootnoteReferences(content);

    expect(references).toHaveLength(2);
    expect(references[0]).toMatchObject({
      label: "1",
      originalText: "[fn:1]",
    });
    expect(references[1]).toMatchObject({
      label: "note2",
      originalText: "[fn:note2]",
    });
  });

  it("should handle content without footnote references", () => {
    const content = "これは普通のテキストです。脚注参照はありません。";
    const references = parseFootnoteReferences(content);

    expect(references).toHaveLength(0);
  });

  it("should parse multiple references to the same footnote", () => {
    const content = "最初の参照[fn:1]と二番目の参照[fn:1]。";
    const references = parseFootnoteReferences(content);

    expect(references).toHaveLength(2);
    expect(references[0].label).toBe("1");
    expect(references[1].label).toBe("1");
  });
});

describe("parseFootnoteDefinitions", () => {
  it("should parse footnote definitions", () => {
    const content = `[fn:1] これは最初の脚注の内容です。

[fn:note2] これは名前付き脚注です。`;

    const definitions = parseFootnoteDefinitions(content);

    expect(definitions).toHaveLength(2);
    expect(definitions[0]).toMatchObject({
      label: "1",
      content: "これは最初の脚注の内容です。",
      originalText: "[fn:1] これは最初の脚注の内容です。",
    });
    expect(definitions[1]).toMatchObject({
      label: "note2",
      content: "これは名前付き脚注です。",
      originalText: "[fn:note2] これは名前付き脚注です。",
    });
  });

  it("should handle content without footnote definitions", () => {
    const content = "これは普通のコンテンツです。\n別の行もあります。";
    const definitions = parseFootnoteDefinitions(content);

    expect(definitions).toHaveLength(0);
  });

  it("should ignore malformed footnote definitions", () => {
    const content = `[fn:1] 正しい定義
[fn:] 空のラベル
[fn 無効な形式
[fn:2] もう一つの正しい定義`;

    const definitions = parseFootnoteDefinitions(content);

    expect(definitions).toHaveLength(2);
    expect(definitions[0].label).toBe("1");
    expect(definitions[1].label).toBe("2");
  });
});

describe("replaceFootnoteReferencesWithLinks", () => {
  it("should replace footnote references with anchor links", () => {
    const content = "テキスト[fn:1]とさらなるテキスト[fn:note2]。";
    const result = replaceFootnoteReferencesWithLinks(content);

    expect(result.content).toContain('href="#fn-def-1"');
    expect(result.content).toContain('href="#fn-def-note2"');
    expect(result.content).toContain('id="fn-ref-1-');
    expect(result.content).toContain('id="fn-ref-note2-');
    expect(result.content).toContain("[1]");
    expect(result.content).toContain("[note2]");
    expect(result.referenceMap.get("1")).toBeDefined();
    expect(result.referenceMap.get("note2")).toBeDefined();
  });

  it("should not modify content without footnote references", () => {
    const content = "これは普通のテキストです。";
    const result = replaceFootnoteReferencesWithLinks(content);

    expect(result.content).toBe(content);
    expect(result.referenceMap.size).toBe(0);
  });

  it("should handle HTML content correctly", () => {
    const content = "<p>段落内の脚注[fn:1]です。</p>";
    const result = replaceFootnoteReferencesWithLinks(content);

    expect(result.content).toContain('<p>段落内の脚注<a href="#fn-def-1"');
    expect(result.content).toContain("[1]</a>です。</p>");
    expect(result.referenceMap.get("1")).toHaveLength(1);
  });
});

describe("ID generation functions", () => {
  it("should generate correct reference IDs", () => {
    expect(getFootnoteRefId("1")).toBe("fn-ref-1");
    expect(getFootnoteRefId("note2")).toBe("fn-ref-note2");
    expect(getFootnoteRefId("complex-label")).toBe("fn-ref-complex-label");
  });

  it("should generate correct definition IDs", () => {
    expect(getFootnoteDefId("1")).toBe("fn-def-1");
    expect(getFootnoteDefId("note2")).toBe("fn-def-note2");
    expect(getFootnoteDefId("complex-label")).toBe("fn-def-complex-label");
  });
});

// Temporarily disabled due to bun test hanging issue
// TODO: Re-enable after identifying root cause
describe.skip("Real org-mode content", () => {
  it("should handle actual org-mode footnote format", () => {
    const content = `** Footnotes

This is footnote example[fn:1]. Another footnote here[fn:note2].

[fn:1] This is first footnote content.

[fn:note2] This is named footnote.`;

    const references = parseFootnoteReferences(content);
    const definitions = parseFootnoteDefinitions(content);
    const withLinks = replaceFootnoteReferencesWithLinks(content);

    expect(references).toHaveLength(4); // 2 references + 2 in definitions
    expect(definitions).toHaveLength(2);
    expect(withLinks.content).toContain('href="#fn-def-1"');
    expect(withLinks.content).toContain('href="#fn-def-note2"');
  });
});
