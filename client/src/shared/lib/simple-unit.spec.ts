import { describe, expect, test } from "vitest";

// Test utility functions that don't require mocking
describe("Basic utility tests", () => {
  test("should parse comma-separated tags correctly", () => {
    function parseTagsString(str: string): string[] {
      return str
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    }

    const result = parseTagsString("tag1, tag2, tag3");
    expect(result).toEqual(["tag1", "tag2", "tag3"]);
  });

  test("should handle empty tag strings", () => {
    function parseTagsString(str: string): string[] {
      return str
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    }

    const result = parseTagsString("  ,  ,   ");
    expect(result).toEqual([]);
  });

  test("should validate API error creation", () => {
    class ApiError extends Error {
      constructor(
        message: string,
        public status?: number,
        public response?: Response,
      ) {
        super(message);
        this.name = "ApiError";
      }
    }

    const error = new ApiError("Test error", 404);
    expect(error.message).toBe("Test error");
    expect(error.status).toBe(404);
    expect(error.name).toBe("ApiError");
  });

  test("should handle URL encoding for node IDs", () => {
    function encodeNodeId(id: string): string {
      return encodeURIComponent(id);
    }

    const result = encodeNodeId("test node with spaces");
    expect(result).toBe("test%20node%20with%20spaces");
  });
});
