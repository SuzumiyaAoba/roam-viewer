# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a full-stack web application for viewing and managing Roam-style notes (org-roam files). The architecture consists of:

**Client-Server Architecture:**
- **Frontend**: React + TypeScript with Vite, using React Router for routing
- **Backend**: Bun server with Hono framework acting as a proxy/API layer
- **External API**: The backend communicates with an external md-roam API service (default: http://localhost:8080)

**Key Components:**
- `server.ts`: Hono-based API server that proxies requests to md-roam API and enriches responses
- `client/src/`: React frontend with pages for node listing, detail views, editing, and tag management
- `src/lib/api-client.ts`: TypeScript client for communicating with the md-roam API
- Design system components in `client/src/components/design-system/`

**Data Flow:**
1. React frontend → Hono server (port 3001) → md-roam API (port 8080)
2. The Hono server enriches node data with refs, backlinks, and forward links
3. Supports CRUD operations on nodes and searching/filtering by tags

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
The application requires the external md-roam API server to be running on port 8080. This is a separate service that provides access to org-roam files.

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
- Network timeouts: The client has a 10-second timeout with retry logic

## Key Architectural Patterns

**API Response Handling:** The api-client.ts handles multiple response formats from the md-roam API, providing fallbacks and normalization for different API versions.

**Node Enrichment:** The Hono server enriches node responses by fetching additional data (refs, backlinks) and parsing frontmatter as fallback when API endpoints return empty results.

**Component Structure:** Uses both a custom design system (`design-system/`) and shadcn/ui components (`ui/`) with Tailwind CSS styling.

**Routing:** React Router with page-based organization - nodes, tags, and CRUD operations are handled as separate pages.