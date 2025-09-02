# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a full-stack web application for viewing and managing Roam-style notes (org-roam files). The architecture consists of:

**Client-Server Architecture:**
- **Frontend**: React + TypeScript with Vite, using React Router for routing
- **Backend**: Bun server with Hono framework acting as a proxy/API layer
- **External API**: The backend communicates with an external md-roam API service (default: http://localhost:8080)

**Key Components:**
- `server.ts`: Hono-based API server with embedded MdRoamApiClient that proxies requests to md-roam API v2.0.0 and enriches responses
- `client/src/`: React frontend with pages for node listing, detail views, editing, and tag management
- `client/src/lib/api-client.ts`: Frontend TypeScript client for communicating with the Hono server
- Design system components in `client/src/components/design-system/` with Storybook documentation
- Dual UI component system: custom design-system + shadcn/ui components

**Data Flow:**
1. React frontend → Hono server (port 3001) → md-roam API v2.0.0 (port 8080)
2. The Hono server normalizes API responses from new unified format and enriches node data 
3. Supports CRUD operations on nodes with Markdown (.md) and Org Mode (.org) file formats
4. URL-based state management for tag filtering (?tag=...) and search (?search=...)
5. Efficient tag-based node filtering using node_ids from enhanced tags API

## Development Commands

**Primary development:**
- `bun run dev` - Starts both client and server with automatic port detection

**Individual services:**
- `bun run dev:server` - Start only the Hono backend server (port 3001)
- `bun run dev:client` - Start only the React frontend (port 3000)

**Build commands:**
- `bun run build` - Build both client and server for production
- `bun run build:client` - Build React frontend only
- `bun run build:server` - Build Bun server only
- `bun run build:css` - Build Tailwind CSS for static version

**Other tools:**
- `bun run storybook` - Run Storybook design system documentation
- `bun run start` - Run production server

## Development Setup

**Prerequisites:**
The application requires the external md-roam API v2.0.0 server to be running on port 8080. This is a separate service that provides access to org-roam files and supports both Markdown (.md) and Org Mode (.org) formats.

**Environment variables:**
- `VITE_API_URL`: Frontend API endpoint (defaults to http://localhost:3001)
- `MD_ROAM_API_URL`: Backend's external API endpoint (defaults to http://localhost:8080)
- `BACKEND_PORT`: Preferred backend port (defaults to 3001)
- `VITE_PORT`: Preferred frontend port (defaults to 3000)

**Port allocation:**
The development script automatically finds available ports for the frontend (3000-3010) and backend (3001-3011).

## Troubleshooting

**"Unable to connect to md-roam API server" errors:**
1. Ensure the md-roam API server is running on port 8080
2. Check if the server is accessible: `curl http://localhost:8080/nodes`
3. Verify the server logs for connection issues
4. The Hono server includes automatic retry logic (2 retries with 1-second delays)

**Common issues:**
- Socket connection closed unexpectedly: Usually indicates the md-roam API server stopped or restarted
- Network timeouts: Extended timeouts for POST/PUT operations (server: 60s, client: 90s) due to slow processing with Japanese characters
- Node creation with Japanese text: May take 30+ seconds but will eventually succeed
- Timeout configuration: Frontend API client includes AbortController-based timeout handling with detailed logging

## Key Architectural Patterns

**API Version Handling:** Server-side MdRoamApiClient adapts between md-roam API v2.0.0's unified response format `{status, message, timestamp, ...}` and the frontend's expected data structures, with backward compatibility fallbacks.

**Tag-based Filtering:** Leverages new node_ids arrays in tags API for efficient filtering. URL state management with ?tag= and ?search= parameters enables shareable filtered views.

**File Format Support:** Node creation supports both Markdown (.md) and Org Mode (.org) formats via file_type parameter. The refs field is filtered out as unsupported by the md-roam API.

**Component Architecture:** Dual system with custom design-system components (with Storybook documentation) and shadcn/ui components, unified via Tailwind CSS and class-variance-authority.

**Error Recovery:** Smart retry logic that avoids retrying POST/PUT operations on timeout (as they may have succeeded) while retrying true network failures. Extended timeouts for operations involving Japanese text processing.

**Testing Infrastructure:** Extensive test suite with 16 test files covering all major code paths. Includes unit tests (Bun), component tests (Vitest + React Testing Library), integration tests, design system tests, routing tests, utility function tests, and server-side logic tests. Achieves comprehensive coverage of components, hooks, utilities, and user workflows. See `test/README.md` for detailed documentation.

## Testing

Run tests with:
```bash
# Basic unit tests (utility functions, API error handling)
bun test

# Specific unit tests
bun test:unit

# Full test suite with React components (when Vitest config resolved)
bun run test:vitest

# Coverage report
bun run test:coverage
```

Test structure includes (16 test files total):
- **Unit Tests**: API client, utility functions (cn, removeFrontmatter, parseTagsString), error handling
- **Component Tests**: Layout, NodeForm, NodeList, NodeDetail, TagList, TagDetail, App routing
- **Design System Tests**: Button variants/sizes, NodeCard functionality and variants
- **Hook Tests**: React Query hooks (useNodes, useCreateNode, etc.) with proper QueryClient setup
- **Integration Tests**: End-to-end user workflows, navigation, error recovery scenarios
- **Server Tests**: API v2.0.0 compatibility, request filtering, Japanese text processing, retry logic