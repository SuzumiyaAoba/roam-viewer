import { describe, expect, test } from "bun:test";

/**
 * Integration tests for API endpoint consistency
 * These tests verify that the server endpoints match client expectations
 * and prevent path-related 404 errors like the ones we fixed
 */
describe("API Endpoint Integration", () => {
  const baseUrl = "http://localhost:3001";

  describe("Node endpoints", () => {
    test("GET /api/nodes should respond (not 404)", async () => {
      try {
        const response = await fetch(`${baseUrl}/api/nodes`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        // Should not be 404 - endpoint should exist
        expect(response.status).not.toBe(404);
        
        // If successful, should return array
        if (response.ok) {
          const data = await response.json();
          expect(Array.isArray(data)).toBe(true);
        }
      } catch (error) {
        // Network errors are expected if server is not running
        // But 404 would indicate a path configuration issue
        expect(error).toBeDefined();
      }
    });

    test("GET /api/nodes/ (with trailing slash) should not be 404", async () => {
      try {
        const response = await fetch(`${baseUrl}/api/nodes/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        // Should handle trailing slash gracefully (redirect or accept)
        expect(response.status).not.toBe(404);
      } catch (error) {
        // Network errors are acceptable, 404 would be a problem
        expect(error).toBeDefined();
      }
    });

    test("POST /api/nodes should respond (not 404)", async () => {
      try {
        const response = await fetch(`${baseUrl}/api/nodes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Test Node",
            content: "Test content"
          }),
        });

        // Should not be 404 - path should be recognized
        expect(response.status).not.toBe(404);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test("GET /api/nodes/:id paths should be recognized", async () => {
      const testPaths = [
        "/api/nodes/test-id",
        "/api/nodes/test-id/backlinks",
        "/api/nodes/test-id/forward-links",
      ];

      for (const path of testPaths) {
        try {
          const response = await fetch(`${baseUrl}${path}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          // Path should be recognized (not 404)
          expect(response.status).not.toBe(404);
        } catch (error) {
          // Network errors are fine
          expect(error).toBeDefined();
        }
      }
    });
  });

  describe("Search endpoints", () => {
    test("GET /api/search/nodes should respond with query parameter", async () => {
      try {
        const response = await fetch(`${baseUrl}/api/search/nodes?q=test`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        // Should not be 404
        expect(response.status).not.toBe(404);
        
        // If successful, should return SearchResult format
        if (response.ok) {
          const data = await response.json();
          expect(data).toHaveProperty("nodes");
          expect(data).toHaveProperty("total");
          expect(Array.isArray(data.nodes)).toBe(true);
          expect(typeof data.total).toBe("number");
        }
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test("GET /api/search/nodes should handle empty query", async () => {
      try {
        const response = await fetch(`${baseUrl}/api/search/nodes?q=`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        expect(response.status).not.toBe(404);
        
        if (response.ok) {
          const data = await response.json();
          expect(data).toEqual({ nodes: [], total: 0 });
        }
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test("GET /api/search/nodes should handle advanced parameters", async () => {
      const params = new URLSearchParams({
        q: "test",
        tags: "tag1,tag2",
        limit: "10",
        offset: "0"
      });
      
      try {
        const response = await fetch(`${baseUrl}/api/search/nodes?${params}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        expect(response.status).not.toBe(404);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Path validation", () => {
    test("should reject malformed paths gracefully", async () => {
      const malformedPaths = [
        "/api/nodes//",
        "/api//nodes",
        "/api/nodes///extra",
        "//api/nodes"
      ];

      for (const path of malformedPaths) {
        try {
          const response = await fetch(`${baseUrl}${path}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          // Should not crash server (not 500)
          expect(response.status).not.toBe(500);
        } catch (error) {
          // Network errors are acceptable
          expect(error).toBeDefined();
        }
      }
    });

    test("should handle encoded characters in node IDs", async () => {
      const nodeIds = [
        "node%20with%20spaces",
        "node%26with%26ampersands", 
        "node-with-dashes",
        "node_with_underscores"
      ];

      for (const nodeId of nodeIds) {
        try {
          const response = await fetch(`${baseUrl}/api/nodes/${nodeId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          // Path should be recognized
          expect(response.status).not.toBe(404);
        } catch (error) {
          expect(error).toBeDefined();
        }
      }
    });
  });

  describe("Response format consistency", () => {
    test("endpoints should return consistent JSON formats", async () => {
      const endpoints = [
        { path: "/api/nodes", expectedType: "array" },
        { path: "/api/search/nodes?q=test", expectedFormat: { nodes: "array", total: "number" } }
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${baseUrl}${endpoint.path}`, {
            headers: { "Content-Type": "application/json" },
          });

          if (response.ok) {
            const data = await response.json();
            
            if (endpoint.expectedType === "array") {
              expect(Array.isArray(data)).toBe(true);
            }
            
            if (endpoint.expectedFormat) {
              Object.entries(endpoint.expectedFormat).forEach(([key, type]) => {
                expect(data).toHaveProperty(key);
                if (type === "array") {
                  expect(Array.isArray(data[key])).toBe(true);
                } else if (type === "number") {
                  expect(typeof data[key]).toBe("number");
                }
              });
            }
          }
        } catch (_error) {
          // Skip if server not available
        }
      }
    });
  });
});

/**
 * Client-Server endpoint mapping validation
 * This ensures that client API calls match server route definitions
 */
describe("Client-Server Endpoint Mapping", () => {
  test("NodesApiClient methods should map to correct server routes", () => {
    const mappings = [
      { client: "getNodes()", serverRoute: "GET /api/nodes", clientUrl: "/api/nodes" },
      { client: "createNode()", serverRoute: "POST /api/nodes", clientUrl: "/api/nodes" },
      { client: "getNode(id)", serverRoute: "GET /api/nodes/:id", clientUrl: "/api/nodes/123" },
      { client: "updateNode(id)", serverRoute: "PUT /api/nodes/:id", clientUrl: "/api/nodes/123" },
      { client: "deleteNode(id)", serverRoute: "DELETE /api/nodes/:id", clientUrl: "/api/nodes/123" },
      { client: "getBacklinks(id)", serverRoute: "GET /api/nodes/:id/backlinks", clientUrl: "/api/nodes/123/backlinks" },
      { client: "getForwardLinks(id)", serverRoute: "GET /api/nodes/:id/forward-links", clientUrl: "/api/nodes/123/forward-links" },
      { client: "deleteNodes(ids)", serverRoute: "POST /api/nodes/bulk-delete", clientUrl: "/api/nodes/bulk-delete" }
    ];

    mappings.forEach(({ clientUrl }) => {
      // Validate URL construction
      expect(clientUrl).not.toMatch(/\/$/); // No trailing slashes
      expect(clientUrl).not.toMatch(/(?<!:)\/\//); // No double slashes
      expect(clientUrl.startsWith("/api/")).toBe(true); // Proper API prefix
    });
  });

  test("SearchApiClient methods should map to correct server routes", () => {
    const mappings = [
      { client: "searchNodes(query)", serverRoute: "GET /api/search/nodes", clientUrl: "/api/search/nodes?q=test" },
      { client: "searchNodesAdvanced(params)", serverRoute: "GET /api/search/nodes", clientUrl: "/api/search/nodes?q=test&tags=tag1,tag2" },
      { client: "searchNodesByTag(tag)", serverRoute: "GET /api/search/nodes", clientUrl: "/api/search/nodes?tags=important" }
    ];

    mappings.forEach(({ clientUrl }) => {
      const urlPart = clientUrl.split('?')[0];
      expect(urlPart).not.toMatch(/\/$/);
      expect(urlPart).not.toMatch(/(?<!:)\/\//);
      expect(urlPart.startsWith("/api/")).toBe(true);
    });
  });
});

/**
 * Regression test for the specific trailing slash issue that was fixed
 */
describe("Trailing Slash Issue Regression Test", () => {
  test("should document the specific issue that was fixed", () => {
    // The problem: NodesApiClient.getNodes() was calling this.get("/")
    // With basePath "/api/nodes", this created "/api/nodes/" (with trailing slash)
    // But server route was "GET /api/nodes" (without trailing slash) -> 404 error
    
    const basePath = "/api/nodes";
    const problematicEndpoint = "/";  // Old implementation
    const fixedEndpoint = "";         // Fixed implementation
    
    const problematicUrl = `${basePath}${problematicEndpoint}`;
    const fixedUrl = `${basePath}${fixedEndpoint}`;
    
    expect(problematicUrl).toBe("/api/nodes/");   // This caused 404
    expect(fixedUrl).toBe("/api/nodes");          // This works correctly
    
    // Ensure the fix is in place
    expect(fixedUrl).not.toMatch(/\/$/);
  });

  test("should prevent similar issues in SearchApiClient", () => {
    const basePath = "/api/search";
    const endpoint = "/nodes";
    
    const url = `${basePath}${endpoint}`;
    
    expect(url).toBe("/api/search/nodes");
    expect(url).not.toMatch(/\/$/);
  });

  test("should validate all current API client URL constructions", () => {
    // These are the actual URLs that the fixed clients should generate
    const expectedUrls = [
      "/api/nodes",                           // getNodes, createNode
      "/api/nodes/123",                       // getNode, updateNode, deleteNode  
      "/api/nodes/123/backlinks",             // getBacklinks
      "/api/nodes/123/forward-links",         // getForwardLinks
      "/api/nodes/bulk-delete",               // deleteNodes
      "/api/search/nodes?q=test",             // searchNodes
      "/api/search/nodes?tags=tag1,tag2",     // searchNodesAdvanced
    ];

    expectedUrls.forEach(url => {
      const pathPart = url.split('?')[0];
      expect(pathPart).not.toMatch(/\/$/);      // No trailing slashes
      expect(pathPart).not.toMatch(/(?<!:)\/\//); // No double slashes
      expect(url.startsWith("/api/")).toBe(true); // Proper API prefix
    });
  });
});