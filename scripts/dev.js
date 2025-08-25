#!/usr/bin/env node

import { spawn } from 'child_process';
import { getPort } from 'get-port-please';

async function startDevServers() {
  // Get available ports
  const frontendPort = await getPort({ port: 3000, portRange: [3000, 3010] });
  const backendPort = await getPort({ port: 3001, portRange: [3001, 3011] });
  
  console.log(`🚀 Starting frontend on port ${frontendPort}`);
  console.log(`🔥 Starting backend on port ${backendPort}`);
  
  // Set environment variables
  process.env.VITE_PORT = frontendPort.toString();
  process.env.VITE_API_URL = `http://localhost:${backendPort}`;
  
  // Start both servers with concurrently
  const devProcess = spawn('bunx', [
    'concurrently',
    `"VITE_API_URL=http://localhost:${backendPort} bun run dev:client"`,
    `"bun run dev:server"`
  ], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      BACKEND_PORT: backendPort.toString()
    }
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    devProcess.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    devProcess.kill('SIGTERM');
    process.exit(0);
  });
}

startDevServers().catch(console.error);