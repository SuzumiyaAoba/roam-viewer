export interface FootnoteReference {
  label: string;
  position: number; // position in the original content
  originalText: string;
}

export interface FootnoteDefinition {
  label: string;
  content: string;
  originalText: string;
}

/**
 * Parse footnote references from content (e.g., [fn:1], [fn:note2])
 */
export function parseFootnoteReferences(content: string): FootnoteReference[] {
  const references: FootnoteReference[] = [];
  const referenceRegex = /\[fn:([^\]]+)\]/g;
  let match: RegExpExecArray | null;

  match = referenceRegex.exec(content);
  while (match !== null) {
    references.push({
      label: match[1],
      position: match.index,
      originalText: match[0],
    });
    match = referenceRegex.exec(content);
  }

  return references;
}

/**
 * Parse footnote definitions from content (e.g., [fn:1] content here)
 */
export function parseFootnoteDefinitions(content: string): FootnoteDefinition[] {
  const definitions: FootnoteDefinition[] = [];
  const lines = content.split("\n");

  lines.forEach((line) => {
    const trimmed = line.trim();
    const match = trimmed.match(/^\[fn:([^\]]+)\]\s+(.+)$/);
    if (match) {
      const [, label, content] = match;
      definitions.push({
        label,
        content,
        originalText: trimmed,
      });
    }
  });

  return definitions;
}

/**
 * Replace footnote references in content with clickable anchor links
 * Skips footnote definitions (lines starting with [fn:label] )
 * Uses position-based IDs for consistency
 */
export function replaceFootnoteReferencesWithLinks(content: string): {
  content: string;
  referenceMap: Map<string, string[]>; // label -> array of reference IDs
} {
  const referenceMap = new Map<string, string[]>();

  // First pass: find all footnote references with their positions
  const references: Array<{ label: string; position: number }> = [];
  const referenceRegex = /\[fn:([^\]]+)\]/g;
  let match: RegExpExecArray | null;

  match = referenceRegex.exec(content);
  while (match !== null) {
    // Check if this is inside a footnote definition line
    const lineStart = content.lastIndexOf("\n", match.index) + 1;
    const lineEnd = content.indexOf("\n", match.index);
    const lineContent = content.slice(lineStart, lineEnd === -1 ? content.length : lineEnd);

    // Skip if this is a footnote definition
    if (!lineContent.trim().match(/^\[fn:[^\]]+\]\s+.+$/)) {
      references.push({
        label: match[1],
        position: match.index,
      });
    }

    match = referenceRegex.exec(content);
  }

  // Sort by position to process from end to start (to avoid position shifting)
  references.sort((a, b) => b.position - a.position);

  let processedContent = content;

  // Replace references from end to start
  references.forEach((ref, index) => {
    const refId = `fn-ref-${ref.label}-${references.length - index}`;

    // Track references for each label
    if (!referenceMap.has(ref.label)) {
      referenceMap.set(ref.label, []);
    }
    const labelRefs = referenceMap.get(ref.label);
    if (labelRefs) {
      labelRefs.unshift(refId); // unshift because we're processing backwards
    }

    const replacement = `<a href="#fn-def-${ref.label}" class="footnote-ref text-blue-600 bg-blue-50 px-1 rounded text-sm hover:bg-blue-100 cursor-pointer no-underline" id="${refId}">[${ref.label}]</a>`;

    // Find and replace the specific occurrence
    const before = processedContent.slice(0, ref.position);
    const after = processedContent.slice(ref.position);
    const originalMatch = after.match(/^\[fn:([^\]]+)\]/);

    if (originalMatch && originalMatch[1] === ref.label) {
      processedContent = before + replacement + after.slice(originalMatch[0].length);
    }
  });

  return {
    content: processedContent,
    referenceMap,
  };
}

/**
 * Simple version for backward compatibility
 */
export function replaceFootnoteReferencesWithLinksSimple(content: string): string {
  return replaceFootnoteReferencesWithLinks(content).content;
}

/**
 * Generate unique ID for footnote reference
 */
export function getFootnoteRefId(label: string): string {
  return `fn-ref-${label}`;
}

/**
 * Generate unique ID for footnote definition
 */
export function getFootnoteDefId(label: string): string {
  return `fn-def-${label}`;
}
